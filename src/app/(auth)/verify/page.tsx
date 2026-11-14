import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyForm } from "@/components/auth/verify-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ email?: string; next?: string; sent?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<VerifyShell />}>
      <VerifyContent searchParams={searchParams} />
    </Suspense>
  );
}

function VerifyShell({ children, notice }: { children?: React.ReactNode; notice?: string }) {
  return (
    <Card className="shadow-[0_12px_32px_-20px_rgb(11_31_28/0.25)]">
      <CardHeader>
        <CardTitle>
          <span className="text-[22px] tracking-tight">Check your inbox</span>
        </CardTitle>
        <CardDescription>
          Enter the six-digit code we sent to your email address. The code expires after a short
          time; request a new one if it does.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {notice ? (
          <p
            role="status"
            className="rounded-lg border border-accent/25 bg-accent-subtle px-3 py-2 text-[13px] leading-5 text-accent-hover"
          >
            {notice}
          </p>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}

const NOTICES: Record<string, string> = {
  signup:
    "Your account was created. Enter the six-digit code we just emailed you to open your workspace.",
  login:
    "Your account still needs a verified email address. We sent a fresh six-digit code — entering it confirms the address is yours and finishes the sign-in.",
  cooldown:
    "A code was sent moments ago. Use that email, or request a new one below once the timer ends.",
  email_failed:
    "The verification email could not be delivered. Request a new code, or contact support if it keeps failing.",
  not_configured:
    "Email delivery is not configured on this deployment, so no code could be sent. Contact support and we will verify your account manually.",
};

async function VerifyContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const email = params.email?.trim().toLowerCase() ?? "";
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";
  // A code can be verified without a session: Supabase refuses password sign-in until
  // the address is confirmed, so the address itself identifies the account here.
  const notice = params.sent ? NOTICES[params.sent] : undefined;

  return (
    <VerifyShell notice={notice}>
      <VerifyForm email={email} next={next} />
    </VerifyShell>
  );
}
