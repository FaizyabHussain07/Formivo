import { describe, expect, it } from "vitest";

import {
  getAllIntegrationStatuses,
  assertIntegrationConfigured,
  IntegrationNotConfiguredError,
} from "./integrations";
import { EnvValidationError, parsePublicEnv, parseServerEnv } from "./schema";

describe("parsePublicEnv", () => {
  it("defaults the app URL so the public shell loads with no configuration", () => {
    expect(parsePublicEnv({}).NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("defaults and validates NEXT_PUBLIC_ENVIRONMENT", () => {
    expect(parsePublicEnv({}).NEXT_PUBLIC_ENVIRONMENT).toBe("development");
    expect(parsePublicEnv({ NEXT_PUBLIC_ENVIRONMENT: "preview" }).NEXT_PUBLIC_ENVIRONMENT).toBe(
      "preview",
    );
    expect(() => parsePublicEnv({ NEXT_PUBLIC_ENVIRONMENT: "staging" })).toThrow(
      /NEXT_PUBLIC_ENVIRONMENT/,
    );
  });

  it("treats blank values as unset", () => {
    const env = parsePublicEnv({ NEXT_PUBLIC_APP_URL: "", NEXT_PUBLIC_SUPABASE_URL: "  " });
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
  });

  it("strips trailing slashes from the app URL", () => {
    expect(
      parsePublicEnv({ NEXT_PUBLIC_APP_URL: "https://formivo.faizyab.me/" }).NEXT_PUBLIC_APP_URL,
    ).toBe("https://formivo.faizyab.me");
  });

  it("rejects non-https app URLs outside localhost", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_APP_URL: "http://formivo.faizyab.me" })).toThrow(
      EnvValidationError,
    );
  });

  it("rejects malformed URLs", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "not-a-url" })).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });
});

describe("parseServerEnv", () => {
  it("accepts an empty environment", () => {
    const env = parseServerEnv({});
    expect(env.RESEND_FROM_EMAIL).toBe("team@formivo.faizyab.me");
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
  });

  it.each(["CRON_SECRET", "INVITATION_TOKEN_PEPPER"])("rejects a short %s", (key) => {
    expect(() => parseServerEnv({ [key]: "short" })).toThrow(new RegExp(key));
  });

  it("never includes secret values in error messages", () => {
    const secret = "super-secret-value";
    try {
      parseServerEnv({ CRON_SECRET: secret, RESEND_FROM_EMAIL: secret });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as Error).message).not.toContain(secret);
    }
  });
});

describe("integration status", () => {
  it("reports unconfigured providers with the missing variable names", () => {
    const statuses = getAllIntegrationStatuses(parseServerEnv({}));
    expect(statuses.supabase).toEqual({
      configured: false,
      missing: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    });
    expect(statuses.lemonsqueezy.configured).toBe(false);
  });

  it("reports configured providers when all variables are present", () => {
    const env = parseServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    });
    expect(getAllIntegrationStatuses(env).supabase).toEqual({ configured: true, missing: [] });
  });

  it("throws a typed error when an unconfigured provider is used", () => {
    expect(() => assertIntegrationConfigured(parseServerEnv({}), "resend")).toThrow(
      IntegrationNotConfiguredError,
    );
  });
});
