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
  assert.ok(
    /\["PENDING", "SUCCESSFUL", "FAILED"\]/.test(walletRoute),
    "wallet route must explicitly allow-list PENDING, SUCCESSFUL, and FAILED",
  );
  assert.equal(
    (walletRoute.match(/if \(!isSupportedMomoProviderState\(provider\.status\)\)/g) || []).length,
    2,
    "both status polling and callbacks must reject unrecognized provider states",
  );
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
  assert.ok(/SUBMISSION_UNKNOWN/.test(walletRoute), "ambiguous payout submissions must remain in reconciliation state");
  assert.ok(/Do not submit it again/.test(walletRoute), "the response must warn against retrying an ambiguous payout");
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
  const start = frontendHook.indexOf("export function useWalletTransactions()");
  const end = frontendHook.indexOf("export function useDeposit()");
  assert.notEqual(start, -1, "wallet transaction query must exist");
  assert.notEqual(end, -1, "wallet transaction query must end before mutations");
  const hook = frontendHook.slice(start, end);

  // A mount/refresh/restart starts by loading the server-persisted transaction
  // history, then verifies pending MTN references through the authenticated API.
  assert.ok(/queryKey: \["wallet", "transactions"\]/.test(hook), "transaction history must have a stable query key");
  assert.ok(/api\.get<\{ transactions: WalletTransaction\[\] \}>\("\/wallet\/transactions"\)/.test(hook), "history must reload from the server after a mount or restart");
  assert.ok(/pendingMomo\.map\(\(tx\) => api\.get\(`\/wallet\/momo\/status\/\$\{encodeURIComponent\(tx\._id\)\}`\)\)/.test(hook), "pending MTN references must be checked against the backend");

  // Poll more frequently while a recent MTN transaction is pending, and keep
  // a slower refresh interval once no pending MTN transaction remains.
  assert.ok(/refetchInterval: \(query\) =>/.test(hook), "history must poll periodically");
  assert.ok(/return hasRecentPendingMomo \? 5_000 : 20_000/.test(hook), "pending payments poll every 5 seconds and idle history every 20 seconds");
});
