import "server-only";

import { isSupabaseAdminConfigured, requireAdminClient } from "@/lib/supabase/admin";

export type AdminPlatformStats = {
  available: boolean;
  reason?: string;
  profiles: number;
  developers: number;
  clients: number;
  workspaces: number;
  forms: number;
  activeForms: number;
  submissions: number;
  submissionsLast7Days: number;
  invitations: number;
  pendingInvitations: number;
  subscriptions: { plan: string; status: string; count: number }[];
};

const EMPTY_STATS: AdminPlatformStats = {
  available: false,
  profiles: 0,
  developers: 0,
  clients: 0,
  workspaces: 0,
  forms: 0,
  activeForms: 0,
  submissions: 0,
  submissionsLast7Days: 0,
  invitations: 0,
  pendingInvitations: 0,
  subscriptions: [],
};

async function count(table: string, apply?: (query: never) => unknown): Promise<number> {
  const admin = requireAdminClient();
  let query = admin.from(table).select("*", { count: "exact", head: true });
  if (apply) query = apply(query as never) as typeof query;
  const { count: value, error } = await query;
  if (error) throw new Error(error.message);
  return value ?? 0;
}

/**
 * Real counts from the application database. Anything that cannot be read is reported as
 * unavailable rather than as zero, so an empty dashboard never looks like an empty product.
 */
export async function getPlatformStats(): Promise<AdminPlatformStats> {
  if (!isSupabaseAdminConfigured()) {
    return { ...EMPTY_STATS, reason: "The database is not configured on this deployment." };
  }

  const admin = requireAdminClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [
      profiles,
      workspaces,
      forms,
      activeForms,
      submissions,
      submissionsLast7Days,
      invitations,
      pendingInvitations,
      developerRoles,
      clientRoles,
      subscriptions,
    ] = await Promise.all([
      count("profiles"),
      count("workspaces"),
      count("forms"),
      count("forms", (q) =>
        (q as unknown as { eq: (a: string, b: string) => unknown }).eq("status", "active"),
      ),
      count("submissions"),
      count("submissions", (q) =>
        (q as unknown as { gte: (a: string, b: string) => unknown }).gte("created_at", weekAgo),
      ),
      count("client_invitations"),
      count("client_invitations", (q) =>
        (q as unknown as { eq: (a: string, b: string) => unknown }).eq("status", "pending"),
      ),
      count("account_roles", (q) =>
        (q as unknown as { eq: (a: string, b: string) => unknown }).eq("role", "developer"),
      ),
      count("account_roles", (q) =>
        (q as unknown as { eq: (a: string, b: string) => unknown }).eq("role", "client"),
      ),
      admin.from("subscriptions").select("plan_key, status"),
    ]);

    if (subscriptions.error) throw new Error(subscriptions.error.message);

    const grouped = new Map<string, { plan: string; status: string; count: number }>();
    for (const row of subscriptions.data ?? []) {
      const plan = String(row.plan_key ?? "free");
      const status = String(row.status ?? "active");
      const key = `${plan}:${status}`;
      const current = grouped.get(key);
      if (current) current.count += 1;
      else grouped.set(key, { plan, status, count: 1 });
    }

    return {
      available: true,
      profiles,
      developers: developerRoles,
      clients: clientRoles,
      workspaces,
      forms,
      activeForms,
      submissions,
      submissionsLast7Days,
      invitations,
      pendingInvitations,
      subscriptions: Array.from(grouped.values()).sort((a, b) => b.count - a.count),
    };
  } catch (error) {
    return {
      ...EMPTY_STATS,
      reason: error instanceof Error ? error.message : "The database could not be read.",
    };
  }
}

export type AdminUserRow = {
  id: string;
  displayName: string;
  roles: string[];
  createdAt: string | null;
  plan: string;
  formCount: number;
};

export async function listRecentUsers(limit = 25): Promise<AdminUserRow[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const admin = requireAdminClient();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, display_name, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];

  const ids = (profiles ?? []).map((profile) => profile.id);
  if (ids.length === 0) return [];

  const [{ data: roles }, { data: workspaces }, { data: forms }] = await Promise.all([
    admin.from("account_roles").select("user_id, role").in("user_id", ids),
    admin.from("workspaces").select("id, owner_user_id").in("owner_user_id", ids),
    admin.from("forms").select("id, workspace_id, status"),
  ]);

  const workspaceByOwner = new Map((workspaces ?? []).map((w) => [w.owner_user_id, w.id]));
  const formCounts = new Map<string, number>();
  for (const form of forms ?? []) {
    formCounts.set(form.workspace_id, (formCounts.get(form.workspace_id) ?? 0) + 1);
  }

  const { data: subscriptions } = await admin
    .from("subscriptions")
    .select("workspace_id, plan_key, status");

  const planByWorkspace = new Map(
    (subscriptions ?? []).map((row) => [row.workspace_id, `${row.plan_key} (${row.status})`]),
  );

  return (profiles ?? []).map((profile) => {
    const workspaceId = workspaceByOwner.get(profile.id);
    return {
      id: profile.id,
      displayName: profile.display_name,
      roles: (roles ?? []).filter((row) => row.user_id === profile.id).map((row) => row.role),
      createdAt: profile.created_at,
      plan: workspaceId ? (planByWorkspace.get(workspaceId) ?? "free") : "no workspace",
      formCount: workspaceId ? (formCounts.get(workspaceId) ?? 0) : 0,
    };
  });
}

export type AdminSubmissionRow = {
  id: string;
  formName: string;
  status: string;
  createdAt: string;
  sourceOrigin: string | null;
};

export async function listRecentSubmissions(limit = 25): Promise<AdminSubmissionRow[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const admin = requireAdminClient();

  const { data, error } = await admin
    .from("submissions")
    .select("id, form_id, status, created_at, source_origin")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];

  const formIds = Array.from(new Set((data ?? []).map((row) => row.form_id)));
  const { data: forms } = formIds.length
    ? await admin.from("forms").select("id, name").in("id", formIds)
    : { data: [] as { id: string; name: string }[] };

  const nameById = new Map((forms ?? []).map((form) => [form.id, form.name]));

  return (data ?? []).map((row) => ({
    id: row.id,
    formName: nameById.get(row.form_id) ?? "Deleted form",
    status: row.status,
    createdAt: row.created_at,
    sourceOrigin: row.source_origin,
  }));
}

export type AdminAuditRow = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export async function listAuditLog(limit = 40): Promise<AdminAuditRow[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const admin = requireAdminClient();

  const { data, error } = await admin
    .from("audit_logs")
    .select("id, action, target_type, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    createdAt: row.created_at,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  }));
}

export type AdminFormRow = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  workspaceName: string;
  ownerUserId: string;
  submissionCount: number;
  clientCount: number;
};

/**
 * Forms with their owner and counts. Names and statuses only; no submission content
 * is read for this view.
 */
export async function listForms(limit = 100): Promise<AdminFormRow[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const admin = requireAdminClient();

  const { data: forms, error } = await admin
    .from("forms")
    .select("id, name, status, created_at, workspace_id")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];

  const workspaceIds = Array.from(new Set((forms ?? []).map((form) => form.workspace_id)));
  const [{ data: workspaces }, { data: submissions }, { data: permissions }] = await Promise.all([
    workspaceIds.length
      ? admin.from("workspaces").select("id, name, owner_user_id").in("id", workspaceIds)
      : Promise.resolve({ data: [] as { id: string; name: string; owner_user_id: string }[] }),
    admin.from("submissions").select("form_id"),
    admin.from("form_client_permissions").select("form_id, revoked_at"),
  ]);

  const workspaceById = new Map((workspaces ?? []).map((row) => [row.id, row]));
  const submissionCounts = new Map<string, number>();
  for (const row of submissions ?? []) {
    submissionCounts.set(row.form_id, (submissionCounts.get(row.form_id) ?? 0) + 1);
  }
  const clientCounts = new Map<string, number>();
  for (const row of permissions ?? []) {
    if (row.revoked_at) continue;
    clientCounts.set(row.form_id, (clientCounts.get(row.form_id) ?? 0) + 1);
  }

  return (forms ?? []).map((form) => {
    const workspace = workspaceById.get(form.workspace_id);
    return {
      id: form.id,
      name: form.name,
      status: form.status,
      createdAt: form.created_at,
      workspaceName: workspace?.name ?? "Unknown workspace",
      ownerUserId: workspace?.owner_user_id ?? "unknown",
      submissionCount: submissionCounts.get(form.id) ?? 0,
      clientCount: clientCounts.get(form.id) ?? 0,
    };
  });
}

export type AdminClientAccessRow = {
  permissionId: string;
  formId: string;
  formName: string;
  workspaceName: string;
  grantedAt: string;
  revoked: boolean;
  clientId: string;
};

/** Active and revoked client permissions. Interaction history is not invented. */
export async function listClientAccess(limit = 100): Promise<AdminClientAccessRow[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const admin = requireAdminClient();

  const { data: permissions, error } = await admin
    .from("form_client_permissions")
    .select("id, form_id, client_user_id, granted_at, revoked_at")
    .order("granted_at", { ascending: false })
    .limit(limit);
  if (error) return [];

  const formIds = Array.from(new Set((permissions ?? []).map((row) => row.form_id)));
  const { data: forms } = formIds.length
    ? await admin.from("forms").select("id, name, workspace_id").in("id", formIds)
    : { data: [] as { id: string; name: string; workspace_id: string }[] };

  const workspaceIds = Array.from(new Set((forms ?? []).map((form) => form.workspace_id)));
  const { data: workspaces } = workspaceIds.length
    ? await admin.from("workspaces").select("id, name").in("id", workspaceIds)
    : { data: [] as { id: string; name: string }[] };

  const formById = new Map((forms ?? []).map((form) => [form.id, form]));
  const workspaceName = new Map((workspaces ?? []).map((row) => [row.id, row.name]));

  return (permissions ?? []).map((row) => {
    const form = formById.get(row.form_id);
    return {
      permissionId: row.id,
      formId: row.form_id,
      formName: form?.name ?? "Deleted form",
      workspaceName: form ? (workspaceName.get(form.workspace_id) ?? "Unknown") : "Unknown",
      grantedAt: row.granted_at,
      revoked: Boolean(row.revoked_at),
      clientId: row.client_user_id,
    };
  });
}

/** Records an administrative action. Never stores a password, token or payload. */
export async function recordAdminAction(input: {
  action: string;
  actor?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;
  try {
    await requireAdminClient()
      .from("audit_logs")
      .insert({
        action: input.action,
        target_type: input.targetType ?? null,
        target_id: input.targetId ?? null,
        metadata: { ...input.metadata, admin: input.actor ?? "unknown" },
      });
  } catch {
    // Auditing must never break the action it is recording.
  }
}
