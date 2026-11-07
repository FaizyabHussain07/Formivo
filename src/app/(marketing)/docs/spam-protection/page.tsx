import { Alert } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { DocPageLayout, DocProse, DocSection, DocSubHeading } from "@/components/docs/doc-page";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "Spam protection",
  description:
    "The protections that run on every submission: server-side validation, honeypot fields, per-form and per-IP rate limits, allowed domains and plan quotas.",
  path: "/docs/spam-protection",
});

const honeypot = `<div aria-hidden="true" style="position:absolute;left:-9999px;top:auto">
  <label for="website">Website</label>
  <input id="website" name="_gotcha" type="text" tabindex="-1" autocomplete="off" />
</div>`;

const tokenField = `<input type="hidden" name="metadata" value='{"variant":"footer"}' />`;

export default function Page() {
  return (
    <DocPageLayout
      href="/docs/spam-protection"
      title="Spam protection"
      badge="Every plan"
      description="Formivo rejects abuse at the endpoint, before anything reaches your dashboard. These are the layers that actually run, and how to tune them."
    >
      <DocSection id="layers" title="The layers that run">
        <DocProse>
          <p>Each request passes through the same checks in this order:</p>
        </DocProse>
        <div className="flex flex-col gap-3">
          {[
            [
              "Payload validation",
              "JSON or form-encoded parsing, 256 KB limit, at most 100 fields, at most 5 levels of nesting, and only scalar values. Anything else is a 400.",
            ],
            [
              "Honeypot",
              "A filled _gotcha field is treated as an automated submission and discarded without being stored.",
            ],
            [
              "Allowed domains",
              "If a form lists domains, a browser request that declares a different Origin is rejected.",
            ],
            [
              "Rate limits",
              "Per form, per IP, and per form plus IP. A limited request returns 429 with Retry-After.",
            ],
            [
              "Plan quota",
              "The monthly allowance is reserved atomically, so concurrent requests cannot exceed it.",
            ],
            ["Form state", "A paused form returns 409 instead of storing anything."],
          ].map(([title, body], index) => (
            <div key={title} className="flex gap-3 rounded-xl border border-border bg-surface p-4">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle font-mono text-xs font-semibold text-accent">
                {index + 1}
              </span>
              <span className="text-sm text-foreground-secondary">
                <strong className="text-foreground">{title}.</strong> {body}
              </span>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="honeypot" title="Add a honeypot">
        <DocProse>
          <p>
            This is the highest-value change you can make, and it costs one hidden input. Real
            visitors never see it; simple bots fill every field they find.
          </p>
        </DocProse>
        <CodeBlock title="HTML" language="html" code={honeypot} />
        <Alert tone="info" title="Hide it from people, not from bots">
          Use positioning, not <code className="font-mono text-xs">display:none</code>: some bots
          skip hidden inputs. Keep it out of the tab order with{" "}
          <code className="font-mono text-xs">tabindex=&quot;-1&quot;</code> and mark the wrapper{" "}
          <code className="font-mono text-xs">aria-hidden</code> so screen readers ignore it.
        </Alert>
      </DocSection>

      <DocSection id="limits" title="Understand the rate limits">
        <DocProse>
          <p>
            Limits apply to the endpoint, not to accounts, so they also protect a form whose URL has
            been scraped. The per-form and per-IP limits are independent: a busy shared office
            network hits the IP limit, while a targeted flood hits the form limit.
          </p>
        </DocProse>
        <ul className="flex flex-col gap-2 text-sm text-foreground-secondary">
          {[
            "120 requests per minute per form.",
            "60 requests per minute per IP address, shared across every form.",
            "30 requests per minute for one form from one IP address.",
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
              />
              {item}
            </li>
          ))}
        </ul>
        <DocProse>
          <p>
            When a legitimate user is caught by a limit, show them the{" "}
            <code className="font-mono text-xs">Retry-After</code> value instead of a generic
            failure. A short &quot;try again in a moment&quot; beats a form that appears broken.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="domains" title="Restrict browser origins">
        <DocProse>
          <p>
            Listing your production domains in the form&apos;s Integration tab means a copy of your
            form hosted elsewhere is rejected when it declares its own origin. This is a
            browser-side control, not authentication: a script outside a browser can omit the header
            entirely.
          </p>
        </DocProse>
        <Alert tone="warning" title="Never rely on Origin alone">
          Server-side validation, rate limits and quotas are what protect the data. Origin rules
          reduce low-effort reuse of your endpoint; they do not prove who sent a request.
        </Alert>
      </DocSection>

      <DocSection id="review" title="Review instead of deleting">
        <DocProse>
          <p>
            A rejected request is not stored, so you never have to clean it up. A submission that
            passes the checks but still looks wrong to you stays in the dashboard, where you can
            filter it, read it, and delete it deliberately.
          </p>
        </DocProse>
        <DocProse>
          <DocSubHeading>If spam keeps arriving</DocSubHeading>
          <p>
            Most of the time the cause is an endpoint embedded in a page with no honeypot. Add one
            first, then restrict the form to your domains, then consider a CAPTCHA in front of the
            form on your own site.
          </p>
          <DocSubHeading>Take a little context with each submission</DocSubHeading>
          <p>
            Sending a <code className="font-mono text-xs">metadata</code> object with the page path
            makes patterns visible: if every spam row says{" "}
            <code className="font-mono text-xs">/legacy-contact</code>, the fix is on that page.
          </p>
        </DocProse>
        <CodeBlock title="HTML" language="html" code={tokenField} />
      </DocSection>
    </DocPageLayout>
  );
}
