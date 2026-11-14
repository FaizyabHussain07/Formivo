import type { Guide } from "./types";

/**
 * Integration guides. Every snippet targets the same public endpoint:
 * POST https://formivo.faizyab.me/api/f/{formId}
 * JSON returns 201 { success: true, leadId }; native form posts return an HTML page.
 */
const ENDPOINT = "https://formivo.faizyab.me/api/f/YOUR_FORM_ID";

export const guides: Guide[] = [
  {
    slug: "html",
    language: "HTML",
    title: "HTML form backend",
    seoTitle: "HTML Form Backend: Post an Existing Form to Formivo",
    description:
      "Point any HTML form at a Formivo endpoint with two attributes, then choose between a built-in confirmation page and your own redirect.",
    summary:
      "The shortest integration: change the form's action and method. No JavaScript, no key in the markup.",
    requirements: ["A form in your HTML", "A form id from the Formivo dashboard"],
    steps: [
      "Create a form in Formivo and copy its endpoint.",
      'Set the form\'s action to the endpoint and keep method="POST".',
      "Name every field; the names become the submission's keys.",
      "Add `_redirect` if you want the visitor to land on your own page.",
    ],
    code: `<form action="${ENDPOINT}" method="POST">
  <label for="name">Name</label>
  <input id="name" name="name" required />

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" rows="5"></textarea>

  <!-- optional: send the visitor here afterwards -->
  <input type="hidden" name="_redirect" value="https://your-site.com/thank-you" />

  <button type="submit">Send</button>
</form>`,
    response:
      "Without `_redirect` the visitor gets a branded confirmation page (200). With it, a 303 redirect to your URL. Errors return an HTML page explaining what to fix.",
    troubleshooting: [
      {
        problem: "Submissions never arrive",
        fix: 'The form is missing method="POST", so the browser sends GET.',
      },
      {
        problem: "413 Payload Too Large",
        fix: "The body exceeds 256 KB; remove large hidden fields.",
      },
      {
        problem: "415 Unsupported Media Type",
        fix: "Use the default enctype or multipart/form-data; text/plain is rejected.",
      },
      {
        problem: "403 Forbidden",
        fix: "The form has an origin allow-list and your site is not on it.",
      },
    ],
    related: ["javascript", "react", "nextjs"],
  },
  {
    slug: "javascript",
    language: "JavaScript",
    title: "JavaScript form backend",
    seoTitle: "Submit a Form With JavaScript fetch() to a Formivo Endpoint",
    description:
      "Send JSON with fetch, handle 201, 409 and 429 correctly, and keep the form usable while the request is in flight.",
    summary:
      "Fetch the endpoint with JSON, read the structured error body, and disable the button only while the request is running.",
    requirements: ["Any page with a form", "A form id"],
    steps: [
      "Intercept the submit event and prevent the default navigation.",
      "Post FormData as JSON with Accept: application/json.",
      "Show success or the server's error message in an aria-live region.",
      "Re-enable the button in a finally block.",
    ],
    code: `const form = document.querySelector("form");
const status = document.querySelector("[data-status]");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  status.textContent = "Sending…";

  try {
    const response = await fetch("${ENDPOINT}", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // one key per form fill: retries never create a duplicate lead
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });

    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message ?? "Submission failed");

    form.reset();
    status.textContent = "Thanks. Your message was sent.";
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});`,
    response:
      "201 with { success: true, leadId } on create, 200 when an idempotency key replays, 409 for a paused form or exhausted quota, 429 with Retry-After.",
    troubleshooting: [
      {
        problem: "CORS error in the console",
        fix: "The form's origin allow-list does not include your site.",
      },
      {
        problem: "Duplicate leads",
        fix: "Disable the button during the request and send an Idempotency-Key.",
      },
      {
        problem: "response.json() throws",
        fix: "A redirect was followed; do not send `_redirect` with fetch.",
      },
    ],
    related: ["html", "react", "vue"],
  },
  {
    slug: "react",
    language: "React",
    title: "React form backend",
    seoTitle: "React Form Submission: fetch, Validation and Error States",
    description:
      "A production-shaped React form: uncontrolled inputs, submit-time validation, a real POST and accessible feedback.",
    summary:
      "Read FormData on submit, validate once for feedback, post JSON, render a status message.",
    requirements: ["React 18+", "A form id"],
    steps: [
      "Keep inputs uncontrolled unless a value drives rendering.",
      "Capture event.currentTarget before awaiting.",
      "Post JSON and branch on response.ok.",
      'Announce errors with role="alert".',
    ],
    code: `import { useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    setState("sending");

    const response = await fetch("${ENDPOINT}", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      return;
    }
    form.reset();
    setState("sent");
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
      <button disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send"}
      </button>
      {state === "sent" && <p role="status">Thanks. We will reply shortly.</p>}
      {state === "error" && <p role="alert">Could not send. Please try again.</p>}
    </form>
  );
}`,
    response: "201 on success. Treat any non-2xx as a failure and keep the entered values.",
    troubleshooting: [
      { problem: "Values disappear", fix: "You reset the form before the request finished." },
      {
        problem: "Stale event in React 17+",
        fix: "Use event.currentTarget, captured before the first await.",
      },
    ],
    related: ["nextjs", "javascript", "html"],
  },
  {
    slug: "nextjs",
    language: "Next.js",
    title: "Next.js form backend",
    seoTitle: "Next.js App Router Form Submission (Server Action or fetch)",
    description:
      "Three App Router patterns for forms: plain HTML action, client fetch, and a server action that forwards to Formivo.",
    summary:
      "Server actions keep the endpoint server-side; client fetch keeps the visitor on the page.",
    requirements: ["Next.js App Router", "A form id"],
    steps: [
      "Marketing page: use a plain HTML form with the endpoint as action.",
      "App page: client component with fetch and a status state.",
      "Server action: forward FormData server-side when you need to enrich it.",
    ],
    code: `// app/contact/actions.ts
"use server";

export async function sendContact(formData: FormData) {
  const response = await fetch("${ENDPOINT}", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(Object.fromEntries(formData)),
  });
  return { ok: response.ok };
}

// app/contact/page.tsx
import { sendContact } from "./actions";

export default function ContactPage() {
  async function action(formData: FormData) {
    "use server";
    await sendContact(formData);
  }

  return (
    <form action={action}>
      <input name="email" type="email" required aria-label="Email" />
      <button type="submit">Send</button>
    </form>
  );
}`,
    response:
      "Server actions return whatever you return; the endpoint itself answers 201 or an error code.",
    troubleshooting: [
      {
        problem: "Hydration error after submitting",
        fix: "Do not return JSX from an action; return data and render it.",
      },
      {
        problem: "Endpoint exposed in the bundle",
        fix: "Use a server action; NEXT_PUBLIC_ variables are public.",
      },
    ],
    related: ["react", "node", "html"],
  },
  {
    slug: "vue",
    language: "Vue",
    title: "Vue form backend",
    seoTitle: "Vue 3 Form Submission to a Hosted Backend",
    description: "A Vue 3 Script Setup form with fetch, loading state and inline error handling.",
    summary:
      "Bind inputs, post JSON on submit, and keep the Submit button disabled only during the request.",
    requirements: ["Vue 3", "A form id"],
    steps: [
      "Use v-model for the fields you want reactive.",
      "Post JSON from the submit handler.",
      "Store the result in a ref and render it.",
    ],
    code: `<script setup lang="ts">
import { ref } from "vue";

const email = ref("");
const message = ref("");
const state = ref<"idle" | "sending" | "sent" | "error">("idle");

async function submit() {
  state.value = "sending";
  const response = await fetch("${ENDPOINT}", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: email.value, message: message.value }),
  }).catch(() => null);

  state.value = response?.ok ? "sent" : "error";
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="email" type="email" required aria-label="Email" />
    <textarea v-model="message" aria-label="Message" />
    <button :disabled="state === 'sending'">
      {{ state === "sending" ? "Sending…" : "Send" }}
    </button>
    <p v-if="state === 'error'" role="alert">Could not send.</p>
  </form>
</template>`,
    response: "201 with { success, leadId }; branch on response.ok, not on the presence of a body.",
    troubleshooting: [
      { problem: "Page reloads on submit", fix: "Add @submit.prevent." },
      {
        problem: "Empty payload",
        fix: "v-model needs a matching name only if you submit FormData.",
      },
    ],
    related: ["nuxt", "javascript", "react"],
  },
  {
    slug: "nuxt",
    language: "Nuxt",
    title: "Nuxt form backend",
    seoTitle: "Nuxt 3 Form Submission With useFetch or $fetch",
    description:
      "Submit a Nuxt 3 form from the client, or proxy through a server route to keep the endpoint private.",
    summary: "either $fetch from the component or a Nitro server route that forwards the payload.",
    requirements: ["Nuxt 3", "A form id"],
    steps: [
      "Client-only: call $fetch with method POST inside a submit handler.",
      "Server: create server/api/contact.post.ts and forward the body.",
      "Return a small JSON result and render it in the component.",
    ],
    code: `// server/api/contact.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const response = await $fetch.raw("${ENDPOINT}", {
    method: "POST",
    headers: { Accept: "application/json" },
    body,
  });
  return { ok: response.status === 201 };
});

// components/ContactForm.vue
async function submit() {
  const result = await $fetch("/api/contact", { method: "POST", body: { email, message } });
  state.value = result.ok ? "sent" : "error";
}`,
    response:
      "The Nitro route returns your own shape; the upstream endpoint answers 201 or an error.",
    troubleshooting: [
      { problem: "CORS error", fix: "Call the Nitro route instead of the endpoint directly." },
      { problem: "Body is undefined", fix: "Use readBody(event) in the server route." },
    ],
    related: ["vue", "node", "javascript"],
  },
  {
    slug: "php",
    language: "PHP",
    title: "PHP form backend",
    seoTitle: "PHP Contact Form Without a Database (Hosted Endpoint)",
    description:
      "Point a classic PHP-served HTML form at Formivo, or forward it server-side with cURL if you need to enrich the payload.",
    summary: "The simplest path is a normal HTML form; server-side forwarding needs one cURL call.",
    requirements: ["PHP 8+", "A form id"],
    steps: [
      "Keep the form in your PHP template and set its action to the endpoint.",
      "Or post server-side with cURL when you must add fields.",
      "Never put a private API key in the HTML.",
    ],
    code: `<?php
$payload = json_encode([
  "name" => $_POST["name"] ?? "",
  "email" => $_POST["email"] ?? "",
  "message" => $_POST["message"] ?? "",
]);

$ch = curl_init("${ENDPOINT}");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => $payload,
  CURLOPT_HTTPHEADER => ["Content-Type: application/json", "Accept: application/json"],
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 10,
]);

$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status !== 201) {
  http_response_code(502);
  echo "Could not send your message.";
  exit;
}

header("Location: /thank-you", true, 303);
exit;`,
    response: "201 on success. Treat anything else as a failure and show a human message.",
    troubleshooting: [
      { problem: "curl_exec returns false", fix: "Check TLS support and outbound network access." },
      {
        problem: "Emails arrive empty",
        fix: "Verify $_POST keys match your form's name attributes.",
      },
    ],
    related: ["laravel", "html", "javascript"],
  },
  {
    slug: "laravel",
    language: "Laravel",
    title: "Laravel form backend",
    seoTitle: "Laravel Form Submission With Http::post to a Formivo Endpoint",
    description:
      "Use Laravel's HTTP client in a controller, validate with a FormRequest, and forward to Formivo.",
    summary: "Validate in Laravel, then Http::post the payload and branch on successful().",
    requirements: ["Laravel 10+", "A form id"],
    steps: [
      "Create a FormRequest for validation.",
      "Post with Http::acceptJson()->post().",
      "Return back() with a status message.",
    ],
    code: `// app/Http/Controllers/ContactController.php
public function store(ContactRequest $request)
{
    $response = Http::acceptJson()
        ->timeout(10)
        ->post('${ENDPOINT}', $request->validated());

    if (! $response->successful()) {
        return back()->withErrors(['contact' => 'Could not send your message.']);
    }

    return back()->with('status', 'Thanks. Your message was sent.');
}`,
    response: "201 on success. Log the response body on failure, but never the full payload.",
    troubleshooting: [
      { problem: "419 Page Expired", fix: "Include @csrf in the form." },
      {
        problem: "Timeout",
        fix: "Raise the timeout slightly and queue the call if latency matters.",
      },
    ],
    related: ["php", "node", "html"],
  },
  {
    slug: "node",
    language: "Node.js",
    title: "Node.js form backend",
    seoTitle: "Node.js Form Submission With the Native fetch API",
    description:
      "Forward form data from a Node 18+ server to Formivo with fetch, including timeouts and error handling.",
    summary: "Native fetch, AbortSignal.timeout for a hard deadline, and a status check.",
    requirements: ["Node 18+", "A form id"],
    steps: ["Collect the payload", "Post JSON with a timeout", "Branch on response.ok"],
    code: `export async function submitContact(payload) {
  const response = await fetch("${ENDPOINT}", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  }).catch((error) => ({ ok: false, error }));

  if (!response.ok) {
    throw new Error("Contact submission failed");
  }

  return response.json(); // { success: true, leadId }
}`,
    response: "201 with { success: true, leadId }; 429 includes Retry-After.",
    troubleshooting: [
      { problem: "fetch is not defined", fix: "Upgrade to Node 18+ or use undici." },
      { problem: "Request hangs", fix: "Pass an AbortSignal; there is no default timeout." },
    ],
    related: ["express", "javascript", "nextjs"],
  },
  {
    slug: "express",
    language: "Express",
    title: "Express form backend",
    seoTitle: "Express Contact Form Endpoint That Forwards to Formivo",
    description:
      "An Express route that accepts a form post, validates a couple of fields, and forwards it upstream.",
    summary: "One route, express.json(), a minimum of validation, and an upstream POST.",
    requirements: ["Express 4+", "Node 18+", "A form id"],
    steps: [
      "Enable express.json() with a small limit.",
      "Validate required fields before forwarding.",
      "Forward and map failures to a 502.",
    ],
    code: `import express from "express";

const app = express();
app.use(express.json({ limit: "32kb" }));

app.post("/contact", async (request, response) => {
  const { email, message } = request.body ?? {};
  if (typeof email !== "string" || typeof message !== "string") {
    return response.status(400).json({ error: "Missing fields" });
  }

  const upstream = await fetch("${ENDPOINT}", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, message }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!upstream?.ok) {
    return response.status(502).json({ error: "Could not send" });
  }
  return response.status(201).json({ ok: true });
});`,
    response: "Your route returns 201; the upstream result is what you check.",
    troubleshooting: [
      { problem: "request.body is undefined", fix: "express.json() must run before the route." },
      {
        problem: "Large payload errors",
        fix: "Keep the JSON limit at 32kb and validate field lengths.",
      },
    ],
    related: ["node", "javascript", "php"],
  },
  {
    slug: "python",
    language: "Python",
    title: "Python form backend",
    seoTitle: "Python POST Form Data to a Formivo Endpoint (requests)",
    description:
      "Forward form submissions from Python with requests, including timeouts and status checks.",
    summary: "requests.post with a timeout, then raise_for_status and read the JSON.",
    requirements: ["Python 3.9+", "The requests package", "A form id"],
    steps: ["Build a dict", "Post with a timeout", "Check the status code"],
    code: `import requests

def submit_contact(name: str, email: str, message: str) -> dict:
    response = requests.post(
        "${ENDPOINT}",
        json={"name": name, "email": email, "message": message},
        headers={"Accept": "application/json"},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()  # {"success": True, "leadId": "..."}`,
    response: "201 with the new submission id. 429 responses include Retry-After.",
    troubleshooting: [
      { problem: "SSLError", fix: "Update certifi; some corporate proxies break TLS chains." },
      {
        problem: "Timeout",
        fix: "Keep the timeout at 10s and retry once with an idempotency key.",
      },
    ],
    related: ["django", "flask", "node"],
  },
  {
    slug: "django",
    language: "Django",
    title: "Django form backend",
    seoTitle: "Django Form Submission Forwarded to a Hosted Backend",
    description: "Validate with a Django Form, then forward the cleaned data and render a message.",
    summary: "Use a Django Form for validation and requests for the upstream call.",
    requirements: ["Django 4+", "requests", "A form id"],
    steps: [
      "Define a Form with the fields you accept.",
      "In the view, validate and post cleaned_data.",
      "Render the status in the template.",
    ],
    code: `import requests
from django import forms
from django.shortcuts import render

class ContactForm(forms.Form):
    name = forms.CharField(max_length=100)
    email = forms.EmailField()
    message = forms.CharField(widget=forms.Textarea)

def contact(request):
    status = None
    form = ContactForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        response = requests.post(
            "${ENDPOINT}",
            json=form.cleaned_data,
            headers={"Accept": "application/json"},
            timeout=10,
        )
        status = "sent" if response.status_code == 201 else "error"

    return render(request, "contact.html", {"form": form, "status": status})`,
    response: "201 on create; anything else should show a retry message.",
    troubleshooting: [
      { problem: "CSRF failure", fix: "Include {% csrf_token %} in the template form." },
      {
        problem: "500 on submit",
        fix: "Wrap the request in try/except requests.RequestException.",
      },
    ],
    related: ["python", "flask", "php"],
  },
  {
    slug: "flask",
    language: "Flask",
    title: "Flask form backend",
    seoTitle: "Flask Contact Form That Forwards to Formivo",
    description: "A minimal Flask route with server-side validation and an upstream POST.",
    summary: "request.form → validation → requests.post → flash a message.",
    requirements: ["Flask 3+", "requests", "A form id"],
    steps: [
      "Read request.form",
      "Validate the required fields",
      "Post to the endpoint and flash the result",
    ],
    code: `import requests
from flask import Flask, flash, redirect, render_template, request

app = Flask(__name__)
app.secret_key = "change-me"

@app.post("/contact")
def contact():
    payload = {
        "name": request.form.get("name", "").strip(),
        "email": request.form.get("email", "").strip(),
        "message": request.form.get("message", "").strip(),
    }

    if not payload["email"] or not payload["message"]:
        flash("Email and message are required.")
        return redirect("/contact")

    response = requests.post(
        "${ENDPOINT}",
        json=payload,
        headers={"Accept": "application/json"},
        timeout=10,
    )

    flash("Thanks. Your message was sent." if response.status_code == 201 else "Could not send.")
    return redirect("/contact")`,
    response: "201 on success. Redirect back with a flash message, never render the raw response.",
    troubleshooting: [
      {
        problem: "413 in front of Flask",
        fix: "Raise MAX_CONTENT_LENGTH deliberately, not blindly.",
      },
      { problem: "No flash message", fix: "A secret_key must be set for sessions." },
    ],
    related: ["python", "django", "html"],
  },
  {
    slug: "static",
    language: "Static sites",
    title: "Static site form backend",
    seoTitle: "Adding a Contact Form to a Static Site (Astro, Hugo, Eleventy)",
    description:
      "Static sites cannot process forms, so the endpoint does the work. Choose between a native HTML post and a small fetch script.",
    summary: "Use the native form action. There is no build step, framework or key involved.",
    requirements: ["Any static output", "A form id"],
    steps: [
      "Add the form to your template with the endpoint as action.",
      "Keep required attributes and labels for accessibility.",
      "Deploy; no rebuild is needed when the endpoint changes.",
    ],
    code: `<!-- works in Astro, Hugo, Eleventy, plain HTML -->
<form action="${ENDPOINT}" method="POST">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
</form>`,
    response: "The browser navigates to a confirmation page, or to your `_redirect` URL.",
    troubleshooting: [
      {
        problem: "Form does nothing on Netlify",
        fix: "Remove netlify attributes; the action must point at Formivo.",
      },
      {
        problem: "Build fails on your host",
        fix: "Nothing to build. The endpoint is plain HTML.",
      },
    ],
    related: ["html", "javascript", "nextjs"],
  },
];

export function guideBySlug(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
