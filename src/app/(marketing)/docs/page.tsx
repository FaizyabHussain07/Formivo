import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/ui/code-block";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Formivo API documentation: connect any HTML form or JavaScript fetch call to a public endpoint — no secret or API key required.",
};

const htmlExample = `<form action="https://YOUR_APP_URL/api/f/YOUR_FORM_ID" method="POST">
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
  <button type="submit">Send</button>
</form>`;

const fetchExample = `const response = await fetch(
  "https://YOUR_APP_URL/api/f/YOUR_FORM_ID",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      message,
      metadata: { page: "/contact" },
    }),
  },
);

if (!response.ok) {
  const { error } = await response.json();
  console.error(error.code, error.message);
}`;

const curlExample = `curl -X POST "https://YOUR_APP_URL/api/f/YOUR_FORM_ID" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-1042" \\
  -d '{
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "message": "Please call me back."
  }'`;

const phpExample = `<?php
$ch = curl_init("https://YOUR_APP_URL/api/f/YOUR_FORM_ID");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
  CURLOPT_POSTFIELDS => json_encode([
    "name" => $_POST["name"],
    "email" => $_POST["email"],
    "message" => $_POST["message"],
  ]),
  CURLOPT_RETURNTRANSFER => true,
]);
$result = curl_exec($ch);
http_response_code(curl_getinfo($ch, CURLINFO_RESPONSE_CODE));
?>`;

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
  ["FORM_NOT_FOUND", "404", "The form id does not exist."],
  ["FORM_INACTIVE", "409", "The form is paused and rejects submissions."],
  ["FORBIDDEN", "403", "The request Origin is not in the form's allowed list."],
  ["VALIDATION_ERROR", "422", "The payload is empty or invalid."],
  ["PAYLOAD_TOO_LARGE", "413", "The request body is over 256 KB."],
  ["UNSUPPORTED_MEDIA_TYPE", "415", "Use JSON, form-encoded or multipart (no files)."],
  ["RATE_LIMITED", "429", "Too many requests; retry after the Retry-After header."],
  ["QUOTA_EXCEEDED", "402", "The workspace monthly limit is reached."],
  ["IDEMPOTENCY_CONFLICT", "409", "The key was reused with a different body."],
  ["INTERNAL_ERROR", "500", "Something failed on our side; safe to retry."],
];

export default function Page() {
  return (
    <Container className="flex flex-col gap-12 py-12">
      <PageHeader
        title="Documentation"
        description="Formivo is a form backend. You keep your form; Formivo stores submissions, enforces limits and shares results with clients. The public endpoint needs no secret or API key."
      />

      <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Documentation sections" className="lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-xs font-semibold tracking-wide text-foreground-muted uppercase">
            On this page
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <a className="text-foreground-secondary hover:text-foreground" href="#quickstart">
                Quickstart
              </a>
            </li>
            <li>
              <a className="text-foreground-secondary hover:text-foreground" href="#endpoint">
                Endpoint
              </a>
            </li>
            <li>
              <a className="text-foreground-secondary hover:text-foreground" href="#html">
                HTML form
              </a>
            </li>
            <li>
              <a className="text-foreground-secondary hover:text-foreground" href="#javascript">
                JavaScript &amp; fetch
              </a>
            </li>
            <li>
              <a className="text-foreground-secondary hover:text-foreground" href="#payload">
                Payload
              </a>
            </li>
            <li>
              <a className="text-foreground-secondary hover:text-foreground" href="#responses">
                Responses
              </a>
            </li>
            <li>
              <a className="text-foreground-secondary hover:text-foreground" href="#errors">
                Error codes
              </a>
            </li>
            <li>
              <a className="text-foreground-secondary hover:text-foreground" href="#origins">
                CORS &amp; allowed domains
              </a>
            </li>
            <li>
              <a className="text-foreground-secondary hover:text-foreground" href="#abuse">
                Rate limits &amp; abuse
              </a>
            </li>
            <li>
              <a className="text-foreground-secondary hover:text-foreground" href="#data">
                Data privacy
              </a>
            </li>
            <li>
              <a className="text-foreground-secondary hover:text-foreground" href="#clients">
                Client access
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex min-w-0 flex-col gap-12">
          <section id="quickstart" className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Quickstart</h2>
            <ol className="flex flex-col gap-2 text-sm text-foreground-secondary">
              <li>
                1.{" "}
                <Link href="/signup" className="text-accent hover:underline">
                  Create a workspace
                </Link>{" "}
                and a form.
              </li>
              <li>2. Copy the public endpoint from the form&apos;s Integration tab.</li>
              <li>3. Paste it into an HTML form action, or POST to it from your code.</li>
              <li>4. Open Leads in the dashboard. No key setup, no secret to store.</li>
            </ol>
            <CodeBlock title="HTML" language="html" code={htmlExample} />
          </section>

          <section id="endpoint" className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Endpoint</h2>
            <CodeBlock title="POST" code={`POST https://YOUR_APP_URL/api/f/{formId}`} />
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-secondary">
              <li>
                <strong>No authentication header.</strong> The form id is public and is not a
                password. Do not treat it as one.
              </li>
              <li>
                Accepted content types: <code className="font-mono text-xs">application/json</code>,{" "}
                <code className="font-mono text-xs">application/x-www-form-urlencoded</code> and{" "}
                <code className="font-mono text-xs">multipart/form-data</code> (no file uploads).
              </li>
              <li>
                Optional <code className="font-mono text-xs">Idempotency-Key</code> header (max 255
                characters) or a hidden <code className="font-mono text-xs">_idempotency_key</code>{" "}
                field.
              </li>
              <li>Maximum body size 256 KB; up to 100 fields and 5 levels of nesting.</li>
            </ul>
          </section>

          <section id="html" className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">HTML form</h2>
            <p className="text-sm text-foreground-secondary">
              A normal form POST works without JavaScript. Formivo stores the fields and renders a
              simple thank-you page. Add a hidden{" "}
              <code className="font-mono text-xs">_redirect</code> field to send visitors to your
              own page instead:
            </p>
            <CodeBlock
              title="Thank-you redirect"
              language="html"
              code={`<input type="hidden" name="_redirect" value="https://your-site.com/thanks" />`}
            />
            <p className="text-sm text-foreground-secondary">
              A hidden <code className="font-mono text-xs">_gotcha</code> field can be used as a
              honeypot: when it is filled, Formivo shows a success page but stores nothing.
            </p>
          </section>

          <section id="javascript" className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">JavaScript &amp; fetch</h2>
            <p className="text-sm text-foreground-secondary">
              Submit without navigating away and render your own inline success or error message.
              CORS is handled by Formivo for allowed origins.
            </p>
            <CodeBlock title="Browser JavaScript" language="javascript" code={fetchExample} />
            <CodeBlock title="cURL" code={curlExample} />
            <CodeBlock title="PHP" language="php" code={phpExample} />
          </section>

          <section id="payload" className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Payload</h2>
            <p className="text-sm text-foreground-secondary">
              Send flat fields (like an HTML form) or wrap them in{" "}
              <code className="font-mono text-xs">data</code>. Both are accepted.{" "}
              <code className="font-mono text-xs">metadata</code> is optional context such as the
              page or campaign. Reserved helper fields start with{" "}
              <code className="font-mono text-xs">_</code> and are never stored as submission data.
            </p>
            <CodeBlock
              title="Explicit shape"
              language="json"
              code={`{
  "data": { "name": "Ada", "email": "ada@example.com" },
  "metadata": { "page": "/contact" }
}`}
            />
            <CodeBlock
              title="Flat shape"
              language="json"
              code={`{ "name": "Ada", "email": "ada@example.com" }`}
            />
          </section>

          <section id="responses" className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Responses</h2>
            <p className="text-sm text-foreground-secondary">
              JSON requests get JSON. A new submission returns{" "}
              <code className="font-mono text-xs">201</code>; a replayed idempotent request returns{" "}
              <code className="font-mono text-xs">200</code> with the original lead id. HTML form
              requests get an HTML page (200) or a 303 redirect when{" "}
              <code className="font-mono text-xs">_redirect</code> is set.
            </p>
            <CodeBlock title="201 Created" language="json" code={successExample} />
            <CodeBlock title="Error shape" language="json" code={errorExample} />
          </section>

          <section id="errors" className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Error codes</h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-surface-muted">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-medium text-foreground-muted uppercase"
                    >
                      Code
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-medium text-foreground-muted uppercase"
                    >
                      HTTP
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-medium text-foreground-muted uppercase"
                    >
                      Meaning
                    </th>
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
            <p className="text-sm text-foreground-secondary">
              Errors never include stack traces, SQL details, environment values or other stored
              submissions.
            </p>
          </section>

          <section id="origins" className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">CORS &amp; allowed domains</h2>
            <p className="text-sm text-foreground-secondary">
              By default the endpoint accepts browser submissions from any origin, because that is
              how ordinary HTML forms behave. Optionally add allowed origins on the form&apos;s
              Integration tab:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-secondary">
              <li>
                When a list is configured, CORS preflight only allows those origins and requests
                that declare a different <code className="font-mono text-xs">Origin</code> are
                rejected with <code className="font-mono text-xs">403 FORBIDDEN</code>.
              </li>
              <li>
                Origin and CORS are browser controls, not authentication: non-browser clients can
                omit or forge headers. Rate limits, quotas and validation protect the endpoint
                regardless.
              </li>
              <li>
                Leave the list empty if you submit from a server or from several unknown domains.
              </li>
            </ul>
          </section>

          <section id="abuse" className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Rate limits &amp; abuse</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-foreground-secondary">
              <li>120 requests/minute per form, 60/minute per IP and 30/minute per form+IP.</li>
              <li>Limits use a shared database counter, so they hold across server instances.</li>
              <li>
                Body size, field count and value lengths are capped. Oversized or malformed requests
                are rejected before storage.
              </li>
              <li>
                Monthly plan limits are enforced atomically; concurrent requests cannot exceed them.
              </li>
              <li>
                Retry timeouts with the same{" "}
                <code className="font-mono text-xs">Idempotency-Key</code> and body to avoid
                duplicate leads.
              </li>
              <li>Pause a form to stop submissions immediately while keeping stored data.</li>
            </ul>
          </section>

          <section id="data" className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Data privacy</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-foreground-secondary">
              <li>The public endpoint can create submissions; it can never read them.</li>
              <li>
                Dashboard reads and writes require an authenticated session, are scoped to the
                signed-in user&apos;s workspace, and are additionally enforced by Supabase Row Level
                Security.
              </li>
              <li>
                Knowing a form id grants no access to stored submissions, analytics, billing or
                workspace settings.
              </li>
              <li>
                Service-role credentials stay on the server and are never sent to the browser.
              </li>
            </ul>
          </section>

          <section id="clients" className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Client access</h2>
            <p className="text-sm text-foreground-secondary">
              Invite a client from a form&apos;s Clients tab. They receive a single-use invitation
              link, sign in with that email, and get read-only access to that form&apos;s
              submissions and analytics. Revoke access at any time; the next request is denied
              server-side.
            </p>
            <p className="text-sm text-foreground-secondary">
              Clients can never edit submissions, change form settings, pause a form, see billing or
              access other forms and workspaces.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
