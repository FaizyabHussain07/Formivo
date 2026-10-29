import Link from "next/link";

import { marketingNav } from "@/config/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getSessionUser } from "@/lib/auth/viewer";

import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";

export async function SiteHeader() {
  const user = await getSessionUser();

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
          {user ? (
            <ButtonLink href="/dashboard" size="sm">
              Dashboard
            </ButtonLink>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-[13.5px] font-medium text-foreground-secondary transition-colors hover:text-foreground sm:inline-block"
              >
                Log in
              </Link>
              <ButtonLink href="/signup" size="sm">
                Get started
              </ButtonLink>
            </>
          )}
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
                  {user ? null : (
                    <Link
                      href="/login"
                      className="rounded-lg px-3 py-2 text-sm font-medium text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
                    >
                      Log in
                    </Link>
                  )}
                </div>
              }
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
