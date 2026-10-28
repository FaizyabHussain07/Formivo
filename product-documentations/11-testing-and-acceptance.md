# Formivo — Testing & Acceptance Specification

**File:** `11-testing-and-acceptance.md`  
**Product:** Formivo  
**Version:** Version 3.0  
**Status:** Implementation-Ready

---

## 1. Purpose

This document defines the complete testing strategy, acceptance criteria, quality gates, release checks, and regression requirements for Formivo V1.

The goal is not merely to verify that individual functions work.

The goal is to prove that Formivo is:

- Functionally correct
- Secure
- Multi-tenant safe
- Permission-safe
- Billing-safe
- Reliable under failure
- Responsive
- Accessible
- Production-ready
- Consistent with the approved V1 scope

Every major feature must have automated tests where practical and explicit acceptance criteria.

The implementation is not considered complete because the UI works visually.

A feature is complete only when:

1. Its expected behavior works.
2. Invalid behavior is rejected.
3. Unauthorized behavior is rejected.
4. Failure states are handled.
5. Data isolation is verified.
6. Relevant edge cases are tested.
7. The feature passes the applicable release gates.

---

# 2. Testing Principles

Formivo follows these principles:

### 2.1 Security before convenience

A test must verify that users cannot access data merely because the frontend hides a control.

Authorization must be enforced server-side.

### 2.2 Test both success and failure

Every important workflow must include:

- Happy path
- Invalid input
- Unauthorized access
- Missing resources
- Expired state
- Provider failure
- Network failure where relevant
- Duplicate requests where relevant

### 2.3 Test tenant isolation aggressively

Formivo is a multi-tenant SaaS.

Cross-workspace data leakage is a critical failure.

Tests must verify that:

- Workspace A cannot access Workspace B.
- Client A cannot access Client B's assigned forms.
- A client cannot access another form inside the same workspace unless explicitly assigned.
- IDs cannot be manipulated to bypass authorization.

### 2.4 Test backend behavior independently of UI

The backend must remain secure even when:

- JavaScript is disabled.
- Requests are manually constructed.
- API endpoints are called directly.
- UI restrictions are bypassed.
- IDs are modified.
- Cookies/session state is manipulated.

### 2.5 Provider integrations must be testable

Lemon Squeezy and Resend should be abstracted behind services so provider behavior can be mocked during automated testing.

Do not make the entire test suite dependent on live external providers.

### 2.6 Tests must be deterministic

Avoid tests that depend on:

- Current production data
- Real customer accounts
- Random uncontrolled data
- External provider availability
- Arbitrary timing

Use controlled fixtures and test environments.

---

# 3. Test Strategy

Formivo should use multiple testing layers.

```text
                    ┌──────────────────────┐
                    │   Manual QA / Smoke   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │       E2E Tests      │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Integration/API Tests│
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   Unit Tests          │
                    └──────────────────────┘
```

Testing layers:

1. Unit tests
2. Integration tests
3. API tests
4. Database/RLS tests
5. Authentication tests
6. Authorization tests
7. Security tests
8. UI/component tests
9. End-to-end tests
10. Accessibility tests
11. Responsive tests
12. Performance tests
13. Provider integration tests
14. Production smoke tests

---

# 4. Test Pyramid

The majority of tests should be fast lower-level tests.

Recommended distribution:

- **50–60% Unit**
- **20–25% Integration/API**
- **10–15% E2E**
- **5–10% Manual/visual/smoke**

Do not attempt to test every small utility through a browser.

Use the lowest appropriate test layer.

---

# 5. Unit Tests

Unit tests should cover isolated business logic.

Important areas:

- Plan configuration
- Entitlement calculations
- Usage calculations
- Form validation
- Lead validation
- Secret generation
- Secret hashing
- Secret verification
- Invitation token generation
- Invitation token hashing
- Status transitions
- Pagination
- Filtering
- Search parameter normalization
- Analytics aggregation
- Idempotency request hashing
- Error normalization
- Provider status normalization
- Date/period calculations

Example:

```ts
describe("plan limits", () => {
  it("allows one form on free plan", () => {
    expect(canCreateForm("free", 0)).toBe(true);
  });

  it("blocks second form on free plan", () => {
    expect(canCreateForm("free", 1)).toBe(false);
  });
});
```

Unit tests must not require a real Supabase database unless the behavior being tested is specifically database-dependent.

---

# 6. Integration Tests

Integration tests verify multiple application layers working together.

Examples:

- Authentication + workspace creation
- Workspace + form creation
- Form + secret verification
- Submission + lead creation
- Lead + usage counter
- Invitation + client access
- Subscription + entitlement calculation
- Webhook + subscription update

Integration tests should use an isolated test database or controlled test environment.

Each test should clean up its data or use isolated test records.

---

# 7. API Tests

Every V1 API endpoint must have API-level tests.

Each endpoint should test:

### Success

- Valid request
- Correct authentication
- Correct response
- Correct database mutation

### Validation

- Missing required fields
- Invalid types
- Invalid IDs
- Invalid enum values
- Oversized payloads
- Malformed JSON

### Authorization

- Unauthenticated request
- Wrong workspace
- Wrong form
- Client attempting developer operation
- User attempting another user's resource

### Failure

- Missing resource
- Archived resource
- Quota exceeded
- Rate limit exceeded
- Provider failure
- Database failure where practical

### Response integrity

Responses must not expose:

- Secrets
- Secret hashes
- Internal database errors
- Stack traces
- Provider API keys
- Sensitive implementation details

---

# 8. Database and RLS Tests

Supabase Row Level Security is a critical security boundary.

RLS tests must verify tenant isolation independently of frontend behavior.

At minimum test:

### Workspace isolation

```text
User A → Workspace A → allowed
User A → Workspace B → denied
```

### Form isolation

```text
Workspace A / Form A → allowed
Workspace A / Form B → allowed only if authorized
Workspace B / Form C → denied
```

### Lead isolation

A user must never retrieve leads belonging to another workspace.

### Client isolation

A client viewer must only retrieve leads for forms explicitly assigned to that client.

### Mutation isolation

Client viewers must not be able to:

- Create forms
- Modify forms
- Rotate secrets
- Change lead status
- Archive leads
- Archive forms
- Manage invitations
- Modify billing

### Direct query tests

Attempt unauthorized database operations directly through the authenticated user's context.

Do not rely only on API tests.

---

# 9. Authentication Tests

Authentication tests must cover:

### Sign-up

- Valid registration
- Invalid email
- Weak/invalid password
- Duplicate email
- Successful account creation

### Sign-in

- Correct credentials
- Incorrect password
- Unknown account
- Session creation

### Sign-out

- Session invalidated
- Protected routes reject the user after logout

### Password reset

- Valid reset flow
- Invalid/expired reset token
- Password successfully changed
- Old credentials no longer work where applicable

### Session behavior

Test:

- Expired session
- Missing session
- Invalid session
- Protected route without authentication

---

# 10. Authorization Tests

Authorization is separate from authentication.

A valid authenticated user can still be unauthorized.

Test all major roles.

## Developer / Owner

Must be able to:

- View workspace
- Create forms
- Update forms
- Rotate secrets
- View leads
- Update lead status
- Archive leads
- View analytics
- Invite clients
- Revoke client access
- View billing
- Manage subscription

## Client Viewer

Must be able to:

- View assigned forms
- View assigned form leads
- View assigned form analytics

Must not be able to:

- Create forms
- Edit forms
- Rotate secrets
- View secrets
- Modify leads
- Archive leads
- Invite clients
- Revoke access
- View billing
- Modify workspace settings
- Access another workspace
- Access unassigned forms

---

# 11. Public Submission Endpoint Tests

Endpoint:

```text
POST /api/v1/forms/{formPublicId}/submissions
```

This is one of the highest-priority test areas.

## 11.1 Valid submission

Given:

- Active form
- Valid secret
- Valid JSON payload
- Available quota

Expected:

- HTTP success response
- Lead created
- Lead linked to correct workspace
- Lead linked to correct form
- Usage counter incremented
- Correct lead ID returned

---

## 11.2 Missing secret

Expected:

```text
401 Unauthorized
```

No lead should be created.

---

## 11.3 Invalid secret

Expected:

```text
401 Unauthorized
```

No lead should be created.

---

## 11.4 Invalid form

Expected:

```text
404
```

No lead should be created.

---

## 11.5 Archived form

Expected:

```text
FORM_INACTIVE
```

No lead should be created.

---

## 11.6 Invalid payload

Test:

- Missing `data`
- `data` not an object
- Invalid metadata
- Unsupported data types
- Malformed JSON

Expected:

```text
400 or 422
```

No lead should be created.

---

## 11.7 Payload too large

Send a payload above the configured maximum.

Expected:

```text
413 Payload Too Large
```

No lead should be created.

---

## 11.8 Quota exceeded

When the workspace has reached its monthly lead limit:

Expected:

```text
429 QUOTA_EXCEEDED
```

No additional lead should be created.

---

## 11.9 Rate limited

Repeated requests beyond the configured limit should return:

```text
429 RATE_LIMITED
```

The response must not reveal internal rate-limit implementation details.

---

# 12. Idempotency Tests

Idempotency is required for the public submission endpoint.

Given:

```http
Idempotency-Key: abc123
```

and a valid request:

### First request

Expected:

- Lead created
- Success response stored

### Same key + same body

Expected:

- No second lead
- Original response returned

### Same key + different body

Expected:

```text
409 Conflict
```

No second lead should be created.

### Different key

Expected:

- New valid lead may be created

### Expired key

After idempotency record expiry:

- New request may be processed according to configured retention rules.

---

# 13. Secret Rotation Tests

Test:

1. Create form.
2. Store generated secret securely.
3. Submit using old secret.
4. Rotate secret.
5. Submit using old secret.
6. Submit using new secret.

Expected:

```text
Old secret → rejected
New secret → accepted
```

The secret must never be returned in:

- Logs
- Error responses
- Analytics
- Client dashboard
- Lead records

---

# 14. Form Creation and Integration Tests

Test:

### Form creation

- Valid name
- Empty name rejection
- Duplicate/invalid data handling
- Plan limit enforcement
- Correct workspace association

### Integration setup

Verify that the integration page shows:

- Endpoint
- HTTP method
- Authorization requirements
- Example request
- Example response
- Security warning
- Test submission instructions

The raw secret should be shown only according to the approved secure flow.

### Archived form

Archived forms:

- Remain visible to authorized users where appropriate
- Reject new submissions
- Cannot receive new leads

---

# 15. Lead Management Tests

Test:

### Lead list

- Correct leads displayed
- Workspace filtering
- Form filtering
- Pagination
- Search
- Status filtering
- Sorting

### Lead detail

Verify:

- Correct lead
- Dynamic JSON data rendered safely
- Metadata rendered safely
- Status displayed correctly
- Timestamp displayed correctly

### Status changes

Allowed statuses:

```text
New
Contacted
Qualified
Converted
Archived
```

Invalid status values must be rejected.

### Client viewer

Client viewers must not be able to modify lead status.

### Archive

Archiving must not delete the underlying record unless explicitly designed otherwise.

---

# 16. Analytics Tests

Analytics must use only data the requesting user is authorized to access.

Test:

- Total leads
- Leads by status
- Leads over time
- Form-level analytics
- Date filters if implemented
- Empty datasets
- Large datasets
- Client analytics restrictions

Cross-workspace analytics must always return denied/empty according to the API contract.

Client analytics must only include assigned forms.

Analytics must not expose data from unassigned forms.

---

# 17. Client Invitation and Access Tests

Test:

### Invitation creation

- Valid email
- Valid form
- Authorized developer
- Viewer quota available

### Invalid cases

- Unauthorized requester
- Invalid form
- Form outside workspace
- Quota exceeded
- Invalid email
- Duplicate pending invitation

### Token security

Verify:

- Raw token is not stored
- Hash is stored
- Token expires
- Token cannot be reused
- Revoked invitation cannot be accepted

### Acceptance

Valid invitation:

```text
pending → accepted
```

The accepted user receives access only to the assigned form.

### Revocation

After revocation:

```text
Client → assigned form
```

must become:

```text
Access denied
```

Existing sessions must not bypass the new authorization state.

---

# 18. Billing and Lemon Squeezy Tests

Lemon Squeezy is the only V1 payment provider.

There must be no Stripe implementation.

Test:

### Free plan

Verify:

```text
1 form
100 leads/month
1 viewer
```

### Pro plan

Verify:

```text
10 forms
2,000 leads/month
5 viewers
```

### Agency plan

Verify:

```text
Unlimited forms
10,000 leads/month
Unlimited viewers
```

Unlimited must be represented explicitly rather than through unsafe arbitrary numbers.

---

## 18.1 Checkout

Test:

- Correct plan selected
- Correct Lemon Squeezy variant
- Server validates requested plan
- Client cannot submit arbitrary variant IDs to gain a cheaper plan
- Checkout URL returned correctly
- Provider failure handled safely

---

## 18.2 Webhook signature

Invalid signature:

```text
Request rejected
```

Valid signature:

```text
Event processed
```

Never trust webhook data without signature verification.

---

## 18.3 Webhook replay

Send the same event twice.

Expected:

```text
First event → processed
Second event → ignored/idempotently handled
```

No duplicate subscription state changes should occur.

---

## 18.4 Subscription lifecycle

Test provider events representing:

- Created
- Active
- Updated
- Cancelled
- Expired
- Paused
- Past due where applicable

The local subscription state must correctly reflect the verified provider state.

---

# 19. Downgrade Tests

Downgrading must not silently delete customer data.

Example:

```text
Agency
↓
Free
```

If the workspace currently has:

```text
12 forms
```

and Free allows:

```text
1 form
```

expected behavior:

- Existing forms remain stored.
- Existing leads remain stored.
- Existing viewers remain stored.
- User cannot create additional forms.
- User cannot create additional viewers beyond the new plan limit.
- UI clearly explains the exceeded limits.

Never automatically delete customer data merely because a plan was downgraded.

---

# 20. Usage and Entitlement Tests

All quota checks must use a centralized entitlement service.

Test:

### Form quota

```text
Free + 0 forms → allowed
Free + 1 form → blocked
```

### Viewer quota

```text
Free + 0 viewers → allowed
Free + 1 viewer → blocked
```

### Lead quota

Verify monthly lead counting.

Important:

Usage increments must be atomic.

Concurrent submissions must not produce:

```text
incorrect counter
negative counter
duplicate counting
quota bypass
```

Use concurrency tests where practical.

---

# 21. Resend Email Tests

Resend must be accessed only from server-side code.

Test:

### Invitation email

Verify:

- Correct recipient
- Correct invitation URL
- Correct sender
- Correct form/workspace context
- No secrets included
- No sensitive lead data included

### Invitation token

Verify:

- Raw token only appears in invitation URL
- Database stores token hash
- Expired token fails
- Revoked token fails
- Used token cannot be reused

### Provider failure

Simulate Resend failure.

Expected:

- Application handles failure gracefully
- User receives actionable error
- Sensitive provider information is not exposed
- Logs contain safe diagnostic information

---

# 22. Security Tests

Security testing is mandatory before production.

Test:

### Authentication bypass

Attempt protected requests without authentication.

Expected:

```text
401
```

### Authorization bypass

Modify:

- Workspace ID
- Form ID
- Lead ID
- User ID

Expected:

```text
Access denied
```

### IDOR protection

Attempt:

```text
/api/leads/<another-user-lead-id>
```

Must not expose the lead.

### Secret exposure

Search application responses and logs for:

- Form secrets
- Secret hashes
- Supabase service role key
- Lemon Squeezy API key
- Resend API key

None may be exposed.

### XSS

Test malicious strings in lead data:

```html
<script>alert("x")</script>
```

Expected:

- Rendered as text
- Never executed

### SQL injection

Test malicious query values.

Expected:

- No SQL execution
- Safe query handling

### Open redirects

Verify user-controlled URLs cannot redirect users to arbitrary malicious destinations.

### SSRF

If server-side URL fetching is introduced later, it must be separately secured.

V1 should avoid unnecessary server-side URL fetching.

---

# 23. Rate Limiting Tests

Rate limiting must be tested on public endpoints and sensitive actions.

Test:

- Public submissions
- Authentication abuse where applicable
- Invitation creation
- Secret rotation
- Billing checkout creation

Verify:

- Threshold is enforced
- `429` is returned
- Retry information is handled appropriately
- Legitimate users can recover after the window
- Rate limiting cannot be bypassed simply by modifying a client-controlled identifier

---

# 24. UI and Component Tests

Reusable UI components should be tested where behavior is non-trivial.

Examples:

- Form creation dialog
- Secret display
- Secret rotation confirmation
- Lead table
- Lead status selector
- Search/filter controls
- Pagination
- Invitation dialog
- Billing plan selector
- Usage indicators
- Error states
- Empty states
- Confirmation dialogs

Test:

- Rendering
- Interaction
- Validation
- Disabled states
- Loading states
- Error states
- Keyboard behavior
- Permission-aware rendering

Do not rely on component tests alone for authorization.

---

# 25. End-to-End Tests

E2E tests should cover complete user journeys.

## E2E Flow 1 — Developer onboarding

```text
Visit Formivo
→ Sign up
→ Create workspace
→ Dashboard
→ Create form
→ View integration
```

Expected: workflow completes without errors.

---

## E2E Flow 2 — Public lead submission

```text
Create form
→ Copy endpoint
→ Submit valid payload
→ Open dashboard
→ Lead appears
```

Expected:

- Lead exists
- Correct form
- Correct workspace
- Correct timestamp

---

## E2E Flow 3 — Lead management

```text
Open lead
→ Change status
→ Return to list
→ Verify status
```

---

## E2E Flow 4 — Client invitation

```text
Developer
→ Invite client
→ Invitation sent
→ Client accepts
→ Client dashboard
→ Assigned form visible
```

---

## E2E Flow 5 — Client restriction

```text
Client
→ Attempt form creation
→ Attempt lead modification
→ Attempt billing access
→ Attempt another form
```

All unauthorized operations must fail.

---

## E2E Flow 6 — Upgrade

```text
Free workspace
→ Billing
→ Select Pro
→ Lemon Squeezy checkout
→ Verified subscription state
→ Pro limits active
```

Provider interaction should be mocked or executed in an approved sandbox environment.

---

# 26. Responsive Testing

Test at minimum:

### Mobile

- 320px
- 375px
- 390px
- 430px

### Tablet

- 768px
- 1024px

### Desktop

- 1280px
- 1440px
- 1920px

Verify:

- Navigation
- Tables
- Forms
- Dialogs
- Charts
- Billing
- Lead detail
- Client portal

No horizontal scrolling should occur unless intentionally required for data tables.

Tables should provide a deliberate mobile strategy rather than simply overflowing the viewport.

---

# 27. Accessibility Testing

Formivo must target WCAG 2.1 AA-level accessibility practices.

Test:

- Keyboard navigation
- Focus visibility
- Focus order
- Semantic headings
- Form labels
- Accessible error messages
- Button names
- Dialog accessibility
- Screen-reader labels
- Color contrast
- Reduced-motion preference
- Keyboard-accessible menus
- Keyboard-accessible tables/actions

Never use color alone to communicate:

- Status
- Errors
- Success
- Warnings

---

# 28. Performance Tests

Performance testing should cover:

### Marketing pages

Verify:

- Fast initial rendering
- Optimized assets
- Minimal unnecessary JavaScript
- Good Core Web Vitals

### Dashboard

Verify:

- Pagination for large datasets
- No unnecessary full-table fetching
- Efficient queries
- Appropriate indexes

### Lead list

Test with:

```text
100 leads
1,000 leads
10,000 leads
```

The application must not attempt to load an unbounded dataset into the browser.

### Public submission endpoint

Test response time under normal load.

Monitor:

- Request latency
- Database latency
- Rate limiting
- Error rate

---

# 29. Failure and Recovery Tests

Test application behavior when dependencies fail.

### Supabase unavailable

Expected:

- Graceful error
- No sensitive information exposed
- Appropriate logging

### Lemon Squeezy unavailable

Expected:

- Checkout failure handled
- Local entitlement not falsely upgraded

### Resend unavailable

Expected:

- Invitation failure handled safely
- No fake success message if delivery was not accepted

### Network interruption

Test:

- Form submission
- Dashboard mutation
- Billing action
- Invitation action

The UI should provide clear retry/recovery behavior.

---

# 30. Browser Refresh and Navigation Tests

Test:

- Refresh during loading
- Refresh after successful mutation
- Back button after form creation
- Forward navigation
- Opening deep links directly
- Expired sessions
- Opening protected page while logged out

No workflow should depend on fragile client-only state.

Server state remains authoritative.

---

# 31. Regression Suite

Before every production release, run the critical regression suite.

Minimum regression areas:

```text
Authentication
Workspace isolation
Form creation
Form secret validation
Public submission
Lead creation
Lead management
Analytics
Client access
Billing
Webhook processing
Usage limits
Invitation emails
RLS
Authorization
Responsive UI
Accessibility
```

A release must not proceed if a critical regression fails.

---

# 32. Test Data, Fixtures, and Factories

Create reusable test factories.

Recommended factories:

```text
createTestUser()
createTestWorkspace()
createTestClient()
createTestForm()
createTestLead()
createTestInvitation()
createTestSubscription()
createTestUsageCounter()
createTestWebhookEvent()
createTestIdempotencyKey()
```

Factories should allow overrides.

Example:

```ts
createTestForm({
  workspaceId,
  status: "active",
});
```

Do not duplicate large fixture objects across tests.

---

# 33. Test Accounts

Use dedicated test identities.

Example:

```text
developer@test.formivo.local
client@test.formivo.local
developer2@test.formivo.local
```

Never use real customer accounts in automated tests.

Recommended test scenarios:

```text
Owner
Client Viewer
Second Workspace Owner
Unauthenticated User
Expired Invitation User
```

---

# 34. Test Database Strategy

The test environment must be isolated from production.

Never run destructive automated tests against production.

Preferred setup:

```text
Production Supabase
        X
        │
        │ never used by tests
        X

Test Supabase / isolated database
        │
        ├── Fixtures
        ├── RLS tests
        ├── Integration tests
        └── API tests
```

Database migrations used in production should also be tested against the test environment.

---

# 35. Environment Configuration

Testing must use dedicated environment variables.

Example:

```env
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

NEXT_PUBLIC_APP_URL=
```

Test values must never contain production credentials.

Secrets must be injected through the CI/CD secret manager.

---

# 36. CI Checks

Every pull request should run the relevant automated quality gates.

Recommended sequence:

```text
Install dependencies
        ↓
TypeScript type check
        ↓
Lint
        ↓
Unit tests
        ↓
Integration tests
        ↓
API tests
        ↓
RLS/security tests
        ↓
Build
        ↓
E2E tests
```

A pull request should not be merged if critical checks fail.

---

# 37. Static Quality Checks

At minimum run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If the repository uses different commands, preserve the project's existing conventions rather than unnecessarily replacing them.

The AI coding agent must inspect the existing repository before introducing a new test runner or replacing an existing setup.

---

# 38. Staging Smoke Tests

Before production deployment, execute a staging smoke test.

### Authentication

- Sign up
- Sign in
- Sign out

### Workspace

- Create workspace
- Open dashboard

### Forms

- Create form
- Open integration
- Rotate secret

### Submission

- Send test submission
- Verify lead

### Leads

- Open lead
- Change status

### Client

- Send invitation
- Accept invitation
- Verify client access

### Billing

- Verify billing page
- Verify plan state
- Verify sandbox checkout/webhook where applicable

### Email

- Verify invitation email

### Security

- Verify unauthorized request is denied

---

# 39. Production Smoke Tests

After production deployment, run a minimal non-destructive smoke suite.

Verify:

```text
Homepage loads
Sign-in loads
Dashboard loads
Authenticated session works
Forms page loads
Public submission endpoint responds correctly
Billing page loads
Invitation workflow is operational
```

Do not perform unnecessary real payment transactions in production.

Use approved provider test/sandbox mechanisms where available.

---

# 40. Acceptance Criteria — Authentication

Feature is accepted when:

- User can register.
- User can authenticate.
- User can log out.
- Protected pages require authentication.
- Invalid credentials are rejected.
- Sessions are handled securely.
- Password recovery works through the configured auth flow.
- No sensitive authentication information is exposed.

---

# 41. Acceptance Criteria — Workspace

Feature is accepted when:

- A user can create a workspace.
- Workspace belongs to the correct owner.
- Workspace data is isolated.
- Unauthorized users cannot access it.
- Workspace settings are protected.
- Workspace ownership is correctly represented.

---

# 42. Acceptance Criteria — Forms

Feature is accepted when:

- Authorized developer can create a form.
- Plan limits are enforced.
- Form receives a unique public identifier.
- Form secret is generated securely.
- Secret is not stored in plaintext.
- Secret can be rotated.
- Old secret becomes invalid after rotation.
- Archived forms reject submissions.
- Client viewers cannot manage forms.

---

# 43. Acceptance Criteria — Public Submission

Feature is accepted when:

- Valid submissions create leads.
- Invalid secrets are rejected.
- Missing secrets are rejected.
- Invalid forms are rejected.
- Archived forms reject submissions.
- Invalid payloads are rejected.
- Oversized payloads are rejected.
- Rate limiting works.
- Lead quotas work.
- Idempotency works.
- Usage counters update correctly.
- No sensitive information is leaked.

---

# 44. Acceptance Criteria — Leads

Feature is accepted when:

- Leads are created from valid submissions.
- Leads belong to the correct form/workspace.
- Leads can be searched.
- Leads can be filtered.
- Leads can be paginated.
- Authorized developers can change status.
- Authorized developers can archive leads.
- Client viewers can view assigned leads.
- Client viewers cannot mutate leads.
- Dynamic lead data is rendered safely.

---

# 45. Acceptance Criteria — Analytics

Feature is accepted when:

- Counts are accurate.
- Analytics use authorized data only.
- Form-level analytics are isolated.
- Client analytics only include assigned forms.
- Empty states work.
- Large datasets remain performant.
- No cross-workspace data appears.

---

# 46. Acceptance Criteria — Client Portal

Feature is accepted when:

- Developer can invite a client.
- Invitation email is sent through Resend.
- Invitation expires correctly.
- Invitation cannot be reused.
- Client can accept a valid invitation.
- Client sees only assigned forms.
- Client sees only assigned leads.
- Client can view permitted analytics.
- Client cannot modify developer-owned resources.
- Revoked access immediately prevents further authorized operations.

---

# 47. Acceptance Criteria — Billing

Feature is accepted when:

- Free plan works without payment.
- Pro checkout uses Lemon Squeezy.
- Agency checkout uses Lemon Squeezy.
- Server controls plan/variant mapping.
- Webhook signatures are verified.
- Duplicate webhooks are safely ignored.
- Subscription state is synchronized.
- Entitlements update correctly.
- Downgrades do not delete customer data.
- Exceeded limits prevent new resource creation.
- No Stripe code exists anywhere in the application.

---

# 48. Acceptance Criteria — Email

Feature is accepted when:

- Invitation emails are sent through Resend.
- Sender identity is configured.
- Invitation URLs are valid.
- Invitation tokens are securely generated.
- Tokens are hashed in storage.
- Expired invitations fail.
- Revoked invitations fail.
- Emails do not contain secrets.
- Emails do not expose sensitive lead data.
- Provider failures are handled safely.

---

# 49. Acceptance Criteria — Security

The V1 release is not accepted unless:

- Authentication is enforced.
- Authorization is enforced server-side.
- RLS policies are tested.
- Cross-workspace access is denied.
- Cross-form client access is denied.
- Secrets are hashed.
- Secret rotation works.
- Invitation tokens are hashed.
- API keys remain server-side.
- Provider webhook signatures are verified.
- Rate limiting exists.
- Payload limits exist.
- Idempotency exists for public submissions.
- XSS protections are verified.
- SQL injection protections are verified.
- Error messages do not leak internals.

---

# 50. Acceptance Criteria — Responsive UX

Feature is accepted when:

- Mobile navigation works.
- Forms remain usable on small screens.
- Tables have an intentional mobile behavior.
- Dialogs fit mobile screens.
- Buttons remain accessible.
- No accidental horizontal page scrolling occurs.
- Desktop layouts remain balanced.
- Tablet layouts remain usable.

---

# 51. Acceptance Criteria — Accessibility

Feature is accepted when:

- Keyboard navigation works.
- Interactive controls are focusable.
- Focus is visible.
- Form controls have accessible labels.
- Errors are understandable.
- Dialogs are keyboard accessible.
- Color contrast is sufficient.
- Status is not communicated by color alone.
- Reduced-motion preferences are respected where motion exists.

---

# 52. Critical Security Regression Matrix

Every release must verify:

| Scenario | Expected Result |
|---|---|
| Unauthenticated → dashboard | Denied |
| User A → Workspace B | Denied |
| User A → Form B | Denied unless authorized |
| Client → unassigned form | Denied |
| Client → lead mutation | Denied |
| Client → billing | Denied |
| Old form secret after rotation | Denied |
| Archived form submission | Denied |
| Invalid webhook signature | Denied |
| Replayed webhook | Ignored/idempotent |
| Duplicate submission key | No duplicate lead |
| Same key + different body | Conflict |
| Payload above limit | Rejected |
| Quota exceeded | Rejected |
| Rate limit exceeded | Rejected |
| Expired invitation | Denied |
| Revoked invitation | Denied |

---

# 53. Critical Business Logic Regression Matrix

| Feature | Required Result |
|---|---|
| Free form limit | 1 |
| Pro form limit | 10 |
| Agency form limit | Unlimited |
| Free viewer limit | 1 |
| Pro viewer limit | 5 |
| Agency viewer limit | Unlimited |
| Free monthly lead limit | 100 |
| Pro monthly lead limit | 2,000 |
| Agency monthly lead limit | 10,000 |
| Developer lead mutation | Allowed |
| Client lead mutation | Denied |
| Developer secret rotation | Allowed |
| Client secret access | Denied |
| Downgrade | Preserve existing data |
| Exceeded downgrade limits | Block new resources |

---

# 54. Performance Acceptance

V1 should meet these practical requirements:

### Public submission

- Fast response under normal load.
- No unnecessary external provider calls in the critical submission path.
- Database operations are indexed and efficient.

### Dashboard

- Paginated data.
- No unbounded lead queries.
- Loading states shown immediately.
- Large datasets do not freeze the browser.

### Marketing pages

- Optimized assets.
- Minimal client-side JavaScript.
- Strong Core Web Vitals.

Performance targets may be refined after observing real staging and production metrics.

---

# 55. Error State Acceptance

Every important workflow must have:

```text
Loading
Empty
Success
Error
Retry
Unauthorized
Not Found
```

Examples:

### Forms

```text
Loading forms...
No forms yet.
Create your first form.
Unable to load forms.
Try again.
```

### Leads

```text
Loading leads...
No leads yet.
Your first submission will appear here.
Unable to load leads.
Try again.
```

### Billing

```text
Loading billing...
Unable to load subscription.
Try again.
```

Do not use generic broken UI or silent failures.

---

# 56. Test Naming Convention

Tests should describe behavior.

Prefer:

```ts
it("rejects submissions using an expired form secret")
```

over:

```ts
it("test secret")
```

Prefer:

```ts
it("prevents a client viewer from updating lead status")
```

over:

```ts
it("client test")
```

Tests should communicate business requirements clearly.

---

# 57. Mocking Rules

Mock external providers when testing application logic.

Mock:

- Lemon Squeezy API
- Resend API
- External network calls

Do not mock:

- The business logic being tested
- Authorization checks
- Entitlement calculations
- RLS behavior
- Database behavior in database integration tests

Provider mocks must reproduce realistic success and failure responses.

---

# 58. E2E Data Isolation

Each E2E test should have isolated data where practical.

Avoid tests that depend on another test having already created:

```text
workspace
form
lead
client
subscription
```

Tests should either:

- Create their own data, or
- Use carefully controlled reusable fixtures.

This prevents order-dependent failures.

---

# 59. No-Flaky-Test Policy

A test that intermittently fails is a quality problem.

Do not solve flaky tests by:

```text
Increasing arbitrary timeouts
Adding random sleeps
Ignoring failures
Retrying indefinitely
```

Instead investigate:

- Race conditions
- Incorrect async handling
- Database state
- Network mocks
- UI synchronization
- Missing test isolation

Retries may be used carefully for infrastructure-level instability, but not to hide application defects.

---

# 60. AI Coding Agent Testing Rules

The AI coding agent must:

1. Inspect the existing test setup before adding tools.
2. Reuse the existing framework where practical.
3. Never delete working tests without justification.
4. Never weaken authorization tests to make builds pass.
5. Never skip security tests merely because the UI works.
6. Add tests alongside major feature implementation.
7. Run relevant tests after modifying business logic.
8. Run the complete regression suite before claiming a feature is complete.
9. Fix root causes instead of masking failures.
10. Never mark untested functionality as complete.

---

# 61. Definition of Done

A V1 feature is considered **Done** only when:

```text
Implementation complete
        +
Unit tests pass
        +
Integration/API tests pass
        +
Authorization verified
        +
RLS verified where applicable
        +
Error states implemented
        +
Responsive behavior verified
        +
Accessibility checked
        +
Security checks pass
        +
Relevant E2E flow passes
        +
Regression suite passes
```

---

# 62. Final MVP Definition of Done

Formivo V1 is production-ready only when all of the following are true.

## Product

- [ ] Marketing website works.
- [ ] Authentication works.
- [ ] Workspace creation works.
- [ ] Developer dashboard works.
- [ ] Form creation works.
- [ ] Custom form integration works.
- [ ] Public submission endpoint works.
- [ ] Leads are captured correctly.
- [ ] Lead management works.
- [ ] Analytics work.
- [ ] Client invitations work.
- [ ] Client portal works.
- [ ] Billing works through Lemon Squeezy.
- [ ] Invitation emails work through Resend.

## Security

- [ ] Supabase RLS tested.
- [ ] Server authorization tested.
- [ ] Cross-workspace isolation tested.
- [ ] Cross-form isolation tested.
- [ ] Client restrictions tested.
- [ ] Form secrets securely hashed.
- [ ] Secret rotation tested.
- [ ] Invitation tokens securely hashed.
- [ ] API keys server-side only.
- [ ] Webhook signatures verified.
- [ ] Rate limiting tested.
- [ ] Payload limits tested.
- [ ] Idempotency tested.
- [ ] XSS protections tested.
- [ ] SQL injection protections tested.

## Billing

- [ ] Free plan works.
- [ ] Pro plan works.
- [ ] Agency plan works.
- [ ] Checkout works.
- [ ] Webhooks work.
- [ ] Replay protection works.
- [ ] Entitlements synchronize.
- [ ] Downgrade behavior works.
- [ ] No Stripe implementation exists.

## Email

- [ ] Resend configured.
- [ ] Invitation emails work.
- [ ] Invitation expiration works.
- [ ] Invitation revocation works.
- [ ] Token reuse is prevented.
- [ ] Provider failures are handled.

## UX

- [ ] Loading states implemented.
- [ ] Empty states implemented.
- [ ] Error states implemented.
- [ ] Success feedback implemented.
- [ ] Mobile layout verified.
- [ ] Tablet layout verified.
- [ ] Desktop layout verified.
- [ ] Keyboard navigation verified.
- [ ] Accessibility checked.

## Performance

- [ ] Queries indexed.
- [ ] Pagination implemented.
- [ ] Large lead datasets tested.
- [ ] Marketing pages optimized.
- [ ] Public API performance verified.

## Deployment

- [ ] Production environment configured.
- [ ] Environment variables verified.
- [ ] Database migrations applied.
- [ ] CI passes.
- [ ] Production build passes.
- [ ] Staging smoke tests pass.
- [ ] Production smoke tests pass.

---

# 63. Release Checklist

Before releasing Formivo V1:

```text
[ ] Review all V1 requirements
[ ] Run lint
[ ] Run TypeScript checks
[ ] Run unit tests
[ ] Run integration tests
[ ] Run API tests
[ ] Run RLS tests
[ ] Run security tests
[ ] Run E2E tests
[ ] Run accessibility checks
[ ] Run responsive checks
[ ] Run performance checks
[ ] Verify Lemon Squeezy sandbox/provider configuration
[ ] Verify Resend configuration
[ ] Verify webhook signature configuration
[ ] Verify production environment variables
[ ] Verify database migrations
[ ] Verify no secrets are committed
[ ] Verify no Stripe packages
[ ] Verify no Stripe environment variables
[ ] Verify no Stripe routes
[ ] Verify no V1 out-of-scope features were accidentally implemented
[ ] Run staging smoke tests
[ ] Deploy production
[ ] Run production smoke tests
[ ] Monitor logs/errors
```

---

# 64. Explicit V1 Scope Protection

Testing must also protect the product from scope creep.

The following are **not required and must not be treated as V1 acceptance criteria**:

- Embedded Form Builder
- Drag-and-drop form builder
- Email marketing
- WhatsApp integration
- Slack integration
- Discord integration
- Zapier
- Make
- n8n
- AI lead scoring
- AI qualification
- AI follow-ups
- Advanced CRM
- Deals/pipelines
- White-labeling
- Custom domains
- Advanced team roles
- Enterprise SSO
- Marketplace
- Project management
- Helpdesk
- Advanced automation engine
- Complex reporting

A test should not be added simply because an AI coding agent implemented an unsupported feature.

The approved product specification remains the source of truth.

---

# 65. Explicit Payment Provider Rule

Formivo V1 uses:

```text
Lemon Squeezy
```

Formivo V1 does **not** use:

```text
Stripe
```

The following must all be absent:

```text
Stripe package
Stripe SDK
Stripe API routes
Stripe webhook handlers
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
Stripe checkout code
Stripe customer code
Stripe subscription code
Stripe billing UI
```

The test suite should include a repository-level check for accidental Stripe references.

Example conceptual check:

```text
Search repository for:
stripe
STRIPE_
Stripe
```

Any unexpected result must be reviewed before release.

---

# 66. Final Quality Gate

The final Formivo V1 quality gate is:

> **A feature is not complete because it works for the developer who built it. It is complete when the correct user can perform the correct action, the wrong user cannot perform it, invalid input is rejected, failures are recoverable, data remains isolated, and the complete workflow survives automated regression testing.**

The final release must demonstrate:

```text
Correctness
+
Security
+
Isolation
+
Reliability
+
Performance
+
Accessibility
+
Responsive UX
+
Billing integrity
+
Email integrity
+
Regression safety
=
Production-ready Formivo V1
```

No production release should be considered complete until these requirements are satisfied.