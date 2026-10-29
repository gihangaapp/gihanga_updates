/**
 * Content-moderation configuration.
 *
 * All settings come from environment variables with validated, documented
 * defaults. Parsing is strict: invalid values fall back to SAFE defaults and
 * are reported through `configWarnings()` so startup logs surface misconfig
 * without ever printing secret values.
 *
 * SECURITY INVARIANTS enforced here:
 *  - No API key is ever included in `publicSummary()` (staff health endpoint).
 *  - `failClosed` defaults to true: an unavailable required check can never
 *    silently approve content.
 *  - Thresholds are clamped so `block > review` and both stay inside sane
 *    bounds — a misconfigured env var cannot effectively disable blocking.
 */

import { ModerationDecision } from "./types";
import { inspectVisionCredentials } from "./visionCredentials";

function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  return ["1", "true", "yes", "on"].includes(raw.trim().toLowerCase());
}

function envNumber(
  name: string,
  fallback: number,
  bounds: { min: number; max: number },
  warnings: string[],
): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    warnings.push(`${name}="${raw.slice(0, 20)}" is not a number — using default ${fallback}`);
    return fallback;
  }
  const clamped = Math.min(Math.max(n, bounds.min), bounds.max);
  if (clamped !== n) {
    warnings.push(`${name}=${n} out of range [${bounds.min}, ${bounds.max}] — clamped to ${clamped}`);
  }
  return clamped;
}

export interface ModerationConfig {
  /** Master switch — when false the pipeline is bypassed entirely (local dev). */
  enabled: boolean;
  /** Fail-closed: failed/timed-out configured checks never approve content. */
  failClosed: boolean;
  /** Allow publishing verified uploads after caption checks only when no visual provider exists. */
  allowUnscannedMedia: boolean;
  /** Normalized score >= reviewThreshold on a non-critical category -> PENDING_REVIEW. */
  reviewThreshold: number;
  /** Normalized score >= blockThreshold -> REJECTED. */
  blockThreshold: number;
  /** Provider HTTP timeout. */
  timeoutMs: number;
  /** Bounded retries for transient provider failures (exponential backoff). */
  maxRetries: number;
  /** Max concurrent moderation jobs in the in-process queue. */
  queueConcurrency: number;
  /** Bounded queue depth — beyond this, submissions are rejected (backpressure). */
  queueMaxDepth: number;
  /** Video frame sampling interval (seconds between sampled frames). */
  videoFrameIntervalSeconds: number;
  /** Hard cap on frames sampled per video (cost control). */
  videoMaxFrames: number;
  /** Max allowed video duration in minutes (server-enforced, best-effort). */
  maxVideoDurationMinutes: number;
  /** Max upload size in MB (server-enforced complement to multer limits). */
  maxUploadSizeMb: number;
  /** How long an APPROVED media hash may be reused without rescanning. */
  hashTtlHours: number;
  /** Hash cache scope: "owner" (default) or "global". */
  hashScope: "owner" | "global";
  /** Run single-image checks synchronously inside the upload/post request. */
  syncImageChecks: boolean;
  /** OpenAI provider on/off + credentials present. */
  openaiEnabled: boolean;
  openaiApiKeyPresent: boolean;
  openaiModel: string;
  /** Optional audio transcription for video moderation (costs extra). */
  openaiTranscriptionEnabled: boolean;
  /** Google Cloud Vision provider on/off + credentials present. */
  visionEnabled: boolean;
  visionProjectIdPresent: boolean;
  visionCredentialsPresent: boolean;
  /** Live-stream safety. */
  liveChatModerationEnabled: boolean;
  liveViolationLimit: number;
  /**
   * Test/dev-only stub provider. REFUSES to activate in production so a
   * stray env var can never weaken real moderation.
   */
  stubProviderEnabled: boolean;
  /** At least one AI provider fully configured (drives degraded-mode logic). */
  anyProviderConfigured: boolean;
}

export interface ModerationRuntimeOverrides {
  reviewThreshold?: number;
  blockThreshold?: number;
}

let cachedConfig: ModerationConfig | null = null;
let cachedWarnings: string[] = [];

/** Runtime overrides applied from the ModerationRule collection (admin-managed). */
let runtimeOverrides: ModerationRuntimeOverrides = {};

export function getModerationConfig(): ModerationConfig {
  if (cachedConfig) return applyRuntimeOverrides(cachedConfig);
  const warnings: string[] = [];

  const openaiEnabled = envBool("OPENAI_MODERATION_ENABLED", true);
  const openaiApiKeyPresent = Boolean(process.env.OPENAI_API_KEY);
  const visionEnabled = envBool("GOOGLE_CLOUD_VISION_ENABLED", true);
  // The Vision adapter authenticates ONLY through the service-account key file
  // (Application Default Credentials via GOOGLE_APPLICATION_CREDENTIALS). An API
  // key is not supported by the adapter, so it must never count as "configured".
  const visionCredentialsPresent = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim());
  const visionProjectIdPresent = Boolean(process.env.GOOGLE_CLOUD_PROJECT_ID?.trim());

  const reviewThreshold = envNumber(
    "CONTENT_MODERATION_REVIEW_THRESHOLD",
    0.5,
    { min: 0.2, max: 0.9 },
    warnings,
  );
  let blockThreshold = envNumber(
    "CONTENT_MODERATION_BLOCK_THRESHOLD",
    0.8,
    { min: 0.4, max: 0.99 },
    warnings,
  );
  if (blockThreshold <= reviewThreshold) {
    blockThreshold = Math.min(reviewThreshold + 0.1, 0.99);
    warnings.push(
      `CONTENT_MODERATION_BLOCK_THRESHOLD must exceed the review threshold — forced to ${blockThreshold}`,
    );
  }

  const isProduction = process.env.NODE_ENV === "production";
  const stubRequested = envBool("CONTENT_MODERATION_PROVIDER_STUB", false);
  const stubProviderEnabled = stubRequested && !isProduction;
  if (stubRequested && isProduction) {
    warnings.push("Stub provider requested but refused in production (NODE_ENV=production)");
  }

  const visionCredentialReport = visionCredentialsPresent ? inspectVisionCredentials() : undefined;
  const visionProviderUsable =
    visionEnabled &&
    visionCredentialsPresent &&
    visionProjectIdPresent &&
    visionCredentialReport?.status === "ok" &&
    !visionCredentialReport.projectIdMismatch;

  const anyProviderConfigured =
    (openaiEnabled && openaiApiKeyPresent) ||
    visionProviderUsable ||
    stubProviderEnabled;

  if (envBool("CONTENT_MODERATION_ENABLED", true) && !anyProviderConfigured) {
    warnings.push(
      "CONTENT_MODERATION_ENABLED=true but NO AI provider is fully configured. " +
        "Captions still use local prohibited-term checks; posts with verified uploaded media " +
        "can publish without visual AI scanning so they are not stranded in processing. " +
        "Configure OpenAI Moderation or Google Cloud Vision for visual checks. See docs/MODERATION_SETUP.md.",
    );
  }

  // Provider-specific diagnostics are kept SEPARATE so a missing OpenAI key is
  // never confused with (or hidden by) a working Google Vision setup.
  if (visionEnabled) {
    if (visionCredentialsPresent && !visionProjectIdPresent) {
      warnings.push("[Vision] GOOGLE_APPLICATION_CREDENTIALS is set but GOOGLE_CLOUD_PROJECT_ID is missing — Vision stays inactive.");
    } else if (!visionCredentialsPresent && visionProjectIdPresent) {
      warnings.push("[Vision] GOOGLE_CLOUD_PROJECT_ID is set but GOOGLE_APPLICATION_CREDENTIALS is missing — Vision stays inactive.");
    }
    if (visionCredentialsPresent && visionCredentialReport) {
      // safeMessage is path-free: warnings are exposed through publicSummary()
      // (staff API), which must never reveal the credentials path.
      if (visionCredentialReport.status !== "ok") warnings.push(`[Vision] ${visionCredentialReport.safeMessage}`);
      else if (visionCredentialReport.projectIdMismatch) warnings.push(`[Vision] ${visionCredentialReport.safeMessage}`);
    }
  }
  if (openaiEnabled && !openaiApiKeyPresent) {
    warnings.push(
      "[OpenAI] OPENAI_MODERATION_ENABLED=true but OPENAI_API_KEY is not set — the OpenAI provider is INACTIVE. " +
        "Text is then limited to the local prohibited-terms policy until a key is configured.",
    );
  }

  cachedConfig = {
    enabled: envBool("CONTENT_MODERATION_ENABLED", true),
    failClosed: envBool("CONTENT_MODERATION_FAIL_CLOSED", true),
    allowUnscannedMedia: envBool("CONTENT_MODERATION_ALLOW_UNSCANNED_MEDIA", true),
    reviewThreshold,
    blockThreshold,
    timeoutMs: envNumber("CONTENT_MODERATION_TIMEOUT_MS", 15000, { min: 2000, max: 60000 }, warnings),
    maxRetries: envNumber("CONTENT_MODERATION_MAX_RETRIES", 2, { min: 0, max: 5 }, warnings),
    queueConcurrency: envNumber("CONTENT_MODERATION_QUEUE_CONCURRENCY", 3, { min: 1, max: 16 }, warnings),
    queueMaxDepth: envNumber("CONTENT_MODERATION_QUEUE_MAX_DEPTH", 500, { min: 10, max: 10000 }, warnings),
    videoFrameIntervalSeconds: envNumber(
      "CONTENT_MODERATION_VIDEO_FRAME_INTERVAL_SECONDS",
      10,
      { min: 2, max: 60 },
      warnings,
    ),
    videoMaxFrames: envNumber("CONTENT_MODERATION_VIDEO_MAX_FRAMES", 12, { min: 3, max: 30 }, warnings),
    maxVideoDurationMinutes: envNumber(
      "CONTENT_MODERATION_MAX_VIDEO_DURATION",
      10,
      { min: 1, max: 120 },
      warnings,
    ),
    maxUploadSizeMb: envNumber("CONTENT_MODERATION_MAX_UPLOAD_SIZE_MB", 200, { min: 1, max: 1024 }, warnings),
    hashTtlHours: envNumber("CONTENT_MODERATION_HASH_TTL_HOURS", 168, { min: 1, max: 8760 }, warnings),
    hashScope: process.env.CONTENT_MODERATION_HASH_SCOPE === "global" ? "global" : "owner",
    syncImageChecks: envBool("CONTENT_MODERATION_SYNC_IMAGE_CHECKS", true),
    openaiEnabled,
    openaiApiKeyPresent,
    openaiModel: process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest",
    openaiTranscriptionEnabled: envBool("OPENAI_TRANSCRIPTION_ENABLED", false),
    visionEnabled,
    visionProjectIdPresent,
    visionCredentialsPresent,
    liveChatModerationEnabled: envBool("LIVE_MODERATION_CHAT_ENABLED", true),
    liveViolationLimit: envNumber("LIVE_MODERATION_VIOLATION_LIMIT", 3, { min: 1, max: 10 }, warnings),
    stubProviderEnabled,
    anyProviderConfigured,
  };
  cachedWarnings = warnings;
  return applyRuntimeOverrides(cachedConfig);
}

function applyRuntimeOverrides(base: ModerationConfig): ModerationConfig {
  if (!runtimeOverrides.reviewThreshold && !runtimeOverrides.blockThreshold) return base;
  const review = runtimeOverrides.reviewThreshold ?? base.reviewThreshold;
  let block = runtimeOverrides.blockThreshold ?? base.blockThreshold;
  if (block <= review) block = Math.min(review + 0.1, 0.99);
  // Runtime overrides are clamped even tighter than env: admins can tune
  // sensitivity but can never push thresholds into "never blocks" territory.
  const clampedReview = Math.min(Math.max(review, 0.2), 0.9);
  const clampedBlock = Math.min(Math.max(block, 0.4), 0.95);
  return { ...base, reviewThreshold: clampedReview, blockThreshold: clampedBlock };
}

/** Admin-managed runtime threshold overrides (persisted in ModerationRule). */
export function setRuntimeThresholdOverrides(overrides: ModerationRuntimeOverrides) {
  runtimeOverrides = overrides;
}

export function configWarnings(): string[] {
  getModerationConfig();
  return [...cachedWarnings];
}

/**
 * Secret-free configuration summary — safe for the staff health endpoint
 * and logs. Contains booleans and non-sensitive numbers ONLY.
 */
export function publicSummary() {
  const c = getModerationConfig();
  const visionCredentialReport = c.visionCredentialsPresent ? inspectVisionCredentials() : undefined;
  const visionProviderUsable = Boolean(
    c.visionEnabled &&
    c.visionCredentialsPresent &&
    c.visionProjectIdPresent &&
    visionCredentialReport?.status === "ok" &&
    !visionCredentialReport.projectIdMismatch
  );
  return {
    enabled: c.enabled,
    failClosed: c.failClosed,
    allowUnscannedMedia: c.allowUnscannedMedia,
    reviewThreshold: c.reviewThreshold,
    blockThreshold: c.blockThreshold,
    providers: {
      openai: {
        enabled: c.openaiEnabled,
        configured: c.openaiApiKeyPresent,
        model: c.openaiModel,
      },
      googleVision: {
        enabled: c.visionEnabled,
        configured: visionProviderUsable,
        // Status enum only — never file contents. "ok" means the key file looks
        // valid, NOT that Google has accepted it (only a live call proves that).
        credentialFile: visionCredentialReport?.status ?? "not_configured",
      },
      stub: { enabled: c.stubProviderEnabled },
    },
    anyProviderConfigured:
      (c.openaiEnabled && c.openaiApiKeyPresent) ||
      visionProviderUsable ||
      c.stubProviderEnabled,
    queue: {
      concurrency: c.queueConcurrency,
      maxDepth: c.queueMaxDepth,
      maxRetries: c.maxRetries,
    },
    video: {
      frameIntervalSeconds: c.videoFrameIntervalSeconds,
      maxFrames: c.videoMaxFrames,
      maxDurationMinutes: c.maxVideoDurationMinutes,
      transcriptionEnabled: c.openaiTranscriptionEnabled,
    },
    live: {
      chatModerationEnabled: c.liveChatModerationEnabled,
      violationLimit: c.liveViolationLimit,
    },
    warnings: configWarnings(),
  };
}

/** Redacts anything that looks like a credential from an arbitrary string. */
export function redactSecrets(text: string): string {
  return text
    .replace(/sk-[A-Za-z0-9_-]{10,}/g, "sk-[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9._-]{10,}/gi, "Bearer [REDACTED]")
    .replace(/(api[_-]?key|secret|password|token)["':=\s]+\S+/gi, "$1=[REDACTED]");
}

/** Test-only: clears the memoized config so env changes take effect. */
export function __resetModerationConfigForTests() {
  cachedConfig = null;
  cachedWarnings = [];
  runtimeOverrides = {};
}

/** Decisions that make content publicly visible. */
export const PUBLISHABLE_DECISIONS: ReadonlySet<ModerationDecision> = new Set(["APPROVED"]);
