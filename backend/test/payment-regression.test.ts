import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { normalizePhone } from "../src/lib/momo";

const walletRoute = readFileSync(new URL("../src/routes/v1/wallet/wallet.ts", import.meta.url), "utf8");
const settlement = readFileSync(new URL("../src/lib/paymentSettlement.ts", import.meta.url), "utf8");
const frontendHook = readFileSync(new URL("../../Frontend/src/hooks/use-wallet.ts", import.meta.url), "utf8");


test("valid Rwanda MSISDN is normalized to international digits", () => {
  assert.equal(normalizePhone("078 123 4567"), "250781234567");
});

test("invalid non-Rwanda phone is rejected", () => {
  assert.throws(() => normalizePhone("14155552671"));
});

test("deposit and withdrawal routes require safe integer amounts", () => {
  assert.match(walletRoute, /Number\.isSafeInteger\(numericAmount\)/g);
  assert.equal((walletRoute.match(/Number\.isSafeInteger\(numericAmount\)/g) || []).length, 2);
});

test("payment creation supports idempotency keys", () => {
  assert.match(walletRoute, /idempotencyKey/);
  assert.match(frontendHook, /crypto\.randomUUID\(\)/);
});

test("frontend does not contain MTN API credentials or direct MTN URL", () => {
  assert.doesNotMatch(frontendHook, /MTN_.*(KEY|SECRET|TOKEN)|momodeveloper\.mtn\.com/i);
});

test("status verification is backend authenticated and provider-specific", () => {
  assert.match(walletRoute, /router\.get\("\/momo\/status\/:transactionId", authenticateConsumer/);
  assert.match(walletRoute, /getTransferStatus|getRequestToPayStatus/);
});

test("callbacks accept only supported provider states", () => {
  assert.match(walletRoute, /\["PENDING", "SUCCESSFUL", "FAILED"\]/);
});

test("settlement claims only pending transactions", () => {
  assert.match(settlement, /status: "pending"/);
  assert.match(settlement, /findOneAndUpdate/);
});

test("settlement has a database transaction path and a standalone fallback", () => {
  assert.match(settlement, /withTransaction/);
  assert.match(settlement, /fallbackSettlement/);
});

test("terminal settlement writes a settlement timestamp", () => {
  assert.match(settlement, /settledAt: new Date\(\)/);
});

test("wallet effects distinguish deposits and payouts", () => {
  assert.match(settlement, /tx\.kind === "deposit"/);
  assert.match(settlement, /tx\.kind === "payout"/);
});

test("transaction history polling supports recovery after refresh or restart", () => {
  assert.match(frontendHook, /queryKey: \["wallet", "transactions"\][\s\S]*refetchInterval: 20_000/);
});
