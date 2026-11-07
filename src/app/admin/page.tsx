import { Database, FileText, Inbox, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Alert } from "@/components/ui/alert";
import { StatCard } from "@/components/ui/stat-card";
import { requireAdminSession } from "@/lib/admin/auth";
import { getPlatformStats, listRecentUsers } from "@/lib/admin/metrics";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Admin overview" };

// The dashboard reads the session and live database counts, so it blocks on the server.
export const instant = false;

export default async function Page() {
  const session = await requireAdminSession();
  const [stats, users] = await Promise.all([getPlatformStats(), listRecentUsers(8)]);

  return (
    <AdminShell username={session.username} currentPath="/admin">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Platform overview
          </h1>
          <p className="text-sm text-foreground-secondary">
            Live counts from the application database. Nothing on this page is simulated.
          </p>
        </header>

        {stats.available ? null : (
          <Alert tone="warning" title="Metrics unavailable">
            {stats.reason ??
              "The database could not be read, so counts are hidden rather than shown as zero."}
          </Alert>
        )}

        {stats.available ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Accounts"
                value={stats.profiles.toLocaleString("en-US")}
                hint={`${stats.developers} developer${stats.developers === 1 ? "" : "s"}, ${stats.clients} client${stats.clients === 1 ? "" : "s"}`}
                icon={Users}
              />
              <StatCard
                label="Workspaces"
                value={stats.workspaces.toLocaleString("en-US")}
                hint="One per developer account"
                icon={Database}
              />
              <StatCard
                label="Forms"
                value={stats.forms.toLocaleString("en-US")}
                hint={`${stats.activeForms} accepting submissions`}
                icon={FileText}
              />
              <StatCard
                label="Submissions"
                value={stats.submissions.toLocaleString("en-US")}
                hint={`${stats.submissionsLast7Days} in the last 7 days`}
                icon={Inbox}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-5">
                <h2 className="text-sm font-semibold text-foreground">Subscriptions by plan</h2>
                {stats.subscriptions.length === 0 ? (
                  <p className="mt-2 text-sm text-foreground-secondary">
                    No subscription rows yet. Every workspace starts on Free.
                  </p>
                ) : (
                  <table className="mt-3 w-full text-left text-sm">
                    <thead className="text-[11px] tracking-[0.08em] text-foreground-muted uppercase">
                      <tr>
                        <th scope="col" className="py-1.5">
                          Plan
                        </th>
                        <th scope="col" className="py-1.5">
                          Status
                        </th>
                        <th scope="col" className="py-1.5 text-right">
                          Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground-secondary">
                      {stats.subscriptions.map((row) => (
                        <tr key={`${row.plan}:${row.status}`}>
                          <td className="py-2 font-medium text-foreground capitalize">
                            {row.plan}
                          </td>
                          <td className="py-2">{row.status}</td>
                          <td className="py-2 text-right font-mono text-xs">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="rounded-xl border border-border bg-surface p-5">
                <h2 className="text-sm font-semibold text-foreground">Client invitations</h2>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {stats.invitations.toLocaleString("en-US")}
                </p>
                <p className="mt-1 text-xs text-foreground-secondary">
                  {stats.pendingInvitations} still pending. Pending invitations expire on their own
                  and are never extended silently.
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
                <h2 className="text-sm font-semibold text-foreground">Newest accounts</h2>
                <a href="/admin/users" className="text-xs font-medium text-accent hover:underline">
                  All users
                </a>
              </div>
              {users.length === 0 ? (
                <p className="px-5 py-4 text-sm text-foreground-secondary">No accounts yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-surface-muted/60 text-[11px] tracking-[0.08em] text-foreground-muted uppercase">
                      <tr>
                        <th scope="col" className="px-5 py-2.5">
                          Account
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
