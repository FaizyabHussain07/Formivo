import { MarketingNavbar } from "@/components/marketing/marketing-navbar";

/**
 * Marketing/auth navigation. Session state is resolved client-side, so this shell
 * stays statically prerenderable.
 */
export function SiteHeader() {
  return <MarketingNavbar />;
}
