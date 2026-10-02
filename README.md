# Case Digest (working title)
 
A visual case dashboard for personal-injury law firms that turns a live Clio Manage matter into something a human can absorb in about 90 seconds, for both the firm's internal team and the medical providers treating the client on a lien.
 
Built for the **Swans Applied AI Hackathon** at Law-Di-Gras, San Diego, October 2, 2026.
 
---
 
## 1. The Problem
 
Case management systems (Clio Manage, CasePeer, Lawmatics) already **capture** everything: notes, emails, tasks, dates, contacts, documents. The problem is **digesting** it.
 
- Getting up to speed on a case still means walking tab by tab through notes, documents, tasks and emails, or asking a colleague who was there.
- Medical providers treating the client on a lien have **zero visibility** into the case: whether it is still alive, whether there is coverage, or what the firm needs from them.
- Both sides fall back to the same tool: email, with no intelligence in it.
## 2. Goals
 
The solution is a **dashboard, not a chatbot**. The point is a visual digestion of everything already in the case, so users get up to speed without needing to know what to ask.
 
| # | Goal | Audience |
|---|------|----------|
| 1 | Get internal team members up to speed on a case | Attorneys, case managers, staff |
| 2 | Improve communication and visibility for treating providers | Medical providers on a lien |
 
Both halves are required.
 
## 3. Background: PI Law in Brief
 
1. **Someone gets hurt** (classic case: car crash). They hire an attorney who is paid only if the client wins.
2. **Doctors treat on a promise.** Providers treat now and get paid from the settlement later via a **lien**.
3. **The case takes years.** The file grows to thousands of pages of notes, emails, tasks and documents.
4. **Two sides, one case.** The firm and the providers both need to know where the case stands.
Liens are usually negotiated down at the end so the client takes home more.
 
## 4. User Needs
 
### Attorneys / Internal Team
- Get up to speed and see recent activity without asking anyone
- "What changed since I last opened this matter?"
- Surface the 10 entries that matter out of 300
- Two modes: a 2-minute overview, or dig into everything
- **Provenance:** every date and fact links back to the source note, document or email
- Client photo visible on open
- Extract primary injuries from long scanned PDFs
- When was the client last actually contacted?
- What is overdue, upcoming, and waiting on someone else?
- Key KPIs: **case value** and **coverage** behind it
- Firm spend to date on the case
- **Cache the digest:** do not re-run AI on every open
- Track what was shared with each provider and whether it was opened
- Preview and adjust what a provider sees before sending
- Secure, partial sharing with providers
### Medical Providers
- Is there coverage behind the case?
- Is the case still alive (not settled a year ago)?
- Notify me when the case moves
- See more than just the records I sent
- What does the firm need from my office right now?
- Is my patient still showing up to treatment?
> These are a menu, not a spec. Pick the ones worth building and build them well.
 
## 5. Provider Sharing Rules
 
| Share | Do Not Share |
|-------|--------------|
| Status changes | Case strategy |
| Bills and records | Confidential info not relevant to the provider |
 
Sharing should be configurable per attorney.

## 6. Our Approach

- **A dashboard, not a chatbot.** Open a matter and the catch-up brief, KPIs, recent changes and sources are already on screen.
- **Cached AI digest.** The brief is written once, stored in Supabase, and only regenerated when the matter's records change or someone clicks Regenerate.
- **Every fact is cited.** Each sentence in the brief and each figure carries a source chip that opens the original note, email, task or document.
- **Provider-safe sharing.** Providers never read live firm data. A share is a frozen snapshot of what the firm chose to show, with version history and a "what changed" diff.

## 7. Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Vite, React 19, TypeScript, react-router |
| UI | Tailwind CSS v4, shadcn/ui (Radix), Geist and Geist Mono fonts |
| Server state | TanStack Query, with zod schemas as the shared contract |
| Backend | Express 5 (TypeScript, run by `tsx`). Only place Clio and OpenAI credentials live |
| Database and auth | Supabase (Postgres, Auth, row level security) |
| Source of truth | Clio Manage, connected over OAuth |
| AI | OpenAI GPT-5.4 mini, called server-side with strict JSON output |
| Tooling | oxlint, Supabase CLI |

```
Browser (React) ──/api──▶ Express ──▶ Clio Manage (OAuth, read-only)
      │                      ├──────▶ OpenAI (catch-up briefs)
      └── Supabase (RLS) ◀───┘ service-role writes
```

Why these choices: [ADR 0001](docs/adr/0001-tech-stack.md) (stack) and [ADR 0002](docs/adr/0002-llm-model.md) (LLM). Schema and who writes what: [docs/schema.md](docs/schema.md).

## 8. What We've Built

- **Clio connection.** OAuth connect and disconnect, with token refresh, from the Integrations page.
- **Clio to Supabase sync.** Pulls open and pending matters, notes, emails and calls, tasks, documents, court dates, expenses and treating providers. Every record gets a citation, and re-running updates rows instead of duplicating them.
- **Database schema with RLS.** Firm tenancy, sourced facts, and provider access limited to published snapshots.
- **Dashboard.** "My matters" with stage, client and key dates, read from synced data.
- **Matter view.** KPI strip, side panels for injuries and providers, source chips and a source drawer.
- **Catch-up brief.** AI summary (where it stands, what is next, what to watch for) and the entries that matter, cached with an input hash and regeneratable.
- **Share composer.** Choose what each provider sees, preview it, and publish.
- **Provider portal.** A provider-facing case view built from frozen snapshots, sharing one component with the composer preview.
- **Provider sync.** Providers are derived from Clio matter relationships.

### Not built yet

- Sign-in. API routes are localhost-only and unauthenticated, and the "Records desk" inbox stands in for provider users.
- Shares still live in browser `localStorage`, not Supabase.
- Valuations, policies, injuries, visits and requests have no Clio source, so those panels show empty states.
- Document contents are not read, so there is no PDF injury extraction yet.
- Records deleted in Clio are not removed from Supabase.
- `record` and `facts` matter sub-routes are placeholders.
- No test suite.

## 9. Getting Started

```bash
npm install
cp .env.example .env   # fill in Supabase, Clio and OpenAI credentials
npm run dev            # web at http://127.0.0.1:5173, API at http://127.0.0.1:8787
```

Then open `/app/integrations` to connect Clio and run **Sync now**.

Other commands: `npm run build` (typecheck and build), `npm run lint`, `npx supabase db push` (apply migrations).

Use `127.0.0.1`, not `localhost`: Clio only accepts that redirect URI.
