import type { Metadata } from "next";
import { Suspense } from "react";

import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

type SearchParams = Promise<{ next?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="text-xl">Create your workspace</span>
        </CardTitle>
        <CardDescription>
          Free forever for 3 forms and 100 submissions a month. No card required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<SignupForm />}>
          <SignupContent searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function SignupContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";
  return <SignupForm next={next} />;
}
