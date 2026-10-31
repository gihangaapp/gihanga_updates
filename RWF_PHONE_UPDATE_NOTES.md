# RWF wallet and Rwanda phone input update

## Currency rules

- Gihanga wallet balances, ledger transactions, point-to-cash conversions, and user-facing cash amounts are denominated in RWF.
- MTN sandbox uses EUR. The backend maps an RWF wallet amount to an EUR sandbox request using `MTN_SANDBOX_RWF_PER_EUR`.
- The supplied sandbox example uses `MTN_SANDBOX_RWF_PER_EUR=500`, so a 500 RWF app deposit sends a 1 EUR sandbox request. This is a deliberately configured test mapping, not an exchange rate and not a real-money value conversion.
- Before crediting the wallet, the backend checks that MTN's final status amount and currency match the quote saved on the pending transaction. A mismatch leaves the wallet unchanged.
- For an MTN-approved Rwanda production integration, use the production target environment and RWF with the endpoint and credentials issued by MTN. Do not reuse the sandbox mapping or sandbox credentials.

## Render sandbox variables

Keep the existing Collections subscription key, API User, API Key, callback URL, and other working values. Confirm these values:

```env
MTN_TARGET_ENVIRONMENT=sandbox
MTN_CURRENCY=EUR
MTN_SANDBOX_RWF_PER_EUR=500
```

Do not put MTN secrets in Vite/Vercel `VITE_` variables. Do not add a `.env` file containing secrets to Git.

## Rwanda phone input

The shared UI formatter is used by all editable phone fields found in this source snapshot:

- Wallet deposit/withdrawal
- Account settings phone number
- Advertisement contact phone

These formats are accepted and normalized to E.164 before sending:

- `+250 788 123 456`
- `250788123456`
- `0788123456`
- `788123456`

The display format is `+250 788 123 456`; MTN receives the MSISDN as `250788123456`. The shared input preserves the caret position while typing and editing within the number.

## Validation performed

- TypeScript transpilation/syntax checks passed for the modified backend and frontend files.
- Phone helper tests passed for four valid input forms and four rejected inputs.
- Sandbox mapping checks passed: 500 RWF → 1 EUR and 1,000 RWF → 2 EUR.
- Full `npm run build` was not verified in this environment because the backend dependency installation timed out and left incomplete `node_modules`. Run the backend and frontend builds after merging the patch into the complete current repository.

## Files changed

- `backend/src/lib/phone.ts`
- `backend/src/lib/momo.ts`
- `backend/src/routes/v1/wallet/wallet.ts`
- `backend/src/routes/v1/users/settings.ts`
- `backend/src/routes/v1/ads/ads.ts`
- `backend/.env.example`
- `backend/test/rwanda-phone-rwf.test.ts`
- `backend/package.json` (test script only)
- `Frontend/src/lib/rwanda-phone.ts`
- `Frontend/src/components/ui/rwanda-phone-input.tsx`
- `Frontend/src/routes/wallet.tsx`
- `Frontend/src/routes/settings.tsx`
- `Frontend/src/components/ads/AdWizard.tsx`
- `Frontend/tests/rwanda-phone.test.ts`
- `Frontend/package.json` (test script only)
