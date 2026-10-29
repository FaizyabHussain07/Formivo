"use server";

import { refresh, revalidatePath } from "next/cache";

import { requireDeveloper } from "@/lib/auth/viewer";
import { getPublicEnv } from "@/lib/env/public";
import { AppError, errorMessage } from "@/lib/errors";
import {
  createInvitation,
  revokeClientAccess,
  revokeInvitation,
} from "@/lib/invitations/service";

export type InviteState = {
  error?: string;
  success?: string;
  inviteUrl?: string;
  emailSent?: boolean;
  emailFailureReason?: string;
  invitedEmail?: string;
};

function read(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function inviteClientAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const developer = await requireDeveloper();
  const formId = read(formData, "formId");
  const email = read(formData, "email");

  try {
    const result = await createInvitation({
      workspaceId: developer.workspace.id,
      workspaceName: developer.workspace.name,
      formId,
      email,
      invitedByUserId: developer.user.id,
      appUrl: getPublicEnv().NEXT_PUBLIC_APP_URL,
    });
    revalidatePath("/clients");
    revalidatePath(`/forms/${formId}/clients`);
    refresh();
    return {
      success: result.emailSent
        ? `Invitation sent to ${email}.`
        : `Invitation created for ${email}. Email delivery is unavailable, so share the secure link below yourself.`,
      inviteUrl: result.emailSent ? undefined : result.inviteUrl,
      emailSent: result.emailSent,
      emailFailureReason: result.emailFailureReason,
      invitedEmail: email,
    };
  } catch (error) {
    return {
      error: errorMessage(error),
      ...(error instanceof AppError && error.fields ? { invitedEmail: email } : {}),
    };
  }
}

export async function revokeInvitationAction(formData: FormData): Promise<void> {
  const developer = await requireDeveloper();
  try {
    await revokeInvitation({
      invitationId: read(formData, "invitationId"),
      workspaceId: developer.workspace.id,
      userId: developer.user.id,
    });
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    refresh();
  } catch {
    // Revoking is idempotent from the UI's perspective.
  }
}

export async function revokeClientAccessAction(formData: FormData): Promise<void> {
  const developer = await requireDeveloper();
  try {
    await revokeClientAccess({
      permissionId: read(formData, "permissionId"),
      workspaceId: developer.workspace.id,
      userId: developer.user.id,
    });
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    refresh();
  } catch {
    // Already revoked or not found: nothing changes.
  }
}
