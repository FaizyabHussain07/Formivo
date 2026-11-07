import type { BlogPost } from "../types";

/**
 * Articles published in November 2026. Kept in their own module so the main content
 * file stays readable; `blogPosts` spreads this array.
 *
 * Every statement here is verifiable against the product or the HTTP specification.
 * No benchmarks, adoption numbers or customer stories are invented.
 */
export const novemberPosts: BlogPost[] = [
  {
    slug: "contact-form-on-a-static-site",
    title: "How to add a contact form to a static site",
    seoTitle: "How to Add a Contact Form to a Static Site (Netlify, Vercel, GitHub Pages)",
    description:
      "A static site cannot receive a POST request on its own. Here is the shortest working path: one action attribute, one redirect, one honeypot field.",
    category: "Integration",
    tags: ["static site", "html", "forms", "integration"],
    publishedAt: "2026-11-06",
    readingMinutes: 5,
    answer:
      'A static site has no server, so the form must post to a hosted endpoint. Change the form\'s action to that endpoint, keep method="POST", and the hosting platform never needs to run code.',
    blocks: [
      {
        type: "p",
        text: "Static hosting platforms serve files. They do not execute a script when a visitor submits a form, which is why a contact form is usually the first thing that breaks when a site moves to Netlify, Vercel, Cloudflare Pages or GitHub Pages.",
      },
      {
        type: "p",
        text: "The fix is smaller than most tutorials suggest. Your markup stays static; the request goes somewhere else.",
      },
      { type: "h2", text: "The two attributes that matter" },
      {
        type: "code",
        language: "html",
        title: "Working form, no build step",
        code: `<form action="https://formivo.faizyab.me/api/f/YOUR_FORM_ID" method="POST">
  <label for="email">Email</label>
  <input id="email" type="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" rows="5" required></textarea>

  <button type="submit">Send</button>
</form>`,
      },
      {
        type: "p",
        text: 'Each name attribute becomes a key in the stored submission. A form that omits method defaults to GET, which the endpoint rejects with 405, so method="POST" is not optional.',
      },
      { type: "h2", text: "Send the visitor back to your site" },
      {
        type: "p",
        text: "Without extra configuration the visitor sees a Formivo thank-you page. That works, but it breaks the illusion that the form is part of your site. Add a hidden redirect field to keep them where they were.",
      },
      {
        type: "code",
        language: "html",
        title: "Redirect after success",
        code: `<input type="hidden" name="_redirect" value="https://your-site.com/thanks" />`,
      },
      {
        type: "note",
        title: "Redirect targets are absolute",
        text: "A relative value such as /thanks cannot be resolved by the endpoint, because it does not know your site. Use the full URL, including https://.",
      },
      { type: "h2", text: "Add a honeypot before you publish" },
      {
        type: "p",
        text: "Static forms are scraped within days. A hidden field that people never see but naive bots fill will remove most automated submissions without asking a real visitor to solve anything.",
      },
      {
        type: "code",
        language: "html",
        title: "Honeypot field",
        code: `<div aria-hidden="true" style="position:absolute;left:-9999px">
  <label for="website">Website</label>
  <input id="website" name="_gotcha" type="text" tabindex="-1" autocomplete="off" />
</div>`,
      },
      {
        type: "ul",
        items: [
          "Position the field off screen instead of using display:none, because some bots skip hidden inputs.",
          'Remove it from the tab order with tabindex="-1" and hide the wrapper from screen readers.',
          "Keep the field name exactly _gotcha: the endpoint treats a filled value as a bot and discards the request.",
        ],
      },
      { type: "h2", text: "What about a framework build step?" },
      {
        type: "p",
        text: "Astro, Eleventy, Hugo and Next.js static export all produce HTML in the end. If the page ships a form element, the same two attributes work. A client-side framework only changes whether you also want an inline success message instead of a redirect.",
      },
      {
        type: "table",
        headers: ["Host", "Form works as-is?", "Notes"],
        rows: [
          ["Netlify", "Yes", "Do not enable Netlify Forms for the same form; pick one receiver."],
          ["Vercel", "Yes", "No serverless function is needed for this approach."],
          ["GitHub Pages", "Yes", "Cannot run server code at all, which is fine here."],
          ["Cloudflare Pages", "Yes", "A Pages Function works too, but is not required."],
        ],
      },
      { type: "h2", text: "Checklist before you ship" },
      {
        type: "ol",
        items: [
          "action points at the endpoint and method is POST.",
          "Every input has a label and a meaningful name attribute.",
          "_redirect points at a real page that thanks the visitor.",
          "A honeypot field is present and reachable by bots but not by people.",
          "Submit the form once from the deployed site, not only locally.",
        ],
      },
    ],
  },
  {
    slug: "honeypots-versus-captchas",
    title: "Honeypots versus CAPTCHAs for form spam",
    seoTitle: "Honeypot vs CAPTCHA: Which Stops Form Spam With Less Friction?",
    description:
      "CAPTCHAs ask every visitor to prove they are human. A honeypot asks only the bots. Here is where each one works, and why the strongest setup uses several cheap layers.",
    category: "Security",
    tags: ["spam", "honeypot", "captcha", "forms"],
    publishedAt: "2026-11-03",
    readingMinutes: 6,
    answer:
      "A honeypot is a hidden field that bots fill and people never see, so it costs legitimate visitors nothing. A CAPTCHA challenges every visitor, including people using screen readers or slow connections, so it belongs after cheaper filters, not before them.",
    blocks: [
      {
        type: "p",
        text: "Every contact form eventually receives something that is not a customer. The question is not whether to filter, but what the filter costs the people you actually want to hear from.",
      },
      { type: "h2", text: "What a honeypot actually does" },
      {
        type: "p",
        text: "A honeypot is an input a person cannot see or reach. A generic spam bot fills every field it finds. If the hidden field arrives with a value, the request is dropped.",
      },
      {
        type: "ul",
        items: [
          "Cost to a legitimate visitor: nothing visible.",
          "Cost to you: one hidden input and one server-side check.",
          "Weakness: a bot that reads CSS and skips hidden fields, or a human paid to submit by hand.",
        ],
      },
      {
        type: "p",
        text: "That weakness is why a honeypot is a first filter, not the only filter, and why the field should be hidden with positioning rather than display:none.",
      },
      { type: "h2", text: "What a CAPTCHA costs" },
      {
        type: "p",
        text: "A CAPTCHA interrupts everyone to stop some. The interruption is small on a fast desktop and considerably larger on a slow connection, in a screen reader, or for someone filling the form in a hurry on a phone.",
      },
      {
        type: "p",
        text: "There are cases where that trade is right: a public form that is being flooded right now, or a sign-up that creates a costly resource. It is rarely right as the first and only defence on a contact form.",
      },
      { type: "h2", text: "Layers, cheapest first" },
      {
        type: "ol",
        items: [
          "Server-side validation: reject malformed bodies before anything else runs.",
          "Honeypot: drop obvious automation for free.",
          "Rate limits: cap per form, per IP and per form per IP, so a flood cannot finish.",
          "Origin rules: refuse browser requests from sites you did not authorise.",
          "Quota: cap what one workspace can store per month.",
          "CAPTCHA: add it only if the layers above are still not enough.",
        ],
      },
      {
        type: "p",
        text: "Formivo implements the first five on every plan. The sixth is a decision for your own form, because it runs on your page.",
      },
      { type: "h2", text: "What not to do" },
      {
        type: "ul",
        items: [
          "Do not block an entire IP range because one address misbehaved: offices, schools and mobile carriers share addresses.",
          "Do not silently delete suspicious submissions without a record, because you will eventually delete a real lead.",
          "Do not publish your filtering rules in a visible error message; it teaches the next bot how to pass.",
        ],
      },
      {
        type: "note",
        title: "Measure before adding friction",
        text: "If the spam you receive is a handful of rows per week, a honeypot and rate limits are enough. Add a CAPTCHA when the volume is actually hurting, not because a checklist said so.",
      },
      { type: "h2", text: "A practical default" },
      {
        type: "p",
        text: "Honeypot on, rate limits untouched, allowed domains set to the sites you own, monthly quota reviewed when a form gets attention. That combination costs visitors nothing and removes the bulk of automated submissions.",
      },
    ],
  },
  {
    slug: "form-dashboard-for-clients",
    title: "What a client should see in a form dashboard",
    seoTitle: "Sharing Form Submissions With Clients Without Sharing Your Account",
    description:
      "Sending a CSV every Friday is not a client portal. Here is the access model that works: one permission per form, read-only by default, revocable in one click.",
    category: "Clients",
    tags: ["client portal", "access", "agencies", "permissions"],
    publishedAt: "2026-10-30",
    readingMinutes: 5,
    answer:
      "A client should see the submissions of the forms you explicitly shared, read-only, and nothing else: no other clients, no workspace settings, no billing. Access should be one revocable permission per form rather than a shared login.",
    blocks: [
      {
        type: "p",
        text: "Agencies usually start by emailing a spreadsheet. It works for one client and one form. By the fourth client it becomes a weekly copy, paste and accidental-recipient problem.",
      },
      { type: "h2", text: "Three models, three failure modes" },
      {
        type: "table",
        headers: ["Model", "What breaks"],
        rows: [
          [
            "Shared login",
            "You cannot revoke one person, and every action looks like the same user.",
          ],
          [
            "CSV by email",
            "The data lives in inboxes forever, outside any retention or deletion policy.",
          ],
          [
            "Per-form permission",
            "Requires a real access model, which is exactly why it holds up.",
          ],
        ],
      },
      { type: "h2", text: "What the client portal should contain" },
      {
        type: "ul",
        items: [
          "The forms shared with them, and only those.",
          "Read access to submissions, with the timestamp and values.",
          "A clear empty state before their first form is shared.",
          "No editing, no deleting, no invitations: one owner of the data.",
        ],
      },
      {
        type: "p",
        text: "Read-only is not a limitation to apologise for. It keeps one person responsible for lead status, which is what prevents two people from marking the same lead contacted and losing track of it.",
      },
      { type: "h2", text: "Why the permission must be a row" },
      {
        type: "p",
        text: "A link with a token is easy to build and hard to control: it gets forwarded, bookmarked and pasted into a group chat. A permission row ties access to an authenticated account, so revoking it takes effect immediately, including for a session that is already open.",
      },
      {
        type: "code",
        language: "text",
        title: "The shape that survives an audit",
        code: `permission(id, form_id, client_user_id, granted_at, revoked_at)

revoked_at IS NULL  ->  access granted now
revoked_at IS SET   ->  access gone, row kept for history`,
      },
      { type: "h2", text: "Onboarding a client in practice" },
      {
        type: "ol",
        items: [
          "Create the form and confirm it receives a real submission.",
          "Invite the client by the address they actually use, not a guess.",
          "Let the invitation link create their account; do not send them through developer signup.",
          "Ask them to open the portal and confirm they see the form.",
          "When the engagement ends, revoke the permission instead of deleting the account.",
        ],
      },
      {
        type: "note",
        title: "One address, one identity",
        text: "If a client already has an account under a different address, the invitation belongs to a different user. Revoke it and invite the address they sign in with.",
      },
      { type: "h2", text: "What to keep for yourself" },
      {
        type: "p",
        text: "Notifications, status changes, exports and the ability to invite further viewers stay with the workspace owner. That split lets you hand over visibility without handing over control.",
      },
    ],
  },
  {
    slug: "stop-duplicate-form-submissions",
    title: "How to stop duplicate form submissions",
    seoTitle: "Duplicate Form Submissions: Double Clicks, Retries and Idempotency Keys",
    description:
      "Duplicates come from three places: a double click, a retried request after a timeout, and a refreshed thank-you page. Each needs a different fix.",
    category: "Integration",
    tags: ["idempotency", "reliability", "forms", "javascript"],
    publishedAt: "2026-10-27",
    readingMinutes: 5,
    answer:
      "Disable the submit button to stop double clicks, and send a stable Idempotency-Key header so a retried request returns the original result instead of creating a second submission. A refreshed thank-you page needs a redirect after POST, not another request.",
    blocks: [
      {
        type: "p",
        text: "Two identical leads in a dashboard look like a spam problem. They are usually three separate reliability problems wearing the same clothes.",
      },
      { type: "h2", text: "Cause one: the double click" },
      {
        type: "p",
        text: "A slow response invites a second click. The fix is in the UI: disable the button when the submit handler starts and re-enable it only after a failure.",
      },
      {
        type: "code",
        language: "javascript",
        title: "Disable while pending",
        code: `form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;

  try {
    await send();
  } finally {
    button.disabled = false;
  }
});`,
      },
      { type: "h2", text: "Cause two: the retry after a timeout" },
      {
        type: "p",
        text: "A request can succeed on the server and still fail on the client, for example when the network drops before the response arrives. Retrying is correct behaviour, but without a key it creates a duplicate.",
      },
      {
        type: "code",
        language: "javascript",
        title: "One key per logical submission",
        code: `const idempotencyKey = crypto.randomUUID();

async function send(values) {
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey, // reused across retries
    },
    body: JSON.stringify(values),
  });
}`,
      },
      {
        type: "note",
        title: "Generate the key once",
        text: "A key created inside the retry loop is a new key on every attempt, which defeats the purpose. Create it when the visitor starts the submission, then reuse it until that submission is finished.",
      },
      { type: "h2", text: "Cause three: the refresh" },
      {
        type: "p",
        text: "If a successful POST renders a page directly, pressing refresh re-sends the request. The standard answer is the same one the web has used for decades: redirect after a successful POST, so the browser's last request is a GET.",
      },
      {
        type: "ul",
        items: [
          "Native form: set _redirect so the visitor lands on a plain page.",
          "JavaScript: replace the form with a success state instead of navigating.",
          "Framework: redirect from the action once it succeeds.",
        ],
      },
      { type: "h2", text: "What deduplication cannot fix" },
      {
        type: "p",
        text: "Two genuinely different visitors with the same values are two leads. Formivo does not merge submissions by content, because that would silently discard real ones. It only guarantees that one retried request does not become two rows.",
      },
      {
        type: "table",
        headers: ["Symptom", "Cause", "Fix"],
        rows: [
          ["Two rows, same values, same second", "Double click", "Disable the button"],
          ["Two rows minutes apart", "Retry without a key", "Idempotency-Key"],
          ["New row on refresh", "Rendered response", "Redirect after POST"],
        ],
      },
    ],
  },
  {
    slug: "form-data-model",
    title: "A form submission data model that ages well",
    seoTitle: "Designing a Form Submission Schema: What to Store and What to Leave Out",
    description:
      "Most form schemas start as a column per field and end as a migration every time marketing changes a question. Here is the shape that avoids that, and the fields to never store.",
    category: "Fundamentals",
    tags: ["data model", "schema", "privacy", "forms"],
    publishedAt: "2026-10-22",
    readingMinutes: 6,
    answer:
      "Store the form's answers as a structured object, keep provenance such as page and campaign in a separate metadata object, and keep ownership, status and timestamps as real columns. That keeps queries simple without requiring a migration for every new question.",
    blocks: [
      {
        type: "p",
        text: "The first version of every form schema is one column per field. It reads beautifully until marketing renames a question, adds a dropdown, or removes a field that three reports still reference.",
      },
      { type: "h2", text: "The two-part split" },
      {
        type: "p",
        text: "Separate the answers from the context. Answers belong to the form and change when the form changes. Context belongs to the request and changes per visit.",
      },
      {
        type: "code",
        language: "json",
        title: "One submission, two concerns",
        code: `{
  "data": {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "message": "Please call me back."
  },
  "metadata": {
    "page": "/contact",
    "campaign": "spring"
  }
}`,
      },
      {
        type: "p",
        text: "With this split, adding a question touches nothing structural: the new key simply appears in data. Reporting on traffic source queries metadata, which never collides with a field a form owner named identical to a system concern.",
      },
      { type: "h2", text: "What must stay a column" },
      {
        type: "ul",
        items: [
          "Ownership: workspace and form id, set by the server, never by the payload.",
          "Time: created_at, because ordering and retention depend on it.",
          "Workflow: status, so filtering does not require parsing arbitrary content.",
          "Deduplication: the idempotency key, scoped to the form.",
        ],
      },
      { type: "h2", text: "The rules that protect the object" },
      {
        type: "ol",
        items: [
          "Cap the body at 256 KB so a single submission cannot become a storage problem.",
          "Cap the number of fields and the nesting depth, so a nested object cannot become a slow query.",
          "Accept only scalar values: strings, numbers and booleans. Files are links, not payloads.",
          "Reject unknown ownership keys outright instead of ignoring them quietly.",
        ],
      },
      {
        type: "note",
        title: "Reserved names",
        text: "Fields starting with an underscore (_redirect, _gotcha) control behaviour and are never stored as answers. Document that convention so nobody tries to collect a value called _redirect.",
      },
      { type: "h2", text: "What not to store" },
      {
        type: "p",
        text: "A form is not a vault. Card numbers, passwords, government identifiers and medical details do not belong in a contact form, whatever the schema looks like. If a question needs that data, it needs a purpose-built system with its own compliance story.",
      },
      {
        type: "ul",
        items: [
          "Never store what you cannot justify keeping for a stated period.",
          "Never log full submission bodies to an application log; logs outlive the data policy.",
          "Never copy a lead into a second system without a deletion path.",
        ],
      },
      { type: "h2", text: "Retention is part of the model" },
      {
        type: "p",
        text: "A schema without a retention decision becomes an archive. Decide how long a submission is useful, and delete on that schedule rather than on the day someone remembers to ask.",
      },
      {
        type: "p",
        text: "The practical test of a good model: you can add a question tomorrow without a migration, you can answer where a lead came from without joining three tables, and you can delete one submission completely without hunting through copies.",
      },
    ],
  },
];
