"use server";

import { refresh, revalidatePath } from "next/cache";

import { requireDeveloper } from "@/lib/auth/viewer";
import { errorMessage } from "@/lib/errors";
import { isLeadStatus, updateSubmissionStatus } from "@/lib/submissions/queries";

export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  const developer = await requireDeveloper();
  const submissionId = String(formData.get("submissionId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!submissionId || !isLeadStatus(status)) return;

  await updateSubmissionStatus({
    submissionId,
    workspaceId: developer.workspace.id,
    userId: developer.user.id,
    status,
  });

  revalidatePath("/submissions");
  revalidatePath("/dashboard");
  refresh();
}

export type LeadStatusState = { error?: string; success?: string };

export async function updateLeadStatusWithFeedbackAction(
  _prev: LeadStatusState,
  formData: FormData,
): Promise<LeadStatusState> {
  try {
    await updateLeadStatusAction(formData);
    return { success: "Status updated." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
