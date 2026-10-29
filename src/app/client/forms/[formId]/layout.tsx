import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { FormTabs } from "@/components/forms/form-tabs";
import { FormStatusBadge } from "@/components/submissions/status-badge";
import { requireClientForm } from "@/lib/auth/viewer";

export default async function ClientFormLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const { form } = await requireClientForm(formId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/client"
          className="inline-flex w-fit items-center gap-1 text-sm text-foreground-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Shared forms
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{form.name}</h1>
          <FormStatusBadge status={form.status} />
        </div>
        <p className="max-w-2xl text-sm text-foreground-secondary">
          {form.description ?? "No description provided."} You have read-only access.
        </p>
      </div>

      <FormTabs
        tabs={[
          { href: `/client/forms/${form.formId}`, label: "Overview", exact: true },
          { href: `/client/forms/${form.formId}/leads`, label: "Leads" },
          { href: `/client/forms/${form.formId}/analytics`, label: "Analytics" },
        ]}
      />

      {children}
    </div>
  );
}
