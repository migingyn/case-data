-- Cached catch-up briefs: a hash of exactly what the model read (plus a
-- prompt version), so a sync regenerates a matter's brief only when its
-- records actually changed. Written by the backend's service role only.

alter table public.matter_summaries
  add column input_hash text;
