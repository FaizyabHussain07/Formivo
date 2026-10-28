# Formivo — Pages and Components Specification

**Document:** `07-pages-and-components.md`  
**Product:** Formivo  
**Version:** Version 3.0  
**Status:** Implementation-Ready

---

# 1. Purpose

This document defines the page architecture and reusable component system for Formivo V1.

It provides the implementation blueprint for:

- Public marketing pages
- Authentication pages
- Onboarding
- Developer dashboard
- Forms
- Integrations
- Leads
- Analytics
- Clients
- Billing
- Settings
- Client portal
- Invitation flows
- Error and empty states
- Shared UI components

The implementation should use this document together with:

- `01-product-prd.md`
- `02-user-flows.md`
- `03-technical-architecture.md`
- `04-data-model.md`
- `05-api-spec.md`
- `06-ui-ux-design-system.md`

---

# 2. Page Architecture

Formivo V1 has four major application areas:

```text
Public Website
    ↓
Authentication
    ↓
Developer Application
    ↓
Client Portal
```

Conceptually:

```text
formivo.com
    │
    ├── Marketing
    ├── Pricing
    ├── Docs
    │
    └── App
         │
         ├── Developer Dashboard
         │
         └── Client Portal
```

---

# 3. Route Structure

Recommended Next.js App Router structure:

```text
app/
├── (marketing)/
│   ├── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── docs/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   └── terms/
│       └── page.tsx
│
├── (auth)/
│   ├── sign-in/
│   │   └── page.tsx
│   ├── sign-up/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   ├── reset-password/
│   │   └── page.tsx
│   └── callback/
│       └── route.ts
│
├── (app)/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── forms/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [formId]/
│   │       ├── page.tsx
│   │       ├── integration/
│   │       │   └── page.tsx
│   │       ├── leads/
│   │       │   └── page.tsx
│   │       ├── analytics/
│   │       │   └── page.tsx
│   │       └── clients/
│   │           └── page.tsx
│   │
│   ├── leads/
│   │   ├── page.tsx
│   │   └── [leadId]/
│   │       └── page.tsx
│   │
│   ├── analytics/
│   │   └── page.tsx
│   │
│   ├── clients/
│   │   └── page.tsx
│   │
│   ├── billing/
│   │   └── page.tsx
│   │
│   └── settings/
│       ├── page.tsx
│       ├── profile/
│       │   └── page.tsx
│       ├── workspace/
│       │   └── page.tsx
│       └── security/
│           └── page.tsx
│
├── (client)/
│   └── client/
│       ├── page.tsx
│       ├── forms/
│       │   ├── page.tsx
│       │   └── [formId]/
│       │       ├── page.tsx
│       │       ├── leads/
│       │       │   └── page.tsx
│       │       └── analytics/
│       │           └── page.tsx
│
└── api/
    └── ...
```

The exact route grouping may be changed to match the repository, but the user-facing route semantics should remain clear.

---

# 4. Public Marketing Pages

Required V1 public pages:

```text
/
 /pricing
 /docs
 /privacy
 /terms
```

Optional:

```text
/contact
```

only if a real contact workflow exists.

---

# 5. Landing Page

Route:

```text
/
```

Purpose:

Explain Formivo and convert visitors into sign-ups.

Sections:

```text
Navigation
Hero
How It Works
Core Benefits
Developer Workflow
Client Dashboard
Pricing Preview
FAQ
Final CTA
Footer
```

---

# 6. Landing Page Hero

Headline:

> Connect your forms. Capture your leads. Give clients their dashboard.

Supporting text:

Explain that Formivo lets developers connect existing website forms, centralize submissions, manage leads, and give clients read-only access.

Primary CTA:

```text
Start Free
```

Secondary CTA:

```text
View Docs
```

---

# 7. Hero Components

```text
MarketingNavbar
HeroSection
PrimaryButton
SecondaryButton
ProductPreview
```

The product preview should use real-looking but clearly controlled UI data.

Do not claim the data represents real customers.

---

# 8. How It Works Section

Three or four steps:

```text
1. Create a form
2. Connect your existing website form
3. Capture leads
4. Invite your client
```

Components:

```text
SectionHeader
WorkflowStep
WorkflowGrid
```

---

# 9. Feature Section

V1 features:

```text
Custom form endpoint
Lead management
Analytics
Client dashboard
Secure access
Usage controls
```

Components:

```text
FeatureSection
FeatureItem
FeatureIcon
```

Do not advertise unsupported integrations.

---

# 10. Client Dashboard Marketing Section

Show the value of client access.

Message:

> Give clients visibility without giving them control of your infrastructure.

Visual:

```text
Client Portal
    ↓
Assigned Form
    ↓
Leads
    ↓
Analytics
```

---

# 11. Pricing Preview

Show:

```text
Free
Pro
Agency
```

Use real V1 limits.

Do not show fake annual pricing unless implemented.

---

# 12. FAQ

Initial questions:

```text
What is Formivo?
Do I need to rebuild my forms?
Can I use Formivo with Next.js?
Can clients access leads?
Is there an embedded form builder?
How does pricing work?
Where is my form secret stored?
```

Important:

Embedded Form Builder should be described as:

> Coming Soon

It must not be represented as available V1 functionality.

---

# 13. Marketing Navbar

Components:

```text
Logo
NavLinks
PricingLink
DocsLink
SignInButton
StartFreeButton
MobileMenu
```

Desktop:

```text
Logo

Product
Pricing
Docs

Sign In
Start Free
```

Mobile:

```text
Logo
Menu
```

---

# 14. Marketing Footer

Components:

```text
Footer
FooterColumn
FooterLink
FooterLegal
```

Only include links to real pages.

---

# 15. Pricing Page

Route:

```text
/pricing
```

Purpose:

Explain plans and limits.

Plans:

```text
Free
$0

Pro
$9/month

Agency
$29/month
```

---

# 16. Pricing Components

```text
PricingHeader
PricingGrid
PricingCard
PlanFeatureList
PricingCTA
```

Each card should show:

- Price
- Forms
- Monthly leads
- Client viewers
- Main CTA

---

# 17. Documentation Page

Route:

```text
/docs
```

Purpose:

Help developers integrate Formivo.

V1 documentation sections:

```text
Getting Started
Create a Form
Connect Your Website
Submit Leads
Authentication
Client Access
API Reference
Security
```

---

# 18. Documentation Components

```text
DocsLayout
DocsSidebar
DocsContent
CodeBlock
CopyCodeButton
DocsSearch
```

Search can be implemented simply in V1.

Do not build a complicated documentation CMS.

---

# 19. Authentication Pages

Routes:

```text
/sign-in
/sign-up
/forgot-password
/reset-password
```

---

# 20. Sign-Up Page

Purpose:

Create a Supabase account.

Fields:

```text
Name
Email
Password
```

CTA:

```text
Create Account
```

Optional OAuth providers should only be included if actually configured.

Do not display non-functional Google/GitHub buttons.

---

# 21. Sign-In Page

Fields:

```text
Email
Password
```

Actions:

```text
Sign In
Forgot password
Create account
```

---

# 22. Forgot Password

Fields:

```text
Email
```

Response:

```text
If an account exists, password reset instructions have been sent.
```

Avoid exposing whether a specific email exists.

---

# 23. Reset Password

Fields:

```text
New password
Confirm password
```

After successful reset:

```text
Password updated.
```

Then provide a clear route back to sign-in/dashboard.

---

# 24. Authentication Components

```text
AuthLayout
AuthCard
AuthHeader
TextInput
PasswordInput
SubmitButton
AuthError
AuthSuccess
AuthFooter
```

---

# 25. Protected Application Layout

All developer dashboard pages should use:

```text
AppShell
```

Structure:

```text
AppShell
├── Sidebar
├── MobileHeader
├── MainContent
└── GlobalToasts
```

---

# 26. App Shell Components

```text
AppShell
Sidebar
SidebarLogo
WorkspaceSwitcher
SidebarNavigation
UserMenu
TopBar
Breadcrumbs
PageContainer
```

---

# 27. Developer Navigation

Primary navigation:

```text
Overview
Forms
Leads
Analytics
Clients
Billing
Settings
```

The active item should be derived from the current route.

---

# 28. Dashboard Overview

Route:

```text
/dashboard
```

Components:

```text
DashboardHeader
MetricGrid
MetricCard
RecentLeads
FormSummary
UsageCard
EmptyState
```

---

# 29. Dashboard Data

Metrics:

```text
Total Leads
New Leads
Active Forms
Monthly Usage
```

Recent leads:

```text
Latest submissions
```

Form summary:

```text
Form
Status
Leads
```

All data must be real.

---

# 30. Dashboard Empty State

If no forms exist:

```text
Welcome to Formivo

Create your first form to start receiving leads.

[ Create Form ]
```

Do not show meaningless zero-filled dashboards.

---

# 31. Forms Index

Route:

```text
/forms
```

Components:

```text
FormsHeader
NewFormButton
FormsTable
FormRow
FormStatusBadge
FormActionsMenu
Pagination
EmptyFormsState
```

---

# 32. Forms Table

Columns:

```text
Name
Status
Leads
Created
Actions
```

Row actions:

```text
Open
Integration
Archive
```

---

# 33. New Form Page

Route:

```text
/forms/new
```

Components:

```text
NewFormHeader
FormTypeSelector
CustomFormOption
EmbeddedBuilderOption
FormDetailsForm
```

---

# 34. Form Type Selector

Available:

```text
Connect Custom Form
```

Coming soon:

```text
Embedded Form Builder
```

The coming-soon option must be visually disabled.

It must not navigate to a broken page.

---

# 35. New Form Form

Fields:

```text
Name
Description
```

Example:

```text
Name:
Acme Contact Form

Description:
Website contact form for Acme
```

CTA:

```text
Create Form
```

---

# 36. Form Detail

Route:

```text
/forms/[formId]
```

Purpose:

Provide a central view of one form.

Components:

```text
FormHeader
FormStatusBadge
FormSummary
FormNavigation
RecentLeads
FormUsage
FormActions
```

---

# 37. Form Detail Navigation

Tabs or navigation:

```text
Overview
Integration
Leads
Analytics
Clients
```

Use route-based navigation rather than storing complex UI state only in the browser.

---

# 38. Form Overview

Show:

```text
Form name
Description
Status
Created date
Lead count
Current usage
```

Primary actions:

```text
Open Integration
View Leads
```

---

# 39. Integration Page

Route:

```text
/forms/[formId]/integration
```

Components:

```text
IntegrationHeader
EndpointDisplay
SecretDisplay
SecretWarning
CodeBlock
CopyButton
TestSubmissionButton
IntegrationInstructions
RotateSecretDialog
```

---

# 40. Endpoint Display

Example:

```text
POST
https://app.formivo.com/api/v1/forms/frm_xxx/submissions
```

Include:

```text
Copy
```

button.

---

# 41. Secret Display

Only show the newly generated secret.

Components:

```text
SecretDisplay
CopySecretButton
SecretWarning
RotateSecretButton
```

Once the page is refreshed, the secret should not be available again.

---

# 42. Secret Rotation Dialog

Content:

```text
Rotate form secret?

The current secret will stop working immediately.

You'll need to update your website integration.

[Cancel] [Rotate Secret]
```

After rotation:

```text
New secret generated.

Copy it now. It will not be shown again.
```

---

# 43. Integration Code Block

Components:

```text
CodeBlock
LanguageSelector
CopyCodeButton
```

V1 example languages may include:

```text
JavaScript
TypeScript
```

Do not add five language-specific implementations unless needed.

---

# 44. Test Submission

Component:

```text
TestSubmissionButton
```

On click:

```text
Submitting...
```

Success:

```text
Test submission received.
```

Failure:

```text
Test submission failed.
```

---

# 45. Leads Index

Route:

```text
/leads
```

Components:

```text
LeadsHeader
LeadSearch
LeadFilters
LeadTable
LeadRow
LeadStatusBadge
Pagination
EmptyLeadsState
```

---

# 46. Form Leads Page

Route:

```text
/forms/[formId]/leads
```

Same lead components may be reused.

Difference:

The form is already scoped.

The UI should show:

```text
Website Contact Form
```

in the page header.

---

# 47. Lead Search

Component:

```text
LeadSearch
```

Placeholder:

```text
Search leads...
```

Search should be debounced where appropriate.

Do not send a request on every individual keystroke.

---

# 48. Lead Filters

Components:

```text
StatusFilter
FormFilter
DateFilter
ClearFiltersButton
```

Keep filtering simple in V1.

---

# 49. Lead Table

Component:

```text
LeadTable
```

Possible columns:

```text
Primary identity
Email
Form
Status
Created
```

The table must adapt to dynamic form data.

---

# 50. Lead Row

Component:

```text
LeadRow
```

Behavior:

Clicking the row opens:

```text
/leads/[leadId]
```

unless the user clicked a nested action.

---

# 51. Lead Detail

Route:

```text
/leads/[leadId]
```

Components:

```text
LeadDetailHeader
LeadStatusSelect
LeadDataSection
LeadMetadataSection
LeadTimeline
```

V1 does not need a full activity timeline unless real events exist.

Do not create fake timeline entries.

---

# 52. Dynamic Lead Data

The lead data is JSON.

Display key/value pairs:

```text
Name
John Doe

Email
john@example.com

Message
Hello
```

For nested values:

Use a safe readable representation.

Do not execute HTML or arbitrary markup from lead data.

---

# 53. Lead Status Component

```text
LeadStatusSelect
```

Options:

```text
New
Contacted
Qualified
Converted
Archived
```

Developers can change status.

Clients cannot.

---

# 54. Analytics Page

Route:

```text
/analytics
```

Components:

```text
AnalyticsHeader
DateRangeSelector
AnalyticsMetricGrid
LeadTrendChart
StatusBreakdown
FormPerformanceTable
```

---

# 55. Form Analytics

Route:

```text
/forms/[formId]/analytics
```

Components:

```text
FormAnalyticsHeader
DateRangeSelector
MetricGrid
LeadTrendChart
StatusBreakdown
```

The form context should be obvious.

---

# 56. Analytics Empty State

If there are no submissions:

```text
No submission data yet

Once your form receives leads, analytics will appear here.
```

Optional CTA:

```text
View Integration
```

---

# 57. Clients Page

Route:

```text
/clients
```

Purpose:

Manage client access.

Components:

```text
ClientsHeader
InviteClientButton
ClientTable
ClientAccessSummary
InvitationStatusBadge
InviteClientDialog
RevokeAccessDialog
```

---

# 58. Client Table

Possible columns:

```text
Client
Email
Assigned Forms
Status
Actions
```

Do not expose unnecessary account information.

---

# 59. Invite Client Dialog

Fields:

```text
Email
Form
```

CTA:

```text
Send Invitation
```

Helper text:

> The client will receive read-only access to the selected form and its leads.

---

# 60. Client Access

Form-level access should be visible.

Example:

```text
John Doe
john@example.com

Website Contact Form
Website Booking Form
```

The owner can revoke access to a specific form.

---

# 61. Invitations

Pending invitations should show:

```text
Email
Form
Status
Expires
Actions
```

Actions:

```text
Revoke
```

---

# 62. Client Portal

Route:

```text
/client
```

Purpose:

Client's read-only dashboard.

Components:

```text
ClientAppShell
ClientSidebar
ClientHeader
ClientOverview
ClientFormList
```

---

# 63. Client Navigation

Show only:

```text
Overview
Forms
```

Analytics and lead access may be available within form-specific navigation.

Do not show developer-only areas.

---

# 64. Client Overview

Show:

```text
Assigned Forms
Total Leads
Recent Leads
```

Only data belonging to the client.

---

# 65. Client Forms Page

Route:

```text
/client/forms
```

Components:

```text
ClientFormsHeader
ClientFormsTable
ClientFormCard
```

Show:

```text
Form Name
Status
Lead Count
Last Activity
```

---

# 66. Client Form Detail

Route:

```text
/client/forms/[formId]
```

Components:

```text
ClientFormHeader
ClientFormNavigation
ClientFormSummary
RecentLeads
```

---

# 67. Client Leads Page

Route:

```text
/client/forms/[formId]/leads
```

Components:

```text
ClientLeadTable
ClientLeadFilters
Pagination
```

Client can:

- View
- Search
- Filter
- Open

Client cannot:

- Edit
- Change status
- Archive
- Delete

---

# 68. Client Lead Detail

A client may view:

```text
Lead information
Metadata
Created date
Current status
```

Status should be read-only.

---

# 69. Client Analytics

Route:

```text
/client/forms/[formId]/analytics
```

Components:

```text
ClientAnalyticsHeader
AnalyticsMetricGrid
LeadTrendChart
StatusBreakdown
```

All data is read-only.

---

# 70. Billing Page

Route:

```text
/billing
```

Components:

```text
BillingHeader
CurrentPlanCard
UsageSummary
PlanComparison
UpgradeButton
BillingStatus
```

---

# 71. Billing States

Handle:

```text
Free
Active Pro
Active Agency
Cancellation Pending
Expired
Past Due
```

The exact statuses depend on the normalized Lemon Squeezy subscription state.

---

# 72. Usage Component

Reusable:

```text
UsageMeter
```

Example:

```text
Monthly Leads

642 / 2,000

████████░░░░
```

Also show percentage where useful.

---

# 73. Settings Page

Route:

```text
/settings
```

Components:

```text
SettingsLayout
SettingsNavigation
SettingsOverview
```

Sections:

```text
Profile
Workspace
Security
```

Billing remains a separate top-level section.

---

# 74. Profile Settings

Route:

```text
/settings/profile
```

Components:

```text
ProfileForm
AvatarUpload
EmailDisplay
SaveButton
```

V1 should keep this simple.

---

# 75. Workspace Settings

Route:

```text
/settings/workspace
```

Fields:

```text
Workspace Name
```

Components:

```text
WorkspaceSettingsForm
DangerZone
```

Avoid adding unnecessary organization settings.

---

# 76. Security Settings

Route:

```text
/settings/security
```

Components:

```text
SecurityOverview
PasswordManagement
SessionManagement
```

Use Supabase Auth capabilities rather than creating custom authentication infrastructure.

---

# 77. 404 Page

Create a branded 404 page.

Example:

```text
Page not found

The page you're looking for doesn't exist.

[ Back to Dashboard ]
```

---

# 78. Global Error Page

Use a user-friendly error boundary.

Example:

```text
Something went wrong

We couldn't load this page.

[ Try Again ]
```

Never expose server stack traces.

---

# 79. Loading Pages

Each major route should have an appropriate `loading.tsx` where useful.

Examples:

```text
dashboard/loading.tsx
forms/loading.tsx
leads/loading.tsx
analytics/loading.tsx
```

Use skeleton components.

---

# 80. Suspense Boundaries

Use React Suspense around:

- Analytics
- Lead tables
- Dashboard metrics
- Large data sections

Avoid unnecessarily wrapping the entire application in one Suspense boundary.

---

# 81. Reusable Layout Components

Core:

```text
AppShell
PageContainer
PageHeader
Section
Stack
Grid
```

These should provide consistent spacing and structure.

---

# 82. Core UI Components

Required:

```text
Button
IconButton
Input
Textarea
Select
Checkbox
Switch
Badge
Card
Table
Dialog
DropdownMenu
Tabs
Tooltip
Toast
Alert
Skeleton
Separator
Pagination
```

Use an existing accessible component library such as shadcn/ui where appropriate.

Do not reinvent accessibility primitives unnecessarily.

---

# 83. Form Components

Required:

```text
FormField
FormLabel
FormDescription
FormMessage
TextField
TextareaField
SelectField
PasswordField
```

Use a consistent form-validation strategy.

---

# 84. Domain Components

Formivo-specific components:

```text
WorkspaceSwitcher
FormTable
FormStatusBadge
FormTypeCard
IntegrationPanel
EndpointDisplay
SecretDisplay
LeadTable
LeadStatusBadge
LeadDataViewer
UsageMeter
PlanCard
ClientTable
InvitationTable
AnalyticsChart
```

---

# 85. Navigation Components

```text
Sidebar
SidebarItem
MobileNav
Breadcrumbs
WorkspaceSwitcher
UserMenu
```

---

# 86. Feedback Components

```text
Toast
InlineAlert
ErrorState
EmptyState
SuccessState
LoadingState
Skeleton
```

---

# 87. Modal Components

Required:

```text
ConfirmDialog
ArchiveFormDialog
RotateSecretDialog
InviteClientDialog
RevokeAccessDialog
```

---

# 88. Code Components

Required:

```text
CodeBlock
CopyCodeButton
EndpointDisplay
SecretDisplay
```

These should share the same visual system.

---

# 89. Table Components

Build reusable primitives:

```text
DataTable
TableToolbar
TablePagination
TableEmptyState
TableLoadingState
```

Domain tables can compose these primitives.

---

# 90. Responsive Component Rules

Every reusable component should define behavior for:

```text
Desktop
Tablet
Mobile
```

Do not rely on every page implementing responsive behavior independently.

---

# 91. Client/Server Component Rules

Prefer Server Components for:

- Page data fetching
- Static layout
- Server-side authorization
- Initial dashboard rendering

Use Client Components for:

- Interactive forms
- Dropdowns
- Modals
- Tabs requiring client state
- Charts
- Search controls
- Optimistic UI
- Clipboard interactions

---

# 92. Data Fetching Rule

Do not fetch the same data multiple times unnecessarily.

Prefer:

```text
Server page
    ↓
Service
    ↓
Database
    ↓
Pass data to client component
```

rather than:

```text
Page
 ↓
Client component
 ↓
API
 ↓
Database
```

for every initial render.

---

# 93. Mutation Rule

Mutations can use:

- Server Actions
- Route Handlers

Choose one approach consistently within each feature.

After mutation:

```text
Database updated
 ↓
Revalidate affected page/data
 ↓
Update UI
```

---

# 94. URL State

Use URL query parameters for shareable/filterable state where useful.

Examples:

```text
/leads?status=new
/leads?formId=xxx
/leads?page=2
```

This improves navigation and refresh behavior.

---

# 95. Search State

Search may use:

```text
/leads?search=john
```

with debouncing.

Avoid storing important filter state only in React state.

---

# 96. Component Naming

Use clear names.

Good:

```text
LeadStatusBadge
ClientAccessTable
IntegrationCodeBlock
```

Bad:

```text
CoolCard
SuperTable
MagicBox
DataThing
```

---

# 97. File Naming

Use consistent naming.

Example:

```text
components/
  ui/
    button.tsx
    dialog.tsx
    input.tsx

  forms/
    form-table.tsx
    form-status-badge.tsx
    integration-panel.tsx

  leads/
    lead-table.tsx
    lead-status-badge.tsx
    lead-detail.tsx

  clients/
    client-table.tsx
    invite-client-dialog.tsx
```

---

# 98. Avoid Giant Components

Do not create components such as:

```text
Dashboard.tsx
```

containing the entire dashboard.

Break into logical units.

---

# 99. Avoid Premature Abstraction

Do not create abstractions for components used only once unless they improve:

- Readability
- Accessibility
- Maintainability
- Consistency

Reusable components should represent real repeated patterns.

---

# 100. Domain Boundary

Keep domain components close to their feature.

Example:

```text
components/leads/
components/forms/
components/clients/
components/billing/
```

Do not place every component into one giant components directory.

---

# 101. Page Responsibilities

Pages should primarily coordinate:

```text
Authentication
Data fetching
Authorization
Layout
Components
```

Business logic belongs in services.

---

# 102. Component Responsibilities

Components should primarily handle:

```text
Rendering
User interaction
Local UI state
Visual presentation
```

Do not put database queries directly into reusable visual components.

---

# 103. Loading State Architecture

Recommended:

```text
Page
 ↓
Suspense
 ↓
Skeleton component
 ↓
Real component
```

Every important asynchronous section should have an intentional loading state.

---

# 104. Error State Architecture

Recommended:

```text
Request failure
 ↓
Error boundary / action result
 ↓
Human-readable message
 ↓
Recovery action
```

---

# 105. Empty State Architecture

Every collection needs:

```text
First-use empty state
```

Examples:

```text
No forms
No leads
No clients
No invitations
No analytics data
```

---

# 106. Permission-Aware UI

The UI should hide or disable actions the user cannot perform.

Examples:

Client:

```text
Cannot see Rotate Secret
Cannot see Billing
Cannot change Lead Status
```

However:

> Hiding UI is not security.

The backend must still enforce authorization.

---

# 107. Form Archive UI

Archived form:

```text
Status: Archived
```

Actions:

```text
Restore
View Leads
```

Public submissions must remain disabled.

---

# 108. Usage Limit UI

When approaching a limit:

```text
Usage
80 / 100 leads
```

When near the limit:

```text
You're approaching your monthly lead limit.
```

When reached:

```text
Monthly lead limit reached.

Upgrade to continue receiving submissions.
```

The exact behavior must remain consistent with backend quota enforcement.

---

# 109. Plan-Locked UI

For unavailable features:

```text
Available on Pro
```

Do not pretend the feature is available.

If a feature is not in V1 at all, do not show it as a locked feature.

---

# 110. Embedded Form Builder UI

The V1 navigation should not include a working route for:

```text
Embedded Form Builder
```

The new-form experience may show:

```text
Coming Soon
```

but there should be no incomplete builder implementation.

---

# 111. Global Search

Global search is not required for V1.

Do not implement a command palette or universal search unless it provides clear value and can be completed properly.

---

# 112. Notifications

A complex notification center is not required for V1.

Use email and toasts for important notifications.

Do not build an empty notification bell merely because dashboards commonly have one.

---

# 113. User Menu

User menu may contain:

```text
Profile
Settings
Sign Out
```

Client users should receive an appropriate simplified menu.

---

# 114. Workspace Switcher Scope

If multiple workspaces are supported in V1:

```text
Current Workspace
Other Workspaces
Create Workspace
```

If the initial implementation supports only one workspace per user, the UI should not pretend multi-workspace functionality exists.

The data model should remain compatible with future multi-workspace support.

---

# 115. Authentication Redirect Rules

Unauthenticated user accessing:

```text
/dashboard
/forms
/leads
```

must be redirected to:

```text
/sign-in
```

Authenticated user accessing:

```text
/sign-in
```

may be redirected to:

```text
/dashboard
```

if already authenticated.

---

# 116. Client Redirect Rules

A client accessing developer-only routes must receive:

```text
403
```

or a safe redirect to:

```text
/client
```

Do not expose developer dashboard information.

---

# 117. First Login Routing

After sign-up:

```text
Sign Up
 ↓
Email verification if enabled
 ↓
Workspace creation/onboarding
 ↓
Dashboard
```

The exact sequence should follow the configured Supabase Auth flow.

---

# 118. Onboarding Components

```text
OnboardingLayout
WelcomePanel
WorkspaceCreationForm
FirstFormCTA
OnboardingProgress
```

Keep onboarding short.

---

# 119. First Form Creation

The primary onboarding CTA should lead directly to:

```text
/forms/new
```

Do not make the user explore the dashboard before creating a form.

---

# 120. Integration Success

After creating the first form:

```text
Form Created
 ↓
Integration Setup
 ↓
Copy Endpoint
 ↓
Copy Secret
 ↓
Send Test Submission
 ↓
First Lead
```

The UI should make this progression obvious.

---

# 121. First Lead Celebration

A subtle success state is acceptable:

```text
Your first lead arrived.
```

Do not use excessive celebration animations.

---

# 122. Component Accessibility Checklist

Every component should consider:

```text
Keyboard
Focus
ARIA
Labels
Contrast
Screen reader
Touch
Reduced motion
```

---

# 123. Component Testing

Test important components independently:

```text
Button
Input
Dialog
Dropdown
Table
Pagination
Status selector
Invite dialog
Secret display
```

Then test complete feature flows.

---

# 124. Page Testing

Each page should be tested for:

```text
Authenticated state
Unauthenticated state
Owner state
Client state
Empty state
Loading state
Error state
Mobile
Desktop
```

---

# 125. Visual Regression

If practical, use screenshot-based visual regression for important pages:

```text
Landing
Dashboard
Forms
Leads
Lead Detail
Analytics
Billing
Client Portal
Integration
```

Do not block the project on elaborate visual testing infrastructure if the repository does not already support it.

---

# 126. Final Page Inventory

## Public

```text
/
 /pricing
 /docs
 /privacy
 /terms
```

## Auth

```text
/sign-in
/sign-up
/forgot-password
/reset-password
```

## Developer

```text
/dashboard
/forms
/forms/new
/forms/[formId]
/forms/[formId]/integration
/forms/[formId]/leads
/forms/[formId]/analytics
/forms/[formId]/clients
/leads
/leads/[leadId]
/analytics
/clients
/billing
/settings
/settings/profile
/settings/workspace
/settings/security
```

## Client

```text
/client
/client/forms
/client/forms/[formId]
/client/forms/[formId]/leads
/client/forms/[formId]/analytics
```

---

# 127. Final Component Inventory

## Core

```text
Button
IconButton
Input
Textarea
Select
Badge
Card
Table
Dialog
DropdownMenu
Tabs
Tooltip
Toast
Alert
Skeleton
Pagination
```

## Layout

```text
AppShell
Sidebar
TopBar
MobileNav
PageContainer
PageHeader
Breadcrumbs
Section
```

## Forms

```text
FormTable
FormRow
FormStatusBadge
FormTypeCard
IntegrationPanel
EndpointDisplay
SecretDisplay
IntegrationCodeBlock
RotateSecretDialog
```

## Leads

```text
LeadTable
LeadRow
LeadStatusBadge
LeadDetail
LeadDataViewer
LeadFilters
LeadSearch
```

## Analytics

```text
MetricCard
MetricGrid
DateRangeSelector
LeadTrendChart
StatusBreakdown
```

## Clients

```text
ClientTable
ClientAccessTable
InviteClientDialog
InvitationTable
InvitationStatusBadge
RevokeAccessDialog
```

## Billing

```text
CurrentPlanCard
PlanCard
PlanComparison
UsageMeter
UpgradeButton
BillingStatus
```

## Feedback

```text
EmptyState
ErrorState
SuccessState
LoadingState
```

---

# 128. Implementation Priority

Build components in this order:

```text
1. Design tokens
2. Core UI primitives
3. App shell
4. Authentication UI
5. Dashboard
6. Forms
7. Integration
8. Leads
9. Analytics
10. Clients
11. Billing
12. Settings
13. Client portal
14. Marketing pages
15. Documentation
16. Final responsive/accessibility pass
```

---

# 129. Reuse Rule

Before creating a new component, check whether an existing component can be reused.

Example:

Do not create:

```text
ProUsageCard
AgencyUsageCard
FreeUsageCard
```

Create:

```text
UsageMeter
```

with plan-aware data.

---

# 130. Design-System Rule

All components must use the centralized design system.

Do not introduce random:

```text
colors
font sizes
border radii
spacing values
shadows
```

inside individual components.

---

# 131. Data Integrity Rule

UI must never invent backend data.

Examples:

Bad:

```text
"12,842 leads processed"
```

when the database contains 0.

Bad:

```text
"99.9% uptime"
```

without actual monitoring data.

Bad:

```text
"Trusted by 1,000+ agencies"
```

without verified customers.

---

# 132. Product Integrity Rule

The UI must never advertise functionality that does not exist.

Specifically:

```text
Embedded Form Builder → Coming Soon
AI lead scoring → Not available
Automations → Not available
WhatsApp → Not available
Slack → Not available
Zapier → Not available
White-label → Not available
```

---

# 133. Final UX Quality Gate

A feature is not complete when the happy path works.

It is complete when:

```text
Happy path
+
Loading
+
Empty
+
Error
+
Permission
+
Mobile
+
Accessibility
+
Security
```

have all been considered.

---

# 134. Final Page Quality Gate

Before shipping any page, ask:

1. What is the purpose of this page?
2. What is the primary action?
3. What information matters most?
4. What happens when there is no data?
5. What happens while data loads?
6. What happens when something fails?
7. What can this user actually do?
8. Does mobile work?
9. Does keyboard navigation work?
10. Does the page look like Formivo?

If any answer is unclear, the page is not finished.

---

# 135. Final Product UI Principle

Formivo should feel like one coherent product.

Not:

```text
Landing page from one template
+
Dashboard from another template
+
Client portal from another template
```

Instead:

```text
One design language
+
One interaction philosophy
+
One information hierarchy
+
One professional product identity
```

The final experience should make the user think:

> **"This feels like a real SaaS product I could confidently use for client projects."**