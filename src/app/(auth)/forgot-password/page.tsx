import type { Metadata } from "next";

import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="text-xl">Reset your password</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert tone="warning" title="Authentication is not available yet">
          Accounts are not enabled in this build. No credentials are collected on this page.
        </Alert>
      </CardContent>
    </Card>
  );
}
