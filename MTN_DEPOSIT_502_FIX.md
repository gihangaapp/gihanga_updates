# MTN MoMo deposit 502 fix

## Root cause found in the integration source

The backend token helper was posting `grant_type=client_credentials` with an `application/x-www-form-urlencoded` body to `POST /collection/token/`. MTN Rwanda's MoMo API guidance describes a token request with Basic Auth and the Collections subscription key, with no request body. The integration also omitted `X-Target-Environment` from that token request. MTN's updated platform guidance requires this header. A gateway-generated HTML response was then passed to `response.json()`, producing the confusing `Unexpected token '<'` error.

## Code changes

- Removed the unsupported token request body and form Content-Type.
- Added `X-Target-Environment` and `Accept: application/json` to the token request.
- Added safe handling for non-JSON gateway responses. HTML markup is stripped and diagnostics are capped; credentials and authorization headers are never included.
- Applied the same response handling to RequestToPay and transaction-status responses.
- Updated the frontend API client so HTML proxy/gateway errors are displayed as readable text instead of raw markup.
- Added `npm run test:momo-token` regression coverage for the exact token headers/body, EUR sandbox quote, sandbox test MSISDN, and HTML gateway failure.

## Render environment for sandbox

Keep the existing credentials for the Collections product and these values:

```env
MTN_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_TARGET_ENVIRONMENT=sandbox
MTN_CURRENCY=EUR
MTN_SANDBOX_RWF_PER_EUR=500
MTN_SANDBOX_TEST_MSISDN=46733123499
MTN_CALLBACK_URL=http://gihanga-test.vercel.app/api/v1/wallet/momo/callback
```

The callback URL uses HTTP because MTN Rwanda's sandbox callback guidance specifies HTTP. The registered `providerCallbackHost` must remain `gihanga-test.vercel.app`, matching the callback URL hostname. Production callback guidance is HTTPS; do not reuse sandbox values for a production integration.

The RWF-to-EUR mapping is only a deterministic sandbox test mapping. It is not a currency exchange rate and must not be used for real-money transactions.

## Test procedure after deploying

1. Confirm Render deployed the new commit and `/health` still returns 200.
2. Confirm the environment is still `sandbox` and the Collections API User, API Key, and Collections subscription key belong to the same sandbox product/API User configuration. Do not expose them in logs or screenshots.
3. In the wallet, enter a syntactically valid Rwanda phone number and a test amount of 500 RWF. The backend stores the Rwanda number but uses the configured synthetic sandbox MSISDN for MTN.
4. A 202 response means only that MTN accepted the asynchronous request. The wallet must remain pending until MTN's status endpoint/callback confirms `SUCCESSFUL`.
5. A failed provider call must not credit the wallet. If it still fails, the new error should include a readable HTTP status and provider message instead of an HTML JSON parse exception. Share only that sanitized message, never the credentials.

## Verification performed in this workspace

- TypeScript syntax transpilation passed for the modified backend helper, test file, and frontend API client.
- Mocked runtime test passed: token request has no body, includes the sandbox target-environment header, and builds a RequestToPay payload with the expected EUR test quote and sandbox MSISDN.
- Mocked HTML gateway test passed: the gateway page becomes a readable diagnostic rather than a JSON parser exception.
- The full dependency-based backend/frontend builds were not run here because `npm ci` timed out in this environment. Render's build log after deploying this patch is the authoritative full backend build check.
