"use server";

import { refresh, revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/viewer";
import { errorMessage } from "@/lib/errors";
import { requireAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AccountState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

function read(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfileAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session expired. Sign in again." };

  const displayName = read(formData, "displayName");
  if (displayName.length < 1 || displayName.length > 100) {
    return { fieldErrors: { displayName: "Use between 1 and 100 characters." } };
  }

  try {
    const admin = requireAdminClient();
    const { error } = await admin
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName }, { onConflict: "id" });
    if (error) return { error: error.message };

    const supabase = await createSupabaseServerClient();
    await supabase?.auth.updateUser({ data: { display_name: displayName } });

    revalidatePath("/settings");
    revalidatePath("/client/settings");
    refresh();
    return { success: "Profile updated." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function changePasswordAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await getSessionUser();
  if (!user?.email) return { error: "Your session expired. Sign in again." };

  const currentPassword = read(formData, "currentPassword");
  const newPassword = read(formData, "newPassword");
  const confirmPassword = read(formData, "confirmPassword");

  if (!currentPassword) return { fieldErrors: { currentPassword: "Enter your current password." } };
  if (newPassword.length < 8) {
    return { fieldErrors: { newPassword: "Use at least 8 characters." } };
  }
  if (newPassword.length > 72) {
    return { fieldErrors: { newPassword: "Use at most 72 characters." } };
  }
  if (newPassword !== confirmPassword) {
    return { fieldErrors: { confirmPassword: "The two passwords do not match." } };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Authentication is not configured." };

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (reauthError) return { fieldErrors: { currentPassword: "That password is not correct." } };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  return { success: "Password updated." };
}
