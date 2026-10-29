import { describe, expect, it } from "vitest";

import { isOriginAllowed, normalizeOrigin, parseAllowedOrigins } from "@/lib/forms/origins";

describe("allowed-domain policy", () => {
  it("normalizes https origins", () => {
    expect(normalizeOrigin("https://example.com")).toBe("https://example.com");
    expect(normalizeOrigin("https://example.com/")).toBe("https://example.com");
    expect(normalizeOrigin("  https://www.example.com:8443  ")).toBe(
      "https://www.example.com:8443",
    );
  });

  it("allows http only for localhost", () => {
    expect(normalizeOrigin("http://localhost:3000")).toBe("http://localhost:3000");
    expect(normalizeOrigin("http://127.0.0.1:3000")).toBe("http://127.0.0.1:3000");
    expect(normalizeOrigin("http://example.com")).toBeNull();
  });

  it("rejects paths, queries, credentials and other schemes", () => {
    expect(normalizeOrigin("https://example.com/contact")).toBeNull();
    expect(normalizeOrigin("https://example.com/?a=1")).toBeNull();
    expect(normalizeOrigin("https://user:pass@example.com")).toBeNull();
    expect(normalizeOrigin("javascript:alert(1)")).toBeNull();
    expect(normalizeOrigin("not a url")).toBeNull();
  });

  it("parses and normalizes stored settings", () => {
    expect(
      parseAllowedOrigins({
        allowed_origins: ["https://example.com/", "https://app.example.com", 42, "bad"],
      }),
    ).toEqual(["https://example.com", "https://app.example.com"]);
    expect(parseAllowedOrigins(null)).toEqual([]);
    expect(parseAllowedOrigins({ allowed_origins: "https://example.com" })).toEqual([]);
  });

  it("accepts any origin when no list is configured", () => {
    expect(isOriginAllowed("https://anything.example", [])).toBe(true);
    expect(isOriginAllowed(null, [])).toBe(true);
  });

  it("enforces a configured list while allowing non-browser clients", () => {
    const allowed = ["https://example.com"];
    expect(isOriginAllowed("https://example.com", allowed)).toBe(true);
    expect(isOriginAllowed("https://example.com/", allowed)).toBe(true);
    expect(isOriginAllowed("https://evil.example", allowed)).toBe(false);
    expect(isOriginAllowed("null", allowed)).toBe(false);
    // Missing Origin is a non-browser client; rate limits protect this path.
    expect(isOriginAllowed(null, allowed)).toBe(true);
  });
});
