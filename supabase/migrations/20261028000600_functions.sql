-- Formivo: authorization helpers and transaction-safe privileged functions.
--
-- Helpers (has_role, is_workspace_owner, owns_form, can_view_form) are called from
-- RLS policies, so they are SECURITY DEFINER (they read tables whose own RLS would
-- otherwise recurse) and executable by API roles.
--
-- Privileged functions are executable by the service role only. They are never
-- exposed through PostgREST because the app_private schema is not in the exposed
-- schema list, and EXECUTE is revoked from anon/authenticated as defense in depth.
-- The server performs its own authorization before calling them (PRD §8, §19).

create schema if not exists app_private;

grant usage on schema app_private to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------

create or replace function app_private.has_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.account_roles r
    where r.role = p_role
      and r.user_id = auth.uid()
  );
$$;

create or replace function app_private.is_workspace_owner(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspaces w
    where w.id = p_workspace_id
      and w.owner_user_id = auth.uid()
  );
$$;

create or replace function app_private.owns_form(p_form_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.forms f
    join public.workspaces w on w.id = f.workspace_id
    where f.id = p_form_id
      and w.owner_user_id = auth.uid()
  );
$$;

-- View access = workspace owner OR holder of an active client permission.
create or replace function app_private.can_view_form(p_form_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.forms f
      join public.workspaces w on w.id = f.workspace_id
      where f.id = p_form_id
        and w.owner_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.form_client_permissions p
      where p.form_id = p_form_id
        and p.client_user_id = auth.uid()
        and p.revoked_at is null
    );
$$;

grant execute on function app_private.has_role(text) to anon, authenticated, service_role;
grant execute on function app_private.is_workspace_owner(uuid) to anon, authenticated, service_role;
grant execute on function app_private.owns_form(uuid) to anon, authenticated, service_role;
grant execute on function app_private.can_view_form(uuid) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Developer account initialization (used by signup in Phase 3).
-- Creates profile + developer role + workspace + default subscription atomically.
-- Idempotent: safe to call again for the same user.
-- ---------------------------------------------------------------------------

create or replace function app_private.initialize_developer_account(
  p_user_id uuid,
  p_email text,
  p_display_name text default null,
  p_workspace_name text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_display text := btrim(coalesce(p_display_name, ''));
  v_workspace_name text := btrim(coalesce(p_workspace_name, ''));
  v_workspace_id uuid;
  v_slug text;
  v_created boolean := false;
begin
  if p_user_id is null or v_email = '' then
    raise exception 'INVALID_ARGUMENTS';
  end if;

  if v_display = '' then
    v_display := split_part(v_email, '@', 1);
  end if;
  if v_workspace_name = '' then
    v_workspace_name := v_display || '''s workspace';
  end if;
  v_workspace_name := left(v_workspace_name, 80);

  insert into public.profiles (id, display_name)
  values (p_user_id, left(v_display, 100))
  on conflict (id) do nothing;

  insert into public.account_roles (user_id, role)
  values (p_user_id, 'developer')
  on conflict (user_id, role) do nothing;

  select w.id into v_workspace_id
  from public.workspaces w
  where w.owner_user_id = p_user_id;

  if v_workspace_id is null then
    v_slug := regexp_replace(lower(v_workspace_name), '[^a-z0-9]+', '-', 'g');
    v_slug := trim(both '-' from v_slug);
    if v_slug = '' then
      v_slug := 'workspace';
    end if;
    v_slug := left(v_slug, 60) || '-' || substr(md5(v_email || gen_random_uuid()::text), 1, 6);

    insert into public.workspaces (owner_user_id, name, slug)
    values (p_user_id, v_workspace_name, v_slug)
    returning id into v_workspace_id;
    v_created := true;
  end if;

  return jsonb_build_object('ok', true, 'workspace_id', v_workspace_id, 'workspace_created', v_created);
end;
$$;

-- ---------------------------------------------------------------------------
-- Client invitation acceptance (used by Phase 5).
-- Transaction-safe and idempotent per PRD §13.6. p_user_id comes from the
-- authenticated session; p_user_email must match the invited email exactly
-- (normalized lowercase). p_max_viewers is the caller's plan limit.
-- ---------------------------------------------------------------------------

create or replace function app_private.accept_client_invitation(
  p_token_hash text,
  p_user_id uuid,
  p_user_email text,
  p_max_viewers integer
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_invitation public.client_invitations%rowtype;
  v_permission public.form_client_permissions%rowtype;
  v_email text := lower(btrim(coalesce(p_user_email, '')));
  v_workspace_id uuid;
  v_other_viewers integer;
begin
  if p_token_hash is null or p_user_id is null or v_email = '' then
    raise exception 'INVALID_ARGUMENTS';
  end if;

  select * into v_invitation
  from public.client_invitations ci
  where ci.token_hash = p_token_hash
  for update;

  if not found then
    raise exception 'INVITATION_NOT_FOUND';
  end if;

  -- Idempotent re-acceptance by the same, email-matched user.
  if v_invitation.status = 'accepted' then
    if v_invitation.accepted_by_user_id = p_user_id and v_invitation.invited_email = v_email then
      return jsonb_build_object(
        'ok', true,
        'already_accepted', true,
        'invitation_id', v_invitation.id,
        'form_id', v_invitation.form_id
      );
    end if;
    raise exception 'INVITATION_ALREADY_ACCEPTED';
  end if;

  if v_invitation.status = 'revoked' then
    raise exception 'INVITATION_REVOKED';
  end if;

  if v_invitation.status = 'expired' or v_invitation.expires_at <= now() then
    raise exception 'INVITATION_EXPIRED';
  end if;

  if v_invitation.invited_email <> v_email then
    raise exception 'EMAIL_MISMATCH';
  end if;

  -- Workspace derived from the trusted relation form_id -> forms.workspace_id.
  select f.workspace_id into v_workspace_id
  from public.forms f
  where f.id = v_invitation.form_id;

  if v_workspace_id is null then
    raise exception 'FORM_NOT_FOUND';
  end if;

  select * into v_permission
  from public.form_client_permissions fcp
  where fcp.form_id = v_invitation.form_id
    and fcp.client_user_id = p_user_id;

  if v_permission.id is not null and v_permission.revoked_at is null then
    -- Access is already active: only finalize the invitation record.
    null;
  else
    if exists (
      select 1
      from public.form_client_permissions fcp
      where fcp.form_id = v_invitation.form_id
        and fcp.revoked_at is null
        and fcp.client_user_id <> p_user_id
    ) then
      raise exception 'ACTIVE_CLIENT_EXISTS';
    end if;

    select count(distinct fcp.client_user_id) into v_other_viewers
    from public.form_client_permissions fcp
    join public.forms f on f.id = fcp.form_id
    where f.workspace_id = v_workspace_id
      and fcp.revoked_at is null
      and fcp.client_user_id <> p_user_id;

    if v_other_viewers >= coalesce(p_max_viewers, 2147483647) then
      raise exception 'VIEWER_LIMIT_REACHED';
    end if;

    insert into public.account_roles (user_id, role)
    values (p_user_id, 'client')
    on conflict (user_id, role) do nothing;

    if v_permission.id is not null then
      update public.form_client_permissions fcp
      set revoked_at = null,
          granted_at = now(),
          invitation_id = v_invitation.id
      where fcp.id = v_permission.id;
    else
      insert into public.form_client_permissions (form_id, client_user_id, invitation_id)
      values (v_invitation.form_id, p_user_id, v_invitation.id);
    end if;
  end if;

  update public.client_invitations ci
  set status = 'accepted',
      accepted_by_user_id = p_user_id,
      accepted_at = now()
  where ci.id = v_invitation.id;

  insert into public.audit_logs (actor_user_id, workspace_id, action, target_type, target_id, metadata)
  values (
    p_user_id,
    v_workspace_id,
    'invitation.accepted',
    'form',
    v_invitation.form_id::text,
    jsonb_build_object('invitation_id', v_invitation.id)
  );

  return jsonb_build_object(
    'ok', true,
    'already_accepted', false,
    'invitation_id', v_invitation.id,
    'form_id', v_invitation.form_id
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Submission intake with concurrency-safe usage accounting (used by Phase 4).
-- The workspace is derived from the form row; nothing about ownership, plan or
-- usage is accepted from the public request. One call = one submission = one
-- increment, all in a single transaction (atomic rollback on limit).
-- ---------------------------------------------------------------------------

create or replace function app_private.record_submission(
  p_form_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_max_submissions integer,
  p_data jsonb,
  p_source_origin text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_form public.forms%rowtype;
  v_usage_id uuid;
  v_count integer;
  v_submission_id uuid;
begin
  if p_form_id is null or p_period_start is null or p_period_end is null then
    raise exception 'INVALID_ARGUMENTS';
  end if;

  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'INVALID_PAYLOAD';
  end if;

  select * into v_form
  from public.forms f
  where f.id = p_form_id;

  if not found then
    raise exception 'FORM_NOT_FOUND';
  end if;

  if v_form.status <> 'active' then
    raise exception 'FORM_PAUSED';
  end if;

  insert into public.usage_periods (workspace_id, period_start, period_end)
  values (v_form.workspace_id, p_period_start, p_period_end)
  on conflict (workspace_id, period_start, period_end) do nothing;

  select up.id into v_usage_id
  from public.usage_periods up
  where up.workspace_id = v_form.workspace_id
    and up.period_start = p_period_start
    and up.period_end = p_period_end;

  -- Locked increment: concurrent requests serialize here, so the limit cannot
  -- be bypassed and one submission can never be double counted.
  update public.usage_periods up
  set submission_count = submission_count + 1
  where up.id = v_usage_id
    and up.submission_count < coalesce(p_max_submissions, 2147483647)
  returning up.submission_count into v_count;

  if v_count is null then
    raise exception 'SUBMISSION_LIMIT_REACHED';
  end if;

  insert into public.submissions (form_id, data, source_origin)
  values (p_form_id, p_data, p_source_origin)
  returning id into v_submission_id;

  return jsonb_build_object(
    'ok', true,
    'submission_id', v_submission_id,
    'usage_count', v_count,
    'usage_limit', p_max_submissions
  );
end;
$$;

-- Privileged functions: service role only. Revoke PUBLIC's default EXECUTE
-- everywhere, then revoke the API roles on the privileged three, then grant them
-- back to service_role. The explicit helper grants above are unaffected.
revoke execute on all functions in schema app_private from public;
revoke execute on function app_private.initialize_developer_account(uuid, text, text, text) from anon, authenticated;
revoke execute on function app_private.accept_client_invitation(text, uuid, text, integer) from anon, authenticated;
revoke execute on function app_private.record_submission(uuid, timestamptz, timestamptz, integer, jsonb, text) from anon, authenticated;
grant execute on function app_private.initialize_developer_account(uuid, text, text, text) to service_role;
grant execute on function app_private.accept_client_invitation(text, uuid, text, integer) to service_role;
grant execute on function app_private.record_submission(uuid, timestamptz, timestamptz, integer, jsonb, text) to service_role;
