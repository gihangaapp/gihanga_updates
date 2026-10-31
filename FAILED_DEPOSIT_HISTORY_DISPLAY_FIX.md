# Failed MoMo deposit history display fix

## Root cause

The wallet history UI colored any transaction with a non-negative amount green and prefixed it with `+`, regardless of its status. MTN deposits are stored as positive ledger amounts at creation, while their status remains `pending`; when MTN returns `FAILED`, the amount remains positive for audit/history purposes, but it must not be presented as credited funds.

## Changes

- Transaction status now controls the icon, color, status label, and amount prefix.
- `completed` transactions show their signed amount (`+` for a completed deposit).
- `pending`/`created` transactions show a neutral amount without a plus sign.
- `failed` transactions show a red failure state, the text `Failed — no money added`, and the amount without a plus sign.
- `cancelled` and `expired` transactions also do not show a positive credit.
- Added optional failure/provider reason fields to the frontend transaction type for future diagnostics.

## Expected behavior

For the failed transaction in the supplied logs, the history should show:

- `MTN MoMo wallet deposit`
- `Failed — no money added`
- `500 RWF` (red, with no `+`)

The wallet balance should remain unchanged. Successful completed deposits continue to show green `+500 RWF`.
