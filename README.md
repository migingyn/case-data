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

## 6. Tech Stack

Current brainstormed tech stack is:

Frontend: React + TypeScript
│
Backend: Express.js
|
Database:  Tanstack, Supabase
