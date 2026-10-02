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

## Mapping to the app

- **Stage values.** Database enums are lowercase (`treatment`). The UI's zod enums are capitalised (`Treatment`), so map them once in `src/api/`.
- **Swapping sample data for real data.** Replace the bodies of `getMatterDashboard`, `getMatterDetail` and the share functions in `src/api/`. The hooks and components stay the same.

## Commands

```bash
npx supabase link --project-ref <ref>   # once per machine
npx supabase db push                    # apply migrations to the linked project
npx supabase gen types typescript --linked --schema public > src/types/database.ts
```

`src/types/database.ts` is generated, so never edit it by hand. Regenerate it after every migration.
