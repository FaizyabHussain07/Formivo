-- Formivo: billing state, usage accounting, webhook replay protection, audit log.
-- Subscriptions are updated ONLY through verified Lemon Squeezy webhooks handled
-- server-side (Phase 7); nothing here is ever derived from a browser redirect.

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces (id) on delete cascade,
  plan_key text not null default 'free' check (plan_key in ('free', 'pro', 'agency')),
  status text not null default 'active'
    check (status in ('active', 'on_trial', 'paused', 'past_due', 'cancelled', 'expired')),
  provider text not null default 'lemonsqueezy',
  provider_customer_id text,
  provider_subscription_id text unique,
  variant_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create table public.usage_periods (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  submission_count integer not null default 0 check (submission_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint usage_periods_window check (period_end > period_start),
  constraint usage_periods_workspace_window_unique unique (workspace_id, period_start, period_end)
);

create trigger usage_periods_set_updated_at
  before update on public.usage_periods
  for each row execute function public.set_updated_at();

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text,
  payload_hash text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint webhook_events_provider_event_unique unique (provider, provider_event_id)
);

-- Security-relevant actions (invitation lifecycle, subscription changes,
-- destructive operations). Never store raw tokens, passwords or full payloads.
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  workspace_id uuid references public.workspaces (id) on delete cascade,
  action text not null check (char_length(action) between 1 and 100),
  target_type text check (target_type is null or char_length(target_type) <= 50),
  target_id text check (target_id is null or char_length(target_id) <= 100),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index audit_logs_workspace_created_idx on public.audit_logs (workspace_id, created_at desc);

-- Invariant: every workspace has a valid (free by default) billing state.
-- SECURITY INVOKER: workspace rows are only ever inserted by the service role,
-- which bypasses RLS, so the trigger insert succeeds on any RLS-enabled database.
create or replace function public.create_default_subscription()
returns trigger
language plpgsql
as $$
begin
  insert into public.subscriptions (workspace_id)
  values (new.id)
  on conflict (workspace_id) do nothing;
  return new;
end;
$$;

create trigger workspaces_create_default_subscription
  after insert on public.workspaces
  for each row execute function public.create_default_subscription();
