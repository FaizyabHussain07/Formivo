import { Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { AppPageSkeleton, UserPanel } from "@/components/layout/user-panel";
import { clientNav, clientNavGroups } from "@/config/navigation";
import { getClientContext } from "@/lib/auth/viewer";

export const metadata = { robots: { index: false } };
export const instant = false;

async function ClientIdentity() {
  const client = await getClientContext();
  if (!client) return null;
  return (
    <UserPanel
      name={client.user.displayName}
      email={client.user.email}
      context="Client access"
      badge="Read only"
    />
  );
}

export default function ClientLayout({ children }: LayoutProps<"/client">) {
  return (
    <AppShell
      nav={clientNav}
      groups={clientNavGroups}
      navLabel="Client"
      contextLabel="Client"
      homeHref="/client"
      exactHrefs={["/client"]}
      footer={
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-surface-muted" />}>
          <ClientIdentity />
        </Suspense>
      }
    >
      <Suspense fallback={<AppPageSkeleton />}>{children}</Suspense>
    </AppShell>
  );
}
