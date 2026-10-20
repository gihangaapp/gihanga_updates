/**
 * Provider error sanitization + live-enforcement threshold tests.
 *
 * Verifies the "API keys and sensitive provider errors never appear in
 * client responses or logs" requirement at the adapter-boundary level.
 *
 * Run: npm run test:moderation
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { errorOutcome, ProviderCallError, ProviderInputUnsupportedError } from "../src/lib/moderation/providers/types";
import { redactSecrets } from "../src/lib/moderation/config";
import { getModerationConfig, __resetModerationConfigForTests } from "../src/lib/moderation/config";

// ─── errorOutcome sanitization ───────────────────────────────────────────────

test("errorOutcome never carries raw error text or keys", () => {
  const err = new ProviderCallError("Request failed: 401 invalid_api_key sk-SECRETVALUE123456");
  const outcome = errorOutcome("openai", err);
  assert.equal(outcome.verdict, "error");
  assert.ok(outcome.error);
  assert.ok(!outcome.error!.includes("sk-SECRETVALUE"), "raw key material leaked");
  assert.ok(!outcome.error!.includes("invalid_api_key"));
  // Message is generic and categorized.
  assert.ok(["OpenAI rejected the request", "Provider request failed"].includes(outcome.error!));
});

test("timeout-shaped errors map to a timeout message", () => {
  const err = new Error("openai timed out after 15000ms");
  const outcome = errorOutcome("openai", err);
  assert.equal(outcome.error, "Provider request timed out");
});

test("unsupported-input errors map to a clear non-sensitive message", () => {
  const err = new ProviderInputUnsupportedError("OpenAI image moderation requires a publicly fetchable image URL");
  const outcome = errorOutcome("openai", err);
  assert.ok(outcome.error!.includes("cannot process"));
});

test("unknown thrown values degrade to a generic message", () => {
  const outcome = errorOutcome("google-vision", { weird: "object" });
  assert.equal(outcome.error, "Provider temporarily unavailable");
});

// ─── redactSecrets belt-and-braces ───────────────────────────────────────────

test("redactSecrets catches key/value pairs and long tokens", () => {
  const dirty = 'config error: api_key = AIzaSyD-1234567890abcdefghijk and token: "ya29.a0ARrdaM"';
  const clean = redactSecrets(dirty);
  assert.ok(!clean.includes("AIzaSyD-1234567890abcdefghijk"));
  assert.ok(!clean.includes("ya29.a0ARrdaM"));
});

// ─── Live-stream enforcement threshold logic ────────────────────────────────

test("live violation limit is read from config with clamping", () => {
  const saved = process.env.LIVE_MODERATION_VIOLATION_LIMIT;
  try {
    process.env.LIVE_MODERATION_VIOLATION_LIMIT = "2";
    __resetModerationConfigForTests();
    assert.equal(getModerationConfig().liveViolationLimit, 2);

    process.env.LIVE_MODERATION_VIOLATION_LIMIT = "0"; // below min -> clamped
    __resetModerationConfigForTests();
    assert.equal(getModerationConfig().liveViolationLimit, 1);

    process.env.LIVE_MODERATION_VIOLATION_LIMIT = "999"; // above max -> clamped
    __resetModerationConfigForTests();
    assert.equal(getModerationConfig().liveViolationLimit, 10);
  } finally {
    if (saved === undefined) delete process.env.LIVE_MODERATION_VIOLATION_LIMIT;
    else process.env.LIVE_MODERATION_VIOLATION_LIMIT = saved;
    __resetModerationConfigForTests();
  }
});

test("live chat moderation can be disabled by flag while keeping title checks", () => {
  const saved = process.env.LIVE_MODERATION_CHAT_ENABLED;
  try {
    process.env.LIVE_MODERATION_CHAT_ENABLED = "false";
    __resetModerationConfigForTests();
    assert.equal(getModerationConfig().liveChatModerationEnabled, false);
    assert.equal(getModerationConfig().enabled, true); // pipeline itself still on
  } finally {
    if (saved === undefined) delete process.env.LIVE_MODERATION_CHAT_ENABLED;
    else process.env.LIVE_MODERATION_CHAT_ENABLED = saved;
    __resetModerationConfigForTests();
  }
});

// ─── Decision-to-status mapping (the persistence contract) ──────────────────

test("decisionToStatus maps every decision to its persistence status", async () => {
  const { decisionToStatus } = await import("../src/services/moderation/contentModerationService");
  assert.equal(decisionToStatus("APPROVED"), "approved");
  assert.equal(decisionToStatus("REJECTED"), "rejected");
  assert.equal(decisionToStatus("PENDING_REVIEW"), "pending_review");
  assert.equal(decisionToStatus("FAILED"), "failed");
  assert.equal(decisionToStatus("PROCESSING"), "processing");
});

// ─── Content-hash helpers (duplicate-scan avoidance) ─────────────────────────

test("hashBytes and hashText are stable and collision-resistant for inputs", async () => {
  const { hashBytes, hashText } = await import("../src/services/moderation/contentModerationService");
  const a = Buffer.from("same bytes");
  const b = Buffer.from("same bytes");
  const c = Buffer.from("different bytes");
  assert.equal(hashBytes(a), hashBytes(b));
  assert.notEqual(hashBytes(a), hashBytes(c));
  assert.equal(hashBytes(a).length, 64); // sha256 hex

  // Unicode normalization: composed and decomposed forms hash the same.
  assert.equal(hashText("café"), hashText("cafe\u0301"));
  assert.notEqual(hashText("café"), hashText("cafe"));
});
