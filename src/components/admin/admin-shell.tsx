import Link from "next/link";

import { adminLogoutAction } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/forms", label: "Forms" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/clients", label: "Client access" },
  { href: "/admin/audit", label: "Audit log" },
];

export function AdminShell({
  username,
  currentPath,
  children,
}: {
  username: string;
  currentPath: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/admin" className="text-sm font-semibold text-foreground">
              Formivo <span className="text-foreground-muted">admin</span>
            </Link>
            <nav aria-label="Admin" className="flex flex-wrap gap-1">
              {links.map((link) => {
                const active = currentPath === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "rounded-md bg-accent-subtle px-2.5 py-1.5 text-sm font-medium text-accent"
                        : "rounded-md px-2.5 py-1.5 text-sm text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-foreground-muted">{username}</span>
            <form action={adminLogoutAction}>
              <button
                type="submit"
                className="rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
