-- Formivo: runtime support for the working application.
--   * form submission secrets are stored as HMAC-SHA256 hashes, never plaintext
--   * idempotency keys make submission retries safe
--   * database-backed rate limiting works across server instances
--   * public RPC wrappers make the trusted app_private functions callable by the
--     service role through PostgREST (public schema) without exposing app_private
--
-- Every new table has RLS enabled with no policies, so only the service role
-- (which bypasses RLS) can read or write it.

alter table public.forms
  add column if not exists secret_hash text
    check (secret_hash is null or char_length(secret_hash) = 64),
  add column if not exists secret_last_four text
    check (secret_last_four is null or char_length(secret_last_four) = 4);

create index if not exists forms_workspace_created_idx
  on public.forms (workspace_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Idempotency
-- ---------------------------------------------------------------------------

create table if not exists public.submission_idempotency (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  idempotency_key text not null
    check (char_length(idempotency_key) between 1 and 255),
  request_hash text not null,
  submission_id uuid references public.submissions (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint submission_idempotency_form_key_unique unique (form_id, idempotency_key)
);

create index if not exists submission_idempotency_created_idx
  on public.submission_idempotency (created_at);

alter table public.submission_idempotency enable row level security;

-- ---------------------------------------------------------------------------
-- Rate limiting (fixed window, atomic upsert)
-- ---------------------------------------------------------------------------

create table if not exists public.rate_limit_buckets (
  bucket text not null,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (bucket, window_start)
);

create index if not exists rate_limit_buckets_window_idx
  on public.rate_limit_buckets (window_start);

alter table public.rate_limit_buckets enable row level security;

-- Returns the count within the window and raises RATE_LIMITED when the caller
-- has exceeded p_limit. Atomic, so parallel requests cannot slip past the cap.
create or replace function public.consume_rate_limit(
  p_bucket text,
  p_window_start timestamptz,
  p_limit integer
)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_bucket is null or btrim(p_bucket) = '' or p_window_start is null then
    raise exception 'INVALID_ARGUMENTS';
  end if;

  insert into public.rate_limit_buckets (bucket, window_start, request_count)
  values (left(p_bucket, 300), p_window_start, 1)
  on conflict (bucket, window_start)
  do update set request_count = public.rate_limit_buckets.request_count + 1
  returning request_count into v_count;

  if v_count > greatest(coalesce(p_limit, 0), 1) then
    raise exception 'RATE_LIMITED';
  end if;

  return v_count;
end;
$$;

revoke execute on function public.consume_rate_limit(text, timestamptz, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, timestamptz, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Public RPC wrappers (service role only)
-- ---------------------------------------------------------------------------

create or replace function public.api_initialize_developer_account(
  p_user_id uuid,
  p_email text,
  p_display_name text default null,
  p_workspace_name text default null
)
returns jsonb
language sql
volatile
security definer
set search_path = ''
as $$
  select app_private.initialize_developer_account(
    p_user_id, p_email, p_display_name, p_workspace_name
  );
$$;

create or replace function public.api_accept_client_invitation(
  p_token_hash text,
  p_user_id uuid,
  p_user_email text,
  p_max_viewers integer
)
returns jsonb
language sql
volatile
security definer
set search_path = ''
as $$
  select app_private.accept_client_invitation(
    p_token_hash, p_user_id, p_user_email, p_max_viewers
  );
$$;

create or replace function public.api_record_submission(
  p_form_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_max_submissions integer,
  p_data jsonb,
  p_source_origin text default null
)
returns jsonb
language sql
volatile
security definer
set search_path = ''
as $$
  select app_private.record_submission(
    p_form_id, p_period_start, p_period_end, p_max_submissions, p_data, p_source_origin
  );
$$;

revoke execute on function public.api_initialize_developer_account(uuid, text, text, text) from public, anon, authenticated;
revoke execute on function public.api_accept_client_invitation(text, uuid, text, integer) from public, anon, authenticated;
revoke execute on function public.api_record_submission(uuid, timestamptz, timestamptz, integer, jsonb, text) from public, anon, authenticated;

grant execute on function public.api_initialize_developer_account(uuid, text, text, text) to service_role;
grant execute on function public.api_accept_client_invitation(text, uuid, text, integer) to service_role;
grant execute on function public.api_record_submission(uuid, timestamptz, timestamptz, integer, jsonb, text) to service_role;
