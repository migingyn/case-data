# Database schema

The schema lives in `supabase/migrations/`. This page explains what each
table is for, which screen reads it, and who writes it, so real data can be
loaded without guessing.

## Who writes what

| Writer | Role | Writes |
|---|---|---|
| Express backend: Clio sync | `service_role` (bypasses RLS) | Firms, people, clients, matters, documents, citations, entries, tasks, contacts, costs, policies, valuations, injuries, milestones, providers, visits, requests |
| Express backend: LLM jobs | `service_role` | `matter_summaries`, `summary_sentences`, `summary_ranked_entries` |
| Firm members in the app | `authenticated` | `shares`, `share_drafts`, publishing through `publish_share()`, revoke events, `matter_views`, their own `default_depth` / `last_visit_at` |
| Provider users in the app | `authenticated` | `opened` share events, `share_section_views`, `provider_notify_prefs` |

The service-role key stays in the backend. The browser only ever has the
publishable key, and RLS decides what each user sees.

## Tables by screen

**My matters (dashboard)**
- `matters`, `clients`: the row, the stage and the client name
- `matter_entries`: "What changed" is the entries newer than the member's `last_visit_at`, or newer than `matter_views.last_opened_at` for that matter
- `tasks`: next deadline, overdue, waiting on others
- `client_contacts`: last client contact and the 14-day gap
- `valuations` (latest) and `policies`: value and coverage

**Matter view**
- `matters.opened_on`, `lead_attorney_id`, `source_url`, `clients.photo_path`: the header
- `valuations`, `policies`, `costs` (sum), `client_contacts` (latest): the KPI strip
- `matter_summaries` (latest), `summary_sentences`, `summary_ranked_entries`: the catch-up brief and "the ten entries that matter"
- `injuries`, `matter_providers` + `visits` + `provider_requests` + `shares`: the side column
- `citations` → `documents`: every source chip and the source drawer

**Share composer**
- `shares`, `share_drafts`, `share_versions`, `share_version_recipients`, `share_events`
- `provider_users`: the recipients list

**Provider portal**
- `shares` (`current_version`, `expires_at`, `revoked_at`): live, revoked or expired
- `share_versions.view`: the frozen `ProviderView` for each version. Providers never read live firm tables.
- `share_events`, `share_section_views`, `provider_notify_prefs`

## Rules the schema enforces

- **Tenancy.** Every firm-owned table has `firm_id`. Children reference `matters (id, firm_id)`, so a row can't point at another firm's matter.
- **Every fact is sourced.** Entries, tasks, contacts, valuations, policies, costs and injuries require a `citation_id`. Brief sentences do too, except the provider-safe summary (`block = 'provider'`).
- **Drafts are firm-only.** Providers can read their `shares` row, so unpublished settings live in `share_drafts`.
- **Providers see only published snapshots.** They can read `share_versions` for a share that's published, not revoked and not expired (`private.provider_can_view_share`).
- **Money** is `numeric(14, 2)` in dollars. **Times** are `timestamptz`.
- **Document page images** go in Storage under `documents.storage_path`. Serve pages to providers from the backend after checking that the share version permits that page, and apply `document_redactions` there.

## Clio sync

`server/sync/` copies the connected Clio account into these tables (`POST /api/sync`). Mapping rules live in `server/sync/mapClio.ts`.

| Clio | Rows written |
|---|---|
| Account (`who_am_i`) | `firms`, keyed on `clio_account_id` |
| Open and pending matters | `clients` (the matter's client) and `matters`. `lead_attorney_name` holds Clio's responsible attorney until Clio users map to `firm_members` |
| Notes | `documents` (`note`), `matter_entries` (`note`) |
| Emails and calls | `documents` (`email` / `call_log`), `matter_entries` (`email`, `client_message` when the client sent it, calls as `note`), `client_contacts` when the client took part |
| Tasks with a due date | `documents` (`task`), `tasks` |
| Documents | `documents` (kind guessed from the name), `matter_entries` (`document`). File contents aren't downloaded yet |
| Calendar entries that look like court dates | `documents` (`filing`), `matter_entries` (`court_date`) |
| Expense entries | `documents` (`ledger`), `costs` |

- **Every record gets one document and one citation**, so every row it produces can point at its source. `documents.clio_document_id` and `matter_entries.clio_id` hold a synthetic key, `<type>:<clio id>` (`note:`, `comm:`, `task:`, `doc:`, `cal:`, `exp:`).
- **Re-running is safe.** Rows are upserted on their Clio keys. `client_contacts` and `costs` have no Clio key, so each sync replaces them for the synced matters.
- **Not synced from Clio:** valuations, policies, injuries, providers, visits, requests and milestones. Clio has no native field for them; those panels show empty states.
- **Not handled yet:** records deleted in Clio stay in Supabase.

## Mapping to the app

- **Stage values.** Database enums are lowercase (`treatment`). The UI's zod enums are capitalised (`Treatment`). The server maps them in `server/matters/shared.ts`.
- **Reads go through the API server for now.** There is no sign-in, so `server/matters/` reads with the service role and serves `/api/matters`, `/api/matters/:id` and `/api/firm`. Once members sign in, `src/api/` can read through RLS directly, and the hooks and components stay the same.
- **Share composer and provider portal** still use sample data in `src/api/shares.ts`.

## Commands

```bash
npx supabase link --project-ref <ref>   # once per machine
npx supabase db push                    # apply migrations to the linked project
npx supabase gen types typescript --linked --schema public > src/types/database.ts
```

`src/types/database.ts` is generated, so never edit it by hand. Regenerate it after every migration.
