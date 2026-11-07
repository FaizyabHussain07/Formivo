import "server-only";

import { getPublicEnv } from "@/lib/env/public";

import { getBillingConfig } from "./lemonsqueezy";

export type PaymentAvailability = {
  /** Whether a real checkout may be created at all. */
  checkoutEnabled: boolean;
  /** Short label for a call to action. */
  label: string;
  /** Sentence shown under the button, so the state is never implied. */
  note: string;
  /** Missing configuration names, for the operator only. */
  missing: string[];
};

/**
 * Payments stay off in production until they are explicitly authorised.
 *
 * The store may still be under review, so the default rule is: checkout is available when
 * the provider is configured AND the deployment is not production. Setting
 * `BILLING_CHECKOUT_ENABLED=true` in production is the deliberate switch that turns it on
 * after approval. Every paid surface reads this one function, so the pricing page, the
 * billing page and the server action can never disagree.
 */
export function getPaymentAvailability(): PaymentAvailability {
  const { configured, missing } = getBillingConfig();
  const environment = getPublicEnv().NEXT_PUBLIC_ENVIRONMENT;
  const explicitlyEnabled = process.env.BILLING_CHECKOUT_ENABLED === "true";
  const production = environment === "production";

  if (!configured) {
    return {
      checkoutEnabled: false,
      label: "Coming soon",
      note: "Checkout is not open yet. Create a free account and we will email you when paid plans open.",
      missing,
    };
  }

  if (production && !explicitlyEnabled) {
    return {
      checkoutEnabled: false,
      label: "Coming soon",
      note: "Paid plans are being finalised. Free accounts work today and keep all your data.",
      missing: [],
    };
  }

  return {
    checkoutEnabled: true,
    label: "Choose plan",
    note: "Secure checkout via Lemon Squeezy. Cancel anytime.",
    missing: [],
  };
}
