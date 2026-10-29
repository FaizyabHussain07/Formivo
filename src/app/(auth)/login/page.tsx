import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type SearchParams = Promise<{ next?: string; error?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="text-xl">Sign in to Formivo</span>
        </CardTitle>
        <CardDescription>Manage your forms, leads and client access.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<p className="text-sm text-foreground-muted">Loading…</p>}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function LoginContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return <LoginForm next={next} errorCode={params.error} />;
}
