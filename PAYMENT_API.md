# Gihanga Payment API

All endpoints are mounted below `/api/v1`. Consumer endpoints require the existing consumer bearer token. The callback endpoint is public because MTN calls it directly. Its reference is used only to locate a saved transaction; the backend queries MTN for the authoritative state before applying a wallet change.

## `GET /wallet/me`

Returns the authenticated user's wallet summary and whether Collections and Disbursements credentials are configured. Configuration flags are booleans only; no secret or access token is returned.

## `GET /wallet/transactions`

Returns the authenticated user's paginated wallet transaction history. It never accepts a user ID from the client for ownership selection.

## `POST /wallet/deposit`

Creates an MTN Collections RequestToPay transaction.

```json
{
  "amount": 5000,
  "phoneNumber": "0781234567",
  "idempotencyKey": "client-generated-uuid"
}
```

The backend validates the amount as a safe integer at or above the configured minimum and normalizes the Rwanda MSISDN. The returned `202` response means that the asynchronous payment request was accepted for processing. It does not mean that the payment is successful.

The response contains a transaction object, a user-safe message, and `mode`, which is either `live` or `simulated`. If the same user submits the same `idempotencyKey` for a deposit, the existing transaction is returned.

## `POST /wallet/withdraw`

Creates an MTN Disbursements Transfer request after checking wallet ownership, wallet freeze state, and available balance. The amount is held in `wallet.pending` before the provider request is sent.

```json
{
  "amount": 1000,
  "phoneNumber": "0781234567",
  "idempotencyKey": "client-generated-uuid"
}
```

A successful provider callback completes the payout and releases the pending hold. A failed provider callback returns the held amount to available balance exactly once.

## `GET /wallet/momo/status/:transactionId`

Authenticates the consumer and verifies ownership of the internal transaction. The backend calls the appropriate MTN status endpoint using the server-side credentials. Terminal MTN states are passed through the idempotent settlement layer. The frontend cannot submit a success state.

## MTN callback routes

The backend exposes these public routes:

- `GET /wallet/momo/callback` and `GET /wallet/momo/callback/:referenceId` — reachability checks only. They never change payment state.
- `POST` and `PUT /wallet/momo/callback` — callback requests without a reference in the path; the body must include `referenceId` or `externalId`.
- `POST` and `PUT /wallet/momo/callback/:referenceId` — callback requests with the MTN reference in the path. The path reference takes priority over body fields.

The callback body is not treated as proof of success. The backend finds the saved transaction and calls the appropriate MTN status endpoint using its stored MTN reference. Only MTN's authoritative `PENDING`, `SUCCESSFUL`, or `FAILED` result is passed to the idempotent settlement helper. A repeated terminal callback cannot credit or debit the wallet twice.

The payment request includes `X-Callback-Url` when `MTN_CALLBACK_URL` is configured. The backend appends the transaction reference ID to that base URL and saves the same reference before submitting the request. The callback hostname must exactly match the API User's registered `providerCallbackHost`.

## State model

| Internal state | Meaning | Financial effect |
|---|---|---|
| `created` | Reserved state for a transaction before provider submission | None |
| `pending` | Provider request is awaiting final result or simulated admin review | Deposit is not credited; payout hold remains pending |
| `completed` | Provider verified success or authorized admin completion | Deposit credited or payout hold finalized once |
| `failed` | Provider or submission failure | No deposit credit; payout hold released once |
| `cancelled` | Administrative cancellation | No new credit; applicable payout hold is released by the administrative workflow |
| `expired` | Operational timeout state | Must not be treated as success |

## Provider boundary

Only `backend/src/lib/momo.ts` calls MTN. Controllers call service functions and settlement functions instead of constructing MTN URLs or authentication headers. The service supports sandbox and production through environment configuration, while wallet business logic remains unchanged between environments.
