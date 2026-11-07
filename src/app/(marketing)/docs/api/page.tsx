import { Alert } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { DocPageLayout, DocProse, DocSection, DocSubHeading } from "@/components/docs/doc-page";
import { siteConfig } from "@/config/site";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "API reference",
  description:
    "The Formivo submission endpoint: request headers, accepted bodies, reserved fields, response bodies, status codes, rate limits and CORS behaviour.",
  path: "/docs/api",
});

const endpoint = `${siteConfig.productionUrl}/api/f/{formId}`;

const tableClass = "overflow-hidden rounded-xl border border-border";
const cellClass = "px-4 py-3";
const headClass =
  "bg-surface-muted/60 text-[11px] tracking-[0.08em] text-foreground-muted uppercase";

const requestExample = `POST ${siteConfig.productionUrl}/api/f/YOUR_FORM_ID HTTP/1.1
Content-Type: application/json
Idempotency-Key: contact-7f2a

{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "message": "Please call me back.",
  "metadata": { "page": "/contact", "campaign": "spring" }
}`;

const successExample = `{
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
  ["405", "Read attempted", "The public endpoint only accepts POST."],
  ["409", "Form paused or quota exceeded", "Resume the form or upgrade the plan."],
  ["413", "Body too large", "Requests are capped at 256 KB."],
  ["415", "Unsupported content type", "Use JSON, form-encoded or multipart."],
  ["429", "Rate limited", "Includes a Retry-After header in seconds."],
  ["500", "Server error", "Retry with backoff; the submission was not stored."],
];

const fieldRows: [string, string, string][] = [
  ["metadata", "object", "Context stored with the submission, such as the page path or campaign."],
  ["_redirect", "string (URL)", "Where to send the browser after a successful HTML submission."],
  ["_gotcha", "string", "Honeypot. Leave empty; a filled value marks the request as a bot."],
  ["any other key", "string / number / boolean", "Stored as-is and shown in the dashboard."],
];

export default function Page() {
  return (
    <DocPageLayout
      href="/docs/api"
      title="API reference"
      badge="API v1"
      description="One endpoint per form, one predictable contract. Everything on this page applies to every plan."
    >
      <DocSection id="endpoint" title="Endpoint">
        <CodeBlock
          title="HTTP"
          language="http"
          code={`POST ${endpoint}\nGET  ${endpoint}  ->  405 Method Not Allowed`}
        />
        <div className={tableClass}>
          <table className="w-full text-left text-sm">
            <thead className={headClass}>
              <tr>
                <th scope="col" className={cellClass}>
                  Property
                </th>
                <th scope="col" className={cellClass}>
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground-secondary">
              {[
                ["Authentication", "None for submissions. Reading data is session-based."],
                ["Methods", "POST only."],
                [
                  "Content types",
                  "application/json, application/x-www-form-urlencoded, multipart/form-data",
                ],
                ["Body limit", "256 KB, up to 100 fields, 5 levels of nesting"],
                ["Idempotency", "Optional Idempotency-Key header; retries never create duplicates"],
                ["CORS", "Any origin by default; restrictable per form"],
              ].map(([key, value]) => (
                <tr key={key}>
                  <th
                    scope="row"
                    className={`${cellClass} w-48 align-top font-medium text-foreground`}
                  >
                    {key}
                  </th>
                  <td className={cellClass}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="request" title="Request">
        <DocProse>
          <p>
            Send the values you want stored. Every key becomes a column in the submission, and the
            server adds ownership, timestamps and plan context itself.
          </p>
        </DocProse>
        <CodeBlock title="JSON" language="http" code={requestExample} />
        <DocSubHeading>Reserved fields</DocSubHeading>
        <div className={tableClass}>
          <table className="w-full text-left text-sm">
            <thead className={headClass}>
              <tr>
                <th scope="col" className={cellClass}>
                  Field
                </th>
                <th scope="col" className={cellClass}>
                  Type
                </th>
                <th scope="col" className={cellClass}>
                  Behaviour
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground-secondary">
              {fieldRows.map(([field, type, behaviour]) => (
                <tr key={field}>
                  <td className={`${cellClass} font-mono text-xs text-foreground`}>{field}</td>
                  <td className={`${cellClass} text-foreground-muted`}>{type}</td>
                  <td className={cellClass}>{behaviour}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="idempotency" title="Idempotency">
        <DocProse>
          <p>
            Networks drop. If you send an <code className="font-mono text-xs">Idempotency-Key</code>{" "}
            header, a retry with the same key returns the original result instead of creating a
            second submission. Use a value that is stable for one logical submission, such as an
            order id or a generated UUID stored with the form state.
          </p>
        </DocProse>
        <Alert tone="info" title="Keys are scoped per form">
          The same key used against a different form is a different submission. Keys expire with the
          submission, so a key from last month is not reused.
        </Alert>
      </DocSection>

      <DocSection id="responses" title="Responses">
        <DocProse>
          <p>
            HTML submissions receive a rendered thank-you page. JSON submissions receive a body with
            a stable shape:
          </p>
        </DocProse>
        <div className="grid gap-3 lg:grid-cols-2">
          <CodeBlock title="201 Created" language="json" code={successExample} />
          <CodeBlock title="4xx failure" language="json" code={errorExample} />
        </div>
        <DocProse>
          <p>
            Error bodies never include stack traces, SQL or configuration details. Treat{" "}
            <code className="font-mono text-xs">error.code</code> as the machine-readable branch and{" "}
            <code className="font-mono text-xs">error.message</code> as something safe to show a
            person.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="status-codes" title="Status codes">
        <div className={tableClass}>
          <table className="w-full text-left text-sm">
            <thead className={headClass}>
              <tr>
                <th scope="col" className={cellClass}>
                  Status
                </th>
                <th scope="col" className={cellClass}>
                  Meaning
                </th>
                <th scope="col" className={cellClass}>
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground-secondary">
              {statusRows.map(([status, meaning, notes]) => (
                <tr key={status}>
                  <td className={`${cellClass} font-mono text-xs text-foreground`}>{status}</td>
                  <td className={cellClass}>{meaning}</td>
                  <td className={`${cellClass} text-foreground-muted`}>{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DocProse>
          <p>
            Retry <code className="font-mono text-xs">5xx</code> responses with backoff. Do not
            retry a <code className="font-mono text-xs">4xx</code> without changing the request: the
            same payload will fail the same way.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="limits" title="Rate limits and quotas">
        <ul className="flex flex-col gap-2 text-sm text-foreground-secondary">
          {[
            "120 requests per minute per form.",
            "60 requests per minute per IP address, shared across forms.",
            "30 requests per minute per form and IP address.",
            "The monthly plan quota is enforced atomically in the database.",
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
              />
              {item}
            </li>
          ))}
        </ul>
        <Alert tone="warning" title="429 responses">
          A rate-limited response includes <code className="font-mono text-xs">Retry-After</code> in
          seconds. Back off for at least that long instead of retrying immediately.
        </Alert>
      </DocSection>

      <DocSection id="cors" title="CORS and allowed domains">
        <DocProse>
          <p>
            Browser submissions are accepted from any origin by default. A form can restrict browser
            access to specific domains, which tightens CORS and rejects requests that declare a
            different <code className="font-mono text-xs">Origin</code>.
          </p>
        </DocProse>
        <Alert tone="warning" title="Not an authentication mechanism">
          Origin and Referer headers can be missing or forged outside a browser. Allowed domains are
          a browser-side convenience; validation, rate limits and quotas apply to every request
          regardless of headers.
        </Alert>
      </DocSection>
    </DocPageLayout>
  );
}
