"use server";

import { redirect } from "next/navigation";

import { ensureDeveloperAccount } from "@/lib/auth/viewer";
import { getPublicEnv } from "@/lib/env/public";
import { errorMessage } from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  notice?: string;
  values?: { email?: string; displayName?: string };
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeNext(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function validateEmail(email: string): string | null {
  if (!email) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  if (email.length > 254) return "That email address is too long.";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Enter a password.";
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 72) return "Use at most 72 characters.";
  return null;
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const displayName = readString(formData, "displayName");
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const next = safeNext(readString(formData, "next") || "/dashboard");

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (!displayName || emailError || passwordError) {
    return {
      error: !displayName ? "Enter your name." : (emailError ?? passwordError ?? undefined),
      values: { email, displayName },
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Authentication is not configured on this deployment." };

  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return {
      error:
        error.message.toLowerCase().includes("registered")
          ? "An account with this email already exists. Sign in instead."
          : error.message,
      values: { email, displayName },
    };
  }

  if (data.session && data.user) {
    try {
      await ensureDeveloperAccount(data.user);
    } catch (setupError) {
      return { error: errorMessage(setupError), values: { email, displayName } };
    }
    redirect(next);
  }

  return {
    notice:
      "Account created. Check your inbox to confirm your email address, then sign in — the confirmation link brings you straight back to your dashboard.",
    values: { email, displayName },
  };
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const next = safeNext(readString(formData, "next") || "/dashboard");

  const emailError = validateEmail(email);
  if (emailError) return { error: emailError, values: { email } };
  if (!password) return { error: "Enter your password.", values: { email } };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Authentication is not configured on this deployment." };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { error: "That email and password combination is not correct.", values: { email } };
  }

  try {
    await ensureDeveloperAccount(data.user);
  } catch (setupError) {
    return { error: errorMessage(setupError), values: { email } };
  }

  redirect(next);
}

export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = readString(formData, "email").toLowerCase();
  const emailError = validateEmail(email);
  if (emailError) return { error: emailError, values: { email } };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Authentication is not configured on this deployment." };

  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL;
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
  });

  // Always the same response, so the form cannot be used to enumerate accounts.
  return {
    notice: "If an account exists for that email, a password reset link is on its way.",
    values: { email },
  };
}

export async function updatePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = readString(formData, "password");
  const confirm = readString(formData, "confirmPassword");

  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };
  if (password !== confirm) return { error: "The two passwords do not match." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Authentication is not configured on this deployment." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "This page needs a valid reset link. Open the link from your email again, or request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
