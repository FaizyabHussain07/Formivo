-- Formivo: Paddle billing provider and the Light plan.
--
-- Additive and non-destructive:
--   * widens the plan_key constraint so "light" can be stored;
--   * moves the provider default to Paddle for new rows;
--   * keeps existing Lemon Squeezy rows exactly as they are (provider, ids and
--     periods are historical records and are never rewritten by this migration);
--   * adds the small amount of state a Paddle subscription needs to be auditable.
--
-- Existing customers keep their current plan and billing period. Nothing is
-- downgraded by applying this migration.

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_key_check;

alter table public.subscriptions
  add constraint subscriptions_plan_key_check
  check (plan_key in ('free', 'light', 'pro', 'agency'));

alter table public.subscriptions
  alter column provider set default 'paddle';

-- Paddle identifies the price that was purchased, and a scheduled cancellation is
-- reported separately from the current status. Both are stored so entitlement
-- decisions never have to infer them from the provider at request time.
alter table public.subscriptions
  add column if not exists price_id text,
  add column if not exists scheduled_change_action text;

create index if not exists subscriptions_provider_customer_idx
  on public.subscriptions (provider, provider_customer_id)
  where provider_customer_id is not null;

-- Usage windows may follow a provider billing period, so a period can start
-- mid-month. The existing unique constraint already covers that.

comment on column public.subscriptions.price_id is
  'Provider price identifier (Paddle pri_...). Used to resolve the plan on renewal events.';
comment on column public.subscriptions.scheduled_change_action is
  'Paddle scheduled_change.action, for example cancel. Kept for audit and UI copy.';
