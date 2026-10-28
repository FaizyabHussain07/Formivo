import { AppShell } from "@/components/layout/app-shell";
import { clientNav } from "@/config/navigation";

export const metadata = { robots: { index: false } };

export default function ClientLayout({ children }: LayoutProps<"/client">) {
  return (
    <AppShell
      nav={clientNav}
      navLabel="Client"
      contextLabel="Client"
      homeHref="/client"
      exactHrefs={["/client"]}
    >
      {children}
    </AppShell>
  );
}
