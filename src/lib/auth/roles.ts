import "server-only";

import { requireAdminClient } from "@/lib/supabase/admin";

/**
 * Account roles (PRD §3). A user can legitimately hold both roles.
 *
 * Roles live in `account_roles`, which has RLS enabled with NO policies: only
 * trusted server-side logic can read or write them, so a user can never
 * self-promote through a profile update or a request payload.
 */
export type Role = "developer" | "client";

const ROLE_VALUES: readonly Role[] = ["developer", "client"];

/** Loads all roles for a user from the trusted table. */
export async function getUserRoles(userId: string): Promise<Role[]> {
  if (!userId) return [];

  const supabase = requireAdminClient();
  const { data, error } = await supabase.from("account_roles").select("role").eq("user_id", userId);

  if (error) throw new Error(`Failed to load roles: ${error.message}`);

  return (data ?? [])
    .map((row) => row.role as Role)
    .filter((role): role is Role => ROLE_VALUES.includes(role));
}

/** Whether the user holds the given role. */
export async function userHasRole(userId: string, role: Role): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(role);
}
