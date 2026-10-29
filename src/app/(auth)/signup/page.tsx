import type { Metadata } from "next";
import { Suspense } from "react";

import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

type SearchParams = Promise<{ next?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<SignupShell invitation={false} />}>
      <SignupContent searchParams={searchParams} />
    </Suspense>
  );
}

function SignupShell({
  invitation,
  children,
}: {
  invitation: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Card className="shadow-[0_12px_32px_-20px_rgb(11_31_28/0.25)]">
      <CardHeader>
        <CardTitle>
          <span className="text-[22px] tracking-tight">
            {invitation ? "Create your client account" : "Create your workspace"}
          </span>
        </CardTitle>
        <CardDescription>
          {invitation
            ? "A developer shared one form with you. This account only reads that form's submissions — it does not create forms or a workspace."
            : "Free forever for 3 forms and 300 submissions a month. No card required."}
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

async function SignupContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";
  const invitation = next.startsWith("/invite/");
  return (
    <SignupShell invitation={invitation}>
      <SignupForm next={next} invitation={invitation} />
    </SignupShell>
  );
}
