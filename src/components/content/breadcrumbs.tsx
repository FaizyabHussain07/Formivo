import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { canonicalUrl } from "@/lib/seo";

export type Crumb = { href: string; label: string };

/** Visible breadcrumb trail plus matching BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ href: "/", label: "Home" }, ...items];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: canonicalUrl(item.href),
    })),
  };

  return (
    <div className="border-b border-border bg-surface">
      <Container className="flex items-center gap-1.5 py-3 text-xs text-foreground-muted">
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex flex-wrap items-center gap-1.5">
            {trail.map((item, index) => {
              const isLast = index === trail.length - 1;
              return (
                <li key={item.href} className="flex items-center gap-1.5">
                  {isLast ? (
                    <span aria-current="page" className="truncate text-foreground-secondary">
                      {item.label}
                    </span>
                  ) : (
                    <>
                      <Link href={item.href} className="hover:text-foreground">
                        {item.label}
                      </Link>
                      <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <script
          type="application/ld+json"

          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Container>
    </div>
  );
}
