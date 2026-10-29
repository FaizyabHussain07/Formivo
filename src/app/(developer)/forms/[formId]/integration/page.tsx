import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RotateSecret } from "@/components/forms/rotate-secret";
import { TestSubmission } from "@/components/forms/test-submission";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
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

  const curl = `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_FORM_SECRET" \\
  -H "Idempotency-Key: optional-unique-key" \\
  -d '{
    "data": {
      "name": "Ada Lovelace",
      "email": "ada@example.com",
      "message": "I would like to know more."
    },
    "metadata": { "page": "/contact", "source": "website" }
  }'`;

  const serverSample = `// Server-side (recommended): the secret never reaches the browser.
const response = await fetch("${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${process.env.FORMIVO_FORM_SECRET}\`,
  },
  body: JSON.stringify({
    data: { name, email, message },
    metadata: { page: "/contact" },
  }),
});

if (!response.ok) {
  const error = await response.json();
  console.error(error.error.code, error.error.message);
}`;

  const responseSample = `{
  "success": true,
  "leadId": "9d1f2c4a-…",
  "message": "Submission received."
}`;

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="credentials-heading" className="flex flex-col gap-4">
        <h2 id="credentials-heading" className="text-base font-semibold text-foreground">
          Credentials
        </h2>
        <dl className="grid gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
              Endpoint
            </dt>
            <dd className="flex items-center gap-2">
              <code className="overflow-x-auto font-mono text-xs text-foreground">{endpoint}</code>
              <CopyButton value={endpoint} label="Copy" />
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
              Method & auth
            </dt>
            <dd className="flex flex-wrap items-center gap-2 text-sm text-foreground-secondary">
              <Badge tone="accent">POST</Badge>
              <code className="font-mono text-xs">Authorization: Bearer &lt;secret&gt;</code>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
              Secret
            </dt>
            <dd className="text-sm text-foreground-secondary">
              {form.hasSecret ? (
                <span className="inline-flex items-center gap-2">
                  <code className="font-mono">••••••••{form.secretLastFour}</code>
                  <Badge tone="success">Active</Badge>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Not generated <Badge tone="warning">Inactive</Badge>
                </span>
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
              Payload limit
            </dt>
            <dd className="text-sm text-foreground-secondary">
              256 KB · JSON object · up to 100 fields
            </dd>
          </div>
        </dl>
      </section>

      <Alert tone="warning" title="Keep the secret on your server">
        Put the secret in a server-side environment variable. Exposing it in public JavaScript lets
        anyone submit data as your form. Server-side forwarding is always the safer integration.
      </Alert>

      <section aria-labelledby="examples-heading" className="flex flex-col gap-4">
        <h2 id="examples-heading" className="text-base font-semibold text-foreground">
          Request examples
        </h2>
        <CodeBlock title="cURL" code={curl} />
        <CodeBlock title="Node.js — server side" language="javascript" code={serverSample} />
        <CodeBlock title="Success response (201 Created)" language="json" code={responseSample} />
        <p className="text-sm text-foreground-secondary">
          Errors always return a stable shape:{" "}
          <code className="font-mono text-xs">
            {'{ "success": false, "error": { "code": "INVALID_FORM_SECRET", "message": "…" } }'}
          </code>
          . Supported codes include{" "}
          <code className="font-mono text-xs">FORM_NOT_FOUND</code>,{" "}
          <code className="font-mono text-xs">FORM_INACTIVE</code>,{" "}
          <code className="font-mono text-xs">VALIDATION_ERROR</code>,{" "}
          <code className="font-mono text-xs">RATE_LIMITED</code>,{" "}
          <code className="font-mono text-xs">QUOTA_EXCEEDED</code> and{" "}
          <code className="font-mono text-xs">IDEMPOTENCY_CONFLICT</code>.
        </p>
      </section>

      <section aria-labelledby="secret-heading" className="flex flex-col gap-4">
        <h2 id="secret-heading" className="text-base font-semibold text-foreground">
          Secret management
        </h2>
        <div className="rounded-lg border border-border bg-surface p-5">
          <RotateSecret formId={form.id} />
        </div>
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
          Security guidance
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground-secondary">
          <li>Never commit the secret to a repository or paste it into client-side bundles.</li>
          <li>
            Rotate the secret immediately if it leaks. Rotation invalidates the previous value
            instantly.
          </li>
          <li>
            Send an <code className="font-mono text-xs">Idempotency-Key</code> header when retrying so
            a network timeout can never create duplicate leads.
          </li>
          <li>
            The endpoint is rate limited per form and per IP. Handle <code>429</code> with a retry
            after a short delay.
          </li>
          <li>
            Browser-side submissions would expose the secret. If you must submit from the browser,
            proxy the request through your own server.
          </li>
        </ul>
      </section>
    </div>
  );
}
