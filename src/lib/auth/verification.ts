import "server-only";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";

import { sendEmail } from "@/lib/email/resend";
import { requireAdminClient } from "@/lib/supabase/admin";
import { getServerEnv } from "@/lib/env/server";
import type { User } from "@supabase/supabase-js";

/**
 * Email verification that does not depend on Supabase's mailer.
 *
 * The hosted project can run with "Confirm email" disabled and without custom SMTP,
 * in which case Supabase never sends a code at all. Formivo therefore issues its own
 * six-digit code, stores only a hash of it in the user's `app_metadata` (admin-only,
 * not editable from the browser) and sends the code through Resend.
 *
 * A user counts as verified when either Supabase confirmed the address
 * (`email_confirmed_at`, true for every account created before this flow) or this
 * code was entered successfully.
 */

const CODE_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 45;

export type VerificationMetadata = {
  code_hash?: string;
  expires_at?: string;
  attempts?: number;
  sent_at?: string;
  verified_at?: string;
};

function metadataFor(user: Pick<User, "app_metadata">): VerificationMetadata {
  const value = user.app_metadata?.formivo_verification;
  return value && typeof value === "object" ? (value as VerificationMetadata) : {};
}

/** True when the address is confirmed, by Supabase or by our own code. */
export function isAccountVerified(user: Pick<User, "email_confirmed_at" | "confirmed_at" | "app_metadata">): boolean {
  if (user.email_confirmed_at ?? user.confirmed_at) return true;
  return Boolean(metadataFor(user as Pick<User, "app_metadata">).verified_at);
}

function hashCode(userId: string, code: string): string {
  return createHash("sha256").update(`${userId}:${code}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function verificationEmail(code: string, appUrl: string) {
  const url = appUrl.replace(/\/+$/, "");
  const subject = `${code} is your Formivo verification code`;
  const text = [
    `Your Formivo verification code is ${code}.`,
    "",
    `Enter it on ${url}/verify to finish signing in. The code expires in ${CODE_TTL_MINUTES} minutes.`,
    "",
    "If you did not create a Formivo account, you can ignore this email.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f8fafc;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="font-size:16px;font-weight:700;letter-spacing:-0.01em;color:#0f766e;padding-bottom:20px;">Formivo</div>
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
        <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;">Verify your email address</h1>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">
          Enter this code on the verification page to finish creating your Formivo account.
        </p>
        <p style="margin:0 0 20px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:30px;font-weight:700;letter-spacing:8px;color:#0f172a;">
          ${code}
        </p>
        <a href="${url}/verify" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">
          Open the verification page
        </a>
        <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
          The code expires in ${CODE_TTL_MINUTES} minutes. If you did not create an account,
          you can ignore this email.
        </p>
      </div>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

/**
 * Looks an account up by address with the admin API.
 *
 * Needed because an unconfirmed account cannot sign in, so there is no session to read
 * the user from while verifying. The GoTrue admin endpoint supports an exact email
 * filter, which is cheaper and more precise than paging every user.
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const env = getServerEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const response = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?filter=${encodeURIComponent(email.trim().toLowerCase())}`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) return null;

  const body = (await response.json().catch(() => null)) as { users?: User[] } | null;
  const match = body?.users?.find(
    (candidate) => candidate.email?.toLowerCase() === email.trim().toLowerCase(),
  );
  return match ?? null;
}

export type IssueResult =
  | { sent: true }
  | { sent: false; reason: "cooldown" }
  | { sent: false; reason: "email_failed" }
  | { sent: false; reason: "not_configured" };

/**
 * Generates a code, stores its hash and emails it. Calling it again inside the
 * cooldown leaves the existing code intact so a double submit cannot invalidate the
 * code the user is about to type.
 */
export async function issueVerificationCode(user: User): Promise<IssueResult> {
  const admin = requireAdminClient();
  const existing = metadataFor(user);
  if (existing.sent_at && !existing.verified_at) {
    const age = Date.now() - new Date(existing.sent_at).getTime();
    if (Number.isFinite(age) && age < RESEND_COOLDOWN_SECONDS * 1000) {
      return { sent: false, reason: "cooldown" };
    }
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const email = user.email ?? "";
  if (!email) return { sent: false, reason: "email_failed" };

  const env = getServerEnv();
  const delivery = await sendEmail({
    to: email,
    ...verificationEmail(code, env.NEXT_PUBLIC_APP_URL),
  });
  if (!delivery.sent) {
    return {
      sent: false,
      reason: delivery.reason === "not_configured" ? "not_configured" : "email_failed",
    };
  }

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata ?? {}),
      formivo_verification: {
        code_hash: hashCode(user.id, code),
        expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString(),
        attempts: 0,
        sent_at: new Date().toISOString(),
      } satisfies VerificationMetadata,
    },
  });
  if (error) return { sent: false, reason: "email_failed" };

  return { sent: true };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "no_code" | "expired" | "attempts" | "mismatch" };

/** Checks a submitted code and, on success, records the address as verified. */
export async function verifyEmailCode(user: User, code: string): Promise<VerifyResult> {
  const admin = requireAdminClient();
  const metadata = metadataFor(user);
  if (!metadata.code_hash || !metadata.expires_at) return { ok: false, reason: "no_code" };

  if (Date.parse(metadata.expires_at) < Date.now()) return { ok: false, reason: "expired" };

  const attempts = metadata.attempts ?? 0;
  if (attempts >= MAX_ATTEMPTS) return { ok: false, reason: "attempts" };

  const candidate = hashCode(user.id, code);
  if (!safeEqual(candidate, metadata.code_hash)) {
    // Attempts are counted so a six-digit space cannot be walked.
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...(user.app_metadata ?? {}),
        formivo_verification: { ...metadata, attempts: attempts + 1 },
      },
    });
    return { ok: false, reason: "mismatch" };
  }

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata ?? {}),
      formivo_verification: {
        verified_at: new Date().toISOString(),
        sent_at: metadata.sent_at,
      } satisfies VerificationMetadata,
    },
  });
  if (error) return { ok: false, reason: "mismatch" };

  // Also confirm the address in Supabase when possible, so every other surface agrees.
  if (!user.email_confirmed_at) {
    await admin.auth.admin.updateUserById(user.id, { email_confirm: true }).catch(() => undefined);
  }

  return { ok: true };
}
