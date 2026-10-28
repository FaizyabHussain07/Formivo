# Formivo Version 3.0

# Product Requirements Document

**Product:** Formivo  
**Version:** Version 3.0  
**Document:** Product Requirements Document  
**Status:** Implementation Source of Truth  
**Primary Audience:** Product engineers, AI coding agents, designers, QA engineers

---

# 1. Executive Summary

Formivo is a developer-first lead collection and lightweight CRM SaaS.

It solves a common problem for freelancers, developers, and agencies:

> They build websites with custom forms, but they need a simple and professional way to receive, store, manage, and share the resulting leads with their clients.

Formivo provides the infrastructure between an existing website form and a professional lead management dashboard.

The developer does not need to rebuild their existing form.

The developer connects their existing form to a Formivo endpoint.

Formivo receives the submission, validates it, stores the submission, creates a lead, and makes that lead available in the Formivo dashboard.

The developer can then manage the lead.

The developer can also invite the client as a read-only viewer.

The client receives access to the relevant form and its leads without receiving access to the developer's technical configuration or billing information.

---

# 2. Product Statement

## Core Promise

> **Connect your forms. Manage every submission. Share access with confidence.**

## One-Sentence Description

> Formivo is a developer-first form-to-lead platform that lets developers connect existing website forms, manage incoming leads, and give clients a secure read-only dashboard.

---

# 3. Problem Statement

Developers frequently build websites for clients that contain forms such as:

- Contact forms
- Quote request forms
- Booking request forms
- Consultation forms
- Service inquiry forms
- Application forms
- Newsletter signup forms
- Custom business forms

After building these forms, developers often need to solve several additional problems:

1. Where should submissions be sent?
2. Where should submissions be stored?
3. How should leads be viewed?
4. How should leads be organized?
5. How can the client access leads?
6. How can the developer avoid giving the client access to the technical infrastructure?
7. How can multiple client websites be managed from one place?

Traditional solutions are often either:

- Too technical
- Too expensive
- Too large
- Too CRM-heavy
- Too focused on form building
- Too difficult for small agencies
- Too fragmented

Formivo provides a focused solution.

---

# 4. Product Vision

The long-term vision is:

> Become the lightweight developer infrastructure layer between website forms and client lead management.

Formivo should eventually support more integrations and automation.

However, V1 intentionally focuses on the smallest useful product.

---

# 5. Version 3.0 Product Scope

The Version 3.0 product includes:

- Authentication
- Workspace
- Developer dashboard
- Form integrations
- Custom form endpoint
- Submission API
- Lead creation
- Lead management
- Lead statuses
- Basic analytics
- Client invitations
- Client read-only dashboard
- Subscription plans
- Lemon Squeezy billing
- Resend transactional email
- Security controls
- Responsive UI
- Submission history retention (30 days Free, up to 12 months Pro/Agency)
- CSV export (Pro/Agency)
- Advanced filters (Pro/Agency)

---

# 6. Primary User Personas

## 6.1 Developer

### Description

A freelancer or developer who builds websites for clients.

### Goals

- Connect forms quickly
- Avoid building custom lead dashboards for every client
- Centralize submissions
- Manage leads
- Give clients access
- Keep technical credentials private

### Pain Points

- Building custom backend endpoints repeatedly
- Managing form submissions manually
- Email-only lead workflows
- Giving clients access to developer infrastructure
- Building a custom CRM for each project

### Success

The developer can connect a website form to Formivo in minutes.

---

# 6.2 Agency

### Description

A small or medium web development agency.

### Goals

- Manage forms across multiple clients
- Keep client data separated
- Give each client appropriate access
- Reduce custom development work
- Standardize lead management

### Success

The agency can manage multiple client forms from one workspace without creating separate systems for each project.

---

# 6.3 Client

### Description

A business owner or client of the developer.

### Goals

- See incoming leads
- Understand lead information
- Check basic lead activity
- Access information without technical complexity

### Pain Points

Clients generally do not want:

- API documentation
- Developer settings
- API secrets
- Billing configuration
- Database terminology
- Technical infrastructure

### Success

The client can sign in and immediately understand the leads coming through their assigned form.

---

# 7. Core Product Principles

## Principle 1 — Developer First

The primary customer is the developer or agency.

The product must optimize the developer workflow.

---

## Principle 2 — Existing Forms First

Formivo V1 does not own the frontend form.

The developer can continue using:

- HTML
- React
- Next.js
- Vue
- WordPress custom forms
- Webflow custom forms
- Static websites
- Custom JavaScript
- Any system capable of making an HTTP request

The form sends data to Formivo.

---

## Principle 3 — Every Valid Submission Becomes a Lead

The basic mental model is:

```text
Submission → Lead
```

Do not create unnecessary concepts between submission and lead.

---

## Principle 4 — Flexible Data

Formivo must accept flexible JSON data.

Do not force developers into a rigid field schema.

---

## Principle 5 — Simple CRM

Formivo is a lightweight lead manager.

It is not Salesforce.

It is not HubSpot.

It is not a full project management platform.

---

## Principle 6 — Client Safety

Clients should get the information they need without gaining access to sensitive developer infrastructure.

---

## Principle 7 — Security by Default

Security cannot depend on the frontend.

All authorization must ultimately be enforced server-side.

---

## Principle 8 — Premium UX

The application must feel polished and intentional.

Every important interaction should have:

- Clear feedback
- Predictable behavior
- Useful empty states
- Useful error messages
- Loading states
- Responsive behavior

---

# 8. Product Information Architecture

The main developer application structure is:

```text
Application
│
├── Overview
│
├── Forms
│   ├── Form List
│   ├── Create Form
│   └── Form Workspace
│       ├── Overview
│       ├── Leads
│       ├── Analytics
│       └── Settings
│
├── Billing
│
└── Settings
```

Client structure:

```text
Client Application
│
├── Overview
│
└── Assigned Form
    ├── Leads
    └── Analytics
```

The client must not see developer-only navigation.

---

# 9. Marketing Website

The public website should contain:

```text
Home
Pricing
Documentation
Sign In
Get Started
```

Additional pages may include:

- Privacy
- Terms
- Contact

Do not create dozens of marketing pages for V1.

---

# 10. Landing Page Requirements

The landing page should immediately explain what Formivo does.

## Hero

Suggested headline:

> **Connect your forms. Capture your leads. Give clients their dashboard.**

Supporting copy:

> Formivo gives developers a simple, secure way to connect existing website forms, manage incoming leads, and give clients a professional read-only dashboard.

Primary CTA:

> **Start Free**

Secondary CTA:

> **View Documentation**

The hero should show the actual product concept rather than relying on generic abstract artwork.

---

# 11. How It Works Section

Show three simple steps.

### Step 1

**Connect your form**

> Send submissions from your existing website form to a Formivo endpoint.

### Step 2

**Manage your leads**

> Every valid submission becomes a lead you can search, review, and organize.

### Step 3

**Give clients access**

> Invite clients to a focused read-only dashboard without exposing your technical configuration.

---

# 12. Developer Workflow Section

Explain that Formivo works with existing websites.

Possible visual:

```text
Your Website
     ↓
Existing Form
     ↓
Formivo API
     ↓
Lead
     ↓
Formivo Dashboard
```

The section should emphasize:

> **No form rebuild required.**

---

# 13. Client Dashboard Section

Show how developers can give clients access.

Important message:

> Clients see the leads they need. Your integration credentials stay private.

Show a realistic dashboard preview.

Do not use fake customer logos or fake usage statistics.

---

# 14. Pricing Section

The public pricing page must show the three Version 3.0 plans.

## Free

**$0/month**

- 3 forms
- 100 leads/month
- 3 client viewers
- Basic analytics
- Custom form endpoint
- Lead management
- 30-day submission history

CTA:

**Start Free**

---

## Pro

**$12/month**

- 10 forms
- 2,000 leads/month
- 10 client viewers
- Basic analytics
- Custom form endpoints
- Lead management
- Up to 12-month submission history
- Advanced filters
- CSV export

CTA:

**Upgrade to Pro**

---

## Agency

**$29/month**

- 50 forms
- 10,000 leads/month
- 25 client viewers
- Basic analytics
- Custom form endpoints
- Lead management
- Up to 12-month submission history
- Advanced filters
- CSV export

CTA:

**Choose Agency**

The billing system must enforce these limits.

---

# 15. Authentication Requirements

The authentication experience must be simple.

Required:

- Sign up
- Sign in
- Sign out
- Session persistence
- Protected application routes
- Invitation acceptance

Authentication must use Supabase Auth.

---

# 16. Developer Onboarding

After account creation, the developer should enter the application.

If no workspace exists:

```text
Create your workspace
```

Fields:

- Workspace name

Optional:

- Workspace slug

The system creates the workspace and associates the authenticated user as owner.

---

# 17. Empty Workspace Experience

After workspace creation, the developer should see an empty state.

Example:

> **Connect your first form**

Supporting text:

> Send submissions from an existing website form to Formivo and start managing your leads.

CTA:

**Create Form**

The empty state should explain the next action rather than simply saying "No data."

---

# 18. New Form Flow

When the developer clicks:

**Create Form**

show:

```text
Connect Custom Form
Available

Embedded Form Builder
Coming Soon
```

The available option is selectable.

The coming-soon option is disabled.

---

# 19. Custom Form Creation

The developer provides:

- Form name

Example:

```text
Website Contact Form
```

The system generates:

- Internal form ID
- Public form ID
- Secure integration secret
- Endpoint URL

Example endpoint:

```text
/api/v1/forms/form_abc123/submissions
```

---

# 20. Integration Setup

After creating the form, redirect to an integration setup screen.

The screen should display:

### Endpoint

```text
POST https://formivo.faizyab.me/api/v1/forms/form_abc123/submissions
```

### Authentication

```http
Authorization: Bearer FORM_SECRET
```

### Content Type

```http
Content-Type: application/json
```

### Request

```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello"
  }
}
```

### Response

```json
{
  "success": true,
  "leadId": "lead_123",
  "message": "Submission received."
}
```

The interface must provide copy buttons.

---

# 21. Integration Security

The Formivo secret is sensitive.

The UI must:

- Avoid displaying it unnecessarily
- Provide controlled reveal/copy behavior
- Never put it in a URL
- Never expose it to unauthorized users
- Allow rotation
- Warn developers not to commit it to public repositories

The exact secret storage strategy is defined in the technical and security specifications.

---

# 22. Test Submission

The integration page should allow the developer to verify the connection.

The developer may submit a test payload.

The system should provide:

- Success state
- Error state
- Request ID where useful
- Created lead reference where useful

Example success:

> **Connection verified.**

> Formivo received your test submission successfully.

Do not expose internal stack traces.

---

# 23. Submission Processing

When a request arrives:

1. Parse the request.
2. Validate content type.
3. Validate JSON.
4. Resolve form.
5. Check form status.
6. Authenticate integration secret.
7. Check payload size.
8. Apply rate limiting.
9. Check monthly plan quota.
10. Validate payload structure.
11. Store submission.
12. Create lead.
13. Commit transaction.
14. Return success.

---

# 24. Lead Creation Rules

A valid submission creates:

1. A submission record.
2. A lead record.

The lead references the original submission.

Lead initial status:

```text
New
```

Created timestamp:

UTC.

---

# 25. Lead Management

The developer should be able to:

- View leads
- Search leads
- Filter leads by status
- Open lead
- Change status
- Archive lead

The exact implementation may include sorting and pagination.

---

# 26. Lead Table

The lead table should dynamically identify useful fields.

If the payload contains:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Inc"
}
```

The table may show:

| Name | Email | Company | Status | Received |
|---|---|---|---|---|

If the payload does not contain these fields, the application must not fail.

The UI should gracefully display available data.

---

# 27. Lead Detail

The lead detail view should show:

- Lead ID
- Status
- Submission time
- Available fields
- Metadata where appropriate

Example:

```text
John Doe
john@example.com

Status
New

Submitted
October 5, 2026

Fields

Name
John Doe

Email
john@example.com

Message
I would like a quote.
```

Do not render arbitrary user input as HTML.

---

# 28. Lead Status Changes

Supported statuses:

```text
New
Contacted
Qualified
Converted
Archived
```

Status changes should:

- Be authorized server-side
- Persist immediately
- Provide success feedback
- Update analytics

The client viewer cannot change status in V1.

---

# 29. Lead Search

Search should operate on useful lead data.

The implementation may initially search:

- Name
- Email
- Common text fields

The system should not scan entire unindexed databases unnecessarily at scale.

The technical implementation should define an appropriate strategy based on the database design.

---

# 30. Analytics

V1 analytics are intentionally simple.

The form analytics page should include:

### Total Leads

Total number of leads received.

### Leads This Month

Number of leads received during the current billing period/month.

### Leads by Status

Example:

```text
New
Contacted
Qualified
Converted
Archived
```

### Submission Trend

A simple time-based chart showing lead volume.

Do not build advanced reporting.

---

# 31. Analytics Accuracy

Analytics must respect workspace and form permissions.

A developer sees data only for forms they are authorized to access.

A client sees only analytics for forms explicitly assigned to them.

Archived forms may remain visible for historical data depending on product behavior, but they must not continue accepting new submissions.

---

# 32. Client Invitation

A developer can invite a client.

Required information:

- Client email
- Form access

The invitation should create a secure invitation record.

The invitation should:

- Have an expiration
- Be single-use
- Be revocable
- Use a secure random token
- Store a token hash rather than a raw token where appropriate

---

# 33. Client Invitation Email

Resend sends the invitation email.

Email should contain:

- Formivo branding
- Developer/workspace context
- Invitation message
- Secure invitation link
- Expiration information

Do not expose:

- API secret
- Internal IDs unnecessarily
- Billing details
- Database information

---

# 34. Invitation Acceptance

The client clicks the invitation link.

If not authenticated:

```text
Create account / Sign in
```

After successful authentication:

1. Verify invitation.
2. Verify expiration.
3. Verify token.
4. Create appropriate access record.
5. Mark invitation accepted.
6. Redirect client to assigned dashboard.

---

# 35. Viewer Access

The client role is:

```text
viewer
```

Viewer permissions are intentionally narrow.

Viewer can:

- View assigned form
- View assigned leads
- View basic analytics

Viewer cannot:

- Create forms
- Delete forms
- Archive forms
- Edit form configuration
- Rotate secrets
- View secrets
- Change billing
- Invite users
- Access other forms
- Change lead status
- Delete lead data

---

# 36. Client Dashboard UX

The client dashboard should be simplified.

Navigation:

```text
Overview
Leads
Analytics
```

Avoid developer terminology where possible.

The client should immediately understand:

- How many leads exist
- How many are new
- Recent leads
- Basic trend

---

# 37. Workspace Isolation

Every workspace is a security boundary.

All relevant records must be connected to a workspace directly or indirectly.

Examples:

```text
Workspace
   ↓
Form
   ↓
Submission
   ↓
Lead
```

A user from Workspace A must never access:

```text
Workspace B
```

by manipulating:

- Form ID
- Lead ID
- Workspace ID
- URL
- API payload
- Query parameter

---

# 38. Form Archiving

A developer can archive a form.

Archived forms:

- Cannot receive new submissions
- Cannot create new leads
- Remain available for historical viewing
- Can appear in an archived state

The system must clearly communicate that archived forms no longer accept submissions.

---

# 39. Form Deletion

Hard deletion should not be a default V1 operation.

Prefer archive behavior.

If destructive deletion is later introduced, it must have:

- Confirmation
- Authorization
- Clear consequences
- Safe cascading rules
- Appropriate protection against accidental deletion

---

# 40. Usage Limits

Plan limits:

| Plan | Forms | Leads / Month | Viewers |
|---|---:|---:|---:|
| Free | 3 | 100 | 3 |
| Pro | 10 | 2,000 | 10 |
| Agency | 50 | 10,000 | 25 |

Usage enforcement must happen server-side.

Frontend checks are only for user experience.

---

# 41. Form Limit Behavior

If the developer reaches the form limit:

The application must:

- Prevent creation of additional forms
- Explain the limit
- Show current plan
- Offer upgrade

Do not silently fail.

---

# 42. Lead Quota Behavior

If the workspace reaches the monthly lead limit:

The public API must reject additional submissions with a clear machine-readable error.

Example:

```json
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Monthly lead limit reached."
  }
}
```

The developer dashboard should clearly explain:

- Current usage
- Current limit
- Current plan
- Upgrade option

Never silently discard leads.

---

# 43. Billing States

Supported subscription states may include:

```text
active
trialing
past_due
paused
cancelled
expired
incomplete
```

The exact provider mapping should be centralized.

The application must not duplicate billing logic throughout the UI.

---

# 44. Lemon Squeezy Integration

Lemon Squeezy is the billing provider.

The application must support:

- Checkout initiation
- Subscription creation
- Subscription updates
- Subscription cancellation
- Payment success events
- Relevant billing state changes
- Webhook verification

Webhook processing must be idempotent.

---

# 45. Resend Integration

Resend is the transactional email provider.

V1 email:

- Client invitation

Potential additional transactional emails:

- Welcome email
- Important billing notification
- System notification

Do not build marketing campaigns.

---

# 46. Settings

Developer settings should include:

- Workspace name
- Account information
- Billing link
- Security-related settings where appropriate

Form settings include:

- Form name
- Integration
- Secret rotation
- Client access
- Archive

Do not overload settings with unnecessary options.

---

# 47. Error Handling

All user-facing errors should be understandable.

Bad:

> `500 Internal Server Error`

Better:

> Something went wrong while loading your leads. Please try again.

For API consumers, return structured machine-readable errors.

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

Never expose stack traces.

---

# 48. Empty States

Empty states should explain what to do next.

Examples:

### No Forms

> **Connect your first form**

> Send submissions from your website to Formivo and start managing leads.

CTA:

**Create Form**

### No Leads

> **No leads yet**

> Once your form receives a submission, it will appear here.

### No Search Results

> **No matching leads**

> Try a different search term or clear your filters.

---

# 49. Loading States

Avoid blank screens.

Use:

- Skeletons
- Loading indicators
- Disabled buttons during submission
- Progress feedback where appropriate

Do not over-animate.

---

# 50. Success States

Important actions should provide confirmation.

Examples:

> Form created successfully.

> Secret rotated successfully.

> Lead status updated.

> Invitation sent.

> Billing updated.

Use unobtrusive toast or inline feedback.

---

# 51. Responsive Product Requirements

The application must work on:

- 320px+
- Mobile
- Tablet
- Laptop
- Desktop
- Large desktop

Critical workflows must remain usable on mobile:

- Sign in
- Dashboard
- Forms
- Lead list
- Lead detail
- Client dashboard

Complex tables may become scrollable cards or horizontally scrollable tables.

---

# 52. Design System Requirements

The application must use a consistent design system.

Define:

- Typography scale
- Spacing scale
- Border radius scale
- Border treatment
- Shadows
- Colors
- Buttons
- Inputs
- Selects
- Tables
- Cards
- Dialogs
- Toasts
- Badges
- Tabs
- Navigation

Do not style each page independently.

---

# 53. Visual Quality Requirements

The design should have:

- Strong alignment
- Consistent spacing
- Consistent component heights
- Predictable interaction patterns
- Minimal visual noise
- Strong typography
- Professional tables
- Subtle hierarchy
- Appropriate whitespace

The interface should feel intentionally designed rather than assembled from random components.

---

# 54. Animation Requirements

Animation must be subtle.

Allowed:

- Small hover transitions
- Button feedback
- Dialog transitions
- Navigation transitions
- Skeleton shimmer if appropriate
- Small state transitions

Avoid:

- Constant floating elements
- Large page transitions
- Excessive parallax
- Excessive animated gradients
- Distracting background effects

Performance always takes priority.

---

# 55. SEO Requirements

The public marketing website should have:

- Unique page titles
- Meta descriptions
- Open Graph metadata
- Proper heading hierarchy
- Semantic HTML
- Sitemap
- Robots configuration
- Canonical URLs where appropriate

The authenticated dashboard does not need to be indexed.

---

# 56. Public Documentation

Formivo should have basic developer documentation.

Minimum documentation:

```text
Introduction
Quick Start
Create a Form
Authentication
Submit Data
Request Format
Response Format
Errors
Testing
Security
```

The documentation should make the first integration possible without requiring support.

---

# 57. Developer Quick Start

The documentation should show:

### 1. Create Formivo form

### 2. Copy endpoint

### 3. Copy secret

### 4. Send request

Example:

```javascript
await fetch("formivo.faizyab.me/api/f/form_id", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer FORM_SECRET"
  },
  body: JSON.stringify({
    data: {
      name: "John Doe",
      email: "john@example.com",
      message: "Hello"
    }
  })
});
```

### 5. Open dashboard

The resulting submission should appear as a new lead.

---

# 58. API Consumer Experience

API errors must be predictable.

Minimum error codes:

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

Responses should use JSON.

---

# 59. API Reliability

The public submission endpoint is a critical product surface.

It must:

- Validate requests
- Authenticate requests
- Rate limit
- Avoid unnecessary database queries
- Return predictable errors
- Generate request IDs
- Avoid leaking internal implementation details
- Handle duplicate requests safely where supported
- Preserve tenant isolation

---

# 60. Idempotency

Where practical, support an `Idempotency-Key` request header.

Example:

```http
Idempotency-Key: 7d1c3e1f-example
```

If the same request is retried using the same key, Formivo should avoid creating unintended duplicate leads.

The implementation must define:

- Key scope
- Expiration
- Storage
- Conflict behavior

This should be implemented only if it can be done reliably within V1.

---

# 61. Rate Limiting

Rate limiting should apply to public submission endpoints.

It should protect against:

- Abuse
- Accidental loops
- Bots
- Excessive requests
- Denial-of-service-like traffic

Rate-limit responses should be machine-readable.

---

# 62. Payload Limits

The API must define a maximum request size.

Requests larger than the configured limit must be rejected.

Example error:

```json
{
  "success": false,
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "Request payload exceeds the allowed size."
  }
}
```

The exact production limit should be defined in the technical specification and environment configuration.

---

# 63. Security Requirements

The implementation must protect against:

- Cross-tenant access
- Broken authorization
- Secret exposure
- XSS
- Injection
- Malformed JSON
- Oversized payloads
- API abuse
- Invitation token abuse
- Billing webhook forgery
- Sensitive information leakage

Security details are defined in the security specification.

---

# 64. Database Requirements

The database must support:

- Users
- Workspaces
- Forms
- Submissions
- Leads
- Viewer access
- Invitations
- Subscriptions
- Billing state

Use PostgreSQL through Supabase.

Use JSONB for flexible submission data.

---

# 65. Data Relationships

Conceptually:

```text
User
  ↓
Workspace
  ↓
Form
  ├── Submission
  │      ↓
  │     Lead
  │
  └── Viewer Access
```

Billing:

```text
Workspace
   ↓
Subscription
   ↓
Lemon Squeezy
```

Email:

```text
Application
   ↓
Resend
   ↓
Client Invitation
```

---

# 66. Workspace Ownership

The creator of the workspace becomes its owner.

The owner has full developer permissions.

V1 does not require a sophisticated team role hierarchy.

Keep the permission system intentionally small.

---

# 67. Client Access Scope

A client viewer should be associated with a specific form.

This prevents a client from automatically seeing every form in the workspace.

The default V1 access model is:

```text
Client
  ↓
Specific Form
  ↓
Read-only access
```

---

# 68. Client Access Revocation

The developer must be able to revoke a client's access.

After revocation:

- Client cannot access the assigned form
- Existing authentication does not bypass authorization
- Server-side checks deny access

The client should receive an appropriate unauthorized/access-revoked response.

---

# 69. Billing Upgrade Experience

When a developer reaches a limit:

Show:

- Current usage
- Current limit
- Current plan
- Upgrade CTA

Example:

> You've reached your 100 lead monthly limit.

> Upgrade to Pro for up to 2,000 leads per month.

The UI should not aggressively interrupt unrelated workflows.

---

# 70. Downgrade Behavior

Downgrading should not silently delete data.

If the new plan has lower limits than current usage:

- Existing data remains
- Existing forms remain where possible
- New usage that exceeds the plan is restricted
- The dashboard explains what needs to change

Example:

If a user has 7 forms and downgrades from Pro to Free:

- Existing data remains
- New form creation is blocked
- User is encouraged to archive/manage forms

Never delete customer data automatically because of a plan downgrade.

---

# 71. Subscription Failure

If billing becomes past due:

The application should:

- Receive provider webhook
- Update subscription state
- Show a billing warning
- Apply the defined grace/restriction policy

Do not immediately destroy data.

---

# 72. Production Reliability

The system should handle:

- Temporary provider failures
- Database errors
- Duplicate webhook delivery
- Expired invitations
- Invalid secrets
- Archived forms
- Quota exhaustion
- Unexpected payloads

Each should have predictable behavior.

---

# 73. Observability

The production application should have structured logs for important events.

Examples:

```text
form_created
submission_received
lead_created
lead_status_changed
client_invited
client_access_revoked
subscription_updated
billing_webhook_received
```

Logs must not contain:

- API secrets
- Passwords
- Full sensitive lead payloads
- Authentication tokens

---

# 74. Analytics Events

Internal product analytics are optional for V1.

If implemented, track only useful product events.

Potential events:

```text
workspace_created
form_created
form_connected
submission_received
lead_created
lead_status_changed
client_invited
client_accepted_invitation
subscription_started
subscription_changed
```

Do not build an analytics platform.

---

# 75. Performance Requirements

Primary dashboard pages should feel responsive.

Critical endpoints should avoid:

- N+1 queries
- Unbounded queries
- Full table scans where avoidable
- Loading all leads at once

Use pagination for lead lists.

Use indexes appropriate to common access patterns.

---

# 76. Browser Compatibility

Support modern versions of:

- Chrome
- Edge
- Safari
- Firefox

No special legacy browser support is required.

---

# 77. V1 Out-of-Scope Clarification

The following must not accidentally enter the implementation:

### No embedded form builder

### No custom form renderer

### No drag-and-drop editor

### No AI lead scoring

### No CRM pipeline builder

### No email marketing

### No WhatsApp

### No Slack

### No Discord

### No Zapier

### No Make

### No advanced automation

### No white label

### No custom domains

### No advanced teams

### No enterprise SSO

### No marketplace

### No advanced reporting

### No project management

The AI coding agent must stop when the V1 requirements are satisfied.

---

# 78. Product Success Metrics

Initial product metrics should focus on activation and core value.

Potential metrics:

### Activation

Percentage of new developers who create their first form.

### Integration Success

Percentage of developers who successfully receive a first test submission.

### First Lead

Percentage of activated users who receive their first real lead.

### Client Adoption

Percentage of active developers who invite at least one client.

### Client Activation

Percentage of invited clients who successfully access their dashboard.

### Paid Conversion

Percentage of free workspaces upgrading to paid plans.

These metrics should not block the MVP.

---

# 79. MVP Definition of Done

The MVP is complete when:

- Authentication works.
- Workspace creation works.
- Form creation works.
- Custom form integration works.
- API endpoint works.
- Secrets are protected.
- Submissions are validated.
- Submissions are stored.
- Leads are created.
- Leads can be viewed.
- Leads can be searched/filtered where implemented.
- Lead statuses work.
- Analytics work.
- Client invitations work.
- Client viewer works.
- Viewer permissions are enforced.
- Lemon Squeezy billing works.
- Resend invitation email works.
- Plan limits work.
- Security tests pass.
- Responsive behavior works.
- Production build succeeds.

---

# 80. Product Quality Gate

Before launch, ask:

### Can a developer understand Formivo within 30 seconds?

### Can they create their first form without confusion?

### Can they connect an existing form without reading excessive documentation?

### Does a real submission become a lead?

### Can the developer manage that lead?

### Can the client access their leads safely?

### Can the client accidentally access developer infrastructure?

The answer to the last question must be:

> **No.**

---

# 81. Final Product Principle

Formivo should feel small because it is focused, not because it is unfinished.

The product should not attempt to compete with massive CRM platforms.

Its strength is:

```text
Simple integration
        +
Reliable lead capture
        +
Clean lead management
        +
Safe client access
```

That is the V1 product.

---

# END OF PRODUCT PRD