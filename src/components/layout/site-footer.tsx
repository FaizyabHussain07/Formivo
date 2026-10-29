import Image from "next/image";
import Link from "next/link";

import { legalNav, marketingNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="flex flex-col gap-6 py-10 text-sm text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground">
            <Image
              src="/formivo-logo.png"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              className="size-6 shrink-0"
            />
            {siteConfig.name}
          </span>
          <span aria-hidden="true">·</span>
          <a className="hover:text-foreground" href={`mailto:${siteConfig.contactEmail}`}>
            {siteConfig.contactEmail}
          </a>
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {[...marketingNav, ...legalNav].map((item) => (
              <li key={item.href}>
                <Link className="hover:text-foreground" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
