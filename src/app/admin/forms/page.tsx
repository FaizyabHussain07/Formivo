import { AdminShell } from "@/components/admin/admin-shell";
import { Alert } from "@/components/ui/alert";
import { StatCard } from "@/components/ui/stat-card";
import { requireAdminSession } from "@/lib/admin/auth";
import { getPlatformStats, listForms } from "@/lib/admin/metrics";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Admin forms", robots: { index: false } };
export const instant = false;

export default async function Page() {
  const session = await requireAdminSession();
  const [stats, forms] = await Promise.all([getPlatformStats(), listForms(100)]);

  const active = forms.filter((form) => form.status === "active").length;
  const withClients = forms.filter((form) => form.clientCount > 0).length;

  return (
    <AdminShell username={session.username} currentPath="/admin/forms">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Forms</h1>
          <p className="text-sm text-foreground-secondary">
            The newest 100 forms with their owner and counts. Submission content is not read on this
            page.
          </p>
        </header>

        {stats.available ? null : (
          <Alert tone="warning" title="Forms unavailable">
            {stats.reason ?? "The database could not be read."}
          </Alert>
        )}

        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Forms shown" value={String(forms.length)} />
          <StatCard label="Accepting submissions" value={String(active)} />
          <StatCard label="With a client viewer" value={String(withClients)} />
        </section>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-surface-muted/60 text-[11px] tracking-[0.08em] text-foreground-muted uppercase">
              <tr>
                <th scope="col" className="px-5 py-2.5">Form</th>
                <th scope="col" className="px-5 py-2.5">Workspace</th>
                <th scope="col" className="px-5 py-2.5">Owner id</th>
                <th scope="col" className="px-5 py-2.5">Status</th>
                <th scope="col" className="px-5 py-2.5 text-right">Submissions</th>
                <th scope="col" className="px-5 py-2.5 text-right">Clients</th>
                <th scope="col" className="px-5 py-2.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground-secondary">
              {forms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-4">
                    No forms yet.
                  </td>
                </tr>
              ) : (
                forms.map((form) => (
                  <tr key={form.id}>
                    <td className="px-5 py-2.5 font-medium text-foreground">{form.name}</td>
                    <td className="px-5 py-2.5">{form.workspaceName}</td>
                    <td className="px-5 py-2.5 font-mono text-[11px]">{form.ownerUserId}</td>
                    <td className="px-5 py-2.5">
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase">
                        {form.status}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs">
                      {form.submissionCount}
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs">{form.clientCount}</td>
                    <td className="px-5 py-2.5 text-xs">{formatDateTime(form.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-foreground-muted">
          Pagination is a fixed page of the newest 100 forms. A searchable, paginated table is the
          next step when volume requires it.
        </p>
      </div>
    </AdminShell>
  );
}
