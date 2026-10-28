# Formivo — Billing and Lemon Squeezy Specification

**Document:** `09-billing-lemonsqueezy.md`  
**Product:** Formivo  
**Version:** Version 3.0  
**Billing Provider:** Lemon Squeezy  
**Status:** Implementation-Ready

---

# 1. Purpose

This document defines the complete billing architecture for Formivo Version 3.0.

Formivo uses **Lemon Squeezy** as the payment and subscription provider.

Stripe must **not** be implemented anywhere in the V1 application.

Billing responsibilities are divided between:

```text
Formivo
→ Plans
→ Entitlements
→ Usage limits
→ Workspace subscription state
→ UI

Lemon Squeezy
→ Checkout
→ Payment processing
→ Subscription lifecycle
→ Customer billing
→ Provider-side subscription management
```

---

# 2. Billing Principle

Formivo must never determine paid access simply because a user visited a success page.

The authoritative application state is:

```text
Lemon Squeezy
        ↓
Verified webhook
        ↓
Formivo subscription record
        ↓
Entitlement service
        ↓
Feature access
```

The browser is never the billing authority.

---

# 3. Version 3.0 Plans

Formivo has three plans.

| Plan | Price | Forms | Monthly Leads | Viewers |
|---|---:|---:|---:|---:|
| Free | $0 | 3 | 100 | 3 |
| Pro | $12/month | 10 | 2,000 | 10 |
| Agency | $29/month | 50 | 10,000 | 25 |

Pricing values must be centralized in application configuration.

Do not hardcode plan checks throughout the application.

---

# 4. Free Plan

The Free plan provides:

- 3 forms
- 100 accepted leads per month
- 3 client viewers
- Basic analytics
- Custom form endpoint
- Lead management
- 30-day submission history

The Free plan does not require a Lemon Squeezy subscription.

---

# 5. Pro Plan

The Pro plan provides:

- 10 forms
- 2,000 accepted leads per month
- 10 client viewers
- Basic analytics
- Custom form endpoints
- Lead management
- Client access
- Up to 12-month submission history
- Advanced filters
- CSV export

Price:

```text
$12/month
```

---

# 6. Agency Plan

The Agency plan provides:

- 50 forms
- 10,000 accepted leads per month
- 25 client viewers
- Basic analytics
- Custom form endpoints
- Lead management
- Client access
- Up to 12-month submission history
- Advanced filters
- CSV export

Price:

```text
$29/month
```

---

# 7. Plan Configuration

Use a centralized configuration object.

Example:

```ts
const plans = {
  free: {
    price: 0,
    forms: 3,
    monthlyLeads: 100,
    viewers: 3,
  },

  pro: {
    price: 12,
    forms: 10,
    monthlyLeads: 2000,
    viewers: 10,
  },

  agency: {
    price: 29,
    forms: 50,
    monthlyLeads: 10000,
    viewers: 25,
  },
};
```

Where:

```text
-1 = unlimited
```

This configuration should be used by the entitlement system.

---

# 8. Lemon Squeezy Products

Create Lemon Squeezy products/variants corresponding to the paid plans.

Recommended conceptual mapping:

```text
Formivo Pro
→ Monthly subscription variant

Formivo Agency
→ Monthly subscription variant
```

The exact Lemon Squeezy product and variant IDs must come from the production Lemon Squeezy account.

Never invent production IDs in source code.

---

# 9. Environment Variables

Required server-side configuration should include values similar to:

```env
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_PRO_VARIANT_ID=
LEMON_SQUEEZY_AGENCY_VARIANT_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=
```

Use the exact naming convention selected by the implementation.

These values must never be exposed to the browser.

---

# 10. Billing Architecture

The billing flow is:

```text
User
 ↓
Formivo Pricing
 ↓
Select Pro / Agency
 ↓
Server validates requested plan
 ↓
Create Lemon Squeezy checkout
 ↓
Redirect user to provider checkout
 ↓
Payment/subscription occurs
 ↓
Lemon Squeezy webhook
 ↓
Verify webhook signature
 ↓
Update Formivo subscription
 ↓
Entitlements update
 ↓
User receives paid access
```

---

# 11. Checkout Principle

Checkout must be initiated server-side.

The browser may request:

```text
POST /api/billing/checkout
```

with:

```json
{
  "plan": "pro"
}
```

The server must:

1. Authenticate the user.
2. Resolve the active workspace.
3. Confirm the user is the workspace owner.
4. Validate the requested plan.
5. Check whether the plan is actually purchasable.
6. Create or prepare the Lemon Squeezy checkout.
7. Return the provider checkout URL.

---

# 12. Checkout Request

Example:

```http
POST /api/billing/checkout
Content-Type: application/json
```

Request:

```json
{
  "plan": "pro"
}
```

Allowed values:

```text
pro
agency
```

The server must reject unknown plans.

---

# 13. Checkout Authorization

Only the workspace owner can start a subscription.

A client viewer must receive:

```http
403 Forbidden
```

if they attempt to create checkout.

---

# 14. Checkout Response

Example:

```json
{
  "success": true,
  "checkoutUrl": "https://checkout.example..."
}
```

The actual provider URL must come from Lemon Squeezy.

Never construct a fake checkout URL manually.

---

# 15. Checkout Security

Never accept a client-supplied:

```text
price
amount
variant_id
```

as the billing authority.

The server maps:

```text
pro → configured PRO variant ID
agency → configured AGENCY variant ID
```

This prevents users from manipulating the price.

---

# 16. Workspace Association

Every paid subscription must map to exactly one Formivo workspace.

The application must know:

```text
workspace_id
provider_customer_id
provider_subscription_id
variant_id
plan
status
```

The workspace is the internal billing owner.

---

# 17. Customer Association

Where possible, associate the Lemon Squeezy customer with the Formivo workspace owner and workspace.

Never use the customer's email alone as the only identity relationship.

Provider IDs should be stored.

---

# 18. Subscription Table

Formivo stores subscription state in:

```text
subscriptions
```

Core fields:

```text
workspace_id
plan
status
provider
provider_customer_id
provider_subscription_id
variant_id
current_period_start
current_period_end
cancel_at_period_end
created_at
updated_at
```

---

# 19. Provider Field

For V1:

```text
provider = "lemonsqueezy"
```

Do not create Stripe records or Stripe-specific database columns.

The architecture should still keep provider fields generic enough for future migration if ever required.

---

# 20. Subscription Status

The application should normalize provider statuses into a small internal set.

Recommended conceptual statuses:

```text
active
past_due
paused
cancelled
expired
```

The exact mapping must follow Lemon Squeezy's current subscription event/status model.

Unknown provider states must be handled safely rather than silently granting access.

---

# 21. Active Subscription

A workspace has paid access when its verified subscription state maps to an active paid entitlement.

Example:

```text
subscription.plan = pro
subscription.status = active
```

Then:

```text
entitlements.plan = pro
```

---

# 22. Pending Checkout

A checkout session does not automatically mean the user has paid.

Do not grant permanent paid access based only on:

```text
checkout created
```

or:

```text
checkout page visited
```

Paid access should be confirmed through verified provider state/webhooks.

---

# 23. Webhook Endpoint

Formivo exposes:

```text
POST /api/webhooks/lemonsqueezy
```

This endpoint is public because Lemon Squeezy must reach it.

It must be protected by webhook signature verification.

---

# 24. Webhook Signature Verification

The webhook implementation must:

1. Read the raw request body.
2. Read the Lemon Squeezy signature header.
3. Calculate/verify the expected signature using the configured webhook secret.
4. Reject invalid signatures.
5. Only then parse/process the event.

Do not verify a re-serialized JSON object if the provider expects the raw payload.

---

# 25. Invalid Webhook

Invalid webhook signatures must not modify any database state.

Return an appropriate unauthorized response.

Do not reveal details about the expected signature.

---

# 26. Webhook Event ID

Every supported webhook event should be identified by a stable provider event ID where available.

Store it in:

```text
webhook_events
```

with:

```text
provider = "lemonsqueezy"
event_id = ...
```

The database must enforce uniqueness.

---

# 27. Webhook Replay Protection

If the same event is delivered twice:

```text
first event
→ process

duplicate event
→ recognize existing event
→ do not duplicate side effects
```

Webhook processing must be idempotent.

---

# 28. Webhook Events

The implementation should support the Lemon Squeezy subscription lifecycle events required by V1, including events corresponding to:

- Subscription created
- Subscription updated
- Subscription cancelled
- Subscription resumed
- Subscription expired
- Subscription paused/unpaused where applicable

The exact event names must be taken from the Lemon Squeezy API/webhook configuration used by the production implementation.

Do not invent unsupported event names.

---

# 29. Webhook Event Processing

Conceptual flow:

```text
Webhook received
 ↓
Verify signature
 ↓
Extract event ID
 ↓
Check webhook_events
 ↓
If already processed → return safely
 ↓
Validate payload
 ↓
Resolve workspace/subscription
 ↓
Normalize subscription state
 ↓
Update subscriptions
 ↓
Update entitlements indirectly
 ↓
Record processed_at
 ↓
Return success
```

---

# 30. Webhook Transaction

Where possible, subscription state updates and event recording should be performed atomically.

The system must avoid a situation where:

```text
subscription updated
```

but:

```text
webhook event appears unprocessed
```

or the opposite.

---

# 31. Unknown Webhook Events

Unknown events should not automatically cause failure of the entire webhook infrastructure.

The system should:

1. Verify the event.
2. Record enough information for observability.
3. Ignore unsupported business logic safely.
4. Return an appropriate success response if the event was valid but irrelevant.

---

# 32. Failed Webhook Processing

If a valid webhook cannot be safely processed because of a transient server/database issue, return an appropriate non-success response so the provider can retry according to its delivery behavior.

Do not mark an event processed if its required state change did not complete.

---

# 33. Subscription Synchronization

The database is the application read model.

Lemon Squeezy remains the external billing provider.

When a webhook updates a subscription:

```text
Provider
 ↓
Verified webhook
 ↓
Formivo subscriptions
 ↓
Entitlements
```

---

# 34. Entitlement Service

Create a centralized entitlement service.

Conceptually:

```ts
getWorkspaceEntitlements(workspaceId)
```

It should return something like:

```ts
{
  plan: "pro",
  formsLimit: 10,
  monthlyLeadsLimit: 2000,
  viewersLimit: 5,
}
```

---

# 35. Entitlement Rules

Feature access should use entitlements.

Example:

```ts
if (usage.forms >= entitlements.formsLimit) {
  throw new PlanLimitError();
}
```

Do not duplicate plan logic across components.

---

# 36. Form Creation Limit

Before creating a form:

```text
Current form count
        ↓
Plan form limit
        ↓
Allowed?
```

If the limit has been reached:

```text
403 / 409
```

with a stable application error such as:

```text
PLAN_LIMIT_REACHED
```

The exact status code should be standardized in the API specification.

---

# 37. Viewer Limit

Before creating client access:

```text
Current viewer count
        ↓
Plan viewer limit
        ↓
Allowed?
```

Free:

```text
1 viewer
```

Pro:

```text
5 viewers
```

Agency:

```text
Unlimited
```

---

# 38. Lead Quota

Accepted submissions count toward the monthly lead quota.

The quota should be based on successfully accepted leads, not arbitrary requests.

Failed authentication attempts should not count as leads.

Rate-limited requests should not count as leads.

Invalid payloads should not count as leads.

---

# 39. Monthly Usage Period

Usage is tracked using:

```text
usage_counters
```

with:

```text
period_start
period_end
leads_count
```

The current billing/usage period should be determined consistently.

The implementation must avoid timezone ambiguity.

Use UTC for server-side period calculations unless the billing model explicitly requires otherwise.

---

# 40. Usage Reset

Usage does not need to physically delete historical records.

A new usage period should use a new counter record.

Example:

```text
September counter
October counter
November counter
```

This preserves historical usage information.

---

# 41. Free Plan Usage

Free workspaces also require usage tracking.

The Free plan has:

```text
100 leads/month
```

The same quota enforcement service should apply to all plans.

---

# 42. Upgrade Flow

Example:

```text
Free
 ↓
Pricing
 ↓
Upgrade to Pro
 ↓
Lemon Squeezy checkout
 ↓
Payment
 ↓
Verified webhook
 ↓
Subscription becomes Pro
 ↓
Pro entitlements active
```

The user should see an understandable pending state while webhook synchronization completes.

---

# 43. Agency Upgrade

Example:

```text
Pro
 ↓
Upgrade to Agency
 ↓
Checkout
 ↓
Provider confirms subscription state
 ↓
Webhook
 ↓
Agency entitlement
```

Do not assume the frontend response alone means the upgrade succeeded.

---

# 44. Downgrade Flow

If a user changes from Agency to Pro:

```text
Agency
 ↓
Downgrade requested
 ↓
Provider processes change
 ↓
Webhook confirms
 ↓
Formivo updates plan
```

The implementation must define what happens if the workspace currently exceeds the new plan's limits.

---

# 45. Downgrade With Too Many Forms

Example:

```text
Agency:
20 forms

Downgrade to Pro:
limit = 10
```

Do not automatically delete forms.

Instead:

1. Preserve existing forms.
2. Prevent creation of additional forms.
3. Show the workspace that it is above its new limit.
4. Require the owner to archive/delete excess forms before creating more.

---

# 46. Downgrade With Too Many Viewers

Do not automatically delete client access.

If:

```text
Current viewers = 8
Pro limit = 5
```

then:

- Preserve existing access.
- Prevent adding additional viewers.
- Show a clear limit warning.
- Let the owner reduce access or upgrade.

---

# 47. Downgrade With Lead Usage

Existing historical leads are not deleted because of a downgrade.

The new plan's quota applies to future accepted submissions.

---

# 48. Cancellation

A user may cancel a paid subscription according to Lemon Squeezy's supported subscription management flow.

If cancellation is scheduled for the end of the current period:

```text
cancel_at_period_end = true
```

The user retains paid entitlements until the provider confirms the subscription is no longer active.

---

# 49. Immediate Cancellation

If Lemon Squeezy reports an immediate cancellation or expiration:

```text
subscription.status
→ cancelled / expired
```

Formivo should update entitlements accordingly.

The workspace should fall back to the Free plan behavior unless the business rules specify otherwise.

---

# 50. Failed Payment / Past Due

If Lemon Squeezy reports a payment-related state:

```text
past_due
```

the application must use the defined internal entitlement policy.

V1 should avoid making assumptions.

Recommended behavior:

- Show billing warning.
- Preserve state required by provider lifecycle.
- Do not silently convert to Free until the provider reports cancellation/expiration or the configured grace policy is reached.

---

# 51. Subscription Pause

If Lemon Squeezy supports a pause state for the relevant subscription configuration:

- Store the provider state.
- Normalize it internally.
- Display billing status.
- Apply the documented entitlement policy.

Do not treat every provider status as `active`.

---

# 52. Billing Page

The Formivo billing page should show:

```text
Current plan
Plan price
Usage
Forms used
Leads used
Viewers used
Subscription status
Current billing period
Cancellation state
Upgrade / change plan action
Billing management action
```

---

# 53. Billing UI

Example:

```text
Current Plan
Pro
$9/month

Forms
4 / 10

Monthly Leads
742 / 2,000

Client Viewers
3 / 5
```

The UI must obtain these values from the server.

---

# 54. Usage Visualization

Use simple visual indicators.

Examples:

```text
742 / 2,000 leads
```

or a progress bar.

Do not use misleading percentages when limits are unlimited.

---

# 55. Unlimited Values

For Agency:

```text
Forms: Unlimited
Viewers: Unlimited
```

Do not render:

```text
0 / -1
```

to users.

The UI should translate internal unlimited values into meaningful language.

---

# 56. Pricing Page

The public pricing page should show:

```text
Free
$0

Pro
$9/month

Agency
$29/month
```

with clear feature comparisons.

Avoid fake:

- Customer logos
- Testimonials
- Usage claims
- Revenue numbers
- Enterprise customers

---

# 57. Pricing CTA

Free plan:

```text
Get Started
```

Pro:

```text
Start Pro
```

Agency:

```text
Start Agency
```

Authenticated owners can start checkout directly.

Unauthenticated users should first authenticate or be routed through a safe signup flow.

---

# 58. Billing Route Protection

Protected billing routes require authentication.

Example:

```text
GET /api/billing
POST /api/billing/checkout
```

must require:

```text
authenticated user
+
workspace owner
```

---

# 59. Client Billing Protection

A client attempting:

```text
GET /api/billing
POST /api/billing/checkout
```

must be denied.

Client dashboards must not even request billing data.

---

# 60. Billing Provider Portal

If Lemon Squeezy's configured subscription flow provides customer self-service management, Formivo may expose a provider-hosted management action.

Do not build a custom billing portal in V1.

The provider-hosted destination should be generated/obtained securely rather than manually constructed.

---

# 61. Billing API

Recommended internal endpoints:

```text
GET  /api/billing
POST /api/billing/checkout
POST /api/billing/manage
```

The exact endpoint for provider-hosted management should follow the actual Lemon Squeezy capabilities used by the implementation.

---

# 62. Billing Response

Example:

```json
{
  "success": true,
  "billing": {
    "plan": "pro",
    "status": "active",
    "price": 9,
    "currency": "USD",
    "currentPeriodEnd": "2026-11-05T00:00:00Z",
    "cancelAtPeriodEnd": false
  }
}
```

Do not expose unnecessary provider payloads.

---

# 63. Provider Data Normalization

Do not expose raw Lemon Squeezy webhook payloads to the frontend.

Convert provider data into a stable Formivo billing model.

This prevents the frontend from becoming tightly coupled to provider-specific structures.

---

# 64. Currency

V1 pricing is displayed in:

```text
USD
```

The exact currency accepted at checkout should follow the configured Lemon Squeezy product/variant.

Do not implement multi-currency pricing logic in V1 unless required by the actual provider configuration.

---

# 65. Taxes

Tax handling should be delegated to Lemon Squeezy's supported billing infrastructure.

Formivo should not attempt to calculate taxes manually in V1.

---

# 66. Invoices and Receipts

Where supported by Lemon Squeezy, billing documents should be handled through the provider.

Do not build an internal invoice-generation system for V1.

---

# 67. Refunds

Refund processing should be handled through Lemon Squeezy's provider workflow.

Formivo should respond to resulting subscription/payment state changes through the supported provider mechanisms.

---

# 68. Billing Emails

Transactional billing emails that are already handled by the provider should remain provider-managed where appropriate.

Formivo may send application-specific emails using Resend when useful, but must not duplicate provider billing responsibilities unnecessarily.

---

# 69. Subscription State Consistency

The application should not maintain conflicting plan values in multiple unrelated tables.

Canonical subscription state:

```text
subscriptions
```

Canonical feature access:

```text
entitlement service
```

Canonical provider state:

```text
Lemon Squeezy
```

---

# 70. Plan Change Auditability

Important billing changes should be observable through:

```text
subscription.updated
```

and related application logs/events.

Do not store payment card information.

---

# 71. No Card Data Storage

Formivo must never store:

- Card number
- CVV
- Full payment credentials
- Raw payment instrument data

Payment information is handled by Lemon Squeezy.

---

# 72. Billing Security Rules

Never:

```text
Trust plan from browser
Trust price from browser
Trust variant ID from browser
Grant access from frontend success state
Process unsigned webhook
Expose API key
Expose webhook secret
Store card details
```

---

# 73. Provider Failure

If Lemon Squeezy is temporarily unavailable:

- Do not crash the entire dashboard.
- Show a useful billing error.
- Do not mutate subscription state based on assumptions.
- Preserve the last verified subscription state.

---

# 74. Webhook Failure Recovery

Webhook processing must support retries.

If a transient database/provider issue occurs:

```text
Webhook
 ↓
Processing fails
 ↓
Do not mark processed
 ↓
Provider retries
 ↓
Event succeeds
```

---

# 75. Webhook Observability

Log safe information such as:

```text
provider
event_id
event_type
processing_duration
success/failure
workspace_id when safely resolved
```

Never log:

```text
API keys
Webhook secrets
Payment credentials
Raw sensitive payloads
```

---

# 76. Billing Error Codes

Recommended application codes:

```text
BILLING_NOT_CONFIGURED
INVALID_PLAN
CHECKOUT_CREATION_FAILED
BILLING_PROVIDER_ERROR
SUBSCRIPTION_NOT_FOUND
BILLING_ACCESS_DENIED
PLAN_LIMIT_REACHED
```

---

# 77. API Status Mapping

Recommended:

| Situation | HTTP |
|---|---:|
| Unauthenticated | 401 |
| Not owner | 403 |
| Invalid plan | 400 |
| Plan limit | 409 or 403 |
| Provider failure | 502/500 |
| Missing subscription | 404 |
| Invalid webhook signature | 401/403 |

The exact mapping must remain consistent across the API.

---

# 78. Billing Loading State

When loading billing data, display a meaningful skeleton rather than blank content.

Example:

```text
Current Plan
██████████

Usage
████████████
```

---

# 79. Billing Empty State

A Free workspace should not appear broken.

Show:

```text
Current Plan
Free

Upgrade when you need more forms, leads, or client viewers.
```

---

# 80. Billing Pending State

After checkout, if the provider has not yet synchronized:

```text
Payment processing

Your subscription is being confirmed. This may take a moment.
```

The frontend may poll/revalidate billing state, but the backend remains authoritative.

---

# 81. Billing Success State

Once the webhook updates the subscription:

```text
You're now on Pro.
```

Then display the updated limits.

---

# 82. Cancellation State

If cancellation is scheduled:

```text
Pro
$9/month

Cancels on November 5, 2026
```

The user should understand that access continues until the indicated date if that matches provider state.

---

# 83. Upgrade Safety

When an owner already has an active subscription:

```text
Do not blindly create another subscription.
```

The server should determine whether the requested action is:

- New subscription
- Upgrade
- Downgrade
- Existing subscription management

according to the configured Lemon Squeezy workflow.

---

# 84. Duplicate Subscription Prevention

Before creating checkout:

```text
Check existing subscription
```

If an active paid subscription exists, route the user to the appropriate management/change-plan flow instead of creating an accidental second subscription.

---

# 85. Multiple Subscriptions

V1 should normally maintain:

```text
One active Formivo subscription per workspace
```

The database field:

```text
workspace_id unique
```

supports this model.

---

# 86. Workspace Ownership Changes

V1 does not need complex workspace ownership transfer.

Do not implement ownership transfer unless explicitly added to scope.

Billing remains associated with the workspace.

---

# 87. Account Deletion

If account/workspace deletion is implemented later, billing cancellation must be handled carefully.

V1 should not silently delete a workspace with an active paid subscription without defining the provider cancellation behavior.

---

# 88. Billing Testing Environment

Development and staging should use Lemon Squeezy's appropriate test/sandbox facilities where available.

Never test payment flows against an unintended production store.

---

# 89. Test Data

Test subscriptions must be clearly identifiable.

Do not mix test subscription IDs with production configuration.

---

# 90. Production Configuration Checklist

Before production:

```text
[ ] Lemon Squeezy store configured
[ ] Pro variant configured
[ ] Agency variant configured
[ ] Webhook endpoint configured
[ ] Webhook signing secret configured
[ ] API key configured server-side
[ ] Store ID configured
[ ] Checkout tested
[ ] Webhook signature tested
[ ] Subscription creation tested
[ ] Upgrade tested
[ ] Cancellation tested
[ ] Downgrade tested
[ ] Duplicate webhook tested
[ ] Failed payment state tested
[ ] Entitlements verified
```

---

# 91. Billing Acceptance Tests

## Free

```text
[ ] New workspace starts on Free
[ ] One form can be created
[ ] Second form is blocked
[ ] 100-lead quota is enforced
[ ] One viewer can be assigned
[ ] Second viewer is blocked
```

## Pro

```text
[ ] Checkout works
[ ] Verified webhook activates Pro
[ ] 10 forms allowed
[ ] 11th form blocked
[ ] 2,000 monthly leads allowed
[ ] 5 viewers allowed
[ ] 6th viewer blocked
```

## Agency

```text
[ ] Checkout works
[ ] Verified webhook activates Agency
[ ] Multiple forms allowed
[ ] 10,000 monthly leads enforced
[ ] Multiple viewers allowed
```

---

# 92. Security Acceptance Tests

```text
[ ] Browser cannot set its own price
[ ] Browser cannot select arbitrary variant
[ ] Client cannot access billing
[ ] Unsigned webhook rejected
[ ] Duplicate webhook has no duplicate side effects
[ ] Service keys are server-only
[ ] Subscription state cannot be changed through client API
[ ] Plan cannot be upgraded by modifying request payload
```

---

# 93. Billing UI Acceptance Tests

```text
[ ] Pricing page is responsive
[ ] Billing page works on mobile
[ ] Current plan is clear
[ ] Usage is clear
[ ] Upgrade CTA is clear
[ ] Cancellation state is clear
[ ] Pending billing state is clear
[ ] Provider errors are understandable
[ ] No fake billing information is displayed
```

---

# 94. Final Billing Architecture

The final V1 architecture is:

```text
                   ┌───────────────────┐
                   │      Formivo      │
                   └─────────┬─────────┘
                             │
                    Checkout Request
                             │
                             ▼
                   ┌───────────────────┐
                   │  Lemon Squeezy    │
                   │     Checkout      │
                   └─────────┬─────────┘
                             │
                          Payment
                             │
                             ▼
                   ┌───────────────────┐
                   │  Lemon Squeezy    │
                   │      Webhook       │
                   └─────────┬─────────┘
                             │
                    Signature Verify
                             │
                             ▼
                   ┌───────────────────┐
                   │  Subscriptions    │
                   │     Database       │
                   └─────────┬─────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │   Entitlements    │
                   └─────────┬─────────┘
                             │
                             ▼
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
            Forms          Leads         Viewers
```

---

# 95. Implementation Rules

The AI coding agent must follow these rules:

1. Use Lemon Squeezy only.
2. Do not install Stripe packages.
3. Do not create Stripe routes.
4. Do not create Stripe environment variables.
5. Do not create Stripe database fields.
6. Keep provider credentials server-side.
7. Verify webhook signatures.
8. Make webhook processing idempotent.
9. Centralize plan configuration.
10. Centralize entitlement checks.
11. Never trust browser-provided prices.
12. Never grant paid access from frontend state.
13. Preserve data during downgrades.
14. Never automatically delete forms or leads because of a plan change.
15. Keep client billing access disabled.
16. Use provider-hosted billing functionality where appropriate.
17. Keep billing state synchronized through verified provider events.
18. Handle provider failures gracefully.

---

# 96. V1 Billing Definition of Done

Formivo billing is complete when:

```text
Free plan works
+
Pro checkout works
+
Agency checkout works
+
Lemon Squeezy webhooks work
+
Webhook signatures are verified
+
Webhook replay protection works
+
Subscription state is stored
+
Entitlements are centralized
+
Usage limits are enforced
+
Upgrade flow works
+
Cancellation flow works
+
Downgrade flow works
+
Existing resources are preserved
+
Client billing access is blocked
+
Provider credentials remain server-only
+
No Stripe code exists
```

---

# 97. Final Billing Principle

> **Lemon Squeezy handles payment. Formivo handles product entitlements. Verified webhooks connect the two.**

The browser never decides who has paid, which plan they have, how much they should pay, or what features they are entitled to use.

Formivo's backend and database remain the final authority for application access.