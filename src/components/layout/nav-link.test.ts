import { describe, expect, it } from "vitest";

import { isActivePath } from "./nav-link";

describe("isActivePath", () => {
  it("matches nested routes by prefix", () => {
    expect(isActivePath("/forms/abc", "/forms")).toBe(true);
  });

  it("does not match sibling routes that share a prefix", () => {
    expect(isActivePath("/formsx", "/forms")).toBe(false);
  });

  it("matches the root and exact routes exactly", () => {
    expect(isActivePath("/docs", "/")).toBe(false);
    expect(isActivePath("/client/settings", "/client", true)).toBe(false);
    expect(isActivePath("/client", "/client", true)).toBe(true);
  });
});
