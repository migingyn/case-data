-- Clio sync: link a firm to its Clio account and keep the responsible
-- attorney's name until Clio users map to firm_members (which need an
-- auth.users row, and there is no sign-in yet). Only the backend's
-- service role writes these columns, so no new policies or grants.

alter table public.firms
  add column clio_account_id text unique;

alter table public.matters
  add column lead_attorney_name text;
