import { CodeBlock } from "@/components/ui/code-block";
import { DocPageLayout, DocProse, DocSection, DocSubHeading } from "@/components/docs/doc-page";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "Troubleshooting",
  description:
    "Fix the common failures: a 405 on submit, CORS errors, 404 form not found, 409 paused or over quota, 413 body too large, and submissions that land in the wrong place.",
  path: "/docs/troubleshooting",
});

const corsError = `Access to fetch at 'https://formivo.faizyab.me/api/f/...'
from origin 'https://your-site.com' has been blocked by CORS policy`;

const statusRows: [string, string, string][] = [
  [
    "405 Method Not Allowed",
    "The form was submitted with GET.",
    'A form with no method attribute defaults to GET. Set method="POST".',
  ],
  [
    "404 Not Found",
    "The form id does not exist.",
    "Copy the endpoint from the Integration tab again; a truncated id is the usual cause.",
  ],
  [
    "409 Conflict",
    "The form is paused, or the plan quota is used.",
    "Resume the form, or check the usage bar on Billing.",
  ],
  [
    "413 Payload Too Large",
    "The body exceeds 256 KB.",
    "Send a URL to a file instead of the file itself.",
  ],
  [
    "415 Unsupported Media Type",
    "The Content-Type is missing or wrong.",
    "Send application/json, form-encoded or multipart.",
  ],
  [
    "429 Too Many Requests",
    "A rate limit was hit.",
    "Wait for Retry-After seconds, then retry with the same Idempotency-Key.",
  ],
];

export default function Page() {
  return (
    <DocPageLayout
      href="/docs/troubleshooting"
      title="Troubleshooting"
      badge="Support"
      description="Start from the response status. Most integration problems are one of the six below, and each has a single fix."
    >
      <DocSection id="status" title="By status code">
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-[11px] tracking-[0.08em] text-foreground-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-2.5">
                  Response
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Cause
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Fix
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground-secondary">
              {statusRows.map(([status, cause, fix]) => (
                <tr key={status}>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{status}</td>
                  <td className="px-4 py-3">{cause}</td>
                  <td className="px-4 py-3 text-foreground-muted">{fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="cors" title="A CORS error in the browser">
        <DocProse>
          <p>
            The browser reports a blocked request. In practice this is almost always one of three
            things:
          </p>
        </DocProse>
        <CodeBlock title="Console" language="text" code={corsError} />
        <DocProse>
          <ul className="flex flex-col gap-2">
            {[
              "The form lists allowed domains and your site is not one of them. Add the exact origin, including https://.",
              "The request is a form-encoded POST without a preflight, and the server rejected the Origin. Check the form's domain list the same way.",
              "The request was sent to http:// instead of https://, which redirects and drops the body.",
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
        </DocProse>
      </DocSection>

      <DocSection id="not-stored" title="A request succeeds but nothing appears">
        <DocProse>
          <p>
            A <code className="font-mono text-xs">200</code> from an HTML form means the thank-you
            page was returned, not that the row exists. Check the submission list filtered to that
            form, then check that you are looking at the same workspace.
          </p>
          <DocSubHeading>A filled honeypot is discarded on purpose</DocSubHeading>
          <p>
            If a submission is accepted but never stored, the{" "}
            <code className="font-mono text-xs">_gotcha</code> field was probably filled. Autofill
            and some browser extensions do this. Keep the field excluded from autofill and out of
            the tab order.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="email" title="Notification emails do not arrive">
        <DocProse>
          <p>
            The submission is stored independently of email, so a missing notification is not a lost
            lead. Check the notification address on the form, then check spam, then confirm the
            sending domain is verified with the email provider. Formivo never retries an address
            that the provider rejected.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="access" title="A client cannot see a form">
        <DocProse>
          <p>
            The client must sign in with the exact address that was invited. If they already had an
            account under a different address, the invitation belongs to a different user. Revoke
            the invitation and send a new one to the address they actually use.
          </p>
          <DocSubHeading>Still stuck?</DocSubHeading>
          <p>
            Send the form id, the response status and the time of the request to{" "}
            <a href="/contact" className="font-medium text-accent hover:underline">
              support
            </a>
            . Never include full submission contents in a support message.
          </p>
        </DocProse>
      </DocSection>
    </DocPageLayout>
  );
}
