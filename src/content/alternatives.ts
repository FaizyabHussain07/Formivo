import type { Alternative } from "./types";

/**
 * Competitor facts below were read from each provider's own site on the date in
 * `verifiedOn`. They are stated with their source so they can be re-checked rather
 * than trusted forever, and no claim is made about a competitor's internals we did
 * not read. If a number changes, the fix is to update it here — not to soften it.
 */
export const alternatives: Alternative[] = [
  {
    slug: "formspree",
    competitor: "Formspree",
    title: "A Formspree alternative for client work",
    seoTitle: "Formspree Alternative: Formivo vs Formspree (Verified 2026)",
    description:
      "Formspree is a mature form backend with broad integrations. Formivo is built around per-client read-only access and a smaller, clearer surface. Compare the workflows.",
    summary:
      "Both accept a POST from an existing form. The difference appears after the submission: Formspree is built around your inbox and integrations, Formivo around the client who receives the leads.",
    verifiedOn: "2026-11-05",
    competitorSource: "https://formspree.io/plans",
    competitorFacts: [
      "Free plan: 50 submissions per month, unlimited forms, 30 days of submission history, one team member.",
      "Paid plans list $15/month (200 submissions), $30/month (2,000) and $90/month (20,000) on monthly billing.",
      "CSV and JSON export are listed from the entry paid plan; API access from the Professional tier.",
      "Team members share account access; the plans page does not describe a per-form read-only client login.",
      "Submission archive length and file uploads depend on the plan.",
    ],
    bestFor: [
      "Sites that mainly need form-to-email with a dashboard archive.",
      "Teams already using its plugin ecosystem (frameworks, CMSs, payment tools).",
      "Projects where a single owner reads every submission.",
    ],
    formivoDifference: [
      "Client accounts are a separate account type: no workspace, no billing, only the forms you invite them to.",
      "Access is granted per form and revoked per form, with the permission checked on every request.",
      "Every plan includes client viewers (3 on Free, 10 on Pro, 50 on Agency), so sharing is not an add-on.",
      "The endpoint needs no access key in your HTML — protection comes from rate limits, quotas and origin policy.",
    ],
    comparison: [
      {
        dimension: "Endpoint model",
        formivo: "Public endpoint per form, identified by form id",
        competitor: "Public endpoint per form",
      },
      {
        dimension: "Submission dashboard",
        formivo: "Included on every plan",
        competitor: "Included; archive length depends on plan",
      },
      {
        dimension: "Per-form read-only client access",
        formivo: "Built in: client accounts, per-form permission, revocable",
        competitor: "Not described on the plans page; team members share account access",
      },
      {
        dimension: "Lead status per submission",
        formivo: "New, read, contacted, qualified, converted, archived",
        competitor: "Read/unread style handling; verify current specifics",
      },
      {
        dimension: "CSV export",
        formivo: "Pro and Agency plans",
        competitor: "Listed from the entry paid plan",
      },
      {
        dimension: "Free plan volume",
        formivo: "300 submissions/month, 3 forms, 3 client viewers",
        competitor: "50 submissions/month, unlimited forms",
      },
      {
        dimension: "Entry paid price",
        formivo: "$19/month",
        competitor: "$15/month listed for 200 submissions",
      },
    ],
    chooseCompetitor: [
      "You need a specific third-party integration that Formspree already ships.",
      "You only need email delivery plus an archive and never share data with clients.",
      "You prefer unlimited forms on the free tier over a higher monthly submission cap.",
    ],
    chooseFormivo: [
      "You hand submission data to clients and want that to be a supported feature, not a forwarded email.",
      "You want each client's access to be revocable and limited to one form.",
      "You want the endpoint to keep working with plain HTML and no extra JavaScript.",
    ],
    faq: [
      {
        question: "Can I migrate an existing Formspree form to Formivo?",
        answer:
          "Yes. Create a form in Formivo and change the action URL; field names carry over unchanged. Past submissions stay in Formspree unless you export them there.",
      },
      {
        question: "Does Formivo support the same integrations?",
        answer:
          "Formivo focuses on the endpoint, the dashboard and client access. Export gives you the data in CSV; webhooks are not part of the current release, so check before relying on them.",
      },
      {
        question: "Are the competitor numbers on this page current?",
        answer:
          "They were read from Formspree's plans page on 5 November 2026 and are linked above. Prices change; check the source before deciding.",
      },
    ],
  },
  {
    slug: "web3forms",
    competitor: "Web3Forms",
    title: "A Web3Forms alternative with a client portal",
    seoTitle: "Web3Forms Alternative: Formivo vs Web3Forms (Verified 2026)",
    description:
      "Web3Forms is a fast way to send form submissions to email with a public access key. Formivo skips the key and adds per-client read-only access.",
    summary:
      "Both are aimed at sites without a backend. Web3Forms optimises for email delivery with an embedded access key; Formivo optimises for stored submissions you can hand to a client.",
    verifiedOn: "2026-11-05",
    competitorSource: "https://web3forms.com/",
    competitorFacts: [
      "Free plan: 250 submissions per month plus basic features.",
      "Integration uses a hidden `access_key` input embedded in the form markup.",
      "The vendor states the access key is not a secret and is safe in client-side code.",
      "Paid plans add file uploads, autoresponses, CAPTCHA support, webhooks, Google Sheets and team features.",
    ],
    bestFor: [
      "A single static page that only needs to email its owner.",
      "Sites where a plain HTML snippet is the entire integration budget.",
      "Low-volume sites that fit inside 250 submissions a month.",
    ],
    formivoDifference: [
      "No access key in your markup: the form id identifies the form, and abuse control is server-side.",
      "Submissions are first-class records with statuses, search and filters rather than an email trail.",
      "Client viewers get their own read-only login instead of sharing an owner inbox.",
      "Monthly quota is enforced in the same transaction as the insert, so a spike cannot silently overrun the plan.",
    ],
    comparison: [
      {
        dimension: "Integration",
        formivo: "Form action URL, no key",
        competitor: "Form action URL plus a hidden access key",
      },
      {
        dimension: "Primary delivery",
        formivo: "Dashboard record; email notification configurable per form",
        competitor: "Email delivery",
      },
      {
        dimension: "Submission dashboard",
        formivo: "Included",
        competitor: "Included",
      },
      {
        dimension: "Per-form client access",
        formivo: "Built in, revocable",
        competitor: "Not a documented feature of the free workflow",
      },
      {
        dimension: "Free volume",
        formivo: "300 submissions/month",
        competitor: "250 submissions/month",
      },
      {
        dimension: "Lead statuses",
        formivo: "Six states including converted and archived",
        competitor: "Check current dashboard features",
      },
    ],
    chooseCompetitor: [
      "You want the smallest possible snippet and only need email.",
      "You rely on paid add-ons such as autoresponders or Sheets that you already configured.",
      "You have no client-facing workflow at all.",
    ],
    chooseFormivo: [
      "You want submissions stored, searchable and handed to clients safely.",
      "You do not want a key visible in your page source, even a harmless one.",
      "You need per-form access control with an audit trail of grants and revocations.",
    ],
    faq: [
      {
        question: "Is a public access key actually a security problem?",
        answer:
          "Not automatically — Web3Forms designs it as a public alias for an email address. The trade-off is that anyone who copies it can post to that form, so abuse control has to come from rate limits and spam filtering rather than from the key being secret.",
      },
      {
        question: "Can both products be used at the same time?",
        answer:
          "Yes, on different forms. Point one form at Web3Forms and another at Formivo; they are independent endpoints.",
      },
    ],
  },
  {
    slug: "formspark",
    competitor: "Formspark",
    title: "A Formspark alternative for agencies",
    seoTitle: "Formspark Alternative: Formivo vs Formspark (Verified 2026)",
    description:
      "Formspark sells prepaid submission bundles with no subscription. Formivo is a subscription with client viewers and per-form permissions.",
    summary:
      "Formspark's model is prepaid credits that never expire. Formivo's model is a monthly plan with seats for the people who read the leads.",
    verifiedOn: "2026-11-05",
    competitorSource: "https://formspark.io/pricing",
    competitorFacts: [
      "Free workspace: 250 submissions, 10 forms, 5 team members.",
      "The paid upgrade is a one-time payment per workspace for 50,000 submissions, 100 forms and up to 50 team members (promotional pricing was displayed at the time of checking).",
      "Bundles do not expire and there is no automatic renewal.",
      "CSV and JSON exports are listed on both free and upgraded workspaces.",
      "Spam protection includes Botpoison, hCaptcha, reCAPTCHA and Turnstile options.",
    ],
    bestFor: [
      "Projects with bursty volume where a subscription is hard to justify.",
      "Teams that prefer prepaid credits over monthly billing.",
      "Developers who only need storage plus integrations.",
    ],
    formivoDifference: [
      "Client accounts with read-only, per-form access are part of the product rather than team seats.",
      "Usage resets each billing cycle instead of being drawn from a prepaid balance.",
      "Lead statuses, search and per-form analytics are part of the workspace, not add-ons.",
      "The plan states the exact submission ceiling, and the ceiling is enforced at ingest.",
    ],
    comparison: [
      {
        dimension: "Billing model",
        formivo: "Monthly subscription, reset each cycle",
        competitor: "One-time bundle per workspace, no expiry",
      },
      {
        dimension: "Client access",
        formivo: "Per-form client viewers on every plan",
        competitor: "Team members with workspace access",
      },
      {
        dimension: "Free volume",
        formivo: "300 submissions/month, 3 forms",
        competitor: "250 submissions, 10 forms",
      },
      {
        dimension: "Exports",
        formivo: "Pro and Agency",
        competitor: "Listed on free and upgraded workspaces",
      },
      {
        dimension: "Spam tooling",
        formivo: "Honeypots, database rate limits, origin allow-list",
        competitor: "Botpoison, hCaptcha, reCAPTCHA, Turnstile",
      },
    ],
    chooseCompetitor: [
      "You want to pay once and consume submissions over years.",
      "You need a specific spam provider integration.",
      "Your volume is unpredictable and a monthly reset would waste capacity.",
    ],
    chooseFormivo: [
      "You need clients to log in and read their own leads.",
      "You prefer a predictable monthly plan over balance tracking.",
      "You want a per-form permission model rather than shared workspace seats.",
    ],
    faq: [
      {
        question: "Which model is cheaper?",
        answer:
          "It depends on volume and time horizon. A prepaid bundle is cheaper for a one-off site; a subscription is cheaper when you keep the same forms running and want the ceiling to reset monthly. Compare your last three months of submissions.",
      },
      {
        question: "Does Formivo expire unused submissions?",
        answer:
          "Yes — the monthly allowance resets at the start of each billing cycle and unused capacity does not carry over, which is the opposite of a prepaid bundle.",
      },
    ],
  },
  {
    slug: "basin",
    competitor: "Basin",
    title: "A Basin alternative for client portals",
    seoTitle: "Basin Alternative: Formivo vs Basin (Verified 2026)",
    description:
      "Basin is a feature-rich form backend with projects, collaborators and heavy spam tooling. Formivo keeps the surface small and puts clients in their own read-only portal.",
    summary:
      "Basin bundles forms, spam protection and collaboration into projects. Formivo trades breadth for a narrow, well-defined client-sharing model.",
    verifiedOn: "2026-11-05",
    competitorSource: "https://usebasin.com/pricing",
    competitorFacts: [
      "Free plan: 1 form endpoint, 50 submissions per month, 30-day data retention.",
      "Paid tiers listed at approximately $12.50, $24.17 and $40.83 per month, with additional agency tiers.",
      "Collaborators are a paid feature; the Starter tier lists zero collaborators.",
      "Exports to CSV and XLSX are documented; API access starts on the Growth tier.",
      "Spam submissions do not count towards the monthly limit on paid plans.",
    ],
    bestFor: [
      "Teams that want projects, routing rules and heavy spam configuration.",
      "Sites needing file uploads and multi-step forms.",
      "Agencies that already work inside its project model.",
    ],
    formivoDifference: [
      "Clients are viewers, not collaborators: they cannot change form settings or see other projects.",
      "Client access is per form and free of charge on every plan — no paid collaborator tier.",
      "The endpoint stays minimal: no key, no project configuration required to accept a post.",
      "Data retention is not cut to 30 days on the free tier; submissions stay until you remove them.",
    ],
    comparison: [
      {
        dimension: "Organization model",
        formivo: "One workspace, forms inside it",
        competitor: "Projects containing forms",
      },
      {
        dimension: "Client access",
        formivo: "Read-only client accounts per form",
        competitor: "Collaborator roles with project-level permissions",
      },
      {
        dimension: "Free tier",
        formivo: "300 submissions/month, 3 forms, 3 viewers",
        competitor: "50 submissions/month, 1 form, 30-day retention",
      },
      {
        dimension: "File uploads",
        formivo: "Not supported (deliberate: smaller attack surface)",
        competitor: "Supported with virus scanning",
      },
      {
        dimension: "Export formats",
        formivo: "CSV",
        competitor: "CSV and XLSX",
      },
    ],
    chooseCompetitor: [
      "You need file uploads or multi-step forms.",
      "You want routing rules and advanced spam configuration.",
      "Your team works inside projects and needs those collaborator roles.",
    ],
    chooseFormivo: [
      "The only external people who need access are clients who should read leads.",
      "You want no file-upload surface at all.",
      "You want client access included rather than priced as a collaborator seat.",
    ],
    faq: [
      {
        question: "Why does Formivo not support file uploads?",
        answer:
          "Files turn a form endpoint into a storage and scanning problem. Formivo deliberately accepts text and JSON only; if you need attachments, a backend that scans uploads is the safer choice.",
      },
    ],
  },
  {
    slug: "formsubmit",
    competitor: "FormSubmit",
    title: "A FormSubmit alternative with stored submissions",
    seoTitle: "FormSubmit Alternative: Why Stored Submissions Beat Email-Only",
    description:
      "FormSubmit forwards form posts to an email address with no account. Formivo stores submissions, so you keep history, search and client access.",
    summary:
      "FormSubmit is email forwarding with a one-time activation link. Formivo keeps a record you can query, filter and share.",
    verifiedOn: "2026-11-05",
    competitorSource: "https://formsubmit.co/",
    competitorFacts: [
      "No account is required; the form posts to a FormSubmit URL and the first submission triggers an activation email.",
      "Delivery is by email to the address embedded in the endpoint.",
      "There is no submissions dashboard to browse, filter or export from.",
      "The service is free to use.",
    ],
    bestFor: [
      "A one-page site that only needs to forward messages to an inbox.",
      "Situations where creating an account is impossible.",
      "Emergency or temporary forms.",
    ],
    formivoDifference: [
      "Submissions are stored as records with statuses, so nothing depends on an inbox.",
      "Search and filters work across every form in the workspace.",
      "Clients get their own login instead of reading a shared mailbox.",
      "Quota, rate limits and origin policy are configurable per form.",
    ],
    comparison: [
      {
        dimension: "Account required",
        formivo: "Yes, for the owner",
        competitor: "No",
      },
      {
        dimension: "Storage",
        formivo: "Database-backed, retained until deleted",
        competitor: "Email only",
      },
      {
        dimension: "Search and filters",
        formivo: "Across all submissions",
        competitor: "Whatever your email client offers",
      },
      {
        dimension: "Client access",
        formivo: "Per-form read-only accounts",
        competitor: "Share the inbox",
      },
      {
        dimension: "Export",
        formivo: "CSV on Pro and Agency",
        competitor: "Not applicable",
      },
    ],
    chooseCompetitor: [
      "You genuinely only need a notification email and nothing else.",
      "You cannot create an account for the project.",
    ],
    chooseFormivo: [
      "Losing an email should not mean losing a lead.",
      "You need to prove what was submitted and when.",
      "A client needs to read their own leads without access to your inbox.",
    ],
    faq: [
      {
        question: "Is email-only delivery risky?",
        answer:
          "It removes your only copy of the data. Inbox rules, spam folders, mailbox quotas and staff changes can all lose submissions with no audit trail — which matters most for client work.",
      },
    ],
  },
];

export function alternativeBySlug(slug: string): Alternative | undefined {
  return alternatives.find((entry) => entry.slug === slug);
}
