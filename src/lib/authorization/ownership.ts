import "server-only";

import { requireAdminClient } from "@/lib/supabase/admin";

import type { Database } from "@/lib/supabase/database.types";

type WorkspaceRow = Database["public"]["Tables"]["workspaces"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type FormRow = Database["public"]["Tables"]["forms"]["Row"];

/**
 * Server-side ownership and access checks (PRD §8, §19).
 *
 * These run against the service-role client, which bypasses RLS — so they must
 * ALWAYS authorize explicitly: derive ownership from the trusted relation chain
 * (workspace -> form -> submission) and never from client-supplied values.
 */
export class AuthorizationError extends Error {
  readonly code: "FORBIDDEN" | "NOT_FOUND";

  constructor(code: "FORBIDDEN" | "NOT_FOUND", message: string) {
    super(message);
    this.name = "AuthorizationError";
    this.code = code;
  }
}

/** The single workspace owned by a user (MVP: one workspace per developer). */
export async function getOwnedWorkspace(userId: string): Promise<WorkspaceRow | null> {
  if (!userId) return null;

  const supabase = requireAdminClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load workspace: ${error.message}`);
  return data;
}

/**
 * Workspace + verified billing state for a user. Returns null when the user has
 * no workspace (for example a client-only account).
 */
export async function getOwnedWorkspaceWithSubscription(
  userId: string,
): Promise<{ workspace: WorkspaceRow; subscription: SubscriptionRow | null } | null> {
  if (!userId) return null;

  const supabase = requireAdminClient();
  const workspace = await getOwnedWorkspace(userId);
  if (!workspace) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load subscription: ${error.message}`);
  return { workspace, subscription: data };
}

/** Resolves the workspace that owns a form, or null when the form does not exist. */
export async function getFormWorkspaceId(formId: string): Promise<string | null> {
  if (!formId) return null;

  const supabase = requireAdminClient();
  const { data, error } = await supabase
    .from("forms")
    .select("workspace_id")
    .eq("id", formId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load form: ${error.message}`);
  return data?.workspace_id ?? null;
}

/**
 * Asserts the user owns the workspace behind the form, then returns the form.
 * Throws AuthorizationError instead of leaking whether the form exists to
 * users who do not own it.
 */
export async function requireOwnedForm(formId: string, userId: string): Promise<FormRow> {
  const supabase = requireAdminClient();

  const { data: form, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load form: ${error.message}`);
  if (!form) throw new AuthorizationError("NOT_FOUND", "Form not found");

  const workspace = await getOwnedWorkspace(userId);
  if (!workspace || workspace.id !== form.workspace_id) {
    throw new AuthorizationError("FORBIDDEN", "You do not have access to this form");
  }

  return form;
}

/** Whether the user holds an ACTIVE client permission for the form. */
export async function hasActiveClientPermission(formId: string, userId: string): Promise<boolean> {
  if (!formId || !userId) return false;

  const supabase = requireAdminClient();
  const { data, error } = await supabase
    .from("form_client_permissions")
    .select("id")
    .eq("form_id", formId)
    .eq("client_user_id", userId)
    .is("revoked_at", null)
    .maybeSingle();

  if (error) throw new Error(`Failed to load permission: ${error.message}`);
  return data !== null;
}

/**
 * Form access for the portal: true when the user is the workspace owner or
 * holds an active client permission. Use for read paths; use
 * requireOwnedForm for developer-only mutations.
 */
export async function canViewForm(formId: string, userId: string): Promise<boolean> {
  if (!formId || !userId) return false;

  const supabase = requireAdminClient();
  const { data: form, error } = await supabase
    .from("forms")
    .select("workspace_id")
    .eq("id", formId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load form: ${error.message}`);
  if (!form) return false;

  const workspace = await getOwnedWorkspace(userId);
  if (workspace && workspace.id === form.workspace_id) return true;

  return hasActiveClientPermission(formId, userId);
}
