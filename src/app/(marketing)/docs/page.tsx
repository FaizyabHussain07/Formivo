import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Formivo API reference: public form endpoints, request formats, responses, rate limits, CORS and the security model.",
};

const endpoint = `${siteConfig.productionUrl}/api/f/{formId}`;

const toc = [
  { href: "#quickstart", label: "Quickstart" },
  { href: "#endpoint", label: "Endpoint" },
  { href: "#requests", label: "Request formats" },
  { href: "#responses", label: "Responses" },
  { href: "#errors", label: "Errors" },
  { href: "#limits", label: "Rate limits & quotas" },
  { href: "#cors", label: "CORS & domains" },
  { href: "#security", label: "Security model" },
  { href: "#sdks", label: "Other languages" },
];

const htmlExample = `<form action="${endpoint}" method="POST">
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

const jsExample = `// No API key. The endpoint accepts public submissions by design.
async function submit(values) {
  const response = await fetch(
    "${siteConfig.productionUrl}/api/f/YOUR_FORM_ID",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Optional: makes retries safe if the network drops.
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(values),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message ?? "Submission failed");
  }

  return result; // { success: true, leadId, message }
}`;

const curlExample = `curl -X POST "${siteConfig.productionUrl}/api/f/YOUR_FORM_ID" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-1042" \\
  -d '{
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "message": "Please call me back.",
    "metadata": { "page": "/contact" }
  }'`;

const responseExample = `{
  "success": true,
  "leadId": "9d1f2c4a-7b3e-4f1a-9c2d-1a2b3c4d5e6f",
  "message": "Submission received."
}`;

const errorExample = `{
  "success": false,
  "error": {
    "code": "FORM_PAUSED",
    "message": "This form is not accepting submissions."
  }
}`;

const statusRows: [string, string, string][] = [
  ["200", "HTML submission accepted", "Returns the thank-you page, or redirects to _redirect."],
  ["201", "JSON submission accepted", "Returns the new leadId."],
  ["400", "Invalid payload", "Malformed JSON, unsupported field types, too many fields."],
  ["404", "Unknown form", "The form id does not exist or was deleted."],
  ["409", "Form paused / quota exceeded", "Resume the form or upgrade the plan."],
  ["413", "Body too large", "Requests are capped at 256 KB."],
  ["415", "Unsupported content type", "Use JSON, form-encoded or multipart."],
  ["429", "Rate limited", "Includes a Retry-After header."],
  ["405", "Read attempted", "The public endpoint only accepts POST."],
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="flex scroll-mt-24 flex-col gap-4 border-t border-border pt-10 first:border-t-0 first:pt-0"
    >
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function Page() {
  return (
    <Container className="grid gap-10 py-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14 lg:py-16">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
          Reference
        </p>
        <nav aria-label="Documentation sections">
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm lg:flex-col lg:gap-1">
            {toc.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-foreground-secondary transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 hidden flex-col gap-2 rounded-xl border border-border bg-surface p-4 lg:flex">
          <p className="text-sm font-medium text-foreground">Ready to try it?</p>
          <p className="text-xs text-foreground-secondary">
            Create a form and copy its endpoint in under a minute.
          </p>
          <ButtonLink href="/signup" size="sm" variant="secondary" className="mt-1">
            Get started
          </ButtonLink>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-10">
        <header className="flex flex-col gap-3">
          <Badge tone="accent" className="w-fit">
            API v1
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Documentation</h1>
          <p className="max-w-2xl text-base text-foreground-secondary">
            Formivo gives every form one public submission endpoint. It requires no secret, no SDK
            and no server of your own — just the form id.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground-secondary">
            {["JSON or form-encoded", "No authentication", "Works from any language"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="size-4 text-accent" aria-hidden="true" />
                  {item}
                </span>
              ),
            )}
          </div>
        </header>

        <Section id="quickstart" title="Quickstart">
          <ol className="flex flex-col gap-3 text-sm text-foreground-secondary">
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle font-mono text-xs font-semibold text-accent">
                1
              </span>
              Create a form in the dashboard and open its{" "}
              <strong className="text-foreground">Integration</strong> tab.
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle font-mono text-xs font-semibold text-accent">
                2
              </span>
              Copy the endpoint: <code className="font-mono text-xs">{endpoint}</code>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle font-mono text-xs font-semibold text-accent">
                3
              </span>
              Send a request, then read the submission in your dashboard.
            </li>
          </ol>
          <CodeBlock title="HTML" language="html" code={htmlExample} />
        </Section>

        <Section id="endpoint" title="Endpoint">
          <p className="text-sm text-foreground-secondary">
            Every form has one endpoint. The form id is a random identifier — it is not a password.
          </p>
          <CodeBlock
            title="HTTP"
            language="http"
            code={`POST ${endpoint}\nGET  ${endpoint}  →  405 Method Not Allowed`}
          />
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted/60 text-[11px] tracking-[0.08em] text-foreground-muted uppercase">
                <tr>
                  <th scope="col" className="px-4 py-2.5">
                    Part
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground-secondary">
                {[
                  ["Authentication", "None for submissions. Dashboard access is session-based."],
                  [
                    "Content types",
                    "application/json, application/x-www-form-urlencoded, multipart/form-data",
                  ],
                  ["Body limit", "256 KB, up to 100 fields and 5 levels of nesting"],
                  [
                    "Idempotency",
                    "Optional Idempotency-Key header; retries never create duplicates",
                  ],
                  ["Reserved fields", "_redirect, _gotcha, metadata"],
                ].map(([key, value]) => (
                  <tr key={key}>
                    <th
                      scope="row"
                      className="w-44 px-4 py-3 align-top font-medium text-foreground"
                    >
                      {key}
                    </th>
                    <td className="px-4 py-3">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="requests" title="Request formats">
          <p className="text-sm text-foreground-secondary">
            Send JSON from JavaScript or any HTTP client. Form-encoded and multipart bodies work for
            plain HTML forms.
          </p>
          <CodeBlock title="Browser JavaScript" language="javascript" code={jsExample} />
          <CodeBlock title="cURL" language="bash" code={curlExample} />
          <p className="text-sm text-foreground-secondary">
            Any extra string fields are stored as-is on the submission. Use{" "}
            <code className="font-mono text-xs">metadata</code> for context such as the page path or
            a campaign name. A filled <code className="font-mono text-xs">_gotcha</code> field is
            treated as a bot and silently discarded.
          </p>
        </Section>

        <Section id="responses" title="Responses">
          <p className="text-sm text-foreground-secondary">
            HTML submissions get a human-readable page. JSON submissions get a predictable body:
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            <CodeBlock title="201 Created" language="json" code={responseExample} />
            <CodeBlock title="Failure shape" language="json" code={errorExample} />
          </div>
        </Section>

        <Section id="errors" title="Status codes & errors">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted/60 text-[11px] tracking-[0.08em] text-foreground-muted uppercase">
                <tr>
                  <th scope="col" className="px-4 py-2.5">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Meaning
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground-secondary">
                {statusRows.map(([status, meaning, notes]) => (
                  <tr key={status}>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{status}</td>
                    <td className="px-4 py-3">{meaning}</td>
                    <td className="px-4 py-3 text-foreground-muted">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-foreground-secondary">
            Error bodies never include stack traces, SQL or configuration details. Retry 5xx
            responses with backoff; do not retry 4xx responses without changing the request.
          </p>
        </Section>

        <Section id="limits" title="Rate limits & quotas">
          <ul className="flex flex-col gap-2 text-sm text-foreground-secondary">
            {[
              "120 requests per minute per form.",
              "60 requests per minute per IP address, shared across forms.",
              "30 requests per minute per form and IP address.",
              "Monthly plan quota enforced atomically in the database.",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <Alert tone="info" title="Rate limited responses">
            A <code className="font-mono text-xs">429</code> includes{" "}
            <code className="font-mono text-xs">Retry-After</code> in seconds. Back off instead of
            retrying immediately.
          </Alert>
        </Section>

        <Section id="cors" title="CORS & allowed domains">
          <p className="text-sm text-foreground-secondary">
            Browser submissions are allowed from any origin by default. Each form can restrict
            browser access to specific domains in the Integration tab, which tightens CORS and
            rejects requests declaring a different <code className="font-mono text-xs">Origin</code>
            .
          </p>
          <Alert tone="warning" title="Not an authentication mechanism">
            Origin and Referer headers can be missing or forged outside a browser. Allowed domains
            are a browser-side convenience; validation, rate limits and quotas apply to every
            request regardless of headers.
          </Alert>
        </Section>

        <Section id="security" title="Security model">
          <div className="flex flex-col gap-3 text-sm text-foreground-secondary">
            <p>The endpoint is public on purpose. Formivo protects the data, not the URL:</p>
            <ul className="flex flex-col gap-2">
              {[
                "Reading, updating, exporting and deleting submissions require an authenticated workspace member.",
                "Clients see only the forms explicitly shared with them, read-only.",
                "Row Level Security is enabled on every table, and dashboard queries are also scoped server-side.",
                "Service-role credentials never leave the server.",
                "Workspace, owner, timestamps and plan are set by the server, never from the payload.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section id="sdks" title="Other languages">
          <p className="text-sm text-foreground-secondary">
            The contract is plain HTTP, so every language works the same way: POST the endpoint with
            JSON. There is no mandatory SDK and no secret to manage. Server-side examples for PHP,
            Python, Go and Node use the same three lines as the cURL example above.
          </p>
          <div className="flex flex-wrap gap-2">
            {["cURL", "JavaScript", "TypeScript", "Node.js", "Python", "PHP", "Go", "Ruby"].map(
              (lang) => (
                <Badge key={lang}>{lang}</Badge>
              ),
            )}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/signup" size="sm">
              Create a form
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/pricing" size="sm" variant="secondary">
              See pricing
            </ButtonLink>
          </div>
        </Section>
      </div>
    </Container>
  );
}
