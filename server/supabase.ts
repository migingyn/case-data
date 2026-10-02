import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';
import { env } from './env.ts';
import { HttpError } from './errors.ts';

export type ServiceClient = SupabaseClient<Database>;

// The service role bypasses RLS: the server syncs Clio and, until the app
// has sign-in, serves reads. Never import this outside server/.
const client: ServiceClient | null =
  env.VITE_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient<Database>(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export function requireSupabase(): ServiceClient {
  if (!client) {
    throw new HttpError(503, 'Supabase is not configured. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return client;
}

type Result = { data: unknown; error: { message: string } | null };

/** Rows from a supabase-js result, turning a PostgREST error into a thrown Error. */
export function unwrap<R extends Result>(result: R, what: string): NonNullable<R['data']> {
  if (result.error) throw new Error(`Supabase ${what} failed: ${result.error.message}`);
  if (result.data === null) throw new Error(`Supabase ${what} returned no data.`);
  return result.data as NonNullable<R['data']>;
}

/** Like `unwrap`, for `maybeSingle()`: null when there is no row. */
export function unwrapMaybe<R extends Result>(result: R, what: string): R['data'] {
  if (result.error) throw new Error(`Supabase ${what} failed: ${result.error.message}`);
  return result.data;
}

/** For writes with no `.select()`: they return no rows, so only the error matters. */
export function check(result: { error: { message: string } | null }, what: string): void {
  if (result.error) throw new Error(`Supabase ${what} failed: ${result.error.message}`);
}
