-- Formivo: core identity tables — profiles, account_roles, workspaces.
-- Roles live in account_roles (never in user-editable profile columns) so users
-- cannot self-promote by editing profile fields or request payloads.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.account_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('developer', 'client')),
  created_at timestamptz not null default now(),
  constraint account_roles_user_role_unique unique (user_id, role)
);

create index account_roles_user_id_idx on public.account_roles (user_id);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  slug text unique check (slug is null or char_length(slug) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- MVP decision (documented): exactly one workspace per developer.
create unique index workspaces_owner_unique_idx on public.workspaces (owner_user_id);

create trigger workspaces_set_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();
