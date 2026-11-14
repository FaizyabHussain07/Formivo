"use server";

import { redirect } from "next/navigation";

import { queueAnalyticsEvent } from "@/lib/analytics/intent";
import { resolvePostAuthPath } from "@/lib/auth/landing";
import { findUserByEmail, isAccountVerified, issueVerificationCode } from "@/lib/auth/verification";
import { ensureAccountForSession } from "@/lib/auth/viewer";
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

/**
 * Attribution arrives from the browser as a JSON string. Only a small, known shape is
 * kept, every value is length-capped and trimmed, and anything else is dropped: account
 * metadata must never become an arbitrary storage slot.
 */
function readAttribution(formData: FormData): Record<string, string> | undefined {
  const raw = readString(formData, "attribution");
  if (!raw || raw.length > 1200) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null) return undefined;

  const allowed = [
    "source",
    "medium",
    "campaign",
    "term",
    "content",
    "referrer",
    "landingPage",
  ] as const;

  const attribution: Record<string, string> = {};
  for (const key of allowed) {
    const value = (parsed as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) {
      attribution[key] = value.trim().slice(0, 200);
    }
  }
  return Object.keys(attribution).length > 0 ? attribution : undefined;
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

/** Provider messages are technical and alarming; show an actionable sentence instead. */
function friendlyAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many emails were requested in a short time. Wait about a minute, then request another one.";
  }
  if (normalized.includes("registered")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (normalized.includes("password should be")) {
    return "Use at least 8 characters for your password.";
  }
  return message;
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const displayName = readString(formData, "displayName");
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const next = safeNext(readString(formData, "next") || "/dashboard");
  const attribution = readAttribution(formData);

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
      data: { display_name: displayName, ...(attribution ? { attribution } : {}) },
      emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return {
      error: friendlyAuthError(error.message),
      values: { email, displayName },
    };
  }

  if (!data.user) {
    return { error: "The account could not be created. Try again.", values: { email, displayName } };
  }

  // Every new account verifies its address before the workspace opens. The code is
  // issued and delivered by Formivo (Resend), so verification works even when the
  // Supabase project has its own mailer disabled.
  const issued = await issueVerificationCode(data.user);
  await queueAnalyticsEvent("sign_up");
  redirect(
    `/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&sent=${
      issued.sent ? "signup" : issued.reason
    }`,
  );
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

  /**
   * An account created before verification was enforced has a correct password but no
   * confirmed address. The password just proved who owns the account, so a fresh code is
   * sent and the user finishes verification instead of being told to "confirm your email"
   * with no way to do it.
   */
  const unverified =
    (error && /email not confirmed|not verified/i.test(error.message)) ||
    (data.user && !isAccountVerified(data.user));
  if (unverified) {
    // Supabase returns no user object for an unconfirmed account, so the address is
    // resolved through the admin API before a code can be issued.
    const account = data.user ?? (await findUserByEmail(email));
    const issued = account ? await issueVerificationCode(account) : null;
    if (!issued?.sent && !account) {
      return { error: "That email and password combination is not correct.", values: { email } };
    }
    redirect(
      `/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&sent=${
        issued && !issued.sent ? issued.reason : "login"
      }`,
    );
  }

  if (error || !data.user) {
    return { error: "That email and password combination is not correct.", values: { email } };
  }

  try {
    await ensureAccountForSession(data.user, next);
  } catch (setupError) {
    return { error: errorMessage(setupError), values: { email } };
  }

  // Resolving the role first means a client account never flashes the developer shell.
  const destination = await resolvePostAuthPath(data.user.id, next);
  await queueAnalyticsEvent("login");
  redirect(destination);
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
