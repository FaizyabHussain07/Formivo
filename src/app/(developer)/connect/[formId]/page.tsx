import { ArrowRight, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConnectKit } from "@/components/forms/connect-kit";
import { ButtonLink } from "@/components/ui/button";
import { requireDeveloper } from "@/lib/auth/viewer";
import { getPublicEnv } from "@/lib/env/public";
import { AppError } from "@/lib/errors";
import { formSubmissionEndpoint, getOwnedForm } from "@/lib/forms/service";

export const metadata: Metadata = { title: "Connect your form", robots: { index: false } };

/**
 * The screen a developer lands on immediately after creating a form. It exists
 * so the first thing they see is the endpoint and a way to wire it up, rather
 * than a mostly empty dashboard. The full form view is one click away.
 */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ formId }, query] = await Promise.all([params, searchParams]);
  const developer = await requireDeveloper();

  let form;
  try {
    form = await getOwnedForm(formId, developer.workspace.id);
  } catch (error) {
    if (error instanceof AppError && error.code === "FORM_NOT_FOUND") notFound();
    throw error;
  }

  const endpoint = formSubmissionEndpoint(getPublicEnv().NEXT_PUBLIC_APP_URL, form.id);
  const justCreated = query.new === "1";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent-subtle/70 via-surface to-surface p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          {justCreated ? (
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[11.5px] font-medium text-success">
              <PartyPopper className="size-3.5" aria-hidden="true" />
              Form created
            </p>
          ) : (
            <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
              Connect a form
            </p>
          )}

          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-[30px]">
            {form.name} is live. Give it somewhere to send leads.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-foreground-secondary">
            Copy the endpoint into your website, or paste one of the prompts below into your coding
            agent and let it wire the form for you. Nothing is sent anywhere until a visitor
            submits, and every submission lands in this workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink href={`/forms/${form.id}`} size="lg">
            Open form dashboard
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="/forms" variant="secondary" size="lg">
            Back to all forms
          </ButtonLink>
        </div>

        <ol className="grid gap-2 text-[12.5px] text-foreground-secondary sm:grid-cols-3 sm:gap-4">
          {[
            ["1", "Copy the endpoint"],
            ["2", "Wire the form or paste a prompt"],
            ["3", "Watch leads arrive"],
          ].map(([step, label]) => (
            <li key={step} className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-[11px] font-semibold text-foreground">
                {step}
              </span>
              {label}
            </li>
          ))}
        </ol>
      </header>

      <ConnectKit endpoint={endpoint} formName={form.name} />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">Already wired it up?</p>
          <p className="text-[13px] text-foreground-secondary">
            Send a test submission from the form dashboard to confirm the endpoint stores it.
          </p>
        </div>
        <ButtonLink href={`/forms/${form.id}`} variant="secondary" className="w-fit">
          Send a test submission
        </ButtonLink>
      </div>

      <p className="text-[12.5px] text-foreground-muted">
        Need the reference?{" "}
        <Link href="/docs" className="text-accent hover:underline">
          Read the API docs
        </Link>{" "}
        or{" "}
        <Link href={`/forms/${form.id}/integration`} className="text-accent hover:underline">
          open the integration page
        </Link>
        .
      </p>
    </div>
  );
}
