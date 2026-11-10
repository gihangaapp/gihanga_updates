# Payment regression test fixes (2026-11-10)

This update addresses the three failures from Render's `npm run test:payment` run.

## 1. Provider callback/status allow-list

The wallet route now explicitly allow-lists only `PENDING`, `SUCCESSFUL`, and `FAILED` provider states. Both the authenticated status endpoint and callback handler reject any unrecognized value without changing a wallet balance.

## 2. Ambiguous payout submission

An ambiguous Disbursement submission continues to preserve the reserved wallet hold and marks the transaction `SUBMISSION_UNKNOWN` for later MTN reconciliation. The user response explicitly says: "Do not submit it again" to discourage a duplicate payout request.

## 3. History recovery after refresh/restart

The frontend still loads persisted transaction history from the backend on query mount. It polls pending MTN transaction references and refreshes the wallet after status checks. Polling is adaptive: every 5 seconds while a recent MTN transaction is pending, and every 20 seconds otherwise. The regression test now checks that actual behavior rather than requiring a fixed 20-second interval in all states.

## Verification note

Targeted source assertions and TypeScript syntax transpilation passed in the preparation environment. A full `npm ci`, `npm run test:payment`, and `npm run build` could not be completed here because dependency installation timed out. Render should run the same payment test command before TypeScript compilation.
