import { AdminShell } from "@/components/admin/admin-shell";
import { Alert } from "@/components/ui/alert";
import { requireAdminSession } from "@/lib/admin/auth";
import { getPlatformStats, listRecentSubmissions } from "@/lib/admin/metrics";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Admin submissions" };

// The dashboard reads the session and live database counts, so it blocks on the server.
export const instant = false;

export default async function Page() {
  const session = await requireAdminSession();
  const [submissions, stats] = await Promise.all([listRecentSubmissions(50), getPlatformStats()]);

  return (
    <AdminShell username={session.username} currentPath="/admin/submissions">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Submissions</h1>
          <p className="text-sm text-foreground-secondary">
            Volume and health only. Submission contents stay with the workspace that owns them, so
            this view shows metadata rather than private lead data.
          </p>
        </header>

        {stats.available ? null : (
          <Alert tone="warning" title="Metrics unavailable">
            {stats.reason ?? "The database could not be read."}
          </Alert>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {submissions.length === 0 ? (
            <p className="px-5 py-6 text-sm text-foreground-secondary">
              No submissions recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-surface-muted/60 text-[11px] tracking-[0.08em] text-foreground-muted uppercase">
                  <tr>
                    <th scope="col" className="px-5 py-2.5">
                      Form
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Origin
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Received
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground-secondary">
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-5 py-2.5 font-medium text-foreground">
                        {submission.formName}
                      </td>
                      <td className="px-5 py-2.5 capitalize">{submission.status}</td>
                      <td className="px-5 py-2.5 font-mono text-[11px] text-foreground-muted">
                        {submission.sourceOrigin ?? "not sent"}
                      </td>
                      <td className="px-5 py-2.5 text-xs">
                        {formatDateTime(submission.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-foreground-muted">
          A submission that was rejected by validation or the honeypot is never stored, so it does
          not appear here.
        </p>
      </div>
    </AdminShell>
  );
}
