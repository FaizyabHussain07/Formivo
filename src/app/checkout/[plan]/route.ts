import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/viewer";
import { isPlanKey } from "@/lib/billing/plans";

/**
 * Entry point for a paid plan chosen before signing up.
 *
 * A visitor is sent to sign-up with the intended plan preserved through verification.
 * A signed-in user goes straight to billing, where the plan is one click from checkout.
 * The plan never grants anything here: it is only carried into the checkout flow.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ plan: string }> },
) {
  const { plan } = await params;
  const url = new URL(request.url);

  if (!isPlanKey(plan) || plan === "free") {
    return NextResponse.redirect(new URL("/pricing", url.origin));
  }

  const user = await getSessionUser();
  const destination = user
    ? `/billing?plan=${encodeURIComponent(plan)}`
    : `/signup?plan=${encodeURIComponent(plan)}`;

  return NextResponse.redirect(new URL(destination, url.origin));
}
