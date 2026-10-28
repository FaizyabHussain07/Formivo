# FORMIVO
## Complete Product Requirements Document (PRD)

**Version:** 3.0  
**Build type:** Greenfield rebuild  
**Product category:** Developer-first form backend and submission management SaaS  
**Primary domain:** https://formivo.faizyab.me/  
**Primary contact / transactional email identity:** `team@formivo.faizyab.me`  
**Status:** Implementation specification; provider credentials, live product IDs, and final commercial settings must be verified before production.

---

## 1. Executive Summary

Formivo helps developers, freelancers, and agencies add reliable form handling to existing websites without building and maintaining a custom backend for every contact form, lead form, booking inquiry, or client project.

A developer creates a form in Formivo and receives a unique submission endpoint. The developer connects an existing website to that endpoint. Formivo validates and stores submissions, provides a dashboard for reviewing and filtering leads, and offers analytics and notifications. The developer can grant a specific client read-only access to a particular form and its submissions without exposing the developer's workspace, billing information, or unrelated forms.

Formivo must be built as a real, secure SaaS product, not a static UI demo. Every control shown in the interface must either work or be clearly marked as unavailable/not yet implemented. Never invent customer testimonials, usage metrics, analytics, successful payment states, or integration statuses.

### Product promise

**Form handling and client-ready submission management for developers who build websites for other people.**

### Core outcomes

1. Developers can create a form and receive a working endpoint.
2. Website submissions are securely validated, stored, and visible in the dashboard.
3. Developers can filter, inspect, and export submissions according to their plan.
4. Developers can invite a client to see only the specific form(s) shared with them.
5. Authentication, role routing, permissions, billing, usage limits, and email flows are enforced server-side.
6. The product feels polished, fast, responsive, and trustworthy.

---

## 2. Product Principles

- **Security before convenience:** authorization must be enforced on the server and supported by database constraints and Row Level Security (RLS).
- **Real functionality over mock UI:** do not present fake data as real account data.
- **Clear separation of roles:** developers manage workspaces and forms; client viewers see only forms explicitly shared with them.
- **Reliable state transitions:** invitation acceptance and subscription changes must be safe, idempotent, and validated.
- **Minimal, intentional design:** use a restrained design system with strong typography, spacing, and hierarchy.
- **Mobile support:** all core flows must work on narrow screens.
- **Accessible by default:** keyboard navigation, visible focus states, semantic HTML, and accessible form labels.
- **No destructive surprises:** downgrades must not silently delete forms, submissions, or client permissions.
- **Provider truthfulness:** do not report Resend or Lemon Squeezy as configured until the real configuration has been tested.

---

## 3. Users and Roles

### 3.1 Developer

A developer is the primary paying or free-tier customer. They may be a freelancer, agency, indie developer, or website owner.

They can:
- Register and sign in.
- Create and manage their workspace.
- Create, configure, pause, and delete forms subject to confirmation and data-retention rules.
- Copy the form endpoint and integration instructions.
- View, search, filter, inspect, and export submissions according to plan limits.
- View analytics for their own forms.
- Invite a client to a specific form.
- Resend or revoke client invitations/access.
- Manage account settings and billing.
- See usage and plan limits.

They must not access another developer's workspace, forms, submissions, invitations, or billing.

### 3.2 Client viewer

A client viewer is invited by a developer to access one or more specific forms.

They can:
- Accept an invitation addressed to their email.
- Create a Formivo account using that exact invited email, or sign in to an existing account using it.
- View only the forms explicitly shared with their authenticated user account.
- View submissions and permitted analytics for those forms.
- Use available read-only filters and search.
- Manage their own basic account settings and sign out.

They cannot:
- Create or manage workspaces.
- Create, edit, pause, or delete forms.
- See developer billing or workspace settings.
- See forms not shared with them.
- See other clients, invitations, API secrets, or developer-only pages.
- Change their role to developer or grant themselves permissions.

### 3.3 Users with both roles

The data model must allow a user to have both developer and client roles when each role is legitimately obtained. Accepting a client invitation must not overwrite an existing developer role. Role checks must be based on trusted database records, never on client-provided values.

---

## 4. Scope and Non-Goals

### 4.1 MVP scope

- Marketing website and documentation pages.
- Email/password authentication using Supabase Auth.
- Developer workspace and dashboard.
- Form creation and management.
- Public form submission API.
- Submission list, detail view, search, filtering, and CSV export where plan allows.
- Basic analytics based on real stored data.
- Client invitation, acceptance, access, and revocation workflow.
- Client portal with strict form-level access.
- Subscription plans, usage limits, checkout, and verified billing webhooks.
- Transactional email via Resend.
- Security, error handling, automated tests, and deployment readiness.

### 4.2 Not required for the first release unless explicitly approved

- A visual drag-and-drop form builder.
- A full CRM with pipelines, tasks, and deal stages.
- Native mobile apps.
- Team collaboration beyond the defined workspace model.
- Complex custom domains for form endpoints.
- AI-based lead scoring.
- SMS or WhatsApp notifications.
- Unlimited custom integrations.
- Public marketplace or template community.

Do not build speculative features before the core workflow is secure and reliable.

---

## 5. Technology Stack

Use the following stack unless a documented technical blocker requires a justified alternative.

### Application

- Next.js using the App Router.
- TypeScript with strict mode enabled.
- React.
- Tailwind CSS.
- Lucide icons.
- Zod for input validation.
- React Hook Form where it meaningfully simplifies complex forms.
- A consistent, accessible component system; reuse components instead of creating slightly different versions for every page.

### Backend and data

- Supabase Auth.
- Supabase PostgreSQL.
- Supabase Row Level Security (RLS).
- Supabase migrations committed to the repository.
- Server-side route handlers or server actions for privileged operations.
- Database functions/transactions for operations that must be atomic.

### Email

- Resend for transactional messages.
- Sender identity: `team@formivo.faizyab.me`.
- The existence of a sender address does not prove that an inbox exists or that replies can be received.
- Verify domain DNS, sender status, delivery, and error handling before production.

### Billing

- Lemon Squeezy for checkout and subscription lifecycle.
- Use verified webhooks as the source of truth for subscription state.
- Do not trust a browser redirect or success query parameter as proof of payment.

### Deployment and testing

- Vercel deployment.
- Vitest for unit and service-level tests.
- Playwright for end-to-end tests.
- TypeScript checks, linting, and production build must pass in CI.

### Suggested supporting libraries

Choose current compatible versions and commit the lockfile. Do not add dependencies without a reason.

- `@supabase/ssr` for server/client Supabase session integration.
- `@supabase/supabase-js`.
- `zod`.
- `react-hook-form`.
- `lucide-react`.
- Vitest and Testing Library.
- Playwright.

---

## 6. Environment Variables and Configuration

Use environment variables for secrets and environment-specific configuration. Never commit real secrets.

Expected configuration may include:

```env
NEXT_PUBLIC_APP_URL=https://formivo.faizyab.me

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL=team@formivo.faizyab.me

LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_PRO_VARIANT_ID=
LEMONSQUEEZY_AGENCY_VARIANT_ID=

CRON_SECRET=
```

Notes:
- Use only the variables required by the chosen implementation.
- Never expose the Supabase service-role key or Lemon Squeezy API key to browser code.
- Validate required environment variables at startup or at the relevant service boundary.
- Provide an `.env.example` containing empty placeholders and descriptions.
- If a provider is not configured, show an explicit setup state rather than pretending the integration works.
- Product and variant IDs are environment-specific and must be confirmed in the real Lemon Squeezy store.

---

## 7. Design System and Brand Direction

### 7.1 Visual direction

Create a premium, restrained interface inspired by the clarity and craftsmanship of products such as Linear, Vercel, Stripe, Notion, and Apple, without copying their layouts or identity.

Formivo should feel like a serious tool for developers and agencies. Prefer editorial typography, clean surfaces, precise spacing, strong information hierarchy, and subtle interactions.

Avoid:
- Generic AI-generated SaaS aesthetics.
- Large decorative gradients across every page.
- Excessively rounded cards and pill-shaped controls everywhere.
- Random illustrations that do not explain functionality.
- Emoji used as interface icons.
- Excessive motion, parallax, or animated backgrounds.
- Fake charts, testimonials, customer logos, user counts, or revenue claims.
- Placeholder buttons that look functional but do nothing.

### 7.2 Light theme tokens

Use these as the initial design tokens:

| Token | Value | Usage |
|---|---|---|
| Background | `#F8FAFC` | App/page background |
| Surface | `#FFFFFF` | Cards, menus, panels |
| Secondary surface | `#F1F5F9` | Muted areas and table headers |
| Primary text | `#0F172A` | Headings and main content |
| Secondary text | `#475569` | Body copy |
| Muted text | `#64748B` | Helper text and metadata |
| Border | `#E2E8F0` | Dividers, borders, inputs |
| Accent | `#0F766E` | Primary actions and links |
| Accent hover | `#115E59` | Hover/focus states |
| Subtle accent | `#CCFBF1` | Selected states and low-emphasis highlights |
| Success | `#15803D` | Success states |
| Warning | `#B45309` | Warnings |
| Error | `#B91C1C` | Errors and destructive states |

Create semantic CSS variables rather than repeating hex codes throughout components.

### 7.3 Component behavior

- Buttons need default, hover, focus, disabled, and loading states.
- Inputs need labels, helper text, validation errors, and visible focus.
- Destructive actions require clear wording and confirmation where appropriate.
- Tables need empty, loading, error, and populated states.
- Dialogs must support keyboard navigation and proper focus management.
- Toasts must not be the only way to communicate critical errors.
- Use consistent date, number, and currency formatting.

### 7.4 Responsive behavior

- Desktop dashboard: persistent sidebar where appropriate and clear content width.
- Tablet: collapse navigation sensibly.
- Mobile: compact navigation, readable tables or mobile list layouts, usable dialogs, and no horizontal overflow.
- Test at approximately 360px, 390px, 768px, 1024px, and wide desktop widths.

---

## 8. Application Architecture

Use a modular architecture with clear boundaries between UI, domain logic, data access, and provider integrations.

Suggested structure:

```text
src/
  app/
    (marketing)/
      page.tsx
      pricing/
      docs/
      contact/
      privacy/
      terms/
    (auth)/
      login/
      register/
      forgot-password/
      reset-password/
      verify-email/
    (developer)/
      dashboard/
      forms/
      submissions/
      analytics/
      clients/
      billing/
      settings/
    (client)/
      client/
        page.tsx
        forms/
        settings/
    invite/
      [token]/
    api/
      f/
        [formId]/
      webhooks/
        lemonsqueezy/
  components/
    ui/
    marketing/
    dashboard/
    forms/
    submissions/
    clients/
    billing/
  lib/
    auth/
    authorization/
    db/
    validation/
    email/
    billing/
    rate-limit/
    analytics/
    config/
  services/
    forms/
    submissions/
    invitations/
    subscriptions/
    usage/
  types/
  tests/
supabase/
  migrations/
  seed.sql
```

This is a suggested starting point, not a requirement to force every component into this exact structure. Keep modules cohesive and avoid one giant file containing all application logic.

### Architecture rules

1. Keep privileged database access on the server.
2. Use shared validation schemas for server inputs and, where appropriate, client-side form validation.
3. Separate authorization decisions from presentation.
4. Use database transactions for multi-record state changes that must succeed or fail together.
5. Use typed service functions for core domain operations.
6. Do not duplicate subscription-limit logic across unrelated pages.
7. Log security-relevant events without logging passwords, full invitation tokens, or sensitive submission contents.
8. Use a consistent error model that does not leak secrets or internal stack traces to users.

---

## 9. Data Model

Design the schema carefully before building dashboard pages. Commit all schema changes as Supabase migrations. Add appropriate foreign keys, unique constraints, indexes, timestamps, and RLS policies.

The following is a logical model. Adapt exact SQL types and column names where necessary, but preserve the security and behavioral requirements.

### 9.1 `profiles`

Stores basic user-facing profile information.

Suggested fields:
- `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- `display_name TEXT`
- `avatar_url TEXT NULL`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Do not duplicate authentication secrets in this table.

### 9.2 `account_roles`

Stores roles separately from user-editable profile fields.

Suggested fields:
- `id UUID PRIMARY KEY`
- `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
- `role TEXT CHECK (role IN ('developer', 'client'))`
- `created_at TIMESTAMPTZ`
- Unique constraint on `(user_id, role)`

Rules:
- A user may have both roles if legitimately granted.
- Role assignment must be performed only by trusted server-side logic or controlled database functions.
- Users must never be able to promote themselves by editing a profile field or submitting a role in a request.

### 9.3 `workspaces`

Represents the developer's workspace.

Suggested fields:
- `id UUID PRIMARY KEY`
- `owner_user_id UUID REFERENCES auth.users(id)`
- `name TEXT NOT NULL`
- `slug TEXT UNIQUE`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

The MVP can use one workspace per developer if that keeps the first release simpler. If multi-member workspaces are supported, add a dedicated membership table and enforce membership checks consistently.

### 9.4 `workspace_members` (optional for MVP)

Use only if workspace collaboration is part of the release.

Suggested fields:
- `id UUID PRIMARY KEY`
- `workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE`
- `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
- `role TEXT`
- `created_at TIMESTAMPTZ`
- Unique constraint on `(workspace_id, user_id)`

Do not implement a partially supported membership model. If not included, document that the owner is the only developer with workspace access.

### 9.5 `forms`

Stores form configuration and ownership.

Suggested fields:
- `id UUID PRIMARY KEY`
- `workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE`
- `name TEXT NOT NULL`
- `description TEXT NULL`
- `status TEXT CHECK (status IN ('active', 'paused'))`
- `allowed_origin_list JSONB NULL` or a normalized origin table if appropriate
- `notification_email TEXT NULL`
- `settings JSONB NOT NULL DEFAULT '{}'`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`
- `deleted_at TIMESTAMPTZ NULL` if soft deletion is used

Rules:
- Every form belongs to exactly one workspace.
- The workspace must be derived from the form's trusted database relationship.
- Do not trust a client-supplied `workspace_id` when accepting submissions, creating permissions, or accepting invitations.
- Paused forms must reject new submissions with a clear response.
- Form deletion behavior must be explicit and must not silently destroy unrelated records.

### 9.6 `submissions`

Stores submitted form data.

Suggested fields:
- `id UUID PRIMARY KEY`
- `form_id UUID REFERENCES forms(id) ON DELETE CASCADE` or an intentional retention-safe deletion strategy
- `data JSONB NOT NULL`
- `status TEXT` with a small documented set such as `new`, `read`, `archived`
- `source_origin TEXT NULL`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`
- Optional abuse-prevention metadata, minimized and retained only as justified

Rules:
- Validate request size, field count, and JSON shape.
- Never allow public callers to write arbitrary `form_id`, owner, role, workspace, or billing fields into trusted columns.
- Do not log entire submission bodies by default.
- Apply the correct retention policy and plan-based history rules.
- Protect sensitive fields from unintended display or export where appropriate.

### 9.7 `client_invitations`

Represents an invitation sent for a particular form.

Suggested fields:
- `id UUID PRIMARY KEY`
- `form_id UUID REFERENCES forms(id) ON DELETE CASCADE`
- `invited_email TEXT NOT NULL`
- `token_hash TEXT UNIQUE NOT NULL`
- `status TEXT CHECK (status IN ('pending', 'accepted', 'revoked', 'expired'))`
- `invited_by_user_id UUID REFERENCES auth.users(id)`
- `expires_at TIMESTAMPTZ NOT NULL`
- `accepted_by_user_id UUID REFERENCES auth.users(id) NULL`
- `accepted_at TIMESTAMPTZ NULL`
- `revoked_at TIMESTAMPTZ NULL`
- `created_at TIMESTAMPTZ`

Requirements:
- Generate a cryptographically secure, unpredictable invitation token.
- Store only a hash of the raw token in the database.
- Email the raw token only as part of the invitation URL.
- Enforce expiry, status, invited-email matching, and form ownership.
- Prevent invalid, expired, revoked, or already-consumed tokens from granting access.
- A resend may create a fresh token and invalidate the old one, or follow another explicit, tested policy.
- Avoid duplicate active pending invitations for the same form and email where possible.

### 9.8 `form_client_permissions`

Represents active client access to a form.

Suggested fields:
- `id UUID PRIMARY KEY`
- `form_id UUID REFERENCES forms(id) ON DELETE CASCADE`
- `client_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
- `invitation_id UUID REFERENCES client_invitations(id)`
- `granted_at TIMESTAMPTZ`
- `revoked_at TIMESTAMPTZ NULL`
- `created_at TIMESTAMPTZ`

Requirements:
- Authorization is based on authenticated `client_user_id`, not email alone.
- Only active permissions grant access.
- A form may have at most one active client account with preview access at a time.
- Different forms may have different clients.
- The same client may have access to multiple forms if each permission was explicitly granted.
- Use a database constraint or transaction-safe mechanism to enforce at most one active permission per form. If using a partial unique index, ensure it covers active, non-revoked records.
- Revocation must immediately block future server-side requests.

### 9.9 `subscriptions`

Stores normalized subscription state based on verified billing provider events.

Suggested fields:
- `id UUID PRIMARY KEY`
- `workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE`
- `provider TEXT NOT NULL DEFAULT 'lemonsqueezy'`
- `provider_customer_id TEXT NULL`
- `provider_subscription_id TEXT UNIQUE NULL`
- `plan_key TEXT NOT NULL`
- `status TEXT NOT NULL`
- `current_period_start TIMESTAMPTZ NULL`
- `current_period_end TIMESTAMPTZ NULL`
- `cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Do not infer paid status from the browser redirect. Update this table only through trusted server-side operations after validating provider responses or webhook signatures.

### 9.10 `usage_periods`

Tracks usage for defined billing periods.

Suggested fields:
- `id UUID PRIMARY KEY`
- `workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE`
- `period_start TIMESTAMPTZ NOT NULL`
- `period_end TIMESTAMPTZ NOT NULL`
- `submission_count INTEGER NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`
- Unique constraint on `(workspace_id, period_start, period_end)`

Usage increments must be concurrency-safe. Do not rely on a client-side counter.

### 9.11 `webhook_events` (strongly recommended)

Stores processed provider webhook identifiers to prevent duplicate processing.

Suggested fields:
- `id UUID PRIMARY KEY`
- `provider TEXT NOT NULL`
- `provider_event_id TEXT NOT NULL`
- `event_type TEXT NOT NULL`
- `processed_at TIMESTAMPTZ NULL`
- `created_at TIMESTAMPTZ`
- Unique constraint on `(provider, provider_event_id)`

### 9.12 `audit_logs` (recommended)

Use for security-relevant actions such as invitation creation, acceptance, revocation, subscription changes, and destructive actions. Keep logs minimal and never include raw tokens, passwords, or unnecessary submission content.

### 9.13 `form_events` (optional)

If richer analytics are required, use a small event table with documented event types and privacy limits. Do not build analytics on fabricated or client-editable event counts.

---

## 10. Authentication and Routing

Use Supabase Auth with secure session handling appropriate for Next.js App Router. Protect routes on the server, not only with client-side redirects.

### Required auth pages

- Register
- Login
- Forgot password
- Reset password
- Email verification or confirmation handling
- Sign out

### Registration behavior

1. User submits a valid email and password.
2. Validate input and apply reasonable abuse protections.
3. Create the Supabase Auth account.
4. Create or initialize the profile and the intended role using trusted logic.
5. For a normal new signup, assign the developer role and create the initial workspace according to the product's onboarding flow.
6. If the signup originated from a client invitation, do **not** create a developer workspace or run developer onboarding. Preserve invitation context and continue through the client acceptance workflow.
7. Handle email verification and session state correctly.
8. Show clear loading, error, and success states.

### Login behavior

After authentication, route based on trusted role and context:
- If the user is completing a valid invitation, return them to that invitation flow.
- If the user has developer access and is not in an invitation flow, route to the developer dashboard.
- If the user is only a client, route to the client portal.
- If the user has both roles, use explicit context or a clear role-selection mechanism. Do not unexpectedly remove either role.
- If the account has no valid role, use a safe recovery/onboarding route rather than trusting a URL parameter to grant access.

### Route protection

Every protected page and data request must perform server-side authentication and authorization. Middleware may improve navigation but is not a substitute for checks in route handlers, server actions, service functions, and database policies.

Never trust a `role`, `user_id`, `workspace_id`, `client_user_id`, `plan`, or permission value submitted by the browser.

---

## 11. Developer Onboarding

After a normal developer signup:

1. Complete required email verification if enabled.
2. Create or load the developer's workspace.
3. Ask for a workspace or display name only if needed.
4. Present a concise dashboard onboarding state.
5. Encourage the user to create their first form.
6. Explain how to connect a website to the endpoint.
7. Do not show fabricated submissions or invented usage metrics.

A returning developer should go directly to the dashboard rather than repeating onboarding.

---

## 12. Developer Dashboard Pages

### 12.1 Overview / Dashboard

Purpose: give developers a quick, accurate view of their workspace.

Display:
- Total forms.
- Submissions during the current usage period.
- Remaining submissions or current plan usage.
- Recent submissions from the developer's forms.
- Forms with recent activity.
- Clear empty state and call to create a form.

Rules:
- All numbers must come from real database queries.
- Respect workspace ownership and access controls.
- Define the time window for every metric.
- Do not render fake charts or example activity as if it belonged to the current user.

### 12.2 Forms list

Display:
- Form name.
- Status.
- Submission count.
- Created date.
- Last submission date where available.
- Actions to open, configure, pause/resume, or delete a form.

Features:
- Search and pagination when appropriate.
- Empty state.
- Loading and error states.
- Create form CTA.
- Plan-limit messaging when the form limit is reached.

### 12.3 Create form

Required inputs:
- Form name.
- Optional description.
- Optional notification email.
- Optional allowed origins or domain restrictions, if supported in MVP.

On creation:
- Validate all fields server-side.
- Derive the workspace from the authenticated developer's trusted membership/ownership.
- Enforce the plan's form limit transaction-safely.
- Create a unique, unguessable or sufficiently non-enumerable form ID.
- Set initial status to active.
- Show the endpoint and integration instructions.

Do not let the client choose an arbitrary workspace ID to create a form in.

### 12.4 Form detail / settings

Display:
- Form name and status.
- Endpoint.
- Copy endpoint action.
- Integration instructions.
- Submission count and recent activity.
- Notification settings.
- Allowed origins settings if implemented.
- Client access status.
- Pause/resume action.
- Delete action with confirmation.

Every displayed setting must persist and affect behavior. If a feature is not implemented, omit it or mark it clearly as coming soon.

### 12.5 Submissions list

Features:
- Paginated list.
- Search across supported fields where practical.
- Filters by date, status, and form.
- Sort by submission date.
- Read/unread or status updates if included.
- CSV export where the plan permits it.
- Empty, loading, and error states.

Requirements:
- Ensure every query is scoped to forms in the authenticated developer's workspace.
- Enforce export limits and plan restrictions server-side.
- Avoid exposing submission content in URL query strings.
- Use safe rendering for user-submitted strings to prevent cross-site scripting.
- Avoid fetching every submission into the browser just to implement pagination or search.

### 12.6 Submission detail

Display:
- Submission timestamp.
- Form identity.
- Submitted fields in a readable key/value layout.
- Relevant metadata that is safe and useful.
- Status controls if supported.

Requirements:
- Treat every field value as untrusted text.
- Never execute HTML supplied in submissions.
- Do not expose internal security metadata unnecessarily.
- Confirm access to the parent form before returning the submission.

### 12.7 Analytics

Start with simple, accurate analytics:
- Total submissions.
- Submissions over time.
- Recent submission activity.
- Per-form submission counts.
- Usage against the current plan.

Analytics must be computed from actual records or reliable aggregated events. Define date ranges and timezone behavior. Handle empty data honestly. Do not show a chart with made-up values to fill space.

### 12.8 Client Access

The developer's Client Access page is the control center for invitations and form-level client permissions.

Display:
- Client email.
- Form name.
- Invitation/access status.
- Invitation sent date.
- Accepted date where available.
- Expiry where relevant.
- Actions: invite client, resend invitation, revoke invitation/access, and open the related form.

The developer must be able to understand which client has access to which form. Do not show client passwords, authentication tokens, or private client portal credentials. Do not rely on a special portal URL as authorization; the client's authenticated session and permission records determine access.

Rules:
- A form may have at most one active client account with preview access at a time.
- Different forms can be shared with different clients.
- A single client may be granted access to multiple forms through separate explicit invitations/permissions.
- Enforce plan-based unique client viewer limits on the server.
- Count a client account once per workspace if it has at least one active permission in that workspace, even if the client has access to several forms.
- When the current plan's viewer limit is reached, explain the limit and provide a billing path without silently granting access.

### 12.9 Billing

Display:
- Current plan.
- Usage this billing period.
- Plan comparison.
- Upgrade/downgrade or manage subscription actions as supported.
- Subscription status and renewal/cancellation information from verified provider state.
- Clear explanation of what happens to data when downgrading.

Requirements:
- Do not mark a subscription paid because the user landed on a success page.
- Verify webhooks.
- Make webhook processing idempotent.
- Enforce plan limits server-side.
- If billing configuration is missing, show a setup/unavailable state.
- Never delete forms, submissions, or client access data solely because a user downgrades.

### 12.10 Settings

Include only real settings, such as:
- Display name.
- Account email display and verification status.
- Password reset/change flow through Supabase Auth.
- Workspace name if supported.
- Notification preferences if implemented.
- Sign out.

Do not expose role assignment controls to ordinary users.

---

## 13. Client Invitation and Access Workflow

This is a critical workflow. Implement and test it before polishing secondary dashboard features.

### 13.1 Developer creates invitation

1. Developer opens the intended form.
2. Developer selects **Invite client**.
3. Developer enters the client's email.
4. Server validates the email and confirms that the authenticated developer owns or is authorized to manage the form.
5. Server derives the workspace from the trusted relation `form_id -> forms.workspace_id`. Do not trust a workspace ID submitted by the browser.
6. Server checks whether the form already has an active client permission.
7. Server checks plan limits for unique client accounts.
8. Server generates a secure random token, stores only its hash, and creates a pending invitation with an expiry.
9. Server sends the invitation email through Resend.
10. UI displays a truthful result. If email delivery fails, do not falsely report that the email was sent. Keep the invitation in a recoverable state and allow retry.

### 13.2 Invitation email

The email should include:
- Formivo branding.
- The developer/workspace or form context, using safe display values.
- The invited email.
- A clear **Accept invitation** button.
- Expiry information.
- A note that the invitation is intended for the addressed email.
- A support/contact address using `team@formivo.faizyab.me`.

Do not include submission data, secrets, or a long-lived reusable credential in the email.

### 13.3 Client opens invitation

The invitation URL should carry a secure token. The invitation page must validate the token server-side and show a safe summary:
- Which form or project the invitation is for.
- The email address invited.
- Whether the invitation is valid, expired, already accepted, or revoked.
- A clear next action.

Do not reveal private form submissions before the invited user has authenticated and accepted the invitation.

### 13.4 New client account

If the invited email does not have an account:

1. Preserve the invitation context through registration and any email-verification step.
2. Let the client create an account using the exact invited email.
3. Require email verification when configured.
4. After authentication, validate the invitation again on the server.
5. Compare the authenticated user's verified email to the invitation email using a consistent normalized comparison.
6. Atomically accept the invitation, grant the client role, and create the form permission.
7. Do not create a developer workspace.
8. Do not show developer onboarding or the developer dashboard.
9. Route the client directly to the client portal for the shared form.

### 13.5 Existing client account

If an account already exists:
1. Ask the user to sign in using the invited email.
2. Preserve the invitation context after login.
3. Validate that the authenticated user's verified email matches the invitation email.
4. Validate token status, expiry, form ownership, and the form's active-client constraint again.
5. Atomically accept the invitation and activate the permission.
6. Route the client to the client portal.

An existing developer account may also accept a client invitation. Preserve their developer role; add the client role if needed.

### 13.6 Atomic invitation acceptance

Acceptance must be transaction-safe and idempotent.

Within a transaction or trusted database function:
- Lock or otherwise safely serialize the relevant invitation/form state.
- Confirm invitation is pending and not expired/revoked.
- Confirm authenticated user and email match the invitation.
- Confirm the form still exists and is eligible for sharing.
- Confirm no conflicting active client permission exists for the form.
- Create the client role if missing.
- Create the form-client permission.
- Mark the invitation accepted and record the accepting user/time.
- Commit all changes together.

If any condition fails, do not partially grant access. Return a safe, understandable error.

### 13.7 Client portal

The client portal should be a distinct experience, not a developer dashboard with hidden menu items.

Client portal pages:
- Client home listing shared forms.
- Shared form detail.
- Submissions list for that form.
- Submission detail if allowed.
- Basic account settings.
- Sign out.

The client sees only forms with active permissions linked to their authenticated user ID. Never fetch all workspace forms and hide unauthorized ones only in the UI.

Client viewers must not see:
- Workspace creation or workspace management.
- Developer billing.
- Developer-only settings.
- Unshared forms.
- Client lists or invitation management.
- API keys or private endpoint configuration unless explicitly required and safe.
- Any URL or API response that exposes data for another client.

### 13.8 Returning client login

When a client later visits Formivo and signs in normally:
- If they have only the client role, route them to the client portal.
- If they also have a developer role, use explicit context or a role-selection mechanism.
- Never require them to accept the original invitation again if the permission is already active.
- Recheck active permissions every time protected client data is requested.

### 13.9 Revocation

When the developer revokes access:
- Mark the permission revoked or otherwise invalidate it immediately.
- Revoke or invalidate relevant pending invitations when appropriate.
- All future server-side requests must deny access.
- Existing browser pages must not continue to retrieve data from cached, unprotected endpoints.
- Client portal lists should no longer show the revoked form after refresh.
- Record an audit event where audit logging is enabled.

### 13.10 One active client per form

Enforce the rule in the database and server transaction logic, not only in the UI. A form may have at most one active client account with preview access at a time. If a different client needs access, the developer must revoke the current permission before granting the new one, unless an explicitly approved product change revises this rule.

---

## 14. Public Form Submission API

### 14.1 Endpoint

```http
POST https://formivo.faizyab.me/api/f/{formId}
Content-Type: application/json
```

Example request:

```json
{
  "name": "Ayesha",
  "email": "ayesha@example.com",
  "message": "Please contact me about a project."
}
```

The example is illustrative only. The endpoint must accept the fields permitted by the form's configuration and validation policy.

### 14.2 Request handling

1. Validate the form ID and request method.
2. Find the form and verify that it exists and is active.
3. Apply rate limits and request-size limits.
4. Validate content type and JSON parsing.
5. Validate payload shape, field count, key length, and value size.
6. Apply configured origin restrictions where supported.
7. Enforce the workspace's current submission allowance with concurrency-safe usage accounting.
8. Store the submission using trusted server-side values.
9. Trigger notification email only when configured and safe to do so.
10. Return a consistent JSON response and suitable HTTP status.

### 14.3 Security and abuse controls

- Rate-limit by form and suitable request metadata.
- Avoid treating the browser's `Origin` header as complete authentication; it is not a secret and can be forged by non-browser clients.
- If origin restrictions are implemented, document their limits and apply them as one abuse-control layer.
- Add reasonable request body limits.
- Reject malformed JSON and unsupported content types with clear errors.
- Protect against automated spam using appropriate low-friction controls when necessary.
- Do not reveal internal database errors or secrets.
- Do not accept workspace ownership, billing plan, usage count, role, or permission from the public request.
- Do not trust `formId` as proof that the caller is allowed to read submissions.
- Do not expose stored submissions through the public submission endpoint.

### 14.4 Response format

Use a consistent response shape, for example:

Success:

```json
{
  "success": true,
  "message": "Submission received."
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "FORM_PAUSED",
    "message": "This form is not accepting submissions."
  }
}
```

Possible status codes:
- `200` or `201`: submission accepted.
- `400`: invalid request body.
- `404`: form not found, using a safe non-leaky response.
- `409`: form is paused or a defined conflict occurred.
- `413`: payload too large.
- `415`: unsupported media type.
- `429`: rate limit or usage limit exceeded.
- `500`: generic server failure.

Document the exact response behavior and keep it stable.

### 14.5 Usage accounting

- Count accepted submissions, not malformed requests rejected before acceptance.
- Define whether spam-rejected submissions count; document and test the policy.
- Use a database transaction or atomic RPC to ensure the usage limit cannot be bypassed by simultaneous requests.
- Ensure one accepted submission cannot increment the counter twice due to retry logic.
- Reset or roll over usage periods according to the verified subscription period or a clearly documented monthly period.
- Avoid silent data loss when a plan limit is reached.

---

## 15. Notifications and Transactional Email

Use Resend for:
- Client invitations.
- Optional new-submission notifications.
- Important account messages only if supported and appropriate.

### Requirements

- Use a consistent, responsive HTML email template and a plain-text alternative.
- Use the configured sender identity `team@formivo.faizyab.me` only after the domain/sender is verified.
- Escape user-controlled values included in email templates.
- Do not send the entire submission payload in an email by default; provide a secure dashboard link instead.
- Handle provider errors and timeouts.
- Record enough status to support retries without leaking secrets.
- Avoid duplicate notifications when retrying a request.
- Never claim an email was sent if the provider call failed.
- Do not confuse sending email with receiving replies. Inbound email requires separate inbox/receiving configuration.

### Invitation email delivery state

The application should distinguish between:
- Invitation created.
- Email queued/sending.
- Provider accepted the email.
- Email delivery failed where known.
- Invitation accepted.
- Invitation expired or revoked.

Do not equate provider acceptance with guaranteed inbox delivery.

---

## 16. Plans, Pricing, and Usage Limits

These are proposed defaults and must be configurable. Confirm final prices, currency display, taxes, and Lemon Squeezy variants before production.

| Feature | Free | Pro | Agency |
|---|---:|---:|---:|
| Price | $0 | $12/month | $29/month |
| Forms per workspace | 3 | 10 | 50 |
| Submissions per usage period | 100 | 2,000 | 10,000 |
| Unique client viewers | 3 | 10 | 25 |
| Analytics | Basic | Advanced | Advanced |
| Search and filters | Basic | Advanced | Advanced |
| CSV export | Define final policy; recommended limited/basic | Yes | Yes |
| Submission history | 30 days | Up to 12 months | Up to 12 months |

### Plan enforcement rules

- Enforce all limits server-side.
- Do not trust plan names or limits sent by the browser.
- Centralize plan definitions in one typed module or database-backed configuration.
- Keep UI limit indicators in sync with server-side enforcement.
- Explain what happens when a limit is reached.
- Do not delete data on downgrade.
- Preserve forms and submissions when a paid subscription expires.
- Restrict creation or new intake according to the documented plan policy, not through accidental data deletion.
- Define exactly how history retention works and how old records are handled. Prefer a transparent retention policy over silent deletion.
- Define whether the client-viewer cap is per workspace or account; for this PRD it is per workspace and counts unique client accounts with at least one active permission in that workspace.
- Count the same client only once within a workspace even when multiple forms are shared with them.

### Suggested behavior at limit

- **Form limit:** prevent creation of additional forms and show upgrade options.
- **Submission limit:** return a documented limit response; show the developer a clear usage state and upgrade path.
- **Client-viewer limit:** prevent new access grants until the user upgrades or revokes an existing permission.
- **CSV export:** reject unauthorized or plan-restricted exports server-side.
- **History limit:** show the policy clearly and never imply that hidden/expired data remains available if it has been deleted under an approved retention policy.

---

## 17. Lemon Squeezy Billing Integration

### Checkout

1. Authenticated developer chooses a plan.
2. Server validates the requested plan and current workspace.
3. Server creates a checkout using trusted server configuration and provider API.
4. The checkout is associated with the correct workspace/customer where supported.
5. The browser is redirected to the provider's hosted checkout.
6. Return URL shows a pending/processing state until the application confirms subscription state from a trusted source.

### Webhook processing

- Verify the webhook signature using the configured secret and provider-documented method.
- Validate event structure.
- Record provider event IDs to prevent duplicate processing.
- Process events idempotently.
- Map provider variant IDs to internal plan keys using server-side configuration.
- Update normalized subscription state only after verification.
- Handle duplicate, delayed, and out-of-order events safely.
- Return appropriate HTTP status codes.
- Log failures without recording secrets or unnecessary personal data.

### Subscription lifecycle

Support the provider events and states required for:
- Subscription created/activated.
- Renewal/payment success.
- Payment failure or past-due state if applicable.
- Cancellation.
- Expiration.
- Plan change.
- Refund or other relevant status changes where the provider supports them.

Define the application's access policy for each state. Never grant a paid tier solely because a checkout redirect occurred.

### Billing failure and missing configuration

- If provider credentials or product IDs are missing, do not expose a broken checkout button.
- Show a truthful setup state or disable the action.
- Include a setup checklist in developer documentation or internal notes.
- Test the integration in the provider's test mode before live payments.

---

## 18. Marketing Website and Public Pages

### 18.1 Homepage

Communicate:
- What Formivo does.
- Who it is for.
- How the workflow works.
- Core benefits: endpoint, submissions dashboard, client access, and simple integrations.
- Pricing.
- Documentation entry point.
- Primary call to action to get started.
- Secondary call to action to read docs or view the workflow.

Use real product screenshots only when available. If using illustrative product visuals, label them as product UI rather than fabricated customer evidence.

### 18.2 Pricing

- Display plan features and limits accurately.
- Show billing cadence and currency clearly.
- Explain which features are gated.
- Do not advertise an integration or limit that the backend does not enforce.
- Include an upgrade CTA connected to actual checkout only when billing is configured.

### 18.3 Documentation

Documentation should explain:
- Creating a form.
- Submitting data with `fetch`.
- HTML form integration if supported.
- Request format and field constraints.
- Response format and common errors.
- Usage limits.
- CORS/origin behavior.
- Notifications.
- Submission dashboard.
- Client access invitations.
- Security and privacy considerations.

Example JavaScript integration:

```js
async function submitContactForm(formData) {
  const response = await fetch("https://formivo.faizyab.me/api/f/YOUR_FORM_ID", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error?.message ?? "Unable to submit the form.");
  }

  return result;
}
```

Replace `YOUR_FORM_ID` with the actual form ID shown in the dashboard. Do not publish a fake production form ID.

### 18.4 Contact

Use `team@formivo.faizyab.me` as the displayed contact address where appropriate, while avoiding claims that replies will be received unless an inbox is configured.

### 18.5 Privacy and terms

Provide real, reviewed policies appropriate to the actual product behavior and jurisdiction. Do not copy generic legal text and claim that it has been legally reviewed. Clearly document what data is collected, why it is collected, retention, processors, user rights, and contact details.

---

## 19. Security Requirements

Security is a release blocker, not a later enhancement.

### Authentication and authorization

- Verify user sessions server-side.
- Enforce workspace ownership/membership for developer routes and operations.
- Enforce form-level permissions for client routes and data.
- Use auth user IDs for permissions, not email-only checks.
- Do not expose service-role credentials to the browser.
- Never allow users to self-assign developer or client roles.
- Re-check permissions on every sensitive server request.
- Protect against insecure direct object reference (IDOR) vulnerabilities.
- Ensure every query is scoped before returning data.

### Database

- Enable RLS on all user-related tables.
- Write explicit RLS policies for select, insert, update, and delete operations.
- Test policies using separate user accounts and roles.
- Do not assume that RLS is effective merely because it is enabled; verify each policy.
- Ensure server-side service-role operations perform their own authorization checks.
- Use foreign keys and constraints to prevent invalid states.
- Use transaction-safe functions for invitation acceptance, active-permission limits, and usage accounting.

### Invitation security

- Use cryptographically secure tokens.
- Store token hashes only.
- Set expiry.
- Match the authenticated verified email to the invited email.
- Prevent replay and conflicting acceptance.
- Revoke access immediately.
- Do not put raw tokens in logs or analytics.
- Do not grant access just because an account with the invited email exists.

### Submission security

- Validate payload size and shape.
- Escape untrusted content at render time.
- Apply abuse protections and rate limits.
- Avoid exposing submission data through public endpoints.
- Avoid leaking whether unrelated private forms exist.
- Do not trust `Origin` as authentication.
- Avoid logging sensitive submission data.
- Use safe error responses.

### Billing security

- Verify webhook signatures.
- Make webhook processing idempotent.
- Derive plans from trusted provider configuration.
- Do not trust checkout query parameters.
- Protect billing actions from cross-user access.

### General application security

- Use secure cookie/session practices supported by the framework.
- Protect state-changing operations against CSRF where applicable to the chosen auth architecture.
- Apply sensible security headers.
- Validate and sanitize user-controlled input.
- Avoid unsafe HTML rendering.
- Keep dependencies updated.
- Never log passwords, API keys, service-role keys, raw invitation tokens, or webhook secrets.
- Do not include secrets in client bundles, source maps, or error responses.
- Add monitoring for unexpected failures and suspicious usage.

---

## 20. Error, Loading, and Empty States

Every major page must handle:
- Initial loading.
- Empty state.
- Permission denied.
- Missing/deleted record.
- Network/provider failure.
- Validation error.
- Unexpected server error.
- Rate or plan limit.
- Expired/revoked invitation.
- Unverified email where required.

Messages should explain the problem and a practical next step without leaking sensitive information.

Do not leave buttons that silently do nothing. If a feature is not ready, remove the control or mark it clearly as unavailable.

---

## 21. Accessibility and Quality

- Use semantic landmarks and heading hierarchy.
- Associate labels with all form fields.
- Support keyboard-only navigation.
- Keep focus indicators visible.
- Ensure modal focus behavior is correct.
- Use adequate contrast.
- Use accessible names for icon-only buttons.
- Announce important async errors and success messages to assistive technology.
- Respect reduced-motion preferences.
- Avoid relying on color alone to communicate status.
- Add alt text to meaningful images and empty alt attributes to decorative images.

---

## 22. Testing Strategy

Automated tests are required for security-sensitive logic and primary user journeys.

### 22.1 Unit tests

Test:
- Plan-limit calculations.
- Plan configuration and feature gates.
- Email normalization and comparison.
- Invitation token hashing/validation.
- Invitation status transitions.
- Subscription-to-plan mapping.
- Usage-period calculations.
- Submission payload validation.
- Response serialization and error mapping.

### 22.2 Database and authorization tests

Use separate test users to verify:
- Developer A cannot read Developer B's forms.
- Developer A cannot read Developer B's submissions.
- Client A cannot read an unshared form.
- Client A cannot read Client B's shared form.
- Client cannot read workspace billing or developer settings.
- A revoked client cannot read submissions after revocation.
- A user cannot self-promote through profile updates.
- Invalid or expired invitations cannot grant access.
- Two concurrent invitation acceptances cannot violate the one-active-client-per-form rule.
- A client invitation does not create a developer workspace.
- A client who is also a developer retains both roles.
- Usage limits cannot be bypassed by concurrent submissions.
- A client viewer limit cannot be bypassed by concurrent invitation acceptance.

### 22.3 API tests

Test:
- Valid submission.
- Malformed JSON.
- Missing or incorrect content type.
- Unknown form ID.
- Paused form.
- Oversized body.
- Rate limit.
- Usage limit.
- Origin restrictions if implemented.
- Provider notification failure.
- Safe error response when the database fails.

### 22.4 Billing tests

Test:
- Valid webhook signature.
- Invalid signature.
- Duplicate webhook.
- Out-of-order webhook.
- Unknown variant ID.
- Subscription activation.
- Cancellation/expiration.
- Checkout return without a verified webhook.
- Missing billing configuration.
- Downgrade without data deletion.

### 22.5 End-to-end tests

At minimum, automate these journeys:

**Developer journey**
1. Register.
2. Complete required verification.
3. Create/load workspace.
4. Create form.
5. Copy endpoint/integration details.
6. Submit a test payload.
7. View the submission.
8. Inspect analytics.
9. Open client access.
10. Invite a client.

**New client journey**
1. Open invitation.
2. Register with invited email.
3. Complete verification if required.
4. Accept invitation.
5. Land in client portal.
6. View the shared form and submissions.
7. Attempt to access an unshared form and be denied.
8. Sign out and sign back in.
9. Confirm routing returns to client portal.

**Existing client journey**
1. Sign in with the invited email.
2. Return to the invitation context.
3. Accept invitation.
4. Access the shared form.
5. Confirm unrelated data remains inaccessible.

**Revocation journey**
1. Developer revokes client access.
2. Client refreshes the portal or requests the endpoint directly.
3. Access is denied and the form is no longer listed.

**Billing journey**
1. Start checkout in test mode.
2. Confirm the browser redirect alone does not activate paid features.
3. Deliver a valid test webhook.
4. Confirm the correct plan is activated.
5. Deliver the same webhook twice and confirm no duplicate effects.

### 22.6 Quality gates

Before declaring a phase complete:
- TypeScript check passes.
- Lint passes.
- Unit tests pass.
- Relevant integration/E2E tests pass.
- Production build succeeds.
- No secrets are committed.
- No broken links or obviously nonfunctional controls remain.
- Known limitations are documented honestly.

---

## 23. Implementation Phases

Build in controlled phases. Do not attempt to generate the entire application in one unreviewed pass.

### Phase 1: Foundation

Deliver:
- New Next.js App Router project with TypeScript and Tailwind.
- Strict TypeScript configuration.
- Linting and formatting conventions.
- Base layout and semantic design tokens.
- Shared accessible UI primitives.
- Responsive shell and route structure.
- Environment validation and `.env.example`.
- Test setup.
- README with setup and run instructions.

Verify:
- Install succeeds.
- Development server starts.
- TypeScript and lint checks pass.
- Production build passes.
- No provider secrets are required just to load the public shell.

### Phase 2: Database and security foundation

Deliver:
- Supabase schema migrations.
- Foreign keys, indexes, unique constraints, and status checks.
- RLS policies.
- Seed/test setup where appropriate.
- Database access layer.
- Role and ownership checks.
- Transaction-safe primitives for sensitive state transitions.

Verify:
- Migrations apply cleanly to the actual Supabase project or a local Supabase environment.
- RLS tests cover cross-user and cross-role access.
- No dashboard feature is built on an insecure schema.
- Document the exact schema and environment assumptions.

### Phase 3: Authentication and routing

Deliver:
- Register, login, logout, password reset, and verification handling.
- Secure session integration.
- Developer versus client routing.
- Invitation-context preservation through auth.
- Server-side route guards.

Verify:
- Normal developer signup routes correctly.
- Client invitation signup does not create a developer workspace.
- Existing users can sign in without losing role or invitation context.
- Protected routes deny unauthorized users.

### Phase 4: Developer core

Deliver:
- Workspace initialization.
- Dashboard overview using real data.
- Form creation/list/detail/settings.
- Public submission endpoint.
- Submission list and detail.
- Basic analytics and usage display.
- Plan limit enforcement for forms and submissions.

Verify:
- A real form submission is persisted and appears in the correct developer account.
- Cross-workspace access tests pass.
- Rate and usage limits are enforced server-side.

### Phase 5: Client invitation system

Deliver:
- Client Access page.
- Invitation creation and email sending.
- Secure invitation token handling.
- New-client and existing-client acceptance.
- Atomic permission creation.
- Resend and revoke actions.
- One-active-client-per-form enforcement.
- Unique viewer-limit enforcement.

Verify:
- Invitation token is stored hashed.
- Invalid/expired/revoked invitation fails safely.
- Email mismatch fails.
- Concurrent acceptance cannot create conflicting access.
- Revocation blocks server-side access immediately.

### Phase 6: Client portal

Deliver:
- Client home.
- Shared forms list.
- Shared form detail.
- Submission list/detail.
- Basic client settings.
- Client-only navigation and route protection.

Verify:
- Client sees only explicitly shared forms.
- Client cannot access developer billing, workspace settings, unshared forms, or another client's data.
- Returning client login routes correctly.
- Users with both roles retain both roles.

### Phase 7: Billing

Deliver:
- Configurable plans and limits.
- Pricing page.
- Lemon Squeezy checkout creation.
- Webhook signature verification.
- Idempotent webhook processing.
- Subscription state and usage period management.
- Upgrade/downgrade behavior.

Verify:
- Test checkout works in the real configured provider environment.
- Redirect alone does not grant paid features.
- Verified webhook updates the correct workspace.
- Duplicate events have no duplicate effect.
- Downgrades preserve existing data.

### Phase 8: Marketing and documentation

Deliver:
- Homepage.
- Pricing.
- Documentation and integration examples.
- Contact page.
- Privacy and terms pages based on actual behavior.
- Responsive and accessible public UI.

Verify:
- All claims match the implemented product.
- Documentation endpoint and response examples match the code.
- No fake testimonials, metrics, or unsupported features appear.

### Phase 9: Production readiness

Deliver:
- Security review.
- End-to-end test suite.
- Error boundaries and error states.
- Logging/monitoring setup appropriate to the deployment.
- Provider setup checklist.
- Backup and data-retention decisions.
- Deployment documentation.
- Final release checklist.

Verify:
- Production build and tests pass.
- Production environment variables are set.
- Supabase RLS has been checked in the deployed environment.
- Resend sender/domain is verified.
- Lemon Squeezy test/live configuration is confirmed.
- Webhook endpoint is configured and tested.
- Domain, HTTPS, redirects, and auth callback URLs work.
- No known critical access-control bugs remain.

---

## 24. Acceptance Criteria

The MVP is not ready until all of the following are true:

### Product functionality
- [ ] Developer can register and log in.
- [ ] Developer gets a valid workspace.
- [ ] Developer can create and manage forms.
- [ ] Each active form has a documented submission endpoint.
- [ ] Valid submissions are stored and shown to the correct developer.
- [ ] Submission list and detail views work.
- [ ] Basic analytics use real records.
- [ ] Plan limits are visible and enforced.
- [ ] Developer can invite a client to a specific form.
- [ ] New client can register from an invitation without developer onboarding.
- [ ] Existing client can accept an invitation after login.
- [ ] Client is routed to the client portal.
- [ ] Client sees only forms explicitly shared with their account.
- [ ] Developer can revoke client access.
- [ ] Revocation immediately blocks future requests.
- [ ] Billing state is based on verified provider data.
- [ ] Transactional email failures are handled honestly.

### Security
- [ ] RLS policies are enabled and tested.
- [ ] Cross-user access tests pass.
- [ ] Cross-role access tests pass.
- [ ] Invitation tokens are stored hashed.
- [ ] Invitation acceptance is transaction-safe and idempotent.
- [ ] One active client per form is enforced in the database/transaction layer.
- [ ] Usage limits cannot be bypassed with concurrent requests.
- [ ] No secrets are exposed to the client.
- [ ] Untrusted submission values render safely.
- [ ] Billing webhook signatures are verified.

### Quality
- [ ] Responsive behavior works on mobile, tablet, and desktop.
- [ ] Core pages have loading, empty, error, and permission-denied states.
- [ ] Accessibility basics are implemented.
- [ ] TypeScript, lint, tests, and production build pass.
- [ ] Documentation matches actual behavior.
- [ ] No fake analytics, fake testimonials, or nonfunctional controls remain.
- [ ] Setup and deployment instructions are complete.

---

## 25. Definition of Done for Every Feature

A feature is done only when:
1. Its UI is implemented.
2. Its server-side behavior is implemented.
3. Authorization is enforced.
4. Input validation is implemented.
5. Loading, empty, success, and error states are handled.
6. Relevant tests are added and pass.
7. Responsive behavior is checked.
8. Any environment/provider dependencies are documented.
9. The feature works against real configured services, or is clearly marked as unavailable when credentials are missing.
10. No unsupported product claim is added to the UI or marketing site.

A page that merely looks complete is not a completed feature.

---

## 26. Coding-Agent Instructions

Use this PRD as the product source of truth. Implement it incrementally in the new repository.

### Required working method

1. Inspect the existing repository before making assumptions.
2. If the repository is empty, initialize the stack described above.
3. Work on **Phase 1 only** first.
4. After Phase 1, report files created, commands run, tests/build results, and blockers.
5. Do not claim that Supabase, Resend, or Lemon Squeezy is working until the actual environment has been configured and tested.
6. Before building auth or dashboard features, implement Phase 2 migrations, constraints, and RLS, then test cross-user access.
7. Do not use mock data as real user data. Seed data is acceptable only in clearly identified local development/test environments.
8. Do not build client access as a cosmetic UI. It is a security-critical feature.
9. Do not implement client invitation acceptance as a sequence of independent, failure-prone writes; use a transaction or trusted database function.
10. Do not trust browser-supplied roles, workspace IDs, plan keys, subscription status, usage counts, or permissions.
11. Enforce plan limits on the server and, where necessary, transactionally in the database.
12. Use small, reviewable changes and run relevant tests after each phase.
13. If a requirement is ambiguous, choose the safest minimal implementation, document the decision, and ask before making a consequential product change.
14. If provider credentials are unavailable, implement a clean integration boundary and document the required setup; do not fake success.
15. At the end of each phase, report:
    - What was implemented.
    - Files and migrations changed.
    - Commands/tests run and their actual results.
    - Any manual configuration required.
    - Known limitations.
    - The next proposed phase.

### First instruction to the coding agent

**Start with Phase 1 only.** Inspect the repository, initialize the Next.js App Router + TypeScript + Tailwind foundation if needed, establish the design tokens and accessible UI primitives, set up environment validation and tests, and create the README and `.env.example`. Run lint, TypeScript checks, tests, and a production build. Report the actual results. Do not start auth, dashboard, billing, or client access until Phase 1 is verified and the database/security foundation in Phase 2 is planned.

---

## 27. Decisions to Confirm Before Production

The following must be explicitly confirmed rather than silently assumed:

- Final prices, currency presentation, billing cadence, and tax handling.
- Exact Lemon Squeezy product/variant IDs and live store configuration.
- Resend domain verification and sender status for `team@formivo.faizyab.me`.
- Whether inbound email/replies are required; sending configuration alone does not create an inbox.
- Exact submission retention and deletion policy.
- Whether CSV export is available on Free or paid plans only.
- Whether workspace collaboration is included in the MVP.
- Whether allowed-origin restrictions are included in the first release.
- Whether form deletion should soft-delete or permanently delete related submissions.
- Whether a client can download/export submissions, or is strictly read-only.
- Exact plan-limit behavior when a workspace reaches its submission cap.
- Privacy policy, terms, and any legal/compliance requirements relevant to launch.

Do not block safe foundational work on commercial details that can remain configurable. Do not launch payment, retention, or legal claims until the relevant decisions are confirmed.

---

## 28. Final Product Standard

Formivo should launch as a small but dependable product, not a large collection of unfinished screens. The highest priorities are:

1. Correct authentication and role routing.
2. Secure workspace and form isolation.
3. Reliable form submission and usage accounting.
4. Secure, atomic client invitations and immediate revocation.
5. A genuinely isolated client portal.
6. Verified, idempotent billing state.
7. Honest analytics, clear limits, and reliable transactional email.
8. A polished, accessible, responsive interface.

When there is a trade-off between adding a new feature and making an existing security-sensitive workflow reliable, prioritize reliability.
