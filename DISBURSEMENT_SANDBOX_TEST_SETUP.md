# Disbursement sandbox test setup

The wallet continues to accept and store Rwanda-format phone numbers. Only the outbound MTN Disbursement request is mapped to the synthetic sandbox recipient configured in `MTN_SANDBOX_DISBURSEMENT_TEST_MSISDN`. This mapping is applied only when `MTN_TARGET_ENVIRONMENT=sandbox`; it is ignored for any non-sandbox target.

Render backend environment variable for sandbox testing:

```env
MTN_SANDBOX_DISBURSEMENT_TEST_MSISDN=46733123499
```

This test MSISDN is not a real customer number. MTN's sandbox documentation states that unlisted test MSISDNs return the default success scenario, while predefined numbers trigger documented transfer scenarios. The test recipient must be used only with the sandbox base URL and sandbox target environment.

Do not use this setting for production. Before any production payout capability is enabled, an authorized adult/business representative must complete MTN onboarding, compliance, contractual approval, and production configuration.

The Disbursement transfer call in this project uses MTN's standard Partner Gateway `/disbursement/v1_0/transfer` endpoint. Do not add the separate Aggregator-only `transferType` field unless MTN has specifically provisioned this account for the Aggregator Transfer API.
