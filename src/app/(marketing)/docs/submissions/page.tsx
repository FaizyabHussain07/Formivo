import { CodeBlock } from "@/components/ui/code-block";
import { DocPageLayout, DocProse, DocSection, DocSubHeading } from "@/components/docs/doc-page";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "Submissions",
  description:
    "How submissions are stored, the six lead statuses, filtering, notification email and CSV export per plan.",
  path: "/docs/submissions",
});

const statuses: [string, string][] = [
  ["new", "Stored and not opened yet. New rows are the default working queue."],
  ["read", "Opened and acknowledged, with no decision made."],
  ["contacted", "Someone reached out to the lead."],
  ["qualified", "A real opportunity, worth following up."],
  ["converted", "Became a customer or a signed engagement."],
  ["archived", "Closed, irrelevant or spam."],
];

const shape = `{
  "id": "9d1f2c4a-7b3e-4f1a-9c2d-1a2b3c4d5e6f",
  "form_id": "3f8c1a2b-...",
  "status": "new",
  "data": {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "message": "Please call me back."
  },
  "metadata": { "page": "/contact", "campaign": "spring" },
  "created_at": "2026-11-07T09:14:22.000Z"
}`;

export default function Page() {
  return (
    <DocPageLayout
      href="/docs/submissions"
      title="Submissions"
      badge="Dashboard"
      description="Every accepted request becomes one row. This page covers what is stored, how statuses work, and what each plan lets you do with the data."
    >
      <DocSection id="stored" title="What is stored">
        <DocProse>
          <p>
            A submission is your form values plus the context the server adds. Your field names are
            kept exactly as sent, which is why naming fields well in the HTML matters.
          </p>
        </DocProse>
        <CodeBlock title="Submission shape" language="json" code={shape} />
        <DocProse>
          <p>
            Workspace, form and timestamps are set by the server. A request cannot claim a different
            owner by sending extra fields.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="statuses" title="Lead statuses">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground-secondary">
              {statuses.map(([status, meaning]) => (
                <tr key={status}>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{status}</td>
                  <td className="px-4 py-3">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DocProse>
          <p>
            Status changes are yours. Nothing moves a lead automatically, so the queue always
            reflects a decision a person made.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="finding" title="Finding a submission">
        <DocProse>
          <p>
            Filter the list by form, status and date. Opening a row shows the full payload, the page
            it came from when a <code className="font-mono text-xs">metadata</code> field was sent,
            and the exact time it arrived.
          </p>
          <DocSubHeading>Notifications</DocSubHeading>
          <p>
            A form can also email each submission to an address you choose. The stored row is the
            source of truth; email is a convenience, and a failed send never loses the submission.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="export" title="CSV export">
        <DocProse>
          <p>
            Export is a paid capability and is enforced on the server: a request from a Free plan
            workspace is refused even if the button is reachable. Light, Pro and Agency exports include the
            submission values, status and timestamp.
          </p>
          <p>
            Exports are generated per request and are never cached, so a shared link cannot leak
            data later.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="limits" title="Limits per plan">
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-[11px] tracking-[0.08em] text-foreground-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-2.5">
                  Plan
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Submissions / month
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Active forms
                </th>
                <th scope="col" className="px-4 py-2.5">
                  CSV export
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground-secondary">
              {[
                ["Free", "300", "3", "No"],
                ["Pro", "2,000", "10", "Yes"],
                ["Agency", "10,000", "50", "Yes"],
              ].map(([plan, submissions, forms, exportable]) => (
                <tr key={plan}>
                  <td className="px-4 py-3 font-medium text-foreground">{plan}</td>
                  <td className="px-4 py-3">{submissions}</td>
                  <td className="px-4 py-3">{forms}</td>
                  <td className="px-4 py-3">{exportable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DocProse>
          <p>
            When the monthly allowance is used, the endpoint returns{" "}
            <code className="font-mono text-xs">409</code> until the next period starts or the plan
            changes. Nothing is silently dropped.
          </p>
        </DocProse>
      </DocSection>
    </DocPageLayout>
  );
}
