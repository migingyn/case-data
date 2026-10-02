-- Case Digest: initial schema.
--
-- Three kinds of writer:
--   * the Express backend (service_role) syncs Clio and stores LLM output;
--     it bypasses RLS, so most tables have read-only policies for users
--   * firm members (authenticated) read their firm's matters and manage shares
--   * provider users (authenticated) only ever read published share
--     snapshots for their practice, plus their own alerts and view tracking
--
-- Tenancy: every firm-owned row carries firm_id. Child tables reference
-- matters by (matter_id, firm_id), so a row can never point at another
-- firm's matter, and policies compare firm_id directly (no joins).

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.firm_role as enum ('attorney', 'case_manager', 'staff', 'admin');
create type public.matter_stage as enum ('intake', 'treatment', 'demand', 'negotiation', 'litigation', 'settled');
create type public.source_kind as enum (
  'letter', 'email', 'note', 'medical_record', 'bill', 'policy', 'filing',
  'call_log', 'ledger', 'intake_form', 'task', 'message', 'memo', 'report'
);
create type public.entry_kind as enum (
  'offer', 'court_date', 'client_message', 'provider_reply', 'document', 'email', 'note'
);
create type public.injury_status as enum ('confirmed', 'proposed');
create type public.visit_status as enum ('attended', 'missed', 'scheduled');
create type public.summary_block as enum ('where_it_stands', 'what_is_next', 'watch_for', 'provider');
create type public.catch_up_depth as enum ('brief', 'full');
create type public.share_event_kind as enum ('published', 'opened', 'revoked');
create type public.provider_section as enum (
  'coverage', 'milestones', 'requests', 'treatment', 'documents', 'summary'
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Firms and people
-- ---------------------------------------------------------------------------

create table public.firms (
  id bigint generated always as identity primary key,
  name text not null check (length(name) > 0),
  created_at timestamptz not null default now()
);

-- One firm per user keeps every policy a single lookup.
create table public.firm_members (
  id bigint generated always as identity primary key,
  firm_id bigint not null references public.firms (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text not null,
  role public.firm_role not null default 'staff',
  default_depth public.catch_up_depth not null default 'brief',
  -- Drives "Since you were last here" on My matters.
  last_visit_at timestamptz,
  clio_user_id text,
  created_at timestamptz not null default now(),
  unique (id, firm_id),
  unique (firm_id, clio_user_id)
);
create index firm_members_firm_id_idx on public.firm_members (firm_id);

-- Treating practices. Shared across firms: the same clinic may treat
-- clients of several firms.
create table public.providers (
  id bigint generated always as identity primary key,
  name text not null,
  specialty text not null,
  created_at timestamptz not null default now()
);

create table public.provider_users (
  id bigint generated always as identity primary key,
  provider_id bigint not null references public.providers (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text not null,
  role_title text not null,
  created_at timestamptz not null default now()
);
create index provider_users_provider_id_idx on public.provider_users (provider_id);

-- ---------------------------------------------------------------------------
-- RLS helpers. SECURITY DEFINER so policies on firm_members / provider_users
-- can look the caller up without recursing; private schema is not exposed
-- through the Data API, and every function checks auth.uid() itself.
-- ---------------------------------------------------------------------------

create or replace function private.current_firm_id()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select firm_id from public.firm_members where user_id = (select auth.uid());
$$;

create or replace function private.current_member_id()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.firm_members where user_id = (select auth.uid());
$$;

create or replace function private.current_provider_id()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select provider_id from public.provider_users where user_id = (select auth.uid());
$$;

create or replace function private.current_provider_user_id()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.provider_users where user_id = (select auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Matters (synced from Clio)
-- ---------------------------------------------------------------------------

create table public.clients (
  id bigint generated always as identity primary key,
  firm_id bigint not null references public.firms (id) on delete cascade,
  full_name text not null,
  -- Path in Supabase Storage, never a signed URL.
  photo_path text,
  clio_contact_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, firm_id),
  unique (firm_id, clio_contact_id)
);

create table public.matters (
  id bigint generated always as identity primary key,
  firm_id bigint not null references public.firms (id) on delete cascade,
  client_id bigint not null,
  case_type text not null,
  stage public.matter_stage not null,
  opened_on date not null,
  lead_attorney_id bigint,
  -- Shown to providers as a paused status; null while the case is moving.
  paused_reason text,
  clio_matter_id text not null,
  -- "Open in source system".
  source_url text not null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, firm_id),
  unique (firm_id, clio_matter_id),
  foreign key (client_id, firm_id) references public.clients (id, firm_id),
  foreign key (lead_attorney_id, firm_id) references public.firm_members (id, firm_id)
);
create index matters_firm_id_idx on public.matters (firm_id);
create index matters_client_id_idx on public.matters (client_id, firm_id);
create index matters_lead_attorney_id_idx on public.matters (lead_attorney_id, firm_id);

-- A file or record in the source system. Page images live in Storage.
create table public.documents (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  kind public.source_kind not null,
  title text not null,
  document_date timestamptz not null,
  author text,
  page_count integer check (page_count > 0),
  storage_path text,
  clio_document_id text,
  created_at timestamptz not null default now(),
  unique (id, firm_id),
  unique (firm_id, clio_document_id),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade
);
create index documents_matter_id_idx on public.documents (matter_id, firm_id);

-- What a source chip points at: a passage of a document, optionally a page.
create table public.citations (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  document_id bigint not null,
  page integer check (page > 0),
  excerpt text not null,
  created_at timestamptz not null default now(),
  unique (id, firm_id),
  foreign key (document_id, firm_id) references public.documents (id, firm_id) on delete cascade
);
create index citations_document_id_idx on public.citations (document_id, firm_id);

-- Areas blacked out before any page reaches a provider. Coordinates are
-- fractions of the page so they survive re-rendering at any size.
create table public.document_redactions (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  document_id bigint not null,
  page integer not null check (page > 0),
  x numeric(5, 4) not null check (x between 0 and 1),
  y numeric(5, 4) not null check (y between 0 and 1),
  width numeric(5, 4) not null check (width > 0 and width <= 1),
  height numeric(5, 4) not null check (height > 0 and height <= 1),
  reason text,
  created_at timestamptz not null default now(),
  foreign key (document_id, firm_id) references public.documents (id, firm_id) on delete cascade
);
create index document_redactions_document_id_idx on public.document_redactions (document_id, firm_id, page);

-- The record: every note, email, message and filing, newest first.
create table public.matter_entries (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  kind public.entry_kind not null,
  summary text not null,
  occurred_at timestamptz not null,
  citation_id bigint not null,
  clio_id text,
  created_at timestamptz not null default now(),
  unique (id, firm_id),
  unique (firm_id, clio_id),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade,
  foreign key (citation_id, firm_id) references public.citations (id, firm_id)
);
create index matter_entries_matter_occurred_idx on public.matter_entries (matter_id, firm_id, occurred_at desc);
create index matter_entries_citation_id_idx on public.matter_entries (citation_id, firm_id);

create table public.tasks (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  title text not null,
  due_at timestamptz not null,
  completed_at timestamptz,
  -- Who the firm is waiting on; null when the next move is the firm's.
  waiting_on text,
  assignee_id bigint,
  citation_id bigint not null,
  clio_task_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (firm_id, clio_task_id),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade,
  foreign key (assignee_id, firm_id) references public.firm_members (id, firm_id),
  foreign key (citation_id, firm_id) references public.citations (id, firm_id)
);
create index tasks_open_by_matter_idx on public.tasks (matter_id, firm_id, due_at) where completed_at is null;
create index tasks_assignee_id_idx on public.tasks (assignee_id, firm_id);
create index tasks_citation_id_idx on public.tasks (citation_id, firm_id);

create table public.client_contacts (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  occurred_at timestamptz not null,
  channel text not null,
  staff_member_id bigint,
  citation_id bigint not null,
  created_at timestamptz not null default now(),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade,
  foreign key (staff_member_id, firm_id) references public.firm_members (id, firm_id),
  foreign key (citation_id, firm_id) references public.citations (id, firm_id)
);
create index client_contacts_matter_occurred_idx on public.client_contacts (matter_id, firm_id, occurred_at desc);
create index client_contacts_staff_member_id_idx on public.client_contacts (staff_member_id, firm_id);
create index client_contacts_citation_id_idx on public.client_contacts (citation_id, firm_id);

-- Valuation history; the matter view shows the latest.
create table public.valuations (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  expected_amount numeric(14, 2) not null check (expected_amount >= 0),
  low_amount numeric(14, 2) not null,
  high_amount numeric(14, 2) not null,
  valued_at timestamptz not null,
  citation_id bigint not null,
  created_at timestamptz not null default now(),
  check (low_amount <= expected_amount and expected_amount <= high_amount),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade,
  foreign key (citation_id, firm_id) references public.citations (id, firm_id)
);
create index valuations_matter_valued_idx on public.valuations (matter_id, firm_id, valued_at desc);
create index valuations_citation_id_idx on public.valuations (citation_id, firm_id);

-- Liability coverage behind the claim.
create table public.policies (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  carrier text not null,
  policy_type text not null,
  limit_amount numeric(14, 2) not null check (limit_amount >= 0),
  verified_at timestamptz not null,
  citation_id bigint not null,
  created_at timestamptz not null default now(),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade,
  foreign key (citation_id, firm_id) references public.citations (id, firm_id)
);
create index policies_matter_verified_idx on public.policies (matter_id, firm_id, verified_at desc);
create index policies_citation_id_idx on public.policies (citation_id, firm_id);

-- Costs the firm has advanced; "Firm spend to date" is their sum.
create table public.costs (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  amount numeric(14, 2) not null,
  incurred_on date not null,
  description text not null,
  citation_id bigint not null,
  created_at timestamptz not null default now(),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade,
  foreign key (citation_id, firm_id) references public.citations (id, firm_id)
);
create index costs_matter_id_idx on public.costs (matter_id, firm_id);
create index costs_citation_id_idx on public.costs (citation_id, firm_id);

create table public.injuries (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  description text not null,
  status public.injury_status not null,
  citation_id bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade,
  foreign key (citation_id, firm_id) references public.citations (id, firm_id)
);
create index injuries_matter_id_idx on public.injuries (matter_id, firm_id);
create index injuries_citation_id_idx on public.injuries (citation_id, firm_id);

create table public.milestones (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  label text not null,
  reached_at timestamptz,
  expected_at timestamptz,
  position smallint not null,
  check (reached_at is not null or expected_at is not null),
  unique (matter_id, position),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade
);
create index milestones_matter_id_idx on public.milestones (matter_id, firm_id);

-- ---------------------------------------------------------------------------
-- Treating providers on a matter
-- ---------------------------------------------------------------------------

create table public.matter_providers (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  provider_id bigint not null references public.providers (id),
  lien_type text not null,
  created_at timestamptz not null default now(),
  unique (matter_id, provider_id),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade
);
create index matter_providers_firm_matter_idx on public.matter_providers (matter_id, firm_id);
create index matter_providers_provider_id_idx on public.matter_providers (provider_id);

create table public.visits (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  provider_id bigint not null,
  visit_at timestamptz not null,
  status public.visit_status not null,
  citation_id bigint,
  created_at timestamptz not null default now(),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade,
  foreign key (matter_id, provider_id) references public.matter_providers (matter_id, provider_id),
  foreign key (citation_id, firm_id) references public.citations (id, firm_id)
);
create index visits_matter_provider_idx on public.visits (matter_id, provider_id, visit_at);
create index visits_firm_matter_idx on public.visits (matter_id, firm_id);
create index visits_citation_id_idx on public.visits (citation_id, firm_id);

-- What the firm has asked a provider for.
create table public.provider_requests (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  provider_id bigint not null,
  title text not null,
  requested_at timestamptz not null default now(),
  due_at timestamptz not null,
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade,
  foreign key (matter_id, provider_id) references public.matter_providers (matter_id, provider_id)
);
create index provider_requests_open_idx on public.provider_requests (matter_id, provider_id) where fulfilled_at is null;
create index provider_requests_firm_matter_idx on public.provider_requests (matter_id, firm_id);

-- ---------------------------------------------------------------------------
-- Catch-up summaries (written by the backend from LLM output)
-- ---------------------------------------------------------------------------

create table public.matter_summaries (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  -- "Summary current as of".
  generated_at timestamptz not null default now(),
  model text not null,
  -- "Show all n entries" at the time of generation.
  total_entries integer not null check (total_entries >= 0),
  unique (id, firm_id),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade
);
create index matter_summaries_latest_idx on public.matter_summaries (matter_id, firm_id, generated_at desc);

create table public.summary_sentences (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  summary_id bigint not null,
  block public.summary_block not null,
  position smallint not null,
  text text not null,
  citation_id bigint,
  -- Every firm-facing sentence is sourced; the provider-safe summary is not cited.
  check (block = 'provider' or citation_id is not null),
  unique (summary_id, block, position),
  foreign key (summary_id, firm_id) references public.matter_summaries (id, firm_id) on delete cascade,
  foreign key (citation_id, firm_id) references public.citations (id, firm_id)
);
create index summary_sentences_firm_summary_idx on public.summary_sentences (summary_id, firm_id);
create index summary_sentences_citation_id_idx on public.summary_sentences (citation_id, firm_id);

-- "The ten entries that matter".
create table public.summary_ranked_entries (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  summary_id bigint not null,
  rank smallint not null check (rank between 1 and 10),
  entry_id bigint not null,
  title text not null,
  reason text not null,
  unique (summary_id, rank),
  foreign key (summary_id, firm_id) references public.matter_summaries (id, firm_id) on delete cascade,
  foreign key (entry_id, firm_id) references public.matter_entries (id, firm_id) on delete cascade
);
create index summary_ranked_entries_firm_summary_idx on public.summary_ranked_entries (summary_id, firm_id);
create index summary_ranked_entries_entry_id_idx on public.summary_ranked_entries (entry_id, firm_id);

-- When each member last opened each matter: "Since you last opened" and "No change".
create table public.matter_views (
  member_id bigint not null references public.firm_members (id) on delete cascade,
  matter_id bigint not null references public.matters (id) on delete cascade,
  last_opened_at timestamptz not null default now(),
  primary key (member_id, matter_id)
);
create index matter_views_matter_id_idx on public.matter_views (matter_id);

-- ---------------------------------------------------------------------------
-- Sharing with providers
-- ---------------------------------------------------------------------------

-- One share per provider per matter. Readable by that provider, so it holds
-- nothing the firm hasn't published: drafts live in share_drafts.
create table public.shares (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  matter_id bigint not null,
  provider_id bigint not null,
  current_version integer check (current_version > 0),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, firm_id),
  unique (matter_id, provider_id),
  foreign key (matter_id, firm_id) references public.matters (id, firm_id) on delete cascade,
  foreign key (matter_id, provider_id) references public.matter_providers (matter_id, provider_id)
);
create index shares_firm_matter_idx on public.shares (matter_id, firm_id);
create index shares_provider_id_idx on public.shares (provider_id);

create table public.share_drafts (
  share_id bigint primary key,
  firm_id bigint not null,
  -- ShareSettings as the composer edits them.
  settings jsonb not null,
  updated_at timestamptz not null default now(),
  foreign key (share_id, firm_id) references public.shares (id, firm_id) on delete cascade
);
create index share_drafts_firm_id_idx on public.share_drafts (share_id, firm_id);

-- Each publish freezes exactly what the provider sees (ProviderView) so the
-- provider never reads live firm data and "what changed" diffs versions.
create table public.share_versions (
  id bigint generated always as identity primary key,
  firm_id bigint not null,
  share_id bigint not null,
  version integer not null check (version > 0),
  settings jsonb not null,
  view jsonb not null,
  expires_at timestamptz not null,
  published_by bigint not null,
  published_at timestamptz not null default now(),
  unique (id, firm_id),
  unique (share_id, version),
  foreign key (share_id, firm_id) references public.shares (id, firm_id) on delete cascade,
  foreign key (published_by, firm_id) references public.firm_members (id, firm_id)
);
create index share_versions_firm_share_idx on public.share_versions (share_id, firm_id);
create index share_versions_published_by_idx on public.share_versions (published_by, firm_id);

create table public.share_version_recipients (
  share_version_id bigint not null references public.share_versions (id) on delete cascade,
  provider_user_id bigint not null references public.provider_users (id) on delete cascade,
  primary key (share_version_id, provider_user_id)
);
create index share_version_recipients_user_idx on public.share_version_recipients (provider_user_id);

-- Share activity: published, opened, revoked. Actor names come from
-- firm_members / provider_users via actor_user_id.
create table public.share_events (
  id bigint generated always as identity primary key,
  share_id bigint not null references public.shares (id) on delete cascade,
  kind public.share_event_kind not null,
  version integer not null check (version > 0),
  actor_user_id uuid not null default auth.uid() references auth.users (id),
  occurred_at timestamptz not null default now()
);
create index share_events_share_occurred_idx on public.share_events (share_id, occurred_at desc);
create index share_events_actor_user_id_idx on public.share_events (actor_user_id);

create table public.share_section_views (
  share_id bigint not null references public.shares (id) on delete cascade,
  version integer not null,
  section public.provider_section not null,
  provider_user_id bigint not null references public.provider_users (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (share_id, version, section, provider_user_id)
);
create index share_section_views_user_idx on public.share_section_views (provider_user_id);

-- A provider user's "Tell me when" choices for one share.
create table public.provider_notify_prefs (
  provider_user_id bigint not null references public.provider_users (id) on delete cascade,
  share_id bigint not null references public.shares (id) on delete cascade,
  milestone boolean not null default false,
  status boolean not null default false,
  request boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (provider_user_id, share_id)
);
create index provider_notify_prefs_share_id_idx on public.provider_notify_prefs (share_id);

-- Provider side: is this share visible to the calling provider user right now?
-- SECURITY DEFINER because providers can't read every column they need here.
create or replace function private.provider_can_view_share(target_share_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.shares s
    join public.provider_users pu on pu.provider_id = s.provider_id
    where s.id = target_share_id
      and pu.user_id = (select auth.uid())
      and s.current_version is not null
      and s.revoked_at is null
      and s.expires_at > now()
  );
$$;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger clients_set_updated_at before update on public.clients
  for each row execute function private.set_updated_at();
create trigger matters_set_updated_at before update on public.matters
  for each row execute function private.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function private.set_updated_at();
create trigger injuries_set_updated_at before update on public.injuries
  for each row execute function private.set_updated_at();
create trigger shares_set_updated_at before update on public.shares
  for each row execute function private.set_updated_at();
create trigger share_drafts_set_updated_at before update on public.share_drafts
  for each row execute function private.set_updated_at();
create trigger provider_notify_prefs_set_updated_at before update on public.provider_notify_prefs
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.firms enable row level security;
alter table public.firm_members enable row level security;
alter table public.providers enable row level security;
alter table public.provider_users enable row level security;
alter table public.clients enable row level security;
alter table public.matters enable row level security;
alter table public.documents enable row level security;
alter table public.citations enable row level security;
alter table public.document_redactions enable row level security;
alter table public.matter_entries enable row level security;
alter table public.tasks enable row level security;
alter table public.client_contacts enable row level security;
alter table public.valuations enable row level security;
alter table public.policies enable row level security;
alter table public.costs enable row level security;
alter table public.injuries enable row level security;
alter table public.milestones enable row level security;
alter table public.matter_providers enable row level security;
alter table public.visits enable row level security;
alter table public.provider_requests enable row level security;
alter table public.matter_summaries enable row level security;
alter table public.summary_sentences enable row level security;
alter table public.summary_ranked_entries enable row level security;
alter table public.matter_views enable row level security;
alter table public.shares enable row level security;
alter table public.share_drafts enable row level security;
alter table public.share_versions enable row level security;
alter table public.share_version_recipients enable row level security;
alter table public.share_events enable row level security;
alter table public.share_section_views enable row level security;
alter table public.provider_notify_prefs enable row level security;

-- Firm-scoped, read-only for members (the backend writes these).
do $$
declare
  t text;
begin
  foreach t in array array[
    'clients', 'matters', 'documents', 'citations', 'document_redactions',
    'matter_entries', 'tasks', 'client_contacts', 'valuations', 'policies',
    'costs', 'injuries', 'milestones', 'matter_providers', 'visits',
    'provider_requests', 'matter_summaries', 'summary_sentences',
    'summary_ranked_entries'
  ]
  loop
    execute format(
      'create policy "firm members read" on public.%I for select to authenticated
         using (firm_id = (select private.current_firm_id()))',
      t
    );
  end loop;
end;
$$;

create policy "members read own firm" on public.firms for select to authenticated
  using (id = (select private.current_firm_id()));

create policy "members read colleagues" on public.firm_members for select to authenticated
  using (firm_id = (select private.current_firm_id()));
-- Only default_depth and last_visit_at are updatable (column grants below).
create policy "members update self" on public.firm_members for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "read providers on firm matters or own practice" on public.providers for select to authenticated
  using (
    id = (select private.current_provider_id())
    or exists (
      select 1 from public.matter_providers mp
      where mp.provider_id = providers.id
        and mp.firm_id = (select private.current_firm_id())
    )
  );

create policy "read practice users" on public.provider_users for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.matter_providers mp
      where mp.provider_id = provider_users.provider_id
        and mp.firm_id = (select private.current_firm_id())
    )
  );

create policy "members manage own matter views" on public.matter_views for all to authenticated
  using (member_id = (select private.current_member_id()))
  with check (
    member_id = (select private.current_member_id())
    -- matters is RLS-filtered, so this only finds the member's own firm's matters.
    and exists (select 1 from public.matters m where m.id = matter_id)
  );

-- Shares: firm members manage; the shared provider can read its own row.
create policy "firm members read shares" on public.shares for select to authenticated
  using (firm_id = (select private.current_firm_id()));
create policy "provider reads own shares" on public.shares for select to authenticated
  using (provider_id = (select private.current_provider_id()));
create policy "firm members create shares" on public.shares for insert to authenticated
  with check (firm_id = (select private.current_firm_id()));
create policy "firm members update shares" on public.shares for update to authenticated
  using (firm_id = (select private.current_firm_id()))
  with check (firm_id = (select private.current_firm_id()));

create policy "firm members manage drafts" on public.share_drafts for all to authenticated
  using (firm_id = (select private.current_firm_id()))
  with check (firm_id = (select private.current_firm_id()));

create policy "firm members read versions" on public.share_versions for select to authenticated
  using (firm_id = (select private.current_firm_id()));
create policy "firm members publish versions" on public.share_versions for insert to authenticated
  with check (
    firm_id = (select private.current_firm_id())
    and published_by = (select private.current_member_id())
  );
-- Providers read every version of a live share (to diff against what they last saw).
create policy "provider reads live versions" on public.share_versions for select to authenticated
  using ((select private.provider_can_view_share(share_id)));

create policy "firm members manage recipients" on public.share_version_recipients for all to authenticated
  using (exists (
    select 1 from public.share_versions v
    where v.id = share_version_id and v.firm_id = (select private.current_firm_id())
  ))
  with check (exists (
    select 1 from public.share_versions v
    where v.id = share_version_id and v.firm_id = (select private.current_firm_id())
  ));

create policy "firm members read share events" on public.share_events for select to authenticated
  using (exists (
    select 1 from public.shares s
    where s.id = share_id and s.firm_id = (select private.current_firm_id())
  ));
create policy "firm members log publish and revoke" on public.share_events for insert to authenticated
  with check (
    kind in ('published', 'revoked')
    and actor_user_id = (select auth.uid())
    and exists (
      select 1 from public.shares s
      where s.id = share_id and s.firm_id = (select private.current_firm_id())
    )
  );
create policy "provider reads own events" on public.share_events for select to authenticated
  using (actor_user_id = (select auth.uid()));
create policy "provider logs opens" on public.share_events for insert to authenticated
  with check (
    kind = 'opened'
    and actor_user_id = (select auth.uid())
    and (select private.provider_can_view_share(share_id))
  );

create policy "firm members read section views" on public.share_section_views for select to authenticated
  using (exists (
    select 1 from public.shares s
    where s.id = share_id and s.firm_id = (select private.current_firm_id())
  ));
create policy "provider logs own section views" on public.share_section_views for insert to authenticated
  with check (
    provider_user_id = (select private.current_provider_user_id())
    and (select private.provider_can_view_share(share_id))
  );
create policy "provider reads own section views" on public.share_section_views for select to authenticated
  using (provider_user_id = (select private.current_provider_user_id()));

create policy "provider manages own alerts" on public.provider_notify_prefs for all to authenticated
  using (provider_user_id = (select private.current_provider_user_id()))
  with check (
    provider_user_id = (select private.current_provider_user_id())
    and (select private.provider_can_view_share(share_id))
  );

-- ---------------------------------------------------------------------------
-- Publish as one transaction: next version number, frozen view, recipients,
-- activity row. SECURITY INVOKER, so every write above goes through RLS.
-- ---------------------------------------------------------------------------

create or replace function public.publish_share(
  target_share_id bigint,
  settings jsonb,
  view jsonb,
  expires_at timestamptz,
  recipient_ids bigint[]
)
returns public.share_versions
language plpgsql
security invoker
set search_path = ''
as $$
declare
  share_row public.shares;
  published public.share_versions;
begin
  select * into share_row from public.shares where id = target_share_id for update;
  if not found then
    raise exception 'share % not found', target_share_id using errcode = 'P0002';
  end if;
  if expires_at <= now() then
    raise exception 'expiry must be in the future' using errcode = '22023';
  end if;
  if coalesce(array_length(recipient_ids, 1), 0) = 0 then
    raise exception 'choose at least one recipient' using errcode = '22023';
  end if;

  insert into public.share_versions (firm_id, share_id, version, settings, view, expires_at, published_by)
  values (
    share_row.firm_id,
    share_row.id,
    coalesce(share_row.current_version, 0) + 1,
    publish_share.settings,
    publish_share.view,
    publish_share.expires_at,
    (select private.current_member_id())
  )
  returning * into published;

  insert into public.share_version_recipients (share_version_id, provider_user_id)
  select published.id, pu.id
  from public.provider_users pu
  where pu.id = any (recipient_ids) and pu.provider_id = share_row.provider_id;

  update public.shares
  set current_version = published.version, expires_at = published.expires_at, revoked_at = null
  where id = share_row.id;

  insert into public.share_drafts (share_id, firm_id, settings)
  values (share_row.id, share_row.firm_id, publish_share.settings)
  on conflict (share_id) do update set settings = excluded.settings;

  insert into public.share_events (share_id, kind, version)
  values (share_row.id, 'published', published.version);

  return published;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants. New tables are not exposed to the Data API automatically, so
-- grant exactly what the policies above expect; anon gets nothing.
-- ---------------------------------------------------------------------------

grant usage on schema private to authenticated;
revoke execute on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;
revoke execute on function public.publish_share(bigint, jsonb, jsonb, timestamptz, bigint[]) from public, anon;
grant execute on function public.publish_share(bigint, jsonb, jsonb, timestamptz, bigint[]) to authenticated;

revoke all on all tables in schema public from anon;
grant select on all tables in schema public to authenticated;
grant update (default_depth, last_visit_at) on public.firm_members to authenticated;
grant insert, update, delete on public.matter_views to authenticated;
grant insert, update on public.shares to authenticated;
grant insert, update, delete on public.share_drafts to authenticated;
grant insert on public.share_versions to authenticated;
grant insert, delete on public.share_version_recipients to authenticated;
grant insert on public.share_events to authenticated;
grant insert on public.share_section_views to authenticated;
grant insert, update, delete on public.provider_notify_prefs to authenticated;

-- The Express backend syncs Clio and writes LLM output with the service role.
grant select, insert, update, delete on all tables in schema public to service_role;
