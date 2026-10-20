/**
 * Content-safety policy + decision-engine unit tests.
 *
 * Covers the REQUIRED verification matrix from the moderation spec:
 *  1. safe text/images can be approved
 *  2. clearly prohibited content is blocked
 *  3. uncertain content stays pending review
 *  4. provider timeouts do NOT publish content (fail-closed)
 *  5. provider errors never accidentally approve
 *  + medical/racy calibration, CSAM critical protocol, threshold clamping,
 *    local prohibited terms, and user-message hygiene (no internal detail).
 *
 * Run: npm run test:moderation
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { combineProviderOutcomes, combineWithConfig } from "../src/lib/moderation/decisionEngine";
import {
  mapOpenAICategoryScores,
  mapVisionLikelihoods,
  prohibitedTermHit,
  userRejectionMessage,
  categoryAction,
  CRITICAL_CATEGORY_TRIGGER_SCORE,
} from "../src/lib/moderation/policy";
import {
  ProviderOutcome,
  CategoryAssessment,
} from "../src/lib/moderation/types";
import { getModerationConfig, __resetModerationConfigForTests } from "../src/lib/moderation/config";

const THRESHOLDS = { review: 0.5, block: 0.8 };

function outcome(providerId: string, verdict: ProviderOutcome["verdict"], categories: CategoryAssessment[] = [], error?: string): ProviderOutcome {
  return { providerId, verdict, categories, error };
}

function cat(category: CategoryAssessment["category"], score: number, providerLabel = "test"): CategoryAssessment {
  return { category, score, providerLabel };
}

// ─── 1. Safe content is approved ─────────────────────────────────────────────

test("safe provider outcomes approve content", () => {
  const result = combineProviderOutcomes(
    [outcome("openai", "safe"), outcome("google-vision", "safe")],
    { reviewThreshold: THRESHOLDS.review, blockThreshold: THRESHOLDS.block },
  );
  assert.equal(result.decision, "APPROVED");
  assert.equal(result.criticalEscalation, false);
});

test("low-confidence category scores do not block or hold content", () => {
  // e.g. a bikini photo that Vision calls racy=UNLIKELY -> score 0.15
  const result = combineProviderOutcomes(
    [outcome("google-vision", "flagged", [cat("suggestive_content", 0.15)])],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "APPROVED");
});

// ─── 2. Clearly prohibited content is blocked ────────────────────────────────

test("high-confidence sexual content is rejected", () => {
  const result = combineProviderOutcomes(
    [outcome("openai", "flagged", [cat("sexual_content", 0.97)])],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "REJECTED");
  assert.equal(result.severity, "high");
  assert.ok(result.userMessage);
  assert.ok(result.userMessage!.toLowerCase().includes("sexual content"));
});

test("graphic violence above block threshold is rejected", () => {
  const result = combineProviderOutcomes(
    [outcome("openai", "flagged", [cat("graphic_violence", 0.93)])],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "REJECTED");
});

test("a rejection from ANY provider stands even when another says safe", () => {
  const result = combineProviderOutcomes(
    [outcome("openai", "flagged", [cat("sexual_content", 0.95)]), outcome("google-vision", "safe")],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "REJECTED");
});

// ─── 3. Uncertain content goes to human review ───────────────────────────────

test("mid-range scores route to pending review", () => {
  const result = combineProviderOutcomes(
    [outcome("openai", "flagged", [cat("sexual_content", 0.62)])],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "PENDING_REVIEW");
});

test("provider disagreement (flagged vs safe) routes to review", () => {
  // One provider suspicious but below thresholds, other clean.
  const result = combineProviderOutcomes(
    [outcome("openai", "flagged", [cat("sexual_content", 0.3)]), outcome("google-vision", "safe")],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "PENDING_REVIEW");
});

// ─── 4/5. Fail-closed: errors and timeouts NEVER approve ─────────────────────

test("all providers erroring yields FAILED (never approved)", () => {
  const result = combineProviderOutcomes(
    [outcome("openai", "error", [], "Provider request timed out")],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "FAILED");
  assert.ok(result.error);
});

test("a timeout on the only provider never approves content", () => {
  const timeout = outcome("openai", "error", [], "Provider request timed out");
  const result = combineProviderOutcomes([timeout], { reviewThreshold: 0.5, blockThreshold: 0.8 });
  assert.notEqual(result.decision, "APPROVED");
  assert.equal(result.decision, "FAILED");
});

test("one provider errors while another approves -> pending review (uncertainty goes to humans)", () => {
  const result = combineProviderOutcomes(
    [outcome("openai", "error", [], "Provider responded with status 500"), outcome("google-vision", "safe")],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "PENDING_REVIEW");
});

test("zero outcomes with fail-closed defaults to FAILED, not APPROVED", () => {
  const result = combineProviderOutcomes([], { reviewThreshold: 0.5, blockThreshold: 0.8 });
  assert.equal(result.decision, "FAILED");
});

test("fail-open mode still never approves with partial data", () => {
  // Explicitly configured fail-open: a failed provider + a safe one still
  // cannot approve outright.
  const result = combineProviderOutcomes(
    [outcome("openai", "error", [], "boom"), outcome("google-vision", "safe")],
    { reviewThreshold: 0.5, blockThreshold: 0.8, failClosed: false },
  );
  assert.equal(result.decision, "PENDING_REVIEW");
});

// ─── Calibration: medical / racy / spoof are never auto-rejected ─────────────

test("Vision medical=VERY_LIKELY routes to review, never rejection", () => {
  const medical = mapVisionLikelihoods({ medical: "VERY_LIKELY", adult: "VERY_UNLIKELY", violence: "VERY_UNLIKELY" });
  const result = combineProviderOutcomes(
    [outcome("google-vision", "flagged", medical)],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "PENDING_REVIEW");
  assert.notEqual(result.decision, "REJECTED");
});

test("Vision racy=VERY_LIKELY routes to review (swimwear calibration), not rejection", () => {
  const racy = mapVisionLikelihoods({ racy: "VERY_LIKELY", adult: "UNLIKELY" });
  const result = combineProviderOutcomes(
    [outcome("google-vision", "flagged", racy)],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "PENDING_REVIEW");
});

test("Vision spoof likelihood is ignored entirely", () => {
  const cats = mapVisionLikelihoods({ spoof: "VERY_LIKELY" });
  assert.equal(cats.length, 0);
});

test("Vision adult=LIKELY (0.6) is review; adult=VERY_LIKELY (0.85) is rejection", () => {
  const likely = mapVisionLikelihoods({ adult: "LIKELY" });
  const r1 = combineProviderOutcomes([outcome("v", "flagged", likely)], { reviewThreshold: 0.5, blockThreshold: 0.8 });
  assert.equal(r1.decision, "PENDING_REVIEW");

  const veryLikely = mapVisionLikelihoods({ adult: "VERY_LIKELY" });
  const r2 = combineProviderOutcomes([outcome("v", "flagged", veryLikely)], { reviewThreshold: 0.5, blockThreshold: 0.8 });
  assert.equal(r2.decision, "REJECTED");
});

test("breastfeeding-style signals (adult UNLIKELY, medical POSSIBLE) stay approved", () => {
  const cats = mapVisionLikelihoods({ adult: "UNLIKELY", medical: "POSSIBLE", racy: "POSSIBLE" });
  const result = combineProviderOutcomes(
    [outcome("google-vision", "flagged", cats)],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "APPROVED");
});

// ─── CRITICAL protocol (potential CSAM / sexual exploitation) ────────────────

test("sexual/minors signal triggers the critical protocol and rejection", () => {
  const result = combineProviderOutcomes(
    [outcome("openai", "flagged", [cat("sexual_content_minors", 0.42)])],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.equal(result.decision, "REJECTED");
  assert.equal(result.criticalEscalation, true);
  assert.equal(result.severity, "critical");
});

test("critical-protocol user message is generic — no category detail", () => {
  const result = combineProviderOutcomes(
    [outcome("openai", "flagged", [cat("sexual_content_minors", 0.9)])],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  assert.ok(result.userMessage);
  assert.ok(!result.userMessage!.toLowerCase().includes("minor"));
  assert.ok(!result.userMessage!.toLowerCase().includes("child"));
  assert.ok(result.userMessage!.includes("cannot be appealed"));
});

test("critical trigger fires well below the normal review threshold", () => {
  // Any signal >= 0.1 on sexual/minors is critical — deliberately paranoid.
  const below = cat("sexual_content_minors", CRITICAL_CATEGORY_TRIGGER_SCORE - 0.01);
  assert.equal(categoryAction(below, THRESHOLDS), "pass");
  const at = cat("sexual_content_minors", CRITICAL_CATEGORY_TRIGGER_SCORE);
  assert.equal(categoryAction(at, THRESHOLDS), "block");
});

// ─── OpenAI category mapping ─────────────────────────────────────────────────

test("OpenAI category scores map to platform categories correctly", () => {
  const cats = mapOpenAICategoryScores({
    sexual: 0.91,
    "sexual/minors": 0.02,
    "violence/graphic": 0.4,
    harassment: 0.55,
  });
  const byCat = new Map(cats.map((c) => [c.category, c]));
  assert.equal(byCat.get("sexual_content")!.score, 0.91);
  assert.equal(byCat.get("graphic_violence")!.score, 0.4);
  assert.equal(byCat.get("harassment")!.score, 0.55);
  // sexual/minors at 0.02 is below the critical trigger — still mapped but inert.
  assert.equal(byCat.get("sexual_content_minors")!.score, 0.02);
  assert.equal(cats.length, 4);
});

test("unknown OpenAI labels are dropped, non-numeric scores are dropped", () => {
  const cats = mapOpenAICategoryScores({ "some/future": 0.9, sexual: "high" as unknown as number });
  assert.equal(cats.length, 0);
});

// ─── Local prohibited terms ──────────────────────────────────────────────────

test("local prohibited terms hit unambiguous explicit text only", () => {
  assert.ok(prohibitedTermHit("check out my porn collection"));
  assert.ok(prohibitedTermHit("Hardcore sex videos for sale"));
  assert.equal(prohibitedTermHit("pornography of ideas — a critical theory essay"), null);
  assert.equal(prohibitedTermHit("a lovely day in Kigali"), null);
});

// ─── User message hygiene ────────────────────────────────────────────────────

test("user rejection messages never expose thresholds, scores or provider names", () => {
  const result = combineProviderOutcomes(
    [outcome("openai-omni", "flagged", [cat("sexual_content", 0.99, "sexual")])],
    { reviewThreshold: 0.5, blockThreshold: 0.8 },
  );
  const msg = result.userMessage!;
  assert.ok(!msg.includes("0."));
  assert.ok(!msg.toLowerCase().includes("openai"));
  assert.ok(!msg.toLowerCase().includes("score"));
  assert.ok(!msg.toLowerCase().includes("threshold"));
});

test("rejection message names the policy area without graphic detail", () => {
  const msg = userRejectionMessage([cat("graphic_violence", 0.9)]);
  assert.ok(msg.toLowerCase().includes("graphic violence"));
});

// ─── Threshold clamping / config ─────────────────────────────────────────────

test("misconfigured thresholds are clamped and block stays above review", () => {
  const original = process.env.CONTENT_MODERATION_BLOCK_THRESHOLD;
  const originalReview = process.env.CONTENT_MODERATION_REVIEW_THRESHOLD;
  try {
    process.env.CONTENT_MODERATION_REVIEW_THRESHOLD = "0.95"; // above max
    process.env.CONTENT_MODERATION_BLOCK_THRESHOLD = "0.3"; // below review
    __resetModerationConfigForTests();
    const config = getModerationConfig();
    assert.ok(config.reviewThreshold <= 0.9);
    assert.ok(config.blockThreshold > config.reviewThreshold);
    assert.ok(config.blockThreshold >= 0.4);
  } finally {
    if (original === undefined) delete process.env.CONTENT_MODERATION_BLOCK_THRESHOLD;
    else process.env.CONTENT_MODERATION_BLOCK_THRESHOLD = original;
    if (originalReview === undefined) delete process.env.CONTENT_MODERATION_REVIEW_THRESHOLD;
    else process.env.CONTENT_MODERATION_REVIEW_THRESHOLD = originalReview;
    __resetModerationConfigForTests();
  }
});

test("fail-closed is the default", () => {
  __resetModerationConfigForTests();
  const config = getModerationConfig();
  assert.equal(config.failClosed, true);
  assert.equal(config.enabled, true);
  __resetModerationConfigForTests();
});

test("combineWithConfig uses env thresholds", () => {
  const result = combineWithConfig([outcome("p", "safe")]);
  assert.equal(result.decision, "APPROVED");
});
