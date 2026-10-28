import type { NavIconName } from "@/components/layout/nav-icons";

export type NavItem = {
  href: string;
  label: string;
  icon?: NavIconName;
};

export const marketingNav: NavItem[] = [
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
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

export const clientNav: NavItem[] = [
  { href: "/client", label: "Shared forms", icon: "forms" },
  { href: "/client/settings", label: "Settings", icon: "settings" },
];
