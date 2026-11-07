import "server-only";

import { SeverityNumber } from "@opentelemetry/api-logs";

import { posthogLogger, posthogLoggerProvider } from "@/instrumentation";

type SubmissionLog = {
  outcome: "accepted" | "rejected" | "honeypot" | "replayed";
  statusCode: number;
  errorCode?: string;
};

export function logSubmissionOutcome({ outcome, statusCode, errorCode }: SubmissionLog): void {
  posthogLogger?.emit({
    body: "form_submission_processed",
    severityNumber: outcome === "rejected" ? SeverityNumber.WARN : SeverityNumber.INFO,
    attributes: {
      event: "form_submission_processed",
      outcome,
      "http.status_code": statusCode,
      ...(errorCode ? { error_code: errorCode } : {}),
    },
  });
}

export async function flushPostHogLogs(): Promise<void> {
  await posthogLoggerProvider?.forceFlush().catch(() => {});
}
