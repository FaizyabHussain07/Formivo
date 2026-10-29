import "server-only";

import { z } from "zod";

import { assertCanAddViewer, getWorkspaceEntitlements } from "@/lib/billing/entitlements";
import { invitationEmail, sendEmail } from "@/lib/email/resend";
import { AppError, mapDatabaseError } from "@/lib/errors";
import { generateToken, hashInvitationToken } from "@/lib/security/tokens";
import { requireAdminClient } from "@/lib/supabase/admin";

const emailSchema = z.email("Enter a valid email address.");

const INVITATION_DAYS = 7;

export type InvitationRecord = {
  id: string;
  formId: string;
  formName: string;
  email: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
};

export type ClientAccessRecord = {
  permissionId: string;
  formId: string;
  formName: string;
  clientUserId: string;
  clientEmail: string | null;
  grantedAt: string;
};

export type InviteResult = {
  invitationId: string;
  inviteUrl: string;
  emailSent: boolean;
  emailFailureReason?: string;
  expiresAt: string;
};

export async function createInvitation(input: {
  workspaceId: string;
  workspaceName: string;
  formId: string;
  email: string;
  invitedByUserId: string;
  appUrl: string;
}): Promise<InviteResult> {
  const parsedEmail = emailSchema.safeParse(input.email.trim().toLowerCase());
  if (!parsedEmail.success) {
    throw new AppError("VALIDATION_ERROR", "Enter a valid email address.", {
      email: "Enter a valid email address.",
    });
  }
  const email = parsedEmail.data;

  const admin = requireAdminClient();
  const { data: form, error: formError } = await admin
    .from("forms")
    .select("id, name, workspace_id")
    .eq("id", input.formId)
    .eq("workspace_id", input.workspaceId)
    .maybeSingle();
  if (formError) throw new AppError("INTERNAL_ERROR", formError.message);
  if (!form) throw new AppError("FORM_NOT_FOUND");

  const { data: existingPermission, error: permissionError } = await admin
    .from("form_client_permissions")
    .select("id")
    .eq("form_id", form.id)
    .is("revoked_at", null)
    .maybeSingle();
  if (permissionError) throw new AppError("INTERNAL_ERROR", permissionError.message);
  if (existingPermission) throw new AppError("ALREADY_HAS_ACCESS");

  const { data: pending, error: pendingError } = await admin
    .from("client_invitations")
    .select("id, expires_at")
    .eq("form_id", form.id)
    .eq("invited_email", email)
    .eq("status", "pending")
    .maybeSingle();
  if (pendingError) throw new AppError("INTERNAL_ERROR", pendingError.message);
  if (pending && new Date(pending.expires_at) > new Date()) throw new AppError("ALREADY_INVITED");

  await assertCanAddViewer(input.workspaceId);

  const token = generateToken(32);
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(Date.now() + INVITATION_DAYS * 86_400_000);

  const { data: invitation, error } = await admin
    .from("client_invitations")
    .insert({
      form_id: form.id,
      invited_email: email,
      token_hash: tokenHash,
      invited_by_user_id: input.invitedByUserId,
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();
  if (error || !invitation) {
    if (error?.code === "23505") throw new AppError("ALREADY_INVITED");
    throw new AppError("INTERNAL_ERROR", error?.message);
  }

  const inviteUrl = `${input.appUrl.replace(/\/+$/, "")}/invite/${token}`;
  const emailContent = invitationEmail({
    formName: form.name,
    workspaceName: input.workspaceName,
    inviteUrl,
    expiresAt,
    appUrl: input.appUrl,
  });
  const delivery = await sendEmail({ to: email, ...emailContent });

  await admin.from("audit_logs").insert({
    actor_user_id: input.invitedByUserId,
    workspace_id: input.workspaceId,
    action: "invitation.created",
    target_type: "form",
    target_id: form.id,
    metadata: { invitation_id: invitation.id },
  });

  return {
    invitationId: invitation.id,
    inviteUrl,
    emailSent: delivery.sent,
    emailFailureReason: delivery.sent ? undefined : delivery.reason,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function listWorkspaceInvitations(workspaceId: string): Promise<InvitationRecord[]> {
  const admin = requireAdminClient();
  const { data: forms, error: formsError } = await admin
    .from("forms")
    .select("id, name")
    .eq("workspace_id", workspaceId);
  if (formsError) throw new AppError("INTERNAL_ERROR", formsError.message);
  const names = new Map((forms ?? []).map((form) => [form.id, form.name]));
  if (names.size === 0) return [];

  const { data, error } = await admin
    .from("client_invitations")
    .select("id, form_id, invited_email, status, expires_at, created_at, accepted_at")
    .in(
      "form_id",
      [...names.keys()],
    )
    .order("created_at", { ascending: false });
  if (error) throw new AppError("INTERNAL_ERROR", error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    formId: row.form_id,
    formName: names.get(row.form_id) ?? "Unknown form",
    email: row.invited_email,
    status: row.status === "pending" && new Date(row.expires_at) <= new Date() ? "expired" : row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  }));
}

export async function listWorkspaceClientAccess(
  workspaceId: string,
): Promise<ClientAccessRecord[]> {
  const admin = requireAdminClient();
  const { data: forms, error: formsError } = await admin
    .from("forms")
    .select("id, name")
    .eq("workspace_id", workspaceId);
  if (formsError) throw new AppError("INTERNAL_ERROR", formsError.message);
  const names = new Map((forms ?? []).map((form) => [form.id, form.name]));
  if (names.size === 0) return [];

  const { data, error } = await admin
    .from("form_client_permissions")
    .select("id, form_id, client_user_id, granted_at")
    .in(
      "form_id",
      [...names.keys()],
    )
    .is("revoked_at", null)
    .order("granted_at", { ascending: false });
  if (error) throw new AppError("INTERNAL_ERROR", error.message);

  const userIds = [...new Set((data ?? []).map((row) => row.client_user_id))];
  const emails = new Map<string, string | null>();
  await Promise.all(
    userIds.map(async (userId) => {
      const { data: userResult } = await admin.auth.admin.getUserById(userId);
      emails.set(userId, userResult.user?.email ?? null);
    }),
  );

  return (data ?? []).map((row) => ({
    permissionId: row.id,
    formId: row.form_id,
    formName: names.get(row.form_id) ?? "Unknown form",
    clientUserId: row.client_user_id,
    clientEmail: emails.get(row.client_user_id) ?? null,
    grantedAt: row.granted_at,
  }));
}

export async function revokeInvitation(input: {
  invitationId: string;
  workspaceId: string;
  userId: string;
}): Promise<void> {
  const admin = requireAdminClient();
  const { data: invitation, error } = await admin
    .from("client_invitations")
    .select("id, form_id, status")
    .eq("id", input.invitationId)
    .maybeSingle();
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  if (!invitation) throw new AppError("INVITATION_NOT_FOUND");

  const { data: form } = await admin
    .from("forms")
    .select("id, workspace_id")
    .eq("id", invitation.form_id)
    .maybeSingle();
  if (!form || form.workspace_id !== input.workspaceId) throw new AppError("INVITATION_NOT_FOUND");
  if (invitation.status !== "pending") {
    throw new AppError("INVALID_REQUEST", "Only pending invitations can be revoked.");
  }

  const { error: updateError } = await admin
    .from("client_invitations")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", invitation.id)
    .eq("status", "pending");
  if (updateError) throw new AppError("INTERNAL_ERROR", updateError.message);

  await admin.from("audit_logs").insert({
    actor_user_id: input.userId,
    workspace_id: input.workspaceId,
    action: "invitation.revoked",
    target_type: "form",
    target_id: invitation.form_id,
    metadata: { invitation_id: invitation.id },
  });
}

export async function revokeClientAccess(input: {
  permissionId: string;
  workspaceId: string;
  userId: string;
}): Promise<void> {
  const admin = requireAdminClient();
  const { data: permission, error } = await admin
    .from("form_client_permissions")
    .select("id, form_id, client_user_id, revoked_at")
    .eq("id", input.permissionId)
    .maybeSingle();
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  if (!permission || permission.revoked_at) throw new AppError("NOT_FOUND");

  const { data: form } = await admin
    .from("forms")
    .select("id, workspace_id")
    .eq("id", permission.form_id)
    .maybeSingle();
  if (!form || form.workspace_id !== input.workspaceId) throw new AppError("NOT_FOUND");

  const { error: updateError } = await admin
    .from("form_client_permissions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", permission.id)
    .is("revoked_at", null);
  if (updateError) throw new AppError("INTERNAL_ERROR", updateError.message);

  await admin.from("audit_logs").insert({
    actor_user_id: input.userId,
    workspace_id: input.workspaceId,
    action: "client_access.revoked",
    target_type: "form",
    target_id: permission.form_id,
    metadata: { permission_id: permission.id },
  });
}

export type InvitationLookup = {
  invitationId: string;
  formId: string;
  formName: string;
  workspaceName: string;
  email: string;
  status: string;
  expiresAt: string;
  isExpired: boolean;
};

export async function findInvitationByToken(token: string): Promise<InvitationLookup | null> {
  if (!token || token.length < 20 || token.length > 200) return null;
  const tokenHash = hashInvitationToken(token);
  const admin = requireAdminClient();

  const { data, error } = await admin
    .from("client_invitations")
    .select("id, form_id, invited_email, status, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  if (!data) return null;

  const { data: form } = await admin
    .from("forms")
    .select("id, name, workspace_id")
    .eq("id", data.form_id)
    .maybeSingle();
  if (!form) return null;

  const { data: workspace } = await admin
    .from("workspaces")
    .select("name")
    .eq("id", form.workspace_id)
    .maybeSingle();

  return {
    invitationId: data.id,
    formId: data.form_id,
    formName: form.name,
    workspaceName: workspace?.name ?? "A Formivo workspace",
    email: data.invited_email,
    status: data.status,
    expiresAt: data.expires_at,
    isExpired: new Date(data.expires_at) <= new Date(),
  };
}

export async function acceptInvitation(input: {
  token: string;
  userId: string;
  userEmail: string;
}): Promise<{ formId: string }> {
  const tokenHash = hashInvitationToken(input.token);
  const admin = requireAdminClient();

  const { data: invitation, error } = await admin
    .from("client_invitations")
    .select("form_id")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  if (!invitation) throw new AppError("INVITATION_NOT_FOUND");

  const { data: form } = await admin
    .from("forms")
    .select("workspace_id")
    .eq("id", invitation.form_id)
    .maybeSingle();
  if (!form) throw new AppError("FORM_NOT_FOUND");

  const entitlements = await getWorkspaceEntitlements(form.workspace_id);

  const { data, error: acceptError } = await admin.rpc("api_accept_client_invitation", {
    p_token_hash: tokenHash,
    p_user_id: input.userId,
    p_user_email: input.userEmail,
    p_max_viewers: entitlements.plan.viewers,
  });

  if (acceptError) throw mapDatabaseError(acceptError.message);

  const result = data as { form_id?: string } | null;
  return { formId: result?.form_id ?? invitation.form_id };
}
