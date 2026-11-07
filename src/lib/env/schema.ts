import { z } from "zod";

/** Treats blank values (e.g. copied from `.env.example`) as unset. */
const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.url().optional(),
);

function isLocalhost(url: string): boolean {
  const { hostname } = new URL(url);
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z
      .url()
      .default("http://localhost:3000")
      .refine((url) => url.startsWith("https://") || isLocalhost(url), {
        message: "must use https:// unless it points at localhost",
      })
      .transform((url) => url.replace(/\/+$/, "")),
  ),
  NEXT_PUBLIC_ENVIRONMENT: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.enum(["development", "preview", "production"]).default("development"),
  ),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  // Analytics are optional: a deployment without either id stays fully functional.
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optionalString,
  NEXT_PUBLIC_POSTHOG_KEY: optionalString,
  NEXT_PUBLIC_POSTHOG_HOST: optionalUrl,
});

const optionalSecret = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(32, "must be at least 32 characters").optional(),
);

export const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  RESEND_API_KEY: optionalString,
  RESEND_FROM_EMAIL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.email().default("team@formivo.faizyab.me"),
  ),
  LEMONSQUEEZY_API_KEY: optionalString,
  LEMONSQUEEZY_STORE_ID: optionalString,
  LEMONSQUEEZY_WEBHOOK_SECRET: optionalString,
  LEMONSQUEEZY_PRO_VARIANT_ID: optionalString,
  LEMONSQUEEZY_AGENCY_VARIANT_ID: optionalString,
  // Deliberate switch: production checkout stays off until this is "true".
  BILLING_CHECKOUT_ENABLED: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.enum(["true", "false"]).optional(),
  ),
  // Admin dashboard credentials. Server-only: never referenced from client code.
  ADMIN_USERNAME: optionalString,
  ADMIN_PASSWORD: optionalString,
  ADMIN_SESSION_SECRET: optionalSecret,
  CRON_SECRET: optionalSecret,
  INVITATION_TOKEN_PEPPER: optionalSecret,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class EnvValidationError extends Error {
  readonly issues: string[];

  constructor(scope: string, issues: string[]) {
    super(`Invalid ${scope} environment variables:\n${issues.map((i) => `  - ${i}`).join("\n")}`);
    this.name = "EnvValidationError";
    this.issues = issues;
  }
}

/** Formats issues by variable name only, so secret values never reach logs. */
function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
}

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = publicEnvSchema.safeParse(source);
  if (!result.success) throw new EnvValidationError("public", formatIssues(result.error));
  return result.data;
}

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) throw new EnvValidationError("server", formatIssues(result.error));
  return result.data;
}
