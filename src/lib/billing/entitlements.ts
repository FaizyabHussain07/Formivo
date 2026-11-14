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
  providerCustomerId: string | null;
  priceId: string | null;
  activeFormCount: number;
  viewerCount: number;
  monthlyUsage: number;
  usageWindowStart: Date;
  usageWindowEnd: Date;
  canCreateForm: boolean;
  canAddViewer: boolean;
  canAcceptSubmission: boolean;
  canExportSubmissions: boolean;
};

/** The statuses that keep a paid plan in force. Everything else falls back to free. */
const ENTITLED_STATUSES = new Set(["active", "on_trial", "past_due"]);

type SubscriptionState = {
  plan_key: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  price_id: string | null;
};

/**
 * A cancelled subscription keeps its entitlements until the paid period it already
 * paid for actually ends. Cancelling must not immediately downgrade a customer who
 * cancelled mid-cycle (Paddle reports `canceled` with a scheduled change).
 */
function isEntitled(subscription: SubscriptionState | null, now: Date): boolean {
  if (!subscription) return false;
  if (ENTITLED_STATUSES.has(subscription.status)) return true;
  if (subscription.status !== "cancelled") return false;
  const end = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
  return end !== null && !Number.isNaN(end.getTime()) && end > now;
}
/**
 * Usage window: the provider's billing cycle for an entitled subscription
 * (subscribing on the 14th resets on the 14th), calendar month otherwise.
 */
function usageWindow(subscription: SubscriptionState | null, now = new Date()) {
  if (subscription?.current_period_start && subscription?.current_period_end) {
    const start = new Date(subscription.current_period_start);
    const end = new Date(subscription.current_period_end);
    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end > start &&
      start <= now &&
      now < end
    ) {
      return { start, end };
    }
  }
  return currentUsageWindow(now);
}

/**
 * Single source of truth for plan limits. Every server-side gate calls this, so
 * plan logic is never duplicated across routes.
 */
export async function getWorkspaceEntitlements(
  workspaceId: string,
): Promise<WorkspaceEntitlements> {
  const admin = requireAdminClient();
  const now = new Date();

  // `select("*")` rather than an explicit column list: the Paddle columns
  // (`price_id`, `provider_customer_id`) are added by a migration, and a deployment can
  // legitimately run against a database where that migration has not been applied yet.
  // Naming them here would throw for every workspace and take the whole dashboard down.
  // Missing fields simply read back as `null`.
  const subscriptionResult = await admin
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (subscriptionResult.error) throw new Error(subscriptionResult.error.message);

  const subscription = (subscriptionResult.data ?? null) as SubscriptionState | null;
  const entitled = isEntitled(subscription, now);
  const planKey: PlanKey = entitled && subscription ? planFor(subscription.plan_key).key : "free";
  const plan = planFor(planKey);
  const window = usageWindow(entitled ? subscription : null, now);

  const [formsResult, usageResult] = await Promise.all([
    admin.from("forms").select("id, status").eq("workspace_id", workspaceId),
    admin
      .from("usage_periods")
      .select("submission_count")
      .eq("workspace_id", workspaceId)
      .eq("period_start", window.start.toISOString())
      .eq("period_end", window.end.toISOString())
      .maybeSingle(),
  ]);

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

  const monthlyUsage = usageResult.data?.submission_count ?? 0;

  return {
    planKey,
    plan,
    subscriptionStatus: subscription?.status ?? "active",
    cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
    currentPeriodEnd: subscription?.current_period_end ?? null,
    providerSubscriptionId: subscription?.provider_subscription_id ?? null,
    providerCustomerId: subscription?.provider_customer_id ?? null,
    priceId: subscription?.price_id ?? null,
    activeFormCount,
    viewerCount,
    monthlyUsage,
    usageWindowStart: window.start,
    usageWindowEnd: window.end,
    canCreateForm: activeFormCount < plan.forms,
    canAddViewer: viewerCount < plan.viewers,
    canAcceptSubmission: monthlyUsage < plan.monthlyLeads,
    canExportSubmissions: plan.canExportSubmissions,
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
