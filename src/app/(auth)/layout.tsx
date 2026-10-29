import { Check } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen lg:grid-cols-2">
      <aside className="hero-grid relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface p-10 lg:flex">
        <div
          className="dotted-grid pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <div className="relative">
          <Logo className="text-lg" />
        </div>

        <div className="relative flex max-w-md flex-col gap-5">
          <span className="w-fit rounded-full border border-accent/25 bg-accent-subtle px-3 py-1 text-xs font-medium text-accent-hover">
            Lead infrastructure for modern websites
          </span>
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance">
            Your forms. Your backend. Your leads in one place.
          </h2>
          <p className="text-sm text-foreground-secondary">
            Point any website form at one public endpoint. Formivo validates the request, stores the
            lead, and gives you and your client a clean dashboard to read it.
          </p>
          <ul className="flex flex-col gap-2 text-sm text-foreground-secondary">
            {["No API keys, ever", "Spam and rate limits included", "Read-only client portal"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="relative flex items-center justify-between gap-3 text-xs text-foreground-muted">
          <span>© {siteConfig.name}</span>
          <ThemeToggle className="size-8" />
        </div>
      </aside>

      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="mb-8 flex w-full max-w-sm items-center justify-between lg:hidden">
          <Logo className="text-lg" />
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
