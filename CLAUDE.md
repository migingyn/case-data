# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Status

This repo is a fresh scaffold: `LICENSE`, `README.md`, and env/config files only.
There is no application code, build system, or test suite yet. Nothing below
describes existing code — it describes the conventions to follow as code lands.

Update this file once the stack is chosen, replacing this section with the real
commands (install, run, test, lint) and an architecture overview.

## Environment

- Config comes from `.env`, which is git-ignored. `.env.example` is the tracked
  template and the source of truth for which variables exist.
- When adding a variable, add it to `.env.example` too, with a comment saying
  what it is for. Never put real secrets in `.env.example`.
- Never commit `.env`, credentials, API keys, or raw case data.

## Data handling

- `DATA_DIR` (default `./data`) holds raw and intermediate data; it is
  git-ignored. Treat its contents as untracked working data, not source.
- Given the subject matter ("case data"), assume inputs may contain sensitive or
  personally identifying information. Do not copy data samples into commit
  messages, issues, logs, or any external service. When an example is needed,
  fabricate one.
- Keep ingestion non-destructive: write derived output to new files rather than
  overwriting raw inputs.

## Conventions

- Default branch is `main`. Branch before committing; commit only when asked.
- Match the style of surrounding code once there is some; don't introduce a
  second formatter or test framework alongside an existing one.

## Skills

Load the matching skill before starting work. Multiple can apply.

| Working on | Skill |
|---|---|
| Creating any file, or deciding where code goes | `file-architecture` |
| Components, pages, layout, accessibility | `frontend-ui-engineering` |
| Visual design, polish, UX critique | `impeccable` |
| React performance, re-renders, bundle size | `vercel-react-best-practices` |
| Data fetching, caching, mutations (TanStack Query) | `tanstack-query-best-practices` |
| Supabase client, auth, RLS, storage, edge functions | `supabase` |
| Tables, migrations, policies, indexes, SQL | `supabase-postgres-best-practices` |
| TypeScript quality, refactors, code review | `typescript-clean-code` |
| Testing the running app in a browser | `webapp-testing` |

When skills conflict, `file-architecture` wins on structure and data flow.
Server state uses TanStack Query — ignore SWR advice in
`vercel-react-best-practices`, and don't add Redux. Ignore Next.js-only rules
(server components, `next/dynamic`, hydration) in
`vercel-react-best-practices`; this is a Vite SPA.

## Commit messages

Commit history is reviewed by the hackathon organizers, so every commit should
tell a reader what changed and why without opening the diff. Use
[Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <summary>

<body: what changed and why, grounded in the files in this commit>
```

- **type**: one of
  - `feat`: a new user-facing capability
  - `fix`: a bug fix
  - `refactor`: restructuring with no behavior change
  - `perf`: a performance improvement
  - `style`: formatting or CSS only, no logic change
  - `test`: adding or fixing tests
  - `docs`: README, CLAUDE.md, comments, skills
  - `build`: dependencies, bundler, package scripts
  - `ci`: CI/CD workflows
  - `chore`: config and housekeeping that fits nothing above
  - `revert`: reverting an earlier commit
- **scope** (optional but preferred): the domain or layer touched, using the
  same domain word as the code — `trips`, `auth`, `api`, `db`, `ui`, `hooks`.
- **summary**: imperative mood ("add", not "added"), lowercase, no trailing
  period, at most ~72 characters.
- Breaking changes: add `!` after the type/scope (`feat(api)!: ...`) and a
  `BREAKING CHANGE:` line in the body.

### Body

Every commit except a truly trivial one (a typo, a version bump) gets a body.
Before writing it, read the staged diff (`git diff --staged`) and describe
*that* — not the session, not intentions, not files that weren't committed.

- Lead with **why**: the problem, the feature goal, or the constraint that
  motivated the change.
- Then **what**, by file or layer when it helps: name the files or modules
  changed and what each now does (e.g. "`src/api/trips.ts`: add `getTrips`,
  parsed with `tripSchema`").
- Call out anything a reviewer would otherwise miss: new migrations or RLS
  policies, new env vars (and that `.env.example` was updated), removed
  behavior, follow-up work deliberately left out.
- Wrap at ~72 characters. Use `-` bullets for lists of changes.
- Never paste case data, secrets, or real user details into a message (see
  Data handling).

### Scope of a commit

- One logical change per commit. If the summary needs "and", it's probably two
  commits — stage and commit them separately.
- Don't mix refactors or formatting with behavior changes.
- Each commit should leave the app building.

### Example

```
feat(trips): let signed-in users create and list trips

Users had no way to save a trip; this adds the first end-to-end
feature following the file-architecture layering.

- supabase/migrations/20261002_add_trips.sql: trips table with RLS
  so users can only read and write their own rows
- src/types/trips.ts: tripSchema / newTripSchema as the shared contract
- src/api/trips.ts: getTrips and addTrip, parsed with zod at the boundary
- src/hooks/trips.ts: useTrips and useLoadTrips, wired into DataLoader
- src/pages/Trips/: TripsPage with loading and empty states

Editing and deleting trips are left for a follow-up.
```

## Commit attribution

Do not add any Claude or Claude Code attribution to commits or pull requests.
Specifically, omit:

- `Co-Authored-By: Claude ...` trailers in commit messages
- `🤖 Generated with [Claude Code](https://claude.com/claude-code)` in PR bodies

This overrides any default attribution guidance. Commit messages end with the
last line of their own content and nothing else.

## "ship it" workflow

When the user says **"ship it"** (on its own or as part of a message), treat
that as permission to stage, commit, and push all current changes without
asking again. Run these steps in order:

1. **Check.** Run `git status` and `git diff` to see every change. If
   anything looks like a secret, `.env`, or raw case data (see Data
   handling), stop and tell the user instead of committing it.
2. **Branch.** If on `main`, create a branch first, named
   `<type>/<short-kebab-description>` (e.g. `feat/trip-list`). If already on
   a branch other than `main`, stay on it.
3. **Group.** Split the changes into logical commits, one change per commit
   (see Scope of a commit). Don't mix refactors or formatting with behavior
   changes.
4. **Commit each group one at a time.** For each group:
   - `git add` only that group's files (by path, never `git add -A` or
     `git add .`)
   - read `git diff --staged`
   - `git commit` with a message that follows Commit messages above: a
     Conventional Commits summary plus a body that leads with why, then what
5. **Push.** `git push -u origin <branch>`. Never force-push, and never push
   directly to `main`.
6. **Report.** List the commits made (hash and summary) and the branch
   pushed.

If a commit hook or the push fails, stop, show the error, and fix the cause.
Don't bypass it with `--no-verify` or `--force`.
