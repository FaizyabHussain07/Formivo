import type { Json } from "@/lib/supabase/database.types";

/** Normalizes an origin to scheme://host[:port]; returns null when invalid. */
export function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 300) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.pathname !== "/" && url.pathname !== "") return null;
  if (url.search || url.hash || url.username || url.password) return null;

  const host = url.hostname;
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1";
  if (url.protocol !== "https:" && !(url.protocol === "http:" && isLocal)) return null;

  return url.origin;
}

export function parseAllowedOrigins(settings: Json | undefined): string[] {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) return [];
  const origins = (settings as Record<string, Json>).allowed_origins;
  if (!Array.isArray(origins)) return [];
  return origins
    .filter((origin): origin is string => typeof origin === "string")
    .map(normalizeOrigin)
    .filter((origin): origin is string => origin !== null)
    .slice(0, 20);
}

/**
 * Empty list = accept any origin. Non-browser clients do not send Origin and are
 * always allowed through this browser-oriented check; rate limits protect them.
 */
export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (allowedOrigins.length === 0) return true;
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  return normalized !== null && allowedOrigins.includes(normalized);
}
