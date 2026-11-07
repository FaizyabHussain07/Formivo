import { CodeBlock } from "@/components/ui/code-block";
import { DocPageLayout, DocProse, DocSection, DocSubHeading } from "@/components/docs/doc-page";
import { siteConfig } from "@/config/site";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "JavaScript",
  description:
    "Submit a form with fetch, handle 4xx and 5xx correctly, and retry safely with an idempotency key.",
  path: "/docs/javascript",
});

const submit = `const ENDPOINT = "${siteConfig.productionUrl}/api/f/YOUR_FORM_ID";

async function submitForm(values) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Makes a retry safe: the same key never creates a second submission.
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(values),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(result?.error?.message ?? "The form could not be sent.");
  }

  return result; // { success: true, leadId, message }
}`;

const wired = `const form = document.querySelector("#contact-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = form.querySelector("button[type=submit]");
  const status = form.querySelector("[data-status]");

  button.disabled = true;
  status.textContent = "Sending…";

  try {
    const values = Object.fromEntries(new FormData(form).entries());

    // Keep the visitor on the page if the request fails; the values stay in the inputs.
    const result = await submitForm(values);

    form.reset();
    status.textContent = "Thanks, we received your message.";
    console.info("Stored submission", result.leadId);
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});`;

const retry = `async function submitWithRetry(values, attempts = 3) {
  const idempotencyKey = crypto.randomUUID();

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(values),
      });

      // A client error will fail again: surface it instead of retrying.
      if (response.status >= 400 && response.status < 500) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "The form could not be sent.");
      }

      if (response.ok) return response.json();

      const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000 * attempt));
    } catch (error) {
      if (attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }

  throw new Error("The form could not be sent.");
}`;

export default function Page() {
  return (
    <DocPageLayout
      href="/docs/javascript"
      title="JavaScript"
      badge="fetch"
      description="A complete browser integration: send JSON, keep the visitor on the page, and handle the three outcomes that actually happen."
    >
      <DocSection id="submit" title="Send a submission">
        <DocProse>
          <p>
            Send JSON and read <code className="font-mono text-xs">error.message</code> when the
            request fails. That message is written to be shown to a person.
          </p>
        </DocProse>
        <CodeBlock title="JavaScript" language="javascript" code={submit} />
      </DocSection>

      <DocSection id="wire-up" title="Wire it to a form">
        <DocProse>
          <p>
            Prevent the default submit, disable the button while the request is in flight, and keep
            the entered values when something goes wrong so the visitor does not retype them.
          </p>
        </DocProse>
        <CodeBlock title="JavaScript" language="javascript" code={wired} />
      </DocSection>

      <DocSection id="retries" title="Retry without duplicates">
        <DocProse>
          <p>
            Generate the idempotency key once per logical submission, not per attempt. Retry{" "}
            <code className="font-mono text-xs">429</code> and{" "}
            <code className="font-mono text-xs">5xx</code>, and never retry a{" "}
            <code className="font-mono text-xs">4xx</code> client error.
          </p>
        </DocProse>
        <CodeBlock title="JavaScript" language="javascript" code={retry} />
        <DocProse>
          <DocSubHeading>Server-side (Node) is the same call</DocSubHeading>
          <p>
            Node 18 and later have <code className="font-mono text-xs">fetch</code> built in, so the
            first example works unchanged in a server route, a script or an edge function.
          </p>
        </DocProse>
      </DocSection>
    </DocPageLayout>
  );
}
