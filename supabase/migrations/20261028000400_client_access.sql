-- Formivo: client invitations and form-level client permissions.
-- Security requirements (PRD §13):
--   * invitation tokens are stored only as hashes
--   * a form has at most one ACTIVE client permission (partial unique index)
--   * acceptance is performed by the transaction-safe app_private.accept_client_invitation

create table public.client_invitations (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  invited_email text not null
    check (invited_email = lower(btrim(invited_email)) and char_length(invited_email) between 3 and 254),
  token_hash text not null unique check (char_length(token_hash) >= 32),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  invited_by_user_id uuid not null references auth.users (id),
  expires_at timestamptz not null,
  accepted_by_user_id uuid references auth.users (id),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint client_invitations_expiry check (expires_at > created_at),
  -- An accepted invitation always records who accepted it and when.
  constraint client_invitations_accepted_invariant check (
    (status = 'accepted' and accepted_by_user_id is not null and accepted_at is not null)
    or status <> 'accepted'
  )
);

-- At most one active (pending) invitation per form and email.
create unique index client_invitations_pending_form_email_uniq
  on public.client_invitations (form_id, invited_email)
  where status = 'pending';

create index client_invitations_form_id_idx on public.client_invitations (form_id);
create index client_invitations_email_idx on public.client_invitations (invited_email);
create index client_invitations_expires_at_idx on public.client_invitations (expires_at);

create table public.form_client_permissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  client_user_id uuid not null references auth.users (id) on delete cascade,
  invitation_id uuid references public.client_invitations (id),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

-- One row per (form, client); re-granting reactivates the existing row.
create unique index form_client_permissions_form_user_uniq
  on public.form_client_permissions (form_id, client_user_id);

-- PRD §13.10: at most one ACTIVE client account per form, enforced in the database.
create unique index form_client_permissions_active_form_uniq
  on public.form_client_permissions (form_id)
  where revoked_at is null;

create index form_client_permissions_user_idx on public.form_client_permissions (client_user_id);
create index form_client_permissions_form_idx on public.form_client_permissions (form_id);
