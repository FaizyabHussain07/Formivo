-- Formivo: forms and submissions.
-- Ownership path: submissions -> forms -> workspaces -> owner.
-- Workspace ownership is never accepted from a client request; it is always
-- derived from these foreign keys.

create table public.forms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  status text not null default 'active' check (status in ('active', 'paused')),
  notification_email text
    check (notification_email is null or notification_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index forms_workspace_id_idx on public.forms (workspace_id);
create index forms_status_idx on public.forms (status);

create trigger forms_set_updated_at
  before update on public.forms
  for each row execute function public.set_updated_at();

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  source_origin text check (source_origin is null or char_length(source_origin) <= 512),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index submissions_form_id_idx on public.submissions (form_id);
create index submissions_form_created_idx on public.submissions (form_id, created_at desc);
create index submissions_form_status_created_idx on public.submissions (form_id, status, created_at desc);
create index submissions_created_at_idx on public.submissions (created_at desc);

create trigger submissions_set_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();
