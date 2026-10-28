# Formivo — API Specification

**Document:** `05-api-spec.md`  
**Product:** Formivo  
**Version:** Version 3.0  
**Status:** Implementation-Ready

---

# 1. Purpose

This document defines the API contract for Formivo Version 3.0.

It specifies:

- API routes
- HTTP methods
- Authentication
- Authorization
- Request formats
- Response formats
- Error formats
- Form submission
- Lead management
- Client access
- Invitations
- Billing webhooks
- Idempotency
- Rate limiting
- Validation
- Pagination
- Security requirements

The API must remain predictable, secure, and consistent across the application.

---

# 2. API Architecture

Formivo uses a single Next.js application.

```text
Browser
   ↓
Next.js App Router
   ↓
Route Handlers / Server Actions
   ↓
Application Services
   ↓
Supabase PostgreSQL
```

External systems:

```text
Lemon Squeezy
     ↓
Webhook API

Resend
     ↓
Email Service
```

---

# 3. API Categories

Formivo has four major API categories.

## 3.1 Authenticated Application API

Used by the Formivo dashboard.

Examples:

```text
/api/forms
/api/leads
/api/workspaces
/api/invitations
```

Authentication comes from the Supabase session.

---

## 3.2 Public Form Submission API

Used by customer websites.

```text
POST /api/f/{formId}/submissions
```

Authentication uses the Formivo form secret.

---

## 3.3 Invitation API

Used to create and accept client invitations.

```text
/api/invitations
/api/invitations/{id}
/api/invitations/accept
```

---

## 3.4 Billing Webhook API

Used by Lemon Squeezy.

```text
POST /api/webhooks/lemonsqueezy
```

This endpoint must verify the provider signature before processing anything.

---

# 4. Base URL

Production:

```text
https://formivo.faizyab.me
```

The exact production domain may change.

Do not hardcode the production domain throughout the application.

Use environment configuration.

---

# 5. API Versioning

The public submission API uses:

```text
/api/f/
```

Example:

```text
POST /api/f/frm_xxx/submissions
```

Internal dashboard APIs do not necessarily require versioning in Version 3.0 because they are controlled by the same application.

---

# 6. Content Type

JSON APIs should use:

```http
Content-Type: application/json
```

Requests with unsupported content types should return:

```text
415 Unsupported Media Type
```

The public submission endpoint should initially accept JSON.

---

# 7. Authentication Models

Formivo uses two authentication models.

## Dashboard authentication

Supabase Auth session.

```text
Cookie/session
    ↓
Authenticated Supabase user
```

## Form submission authentication

Form-specific secret.

```http
Authorization: Bearer FORM_SECRET
```

These authentication systems must never be mixed.

---

# 8. Dashboard Authentication

Authenticated dashboard requests must identify the current Supabase user.

The server must:

1. Read the authenticated session.
2. Resolve the user ID.
3. Verify workspace membership.
4. Verify resource ownership/access.
5. Execute the requested operation.

Never trust:

```text
workspace_id
user_id
role
```

provided by the browser.

---

# 9. Authorization

Authentication answers:

> Who is this user?

Authorization answers:

> What is this user allowed to access?

Both checks are mandatory.

---

# 10. Public Submission Authentication

The public submission endpoint uses:

```http
Authorization: Bearer FORM_SECRET
```

Example:

```http
Authorization: Bearer fm_live_xxxxxxxxx
```

The secret must correspond to the requested form.

---

# 11. Never Put Secrets in URLs

Never support:

```text
/api/f/frm_xxx/submissions

# 12. Public Submission Endpoint

## Route

```http
POST /api/f/{formId}/submissions
```

Example:

```text
POST /api/f/frm_8f92ab/submissions
```

---

# 13. Public Submission Headers

Required:

```http
Content-Type: application/json
Authorization: Bearer FORM_SECRET
```

Optional:

```http
Idempotency-Key: unique-client-request-id
```

Recommended:

```http
Accept: application/json
```

---

# 14. Submission Request

Example:

```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I would like to know more about your services."
  },
  "metadata": {
    "source": "contact-page",
    "page": "/contact",
    "referrer": "https://example.com"
  }
}
```

---

# 15. Submission Request Structure

```text
data
```

Required.

Must be a JSON object.

Contains customer-defined form fields.

```text
metadata
```

Optional.

Must be a JSON object when provided.

Contains contextual submission information.

---

# 16. Example Minimal Request

```json
{
  "data": {
    "email": "john@example.com"
  }
}
```

This is valid.

Formivo does not require a predefined field schema in V1.

---

# 17. Submission Validation

The server must validate:

- JSON syntax
- Content-Type
- Authorization header
- Form public ID
- Form status
- Secret
- Request body
- `data` type
- `metadata` type
- Payload size
- Field/value limits
- Rate limits
- Monthly quota
- Idempotency key

---

# 18. Successful Submission Response

Status:

```http
201 Created
```

Response:

```json
{
  "success": true,
  "leadId": "lead_123",
  "message": "Submission received."
}
```

---

# 19. Successful Idempotent Response

If a request is repeated using the same valid idempotency key:

```http
200 OK
```

may be returned with the original result.

Example:

```json
{
  "success": true,
  "leadId": "lead_123",
  "message": "Submission received."
}
```

No second lead should be created.

---

# 20. Submission Processing Pipeline

The server should process a submission in this order:

```text
Request
 ↓
Parse request
 ↓
Validate Content-Type
 ↓
Resolve form
 ↓
Validate form status
 ↓
Validate secret
 ↓
Validate payload
 ↓
Check rate limit
 ↓
Check usage quota
 ↓
Check idempotency
 ↓
Create lead
 ↓
Increment usage
 ↓
Persist idempotency result
 ↓
Return response
```

The actual database operations should be transactional where necessary.

---

# 21. Form Lookup

The public ID:

```text
frm_xxx
```

is used to locate the form.

The server must confirm:

```text
form exists
+
form is active
+
secret matches
```

before processing the submission.

---

# 22. Secret Verification

The provided secret must be compared against the stored hash.

Never:

```text
SELECT secret FROM forms
```

because the plaintext secret must not exist in the database.

Use a secure password/secret hashing algorithm.

Recommended:

```text
Argon2id
```

or another strong password hashing implementation appropriate for server-side secrets.

---

# 23. Form Secret Generation

When creating a form:

```text
Generate cryptographically secure random secret
 ↓
Show plaintext secret once
 ↓
Hash secret
 ↓
Store hash
 ↓
Never store plaintext
```

The secret should have enough entropy to prevent guessing.

---

# 24. Secret Rotation

Endpoint:

```http
POST /api/forms/{formId}/rotate-secret
```

Authenticated workspace owner only.

Process:

```text
Authenticate
 ↓
Verify workspace ownership
 ↓
Generate new secret
 ↓
Hash new secret
 ↓
Replace stored hash
 ↓
Return new secret once
```

The old secret becomes invalid immediately.

---

# 25. Form Creation API

Route:

```http
POST /api/forms
```

Authentication:

```text
Supabase session
```

Authorization:

```text
Workspace owner
```

Request:

```json
{
  "workspaceId": "workspace_uuid",
  "name": "Website Contact Form",
  "description": "Main website contact form"
}
```

---

# 26. Form Creation Response

```http
201 Created
```

Example:

```json
{
  "success": true,
  "form": {
    "id": "uuid",
    "publicId": "frm_8f92ab",
    "name": "Website Contact Form",
    "description": "Main website contact form",
    "status": "active",
    "createdAt": "2026-10-05T12:00:00Z"
  },
  "secret": "fm_live_xxxxxxxxx"
}
```

The secret is returned only during creation.

---

# 27. Secret Response Rule

The API must not return the secret again through:

```http
GET /api/forms/{formId}
```

After creation, the user must use rotation to generate a new secret.

---

# 28. List Forms

Route:

```http
GET /api/forms
```

Query parameters:

```text
workspaceId
status
page
limit
```

Example:

```text
GET /api/forms?workspaceId=xxx&status=active&page=1&limit=20
```

The server must verify workspace access.

---

# 29. Form List Response

Example:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "publicId": "frm_123",
      "name": "Contact Form",
      "status": "active",
      "createdAt": "2026-10-05T12:00:00Z",
      "leadCount": 42
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "hasNextPage": false
  }
}
```

Do not expose:

```text
secret_hash
```

---

# 30. Get Form

Route:

```http
GET /api/forms/{formId}
```

Returns form metadata.

Example:

```json
{
  "success": true,
  "form": {
    "id": "uuid",
    "publicId": "frm_123",
    "name": "Contact Form",
    "description": "Main website form",
    "status": "active",
    "createdAt": "2026-10-05T12:00:00Z"
  }
}
```

---

# 31. Update Form

Route:

```http
PATCH /api/forms/{formId}
```

Request:

```json
{
  "name": "Main Website Contact Form",
  "description": "Updated description"
}
```

Allowed fields:

```text
name
description
```

The client cannot change:

```text
workspace_id
public_id
secret_hash
```

through this endpoint.

---

# 32. Archive Form

Route:

```http
POST /api/forms/{formId}/archive
```

Response:

```json
{
  "success": true,
  "message": "Form archived."
}
```

Archived forms:

- Remain visible to authorized dashboard users
- Retain historical leads
- Stop accepting submissions

---

# 33. Restore Form

If restoration is included in the final V1 UI:

```http
POST /api/forms/{formId}/restore
```

Only authorized workspace users may restore forms.

Before restoration, the server should verify that the workspace's current plan permits the resulting active form count.

---

# 34. Lead List API

Route:

```http
GET /api/leads
```

Query parameters:

```text
workspaceId
formId
status
search
page
limit
sort
```

Example:

```text
GET /api/leads?formId=uuid&status=new&page=1&limit=25
```

---

# 35. Lead Authorization

The server must verify:

### Developer

User owns or manages the workspace.

### Client

User has explicit access to the requested form.

A client must never retrieve leads by simply knowing a `leadId`.

---

# 36. Lead List Response

```json
{
  "success": true,
  "data": [
    {
      "id": "lead_123",
      "formId": "uuid",
      "status": "new",
      "data": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2026-10-05T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 1,
    "hasNextPage": false
  }
}
```

---

# 37. Get Lead

Route:

```http
GET /api/leads/{leadId}
```

Response:

```json
{
  "success": true,
  "lead": {
    "id": "lead_123",
    "formId": "uuid",
    "status": "new",
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello"
    },
    "metadata": {
      "page": "/contact"
    },
    "createdAt": "2026-10-05T12:00:00Z",
    "updatedAt": "2026-10-05T12:00:00Z"
  }
}
```

---

# 38. Update Lead Status

Route:

```http
PATCH /api/leads/{leadId}
```

Request:

```json
{
  "status": "contacted"
}
```

Allowed statuses:

```text
new
contacted
qualified
converted
archived
```

No arbitrary status values are allowed.

---

# 39. Archive Lead

The same status endpoint may be used:

```json
{
  "status": "archived"
}
```

Do not create unnecessary endpoints for every status.

---

# 40. Delete Lead

Permanent deletion is not a required V1 feature.

Do not implement a public destructive delete endpoint unless explicitly added to the product scope.

Archiving is the preferred V1 operation.

---

# 41. Analytics API

Route:

```http
GET /api/analytics
```

Query parameters:

```text
workspaceId
formId
range
```

Supported ranges:

```text
7d
30d
90d
```

Example:

```text
GET /api/analytics?formId=uuid&range=30d
```

---

# 42. Analytics Response

Example:

```json
{
  "success": true,
  "analytics": {
    "totalLeads": 248,
    "newLeads": 42,
    "contactedLeads": 91,
    "qualifiedLeads": 52,
    "convertedLeads": 34,
    "archivedLeads": 29,
    "dailySubmissions": [
      {
        "date": "2026-10-01",
        "count": 12
      },
      {
        "date": "2026-10-02",
        "count": 18
      }
    ]
  }
}
```

Analytics should be calculated from authorized lead records.

---

# 43. Client Invitation API

Route:

```http
POST /api/invitations
```

Authenticated workspace owner only.

Request:

```json
{
  "workspaceId": "workspace_uuid",
  "formId": "form_uuid",
  "email": "client@example.com"
}
```

---

# 44. Invitation Validation

Before creating an invitation:

1. Authenticate requester.
2. Verify workspace ownership.
3. Verify form belongs to workspace.
4. Verify plan viewer limit.
5. Normalize email.
6. Check existing access.
7. Check existing pending invitation.
8. Generate secure token.
9. Hash token.
10. Store invitation.
11. Send email through Resend.

---

# 45. Invitation Response

```http
201 Created
```

Example:

```json
{
  "success": true,
  "invitation": {
    "id": "uuid",
    "email": "client@example.com",
    "formId": "uuid",
    "status": "pending",
    "expiresAt": "2026-10-12T12:00:00Z"
  }
}
```

Never return the raw invitation token in a normal API response.

---

# 46. Invitation Acceptance

Route:

```http
POST /api/invitations/accept
```

Request:

```json
{
  "token": "secure_invitation_token"
}
```

Authentication may be required depending on the final onboarding flow.

The server must:

- Hash token
- Find invitation
- Verify status
- Verify expiration
- Verify invited email
- Create membership if required
- Create form access
- Mark invitation accepted

---

# 47. Invitation Acceptance Response

```json
{
  "success": true,
  "message": "Invitation accepted.",
  "workspaceId": "uuid",
  "formId": "uuid"
}
```

---

# 48. Revoke Invitation

Route:

```http
POST /api/invitations/{invitationId}/revoke
```

Only the workspace owner may revoke an invitation.

Response:

```json
{
  "success": true,
  "message": "Invitation revoked."
}
```

---

# 49. Client Form Access

The owner may assign a client to a form.

Route:

```http
POST /api/forms/{formId}/client-access
```

Request:

```json
{
  "userId": "uuid"
}
```

The server must verify:

- Requester owns workspace
- Form belongs to workspace
- Target user belongs to workspace
- Target user is a client
- Viewer limit permits access

---

# 50. Remove Client Access

Route:

```http
DELETE /api/forms/{formId}/client-access/{userId}
```

Only the workspace owner may perform this action.

The operation must remove the specific form-level permission.

---

# 51. Client Dashboard API

A client may use:

```http
GET /api/client/forms
```

The server returns only forms assigned to the authenticated client.

Example:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Acme Contact Form",
      "status": "active"
    }
  ]
}
```

---

# 52. Client Lead API

A client can use:

```http
GET /api/client/forms/{formId}/leads
```

The server must verify:

```text
authenticated user
+
client role
+
explicit form access
```

The client must not be able to supply another workspace ID to bypass authorization.

---

# 53. Client Analytics API

Route:

```http
GET /api/client/forms/{formId}/analytics
```

Returns only analytics for the assigned form.

---

# 54. Client Restrictions

Client APIs must never expose:

```text
form secret
secret_hash
subscription
billing
workspace owner controls
other forms
other workspaces
invitations
workspace settings
```

---

# 55. Workspace API

Create workspace:

```http
POST /api/workspaces
```

Request:

```json
{
  "name": "Acme Agency"
}
```

Response:

```json
{
  "success": true,
  "workspace": {
    "id": "uuid",
    "name": "Acme Agency"
  }
}
```

---

# 56. Current Workspace

If the application supports a current workspace context:

```http
GET /api/workspace
```

The server determines the workspace based on authenticated membership.

Do not trust a browser-selected workspace without validating membership.

---

# 57. Workspace Settings

Route:

```http
PATCH /api/workspace
```

Allowed V1 fields:

```text
name
```

Billing and security-sensitive fields should use dedicated endpoints.

---

# 58. Billing Checkout

Formivo uses Lemon Squeezy.

The application should create a checkout using the appropriate Lemon Squeezy integration.

Possible route:

```http
POST /api/billing/checkout
```

Request:

```json
{
  "plan": "pro"
}
```

The server must:

1. Authenticate user.
2. Verify workspace ownership.
3. Verify requested plan.
4. Determine the correct Lemon Squeezy variant.
5. Create or redirect to checkout.
6. Return checkout information.

---

# 59. Billing Checkout Response

Example:

```json
{
  "success": true,
  "checkoutUrl": "https://checkout.example.com/..."
}
```

The exact checkout URL format is controlled by Lemon Squeezy.

Do not hardcode fake URLs.

---

# 60. Billing Portal

If Lemon Squeezy provides the appropriate customer management flow, Formivo may expose:

```http
GET /api/billing/portal
```

The implementation should use the provider's supported customer-management mechanism.

Do not build a custom payment-management system.

---

# 61. Lemon Squeezy Webhook

Route:

```http
POST /api/webhooks/lemonsqueezy
```

This endpoint is server-to-server.

It must not require a normal Supabase user session.

---

# 62. Webhook Security

The webhook must verify the signature using the Lemon Squeezy signing secret.

Processing order:

```text
Receive request
 ↓
Read raw body
 ↓
Verify signature
 ↓
Reject invalid signature
 ↓
Parse event
 ↓
Read event ID
 ↓
Check duplicate event
 ↓
Process event
 ↓
Update subscription
 ↓
Record event
 ↓
Return 2xx
```

Signature verification must happen against the raw request body.

---

# 63. Webhook Idempotency

Use:

```text
provider + event_id
```

as a unique identifier.

If the same webhook is received again:

```text
Return successful response
Do not apply the business mutation twice
```

---

# 64. Supported Billing Events

The implementation should support the relevant Lemon Squeezy events for:

- Subscription created
- Subscription updated
- Subscription cancelled
- Subscription resumed
- Subscription expired
- Payment/subscription state changes as required

The exact event names must be taken from the current Lemon Squeezy API/webhook documentation during implementation.

Do not guess provider event names.

---

# 65. Billing Source of Truth

The application database should maintain the current normalized billing state.

Lemon Squeezy remains the external billing provider.

The UI should read:

```text
Formivo subscriptions table
```

rather than making a provider API request on every page load.

---

# 66. Entitlement API

Entitlements should be resolved centrally.

Conceptual internal service:

```ts
getWorkspaceEntitlements(workspaceId)
```

Returns:

```ts
{
  plan: "pro",
  limits: {
    forms: 10,
    monthlyLeads: 2000,
    viewers: 5
  }
}
```

Do not duplicate plan-limit logic across API routes.

---

# 67. Plan Configuration

Canonical configuration:

```ts
const plans = {
  free: {
    forms: 3,
    monthlyLeads: 100,
    viewers: 3
  },

  pro: {
    forms: 10,
    monthlyLeads: 2000,
    viewers: 10
  },

  agency: {
    forms: 50,
    monthlyLeads: 10000,
    viewers: 25
  }
};
```

The implementation may represent unlimited as `-1` or another explicit internal value.

Do not rely on magic numbers.

---

# 68. Form Limit Enforcement

Before creating a form:

```text
Get workspace plan
 ↓
Get current active form count
 ↓
Check entitlement
 ↓
Allow or reject
```

If the limit is reached:

```http
403 Forbidden
```

or:

```http
409 Conflict
```

may be used depending on the application's error semantics.

Recommended application error:

```text
PLAN_LIMIT_REACHED
```

---

# 69. Viewer Limit Enforcement

Before creating a new client access relationship:

```text
Get plan
 ↓
Count active viewer relationships
 ↓
Compare against limit
 ↓
Allow or reject
```

Do not count the workspace owner as a client viewer.

---

# 70. Lead Quota Enforcement

Before accepting a submission:

```text
Get current usage
 ↓
Get plan limit
 ↓
If quota reached → reject
 ↓
Otherwise process submission
```

Recommended error:

```text
QUOTA_EXCEEDED
```

---

# 71. Error Response Format

All API errors should use a consistent structure.

Example:

```json
{
  "success": false,
  "error": {
    "code": "FORM_NOT_FOUND",
    "message": "The requested form could not be found."
  }
}
```

---

# 72. Validation Error Format

For field validation:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "fields": {
      "name": "Name is required."
    }
  }
}
```

---

# 73. Standard Error Codes

V1 should support at least:

```text
UNAUTHENTICATED
FORBIDDEN
INVALID_REQUEST
VALIDATION_ERROR
FORM_NOT_FOUND
FORM_INACTIVE
INVALID_FORM_SECRET
LEAD_NOT_FOUND
WORKSPACE_NOT_FOUND
INVITATION_NOT_FOUND
INVITATION_EXPIRED
INVITATION_REVOKED
ALREADY_INVITED
ALREADY_HAS_ACCESS
PAYLOAD_TOO_LARGE
RATE_LIMITED
QUOTA_EXCEEDED
PLAN_LIMIT_REACHED
IDEMPOTENCY_CONFLICT
WEBHOOK_INVALID
NOT_FOUND
INTERNAL_ERROR
```

---

# 74. HTTP Status Mapping

Recommended mapping:

| Situation | Status |
|---|---:|
| Success | 200 |
| Created | 201 |
| No Content | 204 |
| Invalid request | 400 |
| Unauthenticated | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Method unsupported | 405 |
| Conflict | 409 |
| Payload too large | 413 |
| Unsupported media type | 415 |
| Rate limited | 429 |
| Internal error | 500 |
| External service failure | 502/503 |

---

# 75. Rate Limiting

The public submission endpoint must be rate-limited.

Rate limiting should consider:

```text
form
IP
request frequency
```

Do not rely only on IP because many legitimate users may share an IP.

Do not rely only on form because a compromised secret could generate excessive traffic.

---

# 76. Rate Limit Response

Status:

```http
429 Too Many Requests
```

Response:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later."
  }
}
```

If appropriate, include:

```http
Retry-After: 60
```

---

# 77. Rate Limiting Infrastructure

V1 may use an external rate-limiting mechanism or a database-backed implementation.

The implementation should avoid adding unnecessary infrastructure.

If Redis/Upstash is already available in the repository and appropriate, it may be reused.

Do not introduce Redis merely because it is popular.

---

# 78. Payload Limits

The public submission endpoint must limit:

- Request body size
- Number of fields
- Field name length
- String value length
- Metadata size
- Nesting depth if nested JSON is allowed

Recommended initial request body limit:

```text
256 KB
```

The exact value may be adjusted after implementation testing.

---

# 79. Idempotency

Clients may send:

```http
Idempotency-Key: abc123
```

The API must support safe retries.

Typical use case:

```text
Website sends request
 ↓
Network timeout
 ↓
Website retries
 ↓
Formivo recognizes same key
 ↓
No duplicate lead
```

---

# 80. Idempotency Key Requirements

Recommended:

- Maximum length: 255 characters
- Non-empty
- Case-sensitive or normalized consistently
- Bound to the form
- Bound to the request body through a hash

---

# 81. Duplicate Idempotency Conflict

If:

```text
same key
+
different request body
```

is received:

```json
{
  "success": false,
  "error": {
    "code": "IDEMPOTENCY_CONFLICT",
    "message": "The idempotency key was already used with a different request."
  }
}
```

---

# 82. Pagination

Dashboard list APIs must use pagination.

Example:

```text
?page=1&limit=25
```

Maximum:

```text
limit = 100
```

The API must clamp or reject excessive values.

Do not allow:

```text
limit=100000
```

---

# 83. Cursor Pagination

Offset pagination is acceptable for V1.

For larger datasets, cursor pagination may later be introduced.

Do not prematurely implement a complex pagination abstraction if V1 does not require it.

---

# 84. Sorting

Lead sorting should support controlled fields only.

Example:

```text
sort=created_at
order=desc
```

Never interpolate arbitrary user input into SQL ordering.

Map allowed values explicitly.

---

# 85. Search

Search input must be:

- Length limited
- Sanitized
- Safely parameterized

Do not concatenate search strings directly into SQL.

---

# 86. CORS

The public submission endpoint may need to support browser-based requests depending on the integration model.

However:

> Browser exposure of the Formivo secret is inherently weaker than server-side forwarding.

The product should recommend server-side submission whenever possible.

If browser submissions are supported:

- Configure CORS intentionally
- Do not use unrestricted wildcard origins with sensitive credential behavior
- Document that the form secret may become visible to users if embedded in browser code

---

# 87. Recommended Integration Pattern

Preferred:

```text
Website Form
     ↓
Website Server
     ↓
Formivo API
     ↓
Formivo Database
```

Less secure:

```text
Browser
     ↓
Formivo API
```

The first approach keeps the Formivo secret on the server.

---

# 88. API Secret Exposure Warning

The integration setup UI should clearly explain:

> Keep your Formivo secret on your server whenever possible. Do not expose it in public frontend JavaScript unless you understand the security implications.

This warning is part of the product experience.

---

# 89. Request Logging

Never log:

```text
Authorization header
Form secret
Invitation token
Webhook signing secret
Resend API key
Supabase service-role key
```

Do not log complete lead payloads.

---

# 90. Request IDs

Each API request should receive a request identifier.

Example:

```text
req_8f92ab...
```

The request ID should appear in:

- Server logs
- Error responses where useful
- Support/debugging information

Example:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Something went wrong.",
    "requestId": "req_8f92ab"
  }
}
```

---

# 91. Internal Service Layer

Route handlers should not contain all business logic.

Recommended structure:

```text
Route Handler
     ↓
Validation
     ↓
Service
     ↓
Repository / Supabase
```

Example:

```text
POST /api/v1/forms/[publicId]/submissions
              ↓
submissionService.processSubmission()
              ↓
formRepository
leadRepository
usageService
idempotencyService
```

---

# 92. Public Submission Service

Recommended conceptual interface:

```ts
processSubmission({
  formPublicId,
  secret,
  data,
  metadata,
  idempotencyKey,
  requestContext
})
```

Returns:

```ts
{
  leadId: string;
  created: boolean;
}
```

The route handler converts the service result into the HTTP response.

---

# 93. Lead Service

Recommended methods:

```ts
createLead()
getLead()
listLeads()
updateLeadStatus()
archiveLead()
```

Every method must receive enough context to enforce authorization.

---

# 94. Form Service

Recommended methods:

```ts
createForm()
getForm()
listForms()
updateForm()
archiveForm()
restoreForm()
rotateSecret()
```

---

# 95. Workspace Service

Recommended methods:

```ts
createWorkspace()
getWorkspace()
updateWorkspace()
getWorkspaceMembership()
```

---

# 96. Invitation Service

Recommended methods:

```ts
createInvitation()
acceptInvitation()
revokeInvitation()
listInvitations()
```

Invitation token generation and hashing belong in this service.

---

# 97. Billing Service

Recommended methods:

```ts
getSubscription()
getEntitlements()
createCheckout()
processWebhook()
```

The rest of the application should not contain direct Lemon Squeezy business logic.

---

# 98. Email Service

The application should use a central email service abstraction.

Example:

```ts
sendInvitationEmail()
```

Internally:

```text
Email Service
    ↓
Resend
```

This prevents Resend-specific code from spreading throughout the application.

---

# 99. API Validation

Use a schema validation library such as Zod.

Example conceptual schema:

```ts
const submissionSchema = z.object({
  data: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional()
});
```

The final schema must also enforce size/depth restrictions where necessary.

---

# 100. API Route Structure

Recommended structure:

```text
app/
  api/
    forms/
      route.ts
      [formId]/
        route.ts
        archive/
          route.ts
        restore/
          route.ts
        rotate-secret/
          route.ts
        client-access/
          route.ts
    leads/
      route.ts
      [leadId]/
        route.ts
    invitations/
      route.ts
      [invitationId]/
        revoke/
          route.ts
      accept/
        route.ts
    workspace/
      route.ts
    billing/
      checkout/
        route.ts
      portal/
        route.ts
    webhooks/
      lemonsqueezy/
        route.ts
    v1/
      forms/
        [formPublicId]/
          submissions/
            route.ts
```

The exact structure can be adjusted to the repository's conventions.

---

# 101. Server Actions

Server Actions may be used for internal dashboard mutations where appropriate.

However, public APIs and provider webhooks should remain explicit Route Handlers.

Use Server Actions for:

- Dashboard form mutations
- Internal settings mutations
- UI-bound operations

Use Route Handlers for:

- Public submission API
- Webhooks
- External API consumers

---

# 102. API and RLS Relationship

The API layer should not replace RLS.

Security should work as:

```text
Authentication
     +
Application authorization
     +
Database RLS
```

This creates defense in depth.

---

# 103. Cross-Tenant Attack Prevention

Every authenticated resource request must answer:

```text
Who is requesting?
Which workspace do they belong to?
What role do they have?
Does this resource belong to that workspace?
Does this user have access to this specific resource?
```

Never assume ownership from a URL parameter.

---

# 104. Example Cross-Tenant Attack

Malicious request:

```text
GET /api/leads/another-workspace-lead-id
```

Expected:

```http
404 Not Found
```

or:

```http
403 Forbidden
```

depending on the application's resource enumeration strategy.

The response must not reveal whether sensitive records exist.

---

# 105. Client Privilege Escalation Prevention

A client attempts:

```http
PATCH /api/leads/{leadId}
```

to change a lead.

If V1 specifies client read-only access:

```http
403 Forbidden
```

The client must not be able to change:

- Lead status
- Form settings
- Secrets
- Billing
- Invitations
- Workspace settings

---

# 106. API Security Checklist

Before production:

- [ ] Authentication enforced
- [ ] Authorization enforced
- [ ] RLS enabled
- [ ] Public secrets hashed
- [ ] Invitation tokens hashed
- [ ] Webhook signature verified
- [ ] Idempotency implemented
- [ ] Rate limiting implemented
- [ ] Payload limits implemented
- [ ] Pagination implemented
- [ ] Input validation implemented
- [ ] SQL injection prevented
- [ ] Sensitive headers excluded from logs
- [ ] Lead payloads excluded from logs
- [ ] CORS intentionally configured
- [ ] Cross-tenant access tested
- [ ] Client restrictions tested
- [ ] Plan limits tested

---

# 107. API Testing Requirements

Every critical endpoint should have tests for:

### Authentication

```text
No session
Valid session
Expired session
```

### Authorization

```text
Owner
Client
Wrong workspace
Wrong form
```

### Input

```text
Valid
Missing
Malformed
Oversized
Unexpected
```

### Security

```text
Invalid secret
Rotated secret
Expired invitation
Invalid webhook
Replay webhook
Duplicate idempotency key
```

### Limits

```text
Form limit
Viewer limit
Lead quota
Rate limit
```

---

# 108. V1 API Non-Goals

Do not implement:

- Embedded form builder API
- Drag-and-drop form schema API
- Email marketing API
- WhatsApp API
- Slack API
- Discord API
- Zapier API
- Make API
- n8n API
- AI lead scoring API
- AI summaries
- AI follow-up automation
- CRM deals API
- Advanced pipelines
- White-label API
- Enterprise SSO API
- Marketplace API

These belong to future versions.

---

# 109. API Design Principle

Formivo's API should be:

> **Small, predictable, secure, and useful.**

Do not build an enormous API surface merely because the underlying platform could support it.

V1 should expose only the operations required to:

```text
Create forms
Connect websites
Receive submissions
Manage leads
View analytics
Invite clients
Control client access
Manage billing
```

---

# 110. Final Public API Contract

The most important Version 3.0 external endpoint is:

```http
POST /api/f/{formId}/submissions
```

Example:

```bash
curl -X POST \
  https://formivo.faizyab.me/api/f/frm_8f92ab/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FORM_SECRET" \
  -H "Idempotency-Key: contact-12345" \
  -d '{
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello Formivo"
    },
    "metadata": {
      "page": "/contact"
    }
  }'
```

Successful response:

```json
{
  "success": true,
  "leadId": "lead_123",
  "message": "Submission received."
}
```

---

# 111. Final API Quality Gate

The API is ready for V1 only when:

- A developer can create a Formivo form.
- A secure secret is generated.
- The secret is never stored in plaintext.
- A website can submit JSON data.
- Formivo validates the request.
- Formivo creates a lead.
- Duplicate retries do not create duplicate leads.
- Usage is counted correctly.
- Rate limiting works.
- Quotas work.
- Developers can manage leads.
- Clients can access only assigned forms.
- Client users cannot mutate protected resources.
- Invitations are secure and expiring.
- Billing webhooks are signature-verified.
- Webhook replay is handled.
- Errors are consistent.
- Sensitive information is not leaked.
- Cross-tenant access is blocked.
- RLS is active.
- The application remains responsive under normal V1 traffic.

---

# 112. Critical Implementation Rule

**Formivo uses Lemon Squeezy for billing.**

There must be:

```text
NO STRIPE IMPLEMENTATION
NO STRIPE SDK
NO STRIPE WEBHOOKS
NO STRIPE ENVIRONMENT VARIABLES
NO STRIPE TABLES
```

The billing integration must remain Lemon Squeezy-based throughout V1.

---

# 113. Final Architecture

```text
                         Formivo API
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    Dashboard API       Public Form API      Webhooks
          │                   │                   │
          ▼                   ▼                   ▼
     Supabase Auth      Secret Validation   Lemon Squeezy
          │                   │
          └──────────┬────────┘
                     ▼
                Application
                  Services
                     │
                     ▼
               Supabase DB
                     │
                     ▼
                    RLS
```

The API layer, application services, and database must work together as one secure system rather than as independent features.