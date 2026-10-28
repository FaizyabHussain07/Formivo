# Formivo — Email and Resend Specification

**Document:** `10-email-resend.md`  
**Product:** Formivo  
**Version:** Version 3.0  
**Email Provider:** Resend  
**Status:** Implementation-Ready

---

# 1. Purpose

This document defines Formivo's transactional email architecture for Version 3.0.

Formivo uses **Resend** for application-controlled transactional emails.

Resend is responsible for delivering emails.

Formivo remains responsible for:

- When an email is sent
- Why it is sent
- What information it contains
- Who is authorized to trigger it
- Invitation lifecycle
- Application URLs
- Email template content

---

# 2. Email Principles

Formivo email must be:

1. Transactional rather than promotional.
2. Clear and concise.
3. Professional.
4. Consistent with the Formivo product.
5. Secure.
6. Mobile-friendly.
7. Accessible.
8. Server-generated.
9. Safe against information leakage.
10. Idempotent where repeated triggering could create confusion.

---

# 3. V1 Email Use Cases

V1 should support only emails that are necessary for the product.

Primary email types:

```text
Invitation email
Password reset / authentication email
Client access confirmation
Optional transactional notification emails
```

The first implementation priority is:

```text
Client invitation
```

---

# 4. Email Provider

The provider is:

```text
Resend
```

Do not implement another transactional email provider in V1.

Do not introduce:

- SendGrid
- Mailgun
- Postmark
- Amazon SES
- SMTP infrastructure

unless the product requirements explicitly change.

---

# 5. Architecture

Email flow:

```text id="k1x2z8"
Formivo Server
      ↓
Email Service
      ↓
Resend API
      ↓
Recipient
```

Never:

```text id="s4m6w1"
Browser
   ↓
Resend API
```

---

# 6. Server-Only API Key

The Resend API key must remain server-side.

Environment variable:

```env id="4y0f3a"
RESEND_API_KEY=
```

Never expose it through:

```text id="x8y3vz"
NEXT_PUBLIC_RESEND_API_KEY
```

---

# 7. Sender Identity

Use a verified Formivo sending domain.

Recommended conceptual sender:

```text
Formivo <team@formivo.faizyab.me>
```

The exact address depends on the production domain and Resend configuration.

Do not hardcode an unverified domain.

---

# 8. Reply-To

Where useful, configure an appropriate reply-to address.

For example:

```text
Reply-To: support@formivo.faizyab.me
```

The actual address must match the production email configuration.

---

# 9. Email Domain Verification

Before production:

```text
[ ] Sending domain configured
[ ] DNS records configured
[ ] Domain verified in Resend
[ ] Sender address verified
[ ] SPF/DKIM configuration completed
[ ] Test email delivered
```

Follow Resend's current domain verification requirements.

---

# 10. Email Service

Create a centralized email service.

Conceptually:

```ts id="m8q6z2"
sendInvitationEmail()
sendClientAccessConfirmationEmail()
```

The rest of the application should not call Resend directly.

---

# 11. Email Service Responsibilities

The email service should:

- Validate recipient
- Select template
- Generate safe URLs
- Build subject
- Build HTML
- Build plain-text fallback
- Send through Resend
- Handle provider errors
- Return a safe result
- Log a request ID or provider message ID when appropriate

---

# 12. Email Template Structure

Each transactional email should contain:

```text id="7f3x6j"
Preheader
Header
Main content
Primary CTA
Supporting information
Security/help note
Footer
```

Avoid unnecessary visual complexity.

---

# 13. Email Design

Formivo email styling should match the product's professional identity.

Use:

- Clean typography
- Strong hierarchy
- Simple spacing
- Minimal borders
- Subtle brand accent
- Clear CTA
- Mobile-friendly layout

Avoid:

- Huge gradients
- Excessive decorative elements
- Emoji-heavy layouts
- Fake marketing statistics
- Stock imagery
- Overly complicated email designs

---

# 14. Invitation Email

The client invitation email is the most important V1 application email.

Trigger:

```text id="x5r8k2"
Developer invites client
```

Flow:

```text id="6m8h9f"
Owner
 ↓
Create invitation
 ↓
Hash invitation token
 ↓
Store invitation
 ↓
Generate invitation URL
 ↓
Send Resend email
 ↓
Client clicks CTA
 ↓
Accept invitation
```

---

# 15. Invitation Email Content

The email should clearly explain:

- Who invited the recipient
- Workspace name
- Form name
- What access they will receive
- What they can do
- Invitation expiration
- CTA

Example structure:

```text id="b3k1p7"
You've been invited to view leads in Formivo.

[Workspace Name] invited you to access:
[Form Name]

You'll be able to view leads and basic analytics for this form.

[Accept Invitation]

This invitation expires in 7 days.
```

---

# 16. Invitation Security

Never include:

- Form secret
- Lead data
- Billing data
- Internal database credentials
- Authentication tokens other than the invitation token
- Sensitive workspace information

---

# 17. Invitation URL

The URL should contain a secure invitation token.

Conceptually:

```text id="h7z5v2"
/invite/<token>
```

The token should be:

- Random
- High entropy
- Single-purpose
- Expiring
- Stored only as a hash in the database

---

# 18. Invitation Token Handling

The raw token is generated server-side.

Conceptual flow:

```text id="q8n4v3"
generateToken()
      ↓
hashToken()
      ↓
store hash
      ↓
send raw token by email
```

The database must never contain the raw token.

---

# 19. Invitation Expiration

Default V1 invitation lifetime:

```text id="v4m7y6"
7 days
```

After expiration:

```text id="n9x4z2"
The invitation cannot be accepted.
```

---

# 20. Invitation Status

Supported states:

```text id="8g2k1d"
pending
accepted
revoked
expired
```

The server must validate status before accepting.

---

# 21. Duplicate Invitations

If an owner invites the same email to the same form while an invitation is already pending, the application should avoid unnecessary duplicate active invitations.

Recommended behavior:

```text id="0b7c9q"
Existing pending invitation
        ↓
Regenerate/resend invitation
or
Show existing invitation state
```

The implementation must choose one deterministic behavior.

---

# 22. Invitation Resend

If V1 supports resend:

1. Verify owner authorization.
2. Verify the invitation belongs to the workspace/form.
3. Invalidate or replace the old token.
4. Generate a new token.
5. Update expiration.
6. Send a new email.

The old token must stop working.

---

# 23. Invitation Revocation

When an owner revokes an invitation:

```text id="z6q1c3"
status = revoked
```

The token becomes invalid immediately.

No new email should be sent.

---

# 24. Invitation Acceptance Email

V1 may send a confirmation email after successful acceptance.

Example purpose:

```text id="n4j6q0"
Confirm that you now have access to the assigned Formivo form.
```

This is optional compared with the invitation email and should not block the core workflow.

---

# 25. Password Reset

Password reset functionality is handled through Supabase Auth.

Formivo should use the authentication provider's secure password reset mechanism rather than implementing its own password-reset token system.

---

# 26. Password Reset Email

If the application customizes the password reset email:

- Keep the reset URL secure.
- Use Supabase's recommended flow.
- Do not create custom password storage.
- Do not log reset tokens.

---

# 27. Authentication Email Templates

Authentication-related emails may include:

```text id="f6p9q2"
Password reset
Email confirmation
Magic link
```

only if those authentication methods are enabled in the Formivo configuration.

Do not build unused authentication flows.

---

# 28. Email Verification

If email confirmation is enabled in Supabase Auth:

```text id="t8h2r6"
Supabase
 ↓
Confirmation email
 ↓
User
```

Formivo should not duplicate confirmation logic through Resend.

---

# 29. Transactional vs Marketing Email

V1 Resend integration is transactional.

Do not build:

- Marketing campaigns
- Newsletters
- Email sequences
- Drip campaigns
- Lead nurturing
- Bulk promotional email

These are outside V1.

---

# 30. No Lead Notification System in V1

Formivo V1 should not implement:

```text
Email every time a lead arrives
```

unless this feature is explicitly added to scope.

This avoids turning the MVP into an automation platform.

---

# 31. No Email Marketing

Do not implement:

```text
Campaigns
Subscribers
Segments
Automations
Broadcasts
Templates marketplace
```

in V1.

---

# 32. Email Templates

Recommended template files:

```text
emails/
├── invitation.tsx
├── invitation-accepted.tsx
└── shared/
    ├── layout.tsx
    ├── header.tsx
    └── footer.tsx
```

The exact directory may differ depending on the repository architecture.

---

# 33. React Email

If the project uses React Email, templates may be implemented as React components.

Example conceptual structure:

```tsx id="6g5n2w"
<EmailLayout>
  <Heading>You've been invited to Formivo</Heading>

  <Text>
    Acme Studio invited you to view leads.
  </Text>

  <Button href={inviteUrl}>
    Accept Invitation
  </Button>
</EmailLayout>
```

Do not introduce React Email if the existing repository already has a suitable email-template architecture.

---

# 34. Plain Text Fallback

Every transactional email should have a plain-text version.

Example:

```text id="8v6c2m"
You've been invited to Formivo.

Acme Studio invited you to view leads for Contact Form.

Accept your invitation:
https://...

This invitation expires in 7 days.
```

---

# 35. HTML Safety

Never insert raw user-generated HTML into an email template.

User-controlled values such as:

```text id="y1g4p7"
workspace name
form name
user name
```

must be safely escaped by the email rendering system.

---

# 36. Email Subject Lines

Keep subjects clear.

Invitation example:

```text id="9x3b7p"
You're invited to view leads in Formivo
```

Avoid misleading or spam-like subjects.

---

# 37. Preheader

Use useful preheader text.

Example:

```text id="5k8z3f"
You have been invited to access a Formivo client dashboard.
```

Do not repeat the subject unnecessarily.

---

# 38. CTA Design

Primary CTA should be:

- Clearly visible
- Descriptive
- Keyboard accessible
- Large enough for mobile

Example:

```text id="c6w8j5"
Accept Invitation
```

Avoid:

```text id="2r7m4p"
Click Here
```

---

# 39. Email Accessibility

Emails should:

- Use semantic HTML where possible
- Have readable font sizes
- Maintain sufficient contrast
- Include meaningful link text
- Work without images
- Be usable on mobile
- Avoid information conveyed only through color

---

# 40. Mobile Email

Invitation emails must be responsive.

Test at common mobile widths.

The CTA must remain easy to tap.

Avoid layouts requiring horizontal scrolling.

---

# 41. Email Footer

Keep the footer simple.

Example:

```text id="5g9h2a"
You're receiving this email because someone invited you to a Formivo workspace.

© Formivo
```

Include relevant support/legal links where appropriate.

Do not add unnecessary marketing content.

---

# 42. Email URLs

URLs must be generated from trusted application configuration.

Do not construct URLs from arbitrary request headers.

Avoid trusting:

```text id="k7f2n4"
Host
Origin
Referer
```

for security-sensitive invitation URLs.

Use a configured application URL.

---

# 43. Application URL

Environment variable:

```env id="8j3h5w"
NEXT_PUBLIC_APP_URL=https://formivo.com
```

The server may use a server-specific application URL configuration where appropriate.

Never use an attacker-controlled host to construct password reset or invitation links.

---

# 44. Invitation URL Example

Conceptually:

```text id="x6m9q1"
https://formivo.com/invite/<secure-token>
```

The actual domain must come from trusted environment configuration.

---

# 45. Email Rate Limiting

Email-triggering actions should be rate-limited.

Especially:

```text id="j6q8r1"
Invitation sending
Invitation resend
Password reset requests
```

Do not allow a malicious user to generate unlimited emails.

---

# 46. Email Abuse Prevention

Protect against:

- Email bombing
- Invitation spam
- Repeated resend requests
- Automated account enumeration
- Provider quota abuse

---

# 47. Invitation Authorization

Only a workspace owner may trigger a client invitation.

Server must verify:

```text id="0h4z3x"
Authenticated user
+
Workspace ownership
+
Form belongs to workspace
+
Viewer quota available
```

before sending.

---

# 48. Invitation Quota

Creating an invitation should respect the workspace's viewer entitlement where applicable.

For example:

```text id="g3c5d9"
Free = 1 viewer
Pro = 5 viewers
Agency = unlimited
```

Do not let users bypass viewer limits by repeatedly creating invitations.

---

# 49. Pending Invitations and Viewer Limits

The application must define whether pending invitations count toward the viewer limit.

Recommended V1 behavior:

> A pending invitation counts toward the intended viewer allocation to prevent limit bypass.

Example:

```text id="e6m4b1"
Free limit = 1

Existing pending invitation = 1

New invitation = blocked
```

---

# 50. Email Sending Failure

If invitation database creation succeeds but email sending fails, the application must not silently report success.

Recommended flow:

```text id="u7m2x8"
Create invitation
 ↓
Send email
 ↓
If sending fails:
    mark/send failure state
    show actionable error
```

The implementation should avoid creating confusing duplicate invitations during retries.

---

# 51. Email Provider Failure

If Resend is unavailable:

- Do not crash unrelated application features.
- Return a controlled error.
- Log the provider failure safely.
- Allow a retry.
- Do not expose provider credentials or internal errors.

---

# 52. Email Idempotency

Where duplicate email sends would create a poor experience, use an application-level idempotency strategy.

For example:

```text id="n8k4q3"
workspace
+
form
+
recipient
+
invitation
```

should identify the logical invitation.

---

# 53. Resend Message IDs

When available, store the provider message ID for observability.

Example:

```text id="6y9x1q"
resend_message_id
```

This is optional in the core schema if the project does not need delivery tracking.

Do not store unnecessary provider response payloads.

---

# 54. Delivery Tracking

V1 does not require a complete email analytics system.

Do not build:

- Open tracking dashboards
- Click tracking dashboards
- Campaign analytics
- Email engagement scoring

unless explicitly added to scope.

---

# 55. Email Logging

Safe logs may include:

```text id="r3y5m7"
requestId
email type
recipient domain
workspace ID
provider message ID
success/failure
duration
```

Avoid logging complete email bodies if they contain user-specific information.

---

# 56. Recipient Privacy

Do not expose one recipient's email address to another recipient.

For individual invitations, send one recipient per email unless a deliberate bulk-email architecture is implemented later.

---

# 57. Email Header Security

Do not allow users to inject arbitrary email headers.

User-provided values must not control:

```text id="2y6f8k"
From
Reply-To
BCC
CC
```

except through controlled application configuration.

---

# 58. Unsubscribe Handling

Transactional invitation emails do not require a traditional marketing unsubscribe flow.

Do not add an unsubscribe link that implies the recipient is subscribed to marketing.

If Formivo later introduces marketing email, that should be a separate system.

---

# 59. Legal/Privacy Links

Production transactional emails should include appropriate links to:

```text id="v5q2c8"
Privacy
Terms
Support
```

where required.

---

# 60. Email Content Rules

Do not include:

```text id="4z8q3n"
Passwords
API keys
Form secrets
Payment card information
Full lead payloads
Internal database IDs
Service credentials
```

unless there is an explicit, security-reviewed reason.

---

# 61. Client Invitation Example

Recommended content:

```text id="n4w6z2"
You're invited to Formivo

Acme Studio invited you to access the
Contact Form dashboard.

You'll be able to view leads and basic
analytics for this form.

[Accept Invitation]

This invitation expires in 7 days.

If you weren't expecting this invitation,
you can safely ignore this email.
```

---

# 62. Invitation Acceptance Result

After successful acceptance, the user should be redirected to:

```text id="r8c1m4"
/client/forms/<formId>
```

or the appropriate client dashboard route.

Do not expose the invitation token in the final application URL after successful acceptance.

---

# 63. Token Cleanup

After successful invitation acceptance:

```text id="x9z2k5"
token_hash
```

should no longer be usable.

Recommended:

```text id="h7f3d8"
status = accepted
accepted_at = now()
```

---

# 64. Expired Token Cleanup

Expired invitations may remain in the database for audit/history.

They must not remain usable.

A cleanup job may later remove old expired records, but this is not required for V1 functionality.

---

# 65. Email Testing

Every email template must be tested for:

```text id="u4f6j1"
Desktop
Mobile
Plain text
HTML
Long workspace name
Long form name
Special characters
Missing optional fields
Dark mode where applicable
```

---

# 66. Email Security Testing

Test:

```text id="c7p9v2"
Unauthorized invitation attempt
Cross-workspace invitation
Expired invitation
Revoked invitation
Reused invitation
Invalid token
Email injection attempts
Malicious workspace name
Malicious form name
```

---

# 67. Resend Configuration

Production checklist:

```text id="k8m4z0"
[ ] Resend account configured
[ ] API key created
[ ] API key stored server-side
[ ] Sending domain verified
[ ] DNS configured
[ ] Sender configured
[ ] Test email delivered
[ ] Invitation template tested
[ ] Authentication email flow tested
```

---

# 68. Email Error Codes

Recommended application errors:

```text id="d2v8n1"
EMAIL_PROVIDER_ERROR
EMAIL_CONFIGURATION_ERROR
INVALID_RECIPIENT
INVITATION_SEND_FAILED
INVITATION_EXPIRED
INVITATION_REVOKED
INVITATION_ALREADY_ACCEPTED
```

---

# 69. Email API Boundary

The application should expose business operations rather than provider-specific operations.

Good:

```ts id="f4k6q2"
sendClientInvitation(...)
```

Avoid exposing:

```ts id="n5z8m1"
resend.sendEmail(...)
```

throughout the codebase.

---

# 70. Email Service Interface

Conceptually:

```ts id="3s7j4c"
type SendInvitationInput = {
  recipientEmail: string;
  inviterName: string;
  workspaceName: string;
  formName: string;
  invitationUrl: string;
  expiresAt: Date;
};

type EmailResult = {
  success: boolean;
  providerMessageId?: string;
};
```

The exact implementation may differ.

---

# 71. Email Environment Validation

The application should detect missing email configuration during startup/build/deployment validation where practical.

If:

```text id="5j7p1x"
RESEND_API_KEY
```

is missing in production, email functionality should fail clearly rather than silently.

---

# 72. Development Email Behavior

Development should avoid accidentally sending real invitations to unintended recipients.

Use:

- Resend test facilities where available
- Controlled test addresses
- Development-specific configuration

Never commit real production recipient addresses or credentials.

---

# 73. Staging

Staging should have its own:

```text id="x3m8p4"
Resend configuration
Application URL
Provider credentials
```

where possible.

Invitation URLs must point to the correct environment.

---

# 74. Email Observability

At minimum, monitor:

```text id="w8h2r5"
Email send success
Email send failure
Invitation send failure
Resend API errors
Unexpected volume
```

This helps detect both technical failures and abuse.

---

# 75. Email Performance

Do not block unrelated application operations on unnecessary email work.

For example, a successful lead submission should not depend on email functionality when V1 does not require a lead notification email.

---

# 76. Email Retries

Retries must be controlled.

Do not blindly retry indefinitely.

Use:

```text id="v2x7c9"
limited retries
+
backoff
+
idempotency
```

where appropriate.

---

# 77. Email Provider Timeout

Set reasonable server-side timeout behavior for Resend API requests.

A provider that hangs should not cause an application request to hang indefinitely.

---

# 78. Email Template Source of Truth

Email content should live in version-controlled source code.

Do not build the V1 email system around manually edited provider dashboards.

---

# 79. Branding

Email branding should be consistent with Formivo's application design system.

Use:

- Formivo name
- Professional typography
- Restrained visual styling
- Clear CTA
- Consistent footer

Do not copy the exact visual identity of Linear, Vercel, Stripe, Resend, or any other product.

---

# 80. Email Non-Goals

V1 does not include:

```text id="j2y6k8"
Marketing automation
Newsletter system
Bulk campaigns
Email CRM
Lead nurturing
Automated lead follow-ups
AI email generation
Email sequences
Email template marketplace
Advanced email analytics
Custom sender management
```

---

# 81. Security Definition of Done

Email security is complete when:

```text id="a7f4q2"
Resend API key is server-only
+
Sending domain is verified
+
Invitation tokens are hashed
+
Invitation tokens expire
+
Invitation tokens cannot be reused
+
Invitation authorization is enforced
+
Email content does not leak secrets
+
User-generated values are safely escaped
+
Email sending is rate-limited
+
Provider failures are handled
+
Sensitive email data is not logged
```

---

# 82. Functional Definition of Done

Email functionality is complete when:

```text id="m5q8v7"
Owner can invite a client
+
Invitation email is delivered
+
Client can open invitation
+
Client can authenticate
+
Client can accept invitation
+
Client receives assigned access
+
Expired invitations fail
+
Revoked invitations fail
+
Accepted invitations cannot be reused
+
Password reset uses Supabase Auth
```

---

# 83. Final Email Architecture

```text id="8c5m2w"
                  ┌─────────────────┐
                  │     Formivo     │
                  └────────┬────────┘
                           │
                    Email Service
                           │
                           ▼
                  ┌─────────────────┐
                  │      Resend     │
                  └────────┬────────┘
                           │
                           ▼
                     Recipient
                           │
                           ▼
                    Formivo App
                           │
                     Accept Invite
                           │
                           ▼
                 Client Form Access
```

---

# 84. Implementation Rules

The AI coding agent must:

1. Use Resend for Formivo-controlled transactional email.
2. Keep the Resend API key server-side.
3. Centralize email sending.
4. Use secure invitation tokens.
5. Store only invitation token hashes.
6. Expire invitations.
7. Prevent invitation token reuse.
8. Rate-limit invitation sending.
9. Use the configured application URL.
10. Never construct sensitive URLs from untrusted request headers.
11. Escape user-generated email content.
12. Provide plain-text email fallbacks.
13. Handle Resend failures gracefully.
14. Never log secrets or sensitive lead data.
15. Keep marketing email outside V1.
16. Use Supabase Auth for password reset and authentication emails where applicable.
17. Do not implement a custom password-reset system.
18. Do not introduce another email provider.
19. Do not make lead notifications a hidden V1 requirement.
20. Keep the email system small and maintainable.

---

# 85. Final Principle

> **Resend delivers Formivo's transactional emails; Formivo owns the business logic and security behind those emails.**

Every email must have a clear product purpose, must contain only the information the recipient needs, and must remain secure even when recipient-controlled or workspace-controlled values are malicious.