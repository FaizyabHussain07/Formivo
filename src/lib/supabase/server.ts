import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { IntegrationNotConfiguredError, getIntegrationStatus } from "@/lib/env/integrations";
import { getServerEnv } from "@/lib/env/server";

import type { Database } from "./database.types";

/**
 * Session-bound Supabase client for server components, server actions and route
 * handlers. Queries run AS the signed-in user, so Row Level Security decides
 * which rows come back — this is the default client for dashboard reads.
 *
 * Returns `null` when Supabase is not configured, so public pages can render an
 * explicit "not configured" state instead of failing.
 *
 * Callers must still verify the session server-side: `const { data: { user } }
 * = await supabase.auth.getUser()` — never trust a client-supplied identity.
 */
export async function createSupabaseServerClient() {
  const env = getServerEnv();
  const status = getIntegrationStatus(env, "supabase");
  if (!status.configured || !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database, "public">(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component where cookie writes are not allowed;
          // middleware refreshes sessions instead.
        }
      },
    },
  });
}

/** Like {@link createSupabaseServerClient} but throws when not configured. */
export async function requireSupabaseServerClient() {
  const client = await createSupabaseServerClient();
  if (!client) {
    const { missing } = getIntegrationStatus(getServerEnv(), "supabase");
    throw new IntegrationNotConfiguredError("supabase", missing);
  }
  return client;
}
