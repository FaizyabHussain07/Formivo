import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/password-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="text-xl">Choose a new password</span>
        </CardTitle>
        <CardDescription>
          Use the reset link from your email, then set a new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
