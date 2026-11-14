/**
 * Integration guides for stacks Formivo actually supports and tests.
 *
 * Each entry mirrors the documentation: the endpoint accepts JSON, urlencoded and
 * multipart bodies, and no key is embedded. Stacks without a guide are not listed,
 * and unsupported runtimes are named in the page copy instead of being implied.
 */

export type Integration = {
  slug: string;
  name: string;
  title: string;
  seoTitle: string;
  description: string;
  answer: string;
  intro: string;
  requirements: string[];
  steps: string[];
  code: { language: string; title: string; code: string }[];
  notes: string[];
  docHref: string;
};

export const integrations: Integration[] = [
  {
    slug: "html",
    name: "HTML forms",
    title: "Connect an HTML form to Formivo",
    seoTitle: "HTML Form Backend: Connect a Form Without JavaScript | Formivo",
    description:
      "Point an existing HTML form at a Formivo endpoint. No JavaScript, no API key, no backend to deploy. Includes redirect and honeypot fields.",
    answer:
      "Set the form's action to the Formivo endpoint and method to POST. Each input name becomes a stored field. Add a hidden _redirect input to send visitors to your own thank-you page, and _gotcha for a honeypot.",
    intro:
      "The plain HTML integration is the simplest one and the least fragile: it works without JavaScript, in email clients' built-in browsers and on static hosts.",
    requirements: ["A form in your Formivo workspace", "Its endpoint URL", "A page you can edit"],
    steps: [
      "Copy the endpoint from the form's connect screen.",
      "Set method=\"POST\" and action to that endpoint.",
      "Give every input a name; unnamed inputs are not stored.",
      "Optionally add _redirect as a hidden input pointing at your thank-you page.",
      "Optionally add _gotcha as a hidden honeypot input.",
    ],
    code: [
      {
        language: "html",
        title: "A contact form",
        code: `<form action="https://formivo.faizyab.me/api/f/YOUR_FORM_ID" method="POST">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>

  <!-- Optional: return visitors to your own page after submitting -->
  <input type="hidden" name="_redirect" value="https://your-site.com/thanks" />

  <!-- Optional honeypot: real visitors never fill this in -->
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="display:none" />

  <button type="submit">Send</button>
</form>`,
      },
    ],
    notes: [
      "A native HTML submission gets a confirmation page, or your _redirect target.",
      "The endpoint accepts urlencoded and multipart bodies; files are rejected.",
      "A 409 response means the form is paused or the monthly quota is reached.",
    ],
    docHref: "/docs/html",
  },
  {
    slug: "javascript",
    name: "JavaScript",
    title: "Send form submissions with JavaScript",
    seoTitle: "JavaScript Form Backend: Submit a Form with fetch | Formivo",
    description:
      "Send JSON to a Formivo endpoint with fetch, handle 201 and error states, and use an Idempotency-Key so a retry does not duplicate a lead.",
    answer:
      "POST JSON to the form endpoint with fetch. A 201 response contains success, leadId and a message. Send an Idempotency-Key header so retrying the same submission does not create a second lead.",
    intro:
      "Use fetch when you want to keep the visitor on the page while a submission is sent, or when you need a loading state and inline errors.",
    requirements: ["A form endpoint", "A page that can run JavaScript", "No key or token"],
    steps: [
      "Collect values into a plain object.",
      "POST it as JSON to the endpoint.",
      "Treat 201 as success and show your own confirmation.",
      "Handle 409 (paused or quota) and 429 (rate limited, with Retry-After) separately.",
      "Give each attempt a stable Idempotency-Key if you may retry.",
    ],
    code: [
      {
        language: "js",
        title: "Submit and handle the result",
        code: `async function sendLead(values) {
  const response = await fetch("https://formivo.faizyab.me/api/f/YOUR_FORM_ID", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(values),
  });

  if (response.status === 201) {
    const body = await response.json();
    return { ok: true, leadId: body.leadId };
  }
  if (response.status === 429) {
    return { ok: false, retryAfter: response.headers.get("Retry-After") };
  }
  if (response.status === 409) {
    return { ok: false, message: "This form is not accepting submissions right now." };
  }
  return { ok: false, message: "Something went wrong. Please try again." };
}`,
      },
    ],
    notes: [
      "Do not retry a request without an Idempotency-Key: a timeout can mean the submission was already stored.",
      "CORS is limited to the origins you allow on the form; that is a browser control, not authentication.",
    ],
    docHref: "/docs/javascript",
  },
  {
    slug: "react",
    name: "React",
    title: "Connect a React form to Formivo",
    seoTitle: "React Form Backend: Submit Without a Server | Formivo",
    description:
      "A small React pattern for posting a controlled form to a Formivo endpoint, with loading, success and error states and no API key.",
    answer:
      "Keep your controlled React form and POST the values as JSON from the submit handler. You do not need a server, an SDK or a key. Handle 201 as success and surface 409 and 429 as distinct messages.",
    intro:
      "React forms keep their own state and validation. Formivo only replaces the destination of the request, so nothing about the component's design changes.",
    requirements: ["A React app with a form", "A form endpoint", "No additional dependency"],
    steps: [
      "Keep your state and client-side validation.",
      "Call fetch from the submit handler with JSON.",
      "Disable the submit button while the request is in flight.",
      "Show a success state on 201 and an inline error otherwise.",
      "Optionally forward the request from your own server if you need to add a secret.",
    ],
    code: [
      {
        language: "tsx",
        title: "A minimal client component",
        code: `"use client";
import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(event.currentTarget));

    const response = await fetch(
      "https://formivo.faizyab.me/api/f/YOUR_FORM_ID",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    setStatus(response.status === 201 ? "sent" : "error");
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send"}
      </button>
      {status === "sent" ? <p>Thanks, your message arrived.</p> : null}
      {status === "error" ? <p>That did not send. Please try again.</p> : null}
    </form>
  );
}`,
      },
    ],
    notes: [
      "In a React Server Component the form can post to the endpoint directly, but you lose the inline success state.",
      "If you need to attach a secret or a CRM forward, do it in a route handler, not in the browser.",
    ],
    docHref: "/docs/react",
  },
  {
    slug: "nextjs",
    name: "Next.js",
    title: "Connect a Next.js form to Formivo",
    seoTitle: "Next.js Form Backend: App Router Integration | Formivo",
    description:
      "Two Next.js patterns for Formivo: a client-side fetch with inline states, or a server action that forwards the submission and keeps your secret server-side.",
    answer:
      "In Next.js you can post from a client component with fetch, or forward the submission from a server action or route handler. Use the server path when you need to add a secret or forward to a CRM after storing the lead.",
    intro:
      "The App Router gives two sensible integration points. Both keep the form in your own components and use the same endpoint.",
    requirements: ["A Next.js App Router project", "A form endpoint"],
    steps: [
      "Use a client component for inline success and error states.",
      "Or use a server action to forward the payload and keep extra logic private.",
      "Never expose a secret in a client component; the Formivo endpoint needs none.",
      "Read the route segment config if you forward with a long-running request.",
    ],
    code: [
      {
        language: "tsx",
        title: "Server action forwarding",
        code: `"use server";

export async function submitLead(formData: FormData) {
  const response = await fetch(
    "https://formivo.faizyab.me/api/f/YOUR_FORM_ID",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
      cache: "no-store",
    },
  );

  if (response.status !== 201) {
    return { ok: false as const };
  }
  return { ok: true as const };
}`,
      },
    ],
    notes: [
      "A server-side forward gives you a place to log, filter or notify after the submission is stored.",
      "Formivo does not currently send email notifications, so a server action is the right place to add your own.",
    ],
    docHref: "/docs/nextjs",
  },
];

export function findIntegration(slug: string): Integration | undefined {
  return integrations.find((item) => item.slug === slug);
}
