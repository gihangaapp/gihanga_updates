/**
 * Google Cloud Vision SafeSearch adapter — uses the OFFICIAL
 * `@google-cloud/vision` Node SDK.
 *
 * Authentication follows Google's documented service-account model through
 * Application Default Credentials:
 *  - GOOGLE_APPLICATION_CREDENTIALS=<path to service-account JSON> (read by the SDK),
 *  - GOOGLE_CLOUD_PROJECT_ID=<project id> (passed to the client explicitly).
 * The key file stays OUT of source control and OUT of the frontend; only its
 * path is configured (on Render: a Secret File under /etc/secrets/).
 *
 * Capabilities:
 *  - image via raw BYTES (works for quarantined local files) or via a
 *    URL (imageUri) for Cloudinary-hosted media.
 *
 * SafeSearch likelihoods (adult/racy/violence/medical/spoof) are normalized
 * through policy.ts: medical and spoof are never auto-rejected; racy routes
 * to human review rather than automatic rejection.
 *
 * FAIL-CLOSED / SAFE-DIAGNOSTIC RULES:
 *  - Every failure becomes a sanitized ProviderCallError / ProviderInputUnsupportedError.
 *    Raw SDK messages are NEVER logged or returned (they can quote paths,
 *    project details or key material). Only static hints are logged.
 *  - A response with no usable SafeSearch signal is an ERROR, never "safe".
 */

import { ImageAnnotatorClient } from "@google-cloud/vision";
import { CategoryAssessment } from "../types";
import { mapVisionLikelihoods } from "../policy";
import { getModerationConfig } from "../config";
import { inspectVisionCredentials } from "../visionCredentials";
import {
  ModerateImageParams,
  ModerateTextParams,
  ModerationProvider,
  ProviderCallError,
  ProviderInputUnsupportedError,
} from "./types";

/** The slice of the SDK client this adapter uses (also the test seam). */
interface VisionClientLike {
  safeSearchDetection(request: unknown, options?: unknown): Promise<unknown[]>;
}

let client: VisionClientLike | null = null;
let clientInjectedForTests = false;

function getClient(): VisionClientLike {
  const config = getModerationConfig();
  if (!config.visionEnabled) {
    throw new ProviderCallError("Google Vision provider is disabled", { retryable: false });
  }
  if (clientInjectedForTests && client) return client;

  // Preflight the credential FILE (never its contents) so a wrong Render
  // Secret File path produces an actionable server-side message instead of an
  // opaque SDK error on every request.
  const creds = inspectVisionCredentials();
  if (creds.status !== "ok") {
    logVisionDiagnostic("credentials", creds.message);
    throw new ProviderCallError("Google Vision credentials unavailable", { retryable: false });
  }

  if (!client) {
    // Auth is lazy — constructing the client does not touch the network. The
    // SDK reads GOOGLE_APPLICATION_CREDENTIALS itself (ADC); we only pass the
    // project id explicitly.
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim();
    client = new ImageAnnotatorClient(projectId ? { projectId } : {}) as unknown as VisionClientLike;
  }
  return client;
}

// ─── Safe, throttled server-side diagnostics ────────────────────────────────

type DiagnosticKind =
  | "credentials"
  | "permission_denied"
  | "api_disabled"
  | "billing"
  | "unauthenticated"
  | "quota"
  | "unavailable"
  | "bad_image"
  | "no_signal"
  | "unknown";

/** Static hints only — never interpolate SDK error text. */
const HINTS: Record<Exclude<DiagnosticKind, "credentials">, string> = {
  permission_denied:
    "PERMISSION_DENIED — the service account lacks permission to call the Vision API on this project. See docs/MODERATION_SETUP.md (IAM).",
  api_disabled: "The Cloud Vision API appears to be disabled for this project — enable it in the Google Cloud Console.",
  billing: "Google rejected the call for billing reasons — confirm billing is enabled on the Google Cloud project.",
  unauthenticated:
    "UNAUTHENTICATED — Google did not accept the service-account key (revoked, rotated or malformed). Re-create the key and re-upload the Secret File.",
  quota: "Vision quota/rate limit reached (RESOURCE_EXHAUSTED) — requests will retry, then fail closed.",
  unavailable: "Vision API temporarily unreachable (network/timeout/UNAVAILABLE) — requests will retry, then fail closed.",
  bad_image: "Vision could not process an image (invalid data or unreachable image URL).",
  no_signal: "Vision returned no usable SafeSearch signal for an image — treated as an error (fail-closed).",
  unknown: "Unexpected Vision SDK failure — treated as an error (fail-closed).",
};

const lastLogged = new Map<string, number>();
const LOG_THROTTLE_MS = 60_000;

function logVisionDiagnostic(kind: DiagnosticKind, credentialMessage?: string) {
  const now = Date.now();
  const last = lastLogged.get(kind) ?? 0;
  if (now - last < LOG_THROTTLE_MS) return;
  lastLogged.set(kind, now);
  const text = kind === "credentials" ? credentialMessage ?? "Credential problem." : HINTS[kind];
  console.error(`[Moderation][Vision] ${kind}: ${text}`);
}

// ─── SafeSearch call ────────────────────────────────────────────────────────

interface SafeSearchAnnotation {
  adult?: string;
  spoof?: string;
  medical?: string;
  violence?: string;
  racy?: string;
}

interface VisionResponse {
  safeSearchAnnotation?: SafeSearchAnnotation | null;
  error?: { code?: number; message?: string } | null;
}

async function safeSearch(
  image: { content?: Buffer; source?: { imageUri?: string } },
): Promise<CategoryAssessment[]> {
  const vision = getClient();
  const config = getModerationConfig();
  // NOTE: do NOT pass `features`. safeSearchDetection() is a single-feature
  // helper that adds SAFE_SEARCH_DETECTION itself and THROWS if a feature is
  // supplied in any other form (a string type never equals the numeric enum).
  //
  // Call options: a per-attempt client-side timeout, and gax-level retries
  // disabled (`retry: null`) so the pipeline's own bounded withRetry() is the
  // ONLY retry layer (no hidden multiplication of paid calls).
  const [result] = (await vision.safeSearchDetection(
    { image },
    { timeout: config.timeoutMs, retry: null },
  )) as [VisionResponse | undefined];

  // Per-image failures come back INSIDE the response (google.rpc.Status).
  if (result?.error && (result.error.code || result.error.message)) {
    throw Object.assign(new Error("vision per-image error"), { code: result.error.code });
  }

  const annotation = result?.safeSearchAnnotation;
  if (!annotation || Object.keys(annotation).length === 0) {
    logVisionDiagnostic("no_signal");
    throw new ProviderCallError("Empty SafeSearch response");
  }

  const mapped = mapVisionLikelihoods(annotation as Record<string, string>);
  if (mapped.length === 0) {
    // Every actionable category was UNKNOWN/absent: that is "no information",
    // not "safe". Never let it approve.
    logVisionDiagnostic("no_signal");
    throw new ProviderCallError("Google Vision returned no usable SafeSearch signal", { retryable: false });
  }
  return mapped;
}

export const googleVisionProvider: ModerationProvider = {
  id: "google-vision",
  displayName: "Google Cloud Vision SafeSearch",
  capabilities: ["image"],

  isConfigured() {
    const config = getModerationConfig();
    return config.visionEnabled && config.visionCredentialsPresent && config.visionProjectIdPresent;
  },

  async moderateText(_params: ModerateTextParams): Promise<CategoryAssessment[]> {
    // SafeSearch is an IMAGE classifier — it has no text capability.
    throw new ProviderInputUnsupportedError("Google Vision does not moderate text");
  },

  async moderateImage(params: ModerateImageParams): Promise<CategoryAssessment[]> {
    if (!this.isConfigured()) {
      throw new ProviderCallError("Google Vision is disabled or unconfigured", { retryable: false });
    }
    if (params.buffer) {
      try {
        return await safeSearch({ content: params.buffer });
      } catch (err: any) {
        throw normalizeVisionError(err);
      }
    }
    if (params.url) {
      try {
        return await safeSearch({ source: { imageUri: params.url } });
      } catch (err: any) {
        throw normalizeVisionError(err);
      }
    }
    throw new ProviderInputUnsupportedError("Google Vision needs image bytes or an image URL");
  },
};

const NETWORK_ERRNO = new Set(["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "EPIPE"]);

export function normalizeVisionError(err: any): Error {
  if (err instanceof ProviderCallError || err instanceof ProviderInputUnsupportedError) return err;

  // Classification reads the SDK message in memory ONLY to pick a static hint;
  // the message itself is never logged or returned.
  const msg = String(err?.message ?? "");
  const code = typeof err?.code === "number" ? err.code : undefined;
  const errno = typeof err?.code === "string" ? err.code : undefined;

  // google-auth could not load/parse the key file at call time.
  if (
    errno === "ENOENT" ||
    /could not load the default credentials|no such file or directory|private key|DECODER routines|invalid_grant/i.test(msg)
  ) {
    logVisionDiagnostic("unauthenticated");
    return new ProviderCallError("Google Vision credentials rejected or unreadable", { retryable: false });
  }
  if (code === 7) {
    // PERMISSION_DENIED — never retry. Distinguish the common root causes.
    if (/has not been used|is disabled|SERVICE_DISABLED/i.test(msg)) logVisionDiagnostic("api_disabled");
    else if (/billing/i.test(msg)) logVisionDiagnostic("billing");
    else logVisionDiagnostic("permission_denied");
    return new ProviderCallError("Google Vision authentication failed", { retryable: false });
  }
  if (code === 16) {
    logVisionDiagnostic("unauthenticated");
    return new ProviderCallError("Google Vision authentication failed", { retryable: false });
  }
  // gRPC: 14 UNAVAILABLE, 8 RESOURCE_EXHAUSTED (quota), 4 DEADLINE_EXCEEDED.
  if (code === 8) {
    logVisionDiagnostic("quota");
    return new ProviderCallError("Google Vision temporarily unavailable", { retryable: true });
  }
  if (code === 14 || code === 4 || (errno && NETWORK_ERRNO.has(errno))) {
    logVisionDiagnostic("unavailable");
    return new ProviderCallError("Google Vision temporarily unavailable", { retryable: true });
  }
  if (code === 3) {
    logVisionDiagnostic("bad_image");
    return new ProviderInputUnsupportedError("Google Vision could not parse the image");
  }
  logVisionDiagnostic("unknown");
  return new ProviderCallError("Google Vision request failed", { retryable: true });
}

/** Test-only: resets the memoized SDK client and diagnostic throttle. */
export function __resetVisionClient() {
  client = null;
  clientInjectedForTests = false;
  lastLogged.clear();
}

/** Test-only: injects a fake SDK client so no real Google API call is made. */
export function __setVisionClientForTests(fake: VisionClientLike | null) {
  client = fake;
  clientInjectedForTests = fake !== null;
  lastLogged.clear();
}
