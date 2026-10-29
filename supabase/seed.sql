-- ============================================================================
-- LOCAL DEVELOPMENT SEED ONLY — NEVER RUN THIS ON A REAL PROJECT.
--
-- All data below is clearly fake (demo@example.com / Acme Demo) and exists only
-- to make `supabase start` usable for manual testing. It contains no secrets.
-- ============================================================================

do $$
declare
  v_user_id uuid;
  v_workspace_id uuid;
  v_form_id uuid;
begin
  select id into v_user_id from auth.users where email = 'demo@example.com' limit 1;

  if v_user_id is null then
    v_user_id := gen_random_uuid();
    insert into auth.users (id, email) values (v_user_id, 'demo@example.com');
  end if;

  insert into public.profiles (id, display_name)
  values (v_user_id, 'Demo Developer')
  on conflict (id) do nothing;

  insert into public.account_roles (user_id, role)
  values (v_user_id, 'developer')
  on conflict (user_id, role) do nothing;

  insert into public.workspaces (owner_user_id, name, slug)
  values (v_user_id, 'Acme Demo', 'acme-demo')
  on conflict do nothing;

  select w.id into v_workspace_id from public.workspaces w
  where w.owner_user_id = v_user_id;

  if v_workspace_id is not null then
    insert into public.forms (workspace_id, name, description)
    values (v_workspace_id, 'Website contact form', 'Local demo form')
    on conflict do nothing;

    select f.id into v_form_id from public.forms f
    where f.workspace_id = v_workspace_id order by f.created_at limit 1;

    if v_form_id is not null and not exists (
      select 1 from public.submissions s where s.form_id = v_form_id
    ) then
      insert into public.submissions (form_id, data)
      values
        (v_form_id, '{"name": "John Doe", "email": "john@example.com", "message": "Hello!"}'::jsonb),
        (v_form_id, '{"name": "Jane Roe", "email": "jane@example.com", "message": "Interested in your service."}'::jsonb);
    end if;
  end if;
end
$$;
