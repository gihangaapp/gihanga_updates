/**
 * Shared types for the Gihanga Updates content-safety system.
 *
 * These types are the vocabulary used by EVERY layer: provider adapters,
 * the decision engine, the central ContentModerationService, persistence
 * (ModerationRecord) and the API surface. Keeping them in one module makes
 * the status model impossible to contradict — there is exactly ONE
 * ModerationDecision enum and ONE set of policy categories.
 */

/** Final decision for a piece of content. Matches the required lifecycle. */
export type ModerationDecision =
  | "APPROVED"
  | "REJECTED"
  | "PENDING_REVIEW"
  | "PROCESSING"
  | "FAILED";

/** Persisted per-content moderation state (subset of ModerationDecision). */
export type ModerationStatus =
  | "processing"
  | "pending_review"
  | "approved"
  | "rejected"
  | "failed";

/**
 * Platform policy categories. Provider-specific labels (OpenAI categories,
 * Vision likelihoods) are NORMALIZED into these before any decision is made,
 * so policy thresholds are provider-independent.
 *
 * CRITICAL categories escalate through a dedicated safety protocol
 * (see policy.ts — CSAM_PROTOCOL) and are never described in detail to users.
 */
export type PolicyCategory =
  | "sexual_content"
  | "sexual_content_minors" // CRITICAL — dedicated protocol
  | "sexual_exploitation" // CRITICAL — dedicated protocol
  | "suggestive_content"
  | "graphic_violence"
  | "violence"
  | "harassment"
  | "hate_speech"
  | "self_harm"
  | "illicit_activity"
  | "spam_scam"
  | "sensitive_medical";

export const CRITICAL_CATEGORIES: ReadonlySet<PolicyCategory> = new Set([
  "sexual_content_minors",
  "sexual_exploitation",
]);

export type Severity = "low" | "medium" | "high" | "critical";

/**
 * One normalized category assessment produced by a provider adapter.
 * `score` is a 0..1 normalized confidence where 1 means the provider is
 * maximally confident the content violates the category.
 */
export interface CategoryAssessment {
  category: PolicyCategory;
  score: number;
  /** Raw provider label kept for staff-facing audit (never shown to users). */
  providerLabel: string;
}

/** What a single provider concluded about one unit of content. */
export type ProviderVerdict = "safe" | "flagged" | "review" | "error";

export interface ProviderOutcome {
  providerId: string;
  verdict: ProviderVerdict;
  /** Normalized category assessments (empty for verdict "error"). */
  categories: CategoryAssessment[];
  /** Sanitized, non-sensitive error description (verdict "error" only). */
  error?: string;
  /** ms the provider call took (observability). */
  latencyMs?: number;
  /** Whether the outcome came from a cached/short-circuit path. */
  cached?: boolean;
}

/** Where the content is being published — drives which checks are required. */
export type ContentSurface =
  | "post"
  | "reel"
  | "story"
  | "comment"
  | "story_reply"
  | "live_title"
  | "live_chat"
  | "profile_text"
  | "avatar"
  | "media";

export type MediaInputKind = "image" | "video";

/**
 * The combined result of the central moderation pipeline for one content
 * item. `userMessage` is safe to show to the publishing user: it names the
 * policy category (non-graphic phrasing) but NEVER thresholds, provider
 * payloads or internal details.
 */
export interface ModerationResult {
  decision: ModerationDecision;
  categories: CategoryAssessment[];
  /** Highest severity across triggered categories. */
  severity: Severity;
  /** Whether the critical (CSAM) protocol was triggered. */
  criticalEscalation: boolean;
  providerOutcomes: ProviderOutcome[];
  userMessage?: string;
  /** Populated when a required check failed — sanitized reason. */
  error?: string;
}

export interface ModerateTextInput {
  text: string;
  surface: ContentSurface;
  actorId?: string;
  /** Idempotency/dedupe: same text hash short-circuits provider calls. */
  contentRef?: { type: string; id: string };
}

export interface ModerateImageInput {
  /** Raw bytes when available (Vision accepts bytes; OpenAI needs a URL). */
  buffer?: Buffer;
  /** Publicly fetchable URL (OpenAI image moderation input). */
  url?: string;
  surface: ContentSurface;
  actorId?: string;
}

export interface ModerateVideoInput {
  buffer?: Buffer;
  localPath?: string;
  /** Cloudinary public_id when the video is Cloudinary-hosted. */
  cloudinaryPublicId?: string;
  durationSeconds?: number;
  surface: ContentSurface;
  actorId?: string;
}
