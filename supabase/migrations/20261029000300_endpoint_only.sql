-- Formivo: endpoint-only public submissions.
--
-- The public submission endpoint is identified by the form id alone. Form ids are
-- random UUIDs, not credentials, and the endpoint is documented as public. Stored
-- submissions stay private behind dashboard auth + RLS.
--
-- Secret columns from the earlier design are dropped: no credential is generated,
-- stored or displayed for public form submissions.

alter table public.forms drop column if exists secret_hash;
alter table public.forms drop column if exists secret_last_four;

-- Optional per-form browser origin allow-list lives in forms.settings
-- (settings.allowed_origins = ["https://example.com", ...]). No schema change is
-- needed; the server validates and normalizes the values.
