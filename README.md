# Formivo

**The form backend for developers who ship for clients.**

[formivo.faizyab.me](https://formivo.faizyab.me) · [Documentation](https://formivo.faizyab.me/docs) · [Pricing](https://formivo.faizyab.me/pricing)

[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

Formivo connects the forms you already have to a backend you don't have to build. Create a form,
copy its public endpoint, point any HTML form or HTTP client at it, and manage the submissions in a
dashboard — then share a single form with your client, read-only.

No API keys. No secret rotation. No form builder to learn.

---

## Why Formivo

- **One public endpoint per form.** `POST /api/f/{formId}` accepts `application/json`,
  `application/x-www-form-urlencoded` and `multipart/form-data` (no files).
- **Validation and abuse control included.** Body/field/nesting limits, structured error codes,
  distributed rate limits, honeypot fields, idempotent retries and a per-form pause switch.
- **Submissions stay private.** The endpoint can write; only an authenticated workspace member (or
  an invited client viewer) can read. Row Level Security enforces the same boundary in Postgres.
- **Client-ready.** Invite a client to exactly one form. Their account gets a client role — a
  read-only portal, never a workspace of their own.
- **Simple plans.** Free (3 forms · 300 submissions/month · 3 viewers), Pro ($19 · 10 · 2,000 · 10)
  and Agency ($49 · 50 · 10,000 · 50). Quotas are enforced server-side, atomically.
- **Light by default, dark on request.** One semantic token set across marketing, auth, dashboard
  and the client portal.

## Endpoint contract

```http
POST https://formivo.faizyab.me/api/f/{formId}
```

```html
<form action="https://formivo.faizyab.me/api/f/YOUR_FORM_ID" method="POST">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```

```js
await fetch("https://formivo.faizyab.me/api/f/YOUR_FORM_ID", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, message }),
});
```

| Status | Meaning                                                         |
| ------ | --------------------------------------------------------------- |
| `200`  | HTML submission accepted (thank-you page or `_redirect` target) |
| `201`  | JSON submission accepted — returns `{ success, leadId }`        |
| `400`  | Invalid or malformed payload                                    |
| `404`  | Unknown form                                                    |
| `409`  | Form paused, or the monthly quota is exhausted                  |
| `413`  | Body larger than 256 KB                                         |
| `415`  | Unsupported content type                                        |
| `429`  | Rate limited — includes `Retry-After`                           |
| `405`  | Reads are not allowed on the public endpoint                    |

Reserved fields: `_redirect`, `_gotcha` / `_honey` (honeypot), `_idempotency_key`, and `metadata`
for context such as the page path. The `Idempotency-Key` header is the preferred retry key.

## Architecture

```
Browser / any HTTP client
        │  POST /api/f/{formId}
        ▼
Next.js route handler ── validation → rate limits → plan quota (atomic RPC) → insert
        │
        ▼
Supabase Postgres (RLS)  ◄── dashboard & client portal (session-scoped reads)
```

- **Next.js 16 App Router** with Cache Components, React 19 and strict TypeScript.
- **Supabase** for Postgres, Auth and Row Level Security; the service-role key never leaves the
  server.
- **Tailwind CSS 4** driven by semantic design tokens (`src/app/globals.css`), light-first with a
  persisted dark theme.
- **Server Actions** for every dashboard mutation; the public endpoint is the only unauthenticated
  write path.

## Getting started

Requirements: Node.js 20.9+ (24 recommended), a Supabase project, and — optionally — Resend for
invitation email and Lemon Squeezy for paid plans.

```bash
npm ci
cp .env.example .env.local     # fill in what you need
npm run dev                    # http://localhost:3000
```

Health check: `GET /api/health`.

Set `NEXT_PUBLIC_APP_URL` to your public origin (for example `https://formivo.faizyab.me`). Every
endpoint, invitation link, email and canonical URL is built from it; a localhost value is
automatically replaced with the production origin so emails never leak `localhost`.

### Supabase

1. Apply the migrations in `supabase/migrations/` (`supabase db push` or the SQL editor, in order).
2. Add `<app>/auth/callback` to the Auth redirect allow-list.
3. Keep the service-role key server-side only — it is used by `src/lib/supabase/admin.ts`.

### Resend and Lemon Squeezy (optional)

- Verify your sender domain in Resend and set `RESEND_API_KEY` / `RESEND_FROM_EMAIL`. If delivery
  fails (including the provider's daily cap), the dashboard shows the invitation link so you can
  share it manually.
- Point the Lemon Squeezy webhook at `<app>/api/webhooks/lemonsqueezy` and set the signing secret.
  Until billing is configured, upgrade buttons stay disabled and the rest of the product works.

## Scripts

| Command             | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Development server                                   |
| `npm run build`     | Production build                                     |
| `npm run start`     | Serve the production build                           |
| `npm run lint`      | ESLint with zero warnings allowed                    |
| `npm run format`    | Prettier write (`format:check` to verify)            |
| `npm run typecheck` | Generate route types, then `tsc --noEmit`            |
| `npm run test`      | Vitest unit, API-shape and database/RLS suites       |
| `npm run test:e2e`  | Playwright specs against a production build          |
| `npm run check`     | lint + format check + types + tests + production build |

## Discoverability

The public site ships with:

- unique titles, descriptions and canonicals for `/`, `/docs`, `/pricing`, `/contact`, `/privacy`
  and `/terms`, plus Open Graph and Twitter `summary_large_image` metadata;
- a branded 1200×630 `og-image.png`, logo-based favicon, Apple touch icon and web manifest;
- `robots.txt` (private routes disallowed), `sitemap.xml` (public routes only) and `llms.txt`;
- JSON-LD for `Organization`, `WebSite`, `SoftwareApplication` (offers generated from the real plan
  configuration) and `FAQPage` for the visible FAQ;
- `noindex` on every authenticated page — robots rules are a hint, not access control.

## Security model

- Public endpoint: write-only, validated, rate-limited, quota-enforced, no credentials.
- Dashboard: session-authenticated, server-authorized on every read/write, scoped to the signed-in
  workspace; RLS backs the same rules in the database.
- Client portal: per-form permission, read-only, revocable at any time.
- Origin allow-lists tighten browser CORS; they are explicitly documented as a browser control, not
  authentication.
- Secrets are validated through `server-only` modules, never logged, and never serialized into
  client bundles or structured data.

## Project layout

```
src/
  app/
    (marketing)/     public site: landing, docs, pricing, contact, legal
    (auth)/          sign in, sign up, password reset
    (developer)/     dashboard, forms, submissions, analytics, client access, billing, settings
    client/          read-only portal for invited clients
    invite/[token]/  invitation acceptance
    api/f/[formId]/  public submission endpoint
    api/webhooks/    Lemon Squeezy webhook
    auth/callback/   Supabase code exchange + account bootstrap
  components/        UI primitives, layout, marketing, forms, clients, billing, settings
  lib/
    auth/            session and role-aware contexts (developer, client)
    billing/         plans, entitlements, checkout and webhook verification
    forms/           form CRUD and allowed-origin policy
    submissions/     intake pipeline, validation, queries, analytics
    invitations/     hashed single-use invitations and access revocation
    email/           Resend delivery and the invitation template
    security/        token generation and HMAC hashing
    supabase/        session client, admin client, generated database types
  config/            site metadata, navigation
supabase/migrations/ schema, RLS policies, transaction-safe RPCs
tests/               unit, API-shape and database/RLS suites
e2e/                 Playwright specs
docs/                database and operational notes
```

## Testing

```bash
npm run check
npm run build && npx playwright install chromium && npm run test:e2e
```

`npm test` applies every migration to an embedded Postgres and runs the cross-user and cross-role
authorization matrix plus the endpoint-model invariants. The public endpoint has also been exercised
against the live Supabase project: `201` create, `200` idempotent replay, `409` quota/paused,
`404` unknown form, `413`/`415` body and content-type rejection, `403` disallowed origin, `429`
rate limiting, and one stored lead with the correct monthly usage.

## Environment variables

See [`.env.example`](.env.example). All values are validated with Zod at startup; provider-backed
features degrade to an explicit "not configured" state instead of failing silently.

| Variable                                                                            | Purpose                                  |
| ----------------------------------------------------------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                                                               | Public origin for links, emails, canons  |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Database, auth, server-side admin  |
| `INVITATION_TOKEN_PEPPER`                                                           | HMAC pepper for invitation tokens        |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`                                               | Invitation email                         |
| `LEMONSQUEEZY_*`                                                                    | Checkout, portal, webhook verification   |
| `CRON_SECRET`                                                                       | Scheduled maintenance tasks              |

## Documentation

- [`docs/database.md`](docs/database.md) — schema, RLS model, RPCs
- [In-app documentation](https://formivo.faizyab.me/docs) — endpoint reference, request formats,
  status codes, rate limits, CORS and the security model
- [`product-documentations/`](product-documentations/) — product requirements and specs

## License

Proprietary. © Formivo. All rights reserved.
