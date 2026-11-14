"use server";

import { redirect } from "next/navigation";

import { queueAnalyticsEvent } from "@/lib/analytics/intent";
import { requireDeveloper } from "@/lib/auth/viewer";
import { getPaymentAvailability } from "@/lib/billing/availability";
import {
  createCheckoutTransaction,
  getCustomerPortalUrl,
  updateSubscriptionPlan,
} from "@/lib/billing/paddle";
import { isPlanKey } from "@/lib/billing/plans";
import { getPublicEnv } from "@/lib/env/public";
import { AppError, errorMessage } from "@/lib/errors";

export type BillingState = {
  error?: string;
  notice?: string;
  checkout?: {
    transactionId: string;
    clientToken: string;
    environment: "sandbox" | "production";
    checkoutUrl: string | null;
    plan: string;
  };
};

export async function startCheckoutAction(
  _prev: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const developer = await requireDeveloper();
  const plan = String(formData.get("plan") ?? "");

  if (!isPlanKey(plan) || plan === "free") {
    return { error: "Choose a paid plan to continue." };
  }
  if (plan === developer.planKey) {
    return { error: `You are already on the ${developer.plan.name} plan.` };
  }

  // The server enforces the same availability the buttons show, so a crafted request
  // cannot open a checkout that is not supposed to exist yet.
  const payments = getPaymentAvailability();
  if (!payments.checkoutEnabled) return { error: payments.note };

  try {
    // An existing subscriber changes plan on the subscription, so they never end up
    // paying for two subscriptions at once.
    const existingSubscription = developer.entitlements.providerSubscriptionId;
    if (existingSubscription) {
      await updateSubscriptionPlan({ subscriptionId: existingSubscription, plan });
      await queueAnalyticsEvent("upgrade");
      return {
        notice:
          "Paddle is applying the plan change. Your limits update as soon as the subscription webhook arrives, usually within a minute.",
      };
    }

    const checkout = await createCheckoutTransaction({
      workspaceId: developer.workspace.id,
      plan,
      appUrl: getPublicEnv().NEXT_PUBLIC_APP_URL,
    });
    await queueAnalyticsEvent("select_plan", "begin_checkout");

    return {
      checkout: {
        transactionId: checkout.transactionId,
        clientToken: checkout.clientToken,
        environment: checkout.environment,
        checkoutUrl: checkout.checkoutUrl,
        plan,
      },
    };
  } catch (error) {
    if (error instanceof AppError) return { error: errorMessage(error) };
    throw error;
  }
}

export async function openBillingPortalAction(): Promise<void> {
  const developer = await requireDeveloper();
  const customerId = developer.entitlements.providerCustomerId;
  if (!customerId) redirect("/billing?portal=unavailable");

  const url = await getCustomerPortalUrl(customerId);
  if (!url) redirect("/billing?portal=unavailable");
  redirect(url);
}
