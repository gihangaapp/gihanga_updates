import { test } from "node:test";
import assert from "node:assert/strict";
import { formatRwandaPhoneInput, normalizeRwandaPhone } from "../src/lib/rwanda-phone";

test("formats Rwanda phone input with +250 prefix and grouped digits", () => {
  for (const value of ["+250 788 123 456", "250788123456", "0788123456", "788123456"]) {
    assert.equal(formatRwandaPhoneInput(value), "+250 788 123 456");
    assert.equal(normalizeRwandaPhone(value), "+250788123456");
  }
});

test("keeps a country prefix usable while typing", () => {
  assert.equal(formatRwandaPhoneInput("+2"), "+2");
  assert.equal(formatRwandaPhoneInput("+25"), "+25");
  assert.equal(formatRwandaPhoneInput("+250"), "+250");
  assert.equal(formatRwandaPhoneInput("078"), "+250 78");
});

test("rejects incomplete Rwanda phone numbers", () => {
  assert.throws(() => normalizeRwandaPhone("+250 788 123"));
});
