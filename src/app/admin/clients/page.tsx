import { AdminShell } from "@/components/admin/admin-shell";
import { Alert } from "@/components/ui/alert";
import { StatCard } from "@/components/ui/stat-card";
import { requireAdminSession } from "@/lib/admin/auth";
import { getPlatformStats, listClientAccess } from "@/lib/admin/metrics";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Admin client access", robots: { index: false } };
export const instant = false;

export default async function Page() {
  const session = await requireAdminSession();
  const [stats, rows] = await Promise.all([getPlatformStats(), listClientAccess(100)]);

  const active = rows.filter((row) => !row.revoked).length;
  const revoked = rows.length - active;

  return (
    <AdminShell username={session.username} currentPath="/admin/clients">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Client access</h1>
          <p className="text-sm text-foreground-secondary">
            Form-level permissions. A row is access, not engagement: no last-viewed time is recorded,
            so none is shown.
          </p>
        </header>

        {stats.available ? null : (
          <Alert tone="warning" title="Client access unavailable">
            {stats.reason ?? "The database could not be read."}
          </Alert>
        )}

        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Permission rows" value={String(rows.length)} />
          <StatCard label="Active" value={String(active)} />
          <StatCard label="Revoked" value={String(revoked)} />
        </section>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-surface-muted/60 text-[11px] tracking-[0.08em] text-foreground-muted uppercase">
              <tr>
                <th scope="col" className="px-5 py-2.5">Form</th>
                <th scope="col" className="px-5 py-2.5">Workspace</th>
                <th scope="col" className="px-5 py-2.5">Client id</th>
                <th scope="col" className="px-5 py-2.5">Granted</th>
                <th scope="col" className="px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground-secondary">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-4">
                    No client permissions yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.permissionId}>
                    <td className="px-5 py-2.5 font-medium text-foreground">{row.formName}</td>
                    <td className="px-5 py-2.5">{row.workspaceName}</td>
                    <td className="px-5 py-2.5 font-mono text-[11px]">{row.clientId}</td>
                    <td className="px-5 py-2.5 text-xs">{formatDateTime(row.grantedAt)}</td>
                    <td className="px-5 py-2.5">
                      <span
                        className={
                          row.revoked
                            ? "rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-foreground-muted"
                            : "rounded-full border border-accent/30 bg-accent-subtle px-2 py-0.5 text-[10px] uppercase text-accent"
                        }
                      >
                        {row.revoked ? "Revoked" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-foreground-muted">
          Invitation delivery and interaction history are not recorded per permission, so this table
          does not imply any.
        </p>
      </div>
    </AdminShell>
  );
}
