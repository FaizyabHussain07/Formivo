/**
 * The single event catalog shared by GA4 and PostHog.
 *
 * Naming is snake_case so a GA4 event name is valid as-is. Properties deliberately
 * exclude submission content, email bodies, passwords and tokens: analytics must never
 * become a second copy of customer data.
 */
export type AnalyticsEvent =
  | "page_view"
  | "sign_up"
  | "login"
  | "form_created"
  | "form_published"
  | "form_submission_received"
  | "client_invited"
  | "client_joined"
  | "feedback_submitted"
  | "pricing_viewed"
  | "checkout_started"
  | "subscription_activated"
  | "docs_viewed"
  | "prompt_copied";

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * Events that describe a completed business action. They are deduplicated per browser
 * session so a double render or a refresh cannot inflate conversion counts.
 */
const ONCE_PER_SESSION: ReadonlySet<AnalyticsEvent> = new Set<AnalyticsEvent>([
  "sign_up",
  "login",
  "form_created",
  "pricing_viewed",
  "checkout_started",
  "subscription_activated",
  "form_submission_received",
]);

export function isOncePerSession(event: AnalyticsEvent): boolean {
  return ONCE_PER_SESSION.has(event);
}

/** GA4 rejects custom event names longer than 40 characters. */
export function isValidEventName(event: string): boolean {
  return /^[a-z][a-z0-9_]{0,39}$/.test(event);
}
