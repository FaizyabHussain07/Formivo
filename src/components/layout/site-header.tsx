import { marketingNav } from "@/config/navigation";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";

export function SiteHeader() {
  return (
    <header className="relative border-b border-border bg-surface/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {marketingNav.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} />
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="ghost" size="sm">
              Sign in
            </ButtonLink>
            <ButtonLink href="/signup" size="sm" className="hidden sm:inline-flex">
              Get started
            </ButtonLink>
          </div>
          <MobileNav items={marketingNav} label="main menu" />
        </div>
      </Container>
    </header>
  );
}
