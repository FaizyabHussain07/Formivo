export type PlanKey = "free" | "pro" | "agency";

export type PlanDefinition = {
  key: PlanKey;
  name: string;
  priceMonthly: number;
  forms: number;
  monthlyLeads: number;
  viewers: number;
  description: string;
  features: string[];
};

export const PLANS: Record<PlanKey, PlanDefinition> = {
  free: {
    key: "free",
    name: "Free",
    priceMonthly: 0,
    forms: 3,
    monthlyLeads: 300,
    viewers: 3,
    description: "For trying Formivo on a real project.",
    features: ["3 active forms", "300 submissions / month", "3 client viewers", "Email support"],
  },
  pro: {
    key: "pro",
    name: "Pro",
    priceMonthly: 19,
    forms: 10,
    monthlyLeads: 2000,
    viewers: 10,
    description: "For freelancers shipping client work.",
    features: [
      "10 active forms",
      "2,000 submissions / month",
      "10 client viewers",
      "Priority email support",
    ],
  },
  agency: {
    key: "agency",
    name: "Agency",
    priceMonthly: 49,
    forms: 50,
    monthlyLeads: 10000,
    viewers: 50,
    description: "For agencies running many client forms.",
    features: [
      "50 active forms",
      "10,000 submissions / month",
      "50 client viewers",
      "Priority support",
    ],
  },
};

export const PLAN_ORDER: PlanKey[] = ["free", "pro", "agency"];

export function isPlanKey(value: string): value is PlanKey {
  return value === "free" || value === "pro" || value === "agency";
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
