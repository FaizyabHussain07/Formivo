import { Alert } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { DocPageLayout, DocProse, DocSection, DocSubHeading } from "@/components/docs/doc-page";
import { siteConfig } from "@/config/site";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "Next.js",
  description:
    "Connect a Next.js App Router form to Formivo from a client component, a server action or a route handler.",
  path: "/docs/nextjs",
});

const clientComponent = `"use client";

const ENDPOINT = "${siteConfig.productionUrl}/api/f/YOUR_FORM_ID";

export function ContactForm() {
  return (
    <form
      action={ENDPOINT}
      method="POST"
      // Progressive enhancement: works before hydration finishes.
    >
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Send</button>
    </form>
  );
}`;

const serverAction = `"use server";

import { redirect } from "next/navigation";

const ENDPOINT = "${siteConfig.productionUrl}/api/f/YOUR_FORM_ID";

export async function submitContact(values: Record<string, string>) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
    // A server action must not cache a mutation.
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { error: body?.error?.message ?? "The form could not be sent." };
  }

  redirect("/thanks");
}`;

const clientFetch = `"use client";

import { useState } from "react";

const ENDPOINT = "${siteConfig.productionUrl}/api/f/YOUR_FORM_ID";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
    });

    if (response.ok) {
      form.reset();
      setState("sent");
    } else {
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send"}
      </button>
      {state === "sent" ? <p role="status">Thanks.</p> : null}
      {state === "error" ? <p role="alert">Something went wrong. Try again.</p> : null}
    </form>
  );
}`;

export default function Page() {
  return (
    <DocPageLayout
      href="/docs/nextjs"
      title="Next.js"
      badge="App Router"
      description="Three patterns that work: a plain form action, a server action that keeps your endpoint private, or a client fetch with local state."
    >
      <DocSection id="choose" title="Choose a pattern">
        <DocProse>
          <ul className="flex flex-col gap-2">
            <li>
              <strong className="text-foreground">Plain form action</strong>: simplest, works
              without JavaScript, and the visitor sees a Formivo thank-you page or your{" "}
              <code className="font-mono text-xs">_redirect</code> URL.
            </li>
            <li>
              <strong className="text-foreground">Server action</strong>: the endpoint stays in
              server code, and you decide the redirect.
            </li>
            <li>
              <strong className="text-foreground">Client fetch</strong>: inline success and error
              states with no navigation.
            </li>
          </ul>
        </DocProse>
      </DocSection>

      <DocSection id="form-action" title="Plain form action">
        <CodeBlock title="app/contact/contact-form.tsx" language="tsx" code={clientComponent} />
        <Alert tone="info" title="Works during hydration">
          An HTML <code className="font-mono text-xs">action</code> is handled by the browser, so
          the form still submits if JavaScript fails to load.
        </Alert>
      </DocSection>

      <DocSection id="server-action" title="Server action">
        <DocProse>
          <p>
            A server action keeps the endpoint out of the client bundle and lets you map the result
            onto your own routes.
          </p>
        </DocProse>
        <CodeBlock title="app/contact/actions.ts" language="typescript" code={serverAction} />
        <DocProse>
          <DocSubHeading>Do not cache the mutation</DocSubHeading>
          <p>
            Use <code className="font-mono text-xs">cache: &quot;no-store&quot;</code> (or a POST
            request, which is uncached by default) so a repeated render cannot replay an old
            response.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="client-fetch" title="Client fetch">
        <CodeBlock title="app/contact/contact-form.tsx" language="tsx" code={clientFetch} />
      </DocSection>

      <DocSection id="env" title="Keep the form id in config">
        <DocProse>
          <p>
            The form id is not a secret, but hard-coding it across components causes drift. Put it
            in an environment variable and read it once:
          </p>
        </DocProse>
        <CodeBlock
          title=".env.local"
          language="bash"
          code={`NEXT_PUBLIC_FORMIVO_FORM_ID=YOUR_FORM_ID`}
        />
        <CodeBlock
          title="Endpoint helper"
          language="typescript"
          code={`export const contactEndpoint =\n  \`${siteConfig.productionUrl}/api/f/\${process.env.NEXT_PUBLIC_FORMIVO_FORM_ID}\`;`}
        />
      </DocSection>
    </DocPageLayout>
  );
}
