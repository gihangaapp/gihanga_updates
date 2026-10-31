import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeRwandaPhone, toRwandaMsisdn } from "../src/lib/phone";

test("normalizes Rwanda phone formats to E.164", () => {
  for (const value of ["+250 788 123 456", "250788123456", "0788123456", "788123456"]) {
    assert.equal(normalizeRwandaPhone(value), "+250788123456");
    assert.equal(toRwandaMsisdn(value), "250788123456");
  }
});

test("rejects incomplete or non-Rwanda mobile numbers", () => {
  for (const value of ["+250 788 123", "123456789", "+256 772 123 456", "abc"]) {
    assert.throws(() => normalizeRwandaPhone(value));
  }
});

test("uses an explicit EUR mapping only for sandbox provider requests", async () => {
  process.env.MTN_TARGET_ENVIRONMENT = "sandbox";
  process.env.MTN_CURRENCY = "EUR";
  process.env.MTN_SANDBOX_RWF_PER_EUR = "500";
  const { getMomoProviderQuote } = await import("../src/lib/momo");
  assert.deepEqual(getMomoProviderQuote(500), { amount: 1, currency: "EUR", sandboxRwfPerEur: 500 });
  assert.deepEqual(getMomoProviderQuote(1000), { amount: 2, currency: "EUR", sandboxRwfPerEur: 500 });
});
