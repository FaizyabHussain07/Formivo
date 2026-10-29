import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/viewer";

/** Signed-in developers get a Dashboard shortcut instead of two auth links. */
export function HeaderActions({ signedIn }: { signedIn: boolean }) {
  if (signedIn) {
    return (
      <ButtonLink href="/dashboard" size="sm">
        Dashboard
      </ButtonLink>
    );
  }
  return (
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
  );
}

export async function SessionAwareHeaderActions() {
  const user = await getSessionUser();
  return <HeaderActions signedIn={Boolean(user)} />;
}
