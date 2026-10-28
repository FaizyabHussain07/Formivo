# Formivo — Deployment & Environment Specification

**File:** `12-deployment-and-environment.md`  
**Product:** Formivo  
**Version:** Version 3.0  
**Status:** Implementation-Ready

---

# 1. Purpose

This document defines how Formivo is configured, built, deployed, migrated, monitored, and released across development, testing, staging, and production environments.

The goal is to ensure that Formivo can be deployed reliably without:

- Exposing secrets
- Mixing environments
- Losing database data
- Breaking authentication
- Breaking billing
- Breaking email
- Accidentally using production services during development
- Deploying incomplete migrations
- Introducing unauthorized V1 features

The deployment architecture must remain simple and maintainable.

---

# 2. Deployment Architecture

Formivo V1 uses a single Next.js application.

```text
                         Internet
                            │
                            ▼
                     ┌──────────────┐
                     │    Vercel    │
                     │              │
                     │ Next.js App  │
                     │ Frontend     │
                     │ Route APIs   │
                     │ Server Logic │
                     └──────┬───────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
     ┌──────────┐      ┌────────────┐   ┌─────────┐
     │ Supabase │      │   Resend   │   │ Lemon   │
     │ Auth + DB│      │   Email    │   │ Squeezy │
     └──────────┘      └────────────┘   └─────────┘
```

V1 does not require:

- Separate backend servers
- Kubernetes
- Docker orchestration
- Microservices
- Redis infrastructure unless specifically introduced for rate limiting
- Dedicated worker infrastructure
- Separate frontend and backend deployments

The architecture should remain a modular monolith.

---

# 3. Environments

Formivo should have clearly separated environments.

Recommended:

```text
Development
    ↓
Test / CI
    ↓
Preview
    ↓
Staging
    ↓
Production
```

Each environment should have appropriate credentials and data isolation.

---

# 4. Development Environment

The development environment is used locally by developers and AI coding agents.

Typical services:

```text
Local Next.js
       │
       ├── Supabase development project
       ├── Lemon Squeezy sandbox/test configuration
       └── Resend development/test configuration
```

Never connect local development to production databases.

---

# 5. Test Environment

The test environment exists for automated tests.

It should have:

- Isolated database
- Test users
- Test workspaces
- Test forms
- Test subscriptions
- Mocked or sandboxed provider integrations

Automated tests must never modify production data.

---

# 6. Preview Environment

Vercel preview deployments may be created automatically for pull requests.

Preview deployments should:

- Build from the relevant branch/commit.
- Use non-production credentials where practical.
- Never automatically point to production databases unless explicitly required and safely isolated.
- Be suitable for visual QA.
- Display a clear environment indicator where appropriate.

Preview deployments must not accidentally send real customer emails.

---

# 7. Staging Environment

Staging should closely resemble production.

Recommended architecture:

```text
Vercel Staging
      │
      ├── Staging Supabase
      ├── Lemon Squeezy sandbox/test configuration
      └── Resend staging configuration
```

Staging should be used for:

- End-to-end testing
- Billing testing
- Webhook testing
- Email testing
- Migration testing
- Production smoke-test preparation
- Final QA

---

# 8. Production Environment

Production is the live customer environment.

```text
formivo.com
     │
     ▼
Vercel Production
     │
     ├── Production Supabase
     ├── Production Lemon Squeezy
     └── Production Resend
```

Production credentials must never be stored in source control.

Production database access must be restricted.

---

# 9. Environment Separation Matrix

| Resource | Development | Test | Staging | Production |
|---|---|---|---|---|
| Next.js | Local | CI | Vercel | Vercel |
| Supabase | Dev project | Test project | Staging project | Production project |
| Auth | Dev | Test | Staging | Production |
| Database | Dev | Test | Staging | Production |
| Lemon Squeezy | Sandbox/test | Mock | Sandbox/test | Production |
| Resend | Test | Mock | Staging | Production |
| Domain | Localhost | Test URL | Staging URL | Formivo domain |
| Customer data | No | No | Synthetic/test | Real |

---

# 10. Required Environment Variables

The application should use environment variables for all secrets and environment-specific configuration.

Recommended variables:

```env
# Application
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_ENVIRONMENT=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Lemon Squeezy
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_PRO_VARIANT_ID=
LEMON_SQUEEZY_AGENCY_VARIANT_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
EMAIL_FROM=

# Optional application security/configuration
FORM_SECRET_PEPPER=
INVITATION_TOKEN_PEPPER=
```

Additional variables may be introduced only when required by the implementation.

Do not create unnecessary environment variables.

---

# 11. Public vs Server-Only Environment Variables

Only variables explicitly intended for browser usage may use the `NEXT_PUBLIC_` prefix.

### Safe browser-exposed configuration

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ENVIRONMENT=
```

### Server-only configuration

```env
SUPABASE_SERVICE_ROLE_KEY=

LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_PRO_VARIANT_ID=
LEMON_SQUEEZY_AGENCY_VARIANT_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=

RESEND_API_KEY=

FORM_SECRET_PEPPER=
INVITATION_TOKEN_PEPPER=
```

Never expose server-only variables through client components.

---

# 12. Secret Management

Secrets must be stored using:

- Vercel Environment Variables
- Local `.env.local`
- CI secret storage
- Approved secret management infrastructure

Never commit:

```text
.env
.env.local
.env.production
```

containing real secrets.

The repository should contain:

```text
.env.example
```

with placeholders only.

---

# 13. Example `.env.example`

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_PRO_VARIANT_ID=
LEMON_SQUEEZY_AGENCY_VARIANT_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=

RESEND_API_KEY=
EMAIL_FROM=

FORM_SECRET_PEPPER=
INVITATION_TOKEN_PEPPER=
```

No real credentials should appear in this file.

---

# 14. Environment Validation

The application should validate required environment variables at startup/build time where appropriate.

Example conceptual validation:

```ts
const requiredServerEnv = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "LEMON_SQUEEZY_API_KEY",
  "LEMON_SQUEEZY_WEBHOOK_SECRET",
  "RESEND_API_KEY",
];
```

Missing required variables should result in a clear configuration error.

Do not expose the actual secret value.

Example:

```text
Missing required environment variable:
RESEND_API_KEY
```

Do not display:

```text
RESEND_API_KEY=actual-secret-value
```

---

# 15. Local Development Setup

Recommended setup:

```text
1. Clone repository
2. Install dependencies
3. Create .env.local
4. Configure development Supabase
5. Configure provider test credentials
6. Apply database migrations
7. Seed development data if required
8. Start Next.js
```

Typical command:

```bash
npm install
npm run dev
```

The actual repository scripts should remain the source of truth.

The AI coding agent must inspect `package.json` before assuming commands.

---

# 16. Node.js and Package Version

Use a supported Node.js LTS release.

Pin the project version using one of:

```text
.nvmrc
```

or:

```json
{
  "engines": {
    "node": ">=20"
  }
}
```

The exact version should be selected according to the current Next.js/Vercel compatibility requirements during implementation.

Development, CI, and production should use compatible Node.js versions.

---

# 17. Dependency Management

Dependencies must be intentionally selected.

Avoid installing packages simply because they make a trivial task slightly easier.

Before adding a dependency, evaluate:

- Maintenance status
- Security history
- Bundle impact
- License
- TypeScript support
- Compatibility with Next.js
- Whether native platform functionality already solves the problem

Run dependency security checks regularly.

---

# 18. Repository Structure

The exact structure may evolve, but a recommended baseline is:

```text
formivo/
├── app/
├── components/
├── lib/
│   ├── auth/
│   ├── billing/
│   ├── email/
│   ├── forms/
│   ├── leads/
│   ├── analytics/
│   ├── entitlements/
│   ├── invitations/
│   ├── security/
│   ├── supabase/
│   └── validation/
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── api/
│   ├── e2e/
│   └── security/
├── supabase/
│   └── migrations/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

Do not create directories that do not serve an actual implementation purpose.

---

# 19. Database Migration Strategy

Supabase database changes must be handled through version-controlled migrations.

Never manually modify production schema without a corresponding migration.

Migration workflow:

```text
Local migration
      ↓
Test migration
      ↓
Staging migration
      ↓
Production migration
```

Each migration should be:

- Version controlled
- Reviewable
- Repeatable
- Tested
- Safe to deploy

---

# 20. Migration Rules

A migration must:

- Clearly describe its purpose.
- Use deterministic SQL.
- Preserve existing customer data.
- Avoid unnecessary destructive operations.
- Include appropriate indexes.
- Include RLS policies where relevant.
- Include constraints where required.

Destructive changes require additional review.

Do not casually use:

```sql
DROP TABLE
```

or destructive column removal in production.

---

# 21. Migration Ordering

Recommended initial migration sequence:

```text
001_profiles
002_workspaces
003_workspace_memberships
004_forms
005_leads
006_client_form_access
007_invitations
008_subscriptions
009_usage_counters
010_idempotency_keys
011_webhook_events
012_indexes
013_rls_policies
014_functions/triggers where required
```

Actual migration numbers may differ if the implementation evolves.

The final schema must remain consistent with `04-data-model.md`.

---

# 22. RLS Deployment

RLS policies must be deployed as part of database migrations.

Do not deploy application code that assumes RLS exists when the production database does not yet contain the required policies.

Deployment order for security-sensitive schema changes should be planned carefully.

For example:

```text
Create table
      ↓
Create indexes/constraints
      ↓
Create RLS policies
      ↓
Verify policies
      ↓
Deploy application code
```

---

# 23. Database Backup Strategy

Production database backups must be enabled through the configured Supabase plan/features.

Before high-risk schema changes:

- Verify backup availability.
- Verify migration rollback/recovery strategy.
- Review migration SQL.
- Test migration against staging first.

Do not assume a migration can always be automatically reversed.

---

# 24. Deployment Pipeline

Recommended deployment flow:

```text
Developer
   │
   ▼
Git branch
   │
   ▼
Pull Request
   │
   ├── Lint
   ├── Type check
   ├── Unit tests
   ├── Integration tests
   ├── Security tests
   └── Build
   │
   ▼
Vercel Preview
   │
   ▼
Review / QA
   │
   ▼
Staging
   │
   ▼
Smoke Tests
   │
   ▼
Production
   │
   ▼
Production Smoke Tests
```

---

# 25. Git Branching

A simple branching strategy is recommended.

Example:

```text
main
 │
 ├── feature/forms
 ├── feature/billing
 ├── feature/client-portal
 ├── fix/auth-session
 └── fix/submission-idempotency
```

Production should deploy from the protected production branch.

Avoid long-lived branches where possible.

---

# 26. Pull Request Requirements

A pull request should include:

- Clear description
- Problem being solved
- Implementation summary
- Testing performed
- Database changes
- Environment variable changes
- Security implications
- Screenshots for major UI changes where useful

The author must explicitly mention if the change affects:

- Billing
- Authentication
- Authorization
- RLS
- Secrets
- Webhooks
- Emails
- Database schema

---

# 27. Build Process

The production build should:

1. Install dependencies.
2. Validate configuration.
3. Run type checking.
4. Run linting.
5. Run relevant tests.
6. Build Next.js.
7. Produce a deployable application.

Typical command:

```bash
npm run build
```

Do not deploy a build with unresolved TypeScript or build errors.

---

# 28. Vercel Configuration

Vercel should be used as the primary application deployment platform.

Configure:

- Production domain
- Preview deployments
- Environment variables
- Build command
- Install command where necessary
- Node.js version
- Redirects/rewrites only when required
- Deployment protection for previews where appropriate

Avoid unnecessary custom configuration.

---

# 29. Production Domain

Primary domain:

```text
formivo.com
```

if acquired and configured.

Potential fallback domains:

```text
formivo.dev
formivo.app
getformivo.com
useformivo.com
```

The chosen production domain must be reflected consistently in:

- `NEXT_PUBLIC_APP_URL`
- Authentication redirects
- Invitation URLs
- Email links
- Documentation
- Sitemap
- Canonical URLs
- Open Graph metadata

Do not hard-code multiple production domains throughout the application.

---

# 30. Authentication Redirect Configuration

Supabase authentication redirect URLs must include the correct environments.

Example:

```text
Development:
http://localhost:3000/callback

Staging:
https://staging.formivo.../callback

Production:
https://formivo.com/callback
```

The actual staging domain should be determined by deployment configuration.

Only approved redirect URLs should be allowed.

---

# 31. Vercel Environment Variable Mapping

Environment variables should be configured separately for:

```text
Development
Preview
Production
```

Example:

| Variable | Development | Preview | Production |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Local | Preview URL | Production URL |
| Supabase URL | Dev | Preview/Test | Prod |
| Lemon Squeezy | Sandbox | Sandbox | Production |
| Resend | Test | Staging | Production |
| Webhook secret | Test | Staging | Production |

Do not reuse production secrets across environments.

---

# 32. Lemon Squeezy Deployment Configuration

Production billing requires:

- Production Lemon Squeezy store
- Production products/variants
- Correct Pro variant ID
- Correct Agency variant ID
- Production webhook endpoint
- Production webhook secret
- Correct checkout configuration

The application must not assume that a development variant ID works in production.

---

# 33. Lemon Squeezy Webhook Deployment

Production endpoint:

```text
POST /api/webhooks/lemonsqueezy
```

The webhook must:

1. Receive raw request body.
2. Verify signature.
3. Parse event.
4. Validate event ID.
5. Check replay/deduplication.
6. Update subscription state.
7. Update entitlements.
8. Record processing state.
9. Return an appropriate response.

Never skip signature verification in production.

---

# 34. Resend Deployment Configuration

Production email requires:

- Verified sending domain
- Production API key
- Production sender identity
- Correct `EMAIL_FROM`
- Correct production application URL

Example:

```env
EMAIL_FROM=Formivo <hello@formivo.com>
```

The exact sender should be configured after the domain is verified.

---

# 35. Email Environment Separation

Development and staging must not accidentally email real customers.

Recommended approaches:

- Test recipient addresses
- Development sender domain
- Resend test/sandbox behavior where available
- Explicit email suppression in non-production

Example:

```ts
if (environment !== "production") {
  // Use controlled test recipient behavior.
}
```

Do not silently report an email as successfully delivered when the application intentionally suppressed it.

---

# 36. Cron Jobs and Scheduled Tasks

V1 should avoid scheduled infrastructure unless a genuine requirement exists.

Potential future jobs could include:

- Cleaning expired idempotency records
- Cleaning expired invitations
- Usage maintenance
- Webhook cleanup

These should only be introduced when needed.

If a scheduled task is added later:

- Protect it with authentication.
- Prevent unauthorized invocation.
- Make execution idempotent.
- Log execution safely.
- Handle partial failure.

---

# 37. File and Asset Deployment

Static assets should be served through the Next.js/Vercel deployment system.

Optimize:

- Images
- Fonts
- Icons
- Logos
- SVGs

Do not commit unnecessarily large files.

Never store customer-uploaded sensitive data in the public repository.

---

# 38. Logging

Production logging should provide enough information to diagnose failures without exposing sensitive information.

Safe:

```text
requestId
workspaceId
formId
leadId
eventType
errorCode
timestamp
```

Avoid logging:

```text
formSecret
secretHash
Supabase service role key
Lemon Squeezy API key
Resend API key
invitation token
full authentication cookies
full sensitive lead payloads
```

If lead payload logging is necessary for debugging, redact sensitive fields.

---

# 39. Request IDs

API requests should receive a request identifier where practical.

Example:

```text
req_01JXYZ...
```

The request ID should appear in:

- Server logs
- Error responses where appropriate
- Error UI when useful for support

Example:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Something went wrong.",
    "requestId": "req_01JXYZ..."
  }
}
```

Never expose internal stack traces.

---

# 40. Error Monitoring

Production should have error monitoring.

The exact provider may be selected during implementation.

Requirements:

- Capture server errors
- Capture important client errors
- Track error frequency
- Track route/API failures
- Include request IDs where possible
- Avoid sensitive payload collection

Do not add a monitoring platform simply for the sake of adding one if Vercel/Supabase logs already satisfy the initial MVP needs.

---

# 41. Health Checks

A lightweight health mechanism may be provided.

Example:

```text
GET /api/health
```

Possible response:

```json
{
  "status": "ok"
}
```

Do not expose:

- Database credentials
- Environment variables
- Internal infrastructure
- Provider API responses

If dependency checks are included, distinguish between application health and dependency health.

---

# 42. Database Health

Production monitoring should watch:

- Connection failures
- Slow queries
- Query errors
- Storage growth
- Database usage
- RLS errors
- Migration failures

Supabase monitoring should be used where available.

---

# 43. API Health

Monitor:

- Request volume
- 4xx rate
- 5xx rate
- 429 rate
- Submission success rate
- Submission latency
- Authentication failures
- Webhook failures

Unexpected spikes should trigger investigation.

---

# 44. Billing Monitoring

Monitor:

- Checkout failures
- Webhook failures
- Invalid signatures
- Duplicate events
- Subscription synchronization failures
- Unexpected subscription states
- Entitlement mismatches

A billing failure must never silently grant paid access.

---

# 45. Email Monitoring

Monitor:

- Invitation send attempts
- Resend API errors
- Failed sends
- Provider response IDs where useful
- Repeated invitation abuse

Never store invitation raw tokens for debugging.

---

# 46. Database Migration Deployment Procedure

Before deploying a migration:

```text
1. Review migration
2. Run migration against local/test database
3. Run tests
4. Run migration against staging
5. Run staging smoke tests
6. Verify schema
7. Confirm production backup/recovery readiness
8. Apply production migration
9. Verify production schema
10. Deploy compatible application code
11. Run production smoke tests
```

For backward-compatible migrations, application and schema changes may be deployed independently.

For breaking migrations, use a staged migration strategy.

---

# 47. Backward-Compatible Migration Strategy

When changing production schema, prefer:

```text
Expand
  ↓
Deploy compatible application
  ↓
Migrate data
  ↓
Verify
  ↓
Contract/remove old structure later
```

Avoid immediately deleting a column that an older deployment may still use.

---

# 48. Rollback Strategy

Application rollback:

```text
Vercel deployment history
        ↓
Restore previous known-good deployment
```

Database rollback is more complex.

Do not assume every database migration can safely be reversed.

For destructive changes:

- Back up data.
- Use staged migrations.
- Prefer additive changes.
- Maintain recovery procedures.

---

# 49. Deployment Failure Strategy

If deployment fails:

1. Do not repeatedly deploy blindly.
2. Identify the failing stage.
3. Inspect build logs.
4. Determine whether code, environment, migration, or provider configuration caused the failure.
5. Fix the root cause.
6. Re-run CI.
7. Redeploy.

Never bypass required quality gates simply to make deployment succeed.

---

# 50. Provider Failure Strategy

Formivo should degrade gracefully when external providers fail.

### Lemon Squeezy failure

Do not:

- Grant paid access optimistically.
- Modify subscription state based only on frontend input.

### Resend failure

Do not:

- Pretend the invitation was successfully delivered if the provider rejected it.

### Supabase failure

Do not:

- Return fabricated application data.
- Silently ignore database write failures.

---

# 51. Security Deployment Checklist

Before production:

```text
[ ] No secrets in Git
[ ] No secrets in client bundle
[ ] No production secrets in preview
[ ] RLS enabled
[ ] RLS policies verified
[ ] Server authorization verified
[ ] CORS configuration reviewed
[ ] Security headers configured
[ ] Webhook signatures verified
[ ] Rate limiting enabled
[ ] Payload limits enabled
[ ] Invitation tokens hashed
[ ] Form secrets hashed
[ ] Error messages sanitized
[ ] Logging redaction verified
[ ] Dependencies audited
```

---

# 52. Production Configuration Checklist

```text
[ ] Production domain configured
[ ] DNS configured
[ ] SSL active
[ ] Vercel production environment configured
[ ] Supabase production project configured
[ ] Supabase auth redirect URLs configured
[ ] Database migrations applied
[ ] RLS policies verified
[ ] Lemon Squeezy production store configured
[ ] Lemon Squeezy variants configured
[ ] Lemon Squeezy webhook configured
[ ] Resend sending domain verified
[ ] Production sender configured
[ ] Production environment variables verified
[ ] Error monitoring enabled
[ ] Logs accessible
```

---

# 53. DNS and Domain Configuration

The final domain setup depends on the selected domain provider.

Required outcomes:

```text
https://formivo.com
```

must resolve to the production application.

HTTPS must be enforced.

HTTP should redirect to HTTPS where supported.

The application should use one canonical production origin.

---

# 54. SEO Deployment Checks

Before production:

- `robots.txt` is valid.
- Sitemap is valid.
- Canonical URLs are correct.
- Public marketing pages have metadata.
- Private dashboard pages are not intended for indexing.
- Authenticated pages should not be publicly indexed.
- Open Graph metadata is configured.
- Favicon/app icons are configured.

Do not expose private client or lead information through metadata.

---

# 55. Preview Deployment Rules

Preview deployments should be treated as potentially public.

Therefore:

- Never expose production secrets unnecessarily.
- Never expose real customer data.
- Do not allow preview builds to bypass authentication.
- Avoid sending real invitation emails.
- Avoid creating real paid subscriptions.
- Avoid modifying production billing state.

---

# 56. Staging Data Policy

Staging should contain:

- Synthetic users
- Synthetic workspaces
- Synthetic forms
- Synthetic leads
- Test subscriptions
- Test invitations

Do not copy production lead data into staging unless there is an explicit, secure, privacy-reviewed process.

For V1, production data should generally remain in production.

---

# 57. Seed Data

Development may include seed data such as:

```text
Demo Workspace
Demo Form
Demo Leads
Demo Client
Demo Invitation
```

Seed data must:

- Be clearly marked as test/demo data.
- Never execute against production automatically.
- Use safe fake emails.
- Never use real customer information.

---

# 58. Local Development Demo Account

If a demo account is created, it should only exist in development/test environments.

Example:

```text
developer@example.test
```

Do not use real email domains or real credentials for automated demo accounts.

---

# 59. Deployment Documentation

The repository README should contain concise setup instructions.

At minimum:

```text
Prerequisites
Installation
Environment variables
Database setup
Migration setup
Development
Testing
Build
Deployment
```

Detailed architecture remains in the dedicated project documentation.

---

# 60. AI Coding Agent Deployment Rules

The AI coding agent must:

1. Inspect the existing repository before changing deployment configuration.
2. Reuse existing Vercel configuration where possible.
3. Never hard-code secrets.
4. Never commit `.env` files containing secrets.
5. Never modify production database manually.
6. Never add Stripe.
7. Never replace Supabase with another database.
8. Never replace Lemon Squeezy with Stripe.
9. Never replace Resend with another email provider without approval.
10. Never create unnecessary infrastructure.
11. Never deploy untested migrations.
12. Never disable security checks to make deployment pass.
13. Never expose service-role credentials to client code.
14. Never use production credentials in tests.
15. Never claim deployment success without verifying the resulting environment.

---

# 61. CI/CD Quality Gate

The deployment pipeline should block production when critical checks fail.

Minimum required:

```text
TypeScript
   +
Lint
   +
Unit tests
   +
Integration tests
   +
Security tests
   +
Build
```

For major releases:

```text
        CI
         ↓
    Preview QA
         ↓
     Staging
         ↓
   E2E / Smoke
         ↓
    Production
```

---

# 62. Release Process

Recommended release sequence:

### Step 1 — Development

Implement feature.

### Step 2 — Automated validation

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

### Step 3 — Pull request

Review:

- Code
- Security
- Tests
- Database changes
- UI

### Step 4 — Preview

Review visual behavior.

### Step 5 — Staging

Apply migrations and test integrations.

### Step 6 — Staging acceptance

Run:

- Authentication
- Forms
- Submission
- Leads
- Client portal
- Billing
- Email
- Security
- Responsive tests

### Step 7 — Production deployment

Deploy approved commit.

### Step 8 — Production smoke test

Verify critical flows.

### Step 9 — Monitor

Watch:

- Errors
- API failures
- Webhooks
- Emails
- Submission success
- Billing events

---

# 63. Post-Deployment Monitoring

Immediately after deployment monitor:

```text
5xx errors
4xx anomalies
429 spikes
Authentication failures
Submission failures
Database errors
Lemon Squeezy webhook failures
Resend failures
Client portal authorization failures
```

A deployment should be considered successful only after the application is verified in the live environment.

---

# 64. Incident Response

If a serious production issue occurs:

### Severity 1

Examples:

- Cross-workspace data leak
- Payment entitlement vulnerability
- Exposed secrets
- Complete application outage

Actions:

1. Stop further deployment.
2. Identify affected systems.
3. Restrict vulnerable functionality if necessary.
4. Rotate exposed secrets.
5. Investigate logs.
6. Restore service safely.
7. Verify security boundaries.
8. Document the incident.
9. Add regression tests preventing recurrence.

### Severity 2

Examples:

- Major billing failure
- Submission outage
- Invitation system outage

Actions:

1. Investigate.
2. Mitigate.
3. Fix.
4. Test.
5. Deploy.
6. Monitor.

---

# 65. Secret Rotation Procedure

If a production secret is exposed:

```text
1. Revoke/rotate the secret immediately.
2. Update environment variable.
3. Redeploy affected services.
4. Verify old secret is invalid.
5. Inspect logs/source control.
6. Determine exposure scope.
7. Verify no other secrets were exposed.
8. Add regression protection.
```

Never simply hide the leaked secret without rotating it.

---

# 66. Form Secret Rotation

Form-specific secret rotation is separate from infrastructure secret rotation.

When a user rotates a form secret:

```text
Old form secret
       ↓
Invalid

New form secret
       ↓
Valid
```

This behavior must be verified in production-safe tests.

---

# 67. Production Data Protection

Production lead data is customer data.

Do not:

- Use it for development.
- Export it unnecessarily.
- Log complete lead payloads.
- Include it in screenshots.
- Put it into GitHub issues.
- Send it to third-party AI services without an explicit product requirement and privacy review.

Only authorized application functionality should access it.

---

# 68. Data Deletion Considerations

V1 should define safe deletion behavior before implementing destructive account/workspace deletion.

At minimum:

- Avoid accidental cascading deletion.
- Confirm destructive actions.
- Respect foreign-key relationships.
- Protect billing records where needed.
- Preserve required audit/provider references.

If full account/workspace deletion is not implemented in V1, do not invent a fake deletion workflow.

---

# 69. Production Smoke Test Matrix

| Area | Check | Expected |
|---|---|---|
| Homepage | Load | 200 / renders |
| Sign-in | Login | Successful |
| Dashboard | Load | Correct workspace |
| Forms | Create/view | Successful |
| Integration | Endpoint | Correct |
| Submission | Valid request | Lead created |
| Leads | View | Correct data |
| Analytics | Load | Correct data |
| Invitation | Send | Email accepted by provider |
| Client | Login | Assigned forms only |
| Billing | Load | Correct plan |
| Webhook | Valid event | Processed |
| Security | Unauthorized access | Denied |

---

# 70. Final Deployment Definition of Done

Formivo V1 deployment is complete when:

```text
Application
[ ] Builds successfully
[ ] Deploys successfully
[ ] Production domain works
[ ] HTTPS works

Database
[ ] Migrations applied
[ ] RLS enabled
[ ] Indexes verified
[ ] Backups/recovery strategy confirmed

Authentication
[ ] Supabase Auth configured
[ ] Redirect URLs verified
[ ] Protected routes verified

Forms
[ ] Form creation works
[ ] Secrets work
[ ] Secret rotation works
[ ] Public endpoint works

Leads
[ ] Submissions create leads
[ ] Usage counters work
[ ] Analytics work

Clients
[ ] Invitations work
[ ] Resend works
[ ] Client permissions work

Billing
[ ] Lemon Squeezy configured
[ ] Checkout works
[ ] Webhook works
[ ] Entitlements work
[ ] Replay protection works

Security
[ ] No secrets committed
[ ] No secrets exposed client-side
[ ] Authorization verified
[ ] RLS verified
[ ] Rate limiting verified

Quality
[ ] CI passes
[ ] E2E passes
[ ] Accessibility checked
[ ] Responsive checked
[ ] Staging smoke test passes
[ ] Production smoke test passes
```

---

# 71. Final Architecture

The final V1 deployment architecture is:

```text
                         ┌─────────────────────┐
                         │       Users         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       Vercel       │
                         │                     │
                         │      Next.js        │
                         │  App Router + API   │
                         └──────────┬──────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
        │   Supabase   │    │    Resend    │    │ Lemon Squeezy│
        │              │    │              │    │              │
        │ Auth         │    │ Invitations  │    │ Checkout     │
        │ PostgreSQL   │    │ Email        │    │ Subscriptions│
        │ RLS          │    │              │    │ Webhooks     │
        └──────────────┘    └──────────────┘    └──────────────┘
```

This architecture is intentionally simple.

It provides enough infrastructure for a serious SaaS without introducing unnecessary operational complexity.

---

# 72. Explicit Technology Rules

Formivo V1 uses:

```text
Frontend:
Next.js + React + TypeScript

Backend:
Next.js Route Handlers / Server Actions

Database:
Supabase PostgreSQL

Authentication:
Supabase Auth

Authorization:
Application authorization + Supabase RLS

Payments:
Lemon Squeezy

Email:
Resend

Deployment:
Vercel
```

Formivo V1 does not use:

```text
Stripe
Firebase as primary database/auth
MongoDB as primary database
Separate Express backend
Kubernetes
Microservices
Unnecessary worker infrastructure
Embedded Form Builder
```

---

# 73. Final Deployment Principle

Formivo should be deployed as a **simple, secure, observable modular monolith**.

The deployment should optimize for:

- Reliability
- Security
- Developer velocity
- Low operational complexity
- Clear environment separation
- Safe database migrations
- Predictable billing
- Secure email delivery
- Strong tenant isolation

Do not introduce infrastructure merely because it is technically possible.

The best V1 deployment is the smallest architecture that can reliably support the approved Formivo product.

---

# 74. Final Release Gate

The production release may proceed only when:

```text
Code
   ↓
Tests
   ↓
Security
   ↓
Database
   ↓
Providers
   ↓
Staging
   ↓
Smoke Tests
   ↓
Production
   ↓
Verification
```

All critical gates must pass.

**No Stripe.  
No production credentials in source control.  
No untested migrations.  
No client-side secrets.  
No cross-tenant access.  
No deployment without verification.**