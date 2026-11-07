import { CodeBlock } from "@/components/ui/code-block";
import { DocPageLayout, DocProse, DocSection, DocSubHeading } from "@/components/docs/doc-page";
import { siteConfig } from "@/config/site";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "React",
  description:
    "A drop-in React hook that submits a form to Formivo, keeps validation state and never loses the visitor's input on failure.",
  path: "/docs/react",
});

const hook = `import { useCallback, useState } from "react";

const ENDPOINT = "${siteConfig.productionUrl}/api/f/YOUR_FORM_ID";

type Status = "idle" | "submitting" | "success" | "error";

export function useFormivoSubmit() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (values: Record<string, unknown>) => {
    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(values),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error?.message ?? "The form could not be sent.");
      }

      setStatus("success");
      return result as { leadId: string };
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "The form could not be sent.");
      return null;
    }
  }, []);

  return { status, error, submit };
}`;

const usage = `import { useFormivoSubmit } from "./use-formivo-submit";

export function ContactForm() {
  const { status, error, submit } = useFormivoSubmit();

  async function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = await submit(Object.fromEntries(data.entries()));
    if (result) event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" />

      <button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send"}
      </button>

      {status === "success" ? <p role="status">Thanks, we received your message.</p> : null}
      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}`;

const reactHookForm = `import { useForm } from "react-hook-form";

export function ContactForm() {
  const { register, handleSubmit, reset, formState } = useForm();
  const { status, error, submit } = useFormivoSubmit();

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const result = await submit(values);
        if (result) reset();
      })}
    >
      <input {...register("name", { required: true })} />
      <input type="email" {...register("email", { required: true })} />
      <textarea {...register("message")} />

      <button type="submit" disabled={formState.isSubmitting}>
        Send
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}`;

export default function Page() {
  return (
    <DocPageLayout
      href="/docs/react"
      title="React"
      badge="Client component"
      description="One hook handles the request, the pending state and the error message. It works with plain state, React Hook Form or any form library."
    >
      <DocSection id="hook" title="The hook">
        <DocProse>
          <p>
            Keep the endpoint in one module so a form is never hard-coded twice. The hook returns a
            small status machine instead of several booleans.
          </p>
        </DocProse>
        <CodeBlock title="use-formivo-submit.ts" language="typescript" code={hook} />
      </DocSection>

      <DocSection id="usage" title="Use it in a form">
        <CodeBlock title="ContactForm.tsx" language="typescript" code={usage} />
        <DocProse>
          <p>
            Announce success with <code className="font-mono text-xs">role=&quot;status&quot;</code>{" "}
            and failures with <code className="font-mono text-xs">role=&quot;alert&quot;</code> so
            screen readers hear the outcome without a page reload.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="libraries" title="With a form library">
        <DocProse>
          <p>
            The hook does not own your inputs, so React Hook Form, TanStack Form and Formik all
            work. Hand it the validated values:
          </p>
        </DocProse>
        <CodeBlock title="ContactForm.tsx" language="typescript" code={reactHookForm} />
        <DocProse>
          <DocSubHeading>Native validation still counts</DocSubHeading>
          <p>
            Client-side validation improves the experience but is never the security boundary.
            Formivo validates every payload server-side, so a request that skips your form still has
            to pass the endpoint&apos;s rules.
          </p>
        </DocProse>
      </DocSection>
    </DocPageLayout>
  );
}
