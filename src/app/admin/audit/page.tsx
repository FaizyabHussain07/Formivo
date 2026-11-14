import { AdminShell } from "@/components/admin/admin-shell";
import { Alert } from "@/components/ui/alert";
import { requireAdminSession } from "@/lib/admin/auth";
import { getPlatformStats, listAuditLog } from "@/lib/admin/metrics";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Admin audit log" };

// The dashboard reads the session and live database counts, so it blocks on the server.
export const instant = false;

export default async function Page() {
  const session = await requireAdminSession();
  const [entries, stats] = await Promise.all([listAuditLog(60), getPlatformStats()]);

  return (
    <AdminShell username={session.username} currentPath="/admin/audit">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Audit log</h1>
          <p className="text-sm text-foreground-secondary">
            Administrative and security-relevant actions, newest first. Passwords, tokens and
            submission contents are never written here.
          </p>
        </header>

        {stats.available ? null : (
          <Alert tone="warning" title="Metrics unavailable">
            {stats.reason ?? "The database could not be read."}
          </Alert>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {entries.length === 0 ? (
            <p className="px-5 py-6 text-sm text-foreground-secondary">
              No audit entries yet. Signing in to this dashboard records one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-surface-muted/60 text-[11px] tracking-[0.08em] text-foreground-muted uppercase">
                  <tr>
                    <th scope="col" className="px-5 py-2.5">
                      Action
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Target
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Details
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      When
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground-secondary">
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-5 py-2.5 font-mono text-xs text-foreground">
                        {entry.action}
                      </td>
                      <td className="px-5 py-2.5 text-xs">
                        {entry.targetType ? `${entry.targetType}` : "system"}
                        {entry.targetId ? ` · ${entry.targetId.slice(0, 8)}` : ""}
                      </td>
                      <td className="max-w-[320px] px-5 py-2.5 text-xs break-words text-foreground-muted">
                        {Object.keys(entry.metadata).length === 0
                          ? "Not set"
                          : Object.entries(entry.metadata)
                              .map(([key, value]) => `${key}: ${String(value)}`)
                              .join(", ")}
                      </td>
                      <td className="px-5 py-2.5 text-xs">{formatDateTime(entry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
