# Formivo database

Schema, security model, and environment assumptions for the Supabase/PostgreSQL
backend (PRD §9, §19; specs in `product-documentations/04-data-model.md`).

The public submission endpoint is identified by the form UUID alone and requires no
secret. Form IDs are random, non-sequential UUIDs; they are public identifiers, not
credentials. Stored submissions remain private through dashboard authentication and RLS.

## Project

|              |                                                                        |
| ------------ | ---------------------------------------------------------------------- |
| Provider     | Supabase (PostgreSQL 15)                                               |
| Project name | `formivo`                                                              |
| Project ref  | `qpugqjjjxwusccsfbpon`                                                 |
| Region       | `eu-central-1`                                                         |
| URL          | `https://qpugqjjjxwusccsfbpon.supabase.co`                             |
| Migrations   | `supabase/migrations/*.sql` (applied and tracked in migration history) |

Application environment variables (see `.env.example`, set them in `.env.local`,
never commit them):

```env
NEXT_PUBLIC_SUPABASE_URL=https://qpugqjjjxwusccsfbpon.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Project Settings → API keys → anon public>
SUPABASE_SERVICE_ROLE_KEY=<Project Settings → API keys → service_role secret>
```

The repository never contains these keys; without them the app reports an
explicit "Supabase not configured" state instead of failing (see
`src/lib/env/integrations.ts`).

## Schema

| Table                     | Purpose                                          | RLS                                                          |
| ------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `profiles`                | Display name/avatar, keyed 1:1 to `auth.users`   | own rows only (read/update)                                  |
| `account_roles`           | `developer` / `client` roles                     | enabled, **no policies** — service-role only                 |
| `workspaces`              | Tenant; one per developer (MVP, unique on owner) | owner read/update only                                       |
| `forms`                   | Form config + endpoint identity                  | owner CRUD; active clients can read shared forms             |
| `submissions`             | Submitted data (`jsonb`)                         | owner + active client read; owner update (status); no delete |
| `client_invitations`      | Token-hashed invitations, status/expiry          | owner read only; writes via trusted RPC                      |
| `form_client_permissions` | Active client grants (one per form)              | self/owner read; owner update (revoke); writes via RPC       |
| `subscriptions`           | Normalized Lemon Squeezy state, default `free`   | owner read only; webhook writes (service role)               |
| `usage_periods`           | Concurrency-safe submission counters per window  | owner read only; increments via RPC                          |
| `webhook_events`          | Webhook replay protection                        | no policies — service-role only                              |
| `audit_logs`              | Security-relevant actions                        | no policies — service-role only                              |
| `submission_idempotency`  | Replay protection for public submissions         | enabled, no policies — service-role only                     |
| `rate_limit_buckets`      | Distributed fixed-window rate limiting           | enabled, no policies — service-role only                     |

Key constraints (all verified against the live project):

- `form_client_permissions_active_form_uniq` — **partial unique index** enforcing
  at most one active (non-revoked) client per form (PRD §13.10).
- `client_invitations_pending_form_email_uniq` — one pending invitation per
  form/email; `token_hash` is unique and never stores the raw token.
- `workspaces_owner_unique_idx` — one workspace per developer in the MVP.
- `usage_periods (workspace_id, period_start, period_end)` unique — increments
  lock the row, so concurrent requests cannot bypass submission limits.

## Transaction-safe functions (`app_private` schema)

| Function                                                       | Used by                         | Guarantee                                                                                                                                                            |
| -------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialize_developer_account`                                 | signup (Phase 3)                | profile + developer role + workspace + default subscription, atomic and idempotent                                                                                   |
| `accept_client_invitation`                                     | invitation acceptance (Phase 5) | locks the invitation, validates status/expiry/email, enforces one-active-client and viewer limits, grants role + permission, marks accepted — all in one transaction |
| `record_submission`                                            | public submission API (Phase 4) | derives workspace from the form, checks paused/limit, increments usage and inserts the submission atomically                                                         |
| `consume_rate_limit`                                           | public submission API           | atomic shared counter; raises `RATE_LIMITED` when the window cap is exceeded                                                                                         |
| `has_role`, `is_workspace_owner`, `owns_form`, `can_view_form` | RLS policies                    | `SECURITY DEFINER` helpers shared by every policy                                                                                                                    |

All privileged functions are `SECURITY DEFINER` with `search_path = ''`, and
EXECUTE is revoked from `anon`/`authenticated` (only `service_role` may call
them). The server performs its own authorization before calling them.

**PostgREST exposure:** `app_private` is not an exposed API schema. When the RPC
endpoints are first needed (Phase 4/5), expose it for the REST service once:

```sql
alter role authenticator set "pgrst.db_schemas" to 'public,graphql_public,storage,realtime,app_private';
notify pgrst, 'reload config';
```

EXECUTE privileges (not schema exposure) are what protect the functions, and
they are already revoked for API roles.

## Environment assumptions

1. `auth.users`, `auth.uid()`, and the `anon` / `authenticated` / `service_role`
   roles are provided by Supabase (never created by our migrations).
2. Supabase grants table privileges in `public` to the API roles by default;
   RLS policies then decide row visibility. The local harness reproduces this
   with `alter default privileges` (see `tests/db/harness.ts`).
3. The `postgres` role that runs migrations bypasses RLS, which is what lets
   `SECURITY DEFINER` functions insert into RLS-enabled tables (standard
   Supabase behavior for triggers/functions such as ours).
4. The public submission endpoint runs server-side with the service role; the
   browser never holds privileged keys.

## Verification

Two layers run on every `npm test`:

1. **`tests/db/migrations.test.ts`** — boots an embedded Postgres (PGlite),
   creates the Supabase contract (`auth` schema + roles), applies every file in
   `supabase/migrations/`, and asserts tables, RLS flags, foreign keys, unique
   indexes, and function privileges.
2. **`tests/db/rls.test.ts`** — the PRD §22.2 authorization matrix with real
   user switching: cross-workspace isolation, client form scoping, revocation,
   self-promotion attempts, invitation error paths, one-active-client-per-form,
   viewer/submission limits, and billing visibility.

Applying migrations to a real project:

- **This repository's project:** already applied (history listed above); new
  migrations are applied in order and verified with read-only queries.
- **A fresh project:** `supabase link --project-ref <ref>` then
  `supabase db push`, or paste the files into the SQL editor in filename order.

## Seed data

`supabase/seed.sql` contains **clearly fake demo data for local development
only** (`demo@example.com`, `Acme Demo`). Never run it against a real project.
