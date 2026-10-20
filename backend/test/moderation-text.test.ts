/**
 * End-to-end TEXT moderation pipeline tests using the deterministic STUB
 * provider (no network, no credentials). Exercises moderateText() through
 * the full provider + decision-engine path.
 *
 * Run: npm run test:moderation
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { moderateText } from "../src/services/moderation/contentModerationService";
import { __resetModerationConfigForTests } from "../src/lib/moderation/config";

function withStubMode(mode: string, fn: () => Promise<void>) {
  const saved = {
    NODE_ENV: process.env.NODE_ENV,
    STUB: process.env.CONTENT_MODERATION_PROVIDER_STUB,
    MODE: process.env.CONTENT_MODERATION_STUB_MODE,
    OPENAI_KEY: process.env.OPENAI_API_KEY,
    VISION_PROJECT: process.env.GOOGLE_CLOUD_PROJECT_ID,
    VISION_CREDS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  };
  process.env.NODE_ENV = "test";
  process.env.CONTENT_MODERATION_PROVIDER_STUB = "true";
  process.env.CONTENT_MODERATION_STUB_MODE = mode;
  delete process.env.OPENAI_API_KEY;
  delete process.env.GOOGLE_CLOUD_PROJECT_ID;
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  __resetModerationConfigForTests();
  return fn().finally(() => {
    process.env.NODE_ENV = saved.NODE_ENV;
    if (saved.STUB === undefined) delete process.env.CONTENT_MODERATION_PROVIDER_STUB;
    else process.env.CONTENT_MODERATION_PROVIDER_STUB = saved.STUB;
    if (saved.MODE === undefined) delete process.env.CONTENT_MODERATION_STUB_MODE;
    else process.env.CONTENT_MODERATION_STUB_MODE = saved.MODE;
    if (saved.OPENAI_KEY === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = saved.OPENAI_KEY;
    if (saved.VISION_PROJECT === undefined) delete process.env.GOOGLE_CLOUD_PROJECT_ID;
    else process.env.GOOGLE_CLOUD_PROJECT_ID = saved.VISION_PROJECT;
    if (saved.VISION_CREDS === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    else process.env.GOOGLE_APPLICATION_CREDENTIALS = saved.VISION_CREDS;
    __resetModerationConfigForTests();
  });
}

test("moderateText: stub approve mode approves clean text", async () => {
  await withStubMode("approve", async () => {
    const result = await moderateText({ text: "Beautiful sunset over Kigali today!", surface: "post" });
    assert.equal(result.decision, "APPROVED");
    assert.equal(result.criticalEscalation, false);
    assert.equal(result.providerOutcomes.length, 1);
    assert.equal(result.providerOutcomes[0].providerId, "stub");
  });
});

test("moderateText: stub reject-sexual blocks prohibited text", async () => {
  await withStubMode("reject-sexual", async () => {
    const result = await moderateText({ text: "explicit content", surface: "post" });
    assert.equal(result.decision, "REJECTED");
    assert.equal(result.severity, "high");
    assert.ok(result.userMessage!.includes("sexual"));
  });
});

test("moderateText: stub review mode routes to pending review", async () => {
  await withStubMode("review", async () => {
    const result = await moderateText({ text: "borderline content", surface: "comment" });
    assert.equal(result.decision, "PENDING_REVIEW");
    assert.ok(result.userMessage!.includes("review"));
  });
});

test("moderateText: stub error mode fails CLOSED (never approves)", async () => {
  await withStubMode("error", async () => {
    const result = await moderateText({ text: "anything", surface: "post" });
    assert.equal(result.decision, "FAILED");
    assert.ok(result.error);
    assert.notEqual(result.decision, "APPROVED");
  });
});

test("moderateText: critical stub mode triggers the CSAM protocol", async () => {
  await withStubMode("critical", async () => {
    const result = await moderateText({ text: "anything", surface: "post" });
    assert.equal(result.decision, "REJECTED");
    assert.equal(result.criticalEscalation, true);
    assert.equal(result.severity, "critical");
    // Generic user message — no category details leaked.
    assert.ok(!result.userMessage!.toLowerCase().includes("minor"));
  });
});

test("moderateText: local prohibited terms block even with stub in approve mode", async () => {
  await withStubMode("approve", async () => {
    const result = await moderateText({ text: "selling nudes dm me", surface: "post" });
    assert.equal(result.decision, "REJECTED");
    // The local-policy provider outcome is present alongside the stub.
    const providerIds = result.providerOutcomes.map((o) => o.providerId);
    assert.ok(providerIds.includes("local-policy"));
    assert.ok(providerIds.includes("stub"));
  });
});

test("moderateText: degraded mode (no providers at all) approves clean text but flags nothing silently", async () => {
  const saved = {
    NODE_ENV: process.env.NODE_ENV,
    STUB: process.env.CONTENT_MODERATION_PROVIDER_STUB,
    OPENAI_KEY: process.env.OPENAI_API_KEY,
    VISION_PROJECT: process.env.GOOGLE_CLOUD_PROJECT_ID,
    VISION_CREDS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  };
  process.env.NODE_ENV = "test";
  delete process.env.CONTENT_MODERATION_PROVIDER_STUB;
  delete process.env.OPENAI_API_KEY;
  delete process.env.GOOGLE_CLOUD_PROJECT_ID;
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  __resetModerationConfigForTests();
  try {
    const clean = await moderateText({ text: "a normal caption", surface: "post" });
    assert.equal(clean.decision, "APPROVED");

    const prohibited = await moderateText({ text: "porn spam here", surface: "post" });
    assert.equal(prohibited.decision, "REJECTED");
    assert.ok(prohibited.providerOutcomes.some((o) => o.providerId === "local-policy"));
  } finally {
    process.env.NODE_ENV = saved.NODE_ENV;
    if (saved.STUB !== undefined) process.env.CONTENT_MODERATION_PROVIDER_STUB = saved.STUB;
    if (saved.OPENAI_KEY !== undefined) process.env.OPENAI_API_KEY = saved.OPENAI_KEY;
    if (saved.VISION_PROJECT !== undefined) process.env.GOOGLE_CLOUD_PROJECT_ID = saved.VISION_PROJECT;
    if (saved.VISION_CREDS !== undefined) process.env.GOOGLE_APPLICATION_CREDENTIALS = saved.VISION_CREDS;
    __resetModerationConfigForTests();
  }
});

test("moderateText: moderation disabled approves everything (explicit local-dev opt-out)", async () => {
  const saved = process.env.CONTENT_MODERATION_ENABLED;
  process.env.CONTENT_MODERATION_ENABLED = "false";
  __resetModerationConfigForTests();
  try {
    const result = await moderateText({ text: "porn spam", surface: "post" });
    assert.equal(result.decision, "APPROVED");
    assert.equal(result.providerOutcomes.length, 0);
  } finally {
    if (saved === undefined) delete process.env.CONTENT_MODERATION_ENABLED;
    else process.env.CONTENT_MODERATION_ENABLED = saved;
    __resetModerationConfigForTests();
  }
});
