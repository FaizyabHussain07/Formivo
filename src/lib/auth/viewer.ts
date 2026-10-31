import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { User } from "@supabase/supabase-js";

import { getWorkspaceEntitlements, type WorkspaceEntitlements } from "@/lib/billing/entitlements";
import type { PlanDefinition, PlanKey } from "@/lib/billing/plans";
import { requireAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = { id: string; email: string; displayName: string };

export type DeveloperContext = {
  kind: "developer";
  user: SessionUser;
  workspace: { id: string; name: string; slug: string | null; createdAt: string };
  entitlements: WorkspaceEntitlements;
  planKey: PlanKey;
  plan: PlanDefinition;
};

export type ClientForm = {
  permissionId: string;
  formId: string;
  name: string;
  description: string | null;
  status: string;
  grantedAt: string;
};

export type ClientContext = {
  kind: "client";
  user: SessionUser;
  forms: ClientForm[];
};

/**
 * The authenticated Supabase user, or null. `getUser()` validates the JWT with
 * Supabase Auth — it is the only identity source the server trusts.
 */
export const getSessionUser = cache(async (): Promise<User | null> => {
  // Session lookup reads cookies and JWT timestamps, so the render must be dynamic.
  // Declaring that up front keeps Cache Components from rejecting non-deterministic
  // values (Date.now inside the auth client) during prerendering.
  await connection();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
});

function toSessionUser(user: User): SessionUser {
  const metadataName =
    typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null;
  return {
    id: user.id,
    email: user.email ?? "",
    displayName: metadataName?.trim() || user.email?.split("@")[0] || "Developer",
  };
}

/**
 * Idempotent account bootstrap: profile, developer role, workspace and free
 * subscription. Safe to call on every sign-in.
 */
export async function ensureDeveloperAccount(user: User): Promise<void> {
  const admin = requireAdminClient();
  const displayName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : undefined;
  const { error } = await admin.rpc("api_initialize_developer_account", {
    p_user_id: user.id,
    p_email: user.email ?? "",
    p_display_name: displayName ?? undefined,
  });
  if (error) throw new Error(`Could not initialize the account: ${error.message}`);
}

/**
 * Client accounts are deliberately different from developer accounts: a profile and a
 * `client` role only — no workspace, no subscription and no billing state. Access is
 * granted per form through an invitation, never through account creation.
 */
export async function ensureClientAccount(user: User): Promise<void> {
  const admin = requireAdminClient();
  const metadataName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name.trim()
      : "";
  const displayName = metadataName || user.email?.split("@")[0] || "Client";

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: user.id, display_name: displayName }, { onConflict: "id" });
  if (profileError) throw new Error(`Could not create the client profile: ${profileError.message}`);

  const { data: existingRole, error: roleError } = await admin
    .from("account_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("role", "client")
    .maybeSingle();
  if (roleError) throw new Error(roleError.message);

  if (!existingRole) {
    const { error: insertError } = await admin
      .from("account_roles")
      .insert({ user_id: user.id, role: "client" });
    if (insertError && insertError.code !== "23505") {
      throw new Error(`Could not create the client role: ${insertError.message}`);
    }
  }
}

/**
 * One entry point for every authentication path (email confirmation, password sign-in,
 * magic-link callback). Existing roles are preserved: a client is never upgraded into a
 * developer, and a developer never loses their workspace. Brand-new accounts are made a
 * developer unless they arrived through a client invitation.
 */
export async function ensureAccountForSession(user: User, next = ""): Promise<void> {
  const admin = requireAdminClient();
  const { data: roles, error: roleError } = await admin
    .from("account_roles")
    .select("role")
    .eq("user_id", user.id);
  if (roleError) throw new Error(roleError.message);

  const assigned = new Set((roles ?? []).map((row) => row.role));
  if (assigned.has("developer")) {
    await ensureDeveloperAccount(user);
    return;
  }
  if (assigned.has("client")) {
    await ensureClientAccount(user);
    return;
  }

  const { data: permissions, error: permissionError } = await admin
    .from("form_client_permissions")
    .select("id")
    .eq("client_user_id", user.id)
    .is("revoked_at", null)
    .limit(1);
  if (permissionError) throw new Error(permissionError.message);

  const invited =
    Boolean(permissions && permissions.length > 0) ||
    next.startsWith("/invite/") ||
    (Boolean(user.email) && (await hasPendingInvitation(user.email ?? "")));

  if (invited) await ensureClientAccount(user);
  else await ensureDeveloperAccount(user);
}

async function hasPendingInvitation(email: string): Promise<boolean> {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("client_invitations")
    .select("id")
    .eq("invited_email", email.toLowerCase())
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .limit(1);
  if (error) return false;
  return Boolean(data && data.length > 0);
}

export const getDeveloperContext = cache(async (): Promise<DeveloperContext | null> => {
  const user = await getSessionUser();
  if (!user) return null;

  const admin = requireAdminClient();
  const sessionUser = toSessionUser(user);

  const { data: roleRows, error: roleError } = await admin
    .from("account_roles")
    .select("role")
    .eq("user_id", user.id);
  if (roleError) throw new Error(roleError.message);

  const roles = new Set((roleRows ?? []).map((row) => row.role));
  if (!roles.has("developer")) return null;

  const loadWorkspace = async () => {
    const { data, error } = await admin
      .from("workspaces")
      .select("id, name, slug, created_at")
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  };

  let workspace = await loadWorkspace();
  if (!workspace) {
    // Self-heal accounts whose bootstrap step was interrupted.
    await ensureDeveloperAccount(user);
    workspace = await loadWorkspace();
  }
  if (!workspace) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const entitlements = await getWorkspaceEntitlements(workspace.id);

  return {
    kind: "developer",
    user: { ...sessionUser, displayName: profile?.display_name || sessionUser.displayName },
    workspace: {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      createdAt: workspace.created_at,
    },
    entitlements,
    planKey: entitlements.planKey,
    plan: entitlements.plan,
  };
});

export const getClientContext = cache(async (): Promise<ClientContext | null> => {
  const user = await getSessionUser();
  if (!user) return null;

  const admin = requireAdminClient();
  const { data: permissions, error } = await admin
    .from("form_client_permissions")
    .select("id, form_id, granted_at")
    .eq("client_user_id", user.id)
    .is("revoked_at", null)
    .order("granted_at", { ascending: false });
  if (error) throw new Error(error.message);

  const { data: roleRows, error: roleError } = await admin
    .from("account_roles")
    .select("role")
    .eq("user_id", user.id);
  if (roleError) throw new Error(roleError.message);
  const hasClientRole = (roleRows ?? []).some((row) => row.role === "client");
  if (!hasClientRole && permissions.length === 0) return null;

  const formIds = permissions.map((permission) => permission.form_id);
  const { data: forms, error: formsError } = await admin
    .from("forms")
    .select("id, name, description, status")
    .in("id", formIds);
  if (formsError) throw new Error(formsError.message);

  const formById = new Map((forms ?? []).map((form) => [form.id, form]));
  const sessionUser = toSessionUser(user);
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  // A signed-in client is a valid context even before they accept their first
  // invitation; the portal then shows an explicit empty state.
  if (!permissions || permissions.length === 0) {
    return {
      kind: "client",
      user: { ...sessionUser, displayName: profile?.display_name || sessionUser.displayName },
      forms: [],
    };
  }

  return {
    kind: "client",
    user: { ...sessionUser, displayName: profile?.display_name || sessionUser.displayName },
    forms: permissions.flatMap((permission) => {
      const form = formById.get(permission.form_id);
      if (!form) return [];
      return [
        {
          permissionId: permission.id,
          formId: form.id,
          name: form.name,
          description: form.description,
          status: form.status,
          grantedAt: permission.granted_at,
        },
      ];
    }),
  };
});

/** Redirects instead of throwing so protected pages never render without a session. */
export async function requireDeveloper(): Promise<DeveloperContext> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const developer = await getDeveloperContext();
  if (!developer) {
    // Clients must never bounce between the dashboard and the portal.
    const client = await getClientContext();
    redirect(client ? "/client" : "/login");
  }
  return developer;
}

export async function requireClient(): Promise<ClientContext> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const client = await getClientContext();
  if (!client) {
    const developer = await getDeveloperContext();
    redirect(developer ? "/dashboard" : "/login");
  }
  return client;
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return toSessionUser(user);
}

/** A client may read only the forms explicitly shared with them. */
export async function requireClientForm(formId: string): Promise<{
  user: SessionUser;
  client: ClientContext;
  form: ClientForm;
}> {
  const client = await requireClient();
  const form = client.forms.find((candidate) => candidate.formId === formId);
  if (!form) redirect("/client");
  return { user: client.user, client, form };
}
