## Currency handling: wallet RWF vs MTN sandbox EUR

Gihanga wallet balances, deposits, withdrawals, and transaction history are denominated in **RWF**. MTN sandbox accepts **EUR**, so the backend converts only the provider request using `MTN_SANDBOX_RWF_PER_EUR`. This variable is a deliberately configured test mapping, not a market FX rate. The sandbox status response amount and currency must match the saved provider quote before the wallet can be credited. For an authorized Rwanda production integration, use `MTN_TARGET_ENVIRONMENT=mtnrwanda` and `MTN_CURRENCY=RWF`, and remove `MTN_SANDBOX_RWF_PER_EUR`. Production credentials and go-live approval are supplied through MTN onboarding.

# MTN MoMo Sandbox Testing Guide

## Preconditions

Run MongoDB, start the backend with `backend/.env`, and start the frontend. For MTN Rwanda sandbox callback tests, follow the portal documentation for the callback URL scheme (the current FAQ says HTTP for sandbox and HTTPS for production), register the exact callback hostname, and include the callback URL in each RequestToPay/Transfer request.[1] [2] Vercel serves deployments over HTTPS and may upgrade incoming HTTP requests, so verify the actual MTN callback behavior on this domain; do not assume a browser GET proves callback delivery.

Use a test account that owns the wallet under test. Never use real customer credentials or real production phone numbers in the sandbox.

## Sandbox test MSISDN override

The wallet UI and database continue to accept/store Rwanda phone numbers in canonical form. To use the synthetic MTN sandbox fixture that was already confirmed successful in this project's direct Collection test, set `MTN_SANDBOX_TEST_MSISDN=46733123499` on the Render backend while `MTN_TARGET_ENVIRONMENT=sandbox`. The override affects only the MSISDN sent to MTN Collections in sandbox; it does not replace the saved Rwanda contact number. The code ignores this override outside sandbox. Remove it before any authorized production configuration.

The sandbox fixture is not a real customer number and does not represent a real wallet. Keep testing in the MTN sandbox only.

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
| Callback | Allow MTN to send its callback using PUT (POST is also accepted) to the per-transaction callback URL. | The backend resolves the saved reference, fetches status directly from MTN, and settles only the provider-confirmed terminal state. |
| Payment verification | Call the authenticated status endpoint while the provider is pending and after it reaches a terminal state. | The backend, not the frontend, decides the displayed final state. Provider failure is reported as a safe temporary-unavailable error. |
| Duplicate callback | Have MTN deliver the same callback more than once for a test transaction. | The backend re-checks MTN status; the conditional settlement changes the wallet at most once. |
| Duplicate payment request | Submit the same `idempotencyKey` twice for the same user and payment kind. | The second request returns the existing transaction rather than creating a second MTN request. |
| Invalid amount | Submit zero, a negative value, a decimal, a non-number, or a value below the configured minimum. | The backend returns `400`; no transaction or wallet update is created. |
| Unauthorized payment access | Request another user's transaction status or attempt another user's transaction mutation. | The backend returns `404` or `403` according to the route and never reveals the other user's payment data. |
| MTN timeout or outage | Block the MTN host or use an invalid sandbox configuration. | The payment remains auditable as failed submission or pending according to the failure point; the user receives a generic retry-safe message, not raw provider response content. |
| Server restart while pending | Create a live pending transaction, restart the backend, then poll or deliver the callback. | The pending transaction remains in MongoDB and can be finalized after restart; no in-memory state is required. |
| Same MTN transaction processed twice | Deliver duplicate terminal notifications for the same MTN reference. | The conditional settlement claim allows only one terminal transition to apply wallet effects. |
| Frontend refresh during pending | Refresh or close and reopen the wallet page before approval. | Existing transactions are reloaded; no automatic second payment request is created. |
| User closes checkout before approval | Close the dialog without approving. | The transaction stays pending until MTN reports a final state or an operational expiry policy marks it expired. Closing the browser does not create a success or refund event. |

## Safe callback route check

After deploying both projects, make a browser GET request to the Vercel callback path using a non-real test label:

```bash
curl -i "https://gihanga-test.vercel.app/api/v1/wallet/momo/callback/route-check"
```

Expected result: HTTP `200` with `ok: true` and `acceptedMethods: ["POST", "PUT"]`. This only confirms that Vercel forwarded the GET request to the backend route; it does not prove MTN callback delivery or change any wallet balance.

Do not send a made-up `SUCCESSFUL` callback to simulate payment. For a real sandbox callback test, use the reference created by an actual sandbox payment and let MTN call the URL. The handler ignores callback status as payment proof and queries MTN's status API itself. Unknown references should return `404 Transaction not found`; the route should not return `Endpoint not found`.

MTN documents callbacks as one-shot with no automatic retry. When a callback is missed, use the authenticated `GET /api/v1/wallet/momo/status/:transactionId` endpoint to verify the saved transaction with MTN.[2]

## Verification checklist

Before declaring the sandbox integration ready, confirm that the transaction record contains an internal reference, MTN reference when available, provider status, currency, sanitized phone field, timestamps, and terminal settlement time. Confirm that a successful deposit credits the wallet only after provider verification, that a failed withdrawal releases its hold once, and that repeated callbacks do not create repeated notifications or financial effects.

## References

[1]: https://momodeveloper.mtn.com/api-documentation/testing "MTN MoMo Sandbox Testing"
[2]: https://momodeveloper.mtn.com/api-documentation/callback "MTN MoMo Callback Documentation"
