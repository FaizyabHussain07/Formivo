import { AdminShell } from "@/components/admin/admin-shell";
import { Alert } from "@/components/ui/alert";
import { requireAdminSession } from "@/lib/admin/auth";
import { getPlatformStats, listRecentUsers } from "@/lib/admin/metrics";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Admin users" };

// The dashboard reads the session and live database counts, so it blocks on the server.
export const instant = false;

export default async function Page() {
  const session = await requireAdminSession();
  const [users, stats] = await Promise.all([listRecentUsers(100), getPlatformStats()]);

  return (
    <AdminShell username={session.username} currentPath="/admin/users">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users</h1>
          <p className="text-sm text-foreground-secondary">
            Newest 100 accounts. Roles are read from the trusted role table, never from profile
            metadata.
          </p>
        </header>

        {stats.available ? null : (
          <Alert tone="warning" title="Metrics unavailable">
            {stats.reason ?? "The database could not be read."}
          </Alert>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {users.length === 0 ? (
            <p className="px-5 py-6 text-sm text-foreground-secondary">No accounts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-surface-muted/60 text-[11px] tracking-[0.08em] text-foreground-muted uppercase">
                  <tr>
                    <th scope="col" className="px-5 py-2.5">
                      Display name
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Roles
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Plan
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Forms
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Joined
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      User id
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground-secondary">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-2.5 font-medium text-foreground">
                        {user.displayName}
                      </td>
                      <td className="px-5 py-2.5">{user.roles.join(", ") || "none"}</td>
                      <td className="px-5 py-2.5 capitalize">{user.plan}</td>
                      <td className="px-5 py-2.5 font-mono text-xs">{user.formCount}</td>
                      <td className="px-5 py-2.5 text-xs">{formatDateTime(user.createdAt)}</td>
                      <td className="px-5 py-2.5 font-mono text-[11px] text-foreground-muted">
                        {user.id.slice(0, 8)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-foreground-muted">
          Email addresses are not shown here. Account identity is confirmed by the authentication
          provider, and this view deliberately avoids becoming a second copy of personal data.
        </p>
      </div>
    </AdminShell>
  );
}
