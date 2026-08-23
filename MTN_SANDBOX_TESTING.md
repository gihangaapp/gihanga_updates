# MTN MoMo Sandbox Testing Guide

## Preconditions

Run MongoDB, start the backend with `backend/.env`, and start the frontend. For live MTN tests, all Collections credentials must be present and valid, the callback host must be publicly reachable over HTTPS, and the MTN sandbox account must be provisioned according to the current developer portal instructions.[1] [2]

Use a test account that owns the wallet under test. Never use real customer credentials or real production phone numbers in the sandbox.

## Internal flow under test

1. The customer submits an amount and Rwanda MTN number to `POST /api/v1/wallet/deposit`.
2. The backend validates the amount and phone number, creates a pending internal transaction, and sends RequestToPay through the backend-only MTN service.
3. A `202` response means the request was accepted for asynchronous processing, not that payment succeeded.
4. The frontend refreshes the wallet and transaction list while the backend obtains the final provider state by callback or by the authenticated status endpoint.
5. The settlement helper changes the transaction and wallet exactly once for a terminal provider state.

## Test matrix

| Test | Procedure | Expected result |
|---|---|---|
| Successful payment | Create a deposit, approve it in the MTN sandbox test flow, then wait for callback or call `GET /api/v1/wallet/momo/status/:transactionId`. | Transaction becomes `completed`; wallet available balance and lifetime increase exactly once; a success notification is created. |
| Failed payment | Create a deposit and cause the MTN sandbox flow to reject or fail it. | Transaction becomes `failed`; no wallet credit occurs; failure reason is stored without exposing provider secrets. |
| Pending payment | Create a deposit and leave it awaiting approval. | Transaction remains `pending`; wallet is not credited; the frontend shows a waiting state and does not create another request on refresh. |
| Callback | POST the provider-shaped callback payload with the transaction reference and `status: SUCCESSFUL` or `FAILED`. | The backend resolves the internal transaction, validates the allowed state, settles it once, and returns a safe acknowledgement. |
| Payment verification | Call the authenticated status endpoint while the provider is pending and after it reaches a terminal state. | The backend, not the frontend, decides the displayed final state. Provider failure is reported as a safe temporary-unavailable error. |
| Duplicate callback | Send the same successful callback twice. | The first call applies settlement; the second returns a duplicate acknowledgement and does not credit the wallet again. |
| Duplicate payment request | Submit the same `idempotencyKey` twice for the same user and payment kind. | The second request returns the existing transaction rather than creating a second MTN request. |
| Invalid amount | Submit zero, a negative value, a decimal, a non-number, or a value below the configured minimum. | The backend returns `400`; no transaction or wallet update is created. |
| Unauthorized payment access | Request another user's transaction status or attempt another user's transaction mutation. | The backend returns `404` or `403` according to the route and never reveals the other user's payment data. |
| MTN timeout or outage | Block the MTN host or use an invalid sandbox configuration. | The payment remains auditable as failed submission or pending according to the failure point; the user receives a generic retry-safe message, not raw provider response content. |
| Server restart while pending | Create a live pending transaction, restart the backend, then poll or deliver the callback. | The pending transaction remains in MongoDB and can be finalized after restart; no in-memory state is required. |
| Same MTN transaction processed twice | Deliver duplicate terminal notifications for the same MTN reference. | The conditional settlement claim allows only one terminal transition to apply wallet effects. |
| Frontend refresh during pending | Refresh or close and reopen the wallet page before approval. | Existing transactions are reloaded; no automatic second payment request is created. |
| User closes checkout before approval | Close the dialog without approving. | The transaction stays pending until MTN reports a final state or an operational expiry policy marks it expired. Closing the browser does not create a success or refund event. |

## Manual callback example

Use only in a controlled local test environment. Replace the placeholder with an actual internal transaction or MTN reference.

```bash
curl -X POST "$BACKEND_URL/api/v1/wallet/momo/callback" \
  -H 'Content-Type: application/json' \
  -d '{"referenceId":"REPLACE_WITH_MTN_REFERENCE","status":"SUCCESSFUL"}'
```

A callback with `status: PENDING` is acknowledged without settlement. Unknown references return `404`. Invalid statuses return `400`.

## Verification checklist

Before declaring the sandbox integration ready, confirm that the transaction record contains an internal reference, MTN reference when available, provider status, currency, sanitized phone field, timestamps, and terminal settlement time. Confirm that a successful deposit credits the wallet only after provider verification, that a failed withdrawal releases its hold once, and that repeated callbacks do not create repeated notifications or financial effects.

## References

[1]: https://momodeveloper.mtn.com/api-documentation/testing "MTN MoMo Sandbox Testing"
[2]: https://momodeveloper.mtn.com/api-documentation/callback "MTN MoMo Callback Documentation"
