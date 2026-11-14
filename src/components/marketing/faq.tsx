import { ChevronDown } from "lucide-react";

import { PLANS } from "@/lib/billing/plans";

/**
 * Answers describe only shipped behavior. Roadmap items and unsupported
 * integrations are stated plainly rather than implied. Plan numbers come from the
 * plan configuration, so an answer can never quote a limit the product does not
 * enforce.
 */
const free = PLANS.free;
const light = PLANS.light;
const pro = PLANS.pro;
const agency = PLANS.agency;

export const faqItems = [
  {
    question: "What is Formivo?",
    answer:
      "Formivo is a form backend and lead workspace for people who build websites for clients. Each form gets a public HTTPS endpoint that validates and stores submissions, plus a dashboard where you read, search and organize the resulting leads. You keep your own form markup; there is no backend to deploy and no API key to embed in the browser.",
  },
  {
    question: "Who is Formivo for?",
    answer:
      "Freelance web and full-stack developers, web design and development agencies, and small teams who manage forms across several client websites. It is not aimed at teams that want a hosted form builder.",
  },
  {
    question: "Do I need to build a backend?",
    answer:
      "No. Validation, rate limiting, quota checks, storage and the authenticated read side are handled by Formivo. You need a form and the endpoint generated for that form in your workspace.",
  },
  {
    question: "How do I connect a website form?",
    answer:
      "Create a form, copy its endpoint, and set your existing form's action to that URL with method POST. Field names carry over unchanged. You can add a hidden _redirect field to return visitors to your own thank-you page and a _gotcha honeypot for basic bot protection.",
  },
  {
    question: "Can I manage forms for multiple clients?",
    answer: `Yes. One workspace holds every form you create, up to the plan's active-form limit: ${free.forms} on Free, ${light.forms} on Light, ${pro.forms} on Pro and ${agency.forms} on Agency. Name each form after its client site and filter the submissions view by form. Formivo does not create separate project folders beyond those forms.`,
  },
  {
    question: "Can my clients access their submissions?",
    answer:
      "Yes. Invite a client to one form by email. They receive a single-use link that expires, accept it, and get a read-only client account for that form. They cannot edit leads, change form settings, manage billing or see your other forms.",
  },
  {
    question: "Can one client see another client's submissions?",
    answer:
      "No. A client invitation grants access to one form, and the portal lists only submissions for forms with an active permission for that account. Revoking the permission blocks the next request. This is enforced in the authorization layer and in row-level security, not just hidden in the interface.",
  },
  {
    question: "What happens when I reach my submission limit?",
    answer:
      "New submissions are rejected with a quota error until the allowance resets or you upgrade. Existing submissions and history are retained and never deleted. Paid plans reset on their subscription anniversary; Free resets on the 1st of the month in UTC.",
  },
  {
    question: "Can I export submissions?",
    answer:
      "CSV export is included on Light, Pro and Agency. Free cannot export, and the restriction is enforced on the server rather than by hiding a button. An export only includes submissions you are allowed to read.",
  },
  {
    question: "Is there a free plan?",
    answer: `Yes. Free includes ${free.forms} active form, ${free.monthlyLeads} submissions per month and ${free.viewers} client view, with no card required.`,
  },
  {
    question: "How do I upgrade or downgrade?",
    answer:
      "Open Billing in your workspace. Choosing a paid plan opens a Paddle checkout; if you already have a subscription, the same control changes the price on that subscription with proration. The new limits apply once Paddle confirms the change through a signed webhook.",
  },
  {
    question: "How does billing work?",
    answer:
      "Paid plans are billed monthly in USD by Paddle, which acts as merchant of record and handles tax. Subscriptions renew automatically until cancelled. Free never requires a payment method.",
  },
  {
    question: "How do I cancel?",
    answer:
      "Cancel from the Paddle customer portal, opened from your billing page. Access continues until the end of the period you already paid for, then the workspace moves to Free. Your forms, submissions and client access records are kept; the server still enforces the Free limits.",
  },
  {
    question: "Which integrations are supported?",
    answer:
      "Anything that can POST to a URL: plain HTML, JavaScript, React, Next.js, Vue, Nuxt, PHP, Laravel, Node, Express, Python, Django, Flask and static sites. Native CRM sync, webhooks and automation tools are not implemented.",
  },
  {
    question: "How is my account verified?",
    answer:
      "Signing up emails a six-digit code, sent through Resend from the Formivo domain. The dashboard stays closed until that code is entered. Sign-in is email and password only; there is no social login.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Email faizyabdev@gmail.com. Free and Light plans get email support; Pro and Agency are prioritized. There is no live chat or phone support.",
  },
];

export function Faq() {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {faqItems.map((faq, index) => (
        <details
          key={faq.question}
          className="group px-5 py-4 transition-colors open:bg-surface-muted/25 [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
            <span className="flex gap-3">
              <span className="mt-1 font-mono text-[9.5px] text-foreground-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[14px] leading-6 font-medium text-foreground">
                {faq.question}
              </span>
            </span>
            <ChevronDown
              className="mt-0.5 size-4 shrink-0 text-foreground-muted transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-2 max-w-3xl pr-6 pl-8 text-[13px] leading-6 text-foreground-secondary">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
