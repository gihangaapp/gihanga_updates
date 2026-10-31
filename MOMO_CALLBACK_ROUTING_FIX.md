# MTN MoMo callback routing fix

This patch keeps the current Gihanga Updates frontend and backend, and corrects the callback path mismatch.

## What changed

- `Frontend/vercel.json` forwards both `/api/v1/wallet/momo/callback` and `/api/v1/wallet/momo/callback/{referenceId}` to the Render API.
- The backend accepts MTN callbacks with `PUT` or `POST`, both with and without the reference-ID path segment.
- The backend exposes a harmless `GET` reachability check. A GET request does not settle or change a payment.
- Collection and Disbursement requests now include `X-Callback-Url` when `MTN_CALLBACK_URL` is configured. The reference ID is saved before the request is submitted so an early callback can find its transaction.
- Callback status is verified by querying MTN's status API before the wallet is changed. The callback's supplied status is not trusted as payment proof.

## Deployment settings

1. In Vercel, keep the project Root Directory set to `Frontend`; `Frontend/vercel.json` must be at the configured project root. Redeploy the frontend after committing this ZIP's changes.
2. In Render, set `MTN_CALLBACK_URL` to the public callback base URL whose hostname exactly matches the MTN API User's `providerCallbackHost`. For the sandbox API User created for this project, the host is `gihanga-test.vercel.app`. The backend appends the transaction reference ID automatically.
3. Keep the MTN account in sandbox for testing. MTN's Rwanda sandbox FAQ says callback URLs use HTTP; production callbacks require HTTPS. Vercel automatically serves deployments over HTTPS and may redirect HTTP requests before applying rewrites, so verify whether the MTN sandbox callback sender follows that redirect. Until callback delivery is confirmed, use the authenticated transaction-status endpoint as the fallback. MTN documents callbacks as one-shot with no retry.
4. Redeploy the Render backend after setting the environment variable. Do not place MTN credentials in the frontend or in this file.

## Safe verification

- Open `https://gihanga-test.vercel.app/api/v1/wallet/momo/callback/proxy-test-001` in a browser. A successful deployment should return the JSON reachability response, not `Endpoint not found`. This GET is only a route check.
- A real MTN callback uses `PUT` or `POST`; verify the backend logs during a sandbox transaction.
- A reference that does not belong to a saved transaction should return `Transaction not found` for POST/PUT, not credit a wallet.
- If the callback does not arrive, use the authenticated wallet status endpoint to query MTN's authoritative status. MTN documents no retry for a missed callback.

Never commit `.env` files or share API keys, subscription keys, API user credentials, or access tokens.
