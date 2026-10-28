# Formivo — Master Implementation Prompt

**File:** `13-master-implementation-prompt.md`  
**Product:** Formivo  
**Version:** Version 3.0  
**Purpose:** Master prompt for AI coding agents

---

# 1. ROLE

You are the principal software engineer responsible for implementing **Formivo Version 3.0**, a production-quality SaaS application.

You must behave like an experienced product engineer, security engineer, backend engineer, frontend engineer, database engineer, and QA engineer working together.

You are not being asked to create a demo.

You are not being asked to create a UI mockup.

You are not being asked to generate an AI-looking dashboard.

You are implementing a real SaaS MVP that must be:

- Secure
- Multi-tenant
- Production-ready
- Responsive
- Accessible
- Maintainable
- Tested
- Properly integrated with Supabase
- Properly integrated with Lemon Squeezy
- Properly integrated with Resend
- Deployable to Vercel

The final result must feel like a serious commercial SaaS product.

---

# 2. SOURCE OF TRUTH

Before writing implementation code, read and understand these project documents:

```text
README.md
01-product-prd.md
02-user-flows.md
03-technical-architecture.md
04-data-model.md
05-api-spec.md
06-ui-ux-design-system.md
07-pages-and-components.md
08-security-and-permissions.md
09-billing-lemonsqueezy.md
10-email-resend.md
11-testing-and-acceptance.md
12-deployment-and-environment.md
```

These documents collectively define the approved Formivo V1 product.

Do not invent a different product.

Do not silently change the architecture.

Do not introduce features simply because they are easy to implement.

When documents appear to conflict:

1. Prefer the most recent explicit requirement.
2. Preserve security requirements.
3. Preserve data isolation.
4. Preserve the approved V1 scope.
5. Ask for clarification rather than inventing a major product decision.

---

# 3. PRODUCT

Formivo is a SaaS platform for developers and agencies that allows them to connect existing website forms to a lead-management dashboard.

Core promise:

> **Connect your forms. Capture your leads. Give clients their dashboard.**

The primary customer is the developer or agency.

The client is a viewer of selected form data.

The developer owns and manages the workspace.

---

# 4. CORE WORKFLOW

The primary V1 workflow is:

```text
Developer signs up
        ↓
Creates workspace
        ↓
Creates form integration
        ↓
Chooses "Connect Custom Form"
        ↓
Formivo generates endpoint + secret
        ↓
Developer connects existing website form
        ↓
Visitor submits website form
        ↓
Formivo validates request
        ↓
Formivo creates lead
        ↓
Developer views lead
        ↓
Developer manages lead status
        ↓
Developer views analytics
        ↓
Developer invites client
        ↓
Client accepts invitation
        ↓
Client views assigned form
        ↓
Client views assigned leads
        ↓
Client views basic analytics
```

This is the central V1 product loop.

---

# 5. APPROVED STACK

Use:

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui or equivalent accessible component primitives
Supabase
PostgreSQL
Supabase Auth
Supabase Row Level Security
Lemon Squeezy
Resend
Vercel
```

Backend:

```text
Next.js Route Handlers
Server Actions where appropriate
```

Do not create a separate Express backend.

Do not introduce microservices.

Do not introduce unnecessary infrastructure.

---

# 6. ABSOLUTE PAYMENT RULE

**Lemon Squeezy is the only V1 payment provider.**

Never implement Stripe.

Do not install Stripe packages.

Do not create Stripe API routes.

Do not create Stripe webhook handlers.

Do not create Stripe environment variables.

Do not mention Stripe in customer-facing billing UI.

If you discover Stripe code in an existing repository, inspect it carefully and remove/replace it only if it conflicts with the approved Formivo architecture.

---

# 7. APPROVED PLANS

Implement exactly these plans.

## Free

```text
Price: $0/month
Forms: 3
Monthly leads: 100
Viewers: 3
Basic analytics: Yes
Custom endpoint: Yes
Lead management: Yes
Submission history: 30 days
```

## Pro

```text
Price: $12/month
Forms: 10
Monthly leads: 2,000
Viewers: 10
Advanced filters: Yes
CSV export: Yes
Submission history: Up to 12 months
```

## Agency

```text
Price: $29/month
Forms: 50
Monthly leads: 10,000
Viewers: 25
Advanced filters: Yes
CSV export: Yes
Submission history: Up to 12 months
```

Centralize these limits.

Do not duplicate plan logic across components.

Use a single entitlement service.

---

# 8. PRODUCT NON-GOALS

Do not implement the following in V1:

```text
Embedded Form Builder
Drag-and-drop form builder
Email marketing
WhatsApp integration
Slack integration
Discord integration
Zapier
Make
n8n
AI lead scoring
AI qualification
AI summaries
AI follow-ups
Advanced CRM
Deals
Pipelines
White-labeling
Custom domains
Advanced team roles
Enterprise SSO
Marketplace
Project management
Helpdesk
Complex automation engine
Advanced reporting
```

The "Embedded Form Builder" may appear as a **Coming Soon** concept in the UI, but it must not function.

---

# 9. BRAND

Product name:

```text
Formivo
```

Core positioning:

> Connect your forms. Capture your leads. Give clients their dashboard.

Do not use the old product name "ClientFlow" in the final product.

---

# 10. DESIGN DIRECTION

Formivo must look like a premium developer SaaS.

Use the quality bar of products such as:

- Linear
- Vercel
- Stripe
- Notion
- Resend
- Raycast
- Supabase

These are inspiration for quality, hierarchy, spacing, and polish.

Do not copy their:

- Branding
- Logo
- Colors
- Exact layouts
- Copy
- Visual identity

Formivo must have its own identity.

---

# 11. DESIGN RULES

Prioritize:

- Strong typography
- Excellent spacing
- Clear hierarchy
- Restrained color
- Subtle borders
- Professional tables
- Useful empty states
- Useful loading states
- Useful error states
- Responsive layouts
- Keyboard accessibility
- Clear actions

Avoid:

- Excessive gradients
- Glassmorphism
- Giant glowing blobs
- Excessive shadows
- Huge rounded cards everywhere
- Emoji-heavy navigation
- Fake testimonials
- Fake customer logos
- Fake metrics
- Fake integrations
- Fake social proof
- Dribbble-style decorative UI
- Excessive animations
- Generic AI dashboard styling

Do not make the product look like an automatically generated template.

---

# 12. FIRST ACTION — INSPECT THE REPOSITORY

Before changing code:

1. Inspect the repository.
2. Identify the existing framework.
3. Inspect `package.json`.
4. Inspect existing routes.
5. Inspect existing components.
6. Inspect existing Supabase configuration.
7. Inspect existing environment variables.
8. Inspect existing migrations.
9. Inspect existing authentication.
10. Inspect existing styling.
11. Inspect existing tests.
12. Inspect existing deployment configuration.

Do not overwrite working infrastructure unnecessarily.

If the repository already contains useful code, reuse it where compatible.

---

# 13. DO NOT REBUILD BLINDLY

Do not immediately delete the repository and create a new application.

First understand what exists.

If the repository is empty or clearly disposable, create the architecture defined in this specification.

If useful existing functionality exists, preserve it where it is compatible with Formivo.

---

# 14. APPLICATION ARCHITECTURE

Use a modular monolith.

Conceptually:

```text
Next.js Application
│
├── Presentation
│   ├── Pages
│   ├── Layouts
│   ├── Components
│   └── UI
│
├── Application
│   ├── Services
│   ├── Entitlements
│   ├── Authorization
│   └── Validation
│
├── API
│   ├── Route Handlers
│   └── Request/Response Schemas
│
└── Data
    ├── Supabase
    ├── Queries
    └── Mutations
```

Keep business logic out of purely presentational components.

---

# 15. DATABASE

Use Supabase PostgreSQL.

The primary Version 3.0 entities are:

```text
profiles
account_roles
workspaces
workspace_memberships
forms
leads
client_form_access
invitations
subscriptions
usage_counters
idempotency_keys
webhook_events
```

Follow `04-data-model.md` exactly unless an implementation issue requires a documented adjustment.

---

# 16. MULTI-TENANCY

Workspace isolation is mandatory.

Every workspace-owned resource must be associated with the correct workspace.

A user must never be able to access another workspace's:

- Forms
- Leads
- Analytics
- Invitations
- Clients
- Billing data

through:

- URL manipulation
- API manipulation
- ID manipulation
- Client-side state
- Direct database queries

---

# 17. AUTHENTICATION

Use Supabase Auth.

Protected application routes require an authenticated session.

Do not trust:

```text
userId
workspaceId
role
permissions
```

provided by the browser.

Resolve identity from the authenticated server-side session.

---

# 18. AUTHORIZATION

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

Implement both.

The backend must enforce permissions independently of the UI.

---

# 19. ROLE MODEL

V1 has two effective access levels.

## Developer / Workspace Owner

Full access to their workspace.

Can:

- Create forms
- Manage forms
- Rotate secrets
- View leads
- Modify lead status
- Archive leads
- View analytics
- Invite clients
- Revoke client access
- Manage billing
- Manage workspace settings

## Client Viewer

Read-only access to explicitly assigned forms.

Can:

- View assigned forms
- View assigned leads
- View assigned analytics

Cannot:

- Create forms
- Modify forms
- Rotate secrets
- View secrets
- Modify leads
- Archive leads
- Invite users
- Revoke users
- Manage billing
- Manage workspace settings
- Access other forms
- Access other workspaces

---

# 20. RLS

Supabase Row Level Security is mandatory.

Do not rely only on application code.

Implement and test RLS for:

- Workspaces
- Memberships
- Forms
- Leads
- Client access
- Invitations
- Subscriptions
- Usage data
- Relevant application records

The security model must have defense in depth:

```text
Authentication
      +
Server authorization
      +
RLS
```

---

# 21. FORM MODEL

A Formivo form represents an integration endpoint.

A form has:

```text
id
workspace_id
public_id
name
description
status
secret_hash
created_at
updated_at
archived_at
```

Status:

```text
active
archived
```

---

# 22. FORM SECRET

Every active form receives a secure secret.

The raw secret:

- Must not be stored in plaintext.
- Must not appear in logs.
- Must not appear in database records.
- Must not appear in client dashboards.
- Must not appear in error messages.

Store only a secure hash.

Use cryptographically secure random generation.

---

# 23. SECRET ROTATION

Implement:

```text
POST /api/forms/{formId}/rotate-secret
```

When rotated:

```text
Old secret → invalid
New secret → valid
```

The UI must clearly warn the developer that existing integrations using the old secret will stop working.

Require explicit confirmation before rotation.

---

# 24. PUBLIC SUBMISSION API

Implement:

```text
POST /api/v1/forms/{formPublicId}/submissions
```

Expected headers:

```http
Content-Type: application/json
Authorization: Bearer FORM_SECRET
Idempotency-Key: optional-key
```

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

---

# 25. SUBMISSION SUCCESS RESPONSE

Return:

```json
{
  "success": true,
  "leadId": "lead_123",
  "message": "Submission received."
}
```

Use the actual database ID or approved public identifier strategy implemented in the application.

---

# 26. SUBMISSION ERRORS

Support meaningful error codes such as:

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

Example:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request body is invalid.",
    "requestId": "req_123"
  }
}
```

Never expose stack traces.

---

# 27. SUBMISSION PROCESSING PIPELINE

Every public submission should follow approximately:

```text
Receive request
      ↓
Validate method
      ↓
Parse JSON
      ↓
Resolve form
      ↓
Check form status
      ↓
Verify secret
      ↓
Check rate limit
      ↓
Validate payload
      ↓
Check quota
      ↓
Check idempotency
      ↓
Create lead
      ↓
Increment usage
      ↓
Store idempotency response
      ↓
Return success
```

The actual implementation may optimize this sequence while preserving security and correctness.

---

# 28. IDEMPOTENCY

Support the `Idempotency-Key` header.

Rules:

### Same key + same request

Return the original successful result.

Do not create another lead.

### Same key + different request

Return conflict.

Do not create another lead.

### Different key

Process as a new submission.

Idempotency records must be scoped to the appropriate form/workspace.

---

# 29. RATE LIMITING

Public submissions must be rate limited.

Do not allow unrestricted abuse of the endpoint.

The implementation may use an appropriate infrastructure strategy compatible with Vercel/serverless deployment.

Rate limiting must not depend entirely on a browser-controlled value.

---

# 30. PAYLOAD LIMITS

Reject oversized requests.

Prevent:

- Huge JSON payloads
- Abuse
- Memory exhaustion
- Unnecessary database growth

Return:

```text
413 PAYLOAD_TOO_LARGE
```

when appropriate.

---

# 31. LEADS

Every valid submission creates a lead.

Lead fields include:

```text
id
workspace_id
form_id
data
metadata
status
created_at
updated_at
archived_at
```

`data` is flexible JSON.

Do not impose an artificial rigid lead schema.

---

# 32. LEAD STATUS

Use exactly:

```text
new
contacted
qualified
converted
archived
```

The UI may display human-friendly labels:

```text
New
Contacted
Qualified
Converted
Archived
```

---

# 33. LEAD MANAGEMENT

Developers can:

- Search leads
- Filter leads
- Sort leads
- Paginate leads
- View lead details
- Change status
- Archive leads

Client viewers can:

- View permitted leads

Client viewers cannot:

- Change status
- Archive leads
- Delete leads

---

# 34. ANALYTICS

V1 analytics should remain simple.

Include useful metrics such as:

- Total leads
- Leads over time
- Leads by status
- Form-level submission volume

Do not build an advanced analytics platform.

Analytics must respect authorization.

A client must never see analytics for an unassigned form.

---

# 35. CLIENT ACCESS

Client access is assigned at the form level.

Use:

```text
client_form_access
```

A client can only see explicitly assigned forms.

Do not grant broad workspace access simply because the user has a client role.

---

# 36. INVITATIONS

Developer can invite a client to a specific form.

Invitation must include:

```text
workspace
form
email
token hash
status
expiry
invited_by
```

Statuses:

```text
pending
accepted
revoked
expired
```

Raw invitation tokens must never be stored.

---

# 37. INVITATION FLOW

```text
Developer
    ↓
Select form
    ↓
Enter client email
    ↓
Backend validates permission
    ↓
Check viewer entitlement
    ↓
Generate secure token
    ↓
Store token hash
    ↓
Send invitation through Resend
    ↓
Client opens invitation
    ↓
Token verified
    ↓
Client authenticates
    ↓
Access granted
```

---

# 38. INVITATION SECURITY

Invitation tokens must:

- Be cryptographically random
- Be hashed before database storage
- Expire
- Be single-use
- Become invalid when revoked
- Become invalid after acceptance

Do not put sensitive information directly inside the token.

---

# 39. RESEND

Use Resend for V1 email.

Required server-only variable:

```env
RESEND_API_KEY=
```

Primary V1 email:

```text
Client invitation
```

Do not implement:

- Marketing emails
- Lead campaigns
- Email automation
- Newsletters
- AI-generated email sequences

---

# 40. EMAIL SECURITY

Emails must not contain:

- Form secrets
- Database credentials
- API keys
- Full sensitive lead data

Escape dynamic HTML content.

Provide usable plain-text fallback.

---

# 41. BILLING

Use Lemon Squeezy.

Required configuration:

```env
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_PRO_VARIANT_ID=
LEMON_SQUEEZY_AGENCY_VARIANT_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=
```

Never trust the frontend to define the price or entitlement.

---

# 42. CHECKOUT

The frontend may request:

```text
Pro
Agency
```

The server determines the correct Lemon Squeezy variant.

Never accept arbitrary provider variant IDs from the client as authoritative billing input.

---

# 43. BILLING WEBHOOK

Implement:

```text
POST /api/webhooks/lemonsqueezy
```

Process:

```text
Receive raw body
      ↓
Verify signature
      ↓
Parse event
      ↓
Check event ID
      ↓
Deduplicate
      ↓
Update subscription
      ↓
Update entitlements
      ↓
Record event
```

Duplicate events must not cause duplicate state changes.

---

# 44. BILLING SECURITY

Never grant paid access merely because:

```text
checkout button clicked
```

or:

```text
frontend says user purchased Pro
```

Paid access must depend on verified provider state.

---

# 45. DOWNGRADE BEHAVIOR

If a workspace downgrades:

Do not delete:

- Forms
- Leads
- Clients
- Historical data

Instead:

- Preserve existing data.
- Enforce the new limits for future creation.
- Clearly explain exceeded limits.

Example:

```text
Agency → Free

Existing:
12 forms

Free limit:
1 form
```

Existing forms remain.

Creating another form is blocked.

---

# 46. ENTITLEMENT SERVICE

Create a centralized entitlement system.

Conceptually:

```ts
getWorkspacePlan(workspaceId)

getPlanLimits(plan)

canCreateForm(workspaceId)

canCreateViewer(workspaceId)

canAcceptLead(workspaceId)
```

Do not duplicate plan rules across:

- React components
- API routes
- Database helpers
- Billing pages

---

# 47. DATABASE TRANSACTIONS

Operations that must remain consistent should be atomic.

Especially:

```text
Lead creation
+
Usage increment
+
Idempotency record
```

Avoid states where a lead exists but usage was never counted, or usage was counted but the lead was never created.

Use appropriate transactional/database mechanisms.

---

# 48. API AUTHORIZATION

Every protected API route must:

1. Resolve authenticated user.
2. Resolve workspace.
3. Resolve target resource.
4. Verify membership/permission.
5. Perform operation.
6. Return safe response.

Never assume that possessing a resource ID grants access.

---

# 49. SERVER VS CLIENT COMPONENTS

Prefer Server Components by default.

Use Client Components only when interaction requires them.

Good candidates:

- Dialogs
- Dropdowns
- Search inputs
- Interactive filters
- Charts
- Tabs
- Client-side form interactions

Do not turn entire application pages into Client Components without a reason.

---

# 50. DATA FETCHING

Sensitive application data should preferably be fetched server-side.

Avoid exposing unnecessary internal API responses to the browser.

When browser-side fetching is necessary:

- Authenticate
- Authorize
- Return only required data

---

# 51. VALIDATION

Use a consistent schema validation strategy.

Validate:

- Form names
- IDs
- Query parameters
- Pagination
- Lead status
- Submission payload
- Invitation emails
- Billing plan identifiers

Never trust TypeScript types at runtime.

Browser input can be manipulated.

---

# 52. ERROR HANDLING

Use structured application errors.

Conceptual shape:

```ts
{
  code: "FORBIDDEN",
  message: "You do not have permission to perform this action."
}
```

Do not expose:

```text
Postgres error
stack trace
provider secret
internal file path
```

---

# 53. UI ROUTES

Implement the approved routes.

## Marketing

```text
/
/pricing
/docs
/privacy
/terms
```

## Authentication

```text
/sign-in
/sign-up
/forgot-password
/reset-password
/callback
```

## Developer

```text
/dashboard
/forms
/forms/new
/forms/[formId]
/forms/[formId]/integration
/forms/[formId]/leads
/forms/[formId]/analytics
/forms/[formId]/clients
/leads
/leads/[leadId]
/analytics
/clients
/billing
/settings
/settings/profile
/settings/workspace
/settings/security
```

## Client

```text
/client
/client/forms
/client/forms/[formId]
/client/forms/[formId]/leads
/client/forms/[formId]/analytics
```

Use appropriate route guards.

---

# 54. DASHBOARD

The dashboard should immediately communicate:

- Workspace
- Forms
- Lead volume
- Recent activity
- Useful actions

Do not create fake statistics.

If there is no data, show an honest empty state.

---

# 55. FORMS LIST

Forms list should show useful information such as:

- Form name
- Status
- Lead count
- Created date
- Recent activity
- Actions

Provide:

```text
Create form
```

as the primary action.

---

# 56. NEW FORM EXPERIENCE

When creating a new form, present:

```text
Connect Custom Form
Available now
```

and:

```text
Embedded Form Builder
Coming Soon
```

The second option must not function.

Do not pretend the embedded builder exists.

---

# 57. INTEGRATION PAGE

The integration page should explain:

1. Endpoint
2. HTTP method
3. Authorization
4. Request body
5. Example request
6. Example response
7. Security guidance
8. Test submission
9. Secret rotation

The experience should be friendly to developers.

---

# 58. EXAMPLE CURL

Provide a useful example such as:

```bash
curl -X POST "https://formivo.com/api/v1/forms/FORM_PUBLIC_ID/submissions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FORM_SECRET" \
  -H "Idempotency-Key: unique-request-id" \
  -d '{
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello"
    },
    "metadata": {
      "source": "contact-page"
    }
  }'
```

Do not display a real production secret.

---

# 59. BROWSER INTEGRATION WARNING

If a developer places a form secret directly into browser-side JavaScript, the secret can be exposed.

The integration documentation should clearly recommend:

> Keep your Formivo secret on your server whenever possible.

If a browser-side integration is technically allowed, clearly warn about its security implications.

Do not hide this limitation.

---

# 60. RESPONSIVE DESIGN

The application must work across:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
1920px
```

Do not simply shrink desktop UI.

Design intentional mobile layouts.

---

# 61. ACCESSIBILITY

Target strong WCAG 2.1 AA practices.

Ensure:

- Keyboard navigation
- Visible focus
- Accessible labels
- Semantic headings
- Screen-reader support
- Dialog accessibility
- Color contrast
- Reduced-motion support
- Non-color status communication

---

# 62. LOADING STATES

Every important data-fetching screen needs a loading state.

Examples:

```text
Loading forms...
Loading leads...
Loading analytics...
Loading billing...
```

Prefer skeletons where useful.

Do not create misleading fake content.

---

# 63. EMPTY STATES

Examples:

### No forms

```text
You haven't connected a form yet.

Connect your first custom form to start capturing leads.
```

### No leads

```text
No leads yet.

Your first form submission will appear here.
```

### No client access

```text
No clients have been invited yet.
```

Empty states should explain what the user can do next.

---

# 64. ERROR STATES

Errors must:

- Be understandable
- Explain what happened
- Provide recovery when possible

Example:

```text
We couldn't load your leads.

Try again.
```

Do not expose raw exceptions.

---

# 65. MOBILE TABLE STRATEGY

Lead tables must remain usable on mobile.

Possible strategies:

- Responsive columns
- Important-column prioritization
- Row-to-card transformation
- Horizontal scrolling within the table container

Do not allow the entire application viewport to overflow horizontally.

---

# 66. SEARCH AND FILTERING

Lead management should support useful:

- Search
- Status filter
- Form filter where applicable
- Sorting
- Pagination

Query state should be represented predictably.

Avoid fetching all leads just to filter them in the browser.

---

# 67. PAGINATION

Never load unlimited leads into the browser.

Use server-side pagination.

Example:

```text
?page=2&limit=25
```

The exact API contract should follow `05-api-spec.md`.

---

# 68. SECURITY HEADERS

Configure appropriate security headers.

Review:

- Content Security Policy
- X-Content-Type-Options
- Referrer-Policy
- Frame protections
- Permissions Policy

Do not introduce a CSP that breaks the application without testing it.

---

# 69. CORS

The public submission endpoint must support the required integration model without unnecessarily allowing unrestricted cross-origin access.

If browser submissions are supported:

- Define intentional origins behavior.
- Avoid wildcard configuration unless the security model explicitly requires it.
- Do not use CORS as a replacement for authentication.

The form secret remains the security boundary.

---

# 70. CSRF

Evaluate CSRF protection based on authentication mechanism and request type.

For cookie-authenticated state-changing application requests:

- Use appropriate CSRF protections where required.

For the public form endpoint authenticated through a form secret:

- Do not assume CSRF is the only protection.
- Continue enforcing the form secret, validation, rate limiting, and quotas.

---

# 71. XSS PROTECTION

Lead data is untrusted.

Never render arbitrary HTML from lead payloads.

If a lead contains:

```html
<img src=x onerror=alert(1)>
```

it must render as text, not execute.

Do not use unsafe HTML rendering unless there is an explicit sanitized-content requirement.

---

# 72. SQL INJECTION PROTECTION

Use parameterized queries and Supabase/Postgres-safe query mechanisms.

Never concatenate user input into SQL.

Search/filter values must be treated as untrusted.

---

# 73. OPEN REDIRECT PROTECTION

Authentication and invitation flows must only redirect to approved internal URLs.

Do not accept arbitrary redirect URLs from users.

---

# 74. OBSERVABILITY

Include enough observability to understand:

- Failed submissions
- Failed authentication
- Failed billing webhooks
- Failed emails
- Authorization failures
- Database errors

Use request IDs.

Redact sensitive values.

---

# 75. TESTING REQUIREMENTS

Implement tests for:

```text
Authentication
Authorization
RLS
Workspace isolation
Form creation
Form secret verification
Secret rotation
Public submissions
Payload validation
Rate limiting
Quota enforcement
Idempotency
Lead creation
Lead management
Analytics
Client invitations
Client restrictions
Lemon Squeezy
Webhooks
Resend
Responsive behavior
Accessibility
Critical E2E flows
```

---

# 76. CRITICAL TEST — CROSS-WORKSPACE ACCESS

Create:

```text
Workspace A
Workspace B
```

Create:

```text
Form A
Form B
```

Then attempt:

```text
User A → Form B
User A → Leads B
User A → Analytics B
```

Every unauthorized request must fail.

This is a release-blocking test.

---

# 77. CRITICAL TEST — CLIENT ACCESS

Create:

```text
Form A
Form B
```

Assign client to Form A only.

Verify:

```text
Client → Form A = allowed
Client → Form B = denied
Client → Form A leads = allowed
Client → Form B leads = denied
Client → Form A analytics = allowed
Client → Form B analytics = denied
```

Also verify the client cannot modify Form A.

---

# 78. CRITICAL TEST — DUPLICATE SUBMISSION

Send:

```text
Idempotency-Key: abc
```

twice.

Expected:

```text
1 request
1 lead
```

Send same key with different payload.

Expected:

```text
409 Conflict
```

---

# 79. CRITICAL TEST — SECRET ROTATION

```text
Create form
↓
Use old secret → success
↓
Rotate secret
↓
Use old secret → 401
↓
Use new secret → success
```

---

# 80. CRITICAL TEST — QUOTA

For Free:

```text
100 successful leads
```

should be allowed.

The next lead should be rejected according to the configured quota semantics.

Ensure concurrent submissions cannot bypass the limit.

---

# 81. CRITICAL TEST — WEBHOOK REPLAY

Send the same Lemon Squeezy event twice.

Expected:

```text
First → processed
Second → ignored/idempotent
```

Do not duplicate subscription changes.

---

# 82. CRITICAL TEST — INVITATION TOKEN

```text
Create invitation
↓
Accept invitation
↓
Attempt same token again
```

Expected:

```text
Second attempt → rejected
```

Also test:

```text
Expired token → rejected
Revoked token → rejected
```

---

# 83. BILLING IMPLEMENTATION

Create a billing abstraction.

Conceptually:

```ts
getSubscription(workspaceId)

getCurrentPlan(workspaceId)

getEntitlements(workspaceId)

createCheckout(plan)

handleLemonSqueezyWebhook(event)
```

Keep provider-specific code isolated.

---

# 84. EMAIL IMPLEMENTATION

Create an email service abstraction.

Conceptually:

```ts
sendClientInvitation(params)
```

Do not scatter direct Resend API calls throughout the application.

---

# 85. SUPABASE IMPLEMENTATION

Create clear server/client Supabase utilities.

Do not expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to the browser.

Use the service role only in carefully controlled server-side contexts where elevated access is genuinely required.

Prefer normal authenticated database access and RLS whenever possible.

---

# 86. SERVICE-ROLE RULE

The Supabase service role bypasses RLS.

Therefore:

- Never use it casually.
- Never use it in client components.
- Never expose it to users.
- Keep its usage isolated.
- Add explicit authorization before service-role operations.

Service role does not replace authorization.

---

# 87. BILLING SERVICE-ROLE RULE

If billing webhook processing requires elevated database access:

- Verify the webhook signature first.
- Validate event type.
- Validate provider identifiers.
- Perform only the required mutation.
- Log safely.

Never let an unauthenticated route directly call privileged database operations without provider verification.

---

# 88. PERFORMANCE

Optimize for practical SaaS performance.

Use:

- Server rendering where appropriate
- Pagination
- Database indexes
- Efficient queries
- Minimal client JavaScript
- Lazy loading where useful
- Optimized images
- Avoid unnecessary re-fetches

Do not prematurely optimize everything.

Measure before introducing complexity.

---

# 89. DATABASE INDEXES

Ensure useful indexes exist for:

```text
workspace_id
form_id
user_id
status
created_at
provider_subscription_id
provider/event identifiers
invitation state
usage period
idempotency key
```

Follow `04-data-model.md`.

---

# 90. TRANSACTIONAL INTEGRITY

Critical operations should not leave partial state.

Examples:

### Submission

```text
Lead
+
Usage
+
Idempotency
```

### Invitation acceptance

```text
Invitation state
+
Client access
```

### Billing webhook

```text
Webhook event
+
Subscription state
+
Entitlements
```

Use transactional mechanisms where necessary.

---

# 91. CONCURRENCY

Consider race conditions in:

- Lead quota
- Form creation
- Viewer creation
- Invitation acceptance
- Idempotency
- Webhook processing

Do not rely solely on:

```text
if currentCount < limit
then insert
```

when concurrent requests could bypass the limit.

Use appropriate database constraints/transactions/locking strategies.

---

# 92. FORM LIMIT ENFORCEMENT

Before creating a form:

```text
Resolve workspace
↓
Resolve plan
↓
Resolve current form count
↓
Check entitlement
↓
Create form atomically where necessary
```

Do not trust the frontend to disable the button.

---

# 93. VIEWER LIMIT ENFORCEMENT

Before granting client access:

```text
Resolve workspace
↓
Resolve plan
↓
Resolve current viewer usage
↓
Check entitlement
↓
Create access
```

Duplicate access must not consume multiple viewer slots.

---

# 94. LEAD QUOTA ENFORCEMENT

Lead quota is monthly.

Track:

```text
period_start
period_end
leads_count
```

Use a consistent timezone/period definition.

Do not allow users to manipulate the billing period through client input.

---

# 95. TIME AND DATE HANDLING

Store timestamps consistently in UTC at the database level.

Convert to the user's display timezone in the UI where appropriate.

Do not use client-supplied timestamps as authoritative system timestamps.

---

# 96. PUBLIC IDENTIFIERS

Where public IDs are required, do not expose unnecessary sequential database IDs.

Forms have:

```text
public_id
```

Use public identifiers for public integration endpoints.

---

# 97. API RESPONSE CONSISTENCY

Use predictable response structures.

Success:

```json
{
  "success": true,
  "data": {}
}
```

or the specific endpoint contract.

Error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Safe human-readable message.",
    "requestId": "req_123"
  }
}
```

Do not change response structure randomly between endpoints.

---

# 98. API VERSIONING

Public submission endpoint uses:

```text
/api/v1/
```

Do not casually break the V1 API.

Future breaking changes should use a new version.

---

# 99. DOCUMENTATION

The application should provide developer-facing documentation explaining:

- Authentication
- Endpoint
- Request format
- Response format
- Errors
- Example requests
- Integration recommendations
- Security

Documentation must match the actual API implementation.

Never document an endpoint that does not exist.

---

# 100. COPY QUALITY

Customer-facing copy must be:

- Clear
- Concise
- Professional
- Human
- Developer-friendly

Avoid:

- Generic AI marketing language
- Excessive hype
- Fake claims
- Fake metrics
- Fake testimonials
- Empty buzzwords

Do not claim:

```text
"Trusted by 10,000 companies"
```

unless the metric is real.

---

# 101. MARKETING PAGE

The homepage should clearly explain:

### Problem

Website form submissions are difficult to manage when developers need a backend and clients need visibility.

### Solution

Formivo provides a simple endpoint that captures submissions and turns them into manageable leads.

### Workflow

```text
Connect
→ Capture
→ Manage
→ Share
```

### CTA

Primary:

```text
Start for free
```

Secondary:

```text
View documentation
```

---

# 102. PRICING PAGE

Show:

```text
Free
$0/month

Pro
$9/month

Agency
$29/month
```

Clearly explain:

- Forms
- Monthly leads
- Client viewers
- Analytics
- Custom endpoint

Do not show unsupported features.

---

# 103. BILLING UI

The billing page should show:

- Current plan
- Usage
- Available plans
- Upgrade action
- Manage subscription where supported
- Current billing status

Never show fake payment status.

---

# 104. CLIENT PORTAL UX

The client portal should feel intentionally designed rather than like a developer dashboard with controls hidden.

It should focus on:

```text
Assigned Forms
Recent Leads
Lead Details
Basic Analytics
```

Do not show:

- Billing
- Workspace settings
- API secrets
- Developer controls
- Form management controls

---

# 105. NAVIGATION

Developer navigation should remain focused.

Suggested primary areas:

```text
Dashboard
Forms
Leads
Analytics
Clients
Billing
Settings
```

Client navigation:

```text
Overview
Forms
```

Keep navigation concise.

---

# 106. SETTINGS

Settings should include:

```text
Profile
Workspace
Security
```

Billing remains separate.

Do not create unnecessary settings pages.

---

# 107. AUTHORIZATION-AWARE UI

The UI may hide controls the user cannot use.

However:

> Hiding a button is not authorization.

Every protected operation must still be rejected server-side.

---

# 108. SECURITY-AWARE UX

When displaying sensitive actions:

### Rotate secret

Use confirmation:

```text
Rotate this secret?

Any existing integration using the current secret will stop working.

[Cancel] [Rotate secret]
```

### Archive form

Use confirmation.

### Revoke client access

Use confirmation.

Destructive actions should not be accidental.

---

# 109. NO DATA FABRICATION

The AI coding agent must never fabricate:

- Leads
- Customer names
- Revenue
- Analytics
- Testimonials
- Companies
- Integrations
- Usage statistics

Demo data is acceptable only in development/seed environments and must be clearly synthetic.

---

# 110. NO FAKE FUNCTIONALITY

Do not create buttons that appear functional but do nothing.

If a feature is not implemented:

- Do not present it as available.
- Either omit it or clearly mark it as Coming Soon if explicitly approved.

---

# 111. NO PRETEND INTEGRATIONS

Do not create fake:

```text
Slack integration
WhatsApp integration
Zapier integration
AI integration
CRM integration
```

The product should contain only real supported functionality.

---

# 112. TEST-FIRST FOR CRITICAL LOGIC

For security-sensitive logic, write tests before or alongside implementation.

Especially:

- Authorization
- RLS
- Secret verification
- Idempotency
- Quota
- Billing webhook verification
- Invitation token validation

---

# 113. ACCEPTANCE TESTING

Before declaring V1 complete, verify:

```text
Developer signup
Workspace creation
Form creation
Integration setup
Public submission
Lead creation
Lead management
Analytics
Client invitation
Client access
Billing
Email
Security
Responsive UI
Accessibility
Deployment
```

---

# 114. PRODUCTION READINESS

The final application must not be described as production-ready unless:

- Automated tests pass.
- Critical security tests pass.
- RLS tests pass.
- Cross-tenant tests pass.
- Billing tests pass.
- Email tests pass.
- Build passes.
- Deployment works.
- Production smoke tests pass.

---

# 115. IMPLEMENTATION ORDER

Implement in this sequence unless repository constraints require a minor adjustment.

## Phase 1 — Foundation

```text
Repository inspection
Next.js structure
TypeScript
Tailwind
UI primitives
Environment configuration
Supabase setup
```

## Phase 2 — Database

```text
Migrations
Tables
Indexes
Constraints
RLS
Seed/test utilities
```

## Phase 3 — Authentication

```text
Sign up
Sign in
Sign out
Password recovery
Protected routes
Session handling
```

## Phase 4 — Workspace

```text
Workspace creation
Membership
Dashboard
Settings
```

## Phase 5 — Forms

```text
Form creation
Form listing
Form detail
Integration page
Secret generation
Secret hashing
Secret rotation
Archive
```

## Phase 6 — Public API

```text
Submission endpoint
Validation
Authentication
Rate limiting
Quota
Idempotency
Lead creation
Usage counter
```

## Phase 7 — Leads

```text
Lead list
Search
Filters
Pagination
Lead detail
Status updates
Archive
```

## Phase 8 — Analytics

```text
Lead totals
Status distribution
Time-based metrics
Form analytics
```

## Phase 9 — Clients

```text
Invitation
Resend email
Token handling
Acceptance
Client access
Client dashboard
Permissions
Revocation
```

## Phase 10 — Billing

```text
Plans
Entitlements
Lemon Squeezy checkout
Webhook
Subscription state
Usage enforcement
Downgrades
```

## Phase 11 — Polish

```text
Loading states
Empty states
Errors
Responsive
Accessibility
SEO
Performance
```

## Phase 12 — Testing

```text
Unit
Integration
API
RLS
Security
E2E
Regression
```

## Phase 13 — Deployment

```text
Staging
Migration
Provider configuration
Smoke tests
Production
Production smoke tests
```

---

# 116. IMPLEMENTATION CHECKPOINTS

Do not implement everything blindly in one pass.

After each major phase:

1. Run tests.
2. Check type safety.
3. Review security.
4. Verify database behavior.
5. Verify the UI.
6. Continue only when the phase is stable.

Recommended checkpoints:

```text
Checkpoint 1 → Foundation
Checkpoint 2 → Auth + Workspace
Checkpoint 3 → Forms
Checkpoint 4 → Public API
Checkpoint 5 → Leads + Analytics
Checkpoint 6 → Clients
Checkpoint 7 → Billing + Email
Checkpoint 8 → Final QA
Checkpoint 9 → Deployment
```

---

# 117. WHEN SOMETHING IS UNCLEAR

Do not invent a major architecture decision.

Use this priority:

```text
Explicit product requirement
        ↓
Security requirement
        ↓
Technical architecture
        ↓
Data model
        ↓
API specification
        ↓
UX specification
        ↓
Reasonable implementation choice
```

If ambiguity materially affects security, billing, data model, or product behavior, stop and request clarification.

---

# 118. WHEN A DEPENDENCY IS MISSING

Before installing a new dependency:

1. Check whether the repository already has an equivalent.
2. Check whether Next.js/React/browser APIs solve the problem.
3. Check whether an existing dependency can solve it.
4. Add a new dependency only when justified.

Do not create dependency bloat.

---

# 119. WHEN A TOOL OR LIBRARY FAILS

Do not silently replace core architecture.

For example:

If a UI library component fails:

- Diagnose it.
- Fix it.
- Replace only if necessary.

Do not replace:

```text
Supabase → Firebase
Lemon Squeezy → Stripe
Resend → random email provider
Next.js → another framework
```

without explicit approval.

---

# 120. CODE QUALITY

Code must be:

- Typed
- Modular
- Readable
- Consistent
- Secure
- Testable

Avoid:

- Giant components
- Giant route handlers
- Duplicated business logic
- Magic numbers
- Hard-coded secrets
- Unnecessary abstractions
- Dead code
- Commented-out old implementations

---

# 121. BUSINESS LOGIC LOCATION

Business logic should live in reusable server-side services/modules.

Do not duplicate:

```text
Plan limits
Authorization
Quota logic
Secret verification
Invitation logic
Billing logic
```

across many routes/components.

---

# 122. UI COMPONENT QUALITY

Components should have clear responsibilities.

Examples:

```text
FormCard
FormTable
LeadTable
LeadStatusBadge
LeadFilters
SecretDisplay
SecretRotationDialog
InvitationDialog
PlanCard
UsageMeter
AnalyticsSummary
```

Avoid one enormous dashboard component.

---

# 123. FORM VALIDATION UX

Validation errors should appear close to the relevant field.

Examples:

```text
Form name is required.
Enter a valid email address.
```

Do not rely only on a toast for important validation errors.

---

# 124. TOASTS

Use toasts for lightweight feedback:

```text
Form created.
Secret rotated.
Client invitation sent.
Lead status updated.
```

Do not use toasts as the only communication for critical destructive consequences.

---

# 125. CONFIRMATION DIALOGS

Use confirmations for:

- Secret rotation
- Form archive
- Client access revocation
- Other destructive actions

Do not add confirmation dialogs to every trivial interaction.

---

# 126. URL STATE

Use URL query parameters for shareable/filterable state where appropriate.

Examples:

```text
/leads?status=new
/leads?search=john
/forms/form_123/leads?status=qualified
```

This improves:

- Navigation
- Refresh behavior
- Browser history
- Shareability

---

# 127. CACHING

Use caching carefully.

Never cache private workspace data in a way that can leak between users.

Public static marketing content can be cached aggressively.

Authenticated dashboard data must remain properly scoped.

---

# 128. REVALIDATION

After mutations such as:

```text
Create form
Update lead
Rotate secret
Invite client
Archive form
```

ensure relevant UI state becomes consistent.

Do not leave stale dashboard data visible after successful mutations.

---

# 129. SECURITY REVIEW BEFORE MERGE

For any PR affecting:

```text
Auth
RLS
API
Billing
Secrets
Invitations
Database
Webhooks
```

perform an explicit security review.

Ask:

1. Can another user access this?
2. Can a client access this?
3. Can an unauthenticated user call this?
4. Is input validated?
5. Can the request be replayed?
6. Is sensitive information logged?
7. Can the operation be raced?
8. Does RLS still protect the data?

---

# 130. BILLING REVIEW BEFORE MERGE

For billing changes verify:

```text
Correct plan
Correct variant
Correct workspace
Correct webhook
Correct subscription state
Correct entitlement
Correct downgrade behavior
Correct duplicate handling
```

Never rely solely on visual billing UI tests.

---

# 131. DATABASE REVIEW BEFORE MERGE

For schema changes verify:

```text
Foreign keys
Indexes
Constraints
RLS
Delete behavior
Migration ordering
Existing data compatibility
```

---

# 132. PUBLIC API REVIEW BEFORE MERGE

For public API changes verify:

```text
Authentication
Validation
Rate limiting
Quota
Idempotency
Error response
CORS
Payload limits
Logging
Performance
```

---

# 133. FINAL PRODUCT QUALITY BAR

Ask this question before considering the product complete:

> Would a professional developer or agency trust this application with real website leads and client access?

If the answer is no, continue improving it.

Do not optimize for "looks finished."

Optimize for:

```text
Works correctly
+
Feels professional
+
Protects customer data
+
Handles failure
+
Can be maintained
```

---

# 134. FINAL V1 CHECKLIST

## Product

```text
[ ] Formivo branding implemented
[ ] Landing page implemented
[ ] Pricing implemented
[ ] Documentation implemented
[ ] Authentication implemented
[ ] Workspace implemented
[ ] Forms implemented
[ ] Custom integration implemented
[ ] Public submission API implemented
[ ] Leads implemented
[ ] Analytics implemented
[ ] Client portal implemented
[ ] Billing implemented
[ ] Email implemented
```

## Security

```text
[ ] Authentication
[ ] Authorization
[ ] RLS
[ ] Tenant isolation
[ ] Client isolation
[ ] Secret hashing
[ ] Secret rotation
[ ] Invitation token hashing
[ ] Rate limiting
[ ] Payload limits
[ ] Idempotency
[ ] Webhook verification
[ ] XSS protection
[ ] SQL injection protection
```

## Quality

```text
[ ] Unit tests
[ ] Integration tests
[ ] API tests
[ ] RLS tests
[ ] Security tests
[ ] E2E tests
[ ] Accessibility
[ ] Responsive
[ ] Performance
[ ] Error states
[ ] Empty states
[ ] Loading states
```

## Deployment

```text
[ ] Environment configuration
[ ] Supabase production
[ ] Lemon Squeezy production
[ ] Resend production
[ ] Vercel production
[ ] Domain
[ ] Database migrations
[ ] Webhooks
[ ] Smoke tests
[ ] Monitoring
```

---

# 135. FINAL ABSOLUTE RULES

The implementation must obey these rules:

### Rule 1

**Do not build outside the approved V1 scope.**

### Rule 2

**Do not expose secrets.**

### Rule 3

**Do not trust the frontend for authorization.**

### Rule 4

**Always enforce workspace isolation.**

### Rule 5

**Always enforce client form-level access.**

### Rule 6

**Use Supabase RLS.**

### Rule 7

**Use Lemon Squeezy for payments.**

### Rule 8

**Use Resend for V1 email.**

### Rule 9

**Do not use Stripe.**

### Rule 10

**Do not fabricate product data or functionality.**

### Rule 11

**Test security-sensitive functionality.**

### Rule 12

**Do not mark incomplete functionality as complete.**

### Rule 13

**Do not deploy untested database migrations.**

### Rule 14

**Do not use production credentials during development/testing.**

### Rule 15

**Do not sacrifice security for implementation speed.**

---

# 136. FINAL IMPLEMENTATION COMMAND

After reading all Formivo specification documents, implement the application in phases.

Start by inspecting the repository and existing architecture.

Then:

```text
1. Establish the foundation.
2. Configure Supabase.
3. Apply database migrations.
4. Implement authentication.
5. Implement workspace isolation.
6. Implement forms.
7. Implement the public submission API.
8. Implement leads.
9. Implement analytics.
10. Implement client invitations/access.
11. Implement Resend.
12. Implement Lemon Squeezy.
13. Implement entitlement enforcement.
14. Implement testing.
15. Perform security review.
16. Perform responsive/accessibility review.
17. Deploy to staging.
18. Run smoke tests.
19. Fix all blocking issues.
20. Deploy production.
21. Run production smoke tests.
22. Verify monitoring and integrations.
```

At every phase:

```text
Implement
→ Test
→ Verify
→ Review
→ Continue
```

Do not skip verification.

---

# 137. SUCCESS CONDITION

The implementation is successful only when Formivo V1 provides this complete experience:

```text
Developer
   │
   ├── Creates workspace
   │
   ├── Creates custom form integration
   │
   ├── Gets secure endpoint
   │
   ├── Connects existing website form
   │
   ├── Receives real submissions
   │
   ├── Manages leads
   │
   ├── Views analytics
   │
   ├── Invites client
   │
   └── Manages subscription
            │
            ▼
         Formivo
            │
            ├── Secure API
            ├── Supabase
            ├── Resend
            └── Lemon Squeezy
            │
            ▼
         Client Viewer
            │
            ├── Assigned forms
            ├── Leads
            └── Analytics
```

The final application should feel like a real SaaS product that a developer could confidently connect to a production website and use with a real client.

**Build Formivo as a product, not as a prototype.**