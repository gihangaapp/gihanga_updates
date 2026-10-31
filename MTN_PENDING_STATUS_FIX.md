# MTN pending-deposit status fix

## Why a successful RequestToPay can remain Pending

MTN RequestToPay is asynchronous. HTTP 202 means the request was accepted into MTN processing, not that it has completed. The final status is `SUCCESSFUL` or `FAILED` after the sandbox scenario is processed. MTN documents one-shot callbacks and recommends polling the transaction-status endpoint if a callback is not received.

## Changes in this update

- Added a backend reconciliation sweeper. It polls recent pending MTN wallet transactions and settles only after the authoritative MTN status is `SUCCESSFUL` or `FAILED`.
- Added client-side status polling for recent pending MTN transactions while the wallet page is open.
- Kept wallet amounts in RWF and verifies the provider amount/currency against the stored sandbox quote before crediting. A mismatch is marked `REVIEW_REQUIRED` and does not change the wallet balance.
- Added server-side diagnostic logging for status and callback verification failures without returning credentials to clients.
- The shared phone input always displays `+250 7` by default. The prefix cannot be removed with Backspace/Delete; only the remaining eight subscriber digits are editable. Full Rwanda numbers can still be pasted.

## Optional Render settings

```env
MTN_RECONCILIATION_INTERVAL_MS=20000
MTN_RECONCILIATION_BATCH_SIZE=10
```

The defaults are 20 seconds and 10 pending requests. These settings are optional. Keep the integration in sandbox during testing.
