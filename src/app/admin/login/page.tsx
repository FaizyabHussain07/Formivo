import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminConfig, getAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

// The dashboard reads the session and live database counts, so it blocks on the server.
export const instant = false;

export default async function Page() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const config = getAdminConfig();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="text-[22px] tracking-tight">Formivo admin</span>
            </CardTitle>
            <CardDescription>
              Operator access to platform metrics, accounts and audit history.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {config.configured ? null : (
              <Alert tone="warning" title="Admin access is not configured">
                Set {config.missing.join(", ")} in the environment. Credentials are never stored in
                the codebase.
              </Alert>
            )}
            <AdminLoginForm />
            <p className="text-xs text-foreground-muted">
              This dashboard is separate from developer and client accounts.{" "}
              <Link href="/login" className="underline">
                Customer sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
