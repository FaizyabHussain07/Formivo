# Formivo — PostHog Analytics Specification

**File:** `15-posthog-analytics.md`  
**Product:** Formivo  
**Analytics Platform:** PostHog  
**Version:** Version 3.0  
**Status:** Implementation Specification

---

# 1. Purpose

This document defines how Formivo should use PostHog to understand:

- Product activation
- User behavior
- Form creation
- Lead capture
- Client sharing
- Feature adoption
- Conversion to paid plans
- Retention
- Product friction
- Errors and failed workflows

The goal is not to track everything.

The goal is to track the events necessary to answer important product questions.

---

# 2. Analytics Philosophy

Formivo should follow:

> **Track product outcomes, not meaningless clicks.**

Good:

```text
form_created
lead_received
client_invited
subscription_started
```

Bad:

```text
button_clicked
card_hovered
sidebar_opened
random_component_rendered
```

Events should represent meaningful user actions or system outcomes.

---

# 3. PostHog Responsibilities

PostHog may be used for:

```text
Product analytics
Funnels
Retention
Feature adoption
Session analysis
User behavior
Cohort analysis
Experiments when needed
```

PostHog must not become the source of truth for:

```text
Authentication
Authorization
Billing
Lead storage
Form submissions
Usage limits
Security decisions
```

The application database remains authoritative.

---

# 4. Recommended Architecture

```text
User
 ↓
Formivo Application
 ↓
Application Event
 ↓
PostHog
```

For important server-side events:

```text
Application Backend
 ↓
Validated Business Event
 ↓
PostHog
```

Do not rely exclusively on client-side tracking for critical business events.

---

# 5. Installation

Install the official PostHog JavaScript SDK appropriate for the Next.js application.

Use the current PostHog-supported Next.js integration.

Environment variables should follow the project's PostHog configuration.

Example:

```env
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

If server-side PostHog functionality is used, keep server-only credentials separate.

Never expose private server credentials through `NEXT_PUBLIC_*`.

---

# 6. User Identification

PostHog users should be identified only after authentication.

Recommended identity:

```text
PostHog distinct_id = Supabase authenticated user ID
```

Do not use:

```text
Email address as the primary distinct ID
Random browser IDs as the permanent user identity
```

Email may be stored as a user property where appropriate.

---

# 7. User Properties

Recommended user properties:

```text
user_id
email
full_name
workspace_id
workspace_name
plan
role
created_at
```

Only send properties that are useful for product analysis.

Avoid unnecessary personal information.

---

# 8. Workspace Properties

Where useful, associate events with:

```text
workspace_id
plan
workspace_role
```

The workspace is an important analytics dimension because Formivo is workspace-based.

---

# 9. Form Properties

Useful properties:

```text
form_id
form_public_id
form_status
form_created_at
workspace_id
```

Do not send:

```text
form_secret
secret_hash
lead_private_data
authentication_tokens
invitation_tokens
```

---

# 10. Lead Data Privacy

Never send complete lead payloads to PostHog.

For example, do NOT send:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "...",
  "message": "..."
}
```

Instead send aggregate/business information:

```json
{
  "form_id": "form_id",
  "source": "contact-page",
  "status": "new"
}
```

Avoid sending personally identifiable lead content.

---

# 11. Core Product Events

Formivo V1 should track the following primary events.

```text
user_signed_up
user_signed_in

workspace_created

form_created
form_archived
form_secret_rotated

integration_viewed
integration_tested

submission_received
lead_created
lead_status_changed
lead_archived

analytics_viewed

client_invitation_created
client_invitation_accepted
client_access_revoked

billing_checkout_started
subscription_started
subscription_changed
subscription_cancelled
```

---

# 12. Authentication Events

## `user_signed_up`

Track when account creation succeeds.

Properties:

```json
{
  "method": "email"
}
```

Do not track passwords.

---

## `user_signed_in`

Properties:

```json
{
  "method": "email"
}
```

---

# 13. Workspace Events

## `workspace_created`

Properties:

```json
{
  "workspace_id": "workspace_id",
  "plan": "free"
}
```

This event is important for activation analysis.

---

# 14. Form Events

## `form_created`

Properties:

```json
{
  "form_id": "form_id",
  "workspace_id": "workspace_id",
  "plan": "free",
  "integration_type": "custom_form"
}
```

---

## `form_archived`

Properties:

```json
{
  "form_id": "form_id",
  "workspace_id": "workspace_id"
}
```

---

## `form_secret_rotated`

Properties:

```json
{
  "form_id": "form_id",
  "workspace_id": "workspace_id"
}
```

Never include the secret.

---

# 15. Integration Events

## `integration_viewed`

Track when a developer opens the integration instructions.

Properties:

```json
{
  "form_id": "form_id",
  "integration_type": "custom_form"
}
```

---

## `integration_tested`

Track successful test submissions.

Properties:

```json
{
  "form_id": "form_id",
  "result": "success"
}
```

For failures:

```json
{
  "form_id": "form_id",
  "result": "failure",
  "error_code": "INVALID_REQUEST"
}
```

Do not send raw errors containing sensitive information.

---

# 16. Submission Events

## `submission_received`

This is one of Formivo's most important events.

Track successful submission processing.

Properties:

```json
{
  "form_id": "form_id",
  "workspace_id": "workspace_id",
  "source": "contact-page"
}
```

Do not send the submitted lead data.

---

# 17. Lead Events

## `lead_created`

Properties:

```json
{
  "lead_id": "lead_id",
  "form_id": "form_id",
  "workspace_id": "workspace_id"
}
```

---

## `lead_status_changed`

Properties:

```json
{
  "lead_id": "lead_id",
  "form_id": "form_id",
  "previous_status": "new",
  "new_status": "contacted"
}
```

---

## `lead_archived`

Properties:

```json
{
  "lead_id": "lead_id",
  "form_id": "form_id"
}
```

---

# 18. Analytics Events

## `analytics_viewed`

Properties:

```json
{
  "scope": "workspace",
  "form_id": null
}
```

or:

```json
{
  "scope": "form",
  "form_id": "form_id"
}
```

---

# 19. Client Events

## `client_invitation_created`

Properties:

```json
{
  "form_id": "form_id",
  "workspace_id": "workspace_id"
}
```

Do not send the client's email address unless there is a clear, privacy-reviewed reason.

---

## `client_invitation_accepted`

Properties:

```json
{
  "form_id": "form_id",
  "workspace_id": "workspace_id"
}
```

---

## `client_access_revoked`

Properties:

```json
{
  "form_id": "form_id",
  "workspace_id": "workspace_id"
}
```

---

# 20. Billing Events

## `billing_checkout_started`

Properties:

```json
{
  "current_plan": "free",
  "target_plan": "pro"
}
```

---

## `subscription_started`

Properties:

```json
{
  "plan": "pro"
}
```

---

## `subscription_changed`

Properties:

```json
{
  "previous_plan": "pro",
  "new_plan": "agency"
}
```

---

## `subscription_cancelled`

Properties:

```json
{
  "plan": "pro",
  "cancel_at_period_end": true
}
```

Do not send:

```text
Credit card data
Payment details
Billing addresses
Provider secrets
Webhook signatures
```

---

# 21. Activation Definition

Formivo's primary activation event should be:

> **A new developer successfully receives their first lead through a connected Formivo form.**

The activation sequence is:

```text
user_signed_up
        ↓
workspace_created
        ↓
form_created
        ↓
integration_viewed
        ↓
submission_received
        ↓
lead_created
```

The most important milestone is:

```text
submission_received
```

---

# 22. Activation Funnel

Create a PostHog funnel:

```text
Sign Up
 ↓
Workspace Created
 ↓
Form Created
 ↓
Integration Viewed
 ↓
First Submission Received
```

Recommended conversion metric:

```text
Sign Up → First Submission
```

This should be one of the primary Formivo product metrics.

---

# 23. Core Product Funnel

Create:

```text
Sign Up
→ Form Created
→ Submission Received
→ Lead Viewed
→ Client Invited
```

This measures how deeply a developer adopts Formivo.

---

# 24. Paid Conversion Funnel

Create:

```text
Sign Up
→ Form Created
→ Submission Received
→ Billing Viewed
→ Checkout Started
→ Subscription Started
```

Analyze separately by:

```text
Free
Pro
Agency
```

---

# 25. Client Adoption Funnel

Create:

```text
Client Invitation Created
→ Invitation Accepted
→ Client Dashboard Viewed
→ Client Form Viewed
→ Client Leads Viewed
```

This measures whether the client portal provides real value.

---

# 26. Retention

The primary retention question is:

> Does a developer continue using Formivo after receiving their first lead?

Track retention around:

```text
submission_received
```

Recommended retention periods:

```text
Day 1
Day 7
Day 14
Day 30
```

Also analyze:

```text
Weekly active workspaces
Monthly active workspaces
Weekly active developers
Monthly active developers
```

---

# 27. Activation Cohorts

Create cohorts such as:

```text
Users who received a lead
Users who created a form
Users who invited a client
Users who upgraded to Pro
Users who upgraded to Agency
```

Compare retention between:

```text
Activated users
vs
Non-activated users
```

This is especially important.

---

# 28. Plan-Based Analysis

Create cohorts/properties based on:

```text
plan = free
plan = pro
plan = agency
```

Compare:

```text
Form creation
Lead volume
Client invitations
Analytics usage
Retention
Subscription conversion
```

---

# 29. Product Usage Dashboard

Create a PostHog dashboard named:

**Formivo — Product Usage**

Include:

```text
Daily active users
Weekly active users
Monthly active users

New signups

Forms created

Submissions received

Leads created

Client invitations

Invitation acceptance rate

Analytics views
```

---

# 30. Activation Dashboard

Create:

**Formivo — Activation**

Include:

```text
Signup → Form Created
Form Created → First Submission
Signup → First Submission

Activation rate

Time to first submission

Activated users

Non-activated users
```

---

# 31. Revenue Dashboard

Create:

**Formivo — Revenue**

Include:

```text
Checkout started
Subscriptions started
Subscription changes
Cancellations
Free → Pro
Free → Agency
Pro → Agency
```

If PostHog's revenue features are used, ensure the billing source remains Lemon Squeezy.

---

# 32. Client Dashboard

Create:

**Formivo — Client Adoption**

Track:

```text
Invitations created
Invitations accepted
Client dashboard views
Client form views
Client lead views
Access revocations
```

---

# 33. Failed Workflow Dashboard

Create:

**Formivo — Product Errors**

Track aggregate failures such as:

```text
Invalid submission
Rate limited
Quota exceeded
Invalid invitation
Expired invitation
Billing failure
Email failure
Webhook failure
```

Use event properties such as:

```text
error_code
feature
plan
```

Do not send sensitive error payloads.

---

# 34. Error Event Naming

Use a consistent naming convention.

Example:

```text
submission_failed
invitation_failed
checkout_failed
email_delivery_failed
webhook_processing_failed
```

Properties:

```json
{
  "error_code": "RATE_LIMITED",
  "feature": "submission_api"
}
```

---

# 35. Event Naming Rules

Use:

```text
snake_case
```

Examples:

```text
form_created
lead_created
client_invitation_created
subscription_started
```

Do not use:

```text
FormCreated
formCreated
FORM_CREATED
clicked_create_form_button
```

---

# 36. Event Property Rules

Properties should be:

```text
Stable
Useful
Small
Non-sensitive
Consistent
```

Prefer:

```text
plan
form_id
workspace_id
status
source
error_code
```

Avoid:

```text
Entire request body
Entire lead object
Secrets
Tokens
Passwords
Raw provider payloads
```

---

# 37. Server-Side Events

Business-critical events should preferably be tracked from the server when possible.

Examples:

```text
submission_received
lead_created
subscription_started
subscription_changed
subscription_cancelled
client_invitation_accepted
```

Reason:

Client-side events can be blocked, manipulated, or triggered incorrectly.

The backend is authoritative for these actions.

---

# 38. Client-Side Events

Client-side tracking is appropriate for interface/product behavior such as:

```text
integration_viewed
analytics_viewed
billing_viewed
```

Do not make client-side analytics the authority for business state.

---

# 39. Duplicate Event Protection

Avoid tracking the same business event twice.

For example:

```text
lead_created
```

should represent one real lead creation.

Do not emit another `lead_created` merely because the UI rerendered.

---

# 40. Event Tracking Architecture

Create a small analytics abstraction.

Conceptually:

```text
analytics.track(...)
```

Instead of scattering raw PostHog calls throughout the entire application.

Example:

```ts
analytics.track("form_created", {
  formId,
  workspaceId,
  plan,
});
```

The abstraction should make future analytics changes easier.

---

# 41. Server Analytics Utility

Create a server-side utility for trusted business events.

Conceptually:

```text
trackServerEvent(...)
```

It should:

```text
Receive validated event
 ↓
Remove forbidden properties
 ↓
Send to PostHog
```

---

# 42. Analytics Failure Must Not Break Product

If PostHog is unavailable:

```text
Form submission must still work.
Lead creation must still work.
Authentication must still work.
Billing must still work.
```

Analytics must be non-blocking.

Never:

```text
Database transaction
→ wait for PostHog
→ fail business operation if PostHog fails
```

Instead:

```text
Business operation succeeds
        ↓
Analytics attempted independently
```

---

# 43. Privacy Rules

Never send to PostHog:

```text
Passwords
Authentication tokens
Form secrets
Secret hashes
Invitation tokens
Credit card information
Payment credentials
Full lead payloads
Sensitive private messages
```

Use anonymized/aggregate information where possible.

---

# 44. Lead Privacy

Formivo processes potentially sensitive client-submitted information.

Therefore:

> PostHog should know that a lead was received, not what the lead said.

Example:

### Allowed

```json
{
  "event": "lead_created",
  "properties": {
    "form_id": "abc",
    "workspace_id": "xyz"
  }
}
```

### Not allowed

```json
{
  "event": "lead_created",
  "properties": {
    "email": "john@example.com",
    "message": "Private customer message..."
  }
}
```

---

# 45. Session Replay

Session replay should be evaluated carefully.

If enabled:

```text
Mask sensitive fields
Block sensitive inputs
Avoid recording lead data
Avoid recording secrets
Avoid recording authentication credentials
```

Do not enable session replay blindly.

The implementation must comply with the privacy requirements applicable to Formivo's users and customers.

---

# 46. Feature Flags

PostHog feature flags should not control security-critical functionality.

Do not use a PostHog flag to determine:

```text
Whether a user can access another workspace
Whether a user can see a secret
Whether a client can access a form
Whether billing limits apply
```

Those decisions belong to the application.

Feature flags may later be used for:

```text
UI experiments
Non-critical beta features
Gradual UI rollouts
```

---

# 47. Recommended Initial Feature Flags

V1 does not require feature flags for most functionality.

If needed, examples include:

```text
new_dashboard_ui
new_analytics_ui
```

Do not create feature flags unnecessarily.

---

# 48. Product Questions PostHog Must Answer

The implementation should make these questions answerable:

### Acquisition

```text
How many users sign up?
```

### Activation

```text
How many users create their first form?
How many receive their first lead?
How long does activation take?
```

### Engagement

```text
How often do developers return?
How many leads do active users receive?
How often are leads managed?
```

### Client Adoption

```text
How many developers invite clients?
How many invitations are accepted?
Do clients actually view leads?
```

### Monetization

```text
How many activated users upgrade?
Which plan converts better?
When do users upgrade?
```

### Retention

```text
Do users continue using Formivo after their first lead?
```

---

# 49. North Star Metric

The recommended Formivo North Star Metric is:

> **Active workspaces successfully receiving leads through Formivo.**

This is better than simply measuring:

```text
Signups
Page views
Dashboard visits
```

because it represents real product value.

---

# 50. Supporting Metrics

Track:

```text
New workspaces
Activated workspaces
Forms created
Submissions received
Leads created
Active workspaces
Client invitations
Invitation acceptance rate
Paid workspaces
Monthly recurring revenue
Churn
```

---

# 51. Activation Metric

Primary activation:

```text
Percentage of new workspaces receiving at least one real submission within the defined activation window.
```

A practical initial window:

```text
7 days
```

Therefore:

```text
7-day activation rate
=
New workspaces that receive a lead within 7 days
/
New workspaces
```

---

# 52. Time to Value

Measure:

```text
Signup
→ Form creation
→ First submission
```

Primary metric:

> Median time from signup to first successful submission.

This is one of the most important Formivo UX metrics.

---

# 53. Funnel Drop-Off Analysis

If users stop at:

```text
Signup
```

Investigate onboarding.

If users stop at:

```text
Form creation
```

Investigate the form creation UX.

If users create forms but never receive leads:

```text
Investigate integration documentation.
Investigate endpoint setup.
Investigate developer confusion.
Investigate API errors.
```

If users receive leads but do not return:

```text
Investigate lead workflow.
Investigate notifications.
Investigate client value.
```

Do not immediately add features.

First understand the behavior.

---

# 54. Recommended PostHog Insights

Create these initial insights:

```text
1. New signups
2. Forms created
3. First submissions
4. Leads created
5. Activation funnel
6. Signup → first lead funnel
7. Client invitation funnel
8. Paid conversion funnel
9. Weekly retention
10. Monthly retention
11. Active workspaces
12. Submission failures
13. Subscription events
```

---

# 55. Recommended Dashboard Structure

Create:

```text
Formivo Analytics
├── Executive Overview
├── Activation
├── Product Usage
├── Lead Capture
├── Client Adoption
├── Revenue
├── Retention
└── Errors
```

---

# 56. Executive Overview

Show only the most important metrics:

```text
Active workspaces
New workspaces
7-day activation
Submissions received
Leads created
Paid workspaces
```

Avoid turning the dashboard into a wall of charts.

---

# 57. Analytics Data Quality

Every important event should be tested.

For each event verify:

```text
Correct event name
Correct user
Correct workspace
Correct properties
No sensitive information
No duplicate events
```

---

# 58. Local Development

Analytics behavior should be controllable during development.

Recommended:

```text
Development
→ Analytics disabled or clearly separated

Staging
→ Analytics enabled with staging identification

Production
→ Production analytics
```

Do not pollute production analytics with development activity.

---

# 59. Staging Analytics

If using PostHog in staging, ensure staging events are clearly distinguishable.

Possible property:

```json
{
  "environment": "staging"
}
```

Production:

```json
{
  "environment": "production"
}
```

Do not mix environments in production dashboards.

---

# 60. Analytics Testing

Test:

```text
[ ] Signup event
[ ] Sign-in event
[ ] Workspace creation event
[ ] Form creation event
[ ] Submission event
[ ] Lead event
[ ] Status event
[ ] Client invitation event
[ ] Client acceptance event
[ ] Checkout event
[ ] Subscription event
```

Also test:

```text
[ ] Events contain no secrets
[ ] Events contain no lead payload
[ ] Duplicate events are avoided
[ ] PostHog failure does not break product
[ ] Staging does not pollute production
```

---

# 61. Analytics Event Dictionary

The initial V1 dictionary:

| Event | Trigger | Source |
|---|---|---|
| `user_signed_up` | Account created | Client/server |
| `user_signed_in` | Successful login | Client/server |
| `workspace_created` | Workspace created | Server |
| `form_created` | Form created | Server |
| `form_archived` | Form archived | Server |
| `form_secret_rotated` | Secret rotated | Server |
| `integration_viewed` | Integration page viewed | Client |
| `integration_tested` | Test submission | Server |
| `submission_received` | Real submission accepted | Server |
| `lead_created` | Lead persisted | Server |
| `lead_status_changed` | Lead status changed | Server |
| `lead_archived` | Lead archived | Server |
| `analytics_viewed` | Analytics page viewed | Client |
| `client_invitation_created` | Invitation created | Server |
| `client_invitation_accepted` | Invitation accepted | Server |
| `client_access_revoked` | Access revoked | Server |
| `billing_checkout_started` | Checkout initiated | Server |
| `subscription_started` | Subscription activated | Server |
| `subscription_changed` | Plan changed | Server |
| `subscription_cancelled` | Subscription cancelled | Server |

---

# 62. Do Not Over-Instrument V1

Do not create events for every interaction.

Avoid tracking:

```text
Every button
Every hover
Every tooltip
Every dropdown
Every table row
Every navigation item
Every page render
```

unless there is a clear product question behind the event.

---

# 63. Analytics Governance

Any new analytics event should answer:

> What product decision will this event help us make?

If there is no clear answer, do not add the event.

---

# 64. PostHog Implementation Checklist

## Installation

```text
[ ] PostHog configured
[ ] Environment variables configured
[ ] Next.js integration implemented
[ ] Client analytics utility implemented
[ ] Server analytics utility implemented
```

## Identity

```text
[ ] Supabase user ID used consistently
[ ] Workspace association available
[ ] User properties reviewed
```

## Events

```text
[ ] Core events implemented
[ ] Server business events implemented
[ ] Client UX events implemented
[ ] Event properties standardized
```

## Privacy

```text
[ ] Secrets excluded
[ ] Tokens excluded
[ ] Passwords excluded
[ ] Lead payloads excluded
[ ] Sensitive fields masked
```

## Dashboards

```text
[ ] Overview
[ ] Activation
[ ] Product Usage
[ ] Client Adoption
[ ] Revenue
[ ] Retention
[ ] Errors
```

## Quality

```text
[ ] Events verified
[ ] Duplicate events reviewed
[ ] Staging separated
[ ] Production verified
[ ] PostHog outage does not break product
```

---

# 65. Final Analytics Architecture

The final system should look like:

```text
                    ┌───────────────────┐
                    │     Formivo       │
                    │    Application    │
                    └─────────┬─────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
       ┌────────────────┐          ┌────────────────┐
       │    Supabase    │          │    PostHog     │
       │                │          │                │
       │ Auth           │          │ Product Events │
       │ PostgreSQL     │          │ Funnels        │
       │ RLS            │          │ Retention      │
       │ Business Data  │          │ Cohorts        │
       └────────────────┘          │ Dashboards     │
                                   └────────────────┘
```

Supabase remains the source of truth.

PostHog is the analytics and product-insights layer.

---

# 66. Final Product Analytics Goal

PostHog should allow the Formivo team to answer five critical questions:

### 1. Are people signing up?

```text
New users
```

### 2. Are they reaching value?

```text
First successful lead
```

### 3. Are they continuing to use Formivo?

```text
Retention
```

### 4. Are they sharing Formivo with clients?

```text
Client invitation + acceptance
```

### 5. Are successful users willing to pay?

```text
Free → Paid conversion
```

If PostHog can answer these five questions reliably, the V1 analytics implementation is successful.

---

# 67. Final Rule

Do not build analytics for the sake of analytics.

Build analytics so Formivo can continuously answer:

> **What are users doing, where are they getting stuck, what creates value, and what makes them pay?**

The application database tells Formivo **what happened**.

PostHog helps explain **how users behave around what happened**.

Together, they provide the foundation for making product decisions based on real usage rather than assumptions.