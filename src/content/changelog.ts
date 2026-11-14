/**
 * Public changelog. Every entry describes something that is in the codebase now.
 * Planned work is not listed here; it belongs in a roadmap conversation, not a
 * changelog that readers treat as shipped.
 */
export type ChangelogEntry = {
  date: string;
  title: string;
  summary: string;
  items: string[];
  tag: "product" | "billing" | "security" | "platform";
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-11-14",
    title: "Paddle billing and four plans",
    tag: "billing",
    summary:
      "Subscriptions moved to Paddle, with sandbox and live separated by configuration. The plan line-up is now Free, Light, Pro and Agency.",
    items: [
      "Checkout opens the Paddle overlay from a server-created transaction, so the price is chosen on the server.",
      "Webhooks are verified with the Paddle-Signature HMAC and deduplicated by event id.",
      "Plan changes on an existing subscription use immediate proration instead of creating a second subscription.",
      "Free is now 1 form and 100 submissions; Light, Pro and Agency cover 5/25/100 forms.",
      "Existing subscriptions and payment history are preserved; nothing is deleted by the migration.",
    ],
  },
  {
    date: "2026-11-14",
    title: "Email verification with a six-digit code",
    tag: "security",
    summary:
      "A new account must verify its email address before it can reach the dashboard.",
    items: [
      "The verification screen accepts the six-digit code, handles invalid and expired codes, and resends with a cooldown.",
      "Unverified sessions are redirected to verification by every protected layout.",
      "Google sign-in is implemented through Supabase OAuth when the provider is configured.",
    ],
  },
  {
    date: "2026-11-14",
    title: "Public comparisons, solutions and integration guides",
    tag: "product",
    summary:
      "New pages explain the product by workflow rather than by feature list, with no invented competitor claims.",
    items: [
      "Six comparison pages, each linking to the provider's own pricing page.",
      "Four audience pages covering freelancers, developers, agencies and client projects.",
      "Integration guides for HTML, JavaScript, React and Next.js.",
      "A public changelog, a resources hub and a press page with reusable product facts.",
    ],
  },
  {
    date: "2026-11-05",
    title: "Multi-client access per form",
    tag: "product",
    summary: "Client permissions became per form and revocable, with database tests for isolation.",
    items: [
      "Invitations are single-use, expire, and are bound to the invited email address.",
      "Revocation is checked on every request.",
      "Row-level security and server authorization cover the same boundary.",
    ],
  },
  {
    date: "2026-10-29",
    title: "Lead statuses, search and CSV export",
    tag: "product",
    summary: "Submissions gained a six-state workflow, workspace search and gated CSV export.",
    items: [
      "New, Read, Contacted, Qualified, Converted and Archived.",
      "Search across name, email, message, subject and phone.",
      "CSV export is enforced by plan on the server.",
    ],
  },
  {
    date: "2026-10-28",
    title: "Form endpoint with validation and quota enforcement",
    tag: "platform",
    summary:
      "The public submission endpoint shipped with structural validation, rate limits and atomic quota accounting.",
    items: [
      "JSON, urlencoded and multipart bodies; 256 KB cap; 100-field limit.",
      "Per-form and per-IP fixed-window rate limits with Retry-After.",
      "Monthly usage is incremented in the same transaction as the insert.",
    ],
  },
];
