import type { Metadata } from "next";
import { Suspense } from "react";

import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isPaidPlan, planFor } from "@/lib/billing/plans";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

type SearchParams = Promise<{ next?: string; plan?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<SignupShell invitation={false} />}>
      <SignupContent searchParams={searchParams} />
    </Suspense>
  );
}

function SignupShell({
  invitation,
  planName,
  children,
}: {
  invitation: boolean;
  planName?: string;
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
            ? "A developer shared one form with you. This account only reads that form's submissions. It does not create forms or a workspace."
            : planName
              ? `Creating your account first. You will continue to ${planName} checkout after verifying your email, and nothing is charged until you complete payment.`
              : "Free forever for 1 form and 100 submissions a month. No card required."}
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

async function SignupContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  // A plan chosen on the pricing page is carried through signup and verification so
  // the visitor does not have to pick it again. It grants nothing by itself.
  const plan = params.plan && isPaidPlan(params.plan) ? params.plan : null;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : plan
        ? `/billing?plan=${plan}`
        : "/dashboard";
  const invitation = next.startsWith("/invite/");
  return (
    <SignupShell
      invitation={invitation}
      planName={plan ? planFor(plan).name : undefined}
    >
      <SignupForm next={next} invitation={invitation} />
    </SignupShell>
  );
}
