import { Alert } from "@/components/ui/alert";
import { DocPageLayout, DocProse, DocSection, DocSubHeading } from "@/components/docs/doc-page";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "Client portal",
  description:
    "Invite a client to a single form, how their account differs from a developer account, and how to revoke access.",
  path: "/docs/client-portal",
});

export default function Page() {
  return (
    <DocPageLayout
      href="/docs/client-portal"
      title="Client portal"
      badge="Read-only"
      description="Clients see the leads for the forms you shared and nothing else. No workspace, no billing, no settings, no other customers."
    >
      <DocSection id="invite" title="Invite a client">
        <DocProse>
          <ol className="flex flex-col gap-3">
            {[
              "Open the form and go to its client access section.",
              "Enter the client's email address and send the invitation.",
              "Formivo emails a single-use link that expires; if email is not configured, the link is shown so you can pass it on yourself.",
              "The client accepts, creating an account if they do not have one, and lands in the portal.",
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle font-mono text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </DocProse>
        <Alert tone="info" title="Invitation recipients skip developer onboarding">
          A client account exists only to read the forms you granted. It has no workspace, so it
          must never be pushed through developer setup.
        </Alert>
      </DocSection>

      <DocSection id="access" title="What a client can do">
        <DocProse>
          <ul className="flex flex-col gap-2">
            {[
              "Read submissions for the forms they were invited to.",
              "See the submission timestamps and values for those forms.",
              "Nothing else: no other forms, no workspace settings, no billing, no invitations.",
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
        </DocProse>
        <DocProse>
          <DocSubHeading>Read-only by design</DocSubHeading>
          <p>
            Clients cannot change a submission status or delete a lead. That keeps a single owner of
            the data and avoids two people editing the same pipeline.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="security" title="How the access is enforced">
        <DocProse>
          <p>
            Permissions are rows, not links. Each row ties one client user to one form and can be
            revoked, and every read is scoped server-side to the signed-in client. A client who
            edits a request to ask for another form id gets nothing back.
          </p>
          <p>Revoking removes access immediately, including for a session that is already open.</p>
        </DocProse>
      </DocSection>

      <DocSection id="limits" title="Viewer limits">
        <DocProse>
          <p>
            Each plan caps how many distinct client viewers a workspace can have: 3 on Free, 10 on
            Pro and 50 on Agency. A viewer counts once, however many forms you share with them.
          </p>
          <DocSubHeading>Removing a viewer</DocSubHeading>
          <p>
            Revoke the permission to free the seat. The client keeps their account; they simply no
            longer see that form.
          </p>
        </DocProse>
      </DocSection>
    </DocPageLayout>
  );
}
