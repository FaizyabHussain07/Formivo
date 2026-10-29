import type { Metadata } from "next";

import { signOutAction } from "@/app/(auth)/actions";
import { PasswordForm, ProfileForm } from "@/components/settings/account-forms";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireClient } from "@/lib/auth/viewer";

export const metadata: Metadata = { title: "Client settings" };

export default async function Page() {
  const client = await requireClient();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" description="Your profile and account security." />

      <section aria-labelledby="profile-heading" className="flex flex-col gap-4">
        <h2 id="profile-heading" className="text-base font-semibold text-foreground">
          Profile
        </h2>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="mb-4 text-sm text-foreground-secondary">
            Signed in as <span className="text-foreground">{client.user.email}</span>
          </p>
          <ProfileForm initialName={client.user.displayName} />
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
        <form action={signOutAction} className="rounded-lg border border-border bg-surface p-5">
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </section>
    </div>
  );
}
