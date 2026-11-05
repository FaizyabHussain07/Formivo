import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors";

export function apiSuccess<T extends Record<string, unknown>>(
  body: T,
  status = 200,
  headers?: HeadersInit,
) {
  return NextResponse.json({ success: true, ...body }, { status, headers });
}

export function apiError(error: AppError) {
  const headers: Record<string, string> = {};
  if (error.code === "RATE_LIMITED") headers["Retry-After"] = "60";

  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    },
    { status: error.status, headers },
  );
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError("INTERNAL_ERROR");
}

/**
 * Client IP for rate-limit bucketing only.
 *
 * `x-forwarded-for` is client-writable, so its leftmost entry must never be
 * trusted: rotating a spoofed value would give an attacker a fresh bucket on
 * every request. Platform headers set by the edge come first, then the rightmost
 * hop (the one appended by the nearest trusted proxy).
 */
export function clientIp(request: Request): string {
  const platform = request.headers.get("x-vercel-forwarded-for");
  if (platform) return platform.split(",")[0]?.trim() || "unknown";

  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((hop) => hop.trim())
      .filter(Boolean);
    const nearest = hops[hops.length - 1];
    if (nearest) return nearest;
  }

  return "unknown";
}
