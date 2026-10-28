import type { ServerEnv } from "./schema";

export type IntegrationName = "supabase" | "supabaseAdmin" | "resend" | "lemonsqueezy";

const requiredVariables: Record<IntegrationName, (keyof ServerEnv)[]> = {
  supabase: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  supabaseAdmin: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  resend: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
  lemonsqueezy: [
    "LEMONSQUEEZY_API_KEY",
    "LEMONSQUEEZY_STORE_ID",
    "LEMONSQUEEZY_WEBHOOK_SECRET",
    "LEMONSQUEEZY_PRO_VARIANT_ID",
    "LEMONSQUEEZY_AGENCY_VARIANT_ID",
  ],
};

export type IntegrationStatus = {
  /** All required variables are present. This does NOT mean the provider has been verified. */
  configured: boolean;
  missing: string[];
};

export function getIntegrationStatus(env: ServerEnv, name: IntegrationName): IntegrationStatus {
  const missing = requiredVariables[name].filter((key) => env[key] === undefined);
  return { configured: missing.length === 0, missing };
}

export function getAllIntegrationStatuses(
  env: ServerEnv,
): Record<IntegrationName, IntegrationStatus> {
  return {
    supabase: getIntegrationStatus(env, "supabase"),
    supabaseAdmin: getIntegrationStatus(env, "supabaseAdmin"),
    resend: getIntegrationStatus(env, "resend"),
    lemonsqueezy: getIntegrationStatus(env, "lemonsqueezy"),
  };
}

export class IntegrationNotConfiguredError extends Error {
  readonly integration: IntegrationName;
  readonly missing: string[];

  constructor(integration: IntegrationName, missing: string[]) {
    super(`${integration} is not configured. Missing: ${missing.join(", ")}`);
    this.name = "IntegrationNotConfiguredError";
    this.integration = integration;
    this.missing = missing;
  }
}

/** Throws at the service boundary when a provider is used without configuration. */
export function assertIntegrationConfigured(env: ServerEnv, name: IntegrationName): void {
  const status = getIntegrationStatus(env, name);
  if (!status.configured) throw new IntegrationNotConfiguredError(name, status.missing);
}
