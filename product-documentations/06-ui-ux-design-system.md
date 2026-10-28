# Formivo — UI/UX Design System

**Document:** `06-ui-ux-design-system.md`  
**Product:** Formivo  
**Version:** Version 3.0  
**Status:** Implementation-Ready

---

# 1. Purpose

This document defines the complete UI/UX direction for Formivo.

The goal is to create a product that feels:

- Premium
- Professional
- Modern
- Fast
- Trustworthy
- Developer-friendly
- Commercially credible
- Simple without feeling empty

Formivo must not look like:

- A generic AI-generated dashboard
- A SaaS template
- A Dribbble concept
- A cryptocurrency dashboard
- An overly colorful startup landing page
- A collection of giant cards
- A UI overloaded with gradients and animations

The visual quality should be comparable in craftsmanship to products such as Linear, Vercel, Stripe, Notion, Resend, Raycast, and Supabase while maintaining an original Formivo identity.

---

# 2. Core Design Philosophy

Formivo should communicate:

> **Serious software that gets out of the way.**

The interface should prioritize:

1. Clarity
2. Hierarchy
3. Speed
4. Consistency
5. Useful information
6. Excellent typography
7. Strong spacing
8. Predictable interactions

Every visual element should have a reason to exist.

---

# 3. Design Personality

Formivo's personality is:

```text
Professional
Technical
Minimal
Confident
Precise
Calm
Modern
Useful
```

It should not feel:

```text
Playful
Childish
Noisy
Over-animated
Luxury-fashion
Corporate-enterprise
Gaming
AI-gimmicky
```

---

# 4. Inspiration Direction

Use these products as quality references:

- Linear
- Vercel
- Stripe
- Notion
- Resend
- Raycast
- Supabase
- GitHub

Do not copy:

- Their exact layouts
- Their logos
- Their colors
- Their illustrations
- Their navigation
- Their typography
- Their component styling

Formivo must have its own visual identity.

---

# 5. Brand Positioning

Formivo is a developer/agency infrastructure product.

The interface should make users feel:

> "This is infrastructure I can trust with my clients' websites and leads."

Not:

> "This is a simple form plugin."

---

# 6. Visual Hierarchy

Every page should have a clear hierarchy:

```text
Page purpose
    ↓
Primary action
    ↓
Important information
    ↓
Supporting information
    ↓
Secondary actions
```

Do not give every element equal visual weight.

---

# 7. Typography

Use a modern professional sans-serif font.

Preferred:

```text
Inter
```

Alternative:

```text
Geist
```

if the repository already uses it consistently.

Do not mix multiple unrelated font families.

---

# 8. Typography Scale

Recommended scale:

| Purpose | Size | Weight |
|---|---:|---:|
| Display | 56–72px | 600–700 |
| Hero heading | 48–64px | 600–700 |
| Page heading | 32–40px | 600 |
| Section heading | 24–28px | 600 |
| Card heading | 18–20px | 600 |
| Body large | 17–18px | 400 |
| Body | 14–16px | 400 |
| Small | 13px | 400 |
| Caption | 12px | 400–500 |
| Code | 13–14px | 400 |

Do not make every heading huge.

---

# 9. Typography Rules

Use:

- Strong hierarchy
- Comfortable line height
- Moderate letter spacing
- Short readable paragraphs
- Clear labels

Avoid:

- Excessive uppercase text
- Tiny gray text everywhere
- Extremely bold headings
- Long dense paragraphs inside cards

---

# 10. Color Philosophy

Formivo should use a restrained palette.

Recommended foundation:

```text
Background:
#0B0D10

Surface:
#111419

Surface Elevated:
#161A20

Border:
#252A33

Primary Text:
#F5F7FA

Secondary Text:
#A5ACB8

Muted Text:
#737B88
```

These values are starting points, not immutable requirements.

---

# 11. Accent Color

Use one primary accent color.

Recommended direction:

```text
Teal / Cyan-green
```

Example:

```text
#2DD4BF
```

Supporting accent:

```text
#14B8A6
```

The exact production values may be refined during implementation.

The accent should be used for:

- Primary buttons
- Active navigation
- Links
- Focus states
- Important highlights
- Success-adjacent UI where appropriate

Do not flood the entire interface with accent color.

---

# 12. Semantic Colors

Use semantic colors consistently.

```text
Success:
Green

Warning:
Amber

Error:
Red

Information:
Blue

Neutral:
Gray
```

Semantic colors should not replace the primary brand color.

---

# 13. Dark Mode

Dark mode is the primary Formivo dashboard experience.

The dashboard should feel excellent in dark mode rather than simply being a light UI with inverted colors.

Important:

- Maintain contrast
- Avoid pure black everywhere
- Use layered surfaces
- Use subtle borders
- Preserve readable muted text

---

# 14. Light Mode

If light mode is implemented in V1, it should use:

```text
White / near-white backgrounds
Dark text
Light borders
Subtle surfaces
```

Do not make light mode an afterthought.

However, dark mode remains the primary visual reference.

---

# 15. Borders

Borders should be subtle.

Recommended:

```text
1px solid rgba(...)
```

or equivalent theme token.

Use borders to:

- Separate sections
- Define tables
- Separate sidebar/navigation
- Define cards
- Create input boundaries

Do not outline every small element.

---

# 16. Border Radius

Use moderate radius values.

Recommended:

```text
Small:
6px

Default:
8px

Medium:
10px

Large:
12–16px
```

Avoid:

```text
24px
32px
40px
```

for ordinary UI elements.

The product should not feel like a collection of floating bubbles.

---

# 17. Shadows

Use shadows sparingly.

Preferred:

- Minimal elevation
- Subtle dropdown shadows
- Modal elevation
- Toast elevation

Avoid:

- Huge soft shadows
- Glowing cards
- Excessive depth
- Floating-everything design

---

# 18. Gradients

Gradients are not a core Formivo visual language.

Avoid large gradient backgrounds.

A subtle gradient may be used in marketing visuals if it has a clear purpose.

Do not use:

```text
purple → pink → blue
```

startup gradients everywhere.

---

# 19. Glassmorphism

Avoid glassmorphism as a default design pattern.

Do not build the dashboard from:

```text
backdrop blur
+
transparent cards
+
large shadows
```

The dashboard should feel like a professional application.

---

# 20. Layout System

Use a consistent spacing system.

Recommended base unit:

```text
4px
```

Common spacing:

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

Do not use arbitrary spacing values throughout the application.

---

# 21. Dashboard Layout

Recommended structure:

```text
┌─────────────────────────────────────────────┐
│ Top Bar                                     │
├───────────────┬─────────────────────────────┤
│               │                             │
│ Sidebar       │ Main Content                │
│               │                             │
│               │                             │
│               │                             │
└───────────────┴─────────────────────────────┘
```

Desktop:

- Fixed or sticky sidebar
- Scrollable content
- Compact top navigation

Mobile:

- Sidebar becomes drawer
- Top bar remains accessible
- Content becomes single-column

---

# 22. Sidebar

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

The exact navigation may be simplified depending on the current page context.

Sidebar should include:

- Formivo logo
- Workspace switcher
- Navigation
- Upgrade indicator when relevant
- User menu

---

# 23. Sidebar Design

The sidebar should be:

- Compact
- Quiet
- Functional

Active item:

```text
Subtle accent background
+
Accent text/icon
```

Inactive item:

```text
Muted text
```

Avoid oversized navigation buttons.

---

# 24. Workspace Switcher

At the top of the sidebar:

```text
[ Workspace Name ▼ ]
```

Clicking opens:

```text
Workspace
----------------
Current workspace
Other workspace
----------------
Create workspace
```

Do not show unnecessary workspace statistics in the switcher.

---

# 25. Top Bar

The top bar may include:

```text
Breadcrumb / Page title
Search if required
Notifications if required
User avatar
```

Do not overload the header.

---

# 26. Dashboard Overview

The overview should answer:

> "What is happening with my forms right now?"

Recommended structure:

```text
Page Header
    ↓
Primary CTA
    ↓
Key metrics
    ↓
Recent leads
    ↓
Form performance
```

---

# 27. Metrics

Recommended overview metrics:

```text
Total Leads
New Leads
Active Forms
Current Usage
```

Avoid fake metrics.

Every displayed number must come from real application data.

---

# 28. Metric Cards

Metric cards should be compact.

Example:

```text
Total Leads
248

+18 this month
```

Avoid giant cards that consume most of the screen.

---

# 29. Forms Page

The forms page is one of the most important areas.

Recommended layout:

```text
Forms
Manage your connected forms

[ + New Form ]

------------------------------------------------

Form                 Leads      Status     Actions
Contact Form         124        Active     ...
Booking Form         82         Active     ...
```

---

# 30. Forms Table

Desktop should use a table where appropriate.

Columns:

```text
Name
Status
Leads
Created
Actions
```

Optional:

```text
Last submission
```

Do not display excessive columns.

---

# 31. Forms Mobile Layout

On mobile, transform the table into stacked list items or cards.

Each item should show:

```text
Form name
Status
Lead count
Primary action
More menu
```

Do not force users to horizontally scroll through a large desktop table.

---

# 32. New Form Experience

When clicking:

```text
+ New Form
```

show the available options.

V1:

```text
Connect Custom Form
Available now

Use an existing HTML/React/Next.js form and send submissions to Formivo.

---------------------------------

Embedded Form Builder
Coming Soon

Create forms directly inside Formivo.

Coming soon
```

The second option must not appear functional.

---

# 33. Form Creation UI

Form creation should be short.

Fields:

```text
Form name
Description
```

Example:

```text
Form name
Website Contact Form

Description
Main contact form for the company website
```

Primary CTA:

```text
Create Form
```

---

# 34. Integration Setup Page

After creating a form:

```text
Your form is ready.

1. Add your Formivo endpoint
2. Add your secret securely
3. Send submissions
4. Test the connection
```

Show:

```text
Endpoint
Secret
Example request
```

---

# 35. Secret Display

When the secret is generated:

```text
Form Secret

fm_live_****************

[Copy]

Keep this secret on your server.
You will not be able to view it again.
```

Use a clear warning.

Never visually expose secrets unnecessarily.

---

# 36. Secret Copy Interaction

When copied:

```text
Copied
```

Use a subtle toast.

Do not use:

```text
🎉 SECRET COPIED!!!
```

---

# 37. Integration Code

Show a clean code block:

```ts
await fetch("https://app.formivo.com/api/v1/forms/FORM_ID/submissions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer FORM_SECRET"
  },
  body: JSON.stringify({
    data: {
      name,
      email,
      message
    }
  })
});
```

Provide a copy button.

The code should be syntax highlighted but restrained.

---

# 38. Integration Guidance

Show a clear recommendation:

```text
Recommended

Send submissions from your server so the Formivo secret stays private.
```

This should be visually distinct but not alarming.

---

# 39. Test Submission

Integration setup should provide:

```text
[ Send Test Submission ]
```

The test should execute through the same core submission service.

Success:

```text
Test submission received.
Lead created successfully.
```

Failure:

```text
Test failed.
Check your configuration and try again.
```

---

# 40. Lead Management

Leads are the core operational area.

The page should prioritize:

```text
Search
Filter
Status
Date
Form
```

Then:

```text
Lead table
```

---

# 41. Lead Table

Recommended columns:

```text
Name / Primary Field
Email / Primary Field
Form
Status
Created
```

Because lead fields are dynamic, the UI should intelligently identify common fields such as:

```text
name
full_name
email
phone
company
```

If these fields do not exist, show a useful generic representation.

---

# 42. Lead Detail

Lead detail should feel like a professional record view.

Recommended structure:

```text
← Back to Leads

John Doe
john@example.com

Status: New

--------------------------------

Lead Data

Name       John Doe
Email      john@example.com
Message    Hello...

--------------------------------

Metadata

Page       /contact
Source     website

Created
Oct 5, 2026
```

---

# 43. Lead Status UI

Use a compact status control:

```text
[ New ▼ ]
```

Options:

```text
New
Contacted
Qualified
Converted
Archived
```

Each status should have a subtle semantic indicator.

---

# 44. Search

Search should feel instant.

Placeholder:

```text
Search leads...
```

Search should support relevant lead values.

Example:

```text
john@example.com
John
Acme
```

---

# 45. Filters

Useful filters:

```text
Status
Form
Date
```

Avoid adding complex filtering in V1.

---

# 46. Empty State

Every major page needs a useful empty state.

Example:

```text
No leads yet

Connect your form and your first submission will appear here.

[ View Integration ]
```

Avoid:

```text
Nothing here 😢
```

---

# 47. Loading States

Use skeleton loading for content-heavy areas.

Example:

```text
████████████
██████
████████████████
```

Avoid showing spinners for every small interaction.

Use skeletons for:

- Tables
- Dashboard metrics
- Analytics
- Lead details

---

# 48. Error States

Error pages should be actionable.

Example:

```text
Something went wrong

We couldn't load your leads.

[ Try Again ]
```

Do not expose technical errors.

Never show:

```text
Postgres error: relation public.leads...
```

---

# 49. Toasts

Use toasts for short-lived confirmations.

Examples:

```text
Form created.
Secret copied.
Lead updated.
Invitation sent.
Form archived.
```

Toasts should:

- Be short
- Auto-dismiss
- Be accessible
- Not contain critical information exclusively

---

# 50. Buttons

Button hierarchy:

### Primary

For the most important action.

```text
Create Form
Upgrade
Send Invitation
```

### Secondary

For supporting actions.

```text
Cancel
Copy
View Details
```

### Destructive

For dangerous actions.

```text
Revoke Access
Archive Form
```

Destructive actions require confirmation where appropriate.

---

# 51. Button Styling

Buttons should have:

- Clear text
- Moderate radius
- Consistent height
- Visible focus state
- Clear disabled state

Avoid oversized pill buttons.

---

# 52. Button Sizes

Recommended:

```text
Small: 32px
Default: 36–40px
Large: 44px
```

Do not make every CTA 56–64px tall.

---

# 53. Inputs

Inputs should have:

- Clear labels
- Visible focus state
- Useful placeholders
- Error messages
- Appropriate spacing

Example:

```text
Form name
[ Website Contact Form            ]

Description
[ Main website contact form       ]
```

---

# 54. Input Errors

Show errors close to the input.

Example:

```text
Email
[ invalid-email ]

Please enter a valid email address.
```

Do not only display errors at the top of the page.

---

# 55. Forms and Accessibility

Every form input must have:

- Accessible label
- Keyboard support
- Focus state
- Error association
- Appropriate autocomplete where relevant

Do not use placeholder text as the only label.

---

# 56. Modals

Use modals for:

- Confirm archive
- Confirm revoke
- Important destructive actions
- Small focused workflows

Avoid putting complete multi-page workflows into huge modals.

---

# 57. Confirmation Modal

Example:

```text
Archive this form?

New submissions will stop being accepted.
Existing leads will remain available.

[Cancel] [Archive Form]
```

The destructive action should be visually clear.

---

# 58. Dropdown Menus

Use dropdowns for:

- Form actions
- Lead actions
- Account actions
- Workspace actions

Keep menus short.

Example:

```text
View
Integration
Archive
```

---

# 59. Tables

Tables should have:

- Clear column hierarchy
- Subtle borders
- Hover state
- Comfortable row height
- Sticky header only where useful
- Pagination

Avoid extremely dense enterprise tables.

---

# 60. Table Row Interaction

If the entire row is clickable:

- Show hover state
- Maintain keyboard accessibility
- Provide a clear focus state

Do not create nested clickable elements that behave unpredictably.

---

# 61. Analytics

Analytics should answer:

> "How are my forms performing?"

Recommended:

```text
Leads
New
Qualified
Converted
```

and:

```text
Submission trend
```

Use simple charts.

Do not create an analytics dashboard with ten meaningless charts.

---

# 62. Analytics Chart

A primary chart could show:

```text
Leads over time
```

Example:

```text
Leads
│
│        ╭──╮
│    ╭───╯  ╰──╮
│ ───╯         ╰──
└──────────────────
    Oct 1 → Oct 30
```

Keep charts readable.

---

# 63. Chart Rules

Charts must:

- Use real data
- Have accessible labels
- Show empty states
- Handle zero values
- Work on mobile
- Avoid decorative complexity

---

# 64. Client Dashboard

Client dashboard should be intentionally simpler.

Client navigation:

```text
Overview
Forms
Leads
Analytics
```

Do not show:

```text
Billing
Workspace administration
Secrets
Invitations
Developer settings
```

---

# 65. Client Dashboard Design

The client should immediately understand:

```text
Which form is mine?
How many leads arrived?
What are the latest leads?
```

The experience should feel like a clean client portal.

---

# 66. Client Portal Branding

V1 should use Formivo branding.

Do not implement full white-label functionality.

The client's company name may appear in contextual areas where appropriate.

---

# 67. Billing Page

Billing page should clearly show:

```text
Current Plan
Usage
Billing Status
Next Renewal
Available Plans
```

Example:

```text
Pro

$9 / month

Forms
4 / 10

Monthly leads
642 / 2,000

View billing
```

---

# 68. Pricing Cards

Pricing should remain simple.

Plans:

```text
Free
$0

Pro
$9/month

Agency
$29/month
```

Each plan should clearly explain its limits.

Do not use fake:

```text
"Most Popular!"
```

unless there is a genuine product reason.

---

# 69. Upgrade Experience

When a user reaches a limit:

```text
You've reached your free plan limit.

Upgrade to Pro to create more forms and manage more leads.

[ Upgrade to Pro ]
```

Do not block users without explaining why.

---

# 70. Onboarding

First-time onboarding should be short.

Recommended:

```text
Welcome to Formivo

Let's connect your first form.

[ Create Your First Form ]
```

Avoid a long multi-step questionnaire.

---

# 71. Onboarding Progress

If progress is shown:

```text
1. Create form
2. Connect website
3. Receive first lead
```

Do not create ten onboarding steps.

---

# 72. Marketing Website

The marketing website should feel different from the dashboard while sharing the same design language.

Recommended sections:

```text
Navigation
Hero
How it works
Core workflow
Features
Client portal
Pricing
FAQ
Final CTA
Footer
```

---

# 73. Hero

Core message:

> Connect your forms. Capture your leads. Give clients their dashboard.

Supporting text should explain the product in one or two sentences.

Primary CTA:

```text
Start Free
```

Secondary CTA:

```text
View Docs
```

Do not use vague copy such as:

```text
The future of business communication.
```

---

# 74. Marketing Visual

The product itself should be the hero visual.

Show:

```text
Formivo dashboard
+
Lead table
+
Client portal
```

Avoid generic stock photography.

---

# 75. Feature Sections

Focus on actual V1 features:

```text
Connect existing forms
Centralized leads
Simple analytics
Client dashboards
Secure endpoints
Usage controls
```

Do not advertise future features as if they already exist.

---

# 76. Social Proof

Do not fabricate:

- Customer logos
- Testimonials
- User counts
- Revenue numbers
- Case studies
- Awards

If genuine social proof is not available, omit it.

---

# 77. Marketing Navigation

Recommended:

```text
Product
Pricing
Docs
Sign In
Start Free
```

Keep navigation compact.

---

# 78. Footer

Footer may contain:

```text
Product
Pricing
Docs

Company
About
Contact

Legal
Privacy
Terms

© Formivo
```

Only include pages that actually exist.

---

# 79. Responsive Design

Formivo must be responsive from the beginning.

Breakpoints may follow Tailwind defaults:

```text
sm
md
lg
xl
2xl
```

Do not design desktop first and "fix mobile later."

---

# 80. Mobile Navigation

Mobile:

```text
┌──────────────────────────┐
│ Formivo        ☰        │
└──────────────────────────┘
```

The sidebar opens as a drawer.

---

# 81. Mobile Tables

Tables should transform rather than simply overflow.

Priority:

1. Preserve essential information.
2. Hide secondary columns.
3. Move details into row views.
4. Allow detail pages to expose complete data.

---

# 82. Touch Targets

Interactive controls should generally provide approximately:

```text
44 × 44px
```

minimum touch target where practical.

Avoid tiny icon-only controls.

---

# 83. Iconography

Use a consistent icon set.

Recommended:

```text
Lucide
```

Icons should be:

- Simple
- Line-based
- Consistent
- Small

Avoid mixing icon styles.

---

# 84. Icon Rules

Do not use icons merely for decoration.

Icons should communicate:

- Navigation
- Action
- Status
- Context

Do not put five icons next to every piece of text.

---

# 85. Emoji Policy

Avoid emoji as UI icons.

Do not use:

```text
🚀 Forms
🔥 Leads
💰 Billing
```

Formivo is a professional developer product.

---

# 86. Animation

Animation should be subtle.

Good:

- Dropdown transition
- Modal transition
- Toast entrance
- Skeleton shimmer
- Button feedback
- Page transitions where appropriate

Avoid:

- Constant floating elements
- Parallax everywhere
- Huge animated gradients
- Excessive bouncing
- Slow transitions

---

# 87. Animation Timing

Recommended:

```text
Fast:
100–150ms

Normal:
150–250ms

Large transition:
250–350ms
```

Respect:

```text
prefers-reduced-motion
```

---

# 88. Accessibility

Target:

```text
WCAG 2.2 AA
```

Where practical.

Required:

- Keyboard navigation
- Visible focus
- Semantic HTML
- Accessible labels
- Sufficient contrast
- Screen-reader support
- Reduced-motion support
- Accessible dialogs
- Accessible dropdowns
- Accessible tables

---

# 89. Focus States

Every interactive element must have a visible focus state.

Do not remove browser focus outlines without providing a better equivalent.

---

# 90. Color Contrast

Do not rely only on color.

For example:

Bad:

```text
Red = error
Green = success
```

Better:

```text
Icon + text + color
```

This improves accessibility.

---

# 91. Skeleton Loading

Skeletons should approximate the final layout.

Do not create random animated blocks.

Example:

```text
Metric
████████

Table
████████████████
████████████████
████████████████
```

---

# 92. Empty States

Empty states should answer:

1. What is empty?
2. Why is it empty?
3. What should I do next?

Example:

```text
No forms yet

Create your first form and connect it to your website.

[ Create Form ]
```

---

# 93. Error Recovery

Every recoverable error should provide an action.

Examples:

```text
Try again
Go back
Return to dashboard
Reconnect
```

---

# 94. Destructive Actions

Destructive actions require clear language.

Bad:

```text
Delete?
```

Better:

```text
Archive "Website Contact Form"?

New submissions will stop being accepted.
Existing leads will remain available.

[Cancel] [Archive Form]
```

---

# 95. Form Status Indicators

Use subtle status badges.

Examples:

```text
Active
Archived
```

The badge should not dominate the row.

---

# 96. Status Badge Style

Recommended:

```text
small text
+
subtle background
+
optional dot
```

Avoid huge colored pills.

---

# 97. Code Blocks

Code blocks should use:

- Monospace font
- Dark surface
- Subtle border
- Horizontal scrolling when required
- Copy button

Do not make code blocks visually overwhelming.

---

# 98. Copy Buttons

Copy actions should confirm success.

Example:

```text
Copy
```

after click:

```text
Copied
```

Return to:

```text
Copy
```

after a short period.

---

# 99. Tooltips

Use tooltips for unfamiliar icon-only actions.

Do not use tooltips for obvious text buttons.

---

# 100. Navigation Breadcrumbs

Use breadcrumbs on deeper pages.

Example:

```text
Forms / Website Contact Form / Integration
```

This is especially useful for:

- Form settings
- Integration
- Lead detail

---

# 101. Page Header Pattern

Standard dashboard page:

```text
[Breadcrumb]

Page Title
Short description

                         [Primary Action]
```

Example:

```text
Forms

Connect and manage your website forms.

                         [+ New Form]
```

---

# 102. Detail Page Pattern

```text
Back

Title
Description / metadata

Primary actions

--------------------------------

Main content
```

Keep detail pages focused.

---

# 103. Settings Page

Settings should use sections.

Example:

```text
Settings

Profile
----------------

Workspace
----------------

Security
----------------

Billing
----------------
```

Avoid a giant single form.

---

# 104. Profile Settings

Allow:

```text
Full name
Avatar
Email display
```

Authentication-sensitive email/password operations should use Supabase Auth flows.

---

# 105. Workspace Settings

V1:

```text
Workspace name
```

Do not add unnecessary organization management features.

---

# 106. Security Settings

Potential V1 items:

```text
Session/account security
```

Form secrets should be managed at the form level, not exposed globally.

---

# 107. Design Tokens

Implement design tokens rather than hardcoding styles everywhere.

Example:

```text
--background
--foreground
--surface
--surface-elevated
--border
--muted
--primary
--primary-foreground
--success
--warning
--destructive
```

---

# 108. Component Architecture

Use reusable components.

Recommended:

```text
Button
Input
Textarea
Select
Badge
Card
Table
Dialog
DropdownMenu
Toast
Tooltip
Tabs
Skeleton
EmptyState
ErrorState
Pagination
CodeBlock
```

---

# 109. Formivo-Specific Components

Create reusable domain components:

```text
FormCard
FormTable
FormStatusBadge
LeadTable
LeadStatusBadge
LeadDetail
UsageMeter
PlanCard
InvitationDialog
IntegrationCodeBlock
SecretDisplay
WorkspaceSwitcher
ClientAccessTable
AnalyticsChart
```

---

# 110. Component Rules

Components should be:

- Reusable
- Accessible
- Composable
- Typed
- Consistent

Avoid:

```text
One giant Dashboard.tsx
```

with thousands of lines.

---

# 111. Component Variants

Use controlled variants.

Example:

```text
Button:
primary
secondary
ghost
destructive
```

Do not create dozens of near-identical variants.

---

# 112. Spacing Inside Cards

Cards should generally use:

```text
16px
20px
24px
```

depending on content.

Avoid cards with:

```text
40px+
```

padding everywhere.

---

# 113. Card Usage

Cards should group meaningful information.

Good:

```text
Current Usage
```

Bad:

```text
Everything inside a card
```

Not every section needs a card.

---

# 114. Page Backgrounds

Dashboard:

```text
Dark neutral background
```

Content surfaces:

```text
Slightly lighter neutral
```

Use contrast through layers, not bright colors.

---

# 115. Marketing Page Width

Recommended content width:

```text
1100–1280px
```

depending on section.

Text blocks should generally remain narrower:

```text
600–760px
```

for readability.

---

# 116. Dashboard Content Width

Use a flexible content container.

Recommended:

```text
max-width: 1440px
```

with appropriate horizontal padding.

Do not unnecessarily constrain dense operational pages.

---

# 117. Marketing Typography

Marketing typography can be larger than dashboard typography.

Hero:

```text
48–64px
```

Desktop.

Mobile:

```text
36–44px
```

Avoid 100px+ text.

---

# 118. Landing Page CTA Hierarchy

Primary:

```text
Start Free
```

Secondary:

```text
View Docs
```

Only one primary CTA should dominate each section.

---

# 119. Documentation UI

Docs should be:

- Clean
- Searchable
- Code-friendly
- Well structured

Potential navigation:

```text
Getting Started
Authentication
Submitting Leads
API Reference
Security
```

Only publish documentation for features that actually exist.

---

# 120. Visual Consistency Rule

A user should feel that:

```text
Marketing site
+
Dashboard
+
Client portal
+
Documentation
```

belong to the same product.

Shared:

- Typography
- Color language
- Spacing
- Icons
- Button language
- Brand identity

---

# 121. UX Writing

Use concise, direct language.

Good:

```text
Create form
```

Bad:

```text
Click here to create a brand-new form now!
```

Good:

```text
No leads yet
```

Bad:

```text
Looks like your lead universe is still waiting to explode!
```

---

# 122. Error Copy

Errors should explain the problem without blaming the user.

Good:

```text
We couldn't process this submission. Please check the form configuration and try again.
```

Bad:

```text
You entered something wrong.
```

---

# 123. Confirmation Copy

Good:

```text
Invitation sent.
```

Bad:

```text
Your invitation has been successfully and spectacularly dispatched!
```

---

# 124. Loading Copy

Avoid unnecessary text.

Prefer:

```text
Loading...
```

or skeleton UI.

Do not repeatedly display:

```text
Please wait while our powerful infrastructure prepares your experience...
```

---

# 125. Mobile UX Principle

On mobile:

> Reduce complexity, not functionality.

The user should still be able to:

- View forms
- View leads
- Update lead status
- View analytics
- Manage basic settings
- Access important actions

---

# 126. Performance UX

The interface should feel fast.

Use:

- Server Components where appropriate
- Streaming where useful
- Skeleton states
- Optimistic updates for safe mutations
- Pagination
- Lazy loading for heavy components
- Efficient queries

Do not add loading animations to hide slow architecture.

---

# 127. Optimistic UI

Good candidates:

```text
Lead status update
Archive action
Simple preference updates
```

Do not optimistically update operations where failure could create confusing state.

---

# 128. Data Freshness

After mutations:

- Revalidate affected data
- Update local state where appropriate
- Avoid full-page reloads

Example:

```text
Lead status changed
    ↓
Update row
    ↓
Refresh relevant analytics if required
```

---

# 129. Security UX

Security should be visible without becoming annoying.

Important moments:

### Secret creation

Explain:

```text
Keep this secret on your server.
```

### Invitation

Explain:

```text
This person will only see the form and leads you assign.
```

### Billing

Clearly show:

```text
Current plan
Usage
```

---

# 130. Trust Signals

Use real product signals:

- Clear security messaging
- Clear permissions
- Transparent pricing
- Documentation
- Reliable error handling
- Professional UI
- Clear API examples

Do not manufacture trust through fake badges.

---

# 131. Avoid AI-Generated UI Patterns

The implementation must specifically avoid:

```text
Huge gradient hero
Three oversized cards
Random purple gradients
Glassmorphism
Floating blobs
Excessive rounded corners
Emoji icons
Fake dashboard screenshots
Fake testimonials
Fake customer logos
Fake statistics
Generic "AI-powered" language
```

---

# 132. Avoid Template-Like Dashboards

Do not build:

```text
Sidebar
+
Top bar
+
12 identical cards
+
random chart
+
random table
```

Instead, design each page around its actual job.

---

# 133. Dashboard Principle

Every dashboard page must answer:

> What does the user need to know or do here?

Examples:

### Forms

Connect and manage forms.

### Leads

Review and organize submissions.

### Analytics

Understand submission activity.

### Clients

Manage viewer access.

### Billing

Understand plan and usage.

---

# 134. Visual Density

Formivo should use medium information density.

Not:

```text
Too sparse
```

and not:

```text
Enterprise spreadsheet
```

The interface should feel efficient.

---

# 135. Desktop Density

Desktop should use available horizontal space effectively.

Avoid enormous empty margins around operational content.

---

# 136. Mobile Density

Mobile should prioritize:

```text
Primary information
Primary action
Secondary details
```

Hide non-essential metadata where necessary.

---

# 137. Accessibility Testing

Before release test:

- Keyboard-only navigation
- Tab order
- Focus visibility
- Screen reader labels
- Contrast
- Modal focus trapping
- Escape behavior
- Reduced motion
- Mobile touch targets

---

# 138. Browser Testing

Test at minimum:

```text
Chrome
Edge
Safari
Firefox
```

Desktop and mobile responsive layouts should be checked.

---

# 139. UI Quality Gate

A page is not complete merely because it works.

Every page should pass:

```text
Visual hierarchy
Responsive behavior
Accessibility
Loading state
Empty state
Error state
Success state
Keyboard interaction
Mobile layout
Data realism
```

---

# 140. Final Design System Checklist

Before considering Formivo UI V1 complete:

- [ ] Typography is consistent
- [ ] Spacing system is consistent
- [ ] Colors use design tokens
- [ ] Buttons are consistent
- [ ] Inputs are consistent
- [ ] Tables are consistent
- [ ] Status badges are consistent
- [ ] Dialogs are accessible
- [ ] Toasts are consistent
- [ ] Navigation is consistent
- [ ] Dashboard is responsive
- [ ] Client portal is responsive
- [ ] Marketing site is responsive
- [ ] Empty states exist
- [ ] Loading states exist
- [ ] Error states exist
- [ ] Success feedback exists
- [ ] Keyboard navigation works
- [ ] Reduced motion is supported
- [ ] No fake data is used
- [ ] No fake testimonials are used
- [ ] No fake customer logos are used
- [ ] No excessive gradients are used
- [ ] No unnecessary animations are used
- [ ] No emoji-based navigation is used
- [ ] No Stripe references exist
- [ ] No V1 non-goal UI is exposed as functional

---

# 141. Final UI Principle

Formivo should feel like:

> **A serious developer product built by people who care about software quality.**

The visual system should communicate confidence through:

```text
Typography
+
Spacing
+
Hierarchy
+
Consistency
+
Performance
+
Useful interaction
```

—not through visual noise.

The final product should feel premium because it is **clear, intentional, fast, and trustworthy**.