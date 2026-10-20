/**
 * ModerationProvider — the adapter contract every AI safety provider
 * implements. The central ContentModerationService talks ONLY to this
 * interface, so providers can be enabled/disabled/added without touching
 * any upload route.
 */

import { CategoryAssessment, ProviderOutcome } from "../types";

export type ProviderCapability = "text" | "image";

export interface ModerateTextParams {
  text: string;
  surface: string;
}

export interface ModerateImageParams {
  buffer?: Buffer;
  url?: string;
  surface: string;
}

export interface ModerationProvider {
  /** Stable identifier used in records and logs. */
  id: string;
  /** Human-readable name for the staff health endpoint. */
  displayName: string;
  capabilities: ProviderCapability[];
  /** Fully configured and ready (checked lazily, never throws). */
  isConfigured(): boolean;
  /** Text moderation. Throws ProviderCallError on transient failure. */
  moderateText(params: ModerateTextParams): Promise<CategoryAssessment[]>;
  /**
   * Image moderation. Adapters decide whether they need bytes or a URL and
   * must report clearly when the input they require is unavailable (throws
   * ProviderInputUnsupportedError) so the service can route around them.
   */
  moderateImage(params: ModerateImageParams): Promise<CategoryAssessment[]>;
}

/** Transient provider failure (network, 429, 5xx) — retryable. */
export class ProviderCallError extends Error {
  readonly retryable: boolean;
  readonly statusCode?: number;
  constructor(message: string, opts: { retryable?: boolean; statusCode?: number } = {}) {
    super(message);
    this.name = "ProviderCallError";
    this.retryable = opts.retryable ?? true;
    this.statusCode = opts.statusCode;
  }
}

/** The adapter cannot process this input shape (e.g. no URL for OpenAI). */
export class ProviderInputUnsupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderInputUnsupportedError";
  }
}

/** Fetch with timeout — shared by adapters that need plain HTTP. */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Retry with exponential backoff for transient errors only.
 * Bounded: attempts = 1 + maxRetries. Never retries 4xx (except 429).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { maxRetries: number; baseDelayMs?: number; label: string },
): Promise<T> {
  const baseDelay = opts.baseDelayMs ?? 400;
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      const retryable =
        err instanceof ProviderCallError
          ? err.retryable
          : !(err instanceof ProviderInputUnsupportedError);
      if (!retryable || attempt >= opts.maxRetries) {
        throw err;
      }
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
      await new Promise((r) => setTimeout(r, delay));
      attempt += 1;
    }
  }
}

/** Normalizes an unknown adapter failure into a sanitized ProviderOutcome. */
export function errorOutcome(providerId: string, err: unknown): ProviderOutcome {
  // Timeout-shaped failures (AbortController, custom race timeouts) are
  // recognized regardless of the error class.
  const message = err instanceof Error ? err.message : String(err ?? "");
  if (/timed?[- ]?out|aborterror|timeout/i.test(message)) {
    return {
      providerId,
      verdict: "error",
      categories: [],
      error: "Provider request timed out",
    };
  }
  if (err instanceof ProviderCallError) {
    const msg = err.statusCode
      ? `Provider responded with status ${err.statusCode}`
      : "Provider request failed";
    return {
      providerId,
      verdict: "error",
      categories: [],
      error: msg,
    };
  }
  if (err instanceof ProviderInputUnsupportedError) {
    return {
      providerId,
      verdict: "error",
      categories: [],
      error: "Provider cannot process this input type",
    };
  }
  return {
    providerId,
    verdict: "error",
    categories: [],
    error: "Provider temporarily unavailable",
  };
}
