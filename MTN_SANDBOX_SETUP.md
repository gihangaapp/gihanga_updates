# MTN MoMo Rwanda Sandbox Setup

## Purpose

This project now keeps MTN credentials exclusively in the backend and routes payment requests through Gihanga. The frontend never calls MTN directly and never receives MTN subscription keys, API users, API keys, or access tokens.

## Current sandbox architecture

```text
Customer browser → Gihanga backend → MTN MoMo Collections API
                                      ↘ callback/status verification → Gihanga backend → MongoDB wallet ledger
```

The integration uses the MTN MoMo Open API product model. Collections are used for wallet deposits; Disbursements are a separate product used for withdrawals. MTN documents RequestToPay as asynchronous: an accepted HTTP request is not proof of final payment, and the final state must be obtained through status verification or callback.[1] [2]

## Environment variables

Copy `backend/.env.example` to `backend/.env` on the backend host only. Replace placeholders only after MTN provides the corresponding sandbox values.

| Variable | Value or source | Purpose |
|---|---|---|
| `MTN_ENV` | `sandbox` | Application mode. Change to `production` only with production credentials and MTN production configuration. |
| `MTN_BASE_URL` | `https://sandbox.momodeveloper.mtn.com` | Sandbox API base URL. Confirm the value in the current MTN workspace documentation before go-live. |
| `MTN_TARGET_ENVIRONMENT` | `sandbox` or the exact target value supplied by MTN | Sent as `X-Target-Environment`. |
| `MTN_CURRENCY` | Sandbox currency supplied by MTN; the example is `EUR` | Currency sent to MTN. Do not assume production RWF behavior from sandbox behavior. |
| `MTN_CALLBACK_URL` | Public HTTPS URL ending in `/api/v1/wallet/momo/callback` | Callback destination to register or provide to MTN if required for the account. |
| `MTN_COLLECTION_SUBSCRIPTION_KEY` | MTN Collections subscription key | Backend-only subscription credential for deposits. |
| `MTN_COLLECTION_API_USER` | MTN Collections API user UUID | Used only by the backend to obtain a Collections token. |
| `MTN_COLLECTION_API_KEY` | MTN Collections API key | Used only by the backend to obtain a Collections token. |
| `MTN_DISBURSEMENT_SUBSCRIPTION_KEY` | MTN Disbursements subscription key | Backend-only subscription credential for withdrawals. |
| `MTN_DISBURSEMENT_API_USER` | MTN Disbursements API user UUID | Used only by the backend to obtain a Disbursements token. |
| `MTN_DISBURSEMENT_API_KEY` | MTN Disbursements API key | Used only by the backend to obtain a Disbursements token. |
| `MTN_CALLBACK_TOKEN` | Only if MTN provisions callback authentication for the account | Reserved for deployment-specific callback protection; do not invent a value as if MTN supports it. |

The legacy `MOMO_*` variables remain readable by the service for backward compatibility, but new deployments should use the `MTN_*` names above. Do not commit `backend/.env`; it is already ignored by Git.

## MTN-side configuration still required

The project cannot complete a real sandbox payment until the MTN developer account, product subscriptions, API users, API keys, callback host registration, and sandbox test rules have been configured. The official developer portal is the source of truth for the current provisioning sequence and any Rwanda-specific requirements.[3] [4]

The callback URL must be reachable from MTN over HTTPS in the deployed environment. Localhost is not sufficient for MTN callbacks. If MTN requires a registered callback host, register the host in the developer portal before testing.

## Production transition

Production is intentionally not enabled by code alone. Before switching `MTN_ENV=production`, obtain production credentials separately, confirm the production base URL and target-environment value with MTN, confirm the production currency, register the production callback host, and run a controlled low-value verification. Business logic remains in the Gihanga service and settlement layer; credentials and endpoint configuration are environment-specific.

## References

[1]: https://momodeveloper.mtn.com/api-documentation/api-description "MTN MoMo API Description"
[2]: https://momodeveloper.mtn.com/api-documentation/callback "MTN MoMo Callback Documentation"
[3]: https://momodeveloper.mtn.com/api-documentation/getting-started "MTN MoMo Getting Started"
[4]: https://momodeveloper.mtn.com/api-documentation/testing "MTN MoMo Sandbox Testing"
