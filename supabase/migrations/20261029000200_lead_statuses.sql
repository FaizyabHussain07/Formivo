-- Formivo: lead statuses, submission metadata, and metadata-aware intake.
--
-- The product uses five lead states; the original schema shipped three.
-- Submission metadata (source/page/referrer) is kept separate from form data so
-- client-defined fields are never mixed with Formivo context.

alter table public.submissions drop constraint if exists submissions_status_check;
alter table public.submissions
  add constraint submissions_status_check
  check (status in ('new', 'read', 'contacted', 'qualified', 'converted', 'archived'));

alter table public.submissions
  add column if not exists metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object');

-- Recreate the intake primitive with metadata. Dropping first because adding a
-- parameter creates a new overload rather than replacing the old signature.
drop function if exists public.api_record_submission(uuid, timestamptz, timestamptz, integer, jsonb, text);
drop function if exists app_private.record_submission(uuid, timestamptz, timestamptz, integer, jsonb, text);

create or replace function app_private.record_submission(
  p_form_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_max_submissions integer,
  p_data jsonb,
  p_source_origin text default null,
  p_metadata jsonb default '{}'::jsonb
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
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
begin
  if p_form_id is null or p_period_start is null or p_period_end is null then
    raise exception 'INVALID_ARGUMENTS';
  end if;

  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'INVALID_PAYLOAD';
  end if;

  if jsonb_typeof(v_metadata) <> 'object' then
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

  update public.usage_periods up
  set submission_count = submission_count + 1
  where up.id = v_usage_id
    and up.submission_count < coalesce(p_max_submissions, 2147483647)
  returning up.submission_count into v_count;

  if v_count is null then
    raise exception 'SUBMISSION_LIMIT_REACHED';
  end if;

  insert into public.submissions (form_id, data, metadata, source_origin)
  values (p_form_id, p_data, v_metadata, p_source_origin)
  returning id into v_submission_id;

  return jsonb_build_object(
    'ok', true,
    'submission_id', v_submission_id,
    'usage_count', v_count,
    'usage_limit', p_max_submissions
  );
end;
$$;

create or replace function public.api_record_submission(
  p_form_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_max_submissions integer,
  p_data jsonb,
  p_source_origin text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language sql
volatile
security definer
set search_path = ''
as $$
  select app_private.record_submission(
    p_form_id, p_period_start, p_period_end, p_max_submissions, p_data, p_source_origin, p_metadata
  );
$$;

revoke execute on function app_private.record_submission(uuid, timestamptz, timestamptz, integer, jsonb, text, jsonb) from public, anon, authenticated;
revoke execute on function public.api_record_submission(uuid, timestamptz, timestamptz, integer, jsonb, text, jsonb) from public, anon, authenticated;
grant execute on function app_private.record_submission(uuid, timestamptz, timestamptz, integer, jsonb, text, jsonb) to service_role;
grant execute on function public.api_record_submission(uuid, timestamptz, timestamptz, integer, jsonb, text, jsonb) to service_role;
