import "server-only";

import { AppError } from "@/lib/errors";
import { requireAdminClient } from "@/lib/supabase/admin";

import { currentUsageWindow, planFor, type PlanDefinition, type PlanKey } from "./plans";

export type WorkspaceEntitlements = {
  planKey: PlanKey;
  plan: PlanDefinition;
  subscriptionStatus: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  providerSubscriptionId: string | null;
  activeFormCount: number;
  viewerCount: number;
  monthlyUsage: number;
  usageWindowStart: Date;
  usageWindowEnd: Date;
  canCreateForm: boolean;
  canAddViewer: boolean;
  canAcceptSubmission: boolean;
};

/** The statuses that keep a paid plan in force. Everything else falls back to free. */
const ENTITLED_STATUSES = new Set(["active", "on_trial", "past_due"]);

/**
 * Single source of truth for plan limits. Every server-side gate calls this, so
 * plan logic is never duplicated across routes.
 */
export async function getWorkspaceEntitlements(
  workspaceId: string,
): Promise<WorkspaceEntitlements> {
  const admin = requireAdminClient();
  const window = currentUsageWindow();

  const [subscriptionResult, formsResult, usageResult] = await Promise.all([
    admin
      .from("subscriptions")
      .select("plan_key, status, cancel_at_period_end, current_period_end, provider_subscription_id")
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
    admin.from("forms").select("id, status").eq("workspace_id", workspaceId),
    admin
      .from("usage_periods")
      .select("submission_count")
      .eq("workspace_id", workspaceId)
      .eq("period_start", window.start.toISOString())
      .eq("period_end", window.end.toISOString())
      .maybeSingle(),
  ]);

  if (subscriptionResult.error) throw new Error(subscriptionResult.error.message);
  if (formsResult.error) throw new Error(formsResult.error.message);
  if (usageResult.error) throw new Error(usageResult.error.message);

  const forms = formsResult.data ?? [];
  const formIds = forms.map((form) => form.id);
  const activeFormCount = forms.filter((form) => form.status === "active").length;

  let viewerCount = 0;
  if (formIds.length > 0) {
    const { data, error } = await admin
      .from("form_client_permissions")
      .select("client_user_id")
      .in("form_id", formIds)
      .is("revoked_at", null);
    if (error) throw new Error(error.message);
    viewerCount = new Set((data ?? []).map((row) => row.client_user_id)).size;
  }

  const subscription = subscriptionResult.data;
  const planKey: PlanKey =
    subscription && ENTITLED_STATUSES.has(subscription.status) && subscription.plan_key
      ? planFor(subscription.plan_key).key
      : "free";
  const plan = planFor(planKey);
  const monthlyUsage = usageResult.data?.submission_count ?? 0;

  return {
    planKey,
    plan,
    subscriptionStatus: subscription?.status ?? "active",
    cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
    currentPeriodEnd: subscription?.current_period_end ?? null,
    providerSubscriptionId: subscription?.provider_subscription_id ?? null,
    activeFormCount,
    viewerCount,
    monthlyUsage,
    usageWindowStart: window.start,
    usageWindowEnd: window.end,
    canCreateForm: activeFormCount < plan.forms,
    canAddViewer: viewerCount < plan.viewers,
    canAcceptSubmission: monthlyUsage < plan.monthlyLeads,
  };
}

export async function assertCanCreateForm(workspaceId: string): Promise<WorkspaceEntitlements> {
  const entitlements = await getWorkspaceEntitlements(workspaceId);
  if (!entitlements.canCreateForm) {
    throw new AppError(
      "PLAN_LIMIT_REACHED",
      `Your ${entitlements.plan.name} plan allows ${entitlements.plan.forms} active forms. Pause a form or upgrade to create another.`,
    );
  }
  return entitlements;
}

export async function assertCanAddViewer(workspaceId: string): Promise<WorkspaceEntitlements> {
  const entitlements = await getWorkspaceEntitlements(workspaceId);
  if (!entitlements.canAddViewer) {
    throw new AppError(
      "PLAN_LIMIT_REACHED",
      `Your ${entitlements.plan.name} plan allows ${entitlements.plan.viewers} client viewers. Remove an existing viewer or upgrade to invite another.`,
    );
  }
  return entitlements;
}
