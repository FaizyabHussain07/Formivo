import { Alert } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { DocPageLayout, DocProse, DocSection, DocSubHeading } from "@/components/docs/doc-page";
import { siteConfig } from "@/config/site";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "HTML forms",
  description:
    "Connect an existing HTML form to Formivo with an action and method. No JavaScript, no build step, no key.",
  path: "/docs/html",
});

const minimal = `<form action="${siteConfig.productionUrl}/api/f/YOUR_FORM_ID" method="POST">
  <label for="name">Name</label>
  <input id="name" name="name" type="text" required />

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" rows="5"></textarea>

  <button type="submit">Send</button>
</form>`;

const redirect = `<form action="${siteConfig.productionUrl}/api/f/YOUR_FORM_ID" method="POST">
  <input type="text" name="name" required />
  <input type="email" name="email" required />

  <!-- Send the visitor here after a successful submission -->
  <input type="hidden" name="_redirect" value="https://your-site.com/thank-you" />

  <!-- Honeypot: real people never fill this, bots usually do -->
  <div aria-hidden="true" style="position:absolute;left:-9999px">
    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" />
  </div>

  <button type="submit">Send</button>
</form>`;

const metadataField = `<input type="hidden" name="metadata" value='{"page":"/contact","variant":"hero"}' />`;

export default function Page() {
  return (
    <DocPageLayout
      href="/docs/html"
      title="HTML forms"
      badge="No JavaScript"
      description="An existing form needs two attributes changed. Everything else, including validation and the thank-you page, is handled for you."
    >
      <DocSection id="two-attributes" title="Two attributes">
        <DocProse>
          <p>
            Point <code className="font-mono text-xs">action</code> at your endpoint and set{" "}
            <code className="font-mono text-xs">method=&quot;POST&quot;</code>. That is the whole
            integration.
          </p>
        </DocProse>
        <CodeBlock title="HTML" language="html" code={minimal} />
        <DocProse>
          <p>
            Each <code className="font-mono text-xs">name</code> attribute becomes a key in the
            stored submission, so name fields the way you want to read them later.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="thank-you" title="Thank-you page and honeypot">
        <DocProse>
          <p>
            Without JavaScript, the visitor lands on a Formivo thank-you page. Add{" "}
            <code className="font-mono text-xs">_redirect</code> to send them back to your own site
            instead.
          </p>
        </DocProse>
        <CodeBlock title="HTML" language="html" code={redirect} />
        <Alert tone="info" title="Honeypot fields are free protection">
          A <code className="font-mono text-xs">_gotcha</code> field that is hidden from people but
          visible to bots catches a large share of automated submissions before they reach your
          dashboard.
        </Alert>
      </DocSection>

      <DocSection id="extra-context" title="Attach extra context">
        <DocProse>
          <p>
            A hidden <code className="font-mono text-xs">metadata</code> field is stored as
            structured context, which is useful for knowing where a lead came from.
          </p>
        </DocProse>
        <CodeBlock title="HTML" language="html" code={metadataField} />
        <DocProse>
          <DocSubHeading>Keep the form accessible</DocSubHeading>
          <p>
            Always pair inputs with <code className="font-mono text-xs">label</code> elements, keep
            the native <code className="font-mono text-xs">required</code> attributes, and leave the
            built-in browser validation on. Formivo rejects invalid payloads, but the visitor should
            never have to reach the server to find out a field is missing.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="content-types" title="What is sent">
        <DocProse>
          <p>
            A plain HTML form submits{" "}
            <code className="font-mono text-xs">application/x-www-form-urlencoded</code> by default.
            Add <code className="font-mono text-xs">enctype=&quot;multipart/form-data&quot;</code>{" "}
            and the endpoint accepts that too, but file parts are not stored.
          </p>
        </DocProse>
        <Alert tone="warning" title="No file uploads">
          Formivo stores structured values, not attachments. If your form uploads a CV or an image,
          upload it to your own storage first and send the resulting URL as a normal field.
        </Alert>
      </DocSection>
    </DocPageLayout>
  );
}
