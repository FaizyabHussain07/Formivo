import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";

function warnForMissingPostHogConfiguration(variable: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `${variable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variable} is configured`,
    );
  }
}

function createPostHogLoggerProvider(): LoggerProvider | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key) {
    warnForMissingPostHogConfiguration("NEXT_PUBLIC_POSTHOG_KEY");
    return null;
  }
  if (!host) {
    warnForMissingPostHogConfiguration("NEXT_PUBLIC_POSTHOG_HOST");
    return null;
  }

  try {
    return new LoggerProvider({
      resource: resourceFromAttributes({ "service.name": "formivo" }),
      processors: [
        new BatchLogRecordProcessor({
          exporter: new OTLPLogExporter({
            url: new URL("/i/v1/logs", host).toString(),
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
          }),
        }),
      ],
    });
  } catch {
    warnForMissingPostHogConfiguration("NEXT_PUBLIC_POSTHOG_HOST");
    return null;
  }
}

export const posthogLoggerProvider =
  process.env.NEXT_RUNTIME === "nodejs" ? createPostHogLoggerProvider() : null;
export const posthogLogger = posthogLoggerProvider?.getLogger("formivo.posthog");

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Fail fast on malformed configuration. Providers left unset are allowed and surface
    // an explicit "not configured" state at their service boundary instead.
    const { getServerEnv } = await import("@/lib/env/server");
    getServerEnv();
  }
}
