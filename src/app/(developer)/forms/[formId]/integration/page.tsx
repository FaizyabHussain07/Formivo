import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AllowedOriginsForm } from "@/components/forms/allowed-origins-form";
import { ConnectKit } from "@/components/forms/connect-kit";
import { TestSubmission } from "@/components/forms/test-submission";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { requireDeveloper } from "@/lib/auth/viewer";
import { getPublicEnv } from "@/lib/env/public";
import { AppError } from "@/lib/errors";
import { formSubmissionEndpoint, getOwnedForm } from "@/lib/forms/service";

export const metadata: Metadata = { title: "Integration" };

export default async function Page({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const developer = await requireDeveloper();

  let form;
  try {
    form = await getOwnedForm(formId, developer.workspace.id);
  } catch (error) {
    if (error instanceof AppError && error.code === "FORM_NOT_FOUND") notFound();
    throw error;
  }

  const endpoint = formSubmissionEndpoint(getPublicEnv().NEXT_PUBLIC_APP_URL, form.id);

  const responseSnippet = `{
  "success": true,
  "leadId": "9d1f2c4a-…",
  "message": "Submission received."
}`;

  const errorSnippet = `{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field \\"email\\" must be a valid email address."
  }
}`;

  return (
    <div className="flex flex-col gap-8">
      <ConnectKit endpoint={endpoint} formName={form.name} />

      <Alert tone="info" title="The endpoint is public. Your data is not.">
        Anyone who knows the form ID can send a submission, exactly like a normal website form. The
        endpoint never reads or returns stored submissions. Only you (and a client you explicitly
        invite) can view, update or export them from the dashboard.
      </Alert>

      <section aria-labelledby="contract-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="contract-heading" className="text-base font-semibold text-foreground">
            Response contract
          </h2>
          <p className="text-sm text-foreground-secondary">
            Every request returns JSON. Branch on the HTTP status first, then read{" "}
            <code className="font-mono text-xs">error.message</code> when the request fails.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <CodeBlock title="201 Created" language="json" code={responseSnippet} />
          <CodeBlock title="4xx Error" language="json" code={errorSnippet} />
        </div>
      </section>

      <section aria-labelledby="credentials-heading" className="flex flex-col gap-4">
        <h2 id="credentials-heading" className="text-base font-semibold text-foreground">
          Endpoint details
        </h2>
        <dl className="grid gap-x-6 gap-y-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-medium tracking-wide text-foreground-muted uppercase">
              Authentication
            </dt>
            <dd className="text-sm text-foreground-secondary">
              <Badge tone="success">None required</Badge>
            </dd>
            <p className="text-xs text-foreground-muted">No secret or token. The form id is public.</p>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-medium tracking-wide text-foreground-muted uppercase">
              Form ID
            </dt>
            <dd className="font-mono text-xs break-all text-foreground-secondary">{form.id}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-medium tracking-wide text-foreground-muted uppercase">
              Accepted bodies
            </dt>
            <dd className="text-sm text-foreground-secondary">
              JSON · form-encoded · multipart (no files)
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-medium tracking-wide text-foreground-muted uppercase">
              Limits
            </dt>
            <dd className="text-sm text-foreground-secondary">256 KB · 100 fields · 5 levels</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="origins-heading" className="flex flex-col gap-4">
        <h2 id="origins-heading" className="text-base font-semibold text-foreground">
          Allowed domains
        </h2>
        <p className="text-sm text-foreground-secondary">
          Optionally restrict browser submissions to specific websites. This controls browser CORS
          and rejects requests that declare a different{" "}
          <code className="font-mono text-xs">Origin</code>. It is not an authentication mechanism:
          non-browser clients can omit or forge headers, so rate limits, quotas and validation still
          apply to every request.
        </p>
        <div className="rounded-lg border border-border bg-surface p-5">
          <AllowedOriginsForm formId={form.id} allowedOrigins={form.allowedOrigins} />
        </div>
        {form.allowedOrigins.length > 0 ? (
          <p className="text-xs text-foreground-muted">
            Currently allowed: {form.allowedOrigins.join(", ")}
          </p>
        ) : (
          <p className="text-xs text-foreground-muted">
            No restriction configured: browser submissions from any origin are accepted.
          </p>
        )}
      </section>

      <section aria-labelledby="test-heading" className="flex flex-col gap-4">
        <h2 id="test-heading" className="text-base font-semibold text-foreground">
          Send a test submission
        </h2>
        <p className="text-sm text-foreground-secondary">
          Creates a real lead in this form so you can verify the dashboard end to end. Test
          submissions count toward your monthly usage.
        </p>
        <div className="rounded-lg border border-border bg-surface p-5">
          <TestSubmission formId={form.id} />
        </div>
      </section>

      <section aria-labelledby="security-heading" className="flex flex-col gap-3">
        <h2 id="security-heading" className="text-base font-semibold text-foreground">
          Abuse protection
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground-secondary">
          <li>
            Distributed rate limits: 120 requests/minute per form, 60/minute per IP globally and
            30/minute per form and IP. Rate-limited requests return <code>429</code> with{" "}
            <code>Retry-After</code>.
          </li>
          <li>
            Body size, field count, field-name length, value length and nesting depth are enforced
            before anything is stored.
          </li>
          <li>
            Monthly plan limits are enforced atomically in the database, so concurrent requests
            cannot bypass them.
          </li>
          <li>
            Hidden <code className="font-mono text-xs">_gotcha</code> honeypots are accepted
            silently and discarded.
          </li>
          <li>
            Paused forms reject new submissions while keeping every stored lead. Pause a form
            immediately if it is being abused.
          </li>
          <li>
            Use the optional <code className="font-mono text-xs">Idempotency-Key</code> header when
            retrying; duplicate retries never create a second lead.
          </li>
        </ul>
      </section>
    </div>
  );
}
