# Formivo

Formivo is a developer-first form backend: a **public submission endpoint per form**, secure
submission storage, a dashboard for triaging leads, and read-only client access. The public
endpoint requires **only the form ID** — no API key, secret or token.

The product requirements live in [`FORMIVO_PRD_v3.md`](FORMIVO_PRD_v3.md), with detailed specs in
[`product-documentations/`](product-documentations/). The application is implemented end to end:
authentication, workspaces, forms, public submissions, lead management, analytics, invitations and
client portal, billing entitlements, Resend email and Lemon Squeezy webhooks.

## Stack

- Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript (strict)
- Tailwind CSS 4 with semantic light/dark tokens in `src/app/globals.css`
- Supabase (PostgreSQL, Auth, RLS) via `@supabase/ssr`
- Zod validation · Lucide icons
- Vitest + Testing Library (unit/database) · Playwright (E2E)
- ESLint (flat config) · Prettier (+ Tailwind class sorting)

## Getting started

```bash
nvm use            # Node 24 (minimum 20.9)
npm ci
cp .env.example .env.local   # fill in the values you need
npm run dev
```

Open http://localhost:3000. Health check: `GET /api/health`.

Supabase Auth redirect allow-list must include `<app>/auth/callback` (and localhost variants).
For invitation emails, verify the sender domain in Resend. For billing, point the Lemon Squeezy
webhook at `<app>/api/webhooks/lemonsqueezy` and set the signing secret.

## Public submission endpoint

```http
POST /api/f/{formId}
Content-Type: application/json | application/x-www-form-urlencoded | multipart/form-data
```

No `Authorization` header. HTML form action, browser `fetch`, cURL, PHP or any HTTP client work.
Example:

```html
<form action="https://your-app.com/api/f/YOUR_FORM_ID" method="POST">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```

Controls on the public path:

- form lifecycle (`active` / `paused`), monthly plan quota enforced atomically in the database
- 256 KB body, field count/name/value/nesting limits, JSON/form/multipart parsing (no files)
- content-type and JSON validation with structured error codes
- database-backed fixed-window rate limits per form, per IP and per form+IP (shared across
  instances), `429` + `Retry-After`
- optional per-form browser origin allow-list (CORS + `Origin` rejection); documented as a browser
  control, not authentication
- optional `Idempotency-Key` (header or `_idempotency_key` field) so retries never duplicate leads
- honeypot fields (`_gotcha` / `_honey`) stored nowhere
- safe HTML success page, optional `_redirect`, or JSON `201`/`200`
- public callers can only create submissions — never read them

Stored submissions require an authenticated dashboard session and are scoped to the signed-in
workspace; Supabase RLS enforces the same boundary at the database level.

## Scripts

| Command             | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Start the dev server                                 |
| `npm run build`     | Production build                                     |
| `npm run start`     | Serve the production build                           |
| `npm run lint`      | ESLint, zero warnings allowed                        |
| `npm run format`    | Format with Prettier (`format:check` to verify only) |
| `npm run typecheck` | Generate Next.js route types, then `tsc --noEmit`    |
| `npm run test`      | Unit, API-shape and database/RLS tests (Vitest)      |
| `npm run test:e2e`  | E2E tests (Playwright; runs against `npm run start`) |
| `npm run check`     | lint + format check + typecheck + unit tests + build |

## Environment variables

Documented in [`.env.example`](.env.example) and validated with Zod in `src/lib/env/`. Variables are
optional for the public shell; provider-backed features report an explicit "not configured" state.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `INVITATION_TOKEN_PEPPER` (min 32 chars; hashes invitation tokens)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (invitation email)
- `LEMONSQUEEZY_*` (checkout, portal and webhook)
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ENVIRONMENT`, `CRON_SECRET`

Secrets are server-only and validated through `server-only` modules. Validation messages name the
variable, never its value.

## Project structure

```
src/
  app/
    (marketing)/   public site: /, /docs, /pricing, /contact, /privacy, /terms
    (auth)/        signup, login, forgot/reset password + server actions
    (developer)/   dashboard, forms, submissions, analytics, clients, billing, settings
    client/        read-only client portal for shared forms
    invite/[token] invitation acceptance
    api/f/[formId] public submission endpoint (HTML, JSON, CORS)
    api/webhooks/  Lemon Squeezy webhook
    auth/callback  Supabase code exchange + account bootstrap
  components/      UI primitives, layout, auth/forms/clients/billing/settings components
  lib/
    auth/          session + developer/client context (server-only)
    billing/       plans, entitlements, Lemon Squeezy checkout + webhook verification
    forms/         form CRUD, origins policy
    submissions/   public intake pipeline, validation, queries, analytics
    invitations/   hashed, single-use invitations and access revocation
    email/         Resend delivery + invitation template
    security/      token generation and HMAC hashing
    supabase/      session client, service-role admin client, Database types
supabase/migrations/   schema, RLS, transaction-safe RPCs
tests/                 unit/API-shape tests, database + RLS suites
e2e/                   Playwright specs
```

## Database

Supabase project `formivo` (ref `qpugqjjjxwusccsfbpon`, eu-central-1). Schema, RLS model and
transaction-safe functions are documented in [`docs/database.md`](docs/database.md). Migrations are
applied and tracked; `npm test` applies every migration to an embedded Postgres and runs the
cross-user/cross-role authorization matrix plus endpoint-model invariants.

## Verification

```bash
npm run check        # lint, format, types, tests, production build
npm run build && npx playwright install chromium && npm run test:e2e
```

The endpoint was also exercised against the live Supabase project: 201 create, 200 idempotent
replay with the same lead, 409 idempotency conflict, 404 unknown form, 409 paused form, 413/415
size/content-type rejection, 403 disallowed origin, 429 rate limiting, and a single stored lead with
correct monthly usage.
