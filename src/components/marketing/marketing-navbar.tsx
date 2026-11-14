"use client";

import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Code2,
  FileText,
  Layers,
  Menu,
  Scale,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SessionAwareHeaderActions } from "@/components/layout/header-actions";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";

type PanelLink = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

type NavItem = {
  label: string;
  href: string;
  panel?: PanelLink[];
};

const productPanel: PanelLink[] = [
  {
    href: "/features",
    label: "Features",
    description: "Everything after the submit button",
    icon: Layers,
  },
  {
    href: "/how-it-works",
    label: "How it works",
    description: "Connect, collect, share access",
    icon: BookOpen,
  },
  {
    href: "/solutions/freelancers",
    label: "For freelancers",
    description: "A backend for every client project",
    icon: Code2,
  },
  {
    href: "/solutions/web-agencies",
    label: "For agencies",
    description: "Many client sites, separated data",
    icon: Users,
  },
  {
    href: "/client-portal",
    label: "Client access",
    description: "Read-only, scoped to one form",
    icon: ShieldCheck,
  },
];

const solutionsPanel: PanelLink[] = [
  {
    href: "/solutions/freelancers",
    label: "For freelancers",
    description: "Fewer backends to maintain",
    icon: Code2,
  },
  {
    href: "/solutions/web-developers",
    label: "For web developers",
    description: "One endpoint contract everywhere",
    icon: Layers,
  },
  {
    href: "/solutions/web-agencies",
    label: "For web agencies",
    description: "Client access that does not leak",
    icon: Users,
  },
  {
    href: "/solutions/client-projects",
    label: "For client projects",
    description: "Scope access to one project",
    icon: ShieldCheck,
  },
];

const resourcePanel: PanelLink[] = [
  {
    href: "/docs",
    label: "Documentation",
    description: "Endpoint contract, limits and codes",
    icon: BookOpen,
  },
  {
    href: "/guides",
    label: "Guides",
    description: "Setup for every supported stack",
    icon: Code2,
  },
  {
    href: "/integrations",
    label: "Integrations",
    description: "HTML, JavaScript, React, Next.js",
    icon: Layers,
  },
  {
    href: "/blog",
    label: "Blog",
    description: "Longer explanations and walkthroughs",
    icon: FileText,
  },
  {
    href: "/compare",
    label: "Comparisons",
    description: "Form backends and form builders",
    icon: Scale,
  },
];

const navItems: NavItem[] = [
  { label: "Product", href: "/features", panel: productPanel },
  { label: "Solutions", href: "/solutions", panel: solutionsPanel },
  { label: "Resources", href: "/docs", panel: resourcePanel },
  { label: "Pricing", href: "/pricing" },
  { label: "Changelog", href: "/changelog" },
];

const mobileSecondary = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/client-portal", label: "Client access" },
  { href: "/solutions", label: "Solutions" },
  { href: "/integrations", label: "Integrations" },
  { href: "/docs", label: "Documentation" },
  { href: "/compare", label: "Comparisons" },
  { href: "/security", label: "Security" },
  { href: "/faq", label: "FAQ" },
];

function isActive(pathname: string, href: string): boolean {
  const path = href.split("#")[0];
  if (!path || path === "/") return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function MarketingNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMenus() {
    setOpenPanel(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPanel(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled || mobileOpen
          ? "border-border bg-surface/85 shadow-[0_1px_24px_-18px_rgb(11_31_42/0.4)] backdrop-blur-xl"
          : "border-transparent bg-surface/55 backdrop-blur-md",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-7">
          <Logo onClick={closeMenus} />
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                if (!item.panel) {
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={closeMenus}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-3 py-2 text-[13.5px] transition-colors hover:text-foreground",
                          active ? "font-medium text-foreground" : "text-foreground-secondary",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                const expanded = openPanel === item.label;
                const panelId = `nav-panel-${item.label.toLowerCase().replace(/\s+/g, "-")}`;

                return (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenPanel(item.label)}
                    onMouseLeave={() =>
                      setOpenPanel((current) => (current === item.label ? null : current))
                    }
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                        setOpenPanel((current) => (current === item.label ? null : current));
                      }
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() =>
                        setOpenPanel((current) => (current === item.label ? null : item.label))
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors hover:text-foreground",
                        active || expanded
                          ? "font-medium text-foreground"
                          : "text-foreground-secondary",
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "size-3.5 text-foreground-muted transition-transform duration-200",
                          expanded && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    <div
                      id={panelId}
                      hidden={!expanded}
                      className="absolute top-full left-1/2 w-[22rem] -translate-x-1/2 pt-3"
                    >
                      <div className="preview-frame rounded-2xl p-2">
                        <ul className="flex flex-col">
                          {item.panel.map((link) => {
                            const Icon = link.icon;
                            return (
                              <li key={link.href + link.label}>
                                <Link
                                  href={link.href}
                                  onClick={closeMenus}
                                  className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-muted"
                                >
                                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-accent">
                                    <Icon className="size-4" aria-hidden="true" />
                                  </span>
                                  <span className="flex flex-col">
                                    <span className="text-[13.5px] font-medium text-foreground">
                                      {link.label}
                                    </span>
                                    <span className="text-[12.5px] text-foreground-muted">
                                      {link.description}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            <SessionAwareHeaderActions />
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-controls="marketing-mobile-menu"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-foreground lg:hidden"
          >
            {mobileOpen ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <Menu className="size-4" aria-hidden="true" />
            )}
            <span className="sr-only">{mobileOpen ? "Close main menu" : "Open main menu"}</span>
          </button>
        </div>
      </Container>

      {mobileOpen ? (
        <div
          id="marketing-mobile-menu"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-border bg-surface/95 backdrop-blur-xl lg:hidden"
        >
          <Container className="flex flex-col gap-6 py-6">
            <nav aria-label="main menu">
              <ul className="flex flex-col gap-0.5">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={closeMenus}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground transition-colors hover:bg-surface-muted"
                    >
                      {item.label}
                      <ArrowUpRight className="size-4 text-foreground-muted" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex flex-col gap-2 border-t border-border pt-5">
              <p className="px-3 text-[10px] font-semibold tracking-[0.16em] text-foreground-muted uppercase">
                More
              </p>
              <ul className="grid grid-cols-2 gap-1">
                {mobileSecondary.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-2 text-[13.5px] text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-5">
              <div className="flex items-center justify-between rounded-lg bg-surface-muted/70 px-3 py-2">
                <span className="text-xs text-foreground-muted">Appearance</span>
                <ThemeToggle className="size-8 border-transparent bg-transparent" />
              </div>
              <Link
                href="/login"
                onClick={closeMenus}
                className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                Sign in
              </Link>
              <ButtonLink href="/signup" onClick={closeMenus} className="w-full">
                Get started free
              </ButtonLink>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
