import { NextResponse } from "next/server";

import { ensureAccountForSession } from "@/lib/auth/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=not_configured", url.origin));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=link_expired", url.origin));
  }

  try {
    // Idempotent bootstrap: developers keep their workspace, and accounts arriving
    // through a client invitation stay clients (profile + client role only).
    await ensureAccountForSession(data.user, next);
  } catch {
    return NextResponse.redirect(new URL("/login?error=account_setup", url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
