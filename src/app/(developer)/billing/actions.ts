"use server";

import { redirect } from "next/navigation";

import { requireDeveloper } from "@/lib/auth/viewer";
import { createCheckoutUrl, getCustomerPortalUrl } from "@/lib/billing/lemonsqueezy";
import { isPlanKey } from "@/lib/billing/plans";
import { AppError, errorMessage } from "@/lib/errors";
import { getPublicEnv } from "@/lib/env/public";

export type BillingState = { error?: string };

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

  try {
    const url = await createCheckoutUrl({
      workspaceId: developer.workspace.id,
      plan,
      email: developer.user.email,
      appUrl: getPublicEnv().NEXT_PUBLIC_APP_URL,
    });
    redirect(url);
  } catch (error) {
    if (error instanceof AppError) return { error: errorMessage(error) };
    // redirect() throws a control-flow error that must not be swallowed.
    throw error;
  }
}

export async function openBillingPortalAction(): Promise<void> {
  const developer = await requireDeveloper();
  const subscriptionId = developer.entitlements.providerSubscriptionId;
  if (!subscriptionId) redirect("/billing?portal=unavailable");

  const url = await getCustomerPortalUrl(subscriptionId);
  if (!url) redirect("/billing?portal=unavailable");
  redirect(url);
}
