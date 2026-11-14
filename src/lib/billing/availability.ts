import "server-only";

import { getPublicEnv } from "@/lib/env/public";

import { getBillingConfig } from "./paddle";

export type PaymentAvailability = {
  /** Whether a real checkout may be created at all. */
  checkoutEnabled: boolean;
  /** Short label for a call to action. */
  label: string;
  /** Sentence shown under the button, so the state is never implied. */
  note: string;
  /** Missing configuration names, for the operator only. */
  missing: string[];
  /** Which Paddle account the checkout would use. */
  environment: "sandbox" | "production";
};

/**
 * Payments stay off in production until they are explicitly authorised.
 *
 * Checkout is available when Paddle is configured AND either the deployment is not
 * production or `BILLING_CHECKOUT_ENABLED=true` was set deliberately after approval.
 * Every paid surface reads this one function, so the pricing page, the billing page
 * and the server action can never disagree.
 */
export function getPaymentAvailability(): PaymentAvailability {
  const { configured, missing, environment } = getBillingConfig();
  const deployment = getPublicEnv().NEXT_PUBLIC_ENVIRONMENT;
  const explicitlyEnabled = process.env.BILLING_CHECKOUT_ENABLED === "true";
  const production = deployment === "production";

  if (!configured) {
    return {
      checkoutEnabled: false,
      label: "Coming soon",
      note: "Checkout is not open yet. Create a free account and keep every form you build.",
      missing,
      environment,
    };
  }

  if (production && !explicitlyEnabled) {
    return {
      checkoutEnabled: false,
      label: "Coming soon",
      note: "Paid plans are being finalised. Free accounts work today and keep all your data.",
      missing: [],
      environment,
    };
  }

  return {
    checkoutEnabled: true,
    label: "Choose plan",
    note:
      environment === "sandbox"
        ? "Sandbox checkout: test cards only, no real charge. Handled by Paddle."
        : "Secure checkout handled by Paddle. Cancel anytime.",
    missing: [],
    environment,
  };
}
