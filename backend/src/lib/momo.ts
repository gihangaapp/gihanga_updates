import crypto from "node:crypto";

type MomoProduct = "collection" | "disbursement";

interface MomoProductConfig {
  subscriptionKey: string;
  apiUser: string;
  apiKey: string;
}

const BASE_URL = process.env.MTN_BASE_URL || process.env.MOMO_BASE_URL || "https://sandbox.momodeveloper.mtn.com";
const TARGET_ENVIRONMENT = process.env.MTN_TARGET_ENVIRONMENT || process.env.MOMO_ENVIRONMENT || "sandbox";
const CURRENCY = process.env.MTN_CURRENCY || process.env.MOMO_CURRENCY || (TARGET_ENVIRONMENT === "sandbox" ? "EUR" : "RWF");

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

function safeProviderError(operation: string, status?: number) {
  return new Error(`${operation} failed${status ? ` (${status})` : ""}`);
}

async function getAccessToken(product: MomoProduct): Promise<string> {
  const config = productConfig(product);
  if (!config) throw new Error(`MTN MoMo ${product} credentials are not configured`);
  const basicAuth = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString("base64");
  const res = await fetch(`${BASE_URL}/${product}/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw safeProviderError(`MTN ${product} token request`, res.status);
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw safeProviderError(`MTN ${product} token response`);
  return data.access_token;
}

export function normalizePhone(phone: string) {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  if (!/^2507\d{8}$/.test(digits) && !/^07\d{8}$/.test(digits)) {
    throw new Error("Enter a valid Rwanda MTN phone number");
  }
  return digits.startsWith("07") ? `250${digits.slice(1)}` : digits;
}

export async function requestToPay(input: { amount: number; phone: string; externalId: string; payerMessage: string }): Promise<{ referenceId: string }> {
  const config = productConfig("collection");
  if (!config) throw new Error("MTN MoMo Collections credentials are not configured");
  const referenceId = crypto.randomUUID();
  const token = await getAccessToken("collection");
  const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": TARGET_ENVIRONMENT,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(input.amount),
      currency: CURRENCY,
      externalId: input.externalId,
      payer: { partyIdType: "MSISDN", partyId: normalizePhone(input.phone) },
      payerMessage: input.payerMessage.slice(0, 160),
      payeeNote: "Gihanga Updates wallet deposit",
    }),
  });
  if (res.status !== 202) throw safeProviderError("MTN RequestToPay", res.status);
  return { referenceId };
}

export async function getRequestToPayStatus(referenceId: string) {
  const config = productConfig("collection");
  if (!config) throw new Error("MTN MoMo Collections credentials are not configured");
  const token = await getAccessToken("collection");
  const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay/${encodeURIComponent(referenceId)}`, {
    headers: { Authorization: `Bearer ${token}`, "X-Target-Environment": TARGET_ENVIRONMENT, "Ocp-Apim-Subscription-Key": config.subscriptionKey },
  });
  if (!res.ok) throw safeProviderError("MTN RequestToPay status check", res.status);
  return (await res.json()) as { status: "PENDING" | "SUCCESSFUL" | "FAILED"; reason?: string; amount?: string; currency?: string };
}

export async function transfer(input: { amount: number; phone: string; externalId: string; payerMessage: string }): Promise<{ referenceId: string }> {
  const config = productConfig("disbursement");
  if (!config) throw new Error("MTN MoMo Disbursements credentials are not configured");
  const referenceId = crypto.randomUUID();
  const token = await getAccessToken("disbursement");
  const res = await fetch(`${BASE_URL}/disbursement/v1_0/transfer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": TARGET_ENVIRONMENT,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(input.amount),
      currency: CURRENCY,
      externalId: input.externalId,
      payee: { partyIdType: "MSISDN", partyId: normalizePhone(input.phone) },
      payerMessage: input.payerMessage.slice(0, 160),
      payeeNote: "Gihanga Updates wallet withdrawal",
    }),
  });
  if (res.status !== 202) throw safeProviderError("MTN Transfer", res.status);
  return { referenceId };
}

export async function getTransferStatus(referenceId: string) {
  const config = productConfig("disbursement");
  if (!config) throw new Error("MTN MoMo Disbursements credentials are not configured");
  const token = await getAccessToken("disbursement");
  const res = await fetch(`${BASE_URL}/disbursement/v1_0/transfer/${encodeURIComponent(referenceId)}`, {
    headers: { Authorization: `Bearer ${token}`, "X-Target-Environment": TARGET_ENVIRONMENT, "Ocp-Apim-Subscription-Key": config.subscriptionKey },
  });
  if (!res.ok) throw safeProviderError("MTN Transfer status check", res.status);
  return (await res.json()) as { status: "PENDING" | "SUCCESSFUL" | "FAILED"; reason?: string; amount?: string; currency?: string };
}
