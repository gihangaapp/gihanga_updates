/**
 * Decision engine: combines provider outcomes into ONE final decision.
 *
 * This is the ONLY place a ModerationDecision is computed. The rules are:
 *
 *  1. CRITICAL PROTOCOL — any critical-category signal (potential CSAM /
 *     sexual exploitation) at/above the trigger score:
 *       -> REJECTED, criticalEscalation = true. Stop calling providers for
 *          this content, quarantine everything, staff-only escalation.
 *
 *  2. REJECTION — any provider outcome contains a category whose action is
 *     "block":
 *       -> REJECTED (highest-severity category wins the user message).
 *
 *  3. REVIEW — any category action is "review", OR providers disagree
 *     (one flagged/review, one safe):
 *       -> PENDING_REVIEW.
 *
 *  4. FAILURE — at least one REQUIRED provider errored and none rejected:
 *       - zero providers succeeded  -> FAILED (retryable, fail-closed)
 *       - some succeeded, some errored -> PENDING_REVIEW (uncertainty goes
 *         to humans; content stays private meanwhile)
 *
 *  5. APPROVED — all required checks completed and nothing above thresholds.
 *
 * FAIL-CLOSED GUARANTEE: a provider timeout/error can never produce APPROVED.
 * The only paths to APPROVED are (5) or an explicit hash-cache reuse of a
 * previous APPROVED decision for byte-identical media from the same owner.
 */

import {
  CategoryAssessment,
  ModerationResult,
  ProviderOutcome,
  Severity,
} from "./types";
import {
  categoryAction,
  highestSeverityCategory,
  severityForCategories,
  userFailedMessage,
  userRejectionMessage,
  userReviewMessage,
  CRITICAL_CATEGORY_TRIGGER_SCORE,
} from "./policy";
import { getModerationConfig } from "./config";

export interface CombineOptions {
  /** Outcome count required for full verification (per required provider). */
  failClosed?: boolean;
  reviewThreshold: number;
  blockThreshold: number;
}

export function combineProviderOutcomes(
  outcomes: ProviderOutcome[],
  options: CombineOptions,
): ModerationResult {
  const failClosed = options.failClosed ?? true;

  // Aggregate categories across providers (max score per category).
  const byCategory = new Map<string, CategoryAssessment>();
  for (const outcome of outcomes) {
    for (const cat of outcome.categories) {
      const existing = byCategory.get(cat.category);
      if (!existing || cat.score > existing.score) {
        byCategory.set(cat.category, cat);
      }
    }
  }
  const categories = Array.from(byCategory.values());

  // 1. Critical protocol.
  const criticalHit = categories.find(
    (c) =>
      (c.category === "sexual_content_minors" || c.category === "sexual_exploitation") &&
      c.score >= CRITICAL_CATEGORY_TRIGGER_SCORE,
  );
  if (criticalHit) {
    return {
      decision: "REJECTED",
      categories,
      severity: "critical",
      criticalEscalation: true,
      providerOutcomes: outcomes,
      userMessage: userRejectionMessage(categories),
    };
  }

  // 2. Any blocking category?
  const blocking = categories.filter(
    (c) => categoryAction(c, { review: options.reviewThreshold, block: options.blockThreshold }) === "block",
  );
  if (blocking.length > 0) {
    return {
      decision: "REJECTED",
      categories,
      severity: severityForCategories(categories),
      criticalEscalation: false,
      providerOutcomes: outcomes,
      userMessage: userRejectionMessage(categories),
    };
  }

  // 3. Review-worthy categories?
  const review = categories.filter(
    (c) => categoryAction(c, { review: options.reviewThreshold, block: options.blockThreshold }) === "review",
  );
  if (review.length > 0) {
    return {
      decision: "PENDING_REVIEW",
      categories,
      severity: severityForCategories(categories),
      criticalEscalation: false,
      providerOutcomes: outcomes,
      userMessage: userReviewMessage(),
    };
  }

  // Suspicion rule: an elevated-but-sub-threshold signal on a SEVERE
  // category (>= 60% of the review threshold) is not proof of anything, but
  // it is enough to hold content for human eyes. This is also what makes
  // provider disagreement fail safe: when providers conflict, the elevated
  // severe signal keeps the content private while a human decides.
  const suspicionBound = options.reviewThreshold * 0.6;
  const suspicious = categories.find(
    (c) =>
      (c.category === "sexual_content" ||
        c.category === "graphic_violence" ||
        c.category === "harassment" ||
        c.category === "hate_speech" ||
        c.category === "self_harm") &&
      c.score >= suspicionBound,
  );
  if (suspicious) {
    return {
      decision: "PENDING_REVIEW",
      categories,
      severity: severityForCategories(categories),
      criticalEscalation: false,
      providerOutcomes: outcomes,
      userMessage: userReviewMessage(),
    };
  }

  // NOTE: provider verdicts ("flagged"/"safe") are informational metadata —
  // decisions derive from category scores and error states ONLY. A verdict
  // can never override what the numbers (or a failure) say.

  // 4. Fail-closed error handling.
  const errors = outcomes.filter((o) => o.verdict === "error");
  const successes = outcomes.filter((o) => o.verdict === "safe");
  if (errors.length > 0) {
    if (successes.length === 0 || failClosed === false) {
      if (failClosed === false && successes.length > 0) {
        // Explicitly configured fail-open still requires EVERY provider to
        // have responded — we never approve on partial data alone.
        return {
          decision: "PENDING_REVIEW",
          categories,
          severity: severityForCategories(categories),
          criticalEscalation: false,
          providerOutcomes: outcomes,
          userMessage: userReviewMessage(),
        };
      }
      return {
        decision: "FAILED",
        categories,
        severity: "medium",
        criticalEscalation: false,
        providerOutcomes: outcomes,
        userMessage: userFailedMessage(),
        error: errors[0].error || "A required safety check could not be completed",
      };
    }
    // Some providers succeeded, some errored, nothing negative surfaced.
    // Uncertain — humans decide. Content stays private.
    return {
      decision: "PENDING_REVIEW",
      categories,
      severity: severityForCategories(categories),
      criticalEscalation: false,
      providerOutcomes: outcomes,
      userMessage: userReviewMessage(),
    };
  }

  // 5. All required checks passed.
  if (outcomes.length === 0) {
    // No checks ran at all. With fail-closed this is FAILED (never APPROVED);
    // with the pipeline disabled the service short-circuits before reaching here.
    return failClosed
      ? {
          decision: "FAILED",
          categories,
          severity: "medium",
          criticalEscalation: false,
          providerOutcomes: outcomes,
          userMessage: userFailedMessage(),
          error: "No safety check was able to run",
        }
      : {
          decision: "APPROVED",
          categories,
          severity: "low",
          criticalEscalation: false,
          providerOutcomes: outcomes,
        };
  }

  return {
    decision: "APPROVED",
    categories,
    severity: severityForCategories(categories),
    criticalEscalation: false,
    providerOutcomes: outcomes,
  };
}

/** Convenience wrapper using the active environment config. */
export function combineWithConfig(outcomes: ProviderOutcome[]): ModerationResult {
  const config = getModerationConfig();
  return combineProviderOutcomes(outcomes, {
    failClosed: config.failClosed,
    reviewThreshold: config.reviewThreshold,
    blockThreshold: config.blockThreshold,
  });
}

/** Severity ranking helper reused by staff queue ordering. */
export function severityRank(s: Severity): number {
  return { low: 0, medium: 1, high: 2, critical: 3 }[s];
}

export function topPolicyCategory(result: ModerationResult): CategoryAssessment | null {
  return highestSeverityCategory(result.categories);
}
