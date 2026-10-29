import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Container } from "@/components/ui/container";
import { marketingNav } from "@/config/navigation";

import { SessionAwareHeaderActions } from "./header-actions";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";

/**
 * Marketing/auth navigation. Session state is resolved client-side, so this shell
 * stays statically prerenderable.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {marketingNav.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} />
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <SessionAwareHeaderActions />
          <div className="lg:hidden">
            <MobileNav
              items={marketingNav}
              label="main menu"
              footer={
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between rounded-lg bg-surface-muted/60 px-3 py-2">
                    <span className="text-xs text-foreground-muted">Appearance</span>
                    <ThemeToggle className="size-8 border-transparent bg-transparent" />
                  </div>
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-accent hover:bg-surface-muted"
                  >
                    Create an account
                  </Link>
                </div>
              }
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
