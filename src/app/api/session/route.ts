import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/viewer";

/**
 * Whether the browser has a valid session. Returns no personal data: the marketing
 * header only needs a boolean to choose between "Log in" and "Dashboard".
 */
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json(
    { authenticated: Boolean(user) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
