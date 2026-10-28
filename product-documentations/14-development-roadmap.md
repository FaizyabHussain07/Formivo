# Formivo — Development Roadmap

**File:** `14-development-roadmap.md`  
**Product:** Formivo  
**Version:** Version 3.0  
**Status:** Implementation Roadmap

---

# 1. Purpose

This document defines the recommended implementation roadmap for building Formivo Version 3.0 from an existing repository to a production-ready SaaS.

The roadmap is intentionally sequential.

Formivo should not be built as one giant implementation task.

Each phase should produce a stable, testable increment before the next phase begins.

The core development loop is:

```text
Plan
  ↓
Implement
  ↓
Test
  ↓
Review
  ↓
Verify
  ↓
Continue
```

The goal is not simply to finish the code.

The goal is to produce a secure, usable, maintainable, production-ready SaaS.

---

# 2. Final V1 Objective

At the end of this roadmap, a developer should be able to:

```text
Sign up
  ↓
Create workspace
  ↓
Create Formivo form
  ↓
Receive endpoint + secret
  ↓
Connect an existing website form
  ↓
Receive submissions
  ↓
Manage leads
  ↓
View analytics
  ↓
Invite client
  ↓
Client views assigned form/leads/analytics
  ↓
Developer upgrades subscription if needed
```

The entire flow must work with real infrastructure.

---

# 3. Development Principles

## Principle 1 — Build vertically

Prefer complete user journeys over isolated UI implementation.

For example:

```text
Database
+
API
+
UI
+
Tests
```

for one feature is better than creating every UI screen first and connecting everything later.

---

## Principle 2 — Security before polish

Implement:

```text
Authentication
Authorization
RLS
Tenant isolation
Secret security
API security
```

before spending significant time on visual polish.

---

## Principle 3 — No fake functionality

Every implemented feature must either:

- Work correctly, or
- Be clearly marked as unavailable/Coming Soon.

Never ship dead buttons.

---

## Principle 4 — Test critical functionality continuously

Do not wait until the end to discover:

- RLS problems
- Cross-workspace access
- Billing bugs
- Quota bypasses
- Duplicate leads
- Broken invitations

---

## Principle 5 — Keep V1 focused

Do not expand the roadmap because a feature sounds interesting.

Formivo V1 is intentionally narrow.

---

# 4. Phase Overview

The recommended roadmap contains 13 phases:

```text
Phase 0  — Repository & Project Audit
Phase 1  — Foundation
Phase 2  — Database & Security
Phase 3  — Authentication & Workspace
Phase 4  — Form Management
Phase 5  — Public Submission API
Phase 6  — Lead Management
Phase 7  — Analytics
Phase 8  — Client Portal & Invitations
Phase 9  — Billing & Entitlements
Phase 10 — Email & Notifications
Phase 11 — Product Polish
Phase 12 — Testing & Security Hardening
Phase 13 — Deployment & Launch
```

---

# 5. Phase 0 — Repository & Project Audit

## Goal

Understand the existing project before changing it.

---

## Tasks

Inspect:

```text
package.json
next.config.*
tsconfig.json
tailwind.config.*
src/
app/
components/
lib/
supabase/
migrations/
public/
tests/
```

Also inspect:

```text
Environment variables
Existing authentication
Existing database schema
Existing API routes
Existing UI components
Existing deployment configuration
Existing tests
```

---

## Decisions

Determine:

- What can be reused?
- What must be replaced?
- What is missing?
- Is the current architecture compatible with Formivo?

---

## Deliverables

```text
[ ] Repository architecture understood
[ ] Existing dependencies reviewed
[ ] Existing routes reviewed
[ ] Existing database reviewed
[ ] Existing authentication reviewed
[ ] Existing styling reviewed
[ ] Existing tests reviewed
[ ] Technical debt identified
```

---

## Exit Criteria

Do not proceed until the implementation agent understands the current repository.

---

# 6. Phase 1 — Foundation

## Goal

Establish the technical foundation for Formivo.

---

## Tasks

Configure:

```text
Next.js
TypeScript
Tailwind
UI primitives
ESLint
Formatting
Environment configuration
Error boundaries
Basic layouts
```

Create a clean project structure.

Recommended conceptual structure:

```text
src/
├── app/
├── components/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── api/
│   ├── security/
│   ├── billing/
│   ├── email/
│   └── entitlements/
├── services/
├── types/
└── validations/
```

The exact structure may adapt to the existing repository.

---

## Initial UI

Create:

```text
Marketing layout
Authentication layout
Developer application shell
Client application shell
```

Do not implement every page yet.

---

## Exit Criteria

```text
[ ] Application runs locally
[ ] TypeScript passes
[ ] Lint passes
[ ] Basic UI renders
[ ] Environment configuration works
[ ] Build succeeds
```

---

# 7. Phase 2 — Database & Security

## Goal

Create the secure multi-tenant data foundation.

---

## Database Tables

Implement:

```text
profiles
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

---

## Database Tasks

Implement:

```text
[ ] Migrations
[ ] Foreign keys
[ ] Constraints
[ ] Indexes
[ ] Timestamps
[ ] Delete behavior
[ ] Unique constraints
```

---

# 8. Row Level Security

Implement RLS policies for every relevant table.

Test:

```text
User A → Workspace A = allowed
User A → Workspace B = denied
```

Test client access:

```text
Client → assigned form = allowed
Client → unassigned form = denied
```

---

# 9. Security Foundation

Implement:

```text
[ ] Secure ID handling
[ ] Secret hashing utilities
[ ] Token hashing utilities
[ ] Authorization helpers
[ ] Workspace access helpers
[ ] Error handling
[ ] Request ID generation
```

---

## Exit Criteria

```text
[ ] Migrations pass
[ ] RLS policies pass
[ ] Cross-workspace tests pass
[ ] Database constraints work
[ ] Security utilities are tested
```

This phase is a release-blocking foundation.

---

# 10. Phase 3 — Authentication & Workspace

## Goal

Allow developers to create accounts and establish their workspace.

---

## Authentication

Implement:

```text
/sign-up
/sign-in
/forgot-password
/reset-password
/callback
```

Use Supabase Auth.

---

## Workspace Creation

After registration:

```text
Create profile
     ↓
Create workspace
     ↓
Create workspace membership
     ↓
Create free subscription
     ↓
Create initial usage state if needed
     ↓
Redirect to dashboard
```

---

## Workspace Settings

Implement:

```text
/settings/profile
/settings/workspace
/settings/security
```

---

## Dashboard

Create the first real dashboard experience.

For a new user:

```text
Welcome
Create your first form
```

Do not fabricate statistics.

---

## Exit Criteria

```text
[ ] Sign up works
[ ] Sign in works
[ ] Sign out works
[ ] Password recovery works
[ ] Workspace creation works
[ ] Protected routes work
[ ] Unauthorized users are redirected
[ ] Workspace isolation works
```

---

# 11. Phase 4 — Form Management

## Goal

Allow developers to create and manage Formivo integrations.

---

## Form List

Implement:

```text
/forms
```

Features:

```text
[ ] List forms
[ ] Form status
[ ] Lead count
[ ] Creation date
[ ] Open form
[ ] Create form
```

---

# 12. Create Form

Implement:

```text
/forms/new
```

Options:

### Connect Custom Form

```text
Available
```

### Embedded Form Builder

```text
Coming Soon
```

The second option must not be functional.

---

# 13. Form Detail

Implement:

```text
/forms/[formId]
```

Include:

```text
Overview
Integration
Leads
Analytics
Clients
```

---

# 14. Integration

Implement:

```text
/forms/[formId]/integration
```

Show:

```text
Endpoint
HTTP method
Authentication
Request example
Response example
Security guidance
Test submission
Secret controls
```

---

# 15. Secret Management

Implement:

```text
Generate secret
Show secret once
Rotate secret
Invalidate previous secret
```

The raw secret should not be permanently retrievable from the database.

---

# 16. Form Archive

Allow the developer to archive a form.

Archived forms:

```text
Remain visible historically
Retain their leads
Reject new submissions
Cannot receive new traffic
```

---

## Exit Criteria

```text
[ ] Form creation works
[ ] Form limits work
[ ] Form detail works
[ ] Integration page works
[ ] Secret generation works
[ ] Secret rotation works
[ ] Archived form rejects submissions
[ ] No secret leakage
```

---

# 17. Phase 5 — Public Submission API

## Goal

Build the central Formivo product capability.

Endpoint:

```text
POST /api/v1/forms/{formPublicId}/submissions
```

---

# 18. Submission Pipeline

Implement:

```text
Request
 ↓
Parse
 ↓
Resolve form
 ↓
Check status
 ↓
Verify secret
 ↓
Rate limit
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
Store idempotency result
 ↓
Response
```

---

# 19. Submission API

Support:

```text
Content-Type: application/json
Authorization: Bearer FORM_SECRET
Idempotency-Key: optional
```

---

# 20. API Validation

Test:

```text
Valid request
Invalid JSON
Missing authorization
Invalid secret
Unknown form
Archived form
Oversized payload
Invalid payload
Quota exceeded
Rate limited
Duplicate request
```

---

# 21. Idempotency

Implement:

```text
Same key + same body
→ same result

Same key + different body
→ conflict

Different key
→ new lead
```

---

# 22. Usage

Implement atomic lead usage counting.

Ensure concurrent requests cannot bypass the monthly limit.

---

## Exit Criteria

```text
[ ] Real form submission creates lead
[ ] Invalid secret rejected
[ ] Archived form rejected
[ ] Payload limit enforced
[ ] Rate limiting works
[ ] Quota works
[ ] Idempotency works
[ ] Usage counter is correct
[ ] API errors are structured
[ ] No sensitive information is leaked
```

This phase should be considered the first major Formivo milestone.

---

# 23. Phase 6 — Lead Management

## Goal

Turn submissions into a useful lead-management experience.

---

# 24. Lead List

Implement:

```text
/leads
/forms/[formId]/leads
```

Support:

```text
Search
Status filtering
Sorting
Pagination
Form filtering
```

---

# 25. Lead Detail

Implement:

```text
/leads/[leadId]
```

Show:

```text
Lead information
Metadata
Status
Created date
Source/page where available
```

Render JSON data safely.

---

# 26. Lead Status

Implement:

```text
New
Contacted
Qualified
Converted
Archived
```

Developers can update status.

Clients cannot.

---

# 27. Lead Archive

Allow developers to archive leads.

Archived records should remain appropriately retrievable according to the approved product behavior.

---

## Exit Criteria

```text
[ ] Leads appear after submission
[ ] Search works
[ ] Filters work
[ ] Pagination works
[ ] Detail page works
[ ] Status updates work
[ ] Archive works
[ ] Client modification is blocked
```

---

# 28. Phase 7 — Analytics

## Goal

Provide useful, lightweight analytics.

---

# 29. Analytics Metrics

Implement:

```text
Total leads
Lead volume over time
Lead status distribution
Form-level submission volume
```

---

# 30. Developer Analytics

Implement:

```text
/analytics
/forms/[formId]/analytics
```

Ensure data is workspace-scoped.

---

# 31. Client Analytics

Clients can view analytics only for assigned forms.

---

# 32. Analytics Principles

Do not build:

```text
Complex BI
Advanced attribution
Revenue forecasting
AI insights
Marketing attribution
```

V1 analytics should answer:

> How many leads am I receiving, and what is their current status?

---

## Exit Criteria

```text
[ ] Metrics are accurate
[ ] Date ranges work if implemented
[ ] Status distribution works
[ ] Form isolation works
[ ] Client isolation works
[ ] Empty analytics state works
```

---

# 33. Phase 8 — Client Portal & Invitations

## Goal

Allow developers to safely share form data with clients.

---

# 34. Client Management

Implement:

```text
/clients
/forms/[formId]/clients
```

Show:

```text
Client email
Assigned form
Access status
Invitation status
```

---

# 35. Invitation

Developer selects:

```text
Form
Client email
```

System:

```text
Checks permission
 ↓
Checks viewer entitlement
 ↓
Creates secure token
 ↓
Stores token hash
 ↓
Sends email
```

---

# 36. Invitation Acceptance

Client:

```text
Receives email
 ↓
Opens invitation
 ↓
Token verified
 ↓
Signs in/signs up
 ↓
Access created
 ↓
Redirected to client dashboard
```

---

# 37. Client Dashboard

Implement:

```text
/client
/client/forms
/client/forms/[formId]
/client/forms/[formId]/leads
/client/forms/[formId]/analytics
```

---

# 38. Client Restrictions

Test that the client cannot:

```text
Create form
Modify form
Rotate secret
Modify lead
Archive lead
Invite users
Manage billing
View other forms
View other workspaces
```

---

# 39. Access Revocation

Developer can revoke client access.

After revocation:

```text
Client access → immediately denied
```

Do not rely only on frontend navigation.

---

## Exit Criteria

```text
[ ] Invitation sends
[ ] Invitation expires
[ ] Invitation can be revoked
[ ] Token is hashed
[ ] Token is single-use
[ ] Client account works
[ ] Form-level access works
[ ] Client restrictions work
[ ] Revocation works
```

---

# 40. Phase 9 — Billing & Entitlements

## Goal

Connect real paid plans and enforce limits.

---

# 41. Plan Configuration

Implement centralized configuration:

```text
Free
Pro
Agency
```

with:

```text
forms
monthlyLeads
viewers
```

---

# 42. Billing Page

Implement:

```text
/billing
```

Display:

```text
Current plan
Current usage
Available plans
Upgrade action
Subscription status
Manage subscription
```

---

# 43. Lemon Squeezy Checkout

Implement server-controlled checkout.

The browser should request:

```text
Upgrade to Pro
Upgrade to Agency
```

The server determines the correct provider variant.

---

# 44. Webhooks

Implement:

```text
POST /api/webhooks/lemonsqueezy
```

Support the required subscription lifecycle events.

---

# 45. Webhook Security

Implement:

```text
Raw body
 ↓
Signature verification
 ↓
Event validation
 ↓
Event ID deduplication
 ↓
Subscription update
```

---

# 46. Entitlements

Centralize:

```text
Can create form?
Can accept lead?
Can create viewer?
```

All important enforcement must happen server-side.

---

# 47. Downgrades

Test:

```text
Agency
 ↓
Downgrade to Free
```

Existing resources remain.

New resources beyond limits are blocked.

---

## Exit Criteria

```text
[ ] Plans displayed correctly
[ ] Checkout works
[ ] Webhook verification works
[ ] Subscription state updates
[ ] Duplicate webhook is safe
[ ] Entitlements update
[ ] Limits are enforced
[ ] Downgrade preserves data
[ ] Billing UI is accurate
[ ] No Stripe code exists
```

---

# 48. Phase 10 — Email & Notifications

## Goal

Complete transactional client invitation email functionality.

---

# 49. Resend Configuration

Configure:

```env
RESEND_API_KEY=
```

Configure a verified sender domain.

---

# 50. Invitation Email

Create a professional invitation email containing:

```text
Formivo branding
Invitation context
Assigned form/client context
Secure invitation CTA
Expiration information
Support/context link where appropriate
```

Do not include secrets.

---

# 51. Email Reliability

Handle:

```text
Provider failure
Invalid configuration
Rate limits
Duplicate invitations
Expired invitations
```

---

# 52. Email Testing

Test:

```text
[ ] Valid email
[ ] Invalid email
[ ] Expired invitation
[ ] Revoked invitation
[ ] Duplicate invitation
[ ] Provider failure
[ ] HTML rendering
[ ] Plain text rendering
[ ] Mobile layout
```

---

## Exit Criteria

```text
[ ] Resend works in staging
[ ] Invitation email arrives
[ ] Invitation CTA works
[ ] Token validation works
[ ] No secrets leak
[ ] Email failures are handled
```

---

# 53. Phase 11 — Product Polish

## Goal

Transform the functional application into a polished commercial SaaS.

---

# 54. Visual Polish

Review:

```text
Typography
Spacing
Borders
Buttons
Inputs
Tables
Dialogs
Navigation
Charts
Cards
Empty states
```

---

# 55. Responsive Review

Test:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
```

Pay particular attention to:

```text
Navigation
Tables
Forms
Dialogs
Charts
Billing
Integration code examples
```

---

# 56. Accessibility Review

Verify:

```text
Keyboard navigation
Focus states
Screen reader labels
Form labels
Dialog semantics
Color contrast
Reduced motion
Heading hierarchy
```

---

# 57. UX Review

Check:

```text
Can a new developer understand what to do?
Can they create a form quickly?
Can they understand the endpoint?
Can they test a submission?
Can they find a lead?
Can they invite a client?
Can the client understand their dashboard?
```

---

# 58. Error State Review

Every major page should have:

```text
Loading
Empty
Error
Success
```

states where applicable.

---

# 59. Marketing Review

Review:

```text
Homepage
Pricing
Documentation
Privacy
Terms
```

Ensure there are no:

```text
Fake testimonials
Fake logos
Fake metrics
Fake integrations
Unsupported promises
```

---

## Exit Criteria

```text
[ ] Desktop polished
[ ] Mobile polished
[ ] Accessibility reviewed
[ ] Empty states complete
[ ] Loading states complete
[ ] Error states complete
[ ] Marketing copy accurate
```

---

# 60. Phase 12 — Testing & Security Hardening

## Goal

Prove the application works correctly and securely.

---

# 61. Automated Test Layers

Run:

```text
Unit tests
Integration tests
API tests
Database/RLS tests
Security tests
Component tests
E2E tests
```

---

# 62. Critical Security Tests

Verify:

```text
Cross-workspace access
Cross-form access
Client privilege escalation
Secret exposure
Invitation token reuse
Webhook replay
Quota bypass
Idempotency bypass
Unauthorized API requests
```

---

# 63. Critical Public API Tests

Verify:

```text
Valid submission
Invalid secret
Missing secret
Unknown form
Archived form
Invalid JSON
Oversized payload
Rate limit
Quota limit
Idempotency
Concurrent submissions
```

---

# 64. Billing Tests

Verify:

```text
Free → Pro
Free → Agency
Pro → Free
Agency → Free
Active subscription
Cancelled subscription
Past due
Webhook replay
Invalid signature
Unknown event
```

---

# 65. Client Tests

Verify:

```text
Assigned form → accessible
Unassigned form → denied
Assigned leads → readable
Lead modification → denied
Billing → denied
Secrets → denied
Form management → denied
```

---

# 66. E2E Happy Path

Automate the complete developer flow:

```text
Sign up
 ↓
Create workspace
 ↓
Create form
 ↓
Get integration credentials
 ↓
Submit lead
 ↓
Open leads
 ↓
View lead
 ↓
Change status
 ↓
View analytics
 ↓
Invite client
 ↓
Client accepts
 ↓
Client views form
```

---

# 67. E2E Failure Path

Test:

```text
Invalid login
Invalid form secret
Archived form
Quota exceeded
Rate limited
Duplicate request
Expired invitation
Revoked invitation
Unauthorized resource
Billing failure
Email failure
```

---

# 68. Performance Review

Measure:

```text
Homepage load
Dashboard load
Forms list
Leads list
Lead detail
Analytics
Public submission endpoint
```

Optimize obvious bottlenecks.

Do not introduce unnecessary infrastructure.

---

# 69. Database Review

Verify:

```text
Indexes
Query performance
RLS
Constraints
Transactions
Concurrency
Migration correctness
```

---

# 70. Dependency Review

Check:

```text
Outdated dependencies
Known vulnerabilities
Unused packages
Duplicate packages
Unnecessary packages
```

Remove unnecessary dependencies.

---

# 71. Security Hardening Checklist

```text
[ ] No secrets committed
[ ] No provider keys exposed client-side
[ ] No service role key exposed
[ ] No raw invitation tokens stored
[ ] No raw form secrets stored
[ ] No secrets in logs
[ ] RLS enabled
[ ] Authorization enforced
[ ] Rate limiting enabled
[ ] Payload limits enabled
[ ] Webhook signature verified
[ ] Idempotency implemented
[ ] XSS protections reviewed
[ ] CSRF reviewed
[ ] CORS reviewed
[ ] Security headers configured
```

---

## Exit Criteria

No critical or high-severity issue should remain unresolved.

---

# 72. Phase 13 — Deployment & Launch

## Goal

Deploy Formivo safely.

---

# 73. Environment Separation

Maintain separate environments:

```text
Local
Staging
Production
```

Do not use production secrets locally.

---

# 74. Production Environment Variables

Configure only required production variables.

Example:

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_PRO_VARIANT_ID=
LEMON_SQUEEZY_AGENCY_VARIANT_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=

RESEND_API_KEY=
```

Never expose server-only secrets through `NEXT_PUBLIC_*`.

---

# 75. Supabase Production

Before launch:

```text
[ ] Production project configured
[ ] Migrations applied
[ ] RLS verified
[ ] Auth configured
[ ] Redirect URLs configured
[ ] Email configuration reviewed
[ ] Database indexes verified
```

---

# 76. Lemon Squeezy Production

Configure:

```text
Products
Variants
Store
Checkout
Webhook
Webhook secret
```

Verify the production webhook URL.

---

# 77. Resend Production

Configure:

```text
Verified domain
Sender identity
API key
```

Send test invitation emails.

---

# 78. Vercel Deployment

Deploy application to Vercel.

Verify:

```text
Build
Environment variables
Domain
SSL
Server routes
API routes
Webhook endpoint
```

---

# 79. Domain

Recommended primary domain:

```text
formivo.com
```

If unavailable, use an approved alternative such as:

```text
formivo.dev
formivo.app
getformivo.com
useformivo.com
```

Do not change the product name simply because the first domain is unavailable.

---

# 80. Production Smoke Test

Immediately after deployment:

### Public site

```text
[ ] Homepage
[ ] Pricing
[ ] Documentation
[ ] Privacy
[ ] Terms
```

### Authentication

```text
[ ] Sign up
[ ] Sign in
[ ] Sign out
[ ] Password recovery
```

### Form

```text
[ ] Create form
[ ] View integration
[ ] Submit test lead
[ ] View lead
```

### Client

```text
[ ] Invite client
[ ] Email arrives
[ ] Client accepts
[ ] Client sees assigned form
```

### Billing

```text
[ ] Checkout
[ ] Subscription state
[ ] Webhook
[ ] Entitlements
```

---

# 81. Launch Blockers

Do not launch if any of these exist:

```text
Cross-tenant data access
Broken authentication
Secret exposure
Broken RLS
Broken webhook verification
Duplicate billing state
Quota bypass
Duplicate lead creation
Client privilege escalation
Production build failure
Critical database migration failure
```

---

# 82. Post-Launch Monitoring

Monitor:

```text
Application errors
API errors
Submission failures
Authentication failures
Webhook failures
Email failures
Database errors
Rate-limit activity
```

---

# 83. First 24 Hours

After launch, prioritize:

```text
Security issues
Data integrity issues
Billing issues
Submission failures
Authentication issues
Client access issues
```

Do not immediately start building new features.

---

# 84. First Week

Review:

```text
Sign-up completion
Form creation
First submission
Lead creation
Client invitations
Subscription conversion
Error rates
Support issues
```

Use real user behavior to determine what needs improvement.

---

# 85. Post-MVP Feature Queue

Only after V1 is stable should the team evaluate:

```text
Embedded Form Builder
Additional integrations
Advanced team roles
Automation
AI features
CRM features
White-labeling
Custom domains
Advanced analytics
```

These are not part of the V1 launch.

---

# 86. Definition of Development Complete

Formivo V1 is development-complete when:

## Product

```text
[ ] Core workflow works end-to-end
[ ] Marketing site works
[ ] Authentication works
[ ] Workspace works
[ ] Forms work
[ ] Public API works
[ ] Leads work
[ ] Analytics work
[ ] Client portal works
[ ] Billing works
[ ] Invitations work
```

## Security

```text
[ ] RLS works
[ ] Workspace isolation works
[ ] Client isolation works
[ ] Secrets are protected
[ ] Tokens are protected
[ ] API is protected
[ ] Webhooks are verified
[ ] Rate limiting works
[ ] Quotas cannot be bypassed
```

## Quality

```text
[ ] Automated tests pass
[ ] E2E tests pass
[ ] Responsive review complete
[ ] Accessibility review complete
[ ] Performance acceptable
[ ] No critical errors
```

## Infrastructure

```text
[ ] Supabase production configured
[ ] Lemon Squeezy production configured
[ ] Resend production configured
[ ] Vercel production configured
[ ] Domain configured
[ ] Webhooks configured
```

---

# 87. Recommended Build Order Summary

The complete roadmap can be reduced to this sequence:

```text
01. Audit repository
        ↓
02. Establish architecture
        ↓
03. Database + RLS
        ↓
04. Authentication
        ↓
05. Workspace
        ↓
06. Forms
        ↓
07. Public submission API
        ↓
08. Leads
        ↓
09. Analytics
        ↓
10. Client invitations
        ↓
11. Client portal
        ↓
12. Resend
        ↓
13. Lemon Squeezy
        ↓
14. Entitlements
        ↓
15. UI/UX polish
        ↓
16. Automated testing
        ↓
17. Security hardening
        ↓
18. Staging deployment
        ↓
19. Smoke testing
        ↓
20. Production launch
```

---

# 88. Recommended Milestones

## Milestone 1 — Foundation

```text
Repository
Next.js
Supabase
Database
RLS
Authentication
Workspace
```

### Result

A secure authenticated SaaS shell.

---

## Milestone 2 — Core Product

```text
Forms
Secrets
Public API
Submissions
Leads
```

### Result

A developer can connect a real website form and receive leads.

---

## Milestone 3 — Client Experience

```text
Analytics
Invitations
Client access
Client dashboard
```

### Result

A developer can give a real client access to their leads.

---

## Milestone 4 — Monetization

```text
Plans
Lemon Squeezy
Webhooks
Entitlements
Usage limits
```

### Result

Formivo can operate as a paid SaaS.

---

## Milestone 5 — Production Readiness

```text
Testing
Security
Accessibility
Responsive UI
Performance
Deployment
```

### Result

Formivo is ready for real users.

---

# 89. What Not to Do During Development

Do not:

```text
Build AI features because they are trendy
Add random integrations
Create an embedded form builder
Add CRM pipelines
Add unnecessary dashboards
Add fake analytics
Add fake testimonials
Add unnecessary animations
Replace Supabase
Replace Lemon Squeezy
Replace Resend
Use Stripe
Skip RLS
Skip testing
Skip authorization
Store secrets in plaintext
Store invitation tokens in plaintext
Expose provider keys
Create microservices unnecessarily
```

---

# 90. Engineering Decision Rule

When choosing between two implementation approaches, prefer the one that is:

```text
Simpler
+
Safer
+
More maintainable
+
Easier to test
+
Compatible with the current architecture
```

Do not choose complexity merely because it looks more sophisticated.

---

# 91. Product Decision Rule

When deciding whether to add functionality, ask:

> Does this directly improve the V1 workflow of connecting forms, capturing leads, managing leads, or giving clients controlled visibility?

If not, it probably belongs after V1.

---

# 92. Security Decision Rule

When security and convenience conflict:

> Choose the secure implementation.

Examples:

```text
Server authorization > UI-only restriction

RLS + authorization > frontend filtering

Hashed secret > plaintext secret

Verified webhook > frontend billing state

Atomic quota enforcement > client-side counter
```

---

# 93. UX Decision Rule

When functionality works but the experience feels confusing:

> Fix the UX before adding another feature.

Formivo should feel simple.

The product's strength is not the number of features.

The strength is how quickly a developer can go from:

```text
"I have a website form"
```

to:

```text
"I have a working lead dashboard and my client can see it."
```

---

# 94. Final Launch Definition

Formivo V1 is ready to launch when a real developer can perform this journey without developer intervention:

```text
Visit Formivo
    ↓
Create account
    ↓
Create workspace
    ↓
Create custom form integration
    ↓
Copy endpoint
    ↓
Connect website form
    ↓
Submit real form
    ↓
Lead appears in Formivo
    ↓
Change lead status
    ↓
View analytics
    ↓
Invite client
    ↓
Client receives email
    ↓
Client accepts invitation
    ↓
Client views assigned leads
    ↓
Developer upgrades plan if necessary
```

And when the following remain true throughout the journey:

```text
Data is isolated.
Secrets are protected.
Permissions are enforced.
Billing is verified.
Failures are handled.
The interface is responsive.
The application is tested.
```

---

# 95. Final Roadmap Principle

Do not measure Formivo's progress by the number of screens built.

Measure it by completed, verified product capabilities.

The correct progression is:

```text
Working
    ↓
Secure
    ↓
Tested
    ↓
Polished
    ↓
Production-ready
```

Not:

```text
Pretty UI
    ↓
More screens
    ↓
More features
    ↓
Hope everything works
```

The objective is a focused, trustworthy SaaS product.

**Build Formivo one verified capability at a time.**