import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/password-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="text-xl">Reset your password</span>
        </CardTitle>
        <CardDescription>
          Enter your account email and we will send you a secure reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
