# Atlas Atomic Wallet Hardening

## Atlas topology verification

The operator verified the Atlas deployment with `db.adminCommand({ hello: 1 })`.
The response included a replica-set `setName`, three hosts and `isWritablePrimary: true`.
No Atlas topology change is required for multi-document transactions.

## Changes in this update

- MTN terminal settlement claims only a transaction still in `pending` state and commits the transaction status and wallet effect in one MongoDB transaction.
- The previous non-atomic fallback has been removed. If an Atlas transaction aborts, neither the transaction state nor the wallet balance is committed.
- Transactions use primary read preference, snapshot read concern and majority write concern.
- Payout settlement verifies that the wallet contains the matching pending hold before completing or refunding it.
- Failed Collections deposits do not credit the wallet.
- Payout reservation and creation of its pending transaction now happen in one MongoDB transaction.
- Deposit and withdrawal requests require an idempotency key; the current frontend already generates UUID keys.
- Per-user limits are applied: up to five deposit attempts and three withdrawal attempts per hour.
- Ambiguous provider submission results (network errors, 5xx, timeout/conflict/rate-limit responses) remain pending for status reconciliation. They are not automatically refunded while MTN may already have accepted the request.
- Clearly rejected provider 4xx responses use the same atomic failed-settlement path.
- Staff cannot manually approve or reject MTN-linked transactions. Those must be settled from the backend's verified provider status.
- Manual non-MTN staff payment actions update the wallet, transaction and audit record within a single MongoDB transaction.

## Deploy notes

- This project uses `REDIS_URL` for shared rate-limit counters in a multi-instance deployment. Keep Redis configured in Render.
- Do not upload `.env` files or secrets to GitHub or project ZIPs. Use Render/Vercel environment settings and rotate any credential that was previously exposed.
- Keep MTN in sandbox while validating these changes.
- Run `npm ci`, `npm run build` and `npm run test:payment` from `backend/` before deployment.

## Verification limitation for this ZIP

The `node_modules` directory bundled in the supplied archive was incomplete (including missing `@types` packages and the `tsx` executable), so a full local `tsc` build and test runner could not be completed here. The modified TypeScript files passed compiler syntax transpilation, and targeted source assertions and ZIP integrity checks were run. Render's clean dependency install/build remains required before deployment.
