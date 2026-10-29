import { describe, expect, it } from "vitest";

import {
  formEntriesToPayload,
  parseSubmissionPayload,
  readHelperField,
  safeRedirectTarget,
} from "@/lib/submissions/validation";

describe("public submission payloads", () => {
  it("accepts flat JSON fields without any credential", () => {
    const result = parseSubmissionPayload({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello",
    });
    expect(result.data).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello",
    });
    expect(result.metadata).toEqual({});
  });

  it("accepts the explicit data/metadata shape", () => {
    const result = parseSubmissionPayload({
      data: { email: "ada@example.com" },
      metadata: { page: "/contact" },
    });
    expect(result.data).toEqual({ email: "ada@example.com" });
    expect(result.metadata).toEqual({ page: "/contact" });
  });

  it("strips reserved helper fields from stored data", () => {
    const result = parseSubmissionPayload({
      name: "Ada",
      _redirect: "https://example.com/thanks",
      _idempotency_key: "abc",
      _gotcha: "",
    });
    expect(result.data).toEqual({ name: "Ada" });
  });

  it("rejects empty submissions", () => {
    expect(() => parseSubmissionPayload({ _gotcha: "bot" })).toThrowError(/at least one field/i);
  });

  it("rejects non-object payloads", () => {
    expect(() => parseSubmissionPayload("hello")).toThrowError(/JSON object/i);
  });

  it("rejects too many fields", () => {
    const payload = Object.fromEntries(
      Array.from({ length: 101 }, (_, index) => [`field_${index}`, "value"]),
    );
    expect(() => parseSubmissionPayload(payload)).toThrowError(/too many fields/i);
  });

  it("rejects deeply nested values", () => {
    let value: unknown = "deep";
    for (let index = 0; index < 7; index += 1) value = { nested: value };
    expect(() => parseSubmissionPayload({ data: value })).toThrowError(/nested too deeply/i);
  });

  it("converts HTML form entries and keeps repeated fields", () => {
    const payload = formEntriesToPayload([
      ["name", "Ada"],
      ["interest", "forms"],
      ["interest", "billing"],
    ]);
    expect(payload).toEqual({ name: "Ada", interest: ["forms", "billing"] });
  });

  it("only allows http(s) redirect targets", () => {
    expect(safeRedirectTarget("https://example.com/thanks")).toBe("https://example.com/thanks");
    expect(safeRedirectTarget("http://localhost:3000/thanks")).toBe("http://localhost:3000/thanks");
    expect(safeRedirectTarget("javascript:alert(1)")).toBeNull();
    expect(safeRedirectTarget("//evil.example")).toBeNull();
    expect(safeRedirectTarget(null)).toBeNull();
  });

  it("reads honeypot helper values", () => {
    expect(readHelperField({ _gotcha: "bot" }, "_gotcha")).toBe("bot");
    expect(readHelperField({ _gotcha: "  " }, "_gotcha")).toBeNull();
    expect(readHelperField({}, "_gotcha")).toBeNull();
  });
});
