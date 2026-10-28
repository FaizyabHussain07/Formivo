# Formivo — Technical Architecture

**Document:** `03-technical-architecture.md`
**Product:** Formivo
**Version:** Version 3.0
**Status:** Implementation-Ready
**Architecture:** Next.js + Supabase + Lemon Squeezy + Resend + Vercel

---

## 1. Purpose

This document defines the technical architecture for Formivo Version 3.0.

It translates the Product PRD and User Flows into an implementation-ready engineering architecture that an AI coding agent or human development team can follow without making major architectural assumptions.

The architecture prioritizes:

- Security
- Multi-tenant isolation
- Simplicity
- Maintainability
- Strong developer experience
- Production readiness
- Performance
- Clear separation of responsibilities
- Minimal infrastructure
- Easy deployment
- Future extensibility

Formivo V1 should be implemented as a **single Next.js application** rather than multiple independently deployed services.

---

# 2. Architecture Principles

The implementation MUST follow these principles.

### 2.1 Server-first

Sensitive operations should happen on the server.

Examples:

- Database mutations
- Authentication checks
- Authorization
- Form secret validation
- Lead creation
- Billing operations
- Lemon Squeezy webhook processing
- Resend email sending
- Usage/quota checks
- Secret generation and rotation

Never expose server credentials to the browser.

---

### 2.2 Database-enforced isolation

Application-level checks are required, but they are not sufficient.

Supabase PostgreSQL Row Level Security (RLS) must enforce tenant isolation wherever practical.

The application should assume that authorization bugs can happen and use the database as an additional security boundary.

---

### 2.3 One source of truth

Important business rules must not be duplicated across pages.

Centralize:

- Plan limits
- Entitlements
- Lead statuses
- Authorization rules
- Form states
- Billing state
- Usage calculations
- API error codes

---

### 2.4 API secrets are server-side credentials

Form secrets are equivalent to API credentials.

They must:

- Never be stored in plaintext when avoidable
- Never be returned after initial display
- Never appear in URLs
- Never appear in logs
- Never be included in client-side JavaScript
- Never be exposed through public database queries

---

### 2.5 V1 should not be over-engineered

Do not introduce:

- Microservices
- Kubernetes
- Kafka
- Redis unless required by a concrete implementation
- Separate backend deployment
- Complex worker infrastructure
- Event buses
- GraphQL
- Custom authentication systems

The V1 architecture should remain understandable by one developer.

---

# 3. Canonical Technology Stack

| Layer           | Technology                                    |
| --------------- | --------------------------------------------- |
| Framework       | Next.js                                       |
| Language        | TypeScript                                    |
| UI              | React                                         |
| Styling         | Tailwind CSS                                  |
| UI primitives   | shadcn/ui or equivalent accessible primitives |
| Authentication  | Supabase Auth                                 |
| Database        | Supabase PostgreSQL                           |
| Authorization   | Application checks + PostgreSQL RLS           |
| Payments        | Lemon Squeezy                                 |
| Email           | Resend                                        |
| Hosting         | Vercel                                        |
| API             | Next.js Route Handlers                        |
| Validation      | Zod                                           |
| Package Manager | Existing repository package manager           |
| Version Control | Git/GitHub                                    |

### Important

**Stripe must not be introduced anywhere in the Formivo V1 implementation.**

Lemon Squeezy is the payment provider.

---

# 4. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │      Browser        │
                         │ React / Next.js UI  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     Next.js App     │
                         │                     │
                         │ App Router          │
                         │ Server Components   │
                         │ Client Components   │
                         │ Route Handlers      │
                         │ Server Actions      │
                         └───────┬───────┬─────┘
                                 │       │
                  ┌──────────────┘       └──────────────┐
                  ▼                                     ▼
        ┌──────────────────┐                  ┌──────────────────┐
        │ Supabase         │                  │ External Services│
        │                  │                  │                  │
        │ Auth             │                  │ Lemon Squeezy    │
        │ PostgreSQL       │                  │ Resend           │
        │ RLS              │                  │                  │
        └──────────────────┘                  └──────────────────┘
                                                        
                                    │
                                    ▼
                              ┌───────────┐
                              │  Vercel   │
                              │ Deployment│
                              └───────────┘
```

---

# 5. Monolithic Next.js Architecture

Formivo V1 should use a modular monolith.

The frontend and backend live in the same Next.js repository.

```text
Formivo
└── Next.js Application
    ├── Marketing UI
    ├── Authentication UI
    ├── Developer Dashboard
    ├── Client Dashboard
    ├── Route Handlers
    ├── Server Actions
    ├── Business Services
    ├── Validation
    ├── Authorization
    └── Database Access
```

This provides:

- Faster development
- Shared TypeScript types
- Easier deployment
- Easier debugging
- Fewer infrastructure dependencies
- Lower operating cost

The architecture should remain modular enough to extract services later if the product grows.

---

# 6. Recommended Project Structure

Use the existing repository structure when it is already healthy.

Do not rewrite an existing application merely to match this structure.

Recommended structure:

```text
/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── pricing/
│   │   └── docs/
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── forms/
│   │   ├── leads/
│   │   ├── analytics/
│   │   ├── clients/
│   │   ├── billing/
│   │   └── settings/
│   │
│   ├── client/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── forms/
│   │   ├── leads/
│   │   └── analytics/
│   │
│   └── api/
│       └── v1/
│           └── forms/
│               └── [formPublicId]/
│                   └── submissions/
│                       └── route.ts
│
├── components/
│   ├── ui/
│   ├── marketing/
│   ├── dashboard/
│   ├── forms/
│   ├── leads/
│   ├── analytics/
│   ├── clients/
│   └── billing/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── db/
│   ├── forms/
│   ├── leads/
│   ├── analytics/
│   ├── clients/
│   ├── billing/
│   ├── email/
│   ├── security/
│   ├── rate-limit/
│   ├── validation/
│   ├── errors/
│   └── utils/
│
├── types/
│   ├── database.ts
│   ├── api.ts
│   ├── billing.ts
│   └── domain.ts
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── public/
│
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── README.md
```

The exact structure may be adapted to the existing codebase.

---

# 7. Application Layers

Formivo should follow a simple layered architecture.

```text
UI
 ↓
Route Handler / Server Action
 ↓
Authorization
 ↓
Domain Service
 ↓
Database / External Service
```

For example:

```text
Create Form Page
      ↓
Server Action
      ↓
requireWorkspaceMember()
      ↓
formService.createForm()
      ↓
entitlementService.checkFormLimit()
      ↓
Supabase
```

Avoid putting complex business logic directly inside React components.

---

# 8. Route Groups

Use Next.js route groups to separate application surfaces.

Recommended:

```text
app/
├── (marketing)/
├── (auth)/
├── dashboard/
└── client/
```

Marketing pages should not inherit dashboard navigation.

Authentication pages should not inherit application navigation.

Developer dashboard and client dashboard should have separate layouts.

---

# 9. Server Components vs Client Components

Use React Server Components by default.

### Server Components

Use for:

- Dashboard pages
- Lead lists
- Form lists
- Analytics summaries
- Settings pages
- Billing pages
- Initial data loading
- Permission-sensitive content

### Client Components

Use only when interaction requires browser state.

Examples:

- Interactive filters
- Search inputs
- Dialogs
- Dropdowns
- Form controls
- Copy-to-clipboard
- Charts requiring client interaction
- Toast notifications
- Interactive tables

Do not mark entire pages as `"use client"` unless necessary.

---

# 10. Authentication Architecture

Supabase Auth is the source of truth for user identity.

Supported V1 authentication:

- Email/password
- Password reset
- Email verification where configured
- Session management
- Sign out

The application should obtain the authenticated Supabase user server-side whenever possible.

---

## 10.1 Authentication Flow

```text
User
 ↓
Login
 ↓
Supabase Auth
 ↓
Session Cookie
 ↓
Next.js Server
 ↓
getAuthenticatedUser()
 ↓
User/Application Profile
 ↓
Workspace Membership
 ↓
Authorized Application
```

---

## 10.2 Authentication Helpers

Centralize authentication helpers.

Example conceptual API:

```ts
requireUser()
getCurrentUser()
requireWorkspaceMembership(workspaceId)
requireWorkspaceOwner(workspaceId)
requireFormAccess(formId)
requireClientViewer(formId)
```

Do not implement authentication logic independently inside every page.

---

# 11. Workspace / Multi-Tenant Architecture

Formivo is a multi-tenant SaaS.

The workspace is the primary tenant boundary.

```text
User
 │
 ├── Workspace Membership
 │
 └── Workspace
      ├── Forms
      ├── Leads
      ├── Client Invitations
      ├── Client Viewers
      ├── Subscription
      └── Usage
```

A user may belong to multiple workspaces in the future.

V1 may initially focus on one primary workspace per account, but the database model should not make future multi-workspace support impossible.

---

# 12. Authorization Model

There are two primary application roles.

### Developer / Owner

Can:

- Manage workspace
- Create forms
- Configure integrations
- View secrets
- Rotate secrets
- View leads
- Update lead statuses
- Archive forms
- View analytics
- Invite clients
- Remove clients
- Manage billing
- View usage

### Client Viewer

Can:

- View assigned forms
- View assigned leads
- View basic analytics
- View lead details

Cannot:

- Create forms
- Delete/archive forms
- View secrets
- Rotate secrets
- Manage billing
- Invite clients
- Manage workspace settings
- Change lead ownership/access
- Access other workspaces
- Access unassigned forms

---

# 13. Form Architecture

Each Formivo form represents a lead collection endpoint.

V1 supports:

```text
Custom Form Integration
```

The embedded Form Builder is explicitly **not implemented in V1**.

The UI may show:

> Embedded Form Builder — Coming Soon

but it must not expose a fake or partially working builder.

---

# 14. Form Lifecycle

Recommended form states:

```text
active
archived
```

Archived forms:

- Cannot accept new submissions
- Remain visible to authorized users
- Retain historical leads
- Retain analytics
- Can be restored if restoration is supported
- Must not process new API submissions

---

# 15. Form Identifiers

Do not expose raw sequential database IDs as public identifiers.

Use a public identifier such as:

```text
frm_xxxxxxxxx
```

or a sufficiently random UUID.

The public identifier is not itself a secret.

The secret provides authentication.

Example:

```text
Form Public ID:
frm_8f4b2c...

Form Secret:
fmsec_very_long_random_value
```

---

# 16. Public Submission API

The core Formivo API is:

```http
POST /api/v1/forms/{formPublicId}/submissions
```

Example:

```http
POST /api/v1/forms/frm_8f4b2c/submissions
Authorization: Bearer FORM_SECRET
Content-Type: application/json
Idempotency-Key: unique-request-id
```

---

# 17. Submission Request

Expected request:

```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello"
  },
  "metadata": {
    "source": "contact-page",
    "page": "/contact"
  }
}
```

### `data`

Required.

Must be a JSON object.

This object represents user-submitted lead fields.

Formivo must not require a rigid schema in V1.

---

### `metadata`

Optional.

May include:

- Source
- Page
- Referrer
- Campaign
- UTM information
- Custom metadata

Metadata must remain size-limited.

---

# 18. Submission Response

Successful response:

```json
{
  "success": true,
  "leadId": "lead_123",
  "message": "Submission received."
}
```

Do not expose internal database implementation details.

---

# 19. API Error Contract

Use consistent structured errors.

Example:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid form credentials."
  }
}
```

Supported V1 error codes:

```text
INVALID_REQUEST
UNAUTHORIZED
FORM_NOT_FOUND
FORM_INACTIVE
PAYLOAD_TOO_LARGE
RATE_LIMITED
QUOTA_EXCEEDED
INTERNAL_ERROR
```

Additional internal error codes may exist, but public errors should remain stable and understandable.

---

# 20. HTTP Status Mapping

Recommended mapping:

| Error             | HTTP |
| ----------------- | ---: |
| INVALID_REQUEST   |  400 |
| UNAUTHORIZED      |  401 |
| FORM_NOT_FOUND    |  404 |
| FORM_INACTIVE     |  409 |
| PAYLOAD_TOO_LARGE |  413 |
| RATE_LIMITED      |  429 |
| QUOTA_EXCEEDED    |  429 |
| INTERNAL_ERROR    |  500 |

Do not expose stack traces to API consumers.

---

# 21. Submission Processing Pipeline

Every submission should follow this sequence:

```text
Request
 ↓
Parse request
 ↓
Validate Content-Type
 ↓
Validate payload size
 ↓
Validate JSON structure
 ↓
Resolve form by public ID
 ↓
Verify form is active
 ↓
Verify form secret
 ↓
Resolve workspace
 ↓
Check plan entitlement
 ↓
Check monthly quota
 ↓
Apply rate limit
 ↓
Validate idempotency
 ↓
Normalize submission
 ↓
Create lead
 ↓
Record submission metadata
 ↓
Return success
```

Security-sensitive checks must occur before creating data.

---

# 22. Form Secret Architecture

Secrets should be cryptographically random.

Use a secure server-side generator.

Example conceptual format:

```text
fmsec_<random-secret>
```

The secret should contain enough entropy to prevent guessing.

Do not use:

- Sequential numbers
- User IDs
- Form IDs
- Timestamps
- Predictable strings
- Hashes of public IDs

---

# 23. Secret Storage

Prefer storing a secure hash of the form secret rather than plaintext.

Conceptual model:

```text
User creates form
       ↓
Generate secret
       ↓
Display plaintext secret once
       ↓
Hash secret
       ↓
Store hash
       ↓
Discard plaintext
```

When a request arrives:

```text
Incoming secret
       ↓
Hash / verify
       ↓
Compare against stored credential
       ↓
Allow or reject
```

The secret should only be shown again if the architecture intentionally supports secure retrieval.

Recommended V1 behavior:

> Show secret once after creation and require rotation to generate a new one.

---

# 24. Secret Rotation

When rotating:

```text
Generate new secret
 ↓
Invalidate old secret
 ↓
Store new hash
 ↓
Show new secret once
```

Existing integrations using the old secret will stop working immediately.

The UI must clearly warn the user.

Example:

> Rotating this secret will immediately invalidate the current secret. Update your website integration before submitting again.

---

# 25. Secret Logging Rules

Never log:

```text
Authorization header
Bearer token
Form secret
Resend API key
Supabase service role key
Lemon Squeezy signing secret
```

If a request must be logged, log only safe identifiers.

Example:

```text
formPublicId
workspaceId
requestId
statusCode
duration
errorCode
```

---

# 26. Browser Integration Warning

Formivo should support custom form integrations, but developers must understand that API secrets should ideally remain server-side.

Recommended integration:

```text
Browser
 ↓
Developer Website Backend
 ↓
Formivo API
```

Not:

```text
Browser
 ↓
Formivo API
```

if doing so would expose the Formivo secret to end users.

The integration documentation should explicitly warn:

> Do not expose your Formivo form secret in browser JavaScript, public source code, or client-side environment variables.

---

# 27. Rate Limiting

The public submission endpoint must be protected against abuse.

Rate limiting should consider:

- Form
- IP address
- Request frequency
- Potential abuse patterns

The implementation may begin with a lightweight provider or database-backed mechanism.

Do not add Redis solely because it is common in SaaS architectures.

If Vercel/Supabase constraints require an external rate-limit provider later, introduce it behind a `rateLimitService` abstraction.

---

# 28. Payload Limits

The public endpoint must reject excessively large payloads.

Recommended initial limits:

```text
JSON body: approximately 64 KB
Individual field: approximately 10 KB
Metadata: approximately 16 KB
```

These values may be adjusted during implementation based on actual infrastructure constraints.

The API should return:

```text
PAYLOAD_TOO_LARGE
```

when limits are exceeded.

---

# 29. Idempotency

Duplicate requests should not unnecessarily create duplicate leads.

Support:

```http
Idempotency-Key: <unique-client-generated-key>
```

The key should be associated with:

```text
workspace
form
idempotency key
request result
```

If the same request is retried with the same key, return the original result where practical.

Do not treat different forms as sharing the same idempotency namespace.

---

# 30. Lead Creation

A successful submission creates a lead.

Conceptual flow:

```text
Submission
 ↓
Lead
 ├── Form
 ├── Workspace
 ├── Data JSON
 ├── Metadata JSON
 ├── Status
 └── Timestamps
```

Default status:

```text
new
```

---

# 31. Lead Statuses

V1 statuses:

```text
new
contacted
qualified
converted
archived
```

The status values should be centralized as a TypeScript enum/constant.

Do not duplicate strings throughout the application.

---

# 32. Lead Data Model Strategy

Lead fields should remain flexible.

Example:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme",
  "message": "Interested in your service"
}
```

Use PostgreSQL JSONB for dynamic lead data.

This allows Formivo to support arbitrary custom forms without creating a database column for every field.

---

# 33. Lead Rendering Security

Lead data is untrusted user input.

Never render lead values as raw HTML.

Escape output by default.

Do not use:

```tsx
dangerouslySetInnerHTML
```

for lead data unless there is a specific sanitized-content requirement.

---

# 34. Lead Queries

Lead lists must use:

- Pagination
- Search where practical
- Status filtering
- Form filtering
- Date filtering where supported
- Stable sorting

Default sorting:

```text
created_at DESC
```

Do not load thousands of leads into the browser at once.

---

# 35. Analytics Architecture

V1 analytics should be derived primarily from stored leads/submissions.

Examples:

- Total leads
- Leads this month
- Leads today
- Conversion count
- Leads by status
- Leads over time
- Leads by form

Avoid building a separate analytics warehouse for V1.

---

# 36. Analytics Query Strategy

Use database aggregation.

Do not fetch every lead into JavaScript and calculate large datasets in memory.

Example conceptual query:

```sql
COUNT(*)
GROUP BY status
```

Use appropriate indexes to support common analytics queries.

---

# 37. Client Viewer Architecture

Client access should be explicitly assigned.

Conceptually:

```text
Workspace
   │
   ├── Form A
   │    └── Client A
   │
   ├── Form B
   │    └── Client B
   │
   └── Form C
        └── Client A
```

A client should only see forms they have been assigned.

Never grant client access merely because the user belongs to the same workspace.

---

# 38. Client Invitation Flow

```text
Developer
 ↓
Select Form
 ↓
Invite Client
 ↓
Create Invitation
 ↓
Send Resend Email
 ↓
Client Opens Link
 ↓
Accept Invitation
 ↓
Authenticate / Create Account
 ↓
Create Viewer Membership
 ↓
Client Dashboard
```

Invitation tokens must be:

- Random
- Expiring
- Single-use
- Stored securely
- Invalidated after acceptance

---

# 39. Billing Architecture

Lemon Squeezy is the billing provider.

The architecture must isolate billing logic behind a service.

Example:

```text
billing/
├── plans.ts
├── entitlements.ts
├── lemonsqueezy.ts
├── webhook.ts
└── usage.ts
```

The rest of the application should not directly depend on Lemon Squeezy SDK details.

---

# 40. V1 Plans

Canonical plan configuration:

```ts
const plans = {
  free: {
    forms: 1,
    monthlyLeads: 100,
    viewers: 1,
  },

  pro: {
    forms: 10,
    monthlyLeads: 2000,
    viewers: 5,
  },

  agency: {
    forms: -1,
    monthlyLeads: 10000,
    viewers: -1,
  },
};
```

Interpretation:

```text
-1 = unlimited
```

These values should live in one centralized configuration.

---

# 41. Entitlement Architecture

Never hard-code plan checks throughout UI components.

Bad:

```ts
if (plan === "pro") {
   ...
}
```

Prefer:

```ts
canCreateForm(workspace)
canAddViewer(workspace)
canAcceptSubmission(workspace)
getMonthlyLeadLimit(workspace)
```

The entitlement layer determines the actual permission.

---

# 42. Billing Webhook Flow

```text
Lemon Squeezy
      ↓
POST /api/webhooks/lemonsqueezy
      ↓
Verify Signature
      ↓
Validate Event
      ↓
Check Idempotency
      ↓
Resolve Workspace / Subscription
      ↓
Update Billing State
      ↓
Update Entitlements
      ↓
Return 200
```

Webhook events must be idempotent.

The same webhook should be safe to process more than once.

---

# 43. Billing State

The database should maintain the application's current billing state.

Do not query Lemon Squeezy on every dashboard request.

Store relevant state such as:

```text
plan
subscription status
external subscription ID
customer ID
renewal/cancellation information
billing timestamps
```

Lemon Squeezy remains the billing authority.

Formivo maintains a synchronized application representation.

---

# 44. Email Architecture

Resend is the email provider.

Create a centralized email service.

Example:

```ts
sendClientInvitation()
sendWelcomeEmail()
sendPasswordResetRelatedEmail()
```

Do not call Resend directly from random UI components.

---

# 45. Email Security

The Resend API key must be server-side only.

Never expose:

```text
RESEND_API_KEY
```

to browser code.

Emails should not expose:

- Form secrets
- Passwords
- Sensitive lead contents
- Internal database IDs unnecessarily

---

# 46. Supabase Architecture

Supabase provides:

```text
Authentication
PostgreSQL
Row Level Security
```

Use the appropriate Supabase client depending on execution context.

Conceptually:

```text
Browser Client
    ↓
Supabase public/anon key

Server
    ↓
Authenticated server client

Privileged backend operation
    ↓
Service-role client
```

The service-role key must never be exposed to the browser.

---

# 47. Service Role Usage

The Supabase service role bypasses RLS.

Therefore it must be used carefully.

Only use it for operations that genuinely require privileged access, such as certain:

- Webhook processing
- System-level background operations
- Secure API credential verification
- Internal administrative tasks

When using service-role access, explicitly perform authorization in application code.

Never assume RLS protects service-role queries.

---

# 48. RLS Architecture

Every tenant-owned table should have appropriate RLS policies.

Conceptual ownership chain:

```text
auth.user
   ↓
workspace_membership
   ↓
workspace
   ↓
forms
   ↓
leads
```

A user should only access records associated with a workspace where they have appropriate membership.

Client access requires an additional form assignment relationship.

---

# 49. Database Access Layer

Do not scatter raw database queries throughout the application.

Prefer domain-specific modules.

Example:

```text
lib/
├── forms/
│   ├── queries.ts
│   ├── mutations.ts
│   └── service.ts
│
├── leads/
│   ├── queries.ts
│   ├── mutations.ts
│   └── service.ts
│
└── clients/
    ├── queries.ts
    ├── mutations.ts
    └── service.ts
```

This makes business logic easier to test.

---

# 50. Transactions

Operations that must succeed together should be transactional.

Example:

```text
Validate submission
 ↓
Check quota
 ↓
Create submission/lead
 ↓
Record idempotency result
```

If the lead cannot be created, the operation should not report a successful submission.

Where multiple database writes are required, use PostgreSQL transaction mechanisms or database functions where appropriate.

---

# 51. Quota Accounting

Lead usage should be calculated consistently.

Recommended conceptual definition:

> Monthly lead usage = successful lead submissions attributed to the workspace during the current billing/usage period.

Failed requests should not consume lead quota.

Requests rejected because the quota is already exceeded should not create leads.

---

# 52. Quota Race Conditions

Two simultaneous requests can potentially pass a simple count check.

Therefore quota enforcement should not rely solely on:

```text
SELECT COUNT(*)
then INSERT
```

For production correctness, consider a transaction, atomic counter, or database-level enforcement strategy where appropriate.

The implementation must prevent obvious concurrent-request quota bypasses.

---

# 53. Caching and Revalidation

Do not aggressively cache tenant-specific sensitive data.

Developer dashboard data should generally be dynamically fetched.

Use revalidation selectively for:

- Public marketing pages
- Public documentation
- Pricing content

Avoid caching:

- Leads
- Client permissions
- Form secrets
- Billing state
- Workspace-specific sensitive data

---

# 54. Error Architecture

Create a structured application error system.

Example:

```ts
class AppError extends Error {
  code: string;
  statusCode: number;
}
```

Possible categories:

```text
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
VALIDATION_ERROR
NOT_FOUND_ERROR
CONFLICT_ERROR
RATE_LIMIT_ERROR
QUOTA_ERROR
INTERNAL_ERROR
```

API errors should map these to stable public error codes.

---

# 55. Error Handling Rules

Never show users:

- Stack traces
- SQL queries
- Environment variables
- Internal service credentials
- Raw provider responses
- Internal filesystem paths

Show a useful human-readable message.

Example:

> Something went wrong while loading your leads. Please try again.

Provide a request ID where useful.

---

# 56. Request IDs

Generate or propagate a request ID for important server requests.

Example:

```text
req_01H...
```

Include it in:

- Server logs
- Error logs
- API responses where appropriate

This helps debug production problems without exposing sensitive information.

---

# 57. Logging

Log structured events.

Useful fields:

```text
requestId
timestamp
route
method
status
duration
workspaceId
formId
userId
errorCode
```

Never log secrets or complete lead payloads.

---

# 58. Security Headers

The application should configure appropriate security headers.

Consider:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

Do not deploy an unnecessarily restrictive CSP that breaks required functionality without testing it.

---

# 59. CORS

The public submission endpoint must be deliberately designed around cross-origin usage.

Do not automatically use:

```text
Access-Control-Allow-Origin: *
```

unless the integration model explicitly requires it.

If browser-based submissions are supported, CORS should be intentionally configured.

The preferred integration remains server-side forwarding where possible.

---

# 60. Environment Variables

Expected variables should include concepts such as:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_SIGNING_SECRET=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

NEXT_PUBLIC_APP_URL=
```

Use the exact variable names required by the implementation.

Never commit `.env` files containing secrets.

Provide:

```text
.env.example
```

with empty placeholders.

---

# 61. Public vs Private Environment Variables

Only variables explicitly intended for browser use may use:

```text
NEXT_PUBLIC_
```

Never use:

```text
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_RESEND_API_KEY
NEXT_PUBLIC_LEMON_SQUEEZY_API_KEY
NEXT_PUBLIC_FORM_SECRET
```

These would be security failures.

---

# 62. Database Indexing

Indexes should support the most common access patterns.

Likely indexes include:

```text
workspace_memberships.user_id
workspace_memberships.workspace_id

forms.workspace_id
forms.public_id
forms.status

leads.workspace_id
leads.form_id
leads.status
leads.created_at

client_form_access.client_id
client_form_access.form_id

invitations.token_hash
invitations.email
invitations.expires_at
```

Exact indexes should be validated against actual query patterns.

Do not add unnecessary indexes everywhere.

---

# 63. Pagination

Use server-side pagination for large collections.

Recommended default:

```text
20–50 records per page
```

Potentially use cursor-based pagination for very large datasets.

The UI should never assume all leads fit in one request.

---

# 64. Performance

Performance priorities:

1. Fast initial page load
2. Minimal client JavaScript
3. Server-side data fetching
4. Efficient database queries
5. Proper indexes
6. Pagination
7. Optimized images
8. Avoid unnecessary re-renders
9. Avoid unnecessary API requests
10. Avoid loading entire datasets

---

# 65. Loading States

Every major asynchronous surface should have a deliberate loading state.

Examples:

```text
Dashboard loading
Forms loading
Lead table loading
Lead detail loading
Analytics loading
Billing loading
Client loading
```

Use skeletons where appropriate.

Do not show empty states while data is merely loading.

---

# 66. Empty States

Empty states must explain what the user should do next.

Example:

```text
No forms yet.

Connect your first form to start capturing leads.

[Create Form]
```

Avoid meaningless:

```text
No data.
```

---

# 67. Deployment Architecture

Production deployment:

```text
GitHub
   ↓
Vercel
   ↓
Next.js Application
   ↓
Supabase
```

External services:

```text
Lemon Squeezy
Resend
```

Vercel handles:

- Build
- Deployment
- HTTPS
- Serverless/edge execution where applicable
- Environment configuration
- Preview deployments

---

# 68. Environment Separation

Maintain separate environments where practical:

```text
Development
Preview
Production
```

Each environment should use appropriate:

- Supabase project/configuration
- Lemon Squeezy configuration
- Resend configuration
- Environment variables

Never accidentally point development billing events at production data.

---

# 69. Webhook Security

Lemon Squeezy webhooks must verify the webhook signature before processing.

Never trust:

```text
event body
subscription ID
plan
price
customer
```

until the webhook authenticity is verified.

Webhook processing must be idempotent.

---

# 70. Webhook Replay Protection

Store processed webhook/event identifiers where practical.

Processing logic:

```text
Receive webhook
 ↓
Verify signature
 ↓
Extract event ID
 ↓
Check if already processed
 ↓
If processed → return success
 ↓
Process event
 ↓
Record event
 ↓
Return success
```

---

# 71. Email Delivery Failures

Email failure should not corrupt the underlying business operation unless email is logically required.

For example:

```text
Create client invitation
 ↓
Invitation created
 ↓
Attempt email
```

If email delivery fails, the invitation should remain recoverable.

The system should provide a retry/resend mechanism.

---

# 72. Background Jobs

V1 should avoid a dedicated job queue unless required.

For low-volume operations:

```text
Request
 ↓
Database operation
 ↓
Email
```

may be sufficient.

If asynchronous processing becomes necessary, introduce it behind an abstraction rather than tightly coupling business logic to a specific provider.

---

# 73. API Versioning

The public API should use:

```text
/api/v1/
```

Do not remove or silently change the behavior of V1 endpoints.

Future breaking changes can use:

```text
/api/v2/
```

---

# 74. Public API Stability

The following should be treated as public contracts:

- Endpoint path
- HTTP method
- Authentication mechanism
- Request structure
- Response structure
- Error codes

Internal database structure must remain invisible to API consumers.

---

# 75. Domain Service Boundaries

Recommended services:

```text
authService
workspaceService
formService
submissionService
leadService
analyticsService
clientService
invitationService
billingService
entitlementService
emailService
rateLimitService
```

These do not necessarily need to be separate packages.

They can be TypeScript modules inside the Next.js application.

---

# 76. Example Submission Service

Conceptually:

```ts
async function processSubmission(input) {
  const form = await getFormByPublicId(input.formPublicId);

  if (!form) {
    throw new AppError("FORM_NOT_FOUND");
  }

  await verifyFormSecret(input.secret, form.secretHash);

  if (form.status !== "active") {
    throw new AppError("FORM_INACTIVE");
  }

  await enforceRateLimit(input);
  await enforceQuota(form.workspaceId);
  await enforceIdempotency(input);

  const lead = await createLead({
    workspaceId: form.workspaceId,
    formId: form.id,
    data: input.data,
    metadata: input.metadata
  });

  return lead;
}
```

The final implementation must include transactional and concurrency protections where required.

---

# 77. UI Authorization

Hiding UI controls is useful but not security.

For example:

```tsx
{isOwner && <BillingSettings />}
```

is good UX.

But the server must still reject unauthorized billing operations.

Never rely on:

```text
disabled button
hidden button
frontend route guard
localStorage role
```

for security.

---

# 78. Route Protection

Dashboard routes should verify authentication.

Client routes should verify client membership.

Example:

```text
/dashboard/*
    → authenticated developer

/client/*
    → authenticated client viewer
```

Do not assume that because a user can navigate to a route they are authorized to access its underlying records.

---

# 79. Cross-Tenant Security

Every tenant-sensitive request must establish:

```text
Current User
 ↓
Workspace Membership
 ↓
Requested Resource
 ↓
Resource belongs to Workspace
```

Never accept a workspace ID from the browser and assume it is authorized.

The server must verify the relationship.

---

# 80. Cross-Form Client Security

For client access:

```text
Current User
 ↓
Client Membership
 ↓
Assigned Form
 ↓
Requested Lead
 ↓
Lead belongs to Assigned Form
```

A client must not access a lead simply by guessing a lead ID.

---

# 81. Billing Security

Billing operations should verify:

```text
Authenticated user
 ↓
Workspace ownership
 ↓
Billing permission
 ↓
Lemon Squeezy operation
```

Clients cannot access billing endpoints.

---

# 82. Secret Security Checklist

Before production:

- [ ] Secrets generated using cryptographically secure randomness
- [ ] Secret hashes stored securely
- [ ] Plaintext secrets not stored unnecessarily
- [ ] Secrets never logged
- [ ] Secrets never returned in ordinary API responses
- [ ] Secrets never exposed to client JavaScript
- [ ] Secret rotation invalidates previous secret
- [ ] Authorization header is not logged
- [ ] Database access is protected by authorization/RLS

---

# 83. Security Threat Model

The implementation should explicitly consider:

### Threat: Cross-tenant data access

Mitigation:

- RLS
- Server authorization
- Workspace ownership checks

### Threat: Form secret brute force

Mitigation:

- High entropy secrets
- Rate limiting
- Generic authentication errors

### Threat: Duplicate submissions

Mitigation:

- Idempotency keys
- Request tracking

### Threat: API abuse

Mitigation:

- Rate limiting
- Payload limits
- Quotas

### Threat: XSS through lead data

Mitigation:

- Escaped rendering
- No raw HTML rendering

### Threat: Billing webhook forgery

Mitigation:

- Signature verification

### Threat: Secret exposure

Mitigation:

- Server-only storage/access
- Safe logging

---

# 84. Testing Architecture

Testing should cover at least:

### Unit tests

- Plan limits
- Entitlements
- Validation
- Status transitions
- Secret verification
- Utility functions

### Integration tests

- Authentication
- Workspace authorization
- Form creation
- Submission API
- Lead creation
- Client permissions
- Billing webhook processing

### End-to-end tests

- Signup
- Create form
- Submit lead
- View lead
- Invite client
- Client accepts invitation
- Client views lead
- Upgrade subscription

---

# 85. Critical Security Tests

The following tests are mandatory:

```text
User A cannot read Workspace B
User A cannot update Workspace B
Client A cannot access Client B's form
Client cannot access form secrets
Client cannot access billing
Client cannot create forms
Invalid form secret is rejected
Archived form rejects submissions
Quota is enforced
Rate limit is enforced
Duplicate idempotency key does not create duplicate lead
Forged billing webhook is rejected
```

---

# 86. CI Quality Gates

Before merging/deploying:

```text
TypeScript compilation
Lint
Unit tests
Integration tests
Build
```

Recommended commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Use the repository's existing commands if they differ.

Do not invent duplicate tooling if the repository already has an established setup.

---

# 87. Existing Repository Inspection Rule

## Recommended Directory Structure

```text
src/
  app/
    (marketing)/
      page.tsx
      pricing/
      docs/
      contact/
      privacy/
      terms/
    (auth)/
      login/
      register/
      forgot-password/
      reset-password/
      verify-email/
    (developer)/
      dashboard/
      forms/
      submissions/
      analytics/
      clients/
      billing/
      settings/
    (client)/
      client/
        page.tsx
        forms/
        settings/
    invite/
      [token]/
    api/
      f/
        [formId]/
      webhooks/
        lemonsqueezy/
  components/
    ui/
    marketing/
    dashboard/
    forms/
    submissions/
    clients/
    billing/
  lib/
    auth/
    authorization/
    db/
    validation/
    email/
    billing/
    rate-limit/
    analytics/
    config/
  services/
    forms/
    submissions/
    invitations/
    subscriptions/
    usage/
  types/
  tests/
supabase/
  migrations/
  seed.sql
```
```

The agent must understand what already exists before replacing code.

---

# 88. Reuse Rule

If the existing repository already contains:

- Authentication
- Supabase configuration
- UI components
- Layouts
- Design tokens
- Database utilities
- API utilities
- Testing infrastructure

reuse and extend them when they are sound.

Do not rebuild working infrastructure merely for stylistic reasons.

---

# 89. Migration Strategy

Database changes should use versioned Supabase migrations.

Never manually modify production schema without a corresponding migration.

Migration naming should be descriptive.

Example:

```text
202610050001_create_workspaces.sql
202610050002_create_forms.sql
202610050003_create_leads.sql
```

Actual timestamps/names may differ.

---

# 90. Seed Data

Development seed data may include:

- Test workspace
- Test form
- Test leads
- Test client viewer

Seed data must never contain production credentials or secrets.

---

# 91. Observability

Production observability should make it possible to answer:

```text
Did the request arrive?
Was authentication successful?
Which form was targeted?
Was authorization successful?
Was the submission accepted?
If rejected, why?
How long did it take?
Did the database operation succeed?
Did the email provider fail?
Did the billing webhook process?
```

Avoid logging full customer lead payloads.

---

# 92. Graceful Degradation

External service failures should be handled deliberately.

### Resend unavailable

Core lead capture should remain operational.

### Lemon Squeezy unavailable

Existing local billing state should continue to control access until synchronized.

### Supabase unavailable

The application should show a clear temporary error rather than corrupting state.

---

# 93. API Reliability

The public submission endpoint is the most business-critical endpoint.

Priorities:

1. Validate safely
2. Authenticate securely
3. Avoid duplicate leads
4. Respect quota
5. Persist reliably
6. Return predictable responses

Do not make non-essential external calls part of the critical submission path.

---

# 94. Submission Path

The preferred critical path is:

```text
Request
 ↓
Authentication
 ↓
Authorization
 ↓
Quota / rate limit
 ↓
Database transaction
 ↓
Success response
```

Do not make lead creation depend on:

```text
Resend
Analytics provider
AI model
CRM
Slack
WhatsApp
Zapier
```

Those features are out of scope for V1.

---

# 95. Future Extensibility

The architecture should allow future features such as:

- Embedded Form Builder
- Webhooks
- Email notifications
- Slack integration
- WhatsApp integration
- Zapier/Make/n8n
- AI lead qualification
- Advanced CRM
- Custom domains
- White labeling
- Team roles
- Advanced analytics

However, V1 must not implement these merely to prepare for them.

Create clean interfaces where useful, not speculative infrastructure.

---

# 96. Explicit V1 Non-Architecture

Do not implement:

```text
Microservices
Kubernetes
GraphQL
Kafka
Complex event bus
AI processing pipeline
CRM pipeline engine
Email marketing infrastructure
WhatsApp infrastructure
Slack integration
Zapier integration
Embedded form builder
White-label system
Custom-domain infrastructure
Enterprise SSO
```

unless explicitly added to a future product specification.

---

# 97. Recommended Implementation Order

Implement in this order:

### Phase 1 — Foundation

```text
Repository inspection
Dependencies
Environment configuration
Supabase setup
Database migrations
Authentication
Base layouts
Design system
```

### Phase 2 — Workspace

```text
Workspace creation
Workspace membership
Dashboard shell
Authorization helpers
RLS
```

### Phase 3 — Forms

```text
Form creation
Form list
Form detail
Public form ID
Secret generation
Secret hashing
Secret rotation
Archive
```

### Phase 4 — Submission API

```text
POST endpoint
Validation
Secret verification
Rate limiting
Quota enforcement
Idempotency
Lead creation
Error handling
```

### Phase 5 — Lead Management

```text
Lead list
Search
Filters
Pagination
Lead detail
Status changes
Archive
```

### Phase 6 — Analytics

```text
Lead metrics
Status distribution
Trend data
Form-level analytics
```

### Phase 7 — Client Access

```text
Invitations
Resend integration
Invitation acceptance
Viewer permissions
Client dashboard
```

### Phase 8 — Billing

```text
Plan configuration
Lemon Squeezy checkout
Webhook
Subscription state
Entitlements
Usage limits
Billing UI
```

### Phase 9 — Quality

```text
Security testing
E2E testing
Performance
Responsive UI
Accessibility
Error states
Production deployment
```

---

# 98. Technical Definition of Done

The technical architecture is considered successfully implemented when:

- [ ] Next.js application builds successfully
- [ ] TypeScript passes
- [ ] Authentication works
- [ ] Workspace isolation works
- [ ] RLS policies are active
- [ ] Developer authorization works
- [ ] Client authorization works
- [ ] Form creation works
- [ ] Form secrets are secure
- [ ] Secret rotation works
- [ ] Public submission API works
- [ ] Invalid secrets are rejected
- [ ] Archived forms reject submissions
- [ ] Rate limiting exists
- [ ] Payload limits exist
- [ ] Idempotency works
- [ ] Leads are created correctly
- [ ] Lead statuses work
- [ ] Analytics work
- [ ] Client invitations work
- [ ] Resend emails work
- [ ] Lemon Squeezy billing works
- [ ] Lemon Squeezy webhooks are verified
- [ ] Billing state is synchronized
- [ ] Plan limits are enforced
- [ ] No Stripe code exists
- [ ] Secrets are not exposed to clients
- [ ] Sensitive data is not logged
- [ ] Mobile layouts work
- [ ] Loading/error/empty states exist
- [ ] Tests pass
- [ ] Production build succeeds
- [ ] Vercel deployment works

---

# 99. Final Architecture

The final V1 architecture is:

```text
                         FORMIVO
                            │
             ┌──────────────┴──────────────┐
             │                             │
        Marketing                    Application
             │                             │
             │                       Next.js App
             │                             │
             │            ┌────────────────┼────────────────┐
             │            │                │                │
             │       Developer UI      Client UI       Public API
             │            │                │                │
             │            └────────────────┼────────────────┘
             │                             │
             │                     Domain Services
             │                             │
             │        ┌────────────────────┼────────────────────┐
             │        │                    │                    │
             │      Forms                 Leads              Clients
             │        │                    │                    │
             │        └────────────────────┼────────────────────┘
             │                             │
             │                    Authorization
             │                             │
             │                     Supabase Auth
             │                             │
             │                       PostgreSQL
             │                             │
             │                           RLS
             │
             └─────────────────────────────┐
                                           │
                    ┌──────────────────────┼─────────────────────┐
                    │                      │                     │
              Lemon Squeezy              Resend               Vercel
                 Billing                 Email               Hosting
```

---

# 100. Final Engineering Rules

The AI coding agent must follow these rules throughout implementation:

1. **Inspect before modifying.**
2. **Reuse working repository infrastructure.**
3. **Use TypeScript strictly.**
4. **Keep business logic out of UI components.**
5. **Use server-side authorization.**
6. **Use Supabase RLS for tenant isolation.**
7. **Never trust client-provided workspace or role information.**
8. **Never expose secrets to the browser.**
9. **Never log secrets.**
10. **Treat all lead data as untrusted input.**
11. **Use Zod or equivalent validation for external input.**
12. **Use pagination for lead collections.**
13. **Centralize plan limits and entitlements.**
14. **Make billing webhooks idempotent.**
15. **Verify Lemon Squeezy webhook signatures.**
16. **Use Resend only from the server.**
17. **Do not add Stripe.**
18. **Do not implement the Embedded Form Builder in V1.**
19. **Do not implement AI features in V1.**
20. **Do not introduce unnecessary infrastructure.**
21. **Keep public API contracts stable.**
22. **Provide proper loading, empty, success, and error states.**
23. **Test cross-tenant and cross-role access explicitly.**
24. **Optimize for production reliability rather than demo-only functionality.**
25. **The final product must feel like a real commercial SaaS, not an AI-generated template.**

---

## Architecture Principle

The most important architectural rule for Formivo is:

> **Keep the system simple internally while making the product powerful externally.**

Formivo V1 should be a secure, well-structured Next.js monolith with Supabase providing authentication and PostgreSQL, Lemon Squeezy providing billing, Resend providing transactional email, and Vercel providing deployment.

The architecture must be small enough to maintain easily, but disciplined enough to support real customers and future product expansion.
