import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getServerEnv } from "@/lib/env/server";

const SESSION_COOKIE = "formivo_admin";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

export type AdminSession = {
  username: string;
  expiresAt: number;
};

export type AdminConfig = {
  configured: boolean;
  missing: string[];
};

/**
 * Admin credentials come from the environment only. Nothing is hard-coded, so the
 * repository never contains a usable password and rotating it needs no deploy.
 */
export function getAdminConfig(): AdminConfig {
  const env = getServerEnv();
  const missing = [
    ["ADMIN_USERNAME", env.ADMIN_USERNAME],
    ["ADMIN_PASSWORD", env.ADMIN_PASSWORD],
    ["ADMIN_SESSION_SECRET", env.ADMIN_SESSION_SECRET],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => String(name));

  return { configured: missing.length === 0, missing };
}

/** Constant-time comparison over fixed-length digests, so length never leaks. */
function safeEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a, "utf8").digest();
  const right = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(left, right);
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const env = getServerEnv();
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) return false;

  // Both comparisons always run, so a wrong username costs the same as a wrong password.
  const usernameOk = safeEqual(username.trim(), env.ADMIN_USERNAME);
  const passwordOk = safeEqual(password, env.ADMIN_PASSWORD);
  return usernameOk && passwordOk;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createAdminSessionValue(username: string): string {
  const env = getServerEnv();
  if (!env.ADMIN_SESSION_SECRET) throw new Error("Admin sessions are not configured.");

  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ username, expiresAt }), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload, env.ADMIN_SESSION_SECRET)}`;
}

export function verifyAdminSessionValue(value: string | undefined): AdminSession | null {
  const env = getServerEnv();
  if (!value || !env.ADMIN_SESSION_SECRET) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload, env.ADMIN_SESSION_SECRET);
  if (!safeEqual(signature, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (typeof parsed.username !== "string" || typeof parsed.expiresAt !== "number") return null;
    if (parsed.expiresAt <= Date.now()) return null;
    // A rotated username invalidates every existing session.
    if (parsed.username !== env.ADMIN_USERNAME) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = SESSION_COOKIE;
export const ADMIN_SESSION_MAX_AGE = SESSION_TTL_SECONDS;

export async function getAdminSession(): Promise<AdminSession | null> {
  await connection();
  const store = await cookies();
  return verifyAdminSessionValue(store.get(SESSION_COOKIE)?.value);
}

/** Guards every admin page; unauthenticated visitors only ever see the login screen. */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Best-effort throttle. A single process is enough for an operational dashboard. */
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginThrottle(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  if (entry.count > 5) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clearLoginThrottle(key: string): void {
  attempts.delete(key);
}
