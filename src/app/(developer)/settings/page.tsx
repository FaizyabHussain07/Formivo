import type { Metadata } from "next";

import { signOutAction } from "@/app/(auth)/actions";
import { PasswordForm, ProfileForm, WorkspaceForm } from "@/components/settings/account-forms";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireDeveloper } from "@/lib/auth/viewer";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Settings" };

export default async function Page() {
  const developer = await requireDeveloper();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" description="Your profile, workspace and account security." />

      <section aria-labelledby="profile-heading" className="flex flex-col gap-4">
        <h2 id="profile-heading" className="text-base font-semibold text-foreground">
          Profile
        </h2>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="mb-4 text-sm text-foreground-secondary">
            Signed in as <span className="text-foreground">{developer.user.email}</span> · workspace
            created {formatDate(developer.workspace.createdAt)}
          </p>
          <ProfileForm initialName={developer.user.displayName} />
        </div>
      </section>

      <section aria-labelledby="workspace-heading" className="flex flex-col gap-4">
        <h2 id="workspace-heading" className="text-base font-semibold text-foreground">
          Workspace
        </h2>
        <div className="rounded-lg border border-border bg-surface p-5">
          <WorkspaceForm initialName={developer.workspace.name} />
        </div>
      </section>

      <section aria-labelledby="security-heading" className="flex flex-col gap-4">
        <h2 id="security-heading" className="text-base font-semibold text-foreground">
          Security
        </h2>
        <div className="rounded-lg border border-border bg-surface p-5">
          <PasswordForm />
        </div>
      </section>

      <section aria-labelledby="session-heading" className="flex flex-col gap-4">
        <h2 id="session-heading" className="text-base font-semibold text-foreground">
          Session
        </h2>
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-foreground-secondary">
            Signing out ends this browser session. Your forms keep receiving submissions.
          </p>
          <form action={signOutAction}>
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
