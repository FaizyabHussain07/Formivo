import "server-only";

import { AppError } from "@/lib/errors";
import { requireAdminClient } from "@/lib/supabase/admin";

import { getWorkspaceEntitlements } from "./entitlements";

export type LimitEnforcement = {
  /** Forms that were switched to paused by this call, oldest-first. */
  paused: Array<{ id: string; name: string }>;
  /** Active forms still in use and the plan's allowance. */
  activeCount: number;
  allowed: number;
  planName: string;
  /** True when everything is inside the plan already. */
  withinLimit: boolean;
};

/**
 * Keeps one workspace inside its plan's active-form allowance.
 *
 * Accounts created while a plan allowed more forms keep every record, but only the
 * oldest forms up to the allowance stay active. The rest are paused (not deleted), so
 * the developer can swap which form is live, or upgrade to switch them all back on.
 * Called from the pages that show forms, so the state is corrected on the next visit.
 */
export async function enforceActiveFormLimit(workspaceId: string): Promise<LimitEnforcement> {
  const entitlements = await getWorkspaceEntitlements(workspaceId);
  const allowed = entitlements.plan.forms;
  const admin = requireAdminClient();

  const { data, error } = await admin
    .from("forms")
    .select("id, name, status, created_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "active")
    .order("created_at", { ascending: true });
  if (error) throw new AppError("INTERNAL_ERROR", error.message);

  const active = data ?? [];
  const result: LimitEnforcement = {
    paused: [],
    activeCount: active.length,
    allowed,
    planName: entitlements.plan.name,
    withinLimit: active.length <= allowed,
  };
  if (result.withinLimit) return result;

  const surplus = active.slice(allowed);
  const { error: pauseError } = await admin
    .from("forms")
    .update({ status: "paused" })
    .in(
      "id",
      surplus.map((form) => form.id),
    )
    .eq("workspace_id", workspaceId);
  if (pauseError) throw new AppError("INTERNAL_ERROR", pauseError.message);

  result.paused = surplus.map((form) => ({ id: form.id, name: form.name }));
  result.activeCount = allowed;

  await admin.from("audit_logs").insert(
    surplus.map((form) => ({
      workspace_id: workspaceId,
      action: "form.paused_plan_limit",
      target_type: "form",
      target_id: form.id,
      metadata: { plan: entitlements.plan.key, allowed },
    })),
  );

  return result;
}

/** Blocks resuming a form when the plan's active-form allowance is already used. */
export async function assertCanActivateForm(workspaceId: string, formId: string): Promise<void> {
  const entitlements = await getWorkspaceEntitlements(workspaceId);
  const admin = requireAdminClient();

  const { data, error } = await admin
    .from("forms")
    .select("id, status")
    .eq("workspace_id", workspaceId)
    .eq("status", "active");
  if (error) throw new AppError("INTERNAL_ERROR", error.message);

  const active = data ?? [];
  if (active.some((form) => form.id === formId)) return;
  if (active.length < entitlements.plan.forms) return;

  throw new AppError(
    "PLAN_LIMIT_REACHED",
    `Your ${entitlements.plan.name} plan keeps ${entitlements.plan.forms} active ${
      entitlements.plan.forms === 1 ? "form" : "forms"
    } at a time. Pause another form, or upgrade to Pro to run them all at once.`,
  );
}
