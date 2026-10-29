import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { getServerEnv } from "@/lib/env/server";

function requirePepper(name: "FORM_SECRET_PEPPER" | "INVITATION_TOKEN_PEPPER"): string {
  const value = getServerEnv()[name];
  if (!value) {
    throw new Error(
      `${name} is not configured. Generate one with \`openssl rand -hex 32\` and set it in the environment.`,
    );
  }
  return value;
}

/** Cryptographically random, URL-safe token (256 bits by default). */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** A form submission secret, shown to the developer exactly once. */
export function generateFormSecret(): string {
  return `fm_live_${randomBytes(32).toString("base64url")}`;
}

export function lastFour(value: string): string {
  return value.slice(-4);
}

/**
 * Form secrets are high-entropy, so a keyed SHA-256 hash is appropriate and fast
 * enough for every public submission request. The pepper never reaches the database.
 */
export function hashFormSecret(secret: string): string {
  return createHmac("sha256", requirePepper("FORM_SECRET_PEPPER")).update(secret).digest("hex");
}

export function verifyFormSecret(secret: string, storedHash: string | null): boolean {
  if (!storedHash) return false;
  const expected = Buffer.from(storedHash, "hex");
  const actual = Buffer.from(hashFormSecret(secret), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Invitation tokens are bearer credentials; only their hash is stored. */
export function hashInvitationToken(token: string): string {
  return createHmac("sha256", requirePepper("INVITATION_TOKEN_PEPPER")).update(token).digest("hex");
}

/** Stable hash of a JSON request body, used for idempotency comparisons. */
export function hashRequestBody(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}
