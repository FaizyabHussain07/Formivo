import { BookOpen } from "lucide-react";
import Link from "next/link";

import { DocToc } from "@/components/docs/doc-toc";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { Container } from "@/components/ui/container";

export const metadata = { robots: { index: true, follow: true } };

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-border bg-background">
      <Container className="py-8 lg:py-12">
        {/* Compact header for small screens, where the sidebar is a disclosure. */}
        <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
          <Link
            href="/docs"
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <BookOpen aria-hidden="true" className="size-4 text-accent" />
            Documentation
          </Link>
          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground-secondary marker:content-none">
              Browse
            </summary>
            <div className="absolute right-0 z-40 mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-border bg-surface p-4 shadow-lg">
              <DocsSidebar />
            </div>
          </details>
        </div>

        <div className="grid gap-10 lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[236px_minmax(0,1fr)_196px]">
          <aside className="hidden lg:block">
            <div className="docs-scroll sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
              <DocsSidebar />
              <div className="mt-8 rounded-xl border border-border bg-surface p-4">
                <p className="text-sm font-medium text-foreground">Need a form now?</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground-secondary">
                  Create an endpoint and copy the integration in under a minute.
                </p>
                <Link
                  href="/signup"
                  className="mt-3 inline-flex text-xs font-medium text-accent hover:underline"
                >
                  Create a free form
                </Link>
              </div>
            </div>
          </aside>

          <main className="min-w-0">{children}</main>

          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <DocToc />
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
