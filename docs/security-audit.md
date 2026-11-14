# Security audit — Phase 1

Scope: Formivo application (`src/`), Supabase schema and RLS (`supabase/migrations/`), public
submission endpoint, invitation/client portal flow, billing webhooks and deployment headers.

Method: source review of every authorization path, database policy review, live header inspection
against a production build, dependency audit, and the existing migration/RLS test harness
(`npm test`, which applies all migrations to an embedded Postgres and exercises cross-user and
cross-role access).

Date: 2026-11-05. This is a point-in-time review of this repository, not a claim that the
application is free of vulnerabilities.

## Findings

| #   | Severity | Finding                                                                                                                                                                              | Status |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 1   | High     | A partial unique index plus `ACTIVE_CLIENT_EXISTS` capped each form to one client, so the advertised viewer allowances (3/10/50) were unreachable and every second invitation failed | Fixed  |
| 2   | High     | The public endpoint's rate-limit bucket came from the leftmost `x-forwarded-for` entry, which a caller controls; rotating it bypassed the per-IP and per-form-IP limits              | Fixed  |
| 3   | Medium   | A cancelled subscription dropped to the free plan immediately, removing access the customer had already paid for until period end                                                    | Fixed  |
| 4   | Medium   | Submission quota used a calendar month while billing renews on the subscription anniversary, so usage and invoicing cycles disagreed                                                 | Fixed  |
| 5   | Medium   | Only four security headers were sent: no CSP, no HSTS, no COOP, no DNS-prefetch control                                                                                              | Fixed  |
| 6   | Medium   | Authenticated routes had no explicit cache policy; a shared cache could have stored dashboard HTML                                                                                   | Fixed  |
| 7   | Low      | The `_subject` email helper was stored as the submission's `source_origin`, so user input reached a provenance field                                                                 | Fixed  |
| 8   | Medium   | Submission export is a new paid feature; no export route exists yet, so there is nothing to gate. It must be built with server-side entitlement checks, never UI-only                | Open   |
| 9   | Medium   | CSP still needs `'unsafe-inline'` for scripts and styles because Next.js streams inline bootstrap scripts. Moving to a nonce-based policy is a follow-up with real breakage risk     | Open   |
| 10  | Low      | `/invite/[token]` calls account bootstrap before validating the token, so a brand-new signup arriving on a broken invite link can still be assigned the client role                  | Open   |
| 11  | Info     | All moderate `npm audit` findings are lint tooling (`minimatch` ReDoS via `typescript-eslint`); production dependencies report 0 vulnerabilities                                     | Info   |

## What was verified, not assumed

- **RLS model**: profiles and workspaces are self-scoped; forms are owner-scoped with a separate
  client policy; submissions are readable only through `can_view_form` (owner or active client
  permission) and writable only by the owner; roles, invitations, usage and billing writes are
  service-role only; `webhook_events` and `audit_logs` have no policies. Every table has RLS
  enabled.
- **Client isolation**: the portal derives the form list from the caller's own active permissions,
  and submission detail re-authorizes the form before loading the row, so a modified `submissionId`
  or `formId` resolves to `notFound()` rather than another client's data. The suite exercises this
  with two clients, revoked permissions and cross-workspace reads.
- **Service role**: every server module that uses it (`src/lib/auth/viewer.ts`,
  `src/lib/submissions/*`, `src/lib/invitations/service.ts`, `src/lib/forms/service.ts`,
  `src/lib/billing/*`) authorizes against `auth.uid()`-derived identity or the verified relation
  chain before querying; ownership is never read from a request body.
- **Webhook**: HMAC-SHA256 compared with `timingSafeEqual`, events deduplicated by provider event
  id, entitlements only ever written from a verified event, and no checkout redirect mutates
  billing.
- **Invitations**: tokens are stored as HMAC hashes only, single-use, expiring, email-matched during
  acceptance, and revocable; resending rotates the token.
- **Public endpoint**: UUID-gated, 256 KB body cap, field/value/depth limits, honeypot short-circuit,
  idempotency keys, per-form/IP/IP+form fixed-window limits in the database, quota enforced inside
  the same transaction as the insert, and structured error codes that never reveal schema details.
- **Live headers** (production build on a local port): CSP, HSTS, `X-Frame-Options: DENY`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP;
  `/dashboard` responds `307` with `Cache-Control: private, no-store, max-age=0`.
- **CSP compatibility**: the landing page renders and hydrates under the policy (theme toggle
  switches `data-theme`), with no console errors.

## Changes in this phase

- `supabase/migrations/20261105000100_multi_client_access.sql` — drops the single-active-client
  index and recreates `accept_client_invitation` without `ACTIVE_CLIENT_EXISTS`; the workspace-wide
  viewer cap and the per-(form, client) uniqueness remain.
- `src/lib/invitations/service.ts` — "already has access" is now evaluated per invited email
  instead of per form.
- `src/lib/api/response.ts` — `clientIp()` prefers platform-set headers and the rightmost forwarded
  hop.
- `src/lib/billing/entitlements.ts` — entitlement grace for `cancelled` until `current_period_end`;
  usage window follows the provider billing cycle with a calendar-month fallback.
- `src/lib/submissions/service.ts` — intake uses the same usage window as entitlements.
- `next.config.ts` — CSP, HSTS, COOP, DNS-prefetch control, and explicit `private, no-store` for
  authenticated areas.
- `src/app/api/f/[formId]/route.ts` — `source_origin` is the request origin only.
- Tests: multi-client sharing, per-client isolation, the removal of the single-viewer cap, and
  spoofed-forwarding-header resistance (`tests/api/client-ip.test.ts`).

## Remaining risks

1. **Export entitlement** — implement with a server-side check (`planKey` from verified billing
   state) plus the per-form client permission; a free workspace must be refused even with a crafted
   request.
2. **Nonce-based CSP** — until then, inline script execution is allowed by policy.
3. **Invite-link bootstrap ordering** — validate the token before role assignment so a broken link
   cannot create a client-only account.
4. **Operational** — rate limits and audit logs are database-backed and shared, but there is no
   alerting on abuse patterns; `console.warn` is the only signal today.
5. **Manual configuration** — production must set `NEXT_PUBLIC_APP_URL`, Supabase redirect URLs,
   the Resend sender domain, and the Paddle webhook secret; these are outside the repo.
