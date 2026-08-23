# Payment Security Audit

## Scope

This audit reviewed the uploaded Gihanga Updates frontend, backend routes, authentication middleware, wallet model, transaction model, MTN client, callback route, staff payment queue, environment configuration, and wallet UI. The review focused on preventing unauthorized balance changes, duplicate settlement, provider-secret exposure, and false payment success.

## Findings and remediation

| Area | Finding in the original implementation | Remediation in this update | Residual consideration |
|---|---|---|---|
| Frontend trust | The frontend could initiate a payment but the original design had no backend status endpoint for the UI to verify a final provider state. | Added authenticated backend status verification and frontend polling of the transaction list. | The MTN sandbox must be configured for the actual callback/status behavior supplied for the account. |
| Duplicate callbacks | The original callback checked `tx.status` in application memory and then separately changed the wallet, allowing concurrent duplicate callbacks to race. | Added a conditional pending-to-terminal settlement claim and Mongo transaction support with standalone fallback. | Production should use a Mongo replica set or managed Mongo deployment so settlement runs atomically. |
| Duplicate payment requests | The original deposit and withdrawal routes created a new transaction on every submission. | Added optional `idempotencyKey` persistence and lookup; frontend now generates a UUID per payment action. | A client retry must reuse the same key; a new user action should intentionally use a new key. |
| Callback authenticity | The original comment treated an unguessable reference as sufficient proof, but a public callback was not independently authenticated and did not verify provider amount or currency. | Callback now accepts only recognized transaction references and allowed statuses; provider status verification is available through the backend. | Confirm whether MTN provisions signed callbacks, mTLS, IP allowlisting, or another authentication mechanism for the account, then enable that exact mechanism. Add amount/currency comparison against the provider payload when those fields are present. |
| Secret exposure | MTN secrets were backend environment values and were not sent to the frontend, which was correct. | Preserved the backend-only boundary and sanitized provider errors. | Deployment infrastructure must also prevent `.env`, logs, diagnostics, and source maps from being public. |
| Error leakage | Several original routes returned `error.message` or raw provider response content to clients. | MTN request failures now return safe generic user messages; the status endpoint does the same. | A wider application-wide error-handling review remains advisable for non-payment routes. |
| Amount validation | Original validation allowed decimal, non-finite, and potentially unexpected numeric values. | Amounts are required to be safe integers and minimums are enforced server-side. | Add product-specific maximums and an allowlisted product/price catalog if the platform later sells fixed products. |
| Phone validation | Original code only checked that a string existed. | Rwanda MSISDN normalization and validation occur before a payment record is sent to MTN. | Confirm the exact supported MSISDN format for the MTN Rwanda sandbox account. |
| Wallet credit timing | Deposits were pending before callbacks, but the original callback could credit on any matching `SUCCESSFUL` status without a provider amount/currency comparison. | Credit occurs only in the backend settlement path after terminal provider status; no frontend success field is trusted. | Complete provider amount/currency validation once the exact callback/status payload is confirmed. |
| Withdrawal holds | Original code held funds before transfer, which was directionally correct, but duplicate callbacks and concurrent administrative actions could repeat effects. | Idempotent settlement releases or finalizes the hold once. | Administrative approve/reject routes should also be migrated to the same atomic settlement helper before production financial use. |
| Transaction records | Original model lacked an immutable internal reference, explicit currency, customer phone, failure reason, and settlement timestamp. | Added those fields, provider fields, idempotency key, and indexes. | Existing records created before migration may have generated defaults only when subsequently saved; run a controlled data migration if historical completeness is required. |
| Restart behavior | Pending transactions were persisted in MongoDB, so a restart did not erase them, but there was no status verification endpoint. | Pending transactions survive restart and can be recovered by callback or authenticated status polling. | Add a scheduled reconciliation worker for long-lived pending records before production. |
| CORS and sockets | HTTP CORS and Socket.IO configuration should be reviewed for deployment; the original Socket.IO server allowed `origin: "*"`. | Payment endpoints remain behind the existing HTTP authentication boundary; no payment secrets are placed in sockets. | Restrict Socket.IO origins to the deployed frontend origin and require HTTPS in production. |
| Rate limiting | No payment-specific rate limiting was found in the reviewed routes. | No broad middleware rewrite was introduced to avoid breaking existing functionality. | Add per-user and per-IP limits for deposit, withdrawal, status, and callback endpoints at the application or gateway layer. |
| NoSQL injection | Amount and phone are converted/normalized, and user ownership is derived from the authenticated token. | Payment status lookup is scoped to the authenticated user. | Add centralized request schemas and ObjectId validation across all staff and payment routes. |

## Original payment behavior

The original system had a real MTN-shaped service in `backend/src/lib/momo.ts` for Collections RequestToPay and Disbursements Transfer. Deposit requests created a pending `Transaction`, called MTN when credentials were present, and otherwise entered a simulated pending queue for staff approval. Withdrawals moved available funds into a pending hold before attempting transfer. The callback route then changed transaction state and mutated the wallet.

This was a useful starting point, but it was not production-safe as a payment integration because the initial HTTP `202` was not itself treated as final success only by convention, callback processing was not atomic, callbacks were not independently authenticated, provider amount/currency were not compared, and payment errors could expose raw messages.

## Answers to the requested risk questions

| Question | Audit answer |
|---|---|
| What causes duplicate payments? | Repeated client submissions, missing idempotency keys, concurrent callbacks, and separate wallet mutation from transaction state mutation. The first two are addressed; callback settlement is now conditionally claimed. |
| What credits balance without payment? | A forged or insufficiently authenticated callback, an administrative approval of an unverified deposit, or a future controller that trusts a frontend success field. The updated live path no longer trusts the frontend, but MTN callback authentication and provider amount/currency checks still need account-specific completion. |
| What leaves success pending? | Callback delivery failure, unreachable callback host, provider status not polled, or a server error during settlement. The new status endpoint and persisted records improve recovery; a reconciliation worker is still recommended. |
| What happens on duplicate callback? | The first terminal callback claims the pending transaction; later callbacks find no pending row and do not repeat wallet effects. |
| What happens on refresh or close? | The browser reloads persisted transactions and polling resumes. No new payment is created automatically. Closing before approval leaves the provider transaction pending until a final result or expiry policy. |
| What happens on MTN outage? | Submission failure is returned as a safe retryable error and the failed request is recorded. Status-check failure returns a generic temporary-unavailable response without exposing provider details. |
| What happens on restart? | Pending transactions remain in MongoDB and can be handled through callback or status verification; no in-memory payment state is required. |
| Are secrets exposed to the frontend? | No MTN secret or access token is returned by the reviewed wallet API. Keep only non-secret configuration flags in frontend responses. |
| Is the model reliable? | The original model was a useful ledger history but lacked idempotency and settlement metadata. It now has immutable internal/provider references and settlement fields; Mongo replica-set transactions are recommended for production. |
| Can production credentials be supported later? | Yes, the MTN client reads backend environment configuration and keeps Collections and Disbursements credentials separate. MTN-side production callback and account provisioning remain required. |

## High-priority remaining work before real money

The project is **sandbox-prepared, not certified as production-ready**. Before real financial use, implement provider payload amount/currency validation, confirm and enforce MTN callback authentication, add payment rate limiting, migrate staff approval to the atomic settlement helper, add pending-payment reconciliation/expiry, restrict Socket.IO origins, and test against the actual MTN Rwanda sandbox account with the credentials and callback setup supplied by MTN.
