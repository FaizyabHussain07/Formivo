import "server-only";

import { createHash, createHmac, randomBytes } from "node:crypto";

import { getServerEnv } from "@/lib/env/server";

function requireInvitationPepper(): string {
  const name = "INVITATION_TOKEN_PEPPER";
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

/** Invitation tokens are bearer credentials; only their hash is stored. */
export function hashInvitationToken(token: string): string {
  return createHmac("sha256", requireInvitationPepper()).update(token).digest("hex");
}

/** Stable hash of a JSON request body, used for idempotency comparisons. */
export function hashRequestBody(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
