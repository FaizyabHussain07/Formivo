# Formivo — Security and Permissions Specification

**Document:** `08-security-and-permissions.md`  
**Product:** Formivo  
**Version:** Version 3.0  
**Status:** Implementation-Ready

---

# 1. Purpose

This document defines the security architecture and authorization model for Formivo V1.

Security is a core product requirement because Formivo stores:

- Customer lead information
- Form submissions
- Client access permissions
- Form authentication secrets
- Workspace data
- Billing information and provider identifiers

The implementation must treat every request as untrusted.

---

# 2. Security Principles

Formivo follows these principles:

1. Never trust the browser.
2. Never trust hidden UI controls.
3. Never trust IDs supplied by the client.
4. Enforce authorization on the server.
5. Enforce tenant isolation at the database level.
6. Never expose form secrets after initial creation.
7. Never expose service-role credentials to the browser.
8. Validate every external request.
9. Minimize stored sensitive information.
10. Fail closed when authorization is uncertain.
11. Do not leak internal implementation details through errors.
12. Log security-relevant events without logging secrets.
13. Treat third-party webhooks as untrusted until verified.
14. Keep developer and client permissions strictly separated.

---

# 3. Security Architecture

The security model has multiple layers:

```text id="9qf4mt"
Browser
   ↓
Next.js Authentication
   ↓
Server Authorization
   ↓
Application Services
   ↓
Supabase RLS
   ↓
PostgreSQL
```

External form submissions follow:

```text id="5g3jhs"
Website
   ↓
Public Submission API
   ↓
Form Secret Validation
   ↓
Rate Limit
   ↓
Quota Check
   ↓
Payload Validation
   ↓
Submission Service
   ↓
Database Transaction
   ↓
Lead
```

Lemon Squeezy:

```text id="j9f8j0"
Lemon Squeezy
   ↓
Webhook
   ↓
Signature Verification
   ↓
Event Deduplication
   ↓
Subscription Update
   ↓
Entitlement Update
```

---

# 4. Authentication

Formivo uses Supabase Auth.

Authentication is responsible for:

- Account creation
- Sign-in
- Sign-out
- Password recovery
- Session management
- Authenticated user identity

Authorization remains a Formivo application responsibility.

Authentication answers:

> Who is this user?

Authorization answers:

> What is this user allowed to access?

---

# 5. Session Security

Authenticated application requests must use the user's Supabase session.

The server must derive the authenticated user from the verified session.

Never trust:

```text id="p2uvqn"
userId
workspaceId
role
```

provided by the browser when determining authorization.

---

# 6. User Identity

The canonical authenticated identity is:

```text id="7m0jap"
auth.users.id
```

The corresponding application profile is:

```text id="5c9jkp"
profiles.id
```

These IDs must remain consistent.

---

# 7. Profile Security

Users can modify only their own profile.

Allowed:

```text id="6xyxch"
full_name
avatar_url
```

subject to validation.

A user cannot modify:

```text id="z5k7v0"
id
created_at
```

or another user's profile.

---

# 8. Workspace Security

Every protected resource belongs to a workspace either directly or indirectly.

Examples:

```text id="z0r7cw"
Form → Workspace
Lead → Workspace
Client Access → Workspace
Invitation → Workspace
Subscription → Workspace
Usage Counter → Workspace
```

A user must have valid workspace membership before accessing workspace-owned resources.

---

# 9. Workspace Isolation

Tenant isolation is mandatory.

User A must never be able to access:

```text id="r8u5u8"
User B's workspace
User B's forms
User B's leads
User B's clients
User B's invitations
User B's billing records
```

even if User A knows the resource UUID.

---

# 10. Authorization Must Be Server-Side

This is insecure:

```ts id="7a6w4q"
if (userCanSeeButton) {
  updateLead();
}
```

The server must independently verify:

```text id="uhg1u0"
authenticated user
→ workspace membership
→ resource ownership/access
→ requested action
```

---

# 11. Row-Level Security

Supabase PostgreSQL RLS is a required defense layer.

RLS should prevent cross-workspace access even if application-level code contains a mistake.

Application authorization and RLS are complementary.

Neither should be treated as optional.

---

# 12. RLS Policy Philosophy

Policies should be based on relationships.

Example:

```text id="j2p9k1"
authenticated user
    ↓
workspace_memberships
    ↓
workspace
    ↓
forms
```

Do not rely on client-supplied workspace IDs.

---

# 13. Workspace Membership

A user may access a workspace only if an appropriate membership exists.

Conceptually:

```sql id="8k7xwm"
exists (
  select 1
  from workspace_memberships wm
  where wm.workspace_id = target.workspace_id
    and wm.user_id = auth.uid()
)
```

The actual SQL should be implemented carefully to avoid recursive RLS problems.

---

# 14. Workspace Roles

V1 should use a minimal role model.

Recommended developer role:

```text id="d9ppgu"
owner
```

Client access is represented separately through:

```text id="x8h6f1"
client_form_access
```

Do not create a large RBAC system in V1.

---

# 15. Owner Permissions

The workspace owner may:

- View workspace
- Update workspace
- Create forms
- Update forms
- Archive forms
- Rotate form secrets
- View leads
- Update lead statuses
- Archive leads
- View analytics
- Invite clients
- Revoke client access
- View billing
- Manage subscription
- View usage
- Manage settings

---

# 16. Client Permissions

A client may:

- Sign in
- View assigned forms
- View assigned leads
- Search assigned leads
- Filter assigned leads
- View assigned analytics

A client may not:

- Create forms
- Update forms
- Archive forms
- Rotate secrets
- View secrets
- Change lead statuses
- Archive leads
- Invite users
- Revoke users
- View billing
- Change workspace settings
- Access another workspace
- Access another form
- Modify lead data

---

# 17. Permission Matrix

| Action | Owner | Client |
|---|---:|---:|
| View workspace | Yes | No |
| Edit workspace | Yes | No |
| Create form | Yes | No |
| View form | Yes | Assigned only |
| Edit form | Yes | No |
| Archive form | Yes | No |
| Rotate secret | Yes | No |
| View secret | Initial reveal only | No |
| Submit through API | Public API using form secret | N/A |
| View leads | Yes | Assigned only |
| Search leads | Yes | Assigned only |
| Change lead status | Yes | No |
| Archive lead | Yes | No |
| View analytics | Yes | Assigned only |
| Invite client | Yes | No |
| Revoke access | Yes | No |
| View billing | Yes | No |
| Manage billing | Yes | No |
| View usage | Yes | No |
| Workspace settings | Yes | No |

---

# 18. Form Security

Every form has:

```text id="t2f3x8"
public_id
secret_hash
status
workspace_id
```

The public ID is not a security credential.

The secret is the authentication credential for the public submission endpoint.

---

# 19. Form Public ID

Example:

```text id="6yn7f4"
frm_8Hk29x...
```

The public ID may safely appear in:

- URLs
- Integration instructions
- API endpoint documentation
- Browser requests

It must not be treated as authentication.

---

# 20. Form Secret

The form secret must be:

- Cryptographically random
- High entropy
- Generated server-side
- Displayed only when created or rotated
- Stored as a secure hash
- Never stored in plaintext in the database

---

# 21. Secret Storage

Database:

```text id="pjk2e6"
secret_hash
```

Not:

```text id="z0s7bj"
secret
```

The raw secret should not be persisted after the initial response.

---

# 22. Secret Comparison

Public submission authentication should:

1. Extract bearer token.
2. Identify form by public ID.
3. Retrieve the stored secret hash.
4. Verify the provided secret against the hash.
5. Continue only when verification succeeds.

Do not compare secrets using unsafe plain string storage.

---

# 23. Secret Exposure

Never expose form secrets in:

- Browser local storage
- Public HTML
- Analytics events
- Application logs
- Error messages
- Database query logs
- URLs
- Email
- Client dashboard
- Public documentation

---

# 24. Secret Rotation

Rotation must:

1. Authenticate the owner.
2. Authorize access to the form.
3. Generate a new secret.
4. Replace the stored hash.
5. Invalidate the previous secret immediately.
6. Return the new secret once.
7. Never return the old secret.

---

# 25. Secret Rotation Confirmation

Because rotation is destructive to the existing integration, require an explicit confirmation.

Example:

```text
Rotate form secret?

The current secret will stop working immediately.

Cancel
Rotate Secret
```

---

# 26. Public Submission Authentication

Endpoint:

```text
POST /api/v1/forms/{formPublicId}/submissions
```

Expected:

```http
Authorization: Bearer FORM_SECRET
```

Missing or invalid credentials must return:

```http
401 Unauthorized
```

Do not reveal whether a specific secret belongs to a specific form.

---

# 27. Browser Integration Warning

Formivo may technically support direct browser submissions.

However:

> A secret embedded in frontend JavaScript is not truly secret.

Production documentation should recommend:

```text id="i2m2v0"
Website Form
   ↓
Website Server
   ↓
Formivo API
```

rather than:

```text id="j2x6p7"
Browser
   ↓
Formivo API
```

for integrations requiring secret confidentiality.

---

# 28. CORS

Do not use permissive:

```http
Access-Control-Allow-Origin: *
```

by default for authenticated endpoints.

The public submission endpoint should be designed intentionally around the expected integration model.

If browser submissions are supported, configure CORS carefully and document that CORS does not protect exposed secrets.

---

# 29. Request Validation

Every API request must validate:

- HTTP method
- Authentication
- Authorization
- Content-Type
- JSON structure
- Required fields
- String lengths
- Object size
- Metadata size
- Allowed enum values
- Pagination parameters
- Filter values

Use a schema validation library such as Zod.

---

# 30. Payload Limits

Public submission payloads must have a strict maximum size.

Recommended V1 limit:

```text id="v6c9ju"
256 KB
```

The exact limit may be adjusted during implementation, but it must be enforced before expensive processing.

Oversized requests return:

```http
413 Payload Too Large
```

---

# 31. Lead Data Security

Lead data is flexible JSON.

However, Formivo should not allow:

- Arbitrarily large nested objects
- Extremely deep nesting
- Unlimited arrays
- Executable content
- Dangerous serialized payloads

The application should validate the JSON structure and enforce size limits.

---

# 32. HTML Rendering Security

Lead values are untrusted.

Never render lead data using:

```text id="c0z72s"
dangerouslySetInnerHTML
```

unless there is an explicit, carefully sanitized use case.

Default rendering should treat all lead data as plain text.

---

# 33. XSS Protection

Protect against:

- Stored XSS
- Reflected XSS
- DOM-based XSS

Especially in:

- Lead values
- Form names
- Workspace names
- Client names
- Metadata
- Search parameters
- Error messages

---

# 34. SQL Injection

Never construct SQL using raw string concatenation.

Use:

- Supabase query builder
- Parameterized queries
- Safe database functions where required

Never interpolate user input into SQL.

---

# 35. Authorization by Resource

Every resource lookup should be authorization-aware.

Bad:

```ts id="1d4l6n"
const form = await getForm(formId);
```

followed by assuming access.

Better conceptual flow:

```text id="4gdrtb"
Authenticate user
 ↓
Resolve workspace
 ↓
Authorize form
 ↓
Fetch form
```

---

# 36. Prevent IDOR

Formivo must protect against Insecure Direct Object Reference attacks.

Examples:

```text id="j85p6v"
/api/leads/OTHER_USERS_LEAD
/api/forms/OTHER_USERS_FORM
/api/invitations/OTHER_WORKSPACE_INVITATION
```

must never return data merely because the attacker knows the ID.

---

# 37. Client Form Access

Client access must always be checked against:

```text id="b0xwqt"
client_form_access.user_id
client_form_access.form_id
```

and the related workspace.

A client having access to Form A does not imply access to Form B.

---

# 38. Client URL Security

This must fail:

```text id="zz2u8g"
/client/forms/form-A
```

when the user only has access to:

```text id="k5e1qn"
form-B
```

The server must return an authorization failure.

---

# 39. Invitation Security

Invitation tokens must be:

- Random
- High entropy
- Single-purpose
- Expiring
- Stored as hashes
- Invalid after acceptance
- Invalid after revocation

Never store raw invitation tokens in the database.

---

# 40. Invitation Expiration

Recommended V1 lifetime:

```text id="b5y0dz"
7 days
```

Expired invitations cannot be accepted.

---

# 41. Invitation Acceptance

Acceptance flow:

```text id="9aj6ca"
Invitation Link
 ↓
Validate Token
 ↓
Check Expiration
 ↓
Check Status
 ↓
Authenticate / Create Account
 ↓
Associate User
 ↓
Create Client Access
 ↓
Mark Invitation Accepted
```

The operation must be atomic where possible.

---

# 42. Invitation Email Security

Invitation emails must not contain:

- Form secrets
- Lead data
- Billing data
- Workspace-private information

The email should contain only the information needed to accept the invitation.

---

# 43. Invitation Enumeration

Do not reveal whether an arbitrary invitation token exists through unnecessarily detailed error messages.

Use safe responses such as:

```text
This invitation is invalid or has expired.
```

---

# 44. Rate Limiting

Rate limiting is required for:

- Public submission endpoint
- Authentication-sensitive endpoints where applicable
- Invitation creation
- Password-related actions
- Secret rotation
- Webhook processing where relevant

---

# 45. Public Submission Rate Limit

Rate limiting should consider:

```text id="r1l2nv"
Form
IP
Request characteristics
```

Do not rely solely on IP because multiple users may legitimately share an IP.

The exact algorithm may be implemented using a suitable Vercel-compatible or database-backed mechanism.

---

# 46. Rate Limit Response

Return:

```http
429 Too Many Requests
```

with:

```json id="x9r5a4"
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "requestId": "req_xxx"
  }
}
```

Do not expose internal rate-limit implementation details.

---

# 47. Quota Enforcement

Rate limiting and monthly lead quota are different.

Rate limiting protects infrastructure.

Quota enforcement protects plan entitlements.

Example:

```text id="g84f5c"
Rate limit:
100 requests/minute

Plan quota:
2,000 accepted leads/month
```

Both must be enforced.

---

# 48. Quota Race Conditions

Lead quota enforcement must account for concurrent requests.

Do not rely only on:

```text id="0x6i8d"
SELECT count(...)
if count < limit
INSERT
```

without considering concurrent requests.

Use transactional or atomic mechanisms to prevent quota bypass.

---

# 49. Idempotency

The public submission endpoint supports:

```http
Idempotency-Key: unique-key
```

If supplied, repeated requests using the same key should not create duplicate leads.

---

# 50. Idempotency Security

An idempotency key must be scoped to the form.

The same key on different forms must not collide.

The request payload should also be compared.

If the same key is reused with a different request body:

```http
409 Conflict
```

with an appropriate error code.

---

# 51. Database Transactions

Submission processing should be atomic.

Conceptually:

```text id="8u6b3n"
Validate request
 ↓
Authenticate secret
 ↓
Check form status
 ↓
Check quota
 ↓
Check idempotency
 ↓
Create lead
 ↓
Update usage
 ↓
Store idempotency response
 ↓
Commit
```

If the transaction fails, the system should not leave inconsistent counters or partial records.

---

# 52. Lead Status Authorization

Only authorized developer users may update lead status.

Allowed:

```text id="u4j88n"
new
contacted
qualified
converted
archived
```

Reject unknown statuses.

---

# 53. Archived Leads

Archived leads should not be silently deleted.

V1 uses logical archival.

Example:

```text id="f5bcb4"
archived_at
status = archived
```

This preserves data integrity.

---

# 54. Archived Forms

Archiving a form should:

- Mark the form inactive/archived.
- Stop new public submissions.
- Preserve existing leads.
- Preserve analytics history.
- Preserve client access records until explicitly revoked or otherwise handled.

---

# 55. Billing Security

Formivo uses Lemon Squeezy.

Stripe must not be introduced.

Billing credentials and API keys are server-only.

---

# 56. Lemon Squeezy Webhook Security

Every webhook must:

1. Receive the raw request body.
2. Read the provider signature.
3. Verify the signature.
4. Reject invalid signatures.
5. Identify the event.
6. Check whether the event was already processed.
7. Process it safely.
8. Record the event.
9. Return success only after appropriate processing.

---

# 57. Webhook Replay Protection

Use:

```text id="c5d3y1"
webhook_events
```

with:

```text id="f6a4oz"
provider
event_id
```

unique together.

Duplicate events must not create duplicate subscription changes.

---

# 58. Webhook Payload Security

Do not trust:

```text id="6fy9az"
plan
price
status
customer
workspace
```

without mapping them against the application's known Lemon Squeezy configuration and subscription records.

---

# 59. Billing Entitlements

Application access must be based on normalized internal subscription state.

Do not scatter checks like:

```ts id="7m2bq9"
if (plan === "pro") ...
```

throughout the UI.

Use a centralized entitlement service.

Example:

```text id="xq5nq5"
getWorkspaceEntitlements(workspaceId)
```

---

# 60. Plan Limits

Canonical V1 limits:

```text id="e7v8cc"
Free
Forms: 1
Monthly leads: 100
Viewers: 1

Pro
Forms: 10
Monthly leads: 2,000
Viewers: 5

Agency
Forms: unlimited
Monthly leads: 10,000
Viewers: unlimited
```

These values must be centralized.

---

# 61. Billing Authorization

Only the workspace owner may:

- Start checkout
- Change subscription
- View billing details
- Manage billing

Clients must never access billing endpoints.

---

# 62. Service Role Security

Supabase service-role credentials bypass RLS.

Therefore:

> Service-role access must never be exposed to the browser.

Use it only in trusted server-side contexts where absolutely necessary.

---

# 63. Environment Variables

Server-only secrets include:

```text id="fyb0o1"
SUPABASE_SERVICE_ROLE_KEY
LEMON_SQUEEZY_API_KEY
LEMON_SQUEEZY_WEBHOOK_SECRET
RESEND_API_KEY
FORM_SECRET_ENCRYPTION_OR_HASH_CONFIG
```

Never prefix server-only secrets with:

```text
NEXT_PUBLIC_
```

---

# 64. Public Environment Variables

Only values intentionally required by the browser may use:

```text id="h3p4ye"
NEXT_PUBLIC_
```

Examples may include:

```text id="j4q1r5"
Supabase project URL
Supabase publishable/anon key
```

depending on the chosen Supabase client configuration.

---

# 65. Logging

Logs may include:

```text id="f8v4go"
requestId
route
method
status
duration
workspaceId
formId
userId
```

where appropriate.

Do not log:

```text id="x5c6b2"
form secret
password
session token
access token
invitation token
API key
payment credentials
raw sensitive lead data
```

---

# 66. Request IDs

Every important server request should have a request ID.

Example:

```text id="l4k4q1"
req_01J...
```

Return it in API error responses.

This helps support debugging without exposing internal details.

---

# 67. Error Messages

Errors should be:

- Human-readable
- Stable enough for clients
- Safe
- Non-sensitive

Good:

```text id="6ym6r4"
The form could not be found.
```

Bad:

```text id="k5j6w8"
Postgres relation forms row 8f91... failed because ...
```

---

# 68. Security Headers

Production should configure appropriate security headers, including where compatible:

```text id="gl2kpn"
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

The CSP should be tested against:

- Supabase
- Lemon Squeezy
- Resend-related flows
- Vercel
- Application assets

Do not blindly deploy an overly restrictive CSP that breaks the product.

---

# 69. HTTPS

Production traffic must use HTTPS.

Do not transmit:

- Form secrets
- Sessions
- Passwords
- Invitation tokens

over insecure HTTP.

---

# 70. Cookie Security

Authentication cookies should use appropriate secure settings in production.

Where applicable:

```text id="j4tq1z"
Secure
HttpOnly
SameSite
```

Supabase's recommended authentication architecture should be followed.

---

# 71. CSRF

For cookie-authenticated mutations, implement appropriate CSRF protection or use an authentication architecture that provides equivalent protection.

Do not assume that SameSite alone is sufficient for every architecture.

---

# 72. Open Redirect Protection

Authentication redirects must not blindly trust arbitrary user-supplied URLs.

Only allow safe internal redirect destinations or a strict allowlist.

---

# 73. File Uploads

V1 does not require arbitrary file uploads.

Do not introduce file-upload infrastructure unless explicitly required.

This reduces:

- Malware risk
- Storage complexity
- Content-type attacks
- Abuse vectors

---

# 74. Third-Party API Security

All third-party credentials must remain server-side.

Third-party services:

```text id="7l1s5j"
Supabase
Lemon Squeezy
Resend
```

Do not call privileged provider APIs directly from the browser.

---

# 75. Email Security

Resend API calls must occur server-side.

Emails should not expose:

- Form secrets
- Authentication tokens unnecessarily
- Full lead contents
- Internal database IDs when avoidable

Invitation URLs should use secure expiring tokens.

---

# 76. Email Enumeration

Authentication and invitation flows should avoid unnecessary account-existence disclosure.

Example:

Instead of:

```text
No account exists with that email.
```

prefer:

```text
If an account exists, instructions have been sent.
```

where appropriate.

---

# 77. Password Security

Formivo should not implement custom password hashing.

Supabase Auth manages password authentication.

Do not store passwords in Formivo application tables.

---

# 78. Database Security

Database credentials must never appear in:

- Git
- Client bundles
- Documentation examples containing real values
- Screenshots
- Public repositories

Use environment variables.

---

# 79. Secret Rotation for Provider Credentials

Provider credentials should be replaceable without code changes.

Examples:

```text id="5aj2kq"
Supabase keys
Lemon Squeezy keys
Resend keys
```

Use environment configuration.

---

# 80. Git Security

Never commit:

```text id="b0r0dz"
.env
.env.local
provider secrets
form secrets
invitation tokens
production database credentials
```

Maintain a safe:

```text id="5t3x7s"
.env.example
```

with placeholders only.

---

# 81. Dependency Security

Use maintained dependencies.

Before production:

```text id="m7x7x4"
npm audit
```

or the repository's equivalent security checks should be reviewed.

Do not automatically apply potentially breaking dependency updates during feature development.

---

# 82. Input Length Limits

Apply sensible limits to:

```text id="p4q6qt"
Workspace name
Form name
Form description
Lead fields
Metadata
Search parameters
Invitation email
```

This protects both the database and UI.

---

# 83. Pagination Security

Never allow arbitrary:

```text id="6f8yur"
limit=999999999
```

Set server-side maximums.

Example:

```text id="0ryy03"
Default: 25
Maximum: 100
```

---

# 84. Sorting Security

Do not directly inject a user-provided sort column into SQL.

Use an allowlist:

```text id="f4t7m5"
created_at
updated_at
status
```

Map safe API values to known database columns.

---

# 85. Filter Security

Filters should use controlled values.

Example:

```text id="3f4jzi"
new
contacted
qualified
converted
archived
```

Unknown values should return a validation error.

---

# 86. Search Security

Search strings should:

- Be length-limited
- Be safely parameterized
- Avoid unrestricted database queries
- Avoid expensive wildcard abuse

---

# 87. Abuse Prevention

Formivo's public submission API is an abuse target.

V1 should protect against:

- Spam
- Request flooding
- Oversized payloads
- Repeated duplicate requests
- Secret brute forcing
- Endpoint enumeration
- Quota abuse

---

# 88. Secret Brute Force Protection

Repeated invalid form secret attempts should be rate-limited.

Do not provide increasingly detailed authentication errors.

---

# 89. Public Endpoint Enumeration

A request to:

```text id="0emk7n"
/api/v1/forms/random-id/submissions
```

should not reveal unnecessary information about whether the form ID exists.

Use safe error behavior.

---

# 90. Timing Considerations

Authentication checks should avoid obvious timing leaks where practical.

Do not implement insecure manual secret comparisons.

Use established cryptographic verification methods.

---

# 91. Client Data Isolation

A client assigned to Form A must not infer or access:

- Form B's leads
- Form B's analytics
- Form B's metadata
- Form B's client list
- Form B's integration credentials

---

# 92. Billing Data Isolation

A workspace can only access its own subscription.

A user cannot request:

```text id="t3y6t8"
/api/billing?workspaceId=other-workspace
```

and receive another workspace's billing information.

The active authenticated workspace context must be resolved server-side.

---

# 93. Cross-Tenant Testing

Automated tests must explicitly attempt:

```text id="c9q2sm"
User A → User B workspace
User A → User B form
User A → User B lead
Client A → Client B form
Client → developer endpoint
```

All must fail safely.

---

# 94. Security Test Cases

Minimum tests:

### Authentication

```text id="u1w8c9"
Unauthenticated dashboard request
Invalid credentials
Expired session
Signed-out session
```

### Authorization

```text id="v5q3m8"
Cross-workspace access
Cross-form access
Client attempting owner action
```

### Secrets

```text id="d3p6s4"
Invalid secret
Missing secret
Rotated secret
Old secret after rotation
```

### Input

```text id="z4v1f7"
Malformed JSON
Oversized payload
Invalid status
Invalid pagination
Invalid filter
```

### Abuse

```text id="m2b6y1"
Rate limit
Quota exceeded
Repeated idempotency key
Idempotency key with changed body
```

---

# 95. Billing Security Tests

Test:

```text id="f8g2u6"
Valid Lemon Squeezy webhook
Invalid signature
Duplicate webhook
Unknown event
Malformed webhook
Subscription downgrade
Subscription cancellation
```

---

# 96. Invitation Security Tests

Test:

```text id="7xq8z3"
Valid invitation
Expired invitation
Revoked invitation
Already accepted invitation
Invalid token
Token reuse
Wrong account
```

---

# 97. RLS Testing

RLS must be tested independently from UI authorization.

Example:

```text id="v8h4f5"
Authenticated User A
attempts direct Supabase access to User B's records
```

Expected:

```text
No unauthorized rows returned.
```

---

# 98. Service Role Testing

Any service-role code must be reviewed to ensure:

- It receives validated input.
- It performs explicit authorization where necessary.
- It does not expose data to unauthorized users.
- It is never imported into client components.

---

# 99. Security Review Checklist

Before production:

```text id="d5v4g1"
[ ] RLS enabled
[ ] RLS policies tested
[ ] Server authorization implemented
[ ] Form secrets hashed
[ ] Secrets not logged
[ ] Invitation tokens hashed
[ ] Rate limiting active
[ ] Payload limits active
[ ] Quotas enforced atomically
[ ] Idempotency implemented
[ ] Webhook signature verified
[ ] Webhook replay protection active
[ ] Service role server-only
[ ] Resend key server-only
[ ] Lemon Squeezy keys server-only
[ ] HTTPS enabled
[ ] Security headers configured
[ ] Error responses sanitized
[ ] Cross-tenant tests passing
[ ] Client permission tests passing
[ ] Dependency security reviewed
[ ] Production environment variables configured
```

---

# 100. Security Incident Principle

If a secret is accidentally exposed:

1. Rotate the affected secret immediately.
2. Investigate logs.
3. Identify the exposure scope.
4. Remove the secret from the affected environment.
5. Replace compromised credentials.
6. Document the incident.

Do not rely on deleting the UI element alone.

---

# 101. No Security Through Obscurity

The following are not security mechanisms:

```text id="m8q2n9"
Random UUIDs
Hidden buttons
Private routes
Unlisted URLs
Obscure endpoint names
```

They can provide useful defense-in-depth, but authorization must still be enforced.

---

# 102. Security vs UX

Security controls should be understandable.

For example:

```text id="7d8w0m"
"Rotate Secret"
```

should clearly explain its consequence.

Avoid confusing users with unnecessary security terminology.

---

# 103. Security vs Performance

Security checks must not require excessive database queries.

Where appropriate:

- Reuse authenticated session information.
- Centralize authorization helpers.
- Use indexed relationships.
- Use efficient RLS policies.
- Avoid duplicate membership lookups.

Do not remove authorization checks merely for performance.

---

# 104. Central Authorization Helpers

Use reusable server-side authorization functions.

Conceptually:

```ts id="1m2c9z"
requireAuthenticatedUser()

requireWorkspaceOwner(workspaceId)

requireFormOwner(formId)

requireClientFormAccess(formId)

requireLeadAccess(leadId)
```

These helpers should fail safely.

---

# 105. Authorization Result

Authorization helpers should return either:

```text id="p3k4q5"
Authorized context
```

or:

```text
Unauthorized
```

Do not silently continue after an authorization failure.

---

# 106. Security-Critical Services

Security-sensitive logic should be centralized into services such as:

```text id="z7y8x1"
authService
authorizationService
formSecretService
submissionService
quotaService
invitationService
billingService
```

Avoid duplicating security logic across pages.

---

# 107. Security Documentation

Developer documentation should explain:

- How to authenticate
- How to use form secrets
- Why secrets should not be exposed in client code
- API limits
- Error behavior
- Idempotency
- Integration recommendations

Do not document internal security implementation details that could create unnecessary attack surface.

---

# 108. V1 Security Non-Goals

Do not implement:

```text id="k5j9c2"
Enterprise SSO
SAML
SCIM
Advanced RBAC
Custom security policies
Customer-managed encryption keys
IP allowlists
Private networking
SOC 2 automation
Advanced threat detection
```

These are outside V1.

---

# 109. Security Definition of Done

Security is complete for V1 when:

```text id="u6x5p8"
Authentication works
+
Authorization works
+
RLS works
+
Tenant isolation is tested
+
Secrets are protected
+
Public API is rate-limited
+
Payloads are validated
+
Quotas are enforced
+
Idempotency works
+
Invitations are secure
+
Client permissions are enforced
+
Billing webhooks are verified
+
Provider credentials are server-only
+
Errors do not leak sensitive information
```

---

# 110. Final Security Rule

The most important Formivo security principle is:

> **Every request must prove both identity and permission before receiving or modifying protected data.**

The frontend may improve the user experience, but the backend and database are the final authority.

Formivo V1 must be secure even when a malicious user completely ignores the UI and directly calls the application APIs.