"use server";

import { refresh, revalidatePath } from "next/cache";

import { requireDeveloper } from "@/lib/auth/viewer";
import { errorMessage } from "@/lib/errors";
import { requireAdminClient } from "@/lib/supabase/admin";

export type WorkspaceState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateWorkspaceAction(
  _prev: WorkspaceState,
  formData: FormData,
): Promise<WorkspaceState> {
  const developer = await requireDeveloper();
  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 1 || name.length > 80) {
    return { fieldErrors: { name: "Use between 1 and 80 characters." } };
  }

  try {
    const admin = requireAdminClient();
    const { error } = await admin
      .from("workspaces")
      .update({ name })
      .eq("id", developer.workspace.id)
      .eq("owner_user_id", developer.user.id);
    if (error) return { error: error.message };

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    refresh();
    return { success: "Workspace name saved." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
