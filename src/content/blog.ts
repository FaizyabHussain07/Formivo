import type { BlogPost } from "./types";

/**
 * Blog content lives in code so every article is statically rendered, typed and
 * versioned with the product. Code samples use the real endpoint shape:
 * POST https://formivo.faizyab.me/api/f/{formId}
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "what-is-a-form-backend",
    title: "What is a form backend?",
    seoTitle: "What Is a Form Backend? Definition, Workflow and When You Need One",
    description:
      "A form backend receives, validates, stores and delivers the data behind an HTML form. Here is what it replaces, what it does not do, and how to choose one.",
    category: "Fundamentals",
    tags: ["form backend", "architecture", "definitions"],
    publishedAt: "2026-10-06",
    readingMinutes: 6,
    answer:
      "A form backend is the server-side half of a form: it accepts the POST request, validates and stores the data, filters abuse, and delivers submissions somewhere you can read them. It replaces the custom endpoint you would otherwise write, deploy and maintain.",
    blocks: [
      {
        type: "p",
        text: "Every HTML form has two halves. The markup in the browser collects values; something on the server has to accept them. On a static site, a marketing page, or a prototype, that second half is usually the reason a form never ships.",
      },
      { type: "h2", text: "What a form backend actually does" },
      {
        type: "ul",
        items: [
          "Accepts the HTTP request the browser sends — form-encoded, multipart or JSON.",
          "Validates structure and size before anything is stored.",
          "Applies abuse controls: rate limits, spam filtering, origin checks.",
          "Stores the submission durably, scoped to the right owner.",
          "Delivers it: dashboard, email notification, webhook or export.",
        ],
      },
      {
        type: "p",
        text: "That list is short, but each line is a production concern. Validation that is too loose lets malformed data into your database; rate limiting is the difference between a contact form and a free spam relay; storage needs ownership rules so one client never sees another's leads.",
      },
      { type: "h2", text: "What it is not" },
      {
        type: "p",
        text: "A form backend is not a form builder. It does not style your inputs, manage your layout, or replace your design system. You keep the form you already have and change one attribute, the action URL.",
      },
      {
        type: "code",
        language: "html",
        title: "The entire integration",
        code: `<form action="https://formivo.faizyab.me/api/f/YOUR_FORM_ID" method="POST">
  <label for="email">Email</label>
  <input id="email" type="email" name="email" required />
  <button type="submit">Send</button>
</form>`,
      },
      { type: "h2", text: "Why teams use one instead of writing an endpoint" },
      {
        type: "ol",
        items: [
          "The endpoint has to exist everywhere: preview deployments, staging, production.",
          "Email delivery needs a domain, a provider and bounce handling.",
          "Spam arrives within days of going live, and filtering is an arms race.",
          "Someone has to own the data: retention, exports, deletion requests.",
          "Client-facing access is a separate feature most teams never get to.",
        ],
      },
      {
        type: "p",
        text: "A small Express handler is easy to write and hard to keep. The handler is ten lines; the operational surface around it is the project.",
      },
      { type: "h2", text: "How Formivo implements it" },
      {
        type: "p",
        text: "Each form gets one public endpoint, identified by its form id. There is no API key to embed in HTML, because a key in client-side markup is not a secret anyway. Protection comes from the parts that can actually be enforced on the server: a 256 KB body cap, field and nesting limits, per-form and per-IP rate limits stored in the database, an optional browser-origin allow-list, honeypot fields, idempotency keys, and monthly quota checks that run in the same transaction as the insert.",
      },
      {
        type: "p",
        text: "Submissions are write-only from the public side. Reading them requires a signed-in workspace member, and the database enforces the same boundary with row-level security rather than trusting the application layer.",
      },
      {
        type: "note",
        title: "Rule of thumb",
        text: "If your form needs to notify a human and keep a record, you need a backend. If it needs to trigger business logic, keep your own service and post to it.",
      },
      { type: "h2", text: "When you should build your own" },
      {
        type: "ul",
        items: [
          "The submission must join data you already own inside your database.",
          "You need file processing, payments or multi-step state machines.",
          "Compliance requires the data to stay in your own infrastructure.",
        ],
      },
      {
        type: "p",
        text: "Otherwise a hosted backend removes a service from your on-call rotation. The rest of this blog covers the concrete integrations: HTML, React, Next.js, PHP and the security decisions around each.",
      },
    ],
  },
  {
    slug: "html-form-submissions-without-a-backend",
    title: "How to handle HTML form submissions without building a backend",
    seoTitle: "HTML Form Submissions Without a Backend: Step-by-Step Setup",
    description:
      "Point an existing HTML form at a hosted endpoint, choose the right response format, and read the submissions in a dashboard. No server required.",
    category: "Fundamentals",
    tags: ["html", "static sites", "tutorial"],
    publishedAt: "2026-10-12",
    readingMinutes: 7,
    answer:
      "Change the form's action to a hosted endpoint and keep method=\"POST\". The service accepts the browser's native form submission, validates it, stores it, and returns either a thank-you page or JSON if you submit with fetch().",
    blocks: [
      {
        type: "p",
        text: "You do not need a server to collect form data. You need an endpoint that already exists. This walkthrough starts from a form you have and ends with submissions you can read, without touching a framework.",
      },
      { type: "h2", text: "Step 1: Create the form in the dashboard" },
      {
        type: "p",
        text: "Create a form, give it a name you will recognise in six months, and copy its endpoint. The URL contains a random id rather than a secret, so it is safe in public HTML.",
      },
      { type: "h2", text: "Step 2: Point your form at it" },
      {
        type: "code",
        language: "html",
        code: `<form action="https://formivo.faizyab.me/api/f/YOUR_FORM_ID" method="POST">
  <label for="name">Name</label>
  <input id="name" name="name" required />

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" rows="4"></textarea>

  <button type="submit">Send</button>
</form>`,
      },
      {
        type: "p",
        text: "Field names become the JSON keys you see in the dashboard, so name them for the reader, not the database: `email`, not `field_2`.",
      },
      { type: "h2", text: "Step 3: Decide what the visitor sees" },
      {
        type: "table",
        headers: ["You want", "Do this", "The endpoint returns"],
        rows: [
          ["A branded confirmation page", "Nothing extra", "HTML thank-you page, 200"],
          ["Your own thank-you page", "Add `_redirect` with an https URL", "303 redirect"],
          [
            "Stay on the page, show a message",
            "Submit with fetch() and `Accept: application/json`",
            "201 with `{ success, leadId }`",
          ],
        ],
      },
      {
        type: "note",
        title: "Redirects are validated",
        text: "`_redirect` only accepts http and https. Anything else is ignored, which prevents open-redirect abuse through your form.",
      },
      { type: "h2", text: "Step 4: Read the submissions" },
      {
        type: "p",
        text: "Submissions appear in the workspace immediately: filter by form, search across name, email, message, subject and phone, set a lead status, and export when the plan allows it. There is nothing to poll and no mailbox to keep clean.",
      },
      { type: "h2", text: "Step 5: Add a little abuse control" },
      {
        type: "ul",
        items: [
          "Add a hidden honeypot field (`_gotcha`). Submissions that fill it are answered with success and stored nowhere.",
          "Set an origin allow-list if the form should only accept posts from your domain.",
          "Keep rate limits on: per form, per IP and per form+IP are enforced in the database.",
        ],
      },
      { type: "h2", text: "Common mistakes" },
      {
        type: "ol",
        items: [
          "Leaving `method` off the form — the browser then sends GET and nothing is stored.",
          'Using `enctype="text/plain"`; only urlencoded and multipart are supported.',
          "Naming two inputs the same on purpose, then expecting one value.",
          "Blocking the submit button before the response returns, so a slow network looks broken.",
        ],
      },
      {
        type: "p",
        text: "That is the whole integration. One attribute, one form name, and a dashboard you can hand to a client without exposing your infrastructure.",
      },
    ],
  },
  {
    slug: "form-action-vs-javascript-fetch",
    title: "HTML form action vs JavaScript fetch: which should you use?",
    seoTitle: "Form Action vs fetch(): Choosing the Right Submission Method",
    description:
      "Native form submission is faster, works without JavaScript, and is easier to make accessible. fetch() gives you inline validation and no page reload. Here is how to decide.",
    category: "Integration",
    tags: ["html", "javascript", "accessibility"],
    publishedAt: "2026-10-18",
    readingMinutes: 6,
    answer:
      "Use the native action when the form is the page's main task and a confirmation page is acceptable. Use fetch() when you need to stay on the page, show inline errors, or submit as part of a larger interface. Either way the server contract is identical.",
    blocks: [
      {
        type: "p",
        text: "The two approaches send the same request. The difference is who owns the failure state: the browser, or your JavaScript.",
      },
      { type: "h2", text: "Native submission (action + method)" },
      {
        type: "code",
        language: "html",
        code: `<form action="https://formivo.faizyab.me/api/f/YOUR_FORM_ID" method="POST">
  <input name="email" type="email" required />
  <button type="submit">Subscribe</button>
</form>`,
      },
      {
        type: "ul",
        items: [
          "Works with JavaScript disabled, blocked or still loading.",
          "Validation and error announcement come from the browser for free.",
          "The back button, history and screen readers behave normally.",
          "Costs a navigation: the visitor leaves the page for the response.",
        ],
      },
      { type: "h2", text: "JavaScript submission (fetch)" },
      {
        type: "code",
        language: "javascript",
        code: `const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  button.textContent = "Sending…";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });

    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message ?? "Submission failed");

    form.reset();
    button.textContent = "Sent";
  } catch (error) {
    button.textContent = "Try again";
    showError(error.message);
  } finally {
    button.disabled = false;
  }
});`,
      },
      {
        type: "ul",
        items: [
          "No navigation: the visitor stays where they are.",
          "You own validation messages, focus management and the error state.",
          "You must handle network failure, timeouts and double submits yourself.",
          "The loading state is your responsibility — disable the button and say what is happening.",
        ],
      },
      { type: "h2", text: "The hybrid that most teams should use" },
      {
        type: "p",
        text: "Start with the native form, because it always works. Then add fetch() as an enhancement: intercept the submit event, post with JSON, and if the request fails, fall back to a normal submission by re-submitting the form with the native path. Progressive enhancement is not nostalgia; it is the cheapest reliability you will ever ship.",
      },
      { type: "h2", text: "Accessibility details that decide it" },
      {
        type: "ul",
        items: [
          'Announce errors with `role="alert"` or an `aria-live` region, and move focus to the first invalid field.',
          "Never rely on colour alone for an error state; pair it with text.",
          "Keep the submit button enabled until the request starts — a disabled button with no explanation is a dead end.",
          "If you replace the form with a success message, move focus to it so screen readers notice.",
        ],
      },
      { type: "h2", text: "What Formivo returns in each case" },
      {
        type: "table",
        headers: ["Request", "Response"],
        rows: [
          ["Native POST, browser Accept", "HTML confirmation page, 200"],
          ["Native POST with `_redirect`", "303 to your URL"],
          ["fetch() with `Accept: application/json`", "201 `{ success: true, leadId }`"],
          ["Too many requests", "429 with `Retry-After`"],
        ],
      },
      {
        type: "p",
        text: "Because both paths hit the same endpoint, you can start with one and switch later without migrating data or changing the backend.",
      },
    ],
  },
  {
    slug: "nextjs-form-backend",
    title: "How to handle form submissions in Next.js",
    seoTitle: "Next.js Form Submission to an External Backend (App Router)",
    description:
      "Three working patterns for Next.js App Router forms: a server action, a client fetch, and a plain HTML form. Plus where the data should live.",
    category: "Integration",
    tags: ["nextjs", "react", "server actions"],
    publishedAt: "2026-10-22",
    readingMinutes: 7,
    answer:
      "Post the form to your backend endpoint either from a server action (keeps the endpoint server-side), a client component with fetch(), or a plain HTML form. The endpoint is the same in all three cases.",
    blocks: [
      {
        type: "p",
        text: "Next.js gives you several ways to submit a form, and the choice mostly affects where the request is sent from, not what the backend sees.",
      },
      { type: "h2", text: "Pattern 1: Plain HTML form (works in any deployment)" },
      {
        type: "code",
        language: "tsx",
        code: `export default function ContactPage() {
  return (
    <form action="https://formivo.faizyab.me/api/f/YOUR_FORM_ID" method="POST">
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
      <button type="submit">Send</button>
    </form>
  );
}`,
      },
      {
        type: "p",
        text: "No JavaScript, no hydration cost, and it survives a client-side crash. The trade-off is a navigation to the confirmation page.",
      },
      { type: "h2", text: "Pattern 2: Client component with fetch()" },
      {
        type: "code",
        language: "tsx",
        code: `"use client";

import { useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");

    const response = await fetch("https://formivo.faizyab.me/api/f/YOUR_FORM_ID", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });

    setState(response.ok ? "sent" : "error");
    if (response.ok) form.reset();
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="email" type="email" required aria-label="Email" />
      <button disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : state === "sent" ? "Sent" : "Send"}
      </button>
      {state === "error" && <p role="alert">Could not send. Please try again.</p>}
    </form>
  );
}`,
      },
      { type: "h2", text: "Pattern 3: Server action" },
      {
        type: "code",
        language: "tsx",
        code: `"use server";

export async function submitContact(_prev: unknown, formData: FormData) {
  const response = await fetch(
    \`https://formivo.faizyab.me/api/f/\${process.env.NEXT_PUBLIC_CONTACT_FORM_ID}\`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    },
  );

  if (!response.ok) return { error: "Could not send. Please try again." };
  return { sent: true };
}`,
      },
      {
        type: "p",
        text: "A server action keeps the endpoint out of the client bundle and lets you add logic before forwarding. Remember that anything in a `NEXT_PUBLIC_` variable is public: a form id is fine, an API key is not.",
      },
      { type: "h2", text: "Where should the submissions live?" },
      {
        type: "table",
        headers: ["Approach", "You own", "You maintain"],
        rows: [
          ["Your own database + email", "Everything", "Schema, spam, deliverability, backup"],
          ["Hosted form backend", "The form UI", "The form UI"],
          ["Marketing automation tool", "The form UI", "Vendor limits and pricing"],
        ],
      },
      {
        type: "note",
        title: "Server action caveat",
        text: "Server actions are public HTTP endpoints once deployed. Validate input inside the action as strictly as you would in an API route, and never trust that the form was the only caller.",
      },
      { type: "h2", text: "Which pattern to pick" },
      {
        type: "ol",
        items: [
          "Marketing or docs page: plain HTML form. Zero JavaScript, zero hydration.",
          "Dashboard or app form: client fetch with proper error and loading states.",
          "You need to enrich the payload server-side (UTMs, user id): server action.",
        ],
      },
      {
        type: "p",
        text: "All three send the same request shape, so you can move between them without touching the backend or its data.",
      },
    ],
  },
  {
    slug: "react-form-backend",
    title: "Connecting a React form to a backend",
    seoTitle: "React Form to Backend: Controlled Inputs, Validation and Submission",
    description:
      "A complete React form with controlled inputs, client validation, a real POST request and accessible error handling — no form library required.",
    category: "Integration",
    tags: ["react", "forms", "validation"],
    publishedAt: "2026-10-26",
    readingMinutes: 6,
    answer:
      "Keep form state in React, validate on submit, POST JSON to the endpoint with fetch, and render the response as a status message. The backend validates again; client validation is only for speed of feedback.",
    blocks: [
      {
        type: "p",
        text: "React makes form state explicit, which is both the benefit and the trap: it is easy to write a form that validates only in the browser and trusts its own output.",
      },
      { type: "h2", text: "The form" },
      {
        type: "code",
        language: "tsx",
        code: `import { useState } from "react";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    if (typeof data.email !== "string" || !data.email.includes("@")) {
      setStatus({ kind: "error", message: "Enter a valid email address." });
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const response = await fetch("https://formivo.faizyab.me/api/f/YOUR_FORM_ID", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Submission failed");
      form.reset();
      setStatus({ kind: "sent" });
    } catch (error) {
      setStatus({ kind: "error", message: (error as Error).message });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" required />
      <button type="submit" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Sending…" : "Send"}
      </button>
      {status.kind === "error" && <p role="alert">{status.message}</p>}
      {status.kind === "sent" && <p role="status">Thanks — we will reply shortly.</p>}
    </form>
  );
}`,
      },
      { type: "h2", text: "Uncontrolled is usually enough" },
      {
        type: "p",
        text: "The example above is uncontrolled: the DOM holds the values and `FormData` reads them on submit. Use controlled inputs only when a value drives rendering, a character counter, dependent fields, or live validation. Controlled everything means a re-render per keystroke for no benefit.",
      },
      { type: "h2", text: "Validate twice, on purpose" },
      {
        type: "table",
        headers: ["Layer", "Job", "Can be bypassed?"],
        rows: [
          ["HTML attributes", "Free, accessible hints", "Yes — trivially"],
          ["React check on submit", "Fast feedback, better copy", "Yes — devtools or curl"],
          ["Backend validation", "The actual guarantee", "No"],
        ],
      },
      {
        type: "p",
        text: "Formivo rejects oversized bodies, malformed JSON, too many fields, values over 10,000 characters and unsupported content types regardless of what the client sent.",
      },
      { type: "h2", text: "Common React pitfalls" },
      {
        type: "ul",
        items: [
          "Reading `event.target` after an await — the synthetic event is no longer current. Capture `currentTarget` first.",
          "Forgetting `preventDefault`, so the browser navigates away mid-submit.",
          "Not disabling the button during the request, which invites duplicate submissions. Idempotency keys are the server-side safety net.",
          'Rendering an error inside a div that screen readers never announce. Use `role="alert"`.',
        ],
      },
      {
        type: "p",
        text: "If you are on a framework with server actions or loaders, those are preferable for app-internal forms. For marketing pages, the code above plus a real endpoint is all you need.",
      },
    ],
  },
  {
    slug: "prevent-contact-form-spam",
    title: "How to prevent contact form spam (without CAPTCHA everywhere)",
    seoTitle: "Contact Form Spam Prevention: Honeypots, Rate Limits and Origin Checks",
    description:
      "Layered spam defence for public forms: honeypots, rate limits, origin allow-lists, idempotency and content checks — and when a CAPTCHA is actually worth the friction.",
    category: "Security",
    tags: ["spam", "security", "rate limiting"],
    publishedAt: "2026-10-29",
    readingMinutes: 7,
    answer:
      "Layer cheap, invisible controls first: honeypot fields, per-IP rate limits, origin allow-lists and idempotency. Add a CAPTCHA only for the traffic that survives those, because a CAPTCHA taxes every real visitor to stop a minority of bots.",
    blocks: [
      {
        type: "p",
        text: "Spam is not a single problem. There are crawlers that parse every form on the internet, targeted bots that solve your specific challenge, and humans paid to submit junk. Each needs a different lever.",
      },
      { type: "h2", text: "Layer 1: Honeypots (free, invisible)" },
      {
        type: "code",
        language: "html",
        code: `<label class="sr-only" for="website">Leave this field empty</label>
<input id="website" name="_gotcha" tabindex="-1" autocomplete="off" />
<input type="hidden" name="_honey" value="" />`,
      },
      {
        type: "p",
        text: "Naive bots fill every input. Formivo answers honeypot submissions with a success response and stores nothing, so the bot has no signal that it failed.",
      },
      { type: "h2", text: "Layer 2: Rate limits that survive scaling" },
      {
        type: "p",
        text: "In-memory counters reset with every cold start and diverge across instances. Limits need to live in a shared store. Formivo keeps fixed windows in Postgres and enforces three per submission: per form, per IP, and per form+IP.",
      },
      {
        type: "note",
        title: "Trust the right header",
        text: "A rate limiter is only as honest as its client IP. If you read the leftmost `x-forwarded-for` entry, an attacker rotating a fake value gets an unlimited number of buckets. Prefer platform-set headers or the rightmost proxy hop.",
      },
      { type: "h2", text: "Layer 3: Origin allow-lists" },
      {
        type: "p",
        text: "If a form is only used on one site, restricting accepted origins removes a large class of drive-by abuse. Be clear about what this is: a browser control, not authentication. A server-side script can send any `Origin` it likes, which is why rate limits and quotas still matter.",
      },
      { type: "h2", text: "Layer 4: Idempotency" },
      {
        type: "p",
        text: "Double clicks and retry loops create duplicate leads that look like spam to whoever has to clean them up. Send an `Idempotency-Key` (or `_idempotency_key`) generated once per form fill; retries then return the original submission instead of inserting a second one.",
      },
      { type: "h2", text: "Layer 5: Content heuristics" },
      {
        type: "ul",
        items: [
          "Reject submissions whose only URL appears in a link-heavy message.",
          "Treat identical bodies from the same IP within minutes as one submission.",
          "Flag free-mail addresses only if your funnel genuinely needs it — usually it does not.",
        ],
      },
      { type: "h2", text: "When a CAPTCHA is worth it" },
      {
        type: "table",
        headers: ["Signal", "Action"],
        rows: [
          ["Honeypot catches most bots", "No CAPTCHA needed"],
          ["Bots solve your challenge and submit", "Add a provider CAPTCHA (Turnstile, hCaptcha)"],
          ["Humans submit junk", "Moderation queue, not a CAPTCHA"],
        ],
      },
      {
        type: "p",
        text: "A CAPTCHA should be the last layer, because it costs you real conversions and adds a third-party dependency to your form's critical path.",
      },
      { type: "h2", text: "A checklist for launch day" },
      {
        type: "ol",
        items: [
          "Honeypot field present and hidden accessibly (not `display:none` only).",
          "Rate limits in a shared store, keyed on a trustworthy IP.",
          "Origin allow-list set if the form has one known home.",
          "Quota configured so a flood cannot cost you money silently.",
          "An alert path: someone should notice a spike in the same day.",
        ],
      },
    ],
  },
  {
    slug: "form-submission-security",
    title: "Form submission security: what actually protects a public endpoint",
    seoTitle: "Public Form Endpoint Security: Validation, Limits and Authorization",
    description:
      "A public form endpoint is unauthenticated by design. Here is what genuinely protects it — and which popular measures are theatre.",
    category: "Security",
    tags: ["security", "validation", "owasp"],
    publishedAt: "2026-11-02",
    readingMinutes: 8,
    answer:
      "Assume anyone can POST to the endpoint. Then make the endpoint safe for anonymous writes: strict size and shape limits, shared rate limits, quota enforcement, no read access from the public path, and storage scoped by ownership rather than by request parameters.",
    blocks: [
      {
        type: "p",
        text: "A contact form endpoint is reachable by the entire internet, including curl. Any security model that depends on the browser behaving is not a security model.",
      },
      { type: "h2", text: "The threat model, briefly" },
      {
        type: "ul",
        items: [
          "Flooding: filling your database or your quota.",
          "Injection: values that break a downstream consumer, spreadsheet or email template.",
          "Enumeration: discovering which form ids exist and are active.",
          "Data exposure: reading submissions through the write path.",
          "Privilege confusion: a viewer of one form reaching another's data.",
        ],
      },
      { type: "h2", text: "What works" },
      {
        type: "ol",
        items: [
          "Body caps enforced while reading, not only from Content-Length.",
          "Field count, name length, value length and nesting depth limits.",
          "Rate limits stored in a shared database, keyed on a trustworthy IP.",
          "Atomic quota checks in the same transaction as the insert.",
          "Write-only public path: no GET, no listing, no ids leaked beyond the caller's own submission.",
          "Authorization on every read derived from the session and the ownership chain, never from a query parameter.",
          "Output encoding everywhere the data is rendered, including CSV exports.",
        ],
      },
      {
        type: "code",
        language: "http",
        title: "Failure responses should not teach an attacker",
        code: `HTTP/1.1 409 Conflict
Content-Type: application/json
Cache-Control: no-store

{ "success": false, "error": { "code": "QUOTA_EXCEEDED", "message": "This form has reached its monthly submission limit." } }`,
      },
      {
        type: "p",
        text: "Note what is absent: no table names, no SQL, no stack trace, no indication of which validation happened first. Errors are for the integrator, not the attacker.",
      },
      { type: "h2", text: "What is theatre" },
      {
        type: "table",
        headers: ["Measure", "Why it does not protect you"],
        rows: [
          ["A secret in the HTML", "It is in the page source; it is a form id with extra steps"],
          ["Hiding the field names", "Bots read the form markup they are about to submit"],
          ["Client-side validation", "Bypassed by one curl command"],
          ["`X-Frame-Options` on the endpoint", "Framing is a page concern, not an API one"],
          ["Obscure endpoints", "Security by URL guessing; logs find them"],
        ],
      },
      { type: "h2", text: "Authorization is a separate system" },
      {
        type: "p",
        text: "Spam protection keeps garbage out; authorization keeps data in. They are enforced in different places. In Formivo, the database has row-level security policies so a workspace member can only select submissions for forms their workspace owns, and a client viewer only for forms they hold an active permission on. The server checks the same rules before querying, because a service-role connection bypasses RLS by design.",
      },
      {
        type: "note",
        title: "The test that catches real bugs",
        text: "Create two accounts, two forms and one submission in each. Then request the other account's submission id with the first account's session. If you get data instead of 404, you have an IDOR, the most common SaaS data leak.",
      },
      { type: "h2", text: "Operational hygiene" },
      {
        type: "ul",
        items: [
          "Log operational signals (rate limit hit counts), not payloads.",
          "Never log raw tokens, emails or message bodies.",
          "Keep audit records for access grants and revocations.",
          "Set retention deliberately; deleted data cannot leak.",
        ],
      },
      {
        type: "p",
        text: "None of this makes an endpoint unhackable. It makes anonymous writes bounded, reads authenticated and cross-tenant access a server-side impossibility rather than a frontend convention.",
      },
    ],
  },
  {
    slug: "share-form-submissions-with-clients",
    title: "How to share form submissions with clients (without sharing your account)",
    seoTitle: "Sharing Form Submissions With Clients: Read-Only Access Done Right",
    description:
      "Why emailing CSV exports and sharing logins both fail, and how per-form read-only access with revocable invitations works in practice.",
    category: "Clients",
    tags: ["clients", "agencies", "access control"],
    publishedAt: "2026-11-04",
    readingMinutes: 6,
    answer:
      "Give each client their own account with read access to only the forms you choose, revocable at any time. Never share your workspace login, and treat emailed CSV files as a leak waiting to happen.",
    blocks: [
      {
        type: "p",
        text: "If you build websites for other people, the submission data is not yours. Your client wants to read their leads; you want to keep control of the platform. Most workflows solve this badly.",
      },
      { type: "h2", text: "The three usual approaches" },
      {
        type: "table",
        headers: ["Approach", "What breaks"],
        rows: [
          [
            "Forward every notification email",
            "No history, no search, and the client cannot log in",
          ],
          [
            "Share your dashboard login",
            "Full access to every client, no audit trail, impossible to revoke",
          ],
          [
            "Email a CSV each month",
            "Stale by the next day, and the file is unencrypted in an inbox",
          ],
        ],
      },
      { type: "h2", text: "Per-form, read-only access" },
      {
        type: "p",
        text: "The alternative is a distinct account type: a client account with no workspace, no billing, and read access only to the specific forms you invite them to. They can see submissions, filter, search and export if your plan allows it, and nothing else exists for them to click.",
      },
      {
        type: "ol",
        items: [
          "You open the form's Clients tab and invite the client's email address.",
          "They receive a single-use link that expires in seven days.",
          "On acceptance, their account is created as a client — never as a developer with a workspace.",
          "They land in a portal listing only their shared forms.",
          "You can revoke the permission at any time; the next request fails immediately.",
        ],
      },
      { type: "h2", text: "What the client can and cannot do" },
      {
        type: "table",
        headers: ["Capability", "Client viewer"],
        rows: [
          ["Read submissions for shared forms", "Yes"],
          ["Filter, search, view a submission", "Yes"],
          ["Export CSV (paid workspace)", "Yes"],
          ["Change lead status", "No"],
          ["Edit the form or its endpoint", "No"],
          ["See other clients' forms", "No"],
          ["Invite anyone", "No"],
        ],
      },
      {
        type: "p",
        text: "Every one of those rows is enforced on the server and mirrored in the database policies, not decided by hiding buttons.",
      },
      { type: "h2", text: "Practical rules for agencies" },
      {
        type: "ul",
        items: [
          "Invite a role address (`leads@client.com`) rather than an individual, so staff changes do not lock you out.",
          "Revoke when a project ends; keep the data, drop the access.",
          "Use one form per purpose, not one form for everything — permissions are per form.",
          "Tell the client what they can export before they ask.",
        ],
      },
      {
        type: "note",
        title: "Revocation is immediate",
        text: "Access checks run per request against the permission row. Revoking writes a timestamp; the next page load or API call is refused, with no session to expire and no cache to purge.",
      },
      {
        type: "p",
        text: "The point is simple: the client gets their data without getting your account. That separation is the difference between a favour and a maintained workflow.",
      },
    ],
  },
  {
    slug: "form-backend-vs-custom-backend",
    title: "Form backend vs building your own endpoint",
    seoTitle: "Hosted Form Backend vs Custom Endpoint: An Honest Comparison",
    description:
      "Cost, control and maintenance compared between a hosted form backend and your own API route — including the cases where building it yourself is the right call.",
    category: "Fundamentals",
    tags: ["architecture", "build vs buy", "comparison"],
    publishedAt: "2026-11-05",
    readingMinutes: 6,
    answer:
      "Build your own when submissions must join internal data or drive business logic. Use a hosted backend when the job is to receive, keep and share form data reliably — the endpoint is ten lines, the surrounding operations are not.",
    blocks: [
      {
        type: "p",
        text: "This is a build-versus-buy decision, and most comparisons are dishonest because they compare a hosted product's price with an imaginary five-minute implementation that never needs maintenance.",
      },
      { type: "h2", text: "What building it yourself really includes" },
      {
        type: "ol",
        items: [
          "The handler: parse three content types, validate, insert, respond.",
          "Rate limiting that works across instances and deployments.",
          "Spam handling, which starts as nothing and becomes a project.",
          "Email delivery: provider, sending domain, SPF/DKIM, bounces.",
          "Storage, retention and deletion requests.",
          "Access control for whoever needs to read the data.",
          "Monitoring, because a silent failure means lost leads.",
        ],
      },
      { type: "h2", text: "Side by side" },
      {
        type: "table",
        headers: ["Dimension", "Hosted form backend", "Your own endpoint"],
        rows: [
          ["Time to first submission", "Minutes", "Hours to days"],
          ["Spam controls", "Included", "You build and tune them"],
          ["Data location", "Vendor", "Your infrastructure"],
          ["Custom logic", "Limited to what the product exposes", "Unlimited"],
          ["Cost model", "Per submissions/plan", "Compute, database, email, on-call"],
          ["Client access", "Usually a product feature", "You build it"],
          ["Failure mode", "Vendor outage", "Your outage"],
        ],
      },
      { type: "h2", text: "When self-hosting wins" },
      {
        type: "ul",
        items: [
          "The submission must create records in your domain model immediately.",
          "You already run the infrastructure and the email pipeline.",
          "Data residency or contractual rules forbid a third party.",
          "The form is internal and has no abuse surface.",
        ],
      },
      { type: "h2", text: "When a hosted backend wins" },
      {
        type: "ul",
        items: [
          "Static sites, landing pages, docs sites and client microsites.",
          "Small teams without on-call, or agencies with dozens of client forms.",
          "Any project where the form is not the product.",
        ],
      },
      { type: "h2", text: "A pragmatic middle path" },
      {
        type: "p",
        text: "Keep your own service as the system of record for business actions, and send the marketing form to a hosted backend first. When a lead matters, forward it to your API with a webhook or a scheduled job. You get the operational safety of the hosted path and the control of your own domain logic.",
      },
      {
        type: "note",
        title: "Migration cost is real",
        text: "Whatever you choose, keep the integration thin: one URL, one payload shape. If moving later requires rewriting frontend components, the architecture was the problem, not the vendor.",
      },
      {
        type: "p",
        text: "Formivo's whole design assumes the endpoint is boring: POST, validate, store, deliver. If you need more than that, you probably need your own service, and that is a legitimate answer, not a lost sale.",
      },
    ],
  },
];

export function postBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export const blogCategories = ["Fundamentals", "Integration", "Security", "Clients"] as const;

export function postsInCategory(category: string): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}

/** Newest first, stable ordering for indexes and sitemaps. */
export const sortedPosts = [...blogPosts].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

export function relatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const scored = sortedPosts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      const sharedTags = candidate.tags.filter((tag) => post.tags.includes(tag)).length;
      const sameCategory = candidate.category === post.category ? 2 : 0;
      return { candidate, score: sharedTags + sameCategory };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((entry) => entry.candidate);
}
