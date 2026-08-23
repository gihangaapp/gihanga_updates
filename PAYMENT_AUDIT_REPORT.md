# Gihanga Updates — MTN MoMo Sandbox Payment Audit

**Author:** Manus AI  
**Review date:** 20 August 2026  
**Scope:** Uploaded `Gihanga_updates.zip` before and after the focused payment hardening changes.

## Executive conclusion

Gihanga Updates already contained a meaningful MTN-shaped implementation: backend Collections RequestToPay for deposits, backend Disbursements Transfer for withdrawals, pending transaction records, wallet holds, a staff payment queue, and a frontend wallet interface. It was not yet safe to describe as a complete MTN integration because credentials and MTN-side callback configuration were absent, final status handling was not sufficiently authoritative, callbacks were not atomically idempotent, and several payment errors exposed raw internal/provider messages.

The uploaded project has now been updated without rewriting unrelated social, creator, staff, authentication, or live-streaming functionality. The MTN client is backend-only and environment-driven, transaction records now carry immutable references and settlement metadata, payment creation supports idempotency, an authenticated status-verification endpoint was added, callback settlement is conditionally idempotent, wallet transactions poll while pending, and the requested setup, testing, API, and security documents were added.

The result is **ready for MTN sandbox credentials and MTN-side configuration**, not proof of a successful real sandbox transaction. The actual sandbox request, callback delivery, and provider payload must still be tested after MTN credentials, product subscriptions, API users, API keys, callback host registration, and test rules are supplied.

## Project architecture found

| Layer | Existing implementation | Payment relevance |
|---|---|---|
| Frontend | Vite/React/TypeScript application under `Frontend/` | Wallet page and hooks call only Gihanga API endpoints. |
| Backend | Express/TypeScript application under `backend/` | Owns authentication, wallet routes, staff payment routes, MTN client, and settlement. |
| Authentication | Existing consumer and staff JWT middleware in `backend/src/middleware/rbac.ts` | Consumer wallet reads and payment creation are authenticated; staff queue requires payment permissions. |
| Database | MongoDB through Mongoose | Persists wallets, transactions, users, notifications, audit logs, and related application data. |
| Wallet | `Wallet` model plus `lib/wallet.ts` ledger helper | Stores available, pending, lifetime, points, and frozen state. |
| Transactions | `Transaction` model | Records deposits, payouts, earnings, tips, fees, bonuses, gifts, and other ledger events. |
| Staff operations | `/api/v1/system/payments` | Lists pending payment records and provides approve/reject actions. |
| External provider | `backend/src/lib/momo.ts` | Calls MTN Collections and Disbursements APIs using backend environment values only. |

## How the original payment system worked

A deposit request accepted an amount and phone number, created a pending deposit transaction, and notified staff. When Collections credentials were configured, the backend sent RequestToPay to MTN and stored the returned reference. When credentials were absent, the transaction stayed pending for staff review. A withdrawal checked available balance, moved the amount to a pending hold, created a pending payout transaction, and optionally sent a Disbursements Transfer request.

The original callback route looked up a transaction by `momoReferenceId`, changed the transaction status, and directly mutated the wallet. It treated a non-pending transaction as already settled, which helped with simple duplicate callbacks, but the check and wallet mutation were not one atomic operation. Concurrent repeated callbacks could therefore race. The original callback also described an unguessable reference as sufficient proof, without an independent callback-authentication mechanism or provider amount/currency comparison.

The frontend wallet page displayed available and pending balances, deposit/withdraw dialogs, and transaction history. The original transaction list did not poll independently, so a pending-to-final transition could wait for a manual page interaction even though the wallet summary refreshed periodically.

## MTN integration already present

The original service implemented the standard MTN MoMo Open API shape for Collections token acquisition, `POST /collection/v1_0/requesttopay`, Collections status lookup, Disbursements token acquisition, `POST /disbursement/v1_0/transfer`, and Disbursements status lookup. It sent subscription keys, bearer tokens, `X-Reference-Id`, `X-Target-Environment`, and JSON payment bodies from the backend.

This direction aligns with MTN's documented asynchronous RequestToPay model, where a request acceptance response is not final payment confirmation and a callback or status result communicates the terminal state.[1] [2] The current MTN developer portal remains the source of truth for product provisioning, sandbox credentials, callback registration, and the exact account-specific payload behavior.[3] [4]

## What was working before changes

The following pieces were useful and were preserved: authenticated consumer wallet access; authenticated deposit and withdrawal creation; wallet freeze checks; minimum amount checks; withdrawal balance holds; separate Collections and Disbursements credential groups; staff payment queue and permissions; pending, completed, failed, and cancelled transaction states; a backend-only MTN service boundary; persisted MongoDB transaction records; and a user-facing wallet history.

## What was incomplete or incorrectly implemented

The original implementation was incomplete as a real integration because no real MTN sandbox credentials or MTN-side callback configuration were included, the frontend had no dedicated backend status-verification route, transaction creation lacked request idempotency, callback settlement was not atomic, callback authenticity was not established, provider amount/currency were not checked, and operational reconciliation for long-lived pending records was absent.

The original code also returned raw `error.message` or provider response text in several payment error responses. That could disclose implementation details or provider response content. The updated MTN path returns generic user-safe failure messages while retaining structured failure fields in the transaction record.

## Duplicate and false-credit analysis

Duplicate payments could occur when the browser or a network retry submitted the same request more than once, because each original submission created a new transaction and MTN request. The update adds a persisted idempotency key and the frontend sends a UUID for each payment action. A retry that reuses the key returns the existing transaction.

Duplicate callbacks could cause repeated wallet operations because the original route checked status and then separately saved the wallet and transaction. The update uses a conditional pending-to-terminal claim and applies wallet effects only for the caller that successfully claims the transaction. MongoDB transactions are used when the deployment supports them, with an atomic conditional fallback for standalone local MongoDB.

A user could receive balance without actually paying if an attacker could forge an accepted callback, if an operator approved an unverified deposit, or if a future route trusted a client-provided success field. The updated frontend cannot declare success, and the live path requires backend MTN status or callback processing. Provider callback authentication and exact amount/currency validation remain mandatory account-specific follow-up before production.

A successful payment could remain pending if the callback host were unreachable, if MTN did not deliver a callback, if the backend were unavailable during delivery, or if the application never polled the provider. The update adds an authenticated status endpoint and frontend transaction polling. A scheduled reconciliation process for old pending records is still recommended.

Refreshing or closing the payment page does not create a second payment automatically. The transaction remains persisted and is reloaded on the next visit. Closing before phone approval therefore leaves the payment pending until MTN reports a final result or an explicit expiry process marks it expired.

## Wallet, creator earnings, and withdrawals

Wallet collection and withdrawal flows are separate from creator earnings and future disbursement operations. Successful deposits credit the wallet only after terminal provider settlement. Withdrawals hold funds before provider submission and release the hold exactly once on failure or finalize it on success. Existing creator earnings and staff functionality were not rewritten.

The broader application still uses the existing ledger helper for earnings, tips, points conversions, and staff adjustments. Before production financial use, staff approve/reject operations should be routed through the same atomic settlement helper used by MTN terminal events, and all financial mutations should be covered by a shared audit policy.

## Environment and secret review

`backend/.env.example` now documents backend-only `MTN_*` placeholders for sandbox mode, base URL, target environment, currency, callback URL, separate Collections credentials, separate Disbursements credentials, and an optional callback token placeholder. No real credentials were added. `backend/.env` remains ignored by Git. The frontend has no MTN credential variables and receives only boolean configuration flags.

The code no longer returns raw MTN request bodies or raw provider error text from the hardened payment request and status paths. Logs and deployment diagnostics must still be reviewed to ensure environment values are not printed by infrastructure or debugging tools.

## Implemented files and changes

| File | Change |
|---|---|
| `backend/src/lib/momo.ts` | Backend-only environment-driven service; normalized Rwanda phone numbers; separate products; sanitized provider errors; status functions. |
| `backend/src/lib/paymentSettlement.ts` | Conditional, idempotent terminal settlement with Mongo transaction support and local standalone fallback. |
| `backend/src/models/Transaction.ts` | Immutable internal reference, idempotency key, provider, currency, customer phone, reason, metadata, and settlement timestamp fields/indexes. |
| `backend/src/routes/v1/wallet/wallet.ts` | Strict amount/phone validation, idempotent deposit/withdrawal creation, authenticated provider status route, safer callback settlement, and generic MTN errors. |
| `Frontend/src/hooks/use-wallet.ts` | Client request idempotency keys, expanded status union, and transaction polling. |
| `backend/.env.example` | Clean MTN-prefixed placeholders without secrets. |
| `MTN_SANDBOX_SETUP.md` | Credential placement, sandbox setup, callback, and production transition guide. |
| `MTN_SANDBOX_TESTING.md` | Twelve requested test scenarios and expected behavior. |
| `PAYMENT_API.md` | Internal endpoint and state documentation. |
| `PAYMENT_SECURITY_AUDIT.md` | Security findings, remediations, and residual risks. |

## Verification performed

The backend dependency installation completed successfully and `npx tsc --noEmit` completed with exit code 0 after the payment changes. The frontend dependency installation and production build completed with exit code 0. This verifies compilation and bundling, but it does not substitute for an MTN sandbox transaction because credentials and MTN-side configuration were not supplied.

## Final readiness decision

The project is **prepared for the next MTN sandbox step**: place genuine MTN sandbox values in the backend environment, configure the callback host according to MTN's current portal requirements, start MongoDB/backend/frontend, and execute the testing matrix. Do not switch to production or describe the integration as fully live until the actual provider flow, callback/status verification, duplicate callback behavior, wallet settlement, and failure recovery have been observed with MTN's current Rwanda sandbox configuration.

## References

[1]: https://momodeveloper.mtn.com/api-documentation/api-description "MTN MoMo API Description"
[2]: https://momodeveloper.mtn.com/api-documentation/callback "MTN MoMo Callback Documentation"
[3]: https://momodeveloper.mtn.com/api-documentation/getting-started "MTN MoMo Getting Started"
[4]: https://momodeveloper.mtn.com/api-documentation/testing "MTN MoMo Sandbox Testing"
