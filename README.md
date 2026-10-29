# Formivo

Formivo is a developer-first form backend and submission-management SaaS: form endpoints, secure
submission storage, a dashboard for reviewing submissions, and form-level read-only client access.

The product requirements live in [`FORMIVO_PRD_v3.md`](FORMIVO_PRD_v3.md), with detailed specs in
[`product-documentations/`](product-documentations/). The project is built in phases;
this repository currently contains **Phase 1 (foundation)** and **Phase 2 (database & security
foundation)**. Auth flows, the dashboard, submissions, client access, email, and billing are
**not implemented yet** — their routes render an explicit "not available yet" notice and collect
no data.

## Stack

- Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript (strict)
- Tailwind CSS 4 with semantic light/dark design tokens in `src/app/globals.css`
- Inter (UI) and Geist Mono (code) via `next/font`
- Zod for environment validation · Lucide icons
- Vitest + Testing Library (unit) · Playwright (E2E)
- ESLint (flat config, `eslint-config-next`) · Prettier (+ Tailwind class sorting)

## Requirements

- Node.js 24 (see `.nvmrc`; minimum 20.9) and npm

## Getting started

```bash
nvm use            # or install Node 24
npm ci
cp .env.example .env.local   # optional — the public shell needs no variables
npm run dev
```

Open http://localhost:3000. Health check: `GET /api/health`.

## Scripts

| Command             | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Start the dev server                                  |
| `npm run build`     | Production build                                      |
| `npm run start`     | Serve the production build                            |
| `npm run lint`      | ESLint, zero warnings allowed                         |
| `npm run format`    | Format with Prettier (`format:check` to verify only)  |
| `npm run typecheck` | Generate Next.js route types, then `tsc --noEmit`     |
| `npm run test`      | Unit tests (Vitest), including migration + RLS suites |
| `npm run test:e2e`  | E2E tests (Playwright; runs against `npm run start`)  |
| `npm run check`     | lint + format check + typecheck + unit tests + build  |

E2E tests need a production build and a browser: `npm run build && npx playwright install chromium && npm run test:e2e`.

## Environment variables

All variables are documented in [`.env.example`](.env.example) and validated with Zod in
`src/lib/env/`. Every variable is optional in Phase 1:

- `src/lib/env/public.ts` — client-safe `NEXT_PUBLIC_*` values.
- `src/lib/env/server.ts` — server-only values, guarded by `server-only` so secrets cannot be
  bundled into client code. Validated once at startup via `src/instrumentation.ts`.
- `src/lib/env/integrations.ts` — reports whether each provider (Supabase, Resend, Lemon Squeezy)
  has its variables set, and throws `IntegrationNotConfiguredError` when an unconfigured provider is
  used. "Configured" means the variables are present, not that the provider has been verified.

Validation errors name the offending variable but never print its value.

## Project structure

```
src/
  app/
    (marketing)/   public site: /, /docs, /pricing, /contact, /privacy, /terms
    (auth)/        /login, /signup, /forgot-password (placeholders)
    (developer)/   developer app shell: /dashboard, /forms, /submissions, ...
    client/        client app shell: /client, /client/settings
    api/health/    liveness endpoint
  components/
    ui/            accessible primitives (Button, Field, Input, Dialog, Alert, Table, ...)
    layout/        site header/footer, app shell, navigation
  config/          site metadata and navigation
  lib/
    supabase/      typed clients (session client, service-role admin client), Database types
    auth/          role lookups (server-side, trusted table)
    authorization/ ownership/access checks (server-side, explicit)
    env/           env validation, utilities
supabase/
  migrations/      schema + RLS + transaction-safe functions (applied to the real project)
  seed.sql         clearly fake local-dev data (never run on a real project)
docs/              database.md — schema, RLS model, environment assumptions
tests/
  db/              migration + RLS/authorization suites against embedded Postgres
  setup.ts         Vitest setup
e2e/               Playwright specs
```

## Database (Phase 2)

Supabase project `formivo` (ref `qpugqjjjxwusccsfbpon`, eu-central-1) has the schema from
`supabase/migrations/` applied and tracked. See **[`docs/database.md`](docs/database.md)** for the
table/RLS overview, transaction-safe functions, environment assumptions, and how to apply
migrations to a fresh project.

Verification runs in two layers on `npm test`:

- `tests/db/migrations.test.ts` — applies every migration to an embedded Postgres with a
  Supabase-shaped `auth` schema and asserts tables, RLS flags, foreign keys and indexes.
- `tests/db/rls.test.ts` — the PRD §22.2 cross-user/cross-role authorization matrix.

## Conventions

- Components use semantic tokens (`bg-surface`, `text-foreground-secondary`, `bg-accent`, ...)
  rather than raw colors. The light palette is the default; wrapping a subtree in
  `data-theme="dark"` switches it to the dark palette. The developer and client app shells use dark.
- Status is never conveyed by color alone; forms wire labels, helper text, and errors through `Field`.
- Security headers (`nosniff`, `DENY` framing, referrer and permissions policies) are set in
  `next.config.ts`; `X-Powered-By` is disabled.
- CI (`.github/workflows/ci.yml`) runs lint, format check, typecheck, unit tests, build, and E2E.
