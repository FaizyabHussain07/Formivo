# Formivo Version 3.0

# User Flows & Interaction Requirements

**Product:** Formivo  
**Version:** Version 3.0  
**Document:** User Flows  
**Status:** Implementation Source of Truth

---

# 1. Purpose

This document defines the expected user journeys throughout Formivo Version 3.0.

The purpose is to ensure that:

- Every major workflow is explicitly defined.
- The AI coding agent does not invent product behavior.
- Navigation remains predictable.
- Permissions are enforced consistently.
- Success, loading, empty, and error states are accounted for.
- Developer and client experiences remain separate.
- The MVP remains focused.

---

# 2. User Types

Formivo Version 3.0 has two primary user types.

## Developer / Workspace Owner

The paying customer.

Can:

- Manage workspace
- Create forms
- Manage integrations
- View submissions
- Manage leads
- View analytics
- Invite clients
- Manage billing
- Manage settings

---

## Client / Viewer

A client invited by a developer.

Can:

- Access assigned form
- View leads
- View basic analytics

Cannot:

- Modify application data
- Manage forms
- Access secrets
- Manage billing
- Invite users
- Access other forms

---

# 3. Global Navigation

## Developer Navigation

```text
Overview
Forms
Billing
Settings
```

Optional account menu:

```text
Account
Sign Out
```

---

## Form Navigation

Inside a form:

```text
Overview
Leads
Analytics
Settings
```

---

## Client Navigation

```text
Overview
Leads
Analytics
```

Do not expose developer navigation to clients.

---

# 4. Public Website Flow

```text
Landing Page
     │
     ├── Start Free
     │       ↓
     │     Sign Up
     │
     ├── Sign In
     │       ↓
     │     Sign In
     │
     ├── Pricing
     │
     └── Documentation
```

---

# 5. New User Sign-Up Flow

## Step 1 — Landing Page

User clicks:

**Start Free**

System redirects to:

```text
/sign-up
```

---

## Step 2 — Sign-Up

User enters:

- Email
- Password
- Required account information

The UI validates the fields.

Possible errors:

- Invalid email
- Password does not meet requirements
- Email already exists
- Network/server error

---

## Step 3 — Account Creation

If successful:

```text
User Account Created
        ↓
Authenticated Session
        ↓
Workspace Setup
```

If email confirmation is enabled:

```text
Account Created
        ↓
Verify Email
        ↓
Continue
```

The exact behavior depends on the Supabase Auth configuration.

---

# 6. Workspace Creation Flow

A new developer without a workspace should see:

> **Create your workspace**

Fields:

```text
Workspace name
```

Example:

```text
Acme Web Studio
```

CTA:

**Create Workspace**

---

## Success

System:

1. Creates workspace.
2. Associates authenticated user as owner.
3. Sets initial plan to Free.
4. Redirects to dashboard.

Destination:

```text
/app
```

---

# 7. Existing User Sign-In Flow

```text
Landing
   ↓
Sign In
   ↓
Enter Credentials
   ↓
Supabase Auth
   ↓
Authenticated Session
   ↓
Determine Workspace
   ↓
Dashboard
```

If the user has no workspace:

```text
Workspace Setup
```

If the user has viewer access only:

```text
Client Dashboard
```

---

# 8. Sign-Out Flow

User opens account menu.

Clicks:

**Sign Out**

System:

1. Terminates session.
2. Clears relevant client state.
3. Redirects to public website or sign-in page.

Protected application pages must no longer be accessible.

---

# 9. First Dashboard Flow

After workspace creation:

```text
Dashboard
```

If the workspace has no forms:

Show empty state:

> **Connect your first form**

Description:

> Send submissions from an existing website form to Formivo and start managing your leads.

CTA:

**Create Form**

---

# 10. Dashboard With Existing Data

When forms exist, the dashboard should show useful summary information.

Example:

```text
Forms
3

Total Leads
142

New Leads
27

Current Plan
Pro
```

Additional content:

- Recent leads
- Active forms
- Usage
- Relevant billing notification

Do not turn the dashboard into a giant analytics page.

---

# 11. Create Form Flow

Developer clicks:

**New Form**

System opens:

```text
Create Form
```

Two choices appear.

---

## Option A — Connect Custom Form

Status:

**Available**

Description:

> Connect an existing website form to Formivo.

CTA:

**Continue**

---

## Option B — Embedded Form Builder

Status:

**Coming Soon**

Description:

> Build and embed forms directly with Formivo.

The card is visually disabled.

No active implementation should exist behind it.

---

# 12. Create Custom Form

Developer selects:

**Connect Custom Form**

The system displays a form creation screen.

Required field:

```text
Form name
```

Example:

```text
Website Contact Form
```

CTA:

**Create Form**

---

# 13. Form Name Validation

The form name must:

- Not be empty
- Be within the configured maximum length
- Accept normal Unicode text
- Be safely stored

Invalid example:

```text
""
```

Display:

> Form name is required.

---

# 14. Successful Form Creation

After creation:

```text
Form Created
     ↓
Integration Setup
```

The system generates:

- Internal form ID
- Public form ID
- Integration credential/secret
- Endpoint

---

# 15. Integration Setup Flow

The developer sees:

```text
Your form is ready.
Connect your existing website form to this endpoint.
```

Display:

### Endpoint

```text
POST /api/v1/forms/{formPublicId}/submissions
```

### Authentication

```http
Authorization: Bearer FORM_SECRET
```

### Content Type

```http
Content-Type: application/json
```

### Request Example

```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello"
  }
}
```

---

# 16. Secret Display Flow

The integration secret is sensitive.

Recommended behavior:

```text
Secret
••••••••••••••••••

[Reveal] [Copy]
```

The UI should clearly communicate:

> Keep this secret. Do not commit it to public repositories or expose it unnecessarily in browser-side code.

The secret must not be shown to clients.

---

# 17. Secret Rotation Flow

Developer opens:

```text
Form
→ Settings
→ Integration
```

Clicks:

**Rotate Secret**

Show confirmation dialog:

> Rotate integration secret?

Warning:

> Any application using the current secret will stop authenticating once the new secret becomes active.

Actions:

```text
Cancel
Rotate Secret
```

After confirmation:

1. Generate new secret.
2. Store the new credential securely.
3. Invalidate old credential.
4. Display the new secret once according to the security policy.
5. Confirm successful rotation.

---

# 18. Integration Test Flow

Developer clicks:

**Send Test Submission**

The UI can provide a test payload editor or predefined sample payload.

Example:

```json
{
  "data": {
    "name": "Formivo Test",
    "email": "test@example.com",
    "message": "Test submission"
  }
}
```

System sends the request through the appropriate server-side testing mechanism.

---

## Success

Display:

> **Connection verified**

> Formivo received your test submission successfully.

The resulting lead should appear in the Leads section.

---

## Failure

Display a useful error.

Example:

> The test submission could not be processed.

Possible reasons:

- Invalid secret
- Invalid payload
- Form archived
- Rate limit
- Quota exceeded
- Temporary server error

Never expose stack traces.

---

# 19. Existing Website Integration Flow

Developer takes the generated endpoint and connects their existing form.

Recommended architecture:

```text
Visitor
   ↓
Existing Website Form
   ↓
Website Backend / Server Action
   ↓
Formivo API
```

The documentation should explain that developers should avoid exposing long-lived integration secrets directly in public browser code when their architecture allows server-side forwarding.

---

# 20. Direct Browser Submission

Formivo may technically receive browser-originated requests where the developer's environment requires it.

However, the documentation must clearly explain the security implications.

Do not encourage developers to expose sensitive credentials publicly.

---

# 21. Successful Real Submission

Visitor submits a form.

Flow:

```text
Website
   ↓
Form Request
   ↓
Formivo API
   ↓
Validate
   ↓
Authenticate
   ↓
Check Form
   ↓
Check Rate Limit
   ↓
Check Quota
   ↓
Store Submission
   ↓
Create Lead
   ↓
Return Success
```

API response:

```json
{
  "success": true,
  "leadId": "lead_123",
  "message": "Submission received."
}
```

---

# 22. Submission Failure

If the submission cannot be accepted, return a structured error.

Example:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request body must contain a data object."
  }
}
```

The error must be safe to expose to the API consumer.

---

# 23. Lead Creation Flow

A successful submission creates:

```text
Submission
    ↓
Lead
```

Initial lead status:

```text
New
```

The lead should be immediately visible to authorized developers.

---

# 24. Leads Page Flow

Developer opens:

```text
Form
→ Leads
```

The system loads a paginated lead list.

Suggested controls:

```text
Search
Status Filter
Sort
```

The UI should not load thousands of leads into the browser.

---

# 25. Leads Empty State

If the form has no leads:

> **No leads yet**

> Once your connected form receives a submission, it will appear here.

Optional CTA:

**View Integration**

---

# 26. Lead Search Flow

Developer enters a search query.

Example:

```text
john@example.com
```

System searches supported lead fields.

Results update.

If no result:

> **No matching leads**

> Try another search term or clear your filters.

---

# 26.5 Advanced Filters Flow (Pro/Agency)

Pro and Agency plans include advanced filtering capabilities.

Developer opens:

```text
Leads
→ Advanced Filters
```

Available filter options:

- Date range (created_at)
- Status (multi-select)
- Custom field filters (dynamic based on form data)
- Saved filter presets

Workflow:

1. Developer selects filter criteria
2. System validates plan entitlement (Pro/Agency)
3. Apply filters to lead query
4. Update results
5. Option to save filter as preset

Free plan users see:

> **Advanced filters require Pro or Agency plan**

> Upgrade to filter leads by date range, custom fields, and more.

---

# 27. Lead Filtering Flow

Developer selects:

```text
All
New
Contacted
Qualified
Converted
Archived
```

The table updates to show matching leads.

Filters must respect authorization.

---

# 28. Lead Detail Flow

Developer clicks a lead.

Open:

```text
Lead Detail
```

Show:

- Lead status
- Submission date
- Available data
- Relevant metadata

Example:

```text
John Doe

Status
New

Received
October 5, 2026

Email
john@example.com

Phone
+1 555 123 4567

Message
I would like a quote.
```

---

# 29. Lead Status Update Flow

Developer opens a lead.

Current status:

```text
New
```

Developer selects:

```text
Contacted
```

System:

1. Validates authorization.
2. Validates status.
3. Updates lead.
4. Updates analytics.
5. Returns success.

Display:

> Lead status updated.

---

# 30. Client Status Restrictions

Client viewers cannot change lead status.

If a client attempts a direct API request to update status:

```text
403 Forbidden
```

The frontend must also hide the control.

The server-side restriction is authoritative.

---

# 31. Lead Archive Flow

Developer selects:

**Archive**

Confirm if appropriate.

Example:

> Archive this lead?

After confirmation:

```text
Lead
↓
Archived
```

Archived leads remain available for historical reference.

Do not automatically delete the lead.

---

# 31.5 CSV Export Flow (Pro/Agency)

Pro and Agency plans include CSV export functionality.

Developer opens:

```text
Leads
→ Export
```

Available options:

- Date range selection
- Status filter
- Field selection (based on form data)
- Format: CSV

Workflow:

1. Developer selects export criteria
2. System validates plan entitlement (Pro/Agency)
3. System checks submission history retention policy
4. Generate CSV file
5. Trigger download

Submission history retention:

- Free: 30 days maximum
- Pro/Agency: Up to 12 months

If export includes data beyond retention period:

> **Some data is outside your retention period**

> Only data within your plan's retention window will be included.

Free plan users see:

> **CSV export requires Pro or Agency plan**

> Upgrade to export your leads for analysis and reporting.

---

# 32. Form Overview Flow

Developer opens:

```text
Form
→ Overview
```

Show:

- Form name
- Integration status
- Total leads
- New leads
- Recent submissions
- Last submission
- Basic usage

---

# 33. Analytics Flow

Developer opens:

```text
Form
→ Analytics
```

Show:

- Total leads
- Leads this month
- Status distribution
- Submission trend

The analytics page should prioritize clarity over visual complexity.

---

# 34. Analytics Empty State

If no data exists:

> **Analytics will appear here once your form receives submissions.**

Do not display fake charts.

---

# 35. Client Invitation Flow

Developer opens:

```text
Form
→ Settings
→ Client Access
```

Clicks:

**Invite Client**

---

# 36. Invite Client Form

Fields:

```text
Client email
```

The developer selects or confirms the form the client will access.

CTA:

**Send Invitation**

---

# 37. Invitation Validation

Before sending:

- Validate email format.
- Verify developer has permission.
- Verify viewer quota.
- Verify form belongs to current workspace.
- Check whether an active invitation already exists where appropriate.

---

# 38. Invitation Success

After successful creation:

```text
Invitation sent.
```

Resend sends the email.

The dashboard may show:

```text
Pending
client@example.com
```

---

# 39. Invitation Failure

Possible failures:

- Invalid email
- Viewer limit reached
- Form not found
- Permission denied
- Email provider failure
- Server error

The error must be understandable.

Example:

> This workspace has reached its viewer limit (3 for Free, 10 for Pro, 25 for Agency). Upgrade your plan to invite another client.

---

# 40. Client Invitation Email Flow

```text
Developer
   ↓
Invite Client
   ↓
Create Invitation
   ↓
Generate Secure Token
   ↓
Store Token Hash
   ↓
Resend
   ↓
Client Email
```

The email contains a secure invitation URL.

---

# 41. Invitation Link Flow

Client clicks:

```text
https://app.formivo.com/invitations/secure-token
```

The application:

1. Validates token.
2. Checks expiration.
3. Checks revocation.
4. Determines whether the user is authenticated.

---

# 42. Unauthenticated Client - New User Flow

If the client is not authenticated and is a new user:

```text
Invitation
    ↓
Sign Up (email locked to invited email)
    ↓
Verify Email (if required)
    ↓
Return to Invitation
    ↓
Accept Invitation
    ↓
Create Account (client role)
    ↓
Create Form Access
    ↓
Mark Invitation Accepted
    ↓
Redirect to Client Dashboard
```

**Important:**
- The invited email must be locked - user cannot change it
- Account creation must NOT create a developer workspace
- User receives only client role in account_roles
- User is redirected to client dashboard, not developer onboarding

---

# 42.5 Unauthenticated Client - Existing User Flow

If the client is not authenticated but already has a Formivo account:

```text
Invitation
    ↓
Sign In (with invited email)
    ↓
Verify Email Matches Invitation
    ↓
Return to Invitation
    ↓
Accept Invitation
    ↓
Verify Authenticated User
    ↓
Add Client Role (if not already assigned)
    ↓
Create Form Access
    ↓
Mark Invitation Accepted
    ↓
Redirect to Client Dashboard
```

**Important:**
- User must sign in with the invited email address
- If signed in with different email, show error: "Please sign in with the invited email"
- Existing account is NOT forced to create a new account
- Client role is added to existing account if not present
- User is NOT redirected to developer onboarding

---

# 43. Authenticated Client Flow

If already authenticated when opening invitation:

```text
Invitation
    ↓
Verify Authenticated User
    ↓
Verify Email Matches Invitation
    ↓
Accept Invitation
    ↓
Add Client Role (if needed)
    ↓
Create Form Access
    ↓
Mark Invitation Accepted
    ↓
Redirect to Client Dashboard
```

**Important:**
- If authenticated email doesn't match invited email, show error
- Do not automatically grant access without email verification
- User should not be silently signed out

---

# 44. Invitation Expiration

If expired:

Show:

> **This invitation has expired.**

Supporting text:

> Ask the workspace owner to send you a new invitation.

Do not accept an expired invitation.

---

# 45. Revoked Invitation

If revoked:

> **This invitation is no longer available.**

The client cannot access the form through that invitation.

---

# 46. Client Dashboard Flow

After accepting:

```text
Client Dashboard
```

The client should see only assigned resources.

Example:

```text
Overview

Assigned Form
Website Contact Form

Total Leads
84

New Leads
12
```

---

# 47. Client Leads Flow

Client opens:

```text
Leads
```

They can:

- View leads
- Search leads
- Filter leads

They cannot:

- Edit lead status
- Delete leads
- Archive leads

---

# 48. Client Lead Detail Flow

Client clicks a lead.

Show the same relevant information as the developer where appropriate.

Do not show:

- Internal security data
- Integration secrets
- Workspace administration
- Billing
- Developer-only metadata

---

# 49. Client Analytics Flow

Client opens:

```text
Analytics
```

Show only analytics for the assigned form.

Example:

```text
Total Leads
84

This Month
21

By Status
New
Contacted
Qualified
Converted
Archived
```

---

# 50. Client Access Revocation Flow

Developer opens:

```text
Form
→ Settings
→ Client Access
```

Selects a client.

Clicks:

**Revoke Access**

Confirmation:

> Revoke access for this client?

After confirmation:

1. Remove/revoke form access.
2. Invalidate active authorization.
3. Preserve lead data.
4. Client can no longer access the form.

---

# 51. Billing Flow

Developer opens:

```text
Billing
```

Show:

- Current plan
- Usage
- Limits
- Subscription state
- Upgrade option
- Manage billing option

---

# 52. Upgrade Flow

Developer clicks:

**Upgrade**

Application starts Lemon Squeezy checkout.

Flow:

```text
Formivo
   ↓
Lemon Squeezy Checkout
   ↓
Payment
   ↓
Subscription Created
   ↓
Webhook
   ↓
Verify Signature
   ↓
Update Workspace Subscription
   ↓
Refresh Entitlements
```

The client does not participate in billing.

---

# 53. Subscription Webhook Flow

```text
Lemon Squeezy
      ↓
Webhook
      ↓
Verify Signature
      ↓
Identify Workspace
      ↓
Check Event ID / Idempotency
      ↓
Update Subscription
      ↓
Update Plan Entitlements
      ↓
Return 200
```

Never trust a client-side success page as proof of payment.

---

# 54. Subscription Cancellation Flow

Developer uses the Lemon Squeezy billing management flow.

After provider confirmation:

```text
Webhook
   ↓
Subscription State Updated
```

The Formivo dashboard reflects the new billing state.

Data must remain safe.

---

# 55. Plan Limit Flow

Example:

Free workspace has:

```text
3 / 3 forms
```

Developer clicks:

**New Form**

System detects entitlement:

```text
forms >= plan.forms
```

Show:

> **You've reached your form limit.**

> Upgrade your plan to create additional forms.

CTA:

**View Plans**

---

# 56. Lead Quota Flow

Example:

```text
99 / 100 leads
```

One new lead arrives:

```text
100 / 100
```

The next submission is rejected:

```text
QUOTA_EXCEEDED
```

The dashboard should clearly communicate the limit.

---

# 57. Quota Reset

Monthly lead quotas should be calculated using the defined billing period.

The implementation must establish one consistent source of truth for the period.

Do not use different calculations in:

- API
- Dashboard
- Billing page
- Analytics

---

# 58. Archived Form Submission Flow

If a visitor submits to an archived form:

```text
Request
   ↓
Resolve Form
   ↓
Form Status = Archived
   ↓
Reject
```

Response:

```json
{
  "success": false,
  "error": {
    "code": "FORM_INACTIVE",
    "message": "This form is no longer accepting submissions."
  }
}
```

No lead should be created.

---

# 59. Invalid Secret Flow

If a request contains an invalid secret:

```text
Request
   ↓
Form Found
   ↓
Secret Verification
   ↓
Failure
```

Return:

```text
401 Unauthorized
```

Do not reveal whether another part of the credential is correct.

Do not log the secret.

---

# 60. Invalid Form Flow

If the public form ID does not exist:

Return:

```text
404 Not Found
```

Do not expose internal database information.

---

# 61. Invalid Payload Flow

Example request:

```json
{
  "name": "John"
}
```

when the API requires:

```json
{
  "data": {}
}
```

Return:

```text
400 Bad Request
```

with:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request body must contain a data object."
  }
}
```

---

# 62. Payload Too Large Flow

If the request exceeds the configured limit:

```text
413 Payload Too Large
```

Response:

```json
{
  "success": false,
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "Request payload exceeds the allowed size."
  }
}
```

---

# 63. Rate Limit Flow

If a client exceeds the configured API rate:

```text
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

Where appropriate, include rate-limit headers.

---

# 64. Unauthorized Application Access

If an authenticated user attempts to access a workspace they do not belong to:

```text
403 Forbidden
```

or an appropriate not-found response where disclosure should be avoided.

Do not reveal whether another tenant's resource exists unnecessarily.

---

# 65. Direct URL Manipulation

Example:

Developer belongs to:

```text
workspace_A
```

They manually change:

```text
/forms/form_A
```

to:

```text
/forms/form_B
```

where `form_B` belongs to another workspace.

The server must reject the request.

The frontend must never be the only security layer.

---

# 66. Client Direct API Manipulation

A viewer attempts:

```http
PATCH /api/leads/lead_123
```

to change the status.

The server must verify:

```text
User Role = Viewer
```

and reject the operation.

Expected:

```text
403 Forbidden
```

---

# 67. Cross-Form Access

A client assigned to:

```text
Form A
```

attempts to access:

```text
Form B
```

The server must reject access.

The client cannot access Form B merely because the ID is known.

---

# 68. Cross-Workspace Access

A client assigned to Workspace A must never access:

```text
Workspace B
```

even if:

- They know the URL
- They know a public ID
- They send a direct API request
- They manipulate query parameters

---

# 69. Secret Access by Client

A viewer attempts to access:

```text
GET /api/forms/form_123/integration
```

The server must ensure the viewer cannot retrieve the secret.

Preferred result:

```text
403 Forbidden
```

or return only safe non-secret information.

---

# 70. Loading State Requirements

Every major asynchronous operation should have a loading state.

Examples:

```text
Creating form...
Loading leads...
Sending invitation...
Updating status...
Loading analytics...
Processing billing...
```

Buttons should prevent accidental double submissions where appropriate.

---

# 71. Error Recovery

Errors should provide a recovery path.

Example:

> We couldn't load your leads.

Actions:

**Try Again**

or:

**Go Back**

Do not trap users on broken pages.

---

# 72. Network Failure

If a non-critical request fails because of network connectivity:

- Preserve user-entered form data where safe.
- Show a useful error.
- Allow retry.

Do not duplicate a submission if idempotency protection is active.

---

# 73. Duplicate Submission Handling

If a developer's backend retries the same request:

```text
Same Idempotency-Key
```

Formivo should avoid creating duplicate leads where the idempotency system supports it.

The behavior must be deterministic.

---

# 74. Browser Refresh Behavior

Refreshing a page should not unexpectedly:

- Duplicate a lead
- Resend an invitation
- Repeat a billing action
- Rotate a secret
- Change a status

Mutating operations must require explicit user action.

---

# 75. Back Navigation

Browser back navigation should behave predictably.

Example:

```text
Forms
→ Website Contact Form
→ Leads
→ Lead Detail
```

Back should return to the appropriate previous context.

Search/filter state may be preserved where practical.

---

# 76. Mobile Flow Requirements

On mobile:

### Sidebar

Convert to a mobile navigation mechanism.

### Lead Table

Use:

- Responsive cards
- Horizontal scrolling
- Or a condensed list

### Lead Detail

Use a single-column layout.

### Integration

Code blocks should remain readable and horizontally scrollable where necessary.

### Billing

Pricing cards should stack vertically.

---

# 77. Accessibility Flow Requirements

All major flows must support keyboard interaction.

Examples:

- Tab navigation
- Enter to submit
- Escape to close dialogs
- Accessible dropdowns
- Accessible tabs
- Visible focus indicators

---

# 78. Complete Developer Happy Path

The complete happy path is:

```text
1. Visit Formivo
        ↓
2. Click Start Free
        ↓
3. Create Account
        ↓
4. Create Workspace
        ↓
5. Dashboard
        ↓
6. Create Form
        ↓
7. Choose Connect Custom Form
        ↓
8. Name Form
        ↓
9. Form Created
        ↓
10. Copy Endpoint + Secret
        ↓
11. Connect Existing Website Form
        ↓
12. Send Test Submission
        ↓
13. Test Successful
        ↓
14. Real Visitor Submits Form
        ↓
15. Formivo Receives Submission
        ↓
16. Lead Created
        ↓
17. Developer Opens Lead
        ↓
18. Developer Changes Status
        ↓
19. Analytics Update
        ↓
20. Developer Invites Client
        ↓
21. Resend Sends Invitation
        ↓
22. Client Accepts
        ↓
23. Client Signs In
        ↓
24. Client Sees Assigned Form
        ↓
25. Client Views Leads
        ↓
26. Client Views Analytics
```

This is the canonical V1 workflow.

---

# 79. Complete Security Validation Flow

The following must also work:

```text
Developer A
    ↓
Cannot access Workspace B

Client A
    ↓
Cannot access Form B

Client A
    ↓
Cannot change Lead status

Client A
    ↓
Cannot access API Secret

Unauthenticated User
    ↓
Cannot access Dashboard

Invalid API Secret
    ↓
Submission rejected

Archived Form
    ↓
Submission rejected

Expired Invitation
    ↓
Access rejected

Quota Exhausted
    ↓
Submission rejected
```

---

# 80. Complete Billing Validation Flow

```text
Free Workspace
      ↓
Create first form
      ↓
Success

Attempt second form
      ↓
Blocked
      ↓
Upgrade CTA

Upgrade to Pro
      ↓
Lemon Squeezy Checkout
      ↓
Payment
      ↓
Webhook
      ↓
Subscription Updated
      ↓
10 Form Limit Active

Downgrade
      ↓
Data Preserved
      ↓
New usage constrained according to Free limits
```

---

# 81. Complete Email Validation Flow

```text
Developer
    ↓
Invite Client
    ↓
Invitation Created
    ↓
Resend
    ↓
Client Receives Email
    ↓
Clicks Link
    ↓
Authenticates
    ↓
Accepts Invitation
    ↓
Viewer Access Created
    ↓
Client Dashboard
```

---

# 82. Final UX Rule

Every important user action must answer three questions:

### What just happened?

Example:

> Form created successfully.

### What can I do next?

Example:

> Connect your existing form using the endpoint below.

### What happens if something goes wrong?

Example:

> The connection could not be verified. Check your secret and request format.

The product should never leave the user guessing.

---

# 83. Final User Flow Principle

The ideal Formivo experience is:

```text
Understand
   ↓
Create
   ↓
Connect
   ↓
Receive
   ↓
Manage
   ↓
Share
```

The product should guide the user through this journey without unnecessary complexity.

---

# END OF USER FLOWS