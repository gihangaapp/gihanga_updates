# Security recovery required before further deployment

This package intentionally excludes local `.env` files. Use Render/Vercel environment settings or a private secrets manager; never commit or upload populated `.env` files.

The source ZIP received for review included populated backend environment settings and previous shared logs included bearer JWTs in media URL query strings. Treat those credentials as exposed and rotate them before production use.

## Rotate with the account owner / authorized administrator

- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- JWT_STAFF_ACCESS_SECRET
- JWT_STAFF_REFRESH_SECRET
- MongoDB database-user password and MONGODB_URI
- MTN Collections API key and subscription key (and API User if the provider requires replacement)
- MTN Disbursements API key and subscription key
- MTN_CALLBACK_TOKEN, if enabled
- Any other non-placeholder secret found in the removed local backend `.env`

After rotation, update the backend environment on Render, redeploy, verify login/refresh, then verify sandbox Collection and Disbursement token requests. Rotating JWT secrets will invalidate existing sessions.

## Logging and media authentication

The app accepts consumer access tokens in `?token=` for authenticated media. Query-string bearer tokens can leak through access logs, monitoring, browser history, and referrer data. Redact sensitive query parameters in request logs immediately and plan to replace full session JWTs in media URLs with short-lived, media-scoped signed URLs or authenticated media fetches.

## MTN go-live

Do not change sandbox environment variables to production values based on guesses. Obtain written confirmation from MTN Rwanda for production base URL, target-environment value, currency, product credentials, callback registration, limits, settlement/funding, and go-live approval. Business onboarding, contractual acceptance, KYC, and production credential issuance must be handled by an authorized adult/business representative for the registered entity.
