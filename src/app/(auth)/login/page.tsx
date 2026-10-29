import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type SearchParams = Promise<{ next?: string; error?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Card className="shadow-[0_12px_32px_-20px_rgb(11_31_28/0.25)]">
      <CardHeader>
        <CardTitle>
          <span className="text-[22px] tracking-tight">Sign in to Formivo</span>
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
