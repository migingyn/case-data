---
name: file-architecture
description: File architecture and layering conventions for a React + TypeScript + Supabase app (Vite SPA, react-router, TanStack Query, zod). Use when adding or changing any feature — a Supabase query, a table or migration, a route/page, a component, a query or mutation hook, a shared type, or styles. Also use when deciding where a new file belongs, what a layer may import, or how the UI is allowed to reach the database.
---

# React + Supabase Architecture

Adapted from the AntAlmanac Planner monorepo's layering, with Supabase replacing the Express/tRPC/Drizzle backend and TanStack Query replacing the Redux store. The layering is the point: **the UI never talks to the database directly.**

```
src/
  api/          one module per domain — the ONLY place supabase is called
  hooks/        the seam: useQuery / useMutation hooks over src/api
  components/   reusable UI, one folder per component
  pages/        one folder per route, thin route component + its UI
  helpers/      pure functions, no React, no network
  types/        zod schemas + inferred types (the shared contract)
  lib/          supabase client, query client, third-party setup
supabase/
  migrations/   generated SQL — the schema source of truth
```

## The one data flow

Every feature follows this path. Do not invent a second one.

```
component (.tsx)
  → hook in src/hooks/<domain>.ts          ← owns query keys, caching, invalidation
    → src/api/<domain>.ts                  ← owns the Supabase query, returns clean data
      → src/lib/supabase.ts (typed client)
        → Postgres, gated by RLS policies
```

Server state (anything that lives in Postgres) lives in the TanStack Query cache and nowhere else. Don't copy query results into `useState` or context — read them from the hook.

Hard rules:
- `supabase.from(...)`, `.rpc(...)`, `.storage`, `.auth` appear **only** in `src/api/`. A component or hook that imports the supabase client directly is a bug.
- `useQuery` / `useMutation` appear **only** in `src/hooks/`. Components call `useTrips()`, never `useQuery({ queryKey: ['trips'] ... })` inline — otherwise keys drift and invalidation misses.
- `src/api/` functions take and return domain types from `src/types/` — never raw Postgres rows, never `PostgrestResponse`. Unwrap `{ data, error }` and throw on error at this boundary; TanStack Query turns the throw into `error` state.
- `src/helpers/` is pure: no React imports, no network. If it needs state, it's a hook; if it needs the DB, it's `src/api/`.

## Where files go

| What you're adding | Path | Notes |
|---|---|---|
| Supabase query / mutation | `src/api/<domain>.ts` | one module per table-ish domain |
| Table, column, policy | `supabase/migrations/<ts>_<name>.sql` | then regenerate DB types |
| Generated DB types | `src/types/database.ts` | generated — never hand-edit |
| Shared type / zod schema | `src/types/<domain>.ts` | re-export from `src/types/index.ts` |
| Query keys + query/mutation hooks | `src/hooks/<domain>.ts` | `<domain>Keys`, `use<Things>`, `useAdd<Thing>` |
| Route | `src/pages/<Route>/<Route>Page.tsx` | register in the router |
| Route-scoped component | `src/pages/<Route>/<Name>.tsx` | plus `<Name>.css` beside it |
| Reusable component | `src/components/<Name>/<Name>.tsx` | own folder, styles beside it |
| Pure logic | `src/helpers/<domain>.ts` | `.tsx` only if it returns JSX |
| Supabase client | `src/lib/supabase.ts` | single instance, imported by `src/api/` only |
| Query client | `src/lib/queryClient.ts` | single instance, provided in `main.tsx` |
| Test | beside the source, `<name>.test.ts` | |

**Name the domain once and reuse the word at every layer.** For a feature `trips`: `src/api/trips.ts`, `src/types/trips.ts`, `src/hooks/trips.ts`, `src/helpers/trips.ts`. Finding code becomes mechanical.

## The clients

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);
```

```ts
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});
```

```tsx
// src/main.tsx
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <App />
  </AuthProvider>
</QueryClientProvider>
```

Only the **anon key** ever reaches the client. Anything in `import.meta.env.VITE_*` is public and shipped in the bundle. A `service_role` key in frontend code bypasses every RLS policy you wrote — if you need it, it belongs in a Supabase Edge Function.

Regenerate `Database` after every migration:

```bash
npx supabase gen types typescript --linked > src/types/database.ts
```

## API modules

One file per domain, one exported async function per operation, named for the operation (`getTrips`, `addTrip`, `removeTrip`). These are plain async functions — no React, no TanStack:

```ts
// src/api/trips.ts
import { supabase } from '../lib/supabase';
import { tripSchema, type Trip, type NewTrip } from '../types/trips';

export async function getTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('id, name, start_date, user_id')
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data.map((row) => tripSchema.parse(row));
}

export async function addTrip(trip: NewTrip): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .insert(trip)
    .select('id, name, start_date, user_id')
    .single();

  if (error) throw error;
  return tripSchema.parse(data);
}
```

Conventions:
- Always `select()` explicit columns, never bare `select('*')` — it keeps the payload and the type honest.
- `.single()` when exactly one row is expected; it turns "no rows" into an error instead of a silent `[]`.
- Parse at the boundary with zod so a schema drift fails loudly here rather than as `undefined` deep in a component.
- Don't pass user ids from the client when RLS can infer them. Reads are already scoped by the select policy; inserts get `user_id` from a `default auth.uid()` column (see the migration below).

## Types are the contract

Zod schema first, type inferred from it — one source of truth for both validation and TypeScript:

```ts
// src/types/trips.ts
import { z } from 'zod';

export const tripSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80),
  start_date: z.string(),
  user_id: z.string().uuid(),
});
export type Trip = z.infer<typeof tripSchema>;

export const newTripSchema = tripSchema.omit({ id: true, user_id: true });
export type NewTrip = z.infer<typeof newTripSchema>;
```

The same schema validates form input and API responses. Never declare a shape twice.

## Hooks: the seam

Each domain's hook file owns its **query key factory**, its **query hooks**, and its **mutation hooks**:

```ts
// src/hooks/trips.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTrip, getTrips } from '../api/trips';
import type { NewTrip } from '../types/trips';
import { useSession } from './auth';

export const tripKeys = {
  all: (userId: string) => ['trips', userId] as const,
  detail: (userId: string, id: string) => ['trips', userId, id] as const,
};

export function useTrips() {
  const { user } = useSession();
  return useQuery({
    queryKey: tripKeys.all(user?.id ?? ''),
    queryFn: getTrips,
    enabled: !!user,
  });
}

export function useAddTrip() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (draft: NewTrip) => addTrip(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tripKeys.all(user!.id) }),
  });
}
```

General TanStack patterns (key design, staleTime, invalidation, optimistic updates, error handling) come from the `tanstack-query-best-practices` skill. What this architecture adds on top, because of Supabase:

- **Put the user id in every key.** RLS scopes results per user, so the same request returns different rows for different users. Without the id in the key, one user's cached rows can be served to the next.
- **Gate on auth with `enabled: !!user`.** On a hard refresh the session resolves *after* first render; an ungated query fires anonymously, RLS returns `[]`, and that empty result gets cached.
- **Reconcile with the server row.** Supabase fills defaults, generated ids and `user_id`, so optimistic data is never final — invalidate or `setQueryData` with what `addTrip` returned.

## Client state

TanStack Query is for server state only. Purely client-side state (an open modal, a form draft, a selected tab) stays in `useState` in the component that owns it, lifted to the nearest common parent when shared. Use React context only for truly app-wide client state (auth session, theme). Don't add Redux or Zustand unless a real need shows up.

## Database and RLS

Schema lives in `supabase/migrations/`, generated and committed — not clicked into the dashboard, or it won't exist for your teammates or on a fresh project:

```bash
npx supabase migration new add_trips      # create the SQL file
npx supabase db push                      # apply to the linked project
npx supabase db reset                     # rebuild local from migrations
```

**Enable RLS on every table and write policies as you create it.** Supabase tables are reachable from any browser with your anon key; RLS *is* your authorization layer, in place of the `userProcedure`/`adminProcedure` guards a custom backend would have.

```sql
create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  start_date date not null,
  created_at timestamptz not null default now()
);

alter table trips enable row level security;

create policy "own trips: read"   on trips for select using (auth.uid() = user_id);
create policy "own trips: write"  on trips for insert with check (auth.uid() = user_id);
create policy "own trips: edit"   on trips for update using (auth.uid() = user_id);
create policy "own trips: delete" on trips for delete using (auth.uid() = user_id);

create index trips_user_id_idx on trips (user_id);
```

Conventions: snake_case tables and columns (that's what the generated types expect), `uuid` PKs with `gen_random_uuid()`, owner columns defaulting to `auth.uid()`, FKs with `on delete cascade`, `created_at timestamptz default now()`, an index on every FK you filter by.

## Pages and components

Routes are thin. `<Route>Page.tsx` calls the hooks, handles loading/empty/error states from the query result (`isPending`, `error`, `data.length === 0`), and composes presentational children that take props:

```
src/pages/Trips/TripsPage.tsx     hooks + layout + loading/empty/error states
src/pages/Trips/TripCard.tsx      presentational, props only
src/pages/Trips/TripCard.css
```

Components: `interface NameProps` above, `const Name: FC<NameProps> = ({ ... }) => {}`, default export, co-located stylesheet imported at the top. A component that both fetches and renders a complex tree is the thing this architecture exists to prevent — push the query hooks up into the page.

## Auth

The session is app-wide client state: hold it in context, fed by wrappers in `src/api/auth.ts` (keeping `supabase.auth` inside `src/api/`).

```ts
// src/api/auth.ts
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthChange(cb: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
```

```tsx
// src/components/AuthProvider/AuthProvider.tsx
const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    getSession().then(setSession);
    return onAuthChange((next) => {
      setSession((prev) => {
        if (prev?.user.id !== next?.user.id) queryClient.clear(); // drop the previous user's cache
        return next;
      });
    });
  }, [queryClient]);

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
};
```

`src/hooks/auth.ts` exports `useSession()` returning `{ session, user, isLoading }` from that context (`undefined` = still resolving, `null` = signed out). Clear the query cache whenever the user changes, or the next person on the same browser briefly sees the last person's data.

## Gotchas

- An ungated query (no `enabled: !!user`) fires before the session loads and caches RLS's empty result.
- Forgetting `enable row level security` leaves the table world-readable with your public anon key.
- Enabling RLS with **no** policies returns empty arrays and no error — the most common "my query works in the SQL editor but not in the app" cause.
- `src/types/database.ts` is generated: regenerate after every migration instead of patching it, or your types quietly describe an old schema.
- `import.meta.env.VITE_*` is public. Secrets go in Edge Functions.
- `.single()` throws when zero rows match; use `.maybeSingle()` when absence is valid.
- Supabase returns snake_case column names. Either keep snake_case through the type layer (simplest) or map it once inside `src/api/` — never half and half.

## Hackathon shortcuts worth taking

- Realtime (`supabase.channel(...).on('postgres_changes', ...)`) gets a wrapper in `src/api/<domain>.ts` and a `useSubscribe<Thing>()` hook in `src/hooks/<domain>.ts` that calls `queryClient.invalidateQueries` (or `setQueryData`) for the affected key.
- Supabase Storage uploads go in `src/api/<domain>.ts` too — store the returned path in your table, not the full signed URL.
