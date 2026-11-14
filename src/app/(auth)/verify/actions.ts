"use server";

import { redirect } from "next/navigation";

import { queueAnalyticsEvent } from "@/lib/analytics/intent";
import { resolvePostAuthPath } from "@/lib/auth/landing";
import {
  findUserByEmail,
  issueVerificationCode,
  verifyEmailCode,
} from "@/lib/auth/verification";
import { ensureAccountForSession, getSessionUser } from "@/lib/auth/viewer";
import { errorMessage } from "@/lib/errors";
import { requireAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type VerifyState = {
  error?: string;
  notice?: string;
  /** Seconds until another code may be requested. */
  cooldown?: number;
};

const COOLDOWN_SECONDS = 60;

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeNext(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function verifyError(reason: "no_code" | "expired" | "attempts" | "mismatch"): string {
  switch (reason) {
    case "expired":
      return "That code has expired. Request a new one and use the newest email.";
    case "attempts":
      return "Too many incorrect attempts. Request a new code to continue.";
    case "no_code":
      return "There is no code waiting for this account. Request a new one.";
    default:
      return "That code is not correct. Check the six digits in your inbox and try again.";
  }
}

/**
 * Starts a session for an address that just verified its code but could not sign in
 * (Supabase refuses password sign-in until the address is confirmed). A single-use
 * magic link is generated server-side and redeemed immediately, so the browser still
 * receives normal session cookies.
 */
async function startSessionAfterVerification(email: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;

  const admin = requireAdminClient();
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError || !link.properties?.hashed_token) return false;

  const { error } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties.hashed_token,
  });
  return !error;
}

export async function verifyEmailOtpAction(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const token = readString(formData, "token").replace(/\s+/g, "");
  const email = readString(formData, "email").toLowerCase();
  const next = safeNext(readString(formData, "next") || "/dashboard");

  if (!/^\d{6}$/.test(token)) return { error: "Enter the six-digit code from the email." };

  let user = await getSessionUser();
  if (!user && !email) {
    return { error: "Enter the email address the code was sent to." };
  }
  user ??= await findUserByEmail(email);
  if (!user) {
    return { error: "No account matches that email address. Sign up first, then verify." };
  }

  let result: Awaited<ReturnType<typeof verifyEmailCode>>;
  try {
    result = await verifyEmailCode(user, token);
  } catch (verificationError) {
    return { error: errorMessage(verificationError) };
  }
  if (!result.ok) return { error: verifyError(result.reason) };

  if (!(await getSessionUser())) {
    const started = await startSessionAfterVerification(user.email ?? email);
    if (!started) {
      return {
        error: "The code was accepted, but the session could not be created. Sign in with your password to continue.",
      };
    }
  }

  try {
    const sessionUser = (await getSessionUser()) ?? user;
    await ensureAccountForSession(sessionUser, next);
    await queueAnalyticsEvent("email_verified", "sign_up");
    redirect(await resolvePostAuthPath(sessionUser.id, next));
  } catch (setupError) {
    return { error: errorMessage(setupError) };
  }
}

export async function resendVerificationAction(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const email = readString(formData, "email").toLowerCase();
  const user = (await getSessionUser()) ?? (email ? await findUserByEmail(email) : null);
  if (!user) {
    return {
      error: "Enter the email address you signed up with, then request a new code.",
      cooldown: 15,
    };
  }

  const issued = await issueVerificationCode(user);
  if (!issued.sent) {
    if (issued.reason === "cooldown") {
      return {
        error: "A code was sent moments ago. Wait a few seconds before requesting another.",
        cooldown: 15,
      };
    }
    if (issued.reason === "not_configured") {
      return {
        error:
          "Email delivery is not configured. Contact faizyabdev@gmail.com and the account will be verified manually.",
        cooldown: COOLDOWN_SECONDS,
      };
    }
    return {
      error: "The email could not be sent. Check the address, then try again.",
      cooldown: COOLDOWN_SECONDS,
    };
  }

  return {
    notice: "A new six-digit code is on its way and replaces any earlier code. It works for 15 minutes.",
    cooldown: COOLDOWN_SECONDS,
  };
}
