"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
  checkLoginThrottle,
  clearLoginThrottle,
  createAdminSessionValue,
  getAdminConfig,
  verifyAdminCredentials,
} from "@/lib/admin/auth";
import { recordAdminAction } from "@/lib/admin/metrics";

export type AdminLoginState = {
  error?: string;
};

function read(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function adminLoginAction(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const config = getAdminConfig();
  if (!config.configured) {
    return {
      error: `Admin access is not configured. Missing: ${config.missing.join(", ")}.`,
    };
  }

  const username = read(formData, "username").trim();
  const password = read(formData, "password");
  if (!username || !password) return { error: "Enter the admin username and password." };

  const headerList = await headers();
  const key = `${headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"}:${username}`;
  const throttle = checkLoginThrottle(key);
  if (!throttle.allowed) {
    return {
      error: `Too many attempts. Try again in ${Math.ceil(throttle.retryAfterSeconds / 60)} minutes.`,
    };
  }

  if (!verifyAdminCredentials(username, password)) {
    // A fixed delay makes the response time the same for a wrong username and a wrong
    // password, and slows a scripted attempt without blocking a real operator.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "Those credentials are not valid." };
  }

  clearLoginThrottle(key);

  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, createAdminSessionValue(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  await recordAdminAction({ action: "admin.login", actor: username });

  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, "", { path: "/admin", maxAge: 0 });
  redirect("/admin/login");
}
