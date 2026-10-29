/**
 * OpenAI Moderation adapter — uses the OFFICIAL `openai` Node SDK against
 * POST /v1/moderations with the `omni-moderation-latest` model family
 * (configurable via OPENAI_MODERATION_MODEL).
 *
 * Capabilities:
 *  - text:  always supported (string input).
 *  - image: supported when a publicly fetchable URL is available
 *           (omni-moderation-latest accepts image_url content parts).
 *    Raw bytes are NOT uploadable on the moderations endpoint — when only a
 *    buffer is available this adapter reports input-unsupported and the
 *    central service relies on byte-capable providers (Google Vision).
 *
 * SECURITY: the API key lives only in the server-side SDK client. Error
 * messages are sanitized through errorOutcome() — keys and raw provider
 * payloads never reach logs or client responses.
 */

import OpenAI from "openai";
import {
  CategoryAssessment,
} from "../types";
import { mapOpenAICategoryScores } from "../policy";
import { getModerationConfig } from "../config";
import {
  ModerateImageParams,
  ModerateTextParams,
  ModerationProvider,
  ProviderCallError,
  ProviderInputUnsupportedError,
} from "./types";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new ProviderCallError("OpenAI API key is not configured", { retryable: false });
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: getModerationConfig().timeoutMs,
      maxRetries: 0, // retries are managed centrally with bounded backoff
    });
  }
  return client;
}

interface ModerationApiResult {
  flagged?: boolean;
  categories?: Record<string, boolean>;
  category_scores?: Record<string, number>;
}

async function callModerations(input: OpenAI.ModerationCreateParams["input"]): Promise<CategoryAssessment[]> {
  const config = getModerationConfig();
  const openai = getClient();
  const response = await openai.moderations.create({
    model: config.openaiModel,
    input,
  });
  const result: ModerationApiResult | undefined = (response as any)?.results?.[0];
  if (!result || typeof result !== "object") {
    throw new ProviderCallError("Malformed moderation response");
  }
  return mapOpenAICategoryScores(result.category_scores ?? {});
}

export const openaiModerationProvider: ModerationProvider = {
  id: "openai",
  displayName: "OpenAI Moderation API",
  capabilities: ["text", "image"],

  isConfigured() {
    const config = getModerationConfig();
    return config.openaiEnabled && config.openaiApiKeyPresent;
  },

  async moderateText(params: ModerateTextParams): Promise<CategoryAssessment[]> {
    if (!this.isConfigured()) {
      throw new ProviderCallError("OpenAI provider is disabled or unconfigured", { retryable: false });
    }
    // Truncate defensively — moderation accepts long inputs, but we cap at
    // a sane bound so a malicious 10MB caption can't inflate cost/latency.
    const text = params.text.slice(0, 10000);
    try {
      return await callModerations(text);
    } catch (err: any) {
      throw normalizeSdkError(err);
    }
  },

  async moderateImage(params: ModerateImageParams): Promise<CategoryAssessment[]> {
    if (!this.isConfigured()) {
      throw new ProviderCallError("OpenAI provider is disabled or unconfigured", { retryable: false });
    }

    // The Moderation API accepts image URLs and base64 data URLs. Raw uploaded
    // images and sampled video frames are buffers, not publicly fetchable URLs;
    // wrapping those bytes as a data URL lets OpenAI moderate them without
    // exposing quarantined media through a public URL or making the check fail.
    const supportedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    const mimeType = params.mimeType?.toLowerCase().split(";")[0].trim();
    const imageUrl = params.url || (params.buffer
      ? `data:${mimeType && supportedMimeTypes.has(mimeType) ? mimeType : "image/jpeg"};base64,${params.buffer.toString("base64")}`
      : undefined);

    if (!imageUrl) {
      throw new ProviderInputUnsupportedError("OpenAI image moderation requires image bytes or a URL");
    }

    try {
      return await callModerations([
        {
          type: "image_url",
          image_url: { url: imageUrl },
        } as never,
      ]);
    } catch (err: any) {
      throw normalizeSdkError(err);
    }
  },
};

function normalizeSdkError(err: any): Error {
  if (err instanceof ProviderCallError || err instanceof ProviderInputUnsupportedError) return err;
  const status = err?.status ?? err?.statusCode;
  if (typeof status === "number") {
    if (status === 429) {
      return new ProviderCallError("OpenAI rate limited", { retryable: true, statusCode: 429 });
    }
    if (status >= 500) {
      return new ProviderCallError("OpenAI server error", { retryable: true, statusCode: status });
    }
    return new ProviderCallError("OpenAI rejected the request", { retryable: false, statusCode: status });
  }
  if (err?.name === "AbortError" || err?.code === "ETIMEDOUT" || err?.code === "ECONNREFUSED") {
    return new ProviderCallError("OpenAI request timed out", { retryable: true });
  }
  return new ProviderCallError("OpenAI request failed", { retryable: true });
}

/** Test-only hook: resets the memoized SDK client (used by unit tests). */
export function __resetOpenAIClient() {
  client = null;
}
