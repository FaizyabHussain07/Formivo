/**
 * Prompt recipes shown right after a form is created and on the integration
 * page. Each one is a real instruction a coding agent can act on: it names the
 * endpoint, the expected payload, the response shape and the constraint that
 * matters (no secret in the browser). Nothing here calls a model itself.
 */

export type PromptTargetId =
  "html" | "react" | "nextjs" | "vue" | "svelte" | "astro" | "javascript" | "php";

export type PromptToolId =
  "claude-code" | "cursor" | "copilot" | "codex" | "opencode" | "antigravity" | "windsurf" | "v0";

export type PromptTarget = {
  id: PromptTargetId;
  name: string;
  /** What the prompt does, in one sentence, shown next to the option. */
  summary: string;
  /** Files or snippets the agent should produce. */
  produces: string;
  /** Language-specific instruction body, endpoint is injected at call time. */
  instructions: (endpoint: string) => string;
};

export type PromptTool = {
  id: PromptToolId;
  name: string;
  /** Short description of the tool, used in the picker. */
  summary: string;
  /** How to address the agent, prepended to the task. */
  lead: (endpoint: string) => string;
};

const RESPONSE_SHAPE = `Successful response (HTTP 201):
{ "success": true, "leadId": "<uuid>", "message": "Submission received." }

Error response (4xx):
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }`;

const RULES = `Rules:
- POST JSON with Content-Type: application/json. Do not send an API key or secret, the endpoint is public by design.
- Read the JSON error body and show its message. Network failures get a generic retry message.
- Disable the submit button while the request is in flight, so double clicks do not send twice.
- Send a stable Idempotency-Key header (a UUID per attempt) if you add retries.
- Keep the existing styling of the site, do not introduce a form library for this.`;

export const PROMPT_TARGETS: PromptTarget[] = [
  {
    id: "html",
    name: "HTML",
    summary: "A plain form that works with JavaScript disabled and without a build step.",
    produces: "a <form> element with a small progressive-enhancement script",
    instructions: (endpoint) => `Task: connect the contact form to this endpoint.

Endpoint: POST ${endpoint}

Build a native form:
<form action="${endpoint}" method="POST"> with inputs name, email, message, each with a matching name attribute and a <label>.
Add a hidden input name="_redirect" pointing at a thank-you page on the same site.
Then add a tiny inline enhancement: intercept submit with fetch, POST JSON, swap the form for a success message in place, and fall back to the native action if JavaScript is unavailable.`,
  },
  {
    id: "react",
    name: "React",
    summary: "Controlled inputs, inline validation and a status message, no form library.",
    produces: "a client component with typed form state and an accessible status region",
    instructions: (endpoint) => `Task: connect the React contact form to this endpoint.

Endpoint: POST ${endpoint}

Write a client component:
- useState for fields (name, email, message), submitting, error, success.
- Validate on submit: name required, email must contain a valid address, message required and under 5000 characters.
- POST JSON to the endpoint with fetch, headers { "Content-Type": "application/json" }.
- Render errors with aria-describedby on each field and role="status" for the result.
- Reset the fields only after a 201.`,
  },
  {
    id: "nextjs",
    name: "Next.js",
    summary: "Server action or route handler that forwards to Formivo, plus a client form.",
    produces: "an app route or server action plus a client form component",
    instructions: (endpoint) => `Task: connect this Next.js App Router form to the endpoint.

Endpoint: POST ${endpoint}

Two steps, App Router conventions only:
1. Add a server-side route handler (app/api/contact/route.ts) that accepts the form payload, forwards it to the endpoint with fetch, and returns the upstream status and JSON. Never expose the endpoint through a browser-only key, and do not log form contents.
2. Add a client form component that posts to /api/contact, shows a spinner while pending, and renders the returned error message. Use the existing useActionState or a plain fetch, whichever the codebase already uses.`,
  },
  {
    id: "vue",
    name: "Vue",
    summary: "A single-file component with v-model bindings and a pending state.",
    produces: "one .vue SFC with script setup",
    instructions: (endpoint) => `Task: connect the Vue contact form to this endpoint.

Endpoint: POST ${endpoint}

Write a single-file component with <script setup>:
- ref() for name, email, message, status and error.
- v-model on the inputs, :disabled on the button while sending.
- submit handler that POSTs JSON to the endpoint and sets a success or error message.
- Keep the existing classes and layout of the page.`,
  },
  {
    id: "svelte",
    name: "Svelte",
    summary: "A Svelte component with bind:value and a reactive error state.",
    produces: "one .svelte file",
    instructions: (endpoint) => `Task: connect the Svelte contact form to this endpoint.

Endpoint: POST ${endpoint}

Write a component:
- let bindings for name, email, message, pending, error, sent.
- bind:value on the inputs and a form on:submit|preventDefault handler.
- fetch POST JSON to the endpoint, then set sent = true or error to the returned message.
- Keep the markup accessible: labels bound to inputs, aria-live on the status message.`,
  },
  {
    id: "astro",
    name: "Astro",
    summary: "Static markup plus a scoped client script, no framework island needed.",
    produces: "an .astro page with a scoped <script>",
    instructions: (endpoint) => `Task: connect the Astro contact form to this endpoint.

Endpoint: POST ${endpoint}

Keep the page static: render the form in .astro markup with action="${endpoint}" method="POST", then add a scoped <script> that intercepts submit, POSTs JSON, and replaces the form with a confirmation without a full reload. Handle the error case by showing the API message above the button.`,
  },
  {
    id: "javascript",
    name: "Vanilla JS",
    summary: "No framework: a form plus a module that posts and renders the result.",
    produces: "an HTML partial and a script module",
    instructions: (
      endpoint,
    ) => `Task: connect a plain HTML form to this endpoint with vanilla JavaScript.

Endpoint: POST ${endpoint}

Write:
- the form markup with name, email and message fields,
- a module that reads FormData, converts it to an object, POSTs JSON, and hands the result to a render function,
- a render function that shows either the success message or the returned error text under the form.`,
  },
  {
    id: "php",
    name: "PHP",
    summary: "Server-side submit through cURL, so the endpoint URL stays out of the page.",
    produces: "a controller or small include that proxies the submission",
    instructions: (endpoint) => `Task: connect this PHP contact form to the endpoint.

Endpoint: POST ${endpoint}

Write a handler that:
- reads $_POST, trims and validates name, email and message,
- forwards the payload with cURL (CURLOPT_POSTFIELDS as a JSON string, Content-Type: application/json),
- checks the HTTP status and decodes the JSON body,
- redirects back with a flash message on success and re-renders the form with the API error message on failure. Never print the endpoint URL or cURL errors to the browser.`,
  },
];

export const PROMPT_TOOLS: PromptTool[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    summary: "Repo-aware agent, edits files directly in the terminal",
    lead: (endpoint) =>
      `Before editing, read the existing form component and the project's styling conventions. Then make the change.

Endpoint for this form: POST ${endpoint}`,
  },
  {
    id: "cursor",
    name: "Cursor",
    summary: "IDE agent with @file context",
    lead: (endpoint) =>
      `Use @Codebase to find the form component and its styles, then apply the change in the editor.

Endpoint for this form: POST ${endpoint}`,
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    summary: "Inline suggestions inside your editor",
    lead: (endpoint) =>
      `In this file, complete the submit handler for the form described below. Match the surrounding code style.

Endpoint for this form: POST ${endpoint}`,
  },
  {
    id: "codex",
    name: "Codex CLI",
    summary: "OpenAI's terminal coding agent",
    lead: (endpoint) =>
      `From the repository root: inspect the form component, make the edits, then typecheck.

Endpoint for this form: POST ${endpoint}`,
  },
  {
    id: "opencode",
    name: "OpenCode",
    summary: "Open-source terminal agent, model agnostic",
    lead: (endpoint) =>
      `Plan the change, list the files you will touch, then apply it.

Endpoint for this form: POST ${endpoint}`,
  },
  {
    id: "antigravity",
    name: "Antigravity",
    summary: "Agent-first IDE with browser verification",
    lead: (endpoint) =>
      `Plan the change, implement it, then open the page in the browser and submit the form once to verify the 201.

Endpoint for this form: POST ${endpoint}`,
  },
  {
    id: "windsurf",
    name: "Windsurf",
    summary: "Cascade agent with multi-file edits",
    lead: (endpoint) =>
      `Find the contact form, then implement the submission flow end to end, including error states.

Endpoint for this form: POST ${endpoint}`,
  },
  {
    id: "v0",
    name: "v0",
    summary: "Generates or updates the UI component",
    lead: (endpoint) =>
      `Update the contact form UI and wire the submission to the endpoint. Keep the existing visual language.

Endpoint for this form: POST ${endpoint}`,
  },
];

export function findPromptTarget(id: string): PromptTarget {
  return PROMPT_TARGETS.find((target) => target.id === id) ?? PROMPT_TARGETS[0]!;
}

export function findPromptTool(id: string): PromptTool {
  return PROMPT_TOOLS.find((tool) => tool.id === id) ?? PROMPT_TOOLS[0]!;
}

/** Full prompt text for a tool and target combination. */
export function buildPrompt({
  toolId,
  targetId,
  endpoint,
  formName,
}: {
  toolId: string;
  targetId: string;
  endpoint: string;
  formName?: string;
}): string {
  const tool = findPromptTool(toolId);
  const target = findPromptTarget(targetId);

  const heading = formName ? `Connect the "${formName}" form` : "Connect the contact form";

  return `${tool.lead(endpoint)}

${heading} in this project using ${target.name}.

${target.instructions(endpoint)}

${RESPONSE_SHAPE}

${RULES}`;
}
