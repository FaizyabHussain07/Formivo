import type { NavIconName } from "@/components/layout/nav-icons";

export type NavItem = {
  href: string;
  label: string;
  icon?: NavIconName;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const marketingNav: NavItem[] = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export const legalNav: NavItem[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export const developerNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "overview" },
  { href: "/forms", label: "Forms", icon: "forms" },
  { href: "/submissions", label: "Submissions", icon: "submissions" },
  { href: "/analytics", label: "Analytics", icon: "analytics" },
  { href: "/clients", label: "Client access", icon: "clients" },
  { href: "/billing", label: "Billing", icon: "billing" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export const developerNavGroups: NavGroup[] = [
  { label: "Build", items: developerNav.slice(0, 4) },
  { label: "Manage", items: developerNav.slice(4) },
];

export const clientNav: NavItem[] = [
  { href: "/client", label: "Shared forms", icon: "forms" },
  { href: "/client/settings", label: "Settings", icon: "settings" },
];

export const clientNavGroups: NavGroup[] = [{ label: "Client portal", items: clientNav }];
