/**
 * Audience pages. Each one describes a real workflow with the product as it exists:
 * one endpoint per form, a submissions dashboard, and read-only client accounts.
 * No fabricated customer counts, case studies or outcomes.
 */

export type Solution = {
  slug: string;
  name: string;
  title: string;
  seoTitle: string;
  description: string;
  answer: string;
  intro: string;
  painPoints: { title: string; body: string }[];
  workflow: { title: string; body: string }[];
  outcomes: string[];
  scenario: { title: string; body: string };
  relatedLinks: { href: string; label: string }[];
};

export const solutions: Solution[] = [
  {
    slug: "freelancers",
    name: "Freelance developers",
    title: "Form handling for freelance developers",
    seoTitle: "Form Backend for Freelance Developers | Formivo",
    description:
      "Stop rebuilding form storage for every freelance project. Connect each client website to one endpoint, keep submissions organized, and give the client their own read-only view.",
    answer:
      "A freelancer can collect every client website's form submissions in one Formivo workspace, filter by form, and invite each client to a read-only view of only their own form. No per-project backend, no forwarding emails.",
    intro:
      "Most freelance web work ends with a contact form pointed at an inbox. That works until the client asks where the enquiries go, or until two projects need the same spreadsheet.",
    painPoints: [
      {
        title: "A backend per project",
        body: "Every new site needs storage, validation, spam control and somewhere to read the results. Rebuilding that is unpaid work on every project.",
      },
      {
        title: "Submissions split across inboxes",
        body: "One project's leads are in an inbox, another's in a spreadsheet, a third in a form plugin the client cannot find.",
      },
      {
        title: "Forwarding as a workflow",
        body: "The client asks for last month's enquiries, and the answer is to search your own inbox and forward a thread.",
      },
    ],
    workflow: [
      {
        title: "Build the form as usual",
        body: "Keep your markup and styles. The only change is the form action, and the same field names carry over.",
      },
      {
        title: "Collect in one workspace",
        body: "Each project gets its own form. Submissions arrive with their source and payload, searchable across the workspace.",
      },
      {
        title: "Invite the client read-only",
        body: "One invitation, one form. The client reads their leads without seeing another project or your settings.",
      },
    ],
    outcomes: [
      "One place to answer 'where did the enquiries go?'",
      "No new infrastructure to maintain per project",
      "Client access that can be revoked when the engagement ends",
    ],
    scenario: {
      title: "A realistic week",
      body: "Three client sites, three forms. Monday's enquiries are filtered by form and read once. On Wednesday a client asks for their last ten enquiries: you send the invite link you already created, and they read it themselves. Nothing is forwarded.",
    },
    relatedLinks: [
      { href: "/docs/quickstart", label: "Create your first form" },
      { href: "/docs/client-portal", label: "How client access works" },
      {
        href: "/blog/share-form-submissions-with-clients",
        label: "Sharing submissions with clients",
      },
      { href: "/pricing", label: "Plans for freelancers" },
    ],
  },
  {
    slug: "web-developers",
    name: "Web developers",
    title: "A form backend for web developers",
    seoTitle: "Form Backend for Web Developers | Formivo",
    description:
      "A form backend without a backend: one endpoint per form, validation and rate limits included, submissions stored and scoped per workspace. Keep your own form code.",
    answer:
      "Formivo gives a developer a public POST endpoint per form with validation, rate limits and plan quotas built in. The submission is stored and readable only by the owning workspace or an invited client. No key is embedded in the page.",
    intro:
      "You already know how to build the form. The repeated cost is everything after it: a table, a validator, a spam decision, an admin view and a way to hand data to whoever owns the lead.",
    painPoints: [
      {
        title: "Repeated plumbing",
        body: "The same validation, storage and rate-limit code is rewritten for every project, usually differently each time.",
      },
      {
        title: "Secrets in markup",
        body: "A public key in a static page is not a secret. Protection has to come from server-side controls, not from hiding a string.",
      },
      {
        title: "Read access is the hard part",
        body: "Writing a submission is easy. Letting exactly the right person read it, and nobody else, is the part that needs design.",
      },
    ],
    workflow: [
      {
        title: "POST to one endpoint",
        body: "JSON, urlencoded or multipart. HTML forms, fetch, curl, a route handler or a server action all work the same way.",
      },
      {
        title: "Let the server enforce the contract",
        body: "Body and field limits, structured error codes, rate limits per form and per IP, quota checks inside the insert transaction.",
      },
      {
        title: "Read with the session, not an id",
        body: "Every read is authorized from the signed-in user and the ownership chain. A form id in a query string grants nothing.",
      },
    ],
    outcomes: [
      "One integration contract for every project",
      "Validation and abuse control you did not have to write",
      "Read access that is enforced in code and in row-level security",
    ],
    scenario: {
      title: "What integration looks like",
      body: "Change the action to the form's endpoint, keep the fields. Add a hidden _redirect to return to your own thank-you page. Add _gotcha for a honeypot. That is the whole client-side change.",
    },
    relatedLinks: [
      { href: "/docs/api", label: "Endpoint reference" },
      { href: "/docs/html", label: "HTML forms" },
      { href: "/docs/react", label: "React" },
      { href: "/docs/nextjs", label: "Next.js" },
    ],
  },
  {
    slug: "web-agencies",
    name: "Web agencies",
    title: "Form submission management for web agencies",
    seoTitle: "Form Backend and Client Portal for Web Agencies | Formivo",
    description:
      "Manage form submissions from every client website in one workspace, give each client a read-only view of their own form, and keep client data separated.",
    answer:
      "An agency can keep one form per client website in a Formivo workspace, filter submissions by client, export on paid plans, and invite each client to read only their own form. Client access is per form and revocable.",
    intro:
      "An agency does not have one form problem. It has one per client, plus the operational question of who is allowed to read which lead.",
    painPoints: [
      {
        title: "Tool sprawl",
        body: "Some sites use a plugin, some a form service, some a custom endpoint. Every tool has a different way to find a lead.",
      },
      {
        title: "Ownership confusion",
        body: "When a lead needs to reach the client, the agency becomes a forwarding service with no record of what was sent.",
      },
      {
        title: "Separation risk",
        body: "A shared login for client data means one client can see another client's enquiries. That is a trust problem, not a convenience problem.",
      },
    ],
    workflow: [
      {
        title: "One form per client site",
        body: "Name the form after the client. The workspace lists every client's form side by side, with its own submission count.",
      },
      {
        title: "One workspace view",
        body: "Search across submissions, filter by form, set a lead status, and export CSV on Light, Pro and Agency.",
      },
      {
        title: "One client, one form",
        body: "An invitation grants read-only access to a single form. Revoking it closes access on the next request.",
      },
    ],
    outcomes: [
      "Every client site's enquiries in one place",
      "No shared client login",
      "An access record you can revoke when a contract ends",
    ],
    scenario: {
      title: "Onboarding a new client site",
      body: "Create a form, connect the site's existing form, and invite the client to that one form. The agency keeps workspace-level control; the client sees enquiries and nothing else.",
    },
    relatedLinks: [
      { href: "/client-portal", label: "Client portal" },
      { href: "/security", label: "How client isolation is enforced" },
      { href: "/compare/formivo-vs-basin", label: "Agency-focused comparison" },
      { href: "/pricing", label: "Agency plan" },
    ],
  },
  {
    slug: "client-projects",
    name: "Client projects",
    title: "Formivo for client projects",
    seoTitle: "Form Backend for Client Projects | Formivo",
    description:
      "Every client project gets its own form endpoint, its own submissions and its own read-only client access. Nothing is shared between clients.",
    answer:
      "A client project in Formivo is one form: its endpoint, its submissions and its permission list. Clients are invited per form, so one project's data is never visible from another.",
    intro:
      "A project handover usually means handing over a login. Formivo replaces that with a scoped invitation: the client reads what belongs to them, and nothing else.",
    painPoints: [
      {
        title: "Handover is messy",
        body: "Creating an account for the client inside your workspace gives them more access than the project needs.",
      },
      {
        title: "Data outlives the contract",
        body: "Access granted at launch is rarely reviewed when the engagement ends.",
      },
      {
        title: "One login, many projects",
        body: "Shared credentials cannot be scoped or audited per client.",
      },
    ],
    workflow: [
      {
        title: "Create the project's form",
        body: "A form belongs to one workspace and has one endpoint. It is the unit of both data and access.",
      },
      {
        title: "Invite the client to that form",
        body: "The invitation is single-use, expires, and is tied to the invited email address.",
      },
      {
        title: "Revoke when the work ends",
        body: "Revocation is checked on every request, so access ends immediately rather than at the next login.",
      },
    ],
    outcomes: [
      "Client access scoped to a project, not an account",
      "Invitations that expire on their own",
      "Revocation that takes effect immediately",
    ],
    scenario: {
      title: "Ending an engagement",
      body: "Revoke the client's permission on the form. Their account remains theirs, but the project's submissions are no longer readable. Your workspace and the data stay intact.",
    },
    relatedLinks: [
      { href: "/docs/client-portal", label: "Client access documentation" },
      { href: "/client-portal", label: "What clients see" },
      { href: "/security", label: "Security model" },
      { href: "/pricing", label: "Plans and client view limits" },
    ],
  },
];

export function findSolution(slug: string): Solution | undefined {
  return solutions.find((item) => item.slug === slug);
}
