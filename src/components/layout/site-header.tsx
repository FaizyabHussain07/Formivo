import { marketingNav } from "@/config/navigation";
import { Container } from "@/components/ui/container";

import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";

export function SiteHeader() {
  return (
    <header className="relative border-b border-border bg-surface/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
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
        <MobileNav items={marketingNav} label="main menu" />
      </Container>
    </header>
  );
}
