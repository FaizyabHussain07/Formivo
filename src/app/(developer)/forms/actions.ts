"use server";

import { revalidatePath, refresh } from "next/cache";
import { redirect } from "next/navigation";

import { requireDeveloper } from "@/lib/auth/viewer";
import { AppError, errorMessage } from "@/lib/errors";
import {
  createForm,
  getOwnedForm,
  setFormStatus,
  updateFormAllowedOrigins,
  updateForm,
} from "@/lib/forms/service";
import { ingestSubmission } from "@/lib/submissions/service";

export type FormActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
  formId?: string;
};

function read(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createFormAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const developer = await requireDeveloper();
  let formId: string;
  try {
    const result = await createForm({
      workspaceId: developer.workspace.id,
      userId: developer.user.id,
      values: {
        name: read(formData, "name"),
        description: read(formData, "description"),
        notificationEmail: read(formData, "notificationEmail"),
      },
    });
    formId = result.formId;
    revalidatePath("/forms");
    revalidatePath("/dashboard");
  } catch (error) {
    return {
      error: errorMessage(error),
      fieldErrors: error instanceof AppError ? error.fields : undefined,
    };
  }

  // Straight to the new form's dashboard: endpoint, integration snippet and leads.
  redirect(`/forms/${formId}`);
}

export async function updateFormAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const developer = await requireDeveloper();
  const formId = read(formData, "formId");
  try {
    await updateForm({
      formId,
      workspaceId: developer.workspace.id,
      userId: developer.user.id,
      name: read(formData, "name"),
      description: read(formData, "description"),
      notificationEmail: read(formData, "notificationEmail"),
    });
    revalidatePath(`/forms/${formId}`);
    revalidatePath("/forms");
    refresh();
    return { success: "Form details saved." };
  } catch (error) {
    return {
      error: errorMessage(error),
      fieldErrors: error instanceof AppError ? error.fields : undefined,
    };
  }
}

export async function updateOriginsAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const developer = await requireDeveloper();
  const formId = read(formData, "formId");
  const raw = read(formData, "allowedOrigins");
  const origins = raw
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);

  try {
    const saved = await updateFormAllowedOrigins({
      formId,
      workspaceId: developer.workspace.id,
      userId: developer.user.id,
      origins,
    });
    revalidatePath(`/forms/${formId}/integration`);
    refresh();
    return {
      success:
        saved.length === 0
          ? "Origin restrictions removed. The endpoint accepts browser submissions from any site."
          : `Saved ${saved.length} allowed origin${saved.length === 1 ? "" : "s"}.`,
    };
  } catch (error) {
    return {
      error: errorMessage(error),
      fieldErrors: error instanceof AppError ? error.fields : undefined,
    };
  }
}

export async function setFormStatusAction(formData: FormData): Promise<void> {
  const developer = await requireDeveloper();
  const formId = read(formData, "formId");
  const status = read(formData, "status") === "active" ? "active" : "paused";
  try {
    await setFormStatus({
      formId,
      workspaceId: developer.workspace.id,
      userId: developer.user.id,
      status,
    });
    revalidatePath(`/forms/${formId}`);
    revalidatePath("/forms");
    revalidatePath("/dashboard");
    refresh();
  } catch {
    // The status control is idempotent; a failed toggle leaves the stored value.
  }
}

export async function sendTestSubmissionAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const developer = await requireDeveloper();
  const formId = read(formData, "formId");
  try {
    await getOwnedForm(formId, developer.workspace.id);
    const name = read(formData, "name") || "Test submission";
    const result = await ingestSubmission({
      formId,
      internal: true,
      payload: {
        data: {
          name,
          email: read(formData, "email") || "test@example.com",
          message: "This is a test submission sent from the Formivo dashboard.",
        },
        metadata: { source: "dashboard-test", page: `/forms/${formId}/integration` },
      },
      sourceOrigin: "dashboard-test",
    });
    revalidatePath(`/forms/${formId}/leads`);
    revalidatePath(`/forms/${formId}`);
    revalidatePath("/submissions");
    revalidatePath("/dashboard");
    refresh();
    return {
      success: `Test submission received. Reference: ${result.submissionId.slice(0, 8)}`,
    };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
