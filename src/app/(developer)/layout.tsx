import { AppShell } from "@/components/layout/app-shell";
import { developerNav } from "@/config/navigation";

export const metadata = { robots: { index: false } };

export default function DeveloperLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      nav={developerNav}
      navLabel="Developer"
      contextLabel="Developer"
      homeHref="/dashboard"
    >
      {children}
    </AppShell>
  );
}
