import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/ui/code-block";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Formivo API documentation: create a form, send a submission with your form secret, handle errors and invite clients.",
};

const curlExample = `curl -X POST "https://YOUR_APP_URL/api/f/FORM_ID/submissions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer fm_live_xxx" \\
  -H "Idempotency-Key: order-1042" \\
  -d '{
    "data": {
      "name": "Ada Lovelace",
      "email": "ada@example.com",
      "message": "Please call me back."
    },
    "metadata": { "page": "/contact" }
  }'`;

const nodeExample = `// app/api/contact/route.ts — the secret stays on your server
export async function POST(request: Request) {
  const form = await request.formData();

  const response = await fetch(
    \`\${process.env.FORMIVO_BASE_URL}/api/f/\${process.env.FORMIVO_FORM_ID}/submissions\`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${process.env.FORMIVO_FORM_SECRET}\`,
      },
      body: JSON.stringify({
        data: {
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
        },
        metadata: { page: "/contact" },
      }),
    },
  );

  if (!response.ok) {
    return Response.json({ error: "Could not save your message." }, { status: 502 });
  }
  return Response.json({ ok: true });
}`;

const successExample = `{
  "success": true,
  "leadId": "6d0d6d6e-8c37-4f1d-9a54-0f8f0b6f1f3a",
  "message": "Submission received."
}`;

const errorExample = `{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "fields": { "data": "At least one field is required." }
  }
}`;

const errorCodes = [
  ["INVALID_FORM_SECRET", "401", "Missing or wrong Authorization header."],
  ["FORM_NOT_FOUND", "404", "The form id does not exist."],
  ["FORM_INACTIVE", "409", "The form is paused and rejects submissions."],
  ["VALIDATION_ERROR", "422", "The data or metadata object is invalid."],
  ["PAYLOAD_TOO_LARGE", "413", "The JSON body is over 256 KB."],
  ["UNSUPPORTED_MEDIA_TYPE", "415", "Content-Type must be application/json."],
  ["RATE_LIMITED", "429", "Too many requests from this form or IP."],
  ["QUOTA_EXCEEDED", "402", "The workspace monthly limit is reached."],
  ["IDEMPOTENCY_CONFLICT", "409", "The key was reused with a different body."],
  ["INTERNAL_ERROR", "500", "Something failed on our side; safe to retry."],
];

export default function Page() {
  return (
    <Container className="flex flex-col gap-12 py-12">
      <PageHeader
        title="Documentation"
        description="Formivo is a form backend. You keep your form; Formivo stores submissions, enforces limits and shares results with clients."
      />

      <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Documentation sections" className="lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-xs font-semibold tracking-wide text-foreground-muted uppercase">
            On this page
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li><a className="text-foreground-secondary hover:text-foreground" href="#quickstart">Quickstart</a></li>
            <li><a className="text-foreground-secondary hover:text-foreground" href="#endpoint">Endpoint</a></li>
            <li><a className="text-foreground-secondary hover:text-foreground" href="#payload">Payload</a></li>
            <li><a className="text-foreground-secondary hover:text-foreground" href="#responses">Responses</a></li>
            <li><a className="text-foreground-secondary hover:text-foreground" href="#errors">Error codes</a></li>
            <li><a className="text-foreground-secondary hover:text-foreground" href="#reliability">Retries &amp; limits</a></li>
            <li><a className="text-foreground-secondary hover:text-foreground" href="#clients">Client access</a></li>
          </ul>
        </nav>

        <div className="flex min-w-0 flex-col gap-12">
          <section id="quickstart" className="flex flex-col gap-4 scroll-mt-6">
            <h2 className="text-xl font-semibold tracking-tight">Quickstart</h2>
            <ol className="flex flex-col gap-2 text-sm text-foreground-secondary">
              <li>
                1.{" "}
                <Link href="/signup" className="text-accent hover:underline">
                  Create a workspace
                </Link>{" "}
                and a form. The secret is shown once — store it server-side.
              </li>
              <li>2. Copy the endpoint from the form&apos;s Integration tab.</li>
              <li>3. Forward submissions to the endpoint with a Bearer header.</li>
              <li>4. Open Leads in the dashboard. Send a test submission first if you like.</li>
            </ol>
            <CodeBlock title="cURL" code={curlExample} />
            <CodeBlock title="Node.js — proxy endpoint" language="javascript" code={nodeExample} />
          </section>

          <section id="endpoint" className="flex flex-col gap-4 scroll-mt-6">
            <h2 className="text-xl font-semibold tracking-tight">Endpoint</h2>
            <CodeBlock title="POST" code={`POST /api/f/{formId}/submissions`} />
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-secondary">
              <li>
                <code className="font-mono text-xs">Content-Type: application/json</code> is required.
              </li>
              <li>
                <code className="font-mono text-xs">Authorization: Bearer &lt;form secret&gt;</code> is
                required and must belong to that form.
              </li>
              <li>
                <code className="font-mono text-xs">Idempotency-Key</code> is optional, up to 255
                characters, and scoped to the form.
              </li>
              <li>Maximum body size is 256 KB; data is limited to 100 fields and 5 levels of nesting.</li>
            </ul>
          </section>

          <section id="payload" className="flex flex-col gap-4 scroll-mt-6">
            <h2 className="text-xl font-semibold tracking-tight">Payload</h2>
            <p className="text-sm text-foreground-secondary">
              <code className="font-mono text-xs">data</code> is required and must be a JSON object
              with at least one field. <code className="font-mono text-xs">metadata</code> is optional
              and holds context such as the page, referrer or campaign.
            </p>
            <CodeBlock
              title="Minimal request"
              language="json"
              code={`{ "data": { "email": "ada@example.com" } }`}
            />
          </section>

          <section id="responses" className="flex flex-col gap-4 scroll-mt-6">
            <h2 className="text-xl font-semibold tracking-tight">Responses</h2>
            <p className="text-sm text-foreground-secondary">
              A new submission returns <code className="font-mono text-xs">201</code>. A replayed
              idempotent request returns <code className="font-mono text-xs">200</code> with the
              original lead id.
            </p>
            <CodeBlock title="201 Created" language="json" code={successExample} />
            <CodeBlock title="Error shape" language="json" code={errorExample} />
          </section>

          <section id="errors" className="flex flex-col gap-4 scroll-mt-6">
            <h2 className="text-xl font-semibold tracking-tight">Error codes</h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-surface-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 text-xs font-medium text-foreground-muted uppercase">Code</th>
                    <th scope="col" className="px-4 py-2.5 text-xs font-medium text-foreground-muted uppercase">HTTP</th>
                    <th scope="col" className="px-4 py-2.5 text-xs font-medium text-foreground-muted uppercase">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {errorCodes.map(([code, status, meaning]) => (
                    <tr key={code}>
                      <td className="px-4 py-2.5 font-mono text-xs text-foreground">{code}</td>
                      <td className="px-4 py-2.5 text-foreground-secondary">{status}</td>
                      <td className="px-4 py-2.5 text-foreground-secondary">{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="reliability" className="flex flex-col gap-4 scroll-mt-6">
            <h2 className="text-xl font-semibold tracking-tight">Retries &amp; limits</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-foreground-secondary">
              <li>
                Retry timeouts with the same <code className="font-mono text-xs">Idempotency-Key</code>{" "}
                and body. You get the original lead back instead of a duplicate.
              </li>
              <li>
                Reusing a key with a different body returns{" "}
                <code className="font-mono text-xs">IDEMPOTENCY_CONFLICT</code>.
              </li>
              <li>
                The endpoint is rate limited per form (120 requests/minute) and per IP (30
                requests/minute). Handle <code className="font-mono text-xs">429</code> with a short
                delay.
              </li>
              <li>
                Usage resets at the start of each calendar month (UTC). The current count is on the
                dashboard.
              </li>
            </ul>
          </section>

          <section id="clients" className="flex flex-col gap-4 scroll-mt-6">
            <h2 className="text-xl font-semibold tracking-tight">Client access</h2>
            <p className="text-sm text-foreground-secondary">
              Invite a client from a form&apos;s Clients tab. They receive a single-use link, create
              or sign in to an account with that email, and get read-only access to that form. You can
              revoke access instantly; the next request is denied server-side.
            </p>
            <p className="text-sm text-foreground-secondary">
              Clients can never see secrets, billing, other forms or other workspaces, and cannot
              change lead statuses.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
