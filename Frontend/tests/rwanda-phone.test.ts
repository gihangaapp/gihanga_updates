import { test } from "node:test";
import assert from "node:assert/strict";
import { formatRwandaPhoneInput, normalizeRwandaPhone, RWANDA_PHONE_PREFIX } from "../src/lib/rwanda-phone";

test("always shows the protected +250 7 prefix, including for an empty input", () => {
  assert.equal(formatRwandaPhoneInput(""), "+250 7");
  assert.equal(formatRwandaPhoneInput("+250 7"), "+250 7");
  assert.equal(RWANDA_PHONE_PREFIX, "+250 7");
});

test("formats all common Rwanda phone forms with grouped subscriber digits", () => {
  for (const value of ["+250 788 123 456", "250788123456", "0788123456", "788123456"]) {
    assert.equal(formatRwandaPhoneInput(value), "+250 788 123 456");
    assert.equal(normalizeRwandaPhone(value), "+250788123456");
  }
});

test("accepts typing the eight subscriber digits after the fixed prefix", () => {
  assert.equal(formatRwandaPhoneInput("+250 78"), "+250 78");
  assert.equal(formatRwandaPhoneInput("+250 78812"), "+250 788 12");
  assert.equal(formatRwandaPhoneInput("+250 788123456"), "+250 788 123 456");
});

test("rejects incomplete Rwanda phone numbers", () => {
  for (const value of ["+250 7", "+250 788 123", "123456789", "+256 772 123 456"]) {
    assert.throws(() => normalizeRwandaPhone(value));
  }
});
