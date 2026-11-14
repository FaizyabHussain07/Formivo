/**
 * The single source of truth for plans, limits and prices.
 *
 * Every surface reads from here: the pricing page, the marketing preview, the billing
 * dashboard, JSON-LD offers, LLM summaries and the server-side entitlement checks.
 * A limit is never typed twice.
 *
 * Limits are deliberately finite. Formivo does not advertise unlimited submissions
 * because every accepted submission costs storage and every notification costs email.
 */

export type PlanKey = "free" | "light" | "pro" | "agency";

export type PlanDefinition = {
  key: PlanKey;
  name: string;
  priceMonthly: number;
  /** Active forms that can accept submissions at the same time. */
  forms: number;
  /** Accepted submissions per usage window. */
  monthlyLeads: number;
  /** Distinct client accounts that can be invited across the workspace. */
  viewers: number;
  /** CSV export of submissions. */
  canExportSubmissions: boolean;
  /**
   * Workspace members. Team invitations are not implemented yet, so this is 1
   * everywhere and the marketing pages say so instead of selling a seat that
   * does not exist.
   */
  teamSeats: number;
  /** Shown as "Most popular" on pricing surfaces. */
  featured: boolean;
  description: string;
  features: string[];
};

export const PLANS: Record<PlanKey, PlanDefinition> = {
  free: {
    key: "free",
    name: "Free",
    priceMonthly: 0,
    forms: 1,
    monthlyLeads: 100,
    viewers: 1,
    canExportSubmissions: false,
    teamSeats: 1,
    featured: false,
    description: "One form, one client view. For trying Formivo on a real project.",
    features: [
      "1 active form",
      "100 submissions per month",
      "1 client view",
      "Submission dashboard and statuses",
      "No card required",
    ],
  },
  light: {
    key: "light",
    name: "Light",
    priceMonthly: 9,
    forms: 5,
    monthlyLeads: 1000,
    viewers: 3,
    canExportSubmissions: true,
    teamSeats: 1,
    featured: false,
    description: "For freelancers managing a handful of client projects.",
    features: [
      "5 active forms",
      "1,000 submissions per month",
      "3 client views",
      "Search and filtering",
      "CSV export",
    ],
  },
  pro: {
    key: "pro",
    name: "Pro",
    priceMonthly: 19,
    forms: 25,
    monthlyLeads: 5000,
    viewers: 10,
    canExportSubmissions: true,
    teamSeats: 1,
    featured: true,
    description: "For active freelancers and growing development businesses.",
    features: [
      "25 active forms",
      "5,000 submissions per month",
      "10 client views",
      "CSV export",
      "Client access management",
      "Email support",
    ],
  },
  agency: {
    key: "agency",
    name: "Agency",
    priceMonthly: 49,
    forms: 100,
    monthlyLeads: 20000,
    viewers: 50,
    canExportSubmissions: true,
    teamSeats: 1,
    featured: false,
    description: "For agencies running forms across many client websites.",
    features: [
      "100 active forms",
      "20,000 submissions per month",
      "50 client views",
      "CSV export",
      "Workspace-wide client access management",
      "Priority email support",
    ],
  },
};

export const PLAN_ORDER: PlanKey[] = ["free", "light", "pro", "agency"];

export function isPlanKey(value: string): value is PlanKey {
  return value === "free" || value === "light" || value === "pro" || value === "agency";
}

/** Every plan that requires a Paddle checkout. Free never does. */
export function isPaidPlan(value: string): value is Exclude<PlanKey, "free"> {
  return value === "light" || value === "pro" || value === "agency";
}

export function planFor(key: string | null | undefined): PlanDefinition {
  return isPlanKey(key ?? "") ? PLANS[key as PlanKey] : PLANS.free;
}

/** Calendar-month usage window in UTC; identical for the UI and the intake RPC. */
export function currentUsageWindow(now = new Date()): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { start, end };
}

export function formatLimit(value: number): string {
  return value.toLocaleString("en-US");
}
