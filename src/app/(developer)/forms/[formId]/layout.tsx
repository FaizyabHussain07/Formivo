import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { FormTabs } from "@/components/forms/form-tabs";
import { FormStatusBadge } from "@/components/submissions/status-badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { requireDeveloper } from "@/lib/auth/viewer";
import { AppError } from "@/lib/errors";
import { getOwnedForm } from "@/lib/forms/service";

import { setFormStatusAction } from "../actions";

export default async function FormLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const developer = await requireDeveloper();

  let form;
  try {
    form = await getOwnedForm(formId, developer.workspace.id);
  } catch (error) {
    if (error instanceof AppError && error.code === "FORM_NOT_FOUND") notFound();
    throw error;
  }

  const isActive = form.status === "active";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/forms"
          className="inline-flex w-fit items-center gap-1 text-sm text-foreground-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All forms
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-foreground">
                {form.name}
              </h1>
              <FormStatusBadge status={form.status} />
            </div>
            <p className="max-w-2xl text-sm text-foreground-secondary">
              {form.description ?? "No description yet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={setFormStatusAction}>
              <input type="hidden" name="formId" value={form.id} />
              <input type="hidden" name="status" value={isActive ? "paused" : "active"} />
              <Button type="submit" variant="secondary" size="sm">
                {isActive ? "Pause form" : "Resume form"}
              </Button>
            </form>
            <ButtonLink href={`/forms/${form.id}/integration`} size="sm">
              Integration
            </ButtonLink>
          </div>
        </div>
      </div>

      <FormTabs
        tabs={[
          { href: `/forms/${form.id}`, label: "Overview", exact: true },
          { href: `/forms/${form.id}/integration`, label: "Integration" },
          { href: `/forms/${form.id}/leads`, label: "Leads" },
          { href: `/forms/${form.id}/analytics`, label: "Analytics" },
          { href: `/forms/${form.id}/clients`, label: "Clients" },
        ]}
      />

      {children}
    </div>
  );
}
