import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AllowedOriginsForm } from "@/components/forms/allowed-origins-form";
import { TestSubmission } from "@/components/forms/test-submission";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
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

  const htmlSnippet = `<form action="${endpoint}" method="POST">
  <label>
    Name
    <input type="text" name="name" required />
  </label>
  <label>
    Email
    <input type="email" name="email" required />
  </label>
  <label>
    Message
    <textarea name="message"></textarea>
  </label>

  <!-- Optional: send visitors to your own thank-you page -->
  <input type="hidden" name="_redirect" value="https://your-site.com/thanks" />

  <button type="submit">Send</button>
</form>`;

  const fetchSnippet = `// Inline success and error messages, no page navigation, no API key.
const response = await fetch("${endpoint}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name,
    email,
    message,
    metadata: { page: window.location.pathname },
  }),
});

if (response.ok) {
  showSuccess();
} else {
  const { error } = await response.json();
  showError(error.message);
}`;

  const curlSnippet = `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-1042" \\
  -d '{
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "message": "Please call me back.",
    "metadata": { "page": "/contact" }
  }'`;

  const responseSnippet = `{
  "success": true,
  "leadId": "9d1f2c4a-…",
  "message": "Submission received."
}`;

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="credentials-heading" className="flex flex-col gap-4">
        <h2 id="credentials-heading" className="text-base font-semibold text-foreground">
          Public endpoint
        </h2>
        <dl className="grid gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
              Endpoint
            </dt>
            <dd className="flex flex-wrap items-center gap-2">
              <code className="min-w-0 overflow-x-auto font-mono text-xs text-foreground">
                POST {endpoint}
              </code>
              <CopyButton value={endpoint} label="Copy endpoint" />
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
              Authentication
            </dt>
            <dd className="text-sm text-foreground-secondary">
              <Badge tone="success">None required</Badge>
              <span className="mt-1 block text-xs text-foreground-muted">
                No secret, API key or token. The form id is public.
              </span>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
              Form ID
            </dt>
            <dd className="font-mono text-xs break-all text-foreground-secondary">{form.id}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
              Accepted bodies
            </dt>
            <dd className="text-sm text-foreground-secondary">
              JSON · form-encoded · multipart (no files)
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
              Limits
            </dt>
            <dd className="text-sm text-foreground-secondary">256 KB · 100 fields · 5 levels</dd>
          </div>
        </dl>
      </section>

      <Alert tone="info" title="The endpoint is public — your data is not">
        Anyone who knows the form ID can send a submission, exactly like a normal website form. The
        endpoint never reads or returns stored submissions. Only you (and a client you explicitly
        invite) can view, update or export them from the dashboard.
      </Alert>

      <section aria-labelledby="html-heading" className="flex flex-col gap-4">
        <h2 id="html-heading" className="text-base font-semibold text-foreground">
          HTML form
        </h2>
        <p className="text-sm text-foreground-secondary">
          Paste your endpoint into an ordinary form. Formivo accepts form-encoded submissions and
          shows a simple thank-you page (or redirects to your{" "}
          <code className="font-mono text-xs">_redirect</code> URL).
        </p>
        <CodeBlock title="HTML" language="html" code={htmlSnippet} />
      </section>

      <section aria-labelledby="js-heading" className="flex flex-col gap-4">
        <h2 id="js-heading" className="text-base font-semibold text-foreground">
          JavaScript / fetch
        </h2>
        <p className="text-sm text-foreground-secondary">
          Submit without leaving your page and render your own success or error state. CORS is
          enabled for the origins allowed below.
        </p>
        <CodeBlock title="Browser JavaScript" language="javascript" code={fetchSnippet} />
        <CodeBlock title="cURL (any language)" code={curlSnippet} />
        <CodeBlock title="Success response (201 Created)" language="json" code={responseSnippet} />
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
