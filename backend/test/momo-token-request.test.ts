import test from "node:test";
import assert from "node:assert/strict";

const envNames = [
  "MTN_BASE_URL",
  "MTN_TARGET_ENVIRONMENT",
  "MTN_CURRENCY",
  "MTN_SANDBOX_RWF_PER_EUR",
  "MTN_COLLECTION_SUBSCRIPTION_KEY",
  "MTN_COLLECTION_API_USER",
  "MTN_COLLECTION_API_KEY",
  "MTN_SANDBOX_TEST_MSISDN",
  "MTN_CALLBACK_URL",
] as const;

function saveEnv() {
  return Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
}

function restoreEnv(previous: Record<string, string | undefined>) {
  for (const name of envNames) {
    const value = previous[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}

test("MTN collection token request uses target environment and sends no body", async (t) => {
  const previousEnv = saveEnv();
  const originalFetch = globalThis.fetch;
  t.after(() => {
    restoreEnv(previousEnv);
    globalThis.fetch = originalFetch;
  });

  Object.assign(process.env, {
    MTN_BASE_URL: "https://sandbox.momodeveloper.mtn.com",
    MTN_TARGET_ENVIRONMENT: "sandbox",
    MTN_CURRENCY: "EUR",
    MTN_SANDBOX_RWF_PER_EUR: "500",
    MTN_COLLECTION_SUBSCRIPTION_KEY: "test-subscription-key",
    MTN_COLLECTION_API_USER: "00000000-0000-4000-8000-000000000001",
    MTN_COLLECTION_API_KEY: "test-api-key",
    MTN_SANDBOX_TEST_MSISDN: "46733123499",
    MTN_CALLBACK_URL: "",
  });

  const calls: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.endsWith("/collection/token/")) {
      return new Response(JSON.stringify({ access_token: "fixture-access-token", expires_in: 3600 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.endsWith("/collection/v1_0/requesttopay")) {
      return new Response(null, { status: 202 });
    }
    throw new Error(`Unexpected MTN URL: ${url}`);
  }) as typeof fetch;

  const { requestToPay } = await import("../src/lib/momo");
  const result = await requestToPay({
    amount: 500,
    phone: "+250788123456",
    externalId: "test-transaction-id",
    payerMessage: "Gihanga sandbox test",
    referenceId: "00000000-0000-4000-8000-000000000002",
  });

  assert.equal(result.referenceId, "00000000-0000-4000-8000-000000000002");
  assert.equal(calls.length, 2);
  const tokenCall = calls[0]!;
  assert.equal(tokenCall.init.method, "POST");
  assert.equal(tokenCall.init.body, undefined, "MTN token endpoint must not receive a body");
  const tokenHeaders = new Headers(tokenCall.init.headers);
  assert.equal(tokenHeaders.get("X-Target-Environment"), "sandbox");
  assert.equal(tokenHeaders.get("Ocp-Apim-Subscription-Key"), "test-subscription-key");
  assert.match(tokenHeaders.get("Authorization") || "", /^Basic /);

  const paymentCall = calls[1]!;
  const paymentHeaders = new Headers(paymentCall.init.headers);
  assert.equal(paymentHeaders.get("X-Target-Environment"), "sandbox");
  const payload = JSON.parse(String(paymentCall.init.body));
  assert.equal(payload.amount, "1");
  assert.equal(payload.currency, "EUR");
  assert.equal(payload.payer.partyId, "46733123499");
});

test("HTML gateway response is reported as a readable provider error", async (t) => {
  const previousEnv = saveEnv();
  const originalFetch = globalThis.fetch;
  t.after(() => {
    restoreEnv(previousEnv);
    globalThis.fetch = originalFetch;
  });

  Object.assign(process.env, {
    MTN_BASE_URL: "https://sandbox.momodeveloper.mtn.com",
    MTN_TARGET_ENVIRONMENT: "sandbox",
    MTN_CURRENCY: "EUR",
    MTN_SANDBOX_RWF_PER_EUR: "500",
    MTN_COLLECTION_SUBSCRIPTION_KEY: "test-subscription-key",
    MTN_COLLECTION_API_USER: "00000000-0000-4000-8000-000000000001",
    MTN_COLLECTION_API_KEY: "test-api-key",
    MTN_SANDBOX_TEST_MSISDN: "46733123499",
    MTN_CALLBACK_URL: "",
  });

  globalThis.fetch = (async () => new Response(
    "<html><head><title>Request Rejected</title></head><body>Support ID: 12345</body></html>",
    { status: 200, headers: { "Content-Type": "text/html" } },
  )) as typeof fetch;

  const { requestToPay } = await import("../src/lib/momo");
  await assert.rejects(
    () => requestToPay({
      amount: 500,
      phone: "+250788123456",
      externalId: "test",
      payerMessage: "test",
      referenceId: "00000000-0000-4000-8000-000000000003",
    }),
    /non-JSON response \(HTTP 200\).*Request Rejected.*Support ID: 12345/,
  );
});
