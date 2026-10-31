import { Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { AutoRefresh } from "@/components/layout/auto-refresh";
import { AppPageSkeleton, UserPanel } from "@/components/layout/user-panel";
import { developerNav, developerNavGroups } from "@/config/navigation";
import { getDeveloperContext } from "@/lib/auth/viewer";

export const metadata = { robots: { index: false } };
export const instant = false;

async function DeveloperIdentity() {
  const developer = await getDeveloperContext();
  if (!developer) return null;
  return (
    <UserPanel
      name={developer.user.displayName}
      email={developer.user.email}
      context={developer.workspace.name}
      badge={developer.plan.name}
    />
  );
}

export default function DeveloperLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      nav={developerNav}
      groups={developerNavGroups}
      navLabel="Developer"
      contextLabel="Developer"
      homeHref="/dashboard"
      footer={
        <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-surface-muted" />}>
          <DeveloperIdentity />
        </Suspense>
      }
    >
      <AutoRefresh />
      <Suspense fallback={<AppPageSkeleton />}>{children}</Suspense>
    </AppShell>
  );
}
