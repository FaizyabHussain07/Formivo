import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { verifyPaddleSignature, planForPriceId } from "./paddle";
import { PLANS, PLAN_ORDER, isPaidPlan, planFor } from "./plans";

const SECRET = "test_webhook_secret";

function sign(body: string, timestamp = Math.floor(Date.now() / 1000)) {
  const digest = createHmac("sha256", SECRET).update(`${timestamp}:${body}`).digest("hex");
  return `ts=${timestamp};h1=${digest}`;
}

describe("verifyPaddleSignature", () => {
  it("accepts a correctly signed payload", () => {
    const body = JSON.stringify({ event_id: "evt_1", event_type: "subscription.created" });
    expect(verifyPaddleSignature(body, sign(body), SECRET)).toBe(true);
  });

  it("rejects a payload whose body changed after signing", () => {
    const body = JSON.stringify({ event_id: "evt_1" });
    const header = sign(body);
    expect(verifyPaddleSignature(`${body} `, header, SECRET)).toBe(false);
  });

  it("rejects a signature made with another secret", () => {
    const body = "{}";
    const digest = createHmac("sha256", "other_secret")
      .update(`${Math.floor(Date.now() / 1000)}:${body}`)
      .digest("hex");
    const header = `ts=${Math.floor(Date.now() / 1000)};h1=${digest}`;
    expect(verifyPaddleSignature(body, header, SECRET)).toBe(false);
  });

  it("rejects a stale signature so a captured request cannot be replayed", () => {
    const body = "{}";
    const old = Math.floor(Date.now() / 1000) - 3600;
    expect(verifyPaddleSignature(body, sign(body, old), SECRET)).toBe(false);
  });

  it("rejects a missing or malformed header", () => {
    expect(verifyPaddleSignature("{}", null, SECRET)).toBe(false);
    expect(verifyPaddleSignature("{}", "h1=abc", SECRET)).toBe(false);
    expect(verifyPaddleSignature("{}", "ts=abc;h1=abc", SECRET)).toBe(false);
  });
});

describe("plan configuration", () => {
  it("orders plans by increasing limits", () => {
    const ordered = PLAN_ORDER.map((key) => PLANS[key]);
    for (let index = 1; index < ordered.length; index += 1) {
      expect(ordered[index]!.priceMonthly).toBeGreaterThan(ordered[index - 1]!.priceMonthly);
      expect(ordered[index]!.forms).toBeGreaterThan(ordered[index - 1]!.forms);
      expect(ordered[index]!.monthlyLeads).toBeGreaterThan(ordered[index - 1]!.monthlyLeads);
      expect(ordered[index]!.viewers).toBeGreaterThan(ordered[index - 1]!.viewers);
    }
  });

  it("keeps Free without export and without checkout", () => {
    expect(PLANS.free.canExportSubmissions).toBe(false);
    expect(isPaidPlan("free")).toBe(false);
    expect(isPaidPlan("light")).toBe(true);
  });

  it("falls back to Free for unknown plan keys and price ids", () => {
    expect(planFor("enterprise").key).toBe("free");
    expect(planFor(undefined).key).toBe("free");
    expect(planForPriceId("pri_unknown")).toBeNull();
    expect(planForPriceId(undefined)).toBeNull();
  });
});
