import type { Metadata } from "next";

import { CreateForm } from "@/components/forms/create-form";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { requireDeveloper } from "@/lib/auth/viewer";

export const metadata: Metadata = { title: "New form" };

export default async function Page() {
  const developer = await requireDeveloper();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create a form"
        description="Connect a form you already have. Formivo stores submissions and gives you (or your client) a dashboard to review them."
      />

      {!developer.entitlements.canCreateForm ? (
        <Alert tone="warning" title="Active form limit reached">
          Your {developer.plan.name} plan allows {developer.plan.forms} active forms. Pause an
          existing form or upgrade your plan before creating another.
        </Alert>
      ) : null}

      <CreateForm />

      <Alert tone="info" title="Embedded form builder — coming soon">
        An in-dashboard form builder is not part of this release. Use the endpoint and secret above
        with your own form; Formivo works with any HTML form or server-side integration.
      </Alert>
    </div>
  );
}
