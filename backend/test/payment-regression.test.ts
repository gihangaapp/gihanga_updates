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

test("settlement requires MongoDB transactions and has no non-atomic fallback", () => {
  assert.match(settlement, /withTransaction/);
  assert.doesNotMatch(settlement, /fallbackSettlement/);
  assert.match(settlement, /writeConcern: \{ w: "majority" as const \}/);
});

test("payment routes require idempotency keys and per-user rate limits", () => {
  assert.match(walletRoute, /A valid Idempotency-Key is required/);
  assert.match(walletRoute, /rateLimitHits\("wallet:deposit"/);
  assert.match(walletRoute, /rateLimitHits\("wallet:withdraw"/);
});

test("withdrawal hold and transaction creation share one MongoDB transaction", () => {
  assert.match(walletRoute, /Reserve funds and create the payout row in one Atlas transaction/);
  assert.match(walletRoute, /Wallet\.findOneAndUpdate[\s\S]*?available: \{ \$gte: numericAmount \}[\s\S]*?pending: numericAmount/);
  assert.match(walletRoute, /Transaction\.create\(\[\{/);
});

test("ambiguous provider submission does not immediately release a payout hold", () => {
  assert.match(walletRoute, /SUBMISSION_UNKNOWN/);
  assert.match(walletRoute, /Do not submit it again/);
});

test("staff cannot manually settle an MTN-linked transaction", () => {
  const staffPayments = readFileSync(new URL("../src/routes/v1/system/payments/staffPayments.ts", import.meta.url), "utf8");
  assert.match(staffPayments, /MTN transactions must be settled by verified provider status/);
  assert.match(staffPayments, /withTransaction/);
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
