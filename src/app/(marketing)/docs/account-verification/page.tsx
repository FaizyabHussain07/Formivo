import type { Metadata } from "next";
import Link from "next/link";

import { DocPageLayout, DocSection } from "@/components/docs/doc-page";

export const metadata: Metadata = {
  title: "Account verification and sign-in",
  description:
    "How Formivo verifies a new account with a six-digit email code, what to do when the code does not arrive, and what an unverified account cannot access.",
  alternates: { canonical: "/docs/account-verification" },
};

export default function Page() {
  return (
    <DocPageLayout
      title="Account verification and sign-in"
      description="A new account must prove it can read the email address before it can reach the dashboard."
      href="/docs/account-verification"
    >
      <DocSection id="why" title="Why verification is required">
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground-secondary">
          <p>
            Without it, anyone can create accounts for addresses they do not control. That fills the
            database with unusable records and makes account recovery ambiguous. Formivo therefore
            requires a six-digit code from the signup email before the dashboard or any form
            creation is reachable.
          </p>
        </div>
      </DocSection>

      <DocSection id="flow" title="The signup flow">
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground-secondary">
          <ol className="flex flex-col gap-2 pl-5 [&>li]:list-decimal">
            <li>Enter a name, email address and a password of at least 8 characters.</li>
            <li>
              Formivo creates the account with Supabase Auth, then issues its own six-digit code.
            </li>
            <li>
              The code is emailed through Resend and only its hash is stored, in admin-only account
              metadata. It expires after 15 minutes and allows five attempts.
            </li>
            <li>
              Enter the code on <Link href="/verify">the verification screen</Link>. A correct code
              marks the address verified, then the account is bootstrapped: profile, role, workspace
              and a Free subscription.
            </li>
          </ol>
        </div>
      </DocSection>

      <DocSection id="errors" title="If the code does not work">
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground-secondary">
          <ul className="flex flex-col gap-2 pl-5 [&>li]:list-disc">
            <li>
              <strong className="text-foreground">Incorrect code:</strong> codes are single-use and
              digits only. Check for a newer email; an older code is replaced when you resend.
            </li>
            <li>
              <strong className="text-foreground">Expired code:</strong> request another one. The
              resend control has a cooldown to stop mail loops.
            </li>
            <li>
              <strong className="text-foreground">No email at all:</strong> check spam, then use
              Resend code on the verification screen. If it still does not arrive, email{" "}
              <a href="mailto:faizyabdev@gmail.com" className="text-accent hover:underline">
                faizyabdev@gmail.com
              </a>{" "}
              and the account can be verified manually.
            </li>
            <li>
              <strong className="text-foreground">Account already exists:</strong> sign in instead.
              Sign-in redirects an unverified account back to verification rather than showing a
              generic failure.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="unverified" title="What an unverified account cannot do">
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground-secondary">
          <ul className="flex flex-col gap-2 pl-5 [&>li]:list-disc">
            <li>Open the dashboard, forms, submissions or billing.</li>
            <li>Create a form or send a test submission.</li>
            <li>Accept a client invitation.</li>
          </ul>
          <p>
            Existing verified accounts are unaffected. No account is deleted automatically for being
            unverified; that is an operator decision, not an automatic cleanup.
          </p>
        </div>
      </DocSection>

      <DocSection id="related" title="Related">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-foreground-secondary">
          <p>
            <Link href="/docs/quickstart" className="text-accent hover:underline">
              Quickstart
            </Link>
            : your first form once the account exists.
          </p>
          <p>
            <Link href="/security" className="text-accent hover:underline">
              Security
            </Link>
            : how sessions and roles are enforced.
          </p>
          <p>
            <Link href="/contact" className="text-accent hover:underline">
              Contact
            </Link>{" "}
            if you are locked out and the code never arrives.
          </p>
        </div>
      </DocSection>
    </DocPageLayout>
  );
}
