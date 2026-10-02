-- Treating providers synced from Clio matter relationships.
--   * providers.source_key: `clio:<account id>:<contact id>`, so a re-sync
--     finds the same practice. providers is shared across firms, hence the
--     account in the key.
--   * matter_providers.lien_type: Clio has no lien details, so it may be
--     unknown until the firm records it.
-- Written by the backend's service role only; no new policies or grants.

alter table public.providers
  add column source_key text unique;

alter table public.matter_providers
  alter column lien_type drop not null;
