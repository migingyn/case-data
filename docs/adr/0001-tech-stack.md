# 0001: Tech stack

**Status:** Accepted
**Date:** 2026-10-02
**Owner:** Mikey Nguyen

## Context
Hackathon, ~6 hours, small team, need something everyone already knows.
Clio is read-only; persistence needs a real DB outside it.

## Decision
Frontend: React + TypeScript, Tanstack (Query, client-side cache for server state)
Backend: Express.js (TypeScript)
Database: Supabase (Postgres + Auth + RLS for provider access)

## Alternatives considered
- Next.js full-stack: simpler, but splitting client/server keeps Clio
  secrets and AI calls server-side.
- Firebase: Supabase's relational model + RLS fits per-provider
  visibility better.

## Consequences
- Two dev servers locally.
- Need RLS policies for the provider portal.