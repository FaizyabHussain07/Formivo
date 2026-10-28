-- Formivo: Row Level Security.
--
-- Model:
--   * developers see only data whose ownership path leads to their workspace,
--   * clients see only forms with an ACTIVE permission for their user id,
--   * roles, invitations, usage, billing writes and audit logs are service-role only,
--   * every table has RLS enabled; tables without policies are service-role only.
--
-- Policies target the `authenticated` role. The `anon` role gets no access to
-- application tables (the public submission endpoint uses the service role from
-- the server). The service role bypasses RLS and must authorize explicitly.

alter table public.profiles enable row level security;
alter table public.account_roles enable row level security;
alter table public.workspaces enable row level security;
alter table public.forms enable row level security;
alter table public.submissions enable row level security;
alter table public.client_invitations enable row level security;
alter table public.form_client_permissions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_periods enable row level security;
alter table public.webhook_events enable row level security;
alter table public.audit_logs enable row level security;

-- profiles: read and update your own profile only. Profile rows are created by
-- trusted server logic; roles live in account_roles and are never writable here.
create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- account_roles: no policies on purpose. Only trusted server-side logic
-- (service role / app_private functions) can read or write roles, so a user can
-- never self-promote through a profile update or request payload.

-- workspaces: owners can read and rename their workspace. Creation happens
-- through trusted server logic only (no insert/delete policies).
create policy workspaces_select_own
  on public.workspaces for select
  to authenticated
  using (owner_user_id = auth.uid());

create policy workspaces_update_own
  on public.workspaces for update
  to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- forms: owner-managed, and creation additionally requires the developer role.
-- NOTE: the select policy checks workspace ownership via workspace_id rather than
-- owns_form(id): during INSERT ... RETURNING the new row is not yet visible to
-- subqueries running inside the same statement's snapshot, so a row lookup by id
-- would fail policy visibility for the RETURNING clause.
create policy forms_select_owner
  on public.forms for select
  to authenticated
  using (app_private.is_workspace_owner(workspace_id));

-- Clients can list exactly the forms shared with them (active permission only).
-- The outer table reference must be qualified: an unqualified `id` inside the
-- subquery would bind to p.id and silently never match.
create policy forms_select_shared_client
  on public.forms for select
  to authenticated
  using (
    exists (
      select 1
      from public.form_client_permissions p
      where p.form_id = forms.id
        and p.client_user_id = auth.uid()
        and p.revoked_at is null
    )
  );

create policy forms_insert_developer
  on public.forms for insert
  to authenticated
  with check (
    app_private.is_workspace_owner(workspace_id)
    and app_private.has_role('developer')
  );

create policy forms_update_owner
  on public.forms for update
  to authenticated
  using (app_private.owns_form(id))
  with check (app_private.owns_form(id));

create policy forms_delete_owner
  on public.forms for delete
  to authenticated
  using (app_private.owns_form(id));

-- submissions: developers manage submissions of their own forms; clients read
-- submissions of shared forms. Inserts only ever happen through the public
-- submission endpoint (service role), so there is no insert policy.
create policy submissions_select_viewer
  on public.submissions for select
  to authenticated
  using (app_private.can_view_form(form_id));

create policy submissions_update_owner
  on public.submissions for update
  to authenticated
  using (app_private.owns_form(form_id))
  with check (app_private.owns_form(form_id));

-- No delete policy: submissions are archived, not destroyed (PRD §12.6).

-- client_invitations: developers read invitations for their own forms.
-- Creation, resend and revocation go through trusted server logic only, because
-- tokens and lifecycle transitions must be handled transactionally.
create policy client_invitations_select_owner
  on public.client_invitations for select
  to authenticated
  using (app_private.owns_form(form_id));

-- form_client_permissions: the client sees their own (active) grants; the
-- workspace owner sees grants on their forms. Writes are service-role only.
create policy form_client_permissions_select_self_or_owner
  on public.form_client_permissions for select
  to authenticated
  using (
    client_user_id = auth.uid()
    or app_private.owns_form(form_id)
  );

create policy form_client_permissions_update_owner
  on public.form_client_permissions for update
  to authenticated
  using (app_private.owns_form(form_id))
  with check (app_private.owns_form(form_id));

-- subscriptions / usage_periods: read-only for the workspace owner.
-- Billing writes happen exclusively through verified webhooks (service role).
create policy subscriptions_select_owner
  on public.subscriptions for select
  to authenticated
  using (app_private.is_workspace_owner(workspace_id));

create policy usage_periods_select_owner
  on public.usage_periods for select
  to authenticated
  using (app_private.is_workspace_owner(workspace_id));

-- webhook_events / audit_logs: no policies — operational tables, service role only.
