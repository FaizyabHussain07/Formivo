import { describe, expect, it } from "vitest";

import { clientIp } from "@/lib/api/response";

function requestWith(headers: Record<string, string>): Request {
  return new Request("https://formivo.faizyab.me/api/f/00000000-0000-4000-8000-000000000000", {
    method: "POST",
    headers,
  });
}

describe("client IP for rate limiting", () => {
  it("prefers the platform header a caller cannot forge", () => {
    const request = requestWith({
      "x-vercel-forwarded-for": "203.0.113.9",
      "x-forwarded-for": "1.2.3.4, 203.0.113.9",
    });
    expect(clientIp(request)).toBe("203.0.113.9");
  });

  it("uses the rightmost forwarded hop, not a client-supplied left entry", () => {
    const request = requestWith({ "x-forwarded-for": "9.9.9.9, 198.51.100.7" });
    expect(clientIp(request)).toBe("198.51.100.7");
  });

  it("lets a spoofed first entry change nothing when the proxy appends the real hop", () => {
    const spoofed = requestWith({ "x-forwarded-for": "attacker-a, 198.51.100.7" });
    const rotated = requestWith({ "x-forwarded-for": "attacker-b, 198.51.100.7" });
    expect(clientIp(spoofed)).toBe(clientIp(rotated));
  });

  it("falls back to x-real-ip and then to a stable placeholder", () => {
    expect(clientIp(requestWith({ "x-real-ip": "192.0.2.44" }))).toBe("192.0.2.44");
    expect(clientIp(requestWith({}))).toBe("unknown");
  });
});
