import "server-only";

import { getUserRoles } from "./roles";

/**
 * Where an authenticated account belongs.
 *
 * Redirecting every successful sign-in to `/dashboard` made a client-only account render
 * the developer shell for a frame before `requireDeveloper()` sent it to the portal. The
 * role is resolved here, before the redirect, so the wrong dashboard is never rendered.
 */
export async function resolvePostAuthPath(userId: string, requested: string): Promise<string> {
  const safe = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";

  // An invitation links straight to the accept screen; the role is decided there.
  if (safe.startsWith("/invite/")) return safe;

  let roles: string[] = [];
  try {
    roles = await getUserRoles(userId);
  } catch {
    // A role lookup failure must not block sign-in; the protected layout still enforces
    // access and redirects safely.
    return safe;
  }

  if (roles.includes("developer")) return safe;
  if (roles.includes("client") && !safe.startsWith("/client")) return "/client";
  return safe;
}
