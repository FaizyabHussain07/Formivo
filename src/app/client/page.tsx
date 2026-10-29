import { FolderOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FormStatusBadge } from "@/components/submissions/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireClient } from "@/lib/auth/viewer";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Shared forms" };

export default async function Page() {
  const client = await requireClient();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Client portal"
        title="Shared forms"
        description="Read-only access to the forms a developer has shared with you."
      />

      {client.forms.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No forms shared yet"
          description="Open the invitation link from your email to connect a form to this account."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {client.forms.map((form) => (
            <li key={form.formId}>
              <Link
                href={`/client/forms/${form.formId}`}
                className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(11_31_28/0.04)] transition-all hover:border-border-strong hover:shadow-[0_8px_24px_-16px_rgb(11_31_28/0.3)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-foreground">{form.name}</h2>
                  <FormStatusBadge status={form.status} />
                </div>
                <p className="text-sm text-foreground-secondary">
                  {form.description ?? "No description provided."}
                </p>
                <p className="mt-auto text-xs text-foreground-muted">
                  Shared {formatDate(form.grantedAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
