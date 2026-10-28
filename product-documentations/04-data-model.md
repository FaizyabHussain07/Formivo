# Formivo — Data Model

**Document:** `04-data-model.md`  
**Product:** Formivo  
**Version:** Version 3.0  
**Database:** Supabase PostgreSQL  
**Status:** Implementation-Ready

---

# 1. Purpose

This document defines the complete Version 3.0 data model for Formivo.

It is the authoritative reference for:

- PostgreSQL tables
- Relationships
- Primary keys
- Foreign keys
- Enums
- JSONB structures
- Indexes
- Constraints
- Tenant isolation
- Row Level Security
- Billing state
- Client access
- Invitations
- Idempotency
- Usage tracking
- Audit-related metadata

The database must be designed around one central principle:

> **Every customer-owned resource must have a clear ownership path back to its workspace.**

---

# 2. Database Technology

Formivo uses:

```text
Supabase
   ↓
PostgreSQL
   ↓
Row Level Security
```

Supabase Auth manages authentication identities.

PostgreSQL stores application data.

RLS protects tenant-owned data.

---

# 3. Core Entity Relationship

The primary relationship is:

```text
User
 │
 └── Workspace Membership
          │
          ▼
       Workspace
          │
          ├── Forms
          │     │
          │     ├── Leads
          │     └── Client Access
          │
          ├── Invitations
          │
          ├── Subscription
          │
          └── Usage
```

More specifically:

```text
auth.users
    │
    ▼
profiles
    │
    ▼
workspace_memberships
    │
    ▼
workspaces
    │
    ├──────────────┐
    ▼              ▼
forms          subscriptions
    │
    ├──────────────┐
    ▼              ▼
submissions   form_client_permissions
                   │
                   ▼
                profiles
```

---

# 4. Database Design Principles

The schema must follow these rules:

1. Use UUIDs for internal primary keys.
2. Use separate public identifiers where resources are exposed externally.
3. Never expose sequential database IDs as API identifiers.
4. Use foreign keys for relational integrity.
5. Use `jsonb` for flexible lead data.
6. Use timestamps with timezone.
7. Use database constraints where possible.
8. Use RLS for tenant isolation.
9. Avoid unnecessary duplication.
10. Add indexes based on actual query patterns.
11. Keep billing provider identifiers separate from internal IDs.
12. Never store plaintext form secrets.
13. Never store plaintext invitation tokens.
14. Never store payment credentials.

---

# 5. UUID Strategy

Internal entities should use:

```sql
uuid
```

as primary keys.

Recommended:

```sql
id uuid primary key default gen_random_uuid()
```

Internal UUIDs should not be treated as public API identifiers.

Public resources should have a separate public ID.

---

# 6. Timestamp Strategy

All timestamps should use:

```sql
timestamptz
```

Common fields:

```text
created_at
updated_at
```

Use UTC at the database layer.

The frontend can format timestamps according to the user's locale.

---

# 7. Enumerations

Where values are controlled and stable, PostgreSQL enums may be used.

Recommended enums:

```text
workspace_member_role
form_status
lead_status
invitation_status
subscription_status
plan_type
```

Avoid enums for highly dynamic values.

---

# 8. Workspace Member Roles

V1 roles:

```text
owner
```

and:

```text
client
```

However, because client access is form-specific, client permissions should not rely solely on workspace membership.

The database should support the distinction between:

- Workspace owner/developer
- Client viewer

---

# 9. Plan Types

Version 3.0 plans:

```text
free
pro
agency
```

These correspond to:

| Plan | Forms | Monthly Leads | Viewers |
|---|---:|---:|---:|
| Free | 3 | 100 | 3 |
| Pro | 10 | 2,000 | 10 |
| Agency | 50 | 10,000 | 25 |

Plan limits should be centralized in application configuration.

The database stores the current plan state.

---

# 10. Table Overview

Version 3.0 should contain the following primary application tables:

```text
profiles
account_roles
workspaces
workspace_members
forms
submissions
client_invitations
form_client_permissions
subscriptions
usage_counters
idempotency_keys
webhook_events
```

Optional operational tables may be added if implementation requires them.

---

# 11. `profiles`

The `profiles` table stores application-level user information associated with Supabase Auth.

Supabase remains the identity provider.

Conceptual schema:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

# 12. Profile Rules

The profile ID must equal:

```text
auth.users.id
```

Do not create a second unrelated user identifier.

Authentication identity comes from Supabase Auth.

Application metadata belongs in `profiles`.

Do not store passwords in this table.

---

# 12.5 `account_roles`

The `account_roles` table stores explicitly assigned application roles.

Conceptual schema:

```sql
create table account_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
```

Allowed roles:

```text
developer
client
```

A user may have both roles if applicable (e.g., a developer who is also a client of another workspace).

Role assignment must happen through trusted server-side logic.

Do not let users modify their own role records.

---

# 13. `workspaces`

The workspace is the primary tenant.

Conceptual schema:

```sql
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  owner_id uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

# 14. Workspace Fields

### `id`

Internal workspace identifier.

### `name`

Human-readable workspace name.

Example:

```text
Acme Agency
```

### `slug`

Optional future-friendly URL identifier.

Example:

```text
acme-agency
```

Must be unique if used.

### `owner_id`

References the primary workspace owner.

---

# 15. Workspace Ownership

V1 assumes a primary workspace owner.

The owner:

- Controls the workspace
- Manages forms
- Manages clients
- Manages billing
- Controls subscription

Do not assume the owner is always the authenticated user in database queries.

Always verify membership.

---

# 16. `workspace_members`

This table connects users to workspaces.

Conceptual schema:

```sql
create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);
```

Recommended role values:

```text
owner
client
```

---

# 17. Workspace Membership Rules

A user must not have duplicate membership in the same workspace.

Constraint:

```sql
unique(workspace_id, user_id)
```

The owner must have:

```text
role = owner
```

Client membership alone does not grant access to every form.

Form-level access must be separately assigned.

---

# 18. `forms`

The `forms` table represents a Formivo lead collection endpoint.

Conceptual schema:

```sql
create table forms (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references workspaces(id)
    on delete cascade,

  public_id text not null unique,

  name text not null,

  description text,

  status text not null default 'active',

  secret_hash text not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  archived_at timestamptz
);
```

---

# 19. Form Fields

### `id`

Internal database ID.

### `workspace_id`

Tenant ownership.

### `public_id`

Public API identifier.

Example:

```text
frm_8f4b2c...
```

### `name`

Human-readable form name.

Example:

```text
Website Contact Form
```

### `description`

Optional developer-facing description.

### `status`

Possible values:

```text
active
archived
```

### `secret_hash`

Secure hash of the API secret.

Never store plaintext.

### `archived_at`

Timestamp when the form was archived.

---

# 20. Form Public ID

The public ID must be:

- Unique
- Non-sequential
- Difficult to guess
- Safe to expose

Example:

```text
frm_7m3x9k...
```

The public ID is not an authentication credential.

The secret provides authentication.

---

# 21. Form Secret Storage

Never create:

```sql
secret text
```

for plaintext form credentials.

Use:

```sql
secret_hash text not null
```

The plaintext secret exists only during secure creation/rotation.

---

# 22. Form Constraints

Recommended constraints:

```text
name cannot be empty
status must be valid
public_id must be unique
workspace_id must exist
secret_hash must exist
```

Archived forms must not accept public submissions.

---

# 23. `submissions`

The `submissions` table stores successful form submissions.

Conceptual schema:

```sql
create table submissions (
  id uuid primary key default gen_random_uuid(),

  form_id uuid not null
    references forms(id)
    on delete cascade,

  data jsonb not null,

  status text not null default 'new',

  source_origin text null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);
```

---

# 24. Submission Ownership

Every submission has a form ownership relationship.

The form references the workspace through its own foreign key.

The application must never allow:
```text
submission.form_id.workspace_id != form.workspace_id
```

---

# 25. Submission Data

`data` contains the submitted fields.

Example:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme",
  "message": "Interested in your services"
}
```

The schema is intentionally flexible.

Formivo does not require a fixed set of submission fields in Version 3.0.

---

# 26. Submission Status

Allowed statuses:

```text
new
read
archived
```

Default:

```text
new
```

Status changes should be validated server-side.

---

# 28. Lead Status Transitions

V1 can allow flexible transitions between statuses.

Example:

```text
new
 ↓
contacted
 ↓
qualified
 ↓
converted
```

But the application may also allow:

```text
new → archived
contacted → archived
qualified → archived
```

Do not build a complex CRM workflow engine in V1.

---

# 29. Lead Archiving

Archiving should preferably be represented using:

```text
status = archived
```

and optionally:

```text
archived_at
```

Historical submission data should remain available to authorized users.

Do not physically delete submissions merely because they are archived.

---

# 33. `form_client_permissions`

This table defines which client viewers can access which forms.

Conceptual schema:

```sql
create table form_client_permissions (
  id uuid primary key default gen_random_uuid(),

  form_id uuid not null
    references forms(id)
    on delete cascade,

  client_user_id uuid not null
    references auth.users(id)
    on delete cascade,

  invitation_id uuid
    references client_invitations(id),

  granted_at timestamptz not null default now(),

  revoked_at timestamptz null,

  created_at timestamptz not null default now()
);
```

Requirements:
- Authorization is based on authenticated `client_user_id`, not email alone.
- Only active permissions grant access.
- A form may have at most one active client account with preview access at a time.
- Different forms may have different clients.
- The same client may have access to multiple forms if each permission was explicitly granted.

---

# 31. Client Access Rules

A client can access a form only when:

```text
form_client_permissions.form_id
+
form_client_permissions.user_id
```

matches the current authenticated user.

The workspace ID provides an additional tenant boundary.

---

# 32. Why Form-Level Access Exists

Do not rely on:

```text
workspace_memberships
```

alone.

If a client is assigned Form A, they should not automatically see:

```text
Form B
Form C
Form D
```

unless explicitly assigned.

---

# 30. `client_invitations`

The invitation table manages client invitations.

Conceptual schema:

```sql
create table client_invitations (
  id uuid primary key default gen_random_uuid(),

  form_id uuid not null
    references forms(id)
    on delete cascade,

  invited_email text not null,

  token_hash text unique not null,

  status text not null default 'pending',

  invited_by_user_id uuid not null
    references auth.users(id),

  expires_at timestamptz not null,

  accepted_by_user_id uuid
    references auth.users(id) null,

  accepted_at timestamptz null,

  revoked_at timestamptz null,

  created_at timestamptz not null default now()
);
```

---

# 34. Invitation Status

Recommended values:

```text
pending
accepted
expired
revoked
```

---

# 35. Invitation Token Security

Never store:

```text
token text
```

in plaintext.

Instead:

```text
token_hash text
```

Store only a secure hash.

The actual token is sent through the invitation URL.

Example:

```text
https://app.formivo.com/invitations/accept?token=...
```

The token should be:

- Random
- High entropy
- Single-use
- Expiring

---

# 36. Invitation Acceptance

When the client opens an invitation:

```text
Token
 ↓
Hash token
 ↓
Find invitation
 ↓
Check status
 ↓
Check expiration
 ↓
Authenticate user
 ↓
Create workspace membership
 ↓
Create form_client_permissions
 ↓
Mark invitation accepted
```

These database operations should be handled transactionally where possible.

---

# 37. Invitation Email Matching

The invited email should be validated carefully.

If the authenticated account uses a different email, the application should not silently grant access.

The user should either:

- Sign in with the invited email
- Create an account with the invited email
- Explicitly confirm the account identity according to the final UX

Do not allow invitation tokens to become unrestricted access credentials.

---

# 38. `subscriptions`

The subscriptions table stores synchronized Lemon Squeezy billing state.

Conceptual schema:

```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null unique
    references workspaces(id)
    on delete cascade,

  plan text not null default 'free',

  status text not null default 'active',

  provider text not null default 'lemonsqueezy',

  provider_customer_id text,

  provider_subscription_id text unique,

  variant_id text,

  current_period_start timestamptz,

  current_period_end timestamptz,

  cancel_at_period_end boolean not null default false,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);
```

---

# 39. Subscription Provider

V1 provider:

```text
lemonsqueezy
```

Do not create Stripe-specific fields.

Do not create a generic payment architecture that adds unnecessary complexity.

---

# 40. Subscription Plan

The database should store:

```text
free
pro
agency
```

The application should use the centralized plan configuration to determine actual limits.

The database represents current billing state.

The application configuration represents product entitlements.

---

# 41. Subscription Status

Possible states may include:

```text
active
on_trial
paused
past_due
cancelled
expired
```

The exact values should be aligned with Lemon Squeezy webhook states during implementation.

Do not invent provider states without mapping them properly.

---

# 42. Free Plan Representation

Every workspace should have a valid billing state.

A newly created workspace should default to:

```text
plan = free
```

This avoids null billing logic throughout the application.

---

# 43. `usage_counters`

V1 can maintain usage information using a dedicated usage table.

Conceptual schema:

```sql
create table usage_counters (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references workspaces(id)
    on delete cascade,

  period_start date not null,

  period_end date not null,

  submissions_count integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  unique(workspace_id, period_start, period_end)
);
```

---

# 44. Usage Period

The usage period represents the monthly lead quota window.

For V1, the exact period should be defined consistently.

Recommended:

- Free plan: calendar month
- Paid plans: billing period if Lemon Squeezy synchronization makes that practical

The implementation must choose one consistent rule and document it in billing logic.

Do not mix calendar-month and billing-period calculations unpredictably.

---

# 45. Usage Counter Rules

Only successful submission submissions increment:

```text
submissions_count
```

Do not increment usage for:

- Invalid requests
- Invalid secrets
- Archived forms
- Rate-limited requests
- Payload-too-large requests
- Failed database operations
- Duplicate idempotent requests

---

# 46. Concurrent Usage Updates

Usage updates must be safe under concurrent requests.

Avoid:

```text
read count
+
1
write count
```

without concurrency protection.

Prefer an atomic database operation.

Conceptual:

```sql
update usage_counters
set submissions_count = submissions_count + 1
where workspace_id = ...
```

with appropriate transaction/quota logic.

---

# 47. `idempotency_keys`

This table prevents duplicate processing.

Conceptual schema:

```sql
create table idempotency_keys (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references workspaces(id)
    on delete cascade,

  form_id uuid not null
    references forms(id)
    on delete cascade,

  key text not null,

  request_hash text not null,

  response_status integer,

  response_body jsonb,

  submission_id uuid
    references submissions(id)
    on delete set null,

  created_at timestamptz not null default now(),

  expires_at timestamptz,

  unique(form_id, key)
);
```

---

# 48. Idempotency Rules

The same:

```text
form_id + key
```

must identify one logical request.

If the same key is reused with a different request body:

```text
request_hash != stored request_hash
```

the API should reject the request rather than silently returning the previous result.

Recommended error:

```text
INVALID_REQUEST
```

with an appropriate message.

---

# 49. Idempotency Expiration

Idempotency records do not need to remain forever.

Recommended retention:

```text
24–48 hours
```

The exact duration can be adjusted.

Expired records may be cleaned up periodically.

V1 does not require a complex job system for this.

---

# 50. `webhook_events`

Webhook processing requires replay protection.

Conceptual schema:

```sql
create table webhook_events (
  id uuid primary key default gen_random_uuid(),

  provider text not null,

  event_id text not null,

  event_type text,

  payload_hash text,

  processed_at timestamptz,

  created_at timestamptz not null default now(),

  unique(provider, event_id)
);
```

---

# 51. Webhook Event Rules

For every Lemon Squeezy webhook:

```text
Verify signature
 ↓
Extract event ID
 ↓
Check webhook_events
 ↓
If already processed → return success
 ↓
Process event
 ↓
Mark processed
```

Never process an unverified webhook.

---

# 52. Relationship Summary

The core relationships are:

```text
profiles
    │
    ├──< workspace_members >── workspaces
    │                                  │
    │                                  ├──< forms
    │                                  │      │
    │                                  │      └──< submissions
    │                                  │
    │                                  ├──< subscriptions
    │                                  │
    │                                  ├──< usage_counters
    │                                  │
    │                                  ├──< client_invitations
    │                                  │
    │                                  └──< form_client_permissions >── auth.users
    │
    └──< form_client_permissions
```

---

# 53. Foreign Key Strategy

Use foreign keys consistently.

Examples:

```text
forms.workspace_id
    → workspaces.id

submissions.workspace_id
    → workspaces.id

submissions.form_id
    → forms.id

form_client_permissions.form_id
    → forms.id

form_client_permissions.user_id
    → profiles.id

subscriptions.workspace_id
    → workspaces.id
```

This prevents orphaned records.

---

# 54. Delete Behavior

Recommended:

### Workspace deleted

Cascade:

```text
forms
submissions
memberships
subscriptions
usage
invitations
client access
```

### Form deleted

Prefer archiving rather than deletion in normal product behavior.

If a true database deletion occurs:

```text
submissions
client access
invitations
```

may cascade depending on the final retention policy.

### User deleted

User-related records should follow carefully defined privacy and retention rules.

Do not blindly cascade customer data without considering business requirements.

---

# 55. Archive vs Delete

V1 should prefer soft archival for customer-facing resources.

For forms:

```text
status = archived
```

For submissions:

```text
status = archived
```

Do not expose destructive permanent deletion unless explicitly included in the product specification.

---

# 56. Database Constraints

Important constraints include:

```text
workspace_memberships:
unique(workspace_id, user_id)

forms:
unique(public_id)

form_client_permissions:
unique(form_id, user_id)

subscriptions:
unique(workspace_id)
unique(provider_subscription_id)

usage_counters:
unique(workspace_id, period_start, period_end)

idempotency_keys:
unique(form_id, key)

webhook_events:
unique(provider, event_id)
```

---

# 57. Form/Lead Workspace Integrity

Because `submissions` stores both:

```text
workspace_id
form_id
```

the application must ensure both correspond to the same workspace.

For maximum integrity, consider one of:

1. Application-level validation
2. Database trigger
3. Composite foreign key design

For V1, a clean database constraint or controlled service-layer write is preferred over relying on developer discipline alone.

---

# 58. JSONB Rules

Use JSONB for:

```text
lead.data
lead.metadata
idempotency_keys.response_body
```

Do not use JSONB for relational information that needs:

- Foreign keys
- Joins
- Authorization
- Frequent filtering
- Unique constraints

For example, `workspace_id` should never be hidden inside JSONB.

---

# 59. JSONB Validation

PostgreSQL stores JSONB structurally, but application validation must still happen.

For lead submissions:

```text
data must be object
metadata must be object if present
values must be within supported size limits
```

Use Zod or equivalent server-side validation before insertion.

---

# 60. Search Strategy

V1 lead search may begin with application/database filtering.

Search targets can include:

- Name
- Email
- Company
- Common dynamic fields

Because the data is flexible JSONB, advanced full-text search should not be over-engineered in V1.

If search requirements grow, introduce PostgreSQL JSONB/full-text indexing later.

---

# 61. Index Strategy

Recommended indexes:

```sql
create index forms_workspace_id_idx
on forms(workspace_id);

create index forms_status_idx
on forms(status);

create index forms_public_id_idx
on forms(public_id);

create index submissions_workspace_id_idx
on submissions(workspace_id);

create index submissions_form_id_idx
on submissions(form_id);

create index submissions_status_idx
on submissions(status);

create index submissions_created_at_idx
on submissions(created_at desc);

create index form_client_permissions_user_id_idx
on form_client_permissions(user_id);

create index form_client_permissions_form_id_idx
on form_client_permissions(form_id);

create index invitations_email_idx
on invitations(email);

create index invitations_expires_at_idx
on invitations(expires_at);
```

Unique constraints may already create indexes, so do not duplicate indexes unnecessarily.

---

# 62. Composite Indexes

Depending on actual query patterns, useful composite indexes may include:

```sql
create index submissions_form_created_idx
on submissions(form_id, created_at desc);

create index submissions_workspace_created_idx
on submissions(workspace_id, created_at desc);

create index submissions_form_status_created_idx
on submissions(form_id, status, created_at desc);
```

Only retain indexes that support real application queries.

---

# 63. RLS Strategy

RLS must be enabled on all tenant-sensitive tables.

At minimum:

```text
workspaces
workspace_memberships
forms
submissions
form_client_permissions
invitations
subscriptions
usage_counters
```

Operational tables such as webhook events should have tightly restricted access.

---

# 64. Developer RLS Model

A workspace owner should be able to access:

```text
their workspace
their workspace membership
their forms
their submissions
their invitations
their client assignments
their subscription
their usage
```

They must not access another workspace's data.

---

# 65. Client RLS Model

A client should be able to access:

```text
their profile
their permitted workspace relationship
their assigned forms
submissions belonging to assigned forms
analytics derived from assigned forms
```

A client should not automatically receive access to:

```text
all workspace forms
all workspace submissions
billing
secrets
workspace administration
invitations
```

---

# 66. RLS Helper Strategy

Where possible, create reusable SQL helper functions for authorization checks.

Conceptual examples:

```text
is_workspace_member(workspace_id)
is_workspace_owner(workspace_id)
has_form_access(form_id)
```

These helpers reduce duplicated RLS logic.

Security-sensitive helper functions must be designed carefully to avoid privilege escalation.

---

# 67. Service Role and RLS

Remember:

> Supabase service-role access bypasses RLS.

Therefore service-role queries must perform explicit authorization where relevant.

Never use the service-role client as the default database client for normal authenticated dashboard operations.

---

# 68. Normal User Database Access

Normal dashboard operations should use an authenticated Supabase client tied to the current user's session.

This allows RLS to enforce access.

Conceptually:

```text
Browser request
 ↓
Authenticated session
 ↓
Supabase server client
 ↓
PostgreSQL
 ↓
RLS
 ↓
Authorized rows
```

---

# 69. Sensitive Operations

Some operations may require privileged server-side access.

Examples:

```text
Lemon Squeezy webhook synchronization
Form secret verification
System cleanup
Internal webhook processing
```

These operations must have their own authorization/security boundaries.

---

# 70. Billing Data Security

Do not store:

- Credit card numbers
- CVV
- Bank credentials
- Payment passwords

Lemon Squeezy handles payment information.

Formivo stores only the billing metadata required to associate the subscription with a workspace.

---

# 71. Personal Data

Potential personal data includes:

- Name
- Email
- Company
- Message
- Client account information

Treat lead data as customer-controlled data.

Do not expose it to unauthorized users.

Do not log complete lead payloads.

---

# 72. Data Retention

V1 should retain submissions until the customer explicitly archives/deletes them according to the final product policy.

Archived records remain stored.

System cleanup should not silently delete customer submissions.

---

# 73. Updated At Handling

Tables with mutable data should update:

```text
updated_at
```

whenever relevant fields change.

Do not rely entirely on application developers remembering this manually.

A PostgreSQL trigger may be used to automatically update timestamps.

---

# 74. Recommended Timestamp Trigger

A reusable database function can update:

```sql
NEW.updated_at = now();
```

before updates.

Apply it to tables such as:

```text
profiles
workspaces
forms
submissions
subscriptions
usage_counters
```

---

# 75. Database Migration Order

Recommended migration sequence:

```text
001_profiles
002_workspaces
003_workspace_memberships
004_forms
005_submissions
006_form_client_permissions
007_invitations
008_subscriptions
009_usage_counters
010_idempotency_keys
011_webhook_events
012_indexes
013_rls_policies
014_functions_and_triggers
015_seed_data
```

Exact migration splitting may differ.

The important requirement is dependency order.

---

# 76. Database Seed Strategy

Development seed data should create:

```text
Demo User
Demo Workspace
Demo Form
Demo Leads
Demo Client
```

Use clearly fake data.

Example:

```text
demo@example.com
John Doe
Acme Demo
```

Never include real customer information.

---

# 77. Plan Configuration vs Database

Do not store every plan limit redundantly in every workspace row.

Instead:

```text
Database
   ↓
Current plan = pro

Application config
   ↓
Pro entitlements
   ├── 10 forms
   ├── 2,000 submissions
   └── 5 viewers
```

This keeps product limits centralized.

---

# 78. Plan Change Behavior

When a subscription changes:

```text
Lemon Squeezy webhook
 ↓
Update subscriptions.plan
 ↓
Application reads new plan
 ↓
Entitlements change
```

Do not permanently copy plan limits into workspace records unless there is a specific historical requirement.

---

# 79. Downgrade Behavior

If a workspace downgrades:

```text
Existing forms
Existing submissions
Existing viewers
```

should not be silently deleted.

Instead:

- Existing data remains
- New creation is restricted
- Relevant UI explains the limit
- Customer can upgrade again

Example:

```text
You currently have 7 forms, but the Free plan allows 1.

Your existing forms remain available, but you cannot create additional forms until you upgrade or archive forms.
```

The exact product behavior should follow the PRD.

---

# 80. Usage Calculation Fallback

Even if `usage_counters` exists, the system should be able to reconcile usage from submissions when necessary.

Conceptually:

```text
usage counter
     ↓
fast operational check

submissions table
     ↓
source-of-truth reconciliation
```

This protects against counter corruption.

---

# 81. Database Source of Truth

For core entities:

```text
Users
    → Supabase Auth

Profiles
    → profiles

Workspaces
    → workspaces

Forms
    → forms

Leads
    → submissions

Client access
    → form_client_permissions

Billing state
    → subscriptions
```

External providers should not become the primary database for Formivo application state.

---

# 82. No Duplicate Business Records

Do not create duplicate records in multiple tables unnecessarily.

For example, do not store the complete lead twice merely for analytics.

Analytics should derive from:

```text
submissions
```

unless future scale requires a separate analytics system.

---

# 83. Database Performance Rules

Avoid:

```text
SELECT *
```

when only a few columns are required.

Avoid loading:

```text
all submissions
```

for dashboards.

Select only needed fields.

Use pagination.

Use indexes.

Use aggregation in PostgreSQL.

---

# 84. Database Security Rules

Never:

- Disable RLS in production without a clear reason
- Use service-role credentials in client code
- Store plaintext form secrets
- Store plaintext invitation tokens
- Store payment credentials
- Trust client-provided workspace IDs
- Trust client-provided role values
- Return unrestricted database rows through API routes

---

# 85. Example Complete Entity Graph

```text
                         auth.users
                             │
                             ▼
                         profiles
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
          workspace_memberships   form_client_permissions
                    │                 │
                    ▼                 ▼
                workspaces          forms
                    │                 │
        ┌───────────┼─────────┐       │
        │           │         │       │
        ▼           ▼         ▼       ▼
      forms     invitations subscriptions submissions
        │
        └───────────────────────────────┐
                                        │
                                        ▼
                              idempotency_keys
```

---

# 86. Final Schema Checklist

Before considering the database complete:

- [ ] Profiles table exists
- [ ] Workspaces table exists
- [ ] Workspace memberships exist
- [ ] Forms table exists
- [ ] Leads table exists
- [ ] Client form access exists
- [ ] Invitations exist
- [ ] Subscriptions exist
- [ ] Usage counters exist
- [ ] Idempotency keys exist
- [ ] Webhook events exist
- [ ] Foreign keys exist
- [ ] Unique constraints exist
- [ ] Required indexes exist
- [ ] Timestamps exist
- [ ] RLS is enabled
- [ ] RLS policies are tested
- [ ] Form secrets are hashed
- [ ] Invitation tokens are hashed
- [ ] JSONB validation exists
- [ ] Billing state is isolated
- [ ] Cross-tenant access is blocked
- [ ] Client form-level access is enforced
- [ ] Seed data contains no production secrets

---

# 87. Final Database Principle

The Formivo database should be:

> **Relational where relationships matter, flexible where customer data varies, and strict where security matters.**

PostgreSQL provides the relational foundation, JSONB provides flexible lead data, and RLS provides the database-level tenant security required for a serious SaaS product.

The schema should remain intentionally small for V1 while providing a clean foundation for Formivo's future form builder, integrations, automation, AI features, and advanced team functionality.