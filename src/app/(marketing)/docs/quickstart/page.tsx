import { Alert } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { DocPageLayout, DocProse, DocSection, DocSubHeading } from "@/components/docs/doc-page";
import { siteConfig } from "@/config/site";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "Quickstart",
  description:
    "Create a Formivo form, copy its endpoint, send a first submission and confirm it appears in the dashboard.",
  path: "/docs/quickstart",
});

const endpoint = `${siteConfig.productionUrl}/api/f/YOUR_FORM_ID`;

const html = `<form action="${endpoint}" method="POST">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message"></textarea>
  <input type="hidden" name="_redirect" value="https://your-site.com/thanks" />
  <button type="submit">Send</button>
</form>`;

const curl = `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: first-submission" \\
  -d '{ "name": "Ada Lovelace", "email": "ada@example.com" }'`;

const response = `{
  "success": true,
  "leadId": "9d1f2c4a-7b3e-4f1a-9c2d-1a2b3c4d5e6f",
  "message": "Submission received."
}`;

export default function Page() {
  return (
    <DocPageLayout
      href="/docs/quickstart"
      title="Quickstart"
      badge="2 minutes"
      description="From an empty dashboard to a stored submission: create the form, copy the endpoint, send one request and verify it landed."
    >
      <DocSection id="create" title="1. Create a form">
        <DocProse>
          <p>
            Sign in and open <strong className="text-foreground">Forms</strong>, then{" "}
            <strong className="text-foreground">New form</strong>. Give it a name you will recognise
            later, for example <em>Website contact</em>. The name is internal; it is not shown to
            visitors.
          </p>
          <p>
            Creating a form immediately opens a connect screen with the endpoint, ready-made prompts
            for AI coding tools, and copy-ready snippets. You can reopen it later from the
            form&apos;s <strong className="text-foreground">Integration</strong> tab.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="copy-endpoint" title="2. Copy the endpoint">
        <DocProse>
          <p>
            Each form has exactly one endpoint. It contains the form id, which is a random
            identifier, not a secret:
          </p>
        </DocProse>
        <CodeBlock
          title="Endpoint"
          language="http"
          code={`POST ${siteConfig.productionUrl}/api/f/YOUR_FORM_ID`}
        />
      </DocSection>

      <DocSection id="first-request" title="3. Send one submission">
        <DocProse>
          <p>
            The fastest check is a plain HTML form. Field names become submission keys, so choose
            names you want to read in the dashboard.
          </p>
        </DocProse>
        <CodeBlock title="HTML" language="html" code={html} />
        <DocProse>
          <p>
            Prefer a terminal? The JSON path returns the created submission id so you can confirm
            success programmatically.
          </p>
        </DocProse>
        <CodeBlock title="cURL" language="bash" code={curl} />
        <CodeBlock title="201 Created" language="json" code={response} />
      </DocSection>

      <DocSection id="verify" title="4. Verify it stored">
        <DocProse>
          <p>
            Open <strong className="text-foreground">Submissions</strong>. The row appears
            immediately; the list refreshes on its own while the tab is open. Filter by form to see
            only this one.
          </p>
        </DocProse>
        <Alert tone="info" title="If nothing appears">
          Check the response status first. A <code className="font-mono text-xs">404</code> means
          the form id is wrong, <code className="font-mono text-xs">409</code> means the form is
          paused or the monthly quota is used, and <code className="font-mono text-xs">429</code>{" "}
          means the submission was rate limited. The{" "}
          <a href="/docs/troubleshooting" className="font-medium text-accent hover:underline">
            troubleshooting page
          </a>{" "}
          covers each case.
        </Alert>
      </DocSection>

      <DocSection id="next" title="5. Continue">
        <DocProse>
          <DocSubHeading>Choose your integration</DocSubHeading>
          <p>
            Follow{" "}
            <a href="/docs/html" className="font-medium text-accent hover:underline">
              HTML forms
            </a>
            ,{" "}
            <a href="/docs/react" className="font-medium text-accent hover:underline">
              React
            </a>{" "}
            or{" "}
            <a href="/docs/nextjs" className="font-medium text-accent hover:underline">
              Next.js
            </a>{" "}
            for a complete example, including error handling.
          </p>
          <DocSubHeading>Turn on notifications</DocSubHeading>
          <p>
            Add a notification address on the form so new submissions also arrive by email. The
            submission is stored either way.
          </p>
          <DocSubHeading>Share with a client</DocSubHeading>
          <p>
            From the form&apos;s client access section, invite a client by email. They receive
            read-only access to that form and nothing else. See{" "}
            <a href="/docs/client-portal" className="font-medium text-accent hover:underline">
              client portal
            </a>
            .
          </p>
        </DocProse>
      </DocSection>
    </DocPageLayout>
  );
}
