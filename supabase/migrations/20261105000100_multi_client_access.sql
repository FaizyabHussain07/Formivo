-- Formivo: allow more than one client viewer per form.
--
-- The original schema enforced "at most one ACTIVE client permission per form"
-- (partial unique index + ACTIVE_CLIENT_EXISTS in the acceptance function). Plan
-- limits advertise 3 / 10 / 50 client viewers, so a single-viewer form made the
-- paid tiers' viewer allowance unreachable: the second invitation always failed.
--
-- Access is still scoped per (form, client_user_id) by the remaining unique index,
-- and the workspace-wide viewer count is still capped by the plan limit passed in
-- from the server. Nothing here widens read access: a client only ever sees forms
-- with an active permission of their own.

drop index if exists public.form_client_permissions_active_form_uniq;

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
    -- The workspace-wide viewer allowance is the plan limit, not one client per form.
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

revoke execute on function app_private.accept_client_invitation(text, uuid, text, integer)
  from public, anon, authenticated;
grant execute on function app_private.accept_client_invitation(text, uuid, text, integer)
  to service_role;
