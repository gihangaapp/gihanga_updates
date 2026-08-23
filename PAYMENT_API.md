# Gihanga Payment API

All endpoints are mounted below `/api/v1`. Consumer endpoints require the existing consumer bearer token. The callback endpoint is public because MTN calls it directly, but it accepts only recognized transaction references and terminal provider states.

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

## `POST /wallet/momo/callback`

MTN callback endpoint. The implementation accepts a recognized `referenceId` or `externalId`, plus one of `PENDING`, `SUCCESSFUL`, or `FAILED`.

```json
{
  "referenceId": "mtn-request-reference",
  "status": "SUCCESSFUL",
  "reason": "optional-provider-reason"
}
```

The implementation also accepts `externalId` when the MTN callback uses the request's external identifier. `PENDING` is acknowledged without a wallet mutation. A terminal callback conditionally claims the pending transaction before applying any financial effect. A repeated callback returns an acknowledgement with `duplicate: true` and does not credit or debit again.

The deployment must use the current callback payload and registration requirements supplied by MTN. The endpoint deliberately does not treat an arbitrary frontend request as proof of payment.

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
