import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { IntegrationNotConfiguredError, getIntegrationStatus } from "@/lib/env/integrations";
import { getServerEnv } from "@/lib/env/server";

import type { Database } from "./database.types";

export type AdminClient = SupabaseClient<Database, "public">;

let cached: AdminClient | undefined;

/**
 * Service-role client for trusted server-side operations only.
 *
 * The service role BYPASSES row level security, so every caller must perform
 * its own authorization (verify workspace ownership, form access, etc.) before
 * reading or writing rows. Never import this from client components.
 *
 * Returns `null` when the Supabase variables are not configured, so callers can
 * surface an honest "not configured" state instead of crashing the public shell.
 */
export function getAdminClient(): AdminClient | null {
  const env = getServerEnv();
  const status = getIntegrationStatus(env, "supabaseAdmin");

  if (!status.configured || !env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  cached ??= createClient<Database, "public">(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );

  return cached;
}

/** Like {@link getAdminClient} but throws when Supabase is not configured. */
export function requireAdminClient(): AdminClient {
  const client = getAdminClient();
  if (!client) {
    const env = getServerEnv();
    const { missing } = getIntegrationStatus(env, "supabaseAdmin");
    throw new IntegrationNotConfiguredError("supabaseAdmin", missing);
  }
  return client;
}
