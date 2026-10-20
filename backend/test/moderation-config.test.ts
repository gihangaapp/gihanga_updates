/**
 * Moderation configuration + secret-hygiene tests.
 *
 * Verifies:
 *  - the stub provider REFUSES to activate in production (a stray env var
 *    can never weaken real moderation)
 *  - publicSummary() never contains secrets
 *  - redactSecrets strips keys/bearer tokens
 *  - degraded-mode warning is surfaced when no provider is configured
 *  - provider "configured" flags track env presence
 *
 * Run: npm run test:moderation
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getModerationConfig,
  publicSummary,
  redactSecrets,
  configWarnings,
  __resetModerationConfigForTests,
} from "../src/lib/moderation/config";

function withEnv(overrides: Record<string, string | undefined>, fn: () => void) {
  const saved: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(overrides)) {
    saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  __resetModerationConfigForTests();
  try {
    fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    __resetModerationConfigForTests();
  }
}

test("stub provider refuses to activate when NODE_ENV=production", () => {
  withEnv(
    {
      NODE_ENV: "production",
      CONTENT_MODERATION_PROVIDER_STUB: "true",
    },
    () => {
      const config = getModerationConfig();
      assert.equal(config.stubProviderEnabled, false);
      assert.ok(
        configWarnings().some((w) => w.includes("refused in production")),
        "expected a refusal warning in the config warnings",
      );
    },
  );
});

test("stub provider activates in non-production with the env var set", () => {
  withEnv(
    {
      NODE_ENV: "test",
      CONTENT_MODERATION_PROVIDER_STUB: "true",
    },
    () => {
      assert.equal(getModerationConfig().stubProviderEnabled, true);
    },
  );
});

test("publicSummary never exposes API keys or credential material", () => {
  withEnv(
    {
      NODE_ENV: "test",
      OPENAI_API_KEY: "sk-test-abcdef1234567890abcdef",
      OPENAI_MODERATION_MODEL: "omni-moderation-latest",
      GOOGLE_CLOUD_PROJECT_ID: "gihanga-prod",
      GOOGLE_APPLICATION_CREDENTIALS: "/secrets/vision.json",
    },
    () => {
      const summary = JSON.stringify(publicSummary());
      assert.ok(!summary.includes("sk-test"), "API key leaked into publicSummary");
      assert.ok(!summary.includes("/secrets"), "credentials path leaked into publicSummary");
      // Provider configured flags ARE exposed (they contain no secrets).
      assert.ok(summary.includes("\"openai\""));
    },
  );
});

test("redactSecrets strips OpenAI-style keys and bearer tokens", () => {
  const dirty = "request failed with key sk-abcdefghijklmnop1234 and Authorization: Bearer eyJhbGciOi.abcdef";
  const clean = redactSecrets(dirty);
  assert.ok(!clean.includes("sk-abcdefghijklmnop1234"));
  assert.ok(!clean.includes("eyJhbGciOi"));
  assert.ok(clean.includes("sk-[REDACTED]"));
});

test("degraded-mode warning appears when no provider is fully configured", () => {
  withEnv(
    {
      NODE_ENV: "test",
      CONTENT_MODERATION_ENABLED: "true",
      OPENAI_API_KEY: undefined,
      OPENAI_MODERATION_ENABLED: "true",
      GOOGLE_CLOUD_VISION_ENABLED: "true",
      GOOGLE_CLOUD_PROJECT_ID: undefined,
      GOOGLE_APPLICATION_CREDENTIALS: undefined,
      CONTENT_MODERATION_PROVIDER_STUB: undefined,
    },
    () => {
      const config = getModerationConfig();
      assert.equal(config.anyProviderConfigured, false);
      assert.ok(
        configWarnings().some((w) => w.includes("NO AI provider")),
        "expected the degraded-mode warning",
      );
    },
  );
});

test("provider configured flags track env presence", () => {
  withEnv(
    {
      NODE_ENV: "test",
      OPENAI_API_KEY: "sk-x",
      GOOGLE_CLOUD_PROJECT_ID: "proj",
      GOOGLE_APPLICATION_CREDENTIALS: "/key.json",
    },
    () => {
      const config = getModerationConfig();
      assert.equal(config.openaiApiKeyPresent, true);
      assert.equal(config.visionCredentialsPresent, true);
      assert.equal(config.visionProjectIdPresent, true);
      assert.equal(config.anyProviderConfigured, true);
    },
  );
});

test("invalid numeric env values fall back to safe defaults with warnings", () => {
  withEnv(
    {
      NODE_ENV: "test",
      CONTENT_MODERATION_TIMEOUT_MS: "not-a-number",
      CONTENT_MODERATION_MAX_RETRIES: "99",
    },
    () => {
      const config = getModerationConfig();
      assert.equal(config.timeoutMs, 15000);
      assert.equal(config.maxRetries, 5); // clamped to max
      assert.ok(configWarnings().some((w) => w.includes("CONTENT_MODERATION_TIMEOUT_MS")));
    },
  );
});
