import crypto from "node:crypto";
import { toRwandaMsisdn } from "./phone";

type MomoProduct = "collection" | "disbursement";

interface MomoProductConfig {
  subscriptionKey: string;
  apiUser: string;
  apiKey: string;
}

const BASE_URL = (process.env.MTN_BASE_URL || process.env.MOMO_BASE_URL || "https://sandbox.momodeveloper.mtn.com").replace(/\/+$/, "");
const TARGET_ENVIRONMENT = (process.env.MTN_TARGET_ENVIRONMENT || process.env.MOMO_ENVIRONMENT || "sandbox").toLowerCase();
const CURRENCY = (process.env.MTN_CURRENCY || process.env.MOMO_CURRENCY || (TARGET_ENVIRONMENT === "sandbox" ? "EUR" : "RWF")).toUpperCase();

export interface MomoProviderQuote {
  amount: number;
  currency: "EUR" | "RWF";
  sandboxRwfPerEur?: number;
}

/**
 * Wallet amounts are always RWF. MTN sandbox only accepts EUR, so sandbox
 * requests use an explicit TEST-ONLY mapping configured with
 * MTN_SANDBOX_RWF_PER_EUR. This is not an exchange rate and must never be
 * used to value real money. Rwanda production requests use RWF unchanged.
 */
export function getMomoProviderQuote(walletAmountRwf: number): MomoProviderQuote {
  if (!Number.isSafeInteger(walletAmountRwf) || walletAmountRwf <= 0) {
    throw new Error("Wallet amount must be a positive whole number of RWF");
  }

  if (TARGET_ENVIRONMENT === "sandbox") {
    if (CURRENCY !== "EUR") throw new Error("MTN sandbox requires MTN_CURRENCY=EUR");
    const sandboxRwfPerEur = Number(process.env.MTN_SANDBOX_RWF_PER_EUR);
    if (!Number.isFinite(sandboxRwfPerEur) || sandboxRwfPerEur <= 0) {
      throw new Error("Set MTN_SANDBOX_RWF_PER_EUR to an explicit sandbox-only test mapping (RWF per EUR)");
    }
    const amount = Math.round((walletAmountRwf / sandboxRwfPerEur) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("This RWF amount is too small for the configured MTN sandbox test mapping");
    }
    return { amount, currency: "EUR", sandboxRwfPerEur };
  }

  if (TARGET_ENVIRONMENT === "mtnrwanda") {
    if (CURRENCY !== "RWF") throw new Error("MTN Rwanda production must use MTN_CURRENCY=RWF");
    const configuredBaseUrl = process.env.MTN_BASE_URL || process.env.MOMO_BASE_URL;
    if (!configuredBaseUrl || /sandbox/i.test(configuredBaseUrl)) {
      throw new Error("Set MTN_BASE_URL to the production endpoint supplied by MTN before enabling production payments");
    }
    return { amount: walletAmountRwf, currency: "RWF" };
  }

  throw new Error("Unsupported MTN target environment. Use sandbox for testing or mtnrwanda for an authorized Rwanda production integration.");
}

function productConfig(product: MomoProduct): MomoProductConfig | null {
  const prefix = product === "collection" ? "MTN_COLLECTION" : "MTN_DISBURSEMENT";
  const legacyPrefix = product === "collection" ? "MOMO_COLLECTION" : "MOMO_DISBURSEMENT";
  const subscriptionKey = process.env[`${prefix}_SUBSCRIPTION_KEY`] || process.env[`${legacyPrefix}_SUBSCRIPTION_KEY`];
  const apiUser = process.env[`${prefix}_API_USER`] || process.env[`${legacyPrefix}_API_USER`];
  const apiKey = process.env[`${prefix}_API_KEY`] || process.env[`${legacyPrefix}_API_KEY`];
  if (!subscriptionKey || !apiUser || !apiKey) return null;
  return { subscriptionKey, apiUser, apiKey };
}

export function getMomoCurrency() {
  return CURRENCY;
}

export function isMomoConfigured(product: MomoProduct): boolean {
  return productConfig(product) !== null;
}

/**
 * MTN requires the callback URL to be supplied on each asynchronous payment
 * request. The callback host must match the ProviderCallbackHost registered
 * for this API user. MTN's sandbox and production URL requirements differ;
 * use the scheme prescribed for the active environment.
 */
export function getMomoCallbackUrl(referenceId: string): string | undefined {
  const configuredUrl = String(process.env.MTN_CALLBACK_URL || "").trim();
  if (!configuredUrl) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(configuredUrl);
  } catch {
    throw new Error("MTN_CALLBACK_URL must be a valid absolute URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("MTN_CALLBACK_URL must use HTTP or HTTPS");
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("MTN_CALLBACK_URL must not contain credentials, query parameters, or a fragment");
  }
  if (TARGET_ENVIRONMENT !== "sandbox" && parsed.protocol !== "https:") {
    throw new Error("MTN production callbacks must use HTTPS");
  }

  const base = configuredUrl.replace(/\/+$/, "");
  if (base.endsWith("/:referenceId")) {
    return base.replace(/:referenceId$/, encodeURIComponent(referenceId));
  }
  return `${base}/${encodeURIComponent(referenceId)}`;
}

/**
 * MTN's gateway sometimes returns an HTML "Request Rejected" page instead
 * of JSON. Never call response.json() blindly: that produces the misleading
 * "Unexpected token '<'" error seen by the wallet client. Convert provider
 * failures into short, readable diagnostics without exposing credentials.
 */
function providerBodyMessage(raw: string): string {
  const cleaned = raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/(?:Ocp-Apim-Subscription-Key|Authorization|api[_ -]?key|access[_ -]?token)\s*[:=]\s*[^\s,;]+/gi, "[redacted]")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 280);
}

async function readProviderJson<T>(operation: string, res: Response): Promise<T> {
  const raw = await res.text();
  if (!res.ok) {
    const message = providerBodyMessage(raw);
    throw new Error(`${operation} failed (HTTP ${res.status})${message ? `: ${message}` : ""}`);
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    const message = providerBodyMessage(raw);
    throw new Error(
      `${operation} returned a non-JSON response (HTTP ${res.status})${message ? `: ${message}` : ""}`,
    );
  }
}

function safeProviderError(operation: string, status: number, raw = "") {
  const message = providerBodyMessage(raw);
  return new Error(`${operation} failed (HTTP ${status})${message ? `: ${message}` : ""}`);
}

async function getAccessToken(product: MomoProduct): Promise<string> {
  const config = productConfig(product);
  if (!config) throw new Error(`MTN MoMo ${product} credentials are not configured`);
  const basicAuth = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString("base64");

  // IMPORTANT: MTN's /{product}/token/ endpoint does not accept a request
  // body. Sending grant_type=client_credentials (or a Content-Type for it)
  // can make the API gateway return an HTML Request Rejected page. The
  // current sandbox token flow also requires X-Target-Environment.
  const res = await fetch(`${BASE_URL}/${product}/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "X-Target-Environment": TARGET_ENVIRONMENT,
      Accept: "application/json",
    },
  });
  const data = await readProviderJson<{ access_token?: string }>(`MTN ${product} token request`, res);
  if (!data.access_token) throw new Error(`MTN ${product} token response did not contain access_token`);
  return data.access_token;
}

export function normalizePhone(phone: string) {
  return toRwandaMsisdn(phone);
}

/**
 * Sandbox-only fixture override. The wallet still validates and stores the
 * user's Rwanda-format MSISDN, but MTN receives its synthetic sandbox test
 * MSISDN so the known sandbox outcomes can be exercised end-to-end.
 * This setting is ignored outside sandbox and must never be used for live funds.
 */
function getCollectionPayerMsisdn(phone: string): string {
  if (TARGET_ENVIRONMENT === "sandbox") {
    const configuredFixture = String(process.env.MTN_SANDBOX_TEST_MSISDN || "").trim();
    if (configuredFixture) {
      const digits = configuredFixture.replace(/\D/g, "");
      if (!/^\d{8,15}$/.test(digits)) {
        throw new Error("MTN_SANDBOX_TEST_MSISDN must contain 8 to 15 digits");
      }
      return digits;
    }
  }
  return normalizePhone(phone);
}

export async function requestToPay(input: { amount: number; phone: string; externalId: string; payerMessage: string; referenceId?: string; callbackUrl?: string }): Promise<{ referenceId: string }> {
  const config = productConfig("collection");
  if (!config) throw new Error("MTN MoMo Collections credentials are not configured");
  const referenceId = input.referenceId || crypto.randomUUID();
  const callbackUrl = input.callbackUrl || getMomoCallbackUrl(referenceId);
  const quote = getMomoProviderQuote(input.amount);
  const token = await getAccessToken("collection");
  const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": TARGET_ENVIRONMENT,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Content-Type": "application/json",
      ...(callbackUrl ? { "X-Callback-Url": callbackUrl } : {}),
    },
    body: JSON.stringify({
      amount: String(quote.amount),
      currency: quote.currency,
      externalId: input.externalId,
      payer: { partyIdType: "MSISDN", partyId: getCollectionPayerMsisdn(input.phone) },
      payerMessage: input.payerMessage.slice(0, 160),
      payeeNote: "Gihanga Updates wallet deposit",
    }),
  });
  if (res.status !== 202) {
    const raw = await res.text();
    throw safeProviderError("MTN RequestToPay", res.status, raw);
  }
  return { referenceId };
}

export async function getRequestToPayStatus(referenceId: string) {
  const config = productConfig("collection");
  if (!config) throw new Error("MTN MoMo Collections credentials are not configured");
  const token = await getAccessToken("collection");
  const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay/${encodeURIComponent(referenceId)}`, {
    headers: { Authorization: `Bearer ${token}`, "X-Target-Environment": TARGET_ENVIRONMENT, "Ocp-Apim-Subscription-Key": config.subscriptionKey },
  });
  return readProviderJson<{ status: "PENDING" | "SUCCESSFUL" | "FAILED"; reason?: string; amount?: string; currency?: string }>("MTN RequestToPay status check", res);
}

export async function transfer(input: { amount: number; phone: string; externalId: string; payerMessage: string; referenceId?: string; callbackUrl?: string }): Promise<{ referenceId: string }> {
  const config = productConfig("disbursement");
  if (!config) throw new Error("MTN MoMo Disbursements credentials are not configured");
  const referenceId = input.referenceId || crypto.randomUUID();
  const callbackUrl = input.callbackUrl || getMomoCallbackUrl(referenceId);
  const quote = getMomoProviderQuote(input.amount);
  const token = await getAccessToken("disbursement");
  const res = await fetch(`${BASE_URL}/disbursement/v1_0/transfer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": TARGET_ENVIRONMENT,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Content-Type": "application/json",
      ...(callbackUrl ? { "X-Callback-Url": callbackUrl } : {}),
    },
    body: JSON.stringify({
      amount: String(quote.amount),
      currency: quote.currency,
      externalId: input.externalId,
      payee: { partyIdType: "MSISDN", partyId: normalizePhone(input.phone) },
      payerMessage: input.payerMessage.slice(0, 160),
      payeeNote: "Gihanga Updates wallet withdrawal",
    }),
  });
  if (res.status !== 202) {
    const raw = await res.text();
    throw safeProviderError("MTN Transfer", res.status, raw);
  }
  return { referenceId };
}

export async function getTransferStatus(referenceId: string) {
  const config = productConfig("disbursement");
  if (!config) throw new Error("MTN MoMo Disbursements credentials are not configured");
  const token = await getAccessToken("disbursement");
  const res = await fetch(`${BASE_URL}/disbursement/v1_0/transfer/${encodeURIComponent(referenceId)}`, {
    headers: { Authorization: `Bearer ${token}`, "X-Target-Environment": TARGET_ENVIRONMENT, "Ocp-Apim-Subscription-Key": config.subscriptionKey },
  });
  return readProviderJson<{ status: "PENDING" | "SUCCESSFUL" | "FAILED"; reason?: string; amount?: string; currency?: string }>("MTN Transfer status check", res);
}
