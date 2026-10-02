# case-data
## Agent skills

This repo installs a set of [agent skills](https://skills.sh) — Markdown instruction
files that coding agents (Claude Code, Cursor, etc.) load on demand when a task
matches their description. They live in `.claude/skills/<name>/SKILL.md` and are
tracked in `skills-lock.json`.

### Restore them on a fresh clone

```bash
npx skills experimental_install
```

That reads `skills-lock.json` and reinstalls every skill at the pinned hash, so
each person on the team gets the identical set.

### What is installed, and why

| Skill | Source | Why it is here |
|---|---|---|
| `frontend-ui-engineering` | `addyosmani/agent-skills` | Component architecture, responsive layout, WCAG accessibility |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | React/Next performance: data-fetch waterfalls, bundle size, re-renders |
| `impeccable` | `pbakaus/impeccable` | Visual design quality; avoids the generic AI-dashboard look |
| `supabase` | `supabase/agent-skills` | Supabase client, auth, Edge Functions, RLS |
| `supabase-postgres-best-practices` | `supabase/agent-skills` | Schema design, migrations, indexes, RLS policy correctness |
| `typescript-clean-code` | `bmad-labs/skills` | Code-smell catalog; keeps components small and `any` out |
| `tanstack-query-best-practices` | `deckardger/tanstack-agent-skills` | Server-state caching and mutation patterns |
| `webapp-testing` | `anthropics/skills` | Drives the running app with Playwright to catch broken flows |

### Adding one

```bash
npx skills add <owner/repo> --skill <skill-name> -a claude-code
```

Use `--list` instead of `--skill` to see what a repository offers; skill names in
third-party directories are often out of date.

### Before installing

Skills are instructions that steer an agent, published from arbitrary GitHub
accounts. Read the `SKILL.md` before relying on one. Given the data this project
handles, be especially wary of skills that fetch remote resources or drive cloud
browsers.
