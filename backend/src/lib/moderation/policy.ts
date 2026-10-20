/**
 * Central content policy for Gihanga Updates.
 *
 * RESPONSIBILITIES
 *  - Map provider-specific labels (OpenAI moderation categories, Google Vision
 *    SafeSearch likelihoods) onto platform PolicyCategories with normalized
 *    0..1 scores.
 *  - Decide, per category, what score means REJECTED / PENDING_REVIEW / pass,
 *    honoring the platform's calibration rules:
 *      * medical / spoof / educational imagery is NEVER auto-rejected,
 *      * "racy" (suggestive, e.g. swimwear) routes to human review at high
 *        confidence instead of automatic rejection,
 *      * breastfeeding / ordinary bodies must not be treated as explicit.
 *  - Provide user-facing, non-graphic rejection messages (no thresholds,
 *    no provider payloads, no exploitable detail).
 *  - Define the CRITICAL escalation protocol for potential child-sexual-abuse
 *    and sexual-exploitation material: never display it, never re-submit it to
 *    providers, never describe it to the user, restrict evidence access to
 *    authorized safety personnel, and preserve the audit trail for reporting.
 */

import {
  CategoryAssessment,
  PolicyCategory,
  Severity,
} from "./types";

// ─── Threshold model ────────────────────────────────────────────────────────

export interface Thresholds {
  review: number;
  block: number;
}

/** Per-category policy behaviour. Calibrated, documented, admin-tunable at a safe distance. */
export interface CategoryPolicy {
  category: PolicyCategory;
  /** Severity used for staff queue prioritization. */
  severity: Severity;
  /** Human-readable label shown to users (non-graphic). */
  userLabel: string;
}

export const CATEGORY_POLICIES: Record<PolicyCategory, CategoryPolicy> = {
  sexual_content: {
    category: "sexual_content",
    severity: "high",
    userLabel: "Sexual content",
  },
  sexual_content_minors: {
    category: "sexual_content_minors",
    severity: "critical",
    userLabel: "Prohibited content",
  },
  sexual_exploitation: {
    category: "sexual_exploitation",
    severity: "critical",
    userLabel: "Prohibited content",
  },
  suggestive_content: {
    category: "suggestive_content",
    severity: "medium",
    userLabel: "Sexually suggestive content",
  },
  graphic_violence: {
    category: "graphic_violence",
    severity: "high",
    userLabel: "Graphic violence",
  },
  violence: {
    category: "violence",
    severity: "medium",
    userLabel: "Violent content",
  },
  harassment: {
    category: "harassment",
    severity: "high",
    userLabel: "Harassment or threats",
  },
  hate_speech: {
    category: "hate_speech",
    severity: "high",
    userLabel: "Hate speech",
  },
  self_harm: {
    category: "self_harm",
    severity: "high",
    userLabel: "Self-harm content",
  },
  illicit_activity: {
    category: "illicit_activity",
    severity: "medium",
    userLabel: "Illegal or dangerous activity",
  },
  spam_scam: {
    category: "spam_scam",
    severity: "low",
    userLabel: "Spam or scam content",
  },
  sensitive_medical: {
    category: "sensitive_medical",
    severity: "low",
    userLabel: "Sensitive medical content",
  },
};

/**
 * Categories whose high scores trigger automatic REJECTION.
 * NOTE: sensitive_medical is deliberately absent — medical imagery routes to
 * human review only, and spam_scam is review-only for images (text spam is
 * handled with much lower confidence requirements because users can flag it).
 */
export const AUTO_REJECT_CATEGORIES: ReadonlySet<PolicyCategory> = new Set([
  "sexual_content",
  "sexual_content_minors",
  "sexual_exploitation",
  "graphic_violence",
  "harassment",
  "hate_speech",
  "self_harm",
]);

/**
 * Categories that trigger human review above the review threshold but are
 * NEVER auto-rejected (false-positive-sensitive categories).
 */
export const REVIEW_ONLY_CATEGORIES: ReadonlySet<PolicyCategory> = new Set([
  "suggestive_content",
  "violence",
  "illicit_activity",
  "spam_scam",
  "sensitive_medical",
]);

// ─── OpenAI category mapping ────────────────────────────────────────────────

/**
 * OpenAI omni-moderation-latest category taxonomy (per the official
 * Moderation API guide). Scores are already 0..1 floats.
 */
const OPENAI_CATEGORY_MAP: Record<string, PolicyCategory> = {
  sexual: "sexual_content",
  "sexual/minors": "sexual_content_minors",
  harassment: "harassment",
  "harassment/threatening": "harassment",
  hate: "hate_speech",
  "hate/threatening": "hate_speech",
  illicit: "illicit_activity",
  "illicit/violent": "illicit_activity",
  "self-harm": "self_harm",
  "self-harm/instructions": "self_harm",
  "self-harm/intent": "self_harm",
  violence: "violence",
  "violence/graphic": "graphic_violence",
};

/** Any score at or above this on a CRITICAL category triggers the safety protocol. */
export const CRITICAL_CATEGORY_TRIGGER_SCORE = 0.1;

export function mapOpenAICategoryScores(
  categoryScores: Record<string, number>,
): CategoryAssessment[] {
  const out: CategoryAssessment[] = [];
  for (const [label, score] of Object.entries(categoryScores ?? {})) {
    const category = OPENAI_CATEGORY_MAP[label];
    if (!category || typeof score !== "number") continue;
    out.push({ category, score: clamp01(score), providerLabel: label });
  }
  return out;
}

// ─── Google Vision SafeSearch mapping ───────────────────────────────────────

/** Vision likelihood enum → normalized score. */
const VISION_LIKELIHOOD_SCORE: Record<string, number> = {
  VERY_UNLIKELY: 0.0,
  UNLIKELY: 0.15,
  POSSIBLE: 0.4,
  LIKELY: 0.6,
  VERY_LIKELY: 0.85,
};

const VISION_CATEGORY_MAP: Record<string, PolicyCategory> = {
  adult: "sexual_content",
  racy: "suggestive_content",
  violence: "violence",
  medical: "sensitive_medical",
  spoof: undefined as unknown as PolicyCategory, // spoof is never actionable
};

export function mapVisionLikelihoods(likelihoods: {
  adult?: string;
  spoof?: string;
  medical?: string;
  violence?: string;
  racy?: string;
}): CategoryAssessment[] {
  const out: CategoryAssessment[] = [];
  for (const [label, raw] of Object.entries(likelihoods ?? {})) {
    if (label === "spoof") continue; // deliberate: spoofing is not a safety issue
    const category = VISION_CATEGORY_MAP[label];
    if (!category) continue;
    const score = VISION_LIKELIHOOD_SCORE[String(raw).toUpperCase()];
    if (score === undefined) continue; // UNKNOWN/absent -> skip (treated as no signal)
    out.push({ category, score, providerLabel: `safeSearch.${label}` });
  }
  return out;
}

// ─── Local prohibited-terms fallback ────────────────────────────────────────

/**
 * Conservative, unambiguous explicit-term blocklist used when NO AI provider
 * is reachable/configured, and as a cheap first pass before provider calls.
 * It only contains terms that are unambiguously pornographic in isolation —
 * deliberately small to avoid false positives. AI providers do the real work;
 * this is a safety net, not the policy.
 */
const DEFAULT_PROHIBITED_TERMS: string[] = [
  // NOTE: deliberately EXTREMELY conservative — only unambiguous terms whose
  // standalone appearance is pornographic in context. Words like
  // "pornography" are excluded because of legitimate academic/metaphorical
  // usage ("the pornography of fear"); the AI providers do the real work.
  "porn",
  "xxx videos",
  "hardcore sex",
  "explicit sex",
  "escort service",
  "nudes for sale",
  "selling nudes",
];

export function prohibitedTermHit(text: string, terms: string[] = DEFAULT_PROHIBITED_TERMS): string | null {
  const lower = text.toLowerCase();
  for (const term of terms) {
    if (!term) continue;
    // Word-boundary match: "porn" must NOT match "pornography of ideas"
    // (legitimate academic usage), but must match "my porn collection".
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    if (re.test(lower)) return term;
  }
  return null;
}

// ─── User-facing messaging ─────────────────────────────────────────────────

/**
 * Builds the safe user message for a rejection. Deliberately vague about
 * specifics: names the policy area, points at the guidelines, and says
 * nothing about scores, thresholds or providers.
 */
export function userRejectionMessage(categories: CategoryAssessment[]): string {
  const top = highestSeverityCategory(categories);
  if (!top) {
    return "This content could not be published because it may violate our Content Guidelines. You can edit it and try again, or appeal if you believe this is a mistake.";
  }
  const policy = CATEGORY_POLICIES[top.category];
  if (policy.severity === "critical") {
    // Never describe critical-category content to the user.
    return "This content could not be published because it violates our Content Guidelines. This decision cannot be appealed through automated review.";
  }
  return (
    `This content could not be published because it may violate our policy on ${policy.userLabel.toLowerCase()}. ` +
    "You can edit it and try again, or appeal if you believe this is a mistake."
  );
}

export function userReviewMessage(): string {
  return "Thanks for submitting. Our safety systems need a little more time with this content — it will be reviewed before it becomes visible to others.";
}

export function userFailedMessage(): string {
  return "We couldn't finish checking this content. Nothing was published — please try again in a moment.";
}

// ─── Severity helpers ───────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<Severity, number> = { low: 0, medium: 1, high: 2, critical: 3 };

export function maxSeverity(a: Severity, b: Severity): Severity {
  return SEVERITY_ORDER[a] >= SEVERITY_ORDER[b] ? a : b;
}

export function highestSeverityCategory(categories: CategoryAssessment[]): CategoryAssessment | null {
  let best: CategoryAssessment | null = null;
  let bestRank = -1;
  for (const c of categories) {
    const sev = CATEGORY_POLICIES[c.category]?.severity ?? "low";
    if (SEVERITY_ORDER[sev] > bestRank) {
      best = c;
      bestRank = SEVERITY_ORDER[sev];
    }
  }
  return best;
}

export function severityForCategories(categories: CategoryAssessment[]): Severity {
  let sev: Severity = "low";
  for (const c of categories) {
    sev = maxSeverity(sev, CATEGORY_POLICIES[c.category]?.severity ?? "low");
  }
  return sev;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, 0), 1);
}

/**
 * Threshold behavior for a single category assessment.
 * Returns the action implied by THIS category alone.
 */
export type CategoryAction = "block" | "review" | "pass";

export function categoryAction(
  assessment: CategoryAssessment,
  thresholds: Thresholds,
): CategoryAction {
  const { category, score } = assessment;

  // CRITICAL categories: any meaningful signal goes straight to the protocol.
  if (category === "sexual_content_minors" || category === "sexual_exploitation") {
    return score >= CRITICAL_CATEGORY_TRIGGER_SCORE ? "block" : "pass";
  }

  const policy = CATEGORY_POLICIES[category];
  if (!policy) return "pass";

  if (AUTO_REJECT_CATEGORIES.has(category) && score >= thresholds.block) {
    return "block";
  }
  if (score >= thresholds.review) {
    // Review-only categories never block regardless of score.
    return "review";
  }
  return "pass";
}
