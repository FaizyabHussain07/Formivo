/**
 * Comparison pages.
 *
 * Rules applied here:
 *   - Formivo's own behavior is described from the product, not from marketing copy.
 *   - A competitor is described by category and workflow, never with invented prices,
 *     ratings or feature claims. Where a specific fact is stated it links to the
 *     provider's own page and says to re-check it.
 *   - No page claims a competitor lacks something unless the difference is structural
 *     (a form builder is not a form backend).
 */

export type ComparisonRow = { dimension: string; formivo: string; competitor: string };

export type Comparison = {
  slug: string;
  competitor: string;
  competitorUrl: string;
  title: string;
  seoTitle: string;
  description: string;
  /** One-line answer for answer engines. */
  answer: string;
  summary: string;
  category: "form backend" | "form builder" | "email forwarding";
  competitorSummary: string;
  bestFor: string[];
  formivoFit: string[];
  rows: ComparisonRow[];
  /** What to verify on the competitor's site before switching. */
  verify: string[];
  faq: { question: string; answer: string }[];
};

export const comparisons: Comparison[] = [
  {
    slug: "formivo-vs-formsubmit",
    competitor: "FormSubmit",
    competitorUrl: "https://formsubmit.co/",
    title: "Formivo vs FormSubmit",
    seoTitle: "Formivo vs FormSubmit: Form Backend or Email Forwarding?",
    description:
      "FormSubmit forwards a form submission to an email address. Formivo stores submissions in a dashboard and gives each client a scoped read-only view. Compare the two workflows.",
    answer:
      "FormSubmit is an email-forwarding endpoint: the submission becomes an email. Formivo stores the submission as a record you can search, filter, status and share with a client. Choose FormSubmit for a one-page site that only needs email; choose Formivo when the submission itself has to be managed.",
    summary:
      "Both let you point an HTML form at a URL with no backend of your own. The difference is where the submission lives afterwards.",
    category: "email forwarding",
    competitorSummary:
      "A free form-to-email endpoint used by static sites. The integration is a form action change, and delivery is an email to an address you confirm.",
    bestFor: [
      "A single static page whose only requirement is an email notification.",
      "Sites that never need to look at the submission again.",
      "Projects where a visual dashboard would never be opened.",
    ],
    formivoFit: [
      "You want the submission stored as a record, not only delivered as email.",
      "Several people or clients need to read the same submissions.",
      "You need per-form access control instead of forwarding an inbox.",
    ],
    rows: [
      {
        dimension: "Where a submission goes",
        formivo: "Stored in the workspace dashboard and readable by permitted accounts",
        competitor: "Delivered to an email address",
      },
      {
        dimension: "Search and status",
        formivo: "Search across fields, filter by form, six lead statuses",
        competitor: "Whatever your email client provides",
      },
      {
        dimension: "Client access",
        formivo: "Per-form read-only client accounts, revocable",
        competitor: "Share or forward the email",
      },
      {
        dimension: "Integration",
        formivo: "Form action URL, no key",
        competitor: "Form action URL",
      },
      {
        dimension: "Export",
        formivo: "CSV on paid plans, enforced server-side",
        competitor: "Not applicable to a mail delivery",
      },
      {
        dimension: "Abuse control",
        formivo: "Honeypot, database rate limits, optional origin allow-list, quota",
        competitor: "Verify the provider's current spam handling before relying on it",
      },
    ],
    verify: [
      "Current free limits and any activation step on the FormSubmit site.",
      "How spam submissions are filtered today, and whether they count towards a limit.",
      "Whether delivery failures are retried or surfaced to the form owner.",
    ],
    faq: [
      {
        question: "Can I use both?",
        answer:
          "Yes, on different forms. They are independent endpoints. Running two copies of the same form is not recommended because you would own two divergent records.",
      },
      {
        question: "Does Formivo send an email for each submission?",
        answer:
          "Email notifications are not part of the current release. The submission is stored in the dashboard, which is the source of truth. If you need an email, forward the request from your own server.",
      },
    ],
  },
  {
    slug: "formivo-vs-formspree",
    competitor: "Formspree",
    competitorUrl: "https://formspree.io/plans",
    title: "Formivo vs Formspree",
    seoTitle: "Formivo vs Formspree: Which Fits Client Work?",
    description:
      "Formspree is a mature form backend with broad integrations. Formivo is smaller and built around per-client read-only access. Compare the workflow after the submit button.",
    answer:
      "Both accept a POST from an existing form. Formspree is built around email and integrations for a single owner. Formivo is built around stored submissions and per-form read-only client accounts. The right choice depends on whether you hand leads to clients.",
    summary:
      "Formspree has more integrations and a longer track record. Formivo has a narrower model where a client is a viewer of one form, not a second account sharing your workspace.",
    category: "form backend",
    competitorSummary:
      "A long-running form backend with framework plugins, spam filtering and email delivery. Plans are priced by monthly submission volume.",
    bestFor: [
      "You need a specific integration that Formspree already ships.",
      "You mostly need email delivery plus an archive.",
      "You prefer unlimited forms on a free tier over a higher submission cap.",
    ],
    formivoFit: [
      "Clients need to read their own submissions without a shared login.",
      "You want access granted and revoked per form.",
      "You want a minimal endpoint that works with plain HTML and no key.",
    ],
    rows: [
      {
        dimension: "Primary model",
        formivo: "Stored submissions plus client portal",
        competitor: "Submission delivery plus integrations",
      },
      {
        dimension: "Per-form client access",
        formivo: "Built in: client accounts, revocable, read-only",
        competitor: "Team members share account access; verify the current client-facing options",
      },
      {
        dimension: "Email notifications",
        formivo: "Not implemented; the dashboard is the record",
        competitor: "Core feature",
      },
      {
        dimension: "Lead statuses",
        formivo: "New, read, contacted, qualified, converted, archived",
        competitor: "Check the current dashboard features on their site",
      },
      {
        dimension: "Endpoint key",
        formivo: "None: the form id is not a credential",
        competitor: "Form-specific endpoint",
      },
      {
        dimension: "Pricing",
        formivo: "Free, $9 Light, $19 Pro, $49 Agency per month",
        competitor: "See formspree.io/plans; prices and limits change",
      },
    ],
    verify: [
      "The current plan limits and which features sit behind which tier.",
      "Whether a client-facing read-only login exists and how it is scoped.",
      "Export formats and retention on the plan you would choose.",
    ],
    faq: [
      {
        question: "Can I migrate an existing Formspree form?",
        answer:
          "Create a form in Formivo and change the action URL. Field names carry over unchanged. Past submissions stay in Formspree unless you export them there.",
      },
      {
        question: "Is Formivo cheaper?",
        answer:
          "For the same submission volume, Formivo's published plans start at $9. Compare against Formspree's current plans page, which is the only reliable source for its limits.",
      },
    ],
  },
  {
    slug: "formivo-vs-basin",
    competitor: "Basin",
    competitorUrl: "https://usebasin.com/pricing",
    title: "Formivo vs Basin",
    seoTitle: "Formivo vs Basin: Projects, Collaborators and Client Portals",
    description:
      "Basin bundles forms, spam tooling and collaboration into projects. Formivo keeps the surface small and gives clients a read-only portal scoped to one form.",
    answer:
      "Basin is a broader form backend with projects, routing and heavy spam configuration. Formivo is deliberately narrower: one endpoint per form, a submission dashboard, and read-only client accounts. If you need advanced spam tooling, Basin covers more; if you need a client portal without a shared workspace, Formivo is the simpler fit.",
    summary:
      "Basin optimises for configuration and project management. Formivo optimises for handing one client one form's leads.",
    category: "form backend",
    competitorSummary:
      "A form backend with projects, collaborators, spam providers and configurable routing. Paid tiers unlock collaborators and higher volume.",
    bestFor: [
      "You need projects, routing rules and multiple spam provider options.",
      "You want file uploads and multi-step forms.",
      "You already work inside its project model.",
    ],
    formivoFit: [
      "Clients should be viewers, not collaborators with workspace access.",
      "You want client access included rather than a paid collaborator seat.",
      "You want a minimal endpoint and a small, predictable surface.",
    ],
    rows: [
      {
        dimension: "Client model",
        formivo: "Client viewer account, read-only, one form per invitation",
        competitor: "Collaborators with project access on paid tiers",
      },
      {
        dimension: "Configuration surface",
        formivo: "Small: form, endpoint, allowed origins, pause switch",
        competitor: "Broad: projects, routing, spam provider settings",
      },
      {
        dimension: "Free plan data retention",
        formivo: "Submissions stay until you delete them",
        competitor: "Check the current retention policy on their pricing page",
      },
      {
        dimension: "File uploads",
        formivo: "Not supported; submissions are field data only",
        competitor: "Offered on some plans",
      },
      {
        dimension: "Export",
        formivo: "CSV on paid plans",
        competitor: "Documented export formats vary by tier",
      },
      {
        dimension: "Pricing",
        formivo: "$0, $9, $19, $49 per month",
        competitor: "See usebasin.com/pricing for current tiers",
      },
    ],
    verify: [
      "Current collaborator limits and what a collaborator can see.",
      "Retention on the free tier and whether deleting a form deletes its submissions.",
      "Which spam providers are supported on the plan you would pick.",
    ],
    faq: [
      {
        question: "Does Formivo support file uploads?",
        answer:
          "No. The endpoint accepts JSON, urlencoded and multipart form data without files. A file field is rejected rather than silently dropped.",
      },
      {
        question: "Are collaborators the same as clients?",
        answer:
          "In Formivo, no: a collaborator model does not exist yet. Clients are read-only viewers of specific forms, and a workspace has one owner.",
      },
    ],
  },
  {
    slug: "formivo-vs-tally",
    competitor: "Tally",
    competitorUrl: "https://tally.so/pricing",
    title: "Formivo vs Tally",
    seoTitle: "Formivo vs Tally: Form Builder or Form Backend?",
    description:
      "Tally is a form builder that hosts the form. Formivo is a backend for the form you already built. They solve different halves of the same job.",
    answer:
      "Tally builds and hosts the form itself. Formivo does not build forms: it receives submissions from a form you already have. If you need a hosted form builder, Formivo is not a replacement. If you have your own HTML and need storage, search and client access, Formivo is the narrower tool.",
    summary:
      "This is not a like-for-like comparison. One product designs the form; the other manages what arrives after it.",
    category: "form builder",
    competitorSummary:
      "A hosted form builder with a visual editor, shareable forms and a response dashboard. Its forms live on its domain or an embed.",
    bestFor: [
      "You do not have a form yet and want to design one visually.",
      "You want the provider to host the form page.",
      "You are collecting data from a form you are happy to hand over to a third party.",
    ],
    formivoFit: [
      "The form is already built and styled inside your own site.",
      "You need submissions from multiple client websites in one workspace.",
      "You need read-only client access scoped per form.",
    ],
    rows: [
      {
        dimension: "Who owns the form UI",
        formivo: "You do: HTML, React, Next.js, any framework",
        competitor: "The builder hosts the form",
      },
      {
        dimension: "Integration",
        formivo: "Point the form action at the endpoint",
        competitor: "Use the hosted form, an embed or a share link",
      },
      {
        dimension: "Submission storage",
        formivo: "Your Formivo workspace",
        competitor: "The builder's dashboard",
      },
      {
        dimension: "Client read-only access",
        formivo: "Per-form client viewer accounts",
        competitor: "Verify the current sharing options on their site",
      },
      {
        dimension: "Design control",
        formivo: "Complete: your site's CSS applies",
        competitor: "Within the builder's design options",
      },
      {
        dimension: "Fit for client websites",
        formivo: "One workspace, many forms",
        competitor: "One account, many forms and share links",
      },
    ],
    verify: [
      "Whether the plan you need allows removing the provider's branding.",
      "How responses are shared with someone outside your account.",
      "Whether the builder can post into an existing HTML form.",
    ],
    faq: [
      {
        question: "Can I use Tally for the form and Formivo for storage?",
        answer:
          "Only if Tally can post to an external endpoint on your plan, or if you forward the submission from your own server. Check that capability on their current plan page before planning around it.",
      },
      {
        question: "Does Formivo replace a form builder?",
        answer:
          "No. Formivo has no form editor. It receives submissions and manages them. You keep your form markup and styling.",
      },
    ],
  },
  {
    slug: "formivo-vs-typeform",
    competitor: "Typeform",
    competitorUrl: "https://www.typeform.com/pricing/",
    title: "Formivo vs Typeform",
    seoTitle: "Formivo vs Typeform: Different Jobs, Different Tools",
    description:
      "Typeform is a hosted form and survey product. Formivo is a form backend for forms you already own. Compare them only if you are deciding where submissions should live.",
    answer:
      "Typeform is a hosted form and survey platform, not a backend for your existing form. Formivo stores submissions from a form you built and gives clients read-only access. They are complementary for most teams; Formivo is not a Typeform replacement.",
    summary:
      "If the requirement is a beautiful hosted survey, Typeform is the category leader. If the requirement is a backend for forms across client websites, Formivo is the narrower fit.",
    category: "form builder",
    competitorSummary:
      "A hosted form product focused on conversational forms and surveys, with its own responses dashboard.",
    bestFor: [
      "You need a hosted, conversational survey experience.",
      "You want the provider to handle the respondent-facing page.",
      "Your use case is research or lead capture rather than client website forms.",
    ],
    formivoFit: [
      "Your forms must live inside your own website design.",
      "You manage forms for several clients in one workspace.",
      "You need per-form read-only access for each client.",
    ],
    rows: [
      {
        dimension: "Form hosting",
        formivo: "Your site",
        competitor: "Typeform",
      },
      {
        dimension: "Migration effort",
        formivo: "Change one action URL",
        competitor: "Recreate the form in the builder",
      },
      {
        dimension: "Submission access",
        formivo: "Workspace plus scoped client viewers",
        competitor: "Within the provider's account and sharing model",
      },
      {
        dimension: "Custom design",
        formivo: "Your CSS, your components",
        competitor: "Theme options inside the product",
      },
      {
        dimension: "Pricing model",
        formivo: "Forms, submissions and client views",
        competitor: "Responses and features per tier",
      },
    ],
    verify: [
      "Current response limits per plan.",
      "Data-processing terms if submissions contain personal data.",
      "Whether white-labelling is available on the plan you would choose.",
    ],
    faq: [
      {
        question: "Which should an agency choose?",
        answer:
          "Use the builder when the client wants a hosted survey. Use Formivo when the form is part of a website you built and the client needs to read the enquiries that arrive.",
      },
      {
        question: "Does Formivo do surveys?",
        answer:
          "Yes in the sense that any field set can be posted to a form endpoint. It has no survey logic, branching or analytics beyond submission counts and per-form views.",
      },
    ],
  },
  {
    slug: "formivo-vs-fillout",
    competitor: "Fillout",
    competitorUrl: "https://www.fillout.com/pricing",
    title: "Formivo vs Fillout",
    seoTitle: "Formivo vs Fillout: Hosted Forms vs Your Own Form Backend",
    description:
      "Fillout is a hosted form builder with a strong database view. Formivo is a backend for forms you already own, with per-form read-only client access.",
    answer:
      "Fillout builds and hosts forms and presents responses in a database-style view. Formivo does not host or build forms; it receives submissions from your own form and scopes access per client. Choose Fillout to build a form, Formivo to manage submissions from websites you build.",
    summary:
      "Fillout's database view is close in spirit to Formivo's submissions workspace. The difference is whether the form itself is yours or the provider's.",
    category: "form builder",
    competitorSummary:
      "A form builder with a spreadsheet-like responses view, integrations and hosted forms.",
    bestFor: [
      "You want to build the form in a visual editor.",
      "You need the provider's database view and integrations.",
      "You are collecting responses outside your own website.",
    ],
    formivoFit: [
      "The form already exists in your own codebase.",
      "You manage many client websites from one account.",
      "You need client access that is read-only and revocable per form.",
    ],
    rows: [
      {
        dimension: "Form ownership",
        formivo: "Yours",
        competitor: "Built and hosted by the provider",
      },
      {
        dimension: "Responses view",
        formivo: "Search, filters, statuses, submission detail",
        competitor: "Database-style view with integrations",
      },
      {
        dimension: "Client access",
        formivo: "Client viewer account per shared form",
        competitor: "Check the current sharing and permission options",
      },
      {
        dimension: "Infrastructure",
        formivo: "One endpoint, no deploy",
        competitor: "Hosted forms and pages",
      },
      {
        dimension: "Abuse control",
        formivo: "Honeypot, rate limits, origin allow-list, pause switch",
        competitor: "Verify current spam controls on their site",
      },
    ],
    verify: [
      "Whether external form posts are supported on your plan.",
      "Collaborator and sharing permissions.",
      "Response limits and what happens when they are reached.",
    ],
    faq: [
      {
        question: "Can Formivo handle hundreds of submissions a month?",
        answer:
          "Yes: the published limits are 100 on Free, 1,000 on Light, 5,000 on Pro and 20,000 on Agency per billing cycle. The limit is enforced at ingest.",
      },
      {
        question: "Do I lose design control?",
        answer:
          "No. Formivo never renders your form. You keep your markup and CSS, and only the action URL changes.",
      },
    ],
  },
];

export function findComparison(slug: string): Comparison | undefined {
  return comparisons.find((item) => item.slug === slug);
}
