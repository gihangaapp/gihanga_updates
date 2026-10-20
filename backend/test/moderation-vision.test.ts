/**
 * Google Cloud Vision integration tests — NO network, NO real credentials.
 *
 * Every test uses either an injected fake SDK client or the real SDK's
 * request-validation layer with the transport below it stubbed. Credential
 * files are throw-away temp files containing OBVIOUSLY FAKE values.
 *
 * Verifies:
 *  - valid configuration is recognized (and project-id mismatch is flagged)
 *  - missing / unreadable / malformed credentials fail safely and never leak
 *  - permission / auth errors never leak and are never retried
 *  - SafeSearch likelihoods map to the expected moderation decisions
 *  - the REAL SDK helper accepts our request shape (regression: explicit
 *    string `features` made every real call throw locally)
 *  - timeouts and transient errors follow the bounded retry + fail-closed policy
 *  - unverifiable media can never be approved (combineResults dominance)
 *  - the stub provider can never approve content in production
 *  - Vision is never called for text-only requests
 *  - OpenAI-missing diagnostics are separate from Vision diagnostics
 *
 * Run: npm run test:moderation
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test, after } from "node:test";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { __resetModerationConfigForTests, publicSummary } from "../src/lib/moderation/config";
import { __resetVisionCredentialCache, inspectVisionCredentials } from "../src/lib/moderation/visionCredentials";
import {
  __resetVisionClient,
  __setVisionClientForTests,
  googleVisionProvider,
} from "../src/lib/moderation/providers/googleVisionProvider";
import {
  combineResults,
  moderateImageByBuffer,
  moderateText,
} from "../src/services/moderation/contentModerationService";
import type { ModerationResult } from "../src/lib/moderation/types";

// ─── Harness ─────────────────────────────────────────────────────────────────

const SECRET_MARKER = "SECRET-MARKER-DO-NOT-LEAK-123";
const FAKE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\n${SECRET_MARKER}\n-----END PRIVATE KEY-----\n`;
const PROJECT = "test-project-id";
const IMG = Buffer.from("not-a-real-image-but-bytes-are-fine-for-a-fake-client");

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vision-test-"));
after(() => fs.rmSync(tmpRoot, { recursive: true, force: true }));

function writeFile(name: string, content: string): string {
  const p = path.join(tmpRoot, name);
  fs.writeFileSync(p, content);
  return p;
}

function validKeyFile(projectId = PROJECT): string {
  return writeFile(
    `key-${Math.random().toString(36).slice(2)}.json`,
    JSON.stringify({
      type: "service_account",
      project_id: projectId,
      private_key_id: "fake-key-id",
      private_key: FAKE_PRIVATE_KEY,
      client_email: "fake-sa@test-project-id.iam.gserviceaccount.com",
    }),
  );
}

const BASE_ENV: Record<string, string | undefined> = {
  NODE_ENV: "test",
  CONTENT_MODERATION_ENABLED: "true",
  CONTENT_MODERATION_FAIL_CLOSED: "true",
  CONTENT_MODERATION_MAX_RETRIES: "1",
  CONTENT_MODERATION_TIMEOUT_MS: "5000",
  CONTENT_MODERATION_PROVIDER_STUB: undefined,
  CONTENT_MODERATION_STUB_MODE: undefined,
  GOOGLE_CLOUD_VISION_ENABLED: "true",
  GOOGLE_CLOUD_VISION_API_KEY: undefined,
  GOOGLE_CLOUD_PROJECT_ID: undefined,
  GOOGLE_APPLICATION_CREDENTIALS: undefined,
  OPENAI_API_KEY: undefined,
  OPENAI_MODERATION_ENABLED: "true",
};

function resetAll() {
  __resetModerationConfigForTests();
  __resetVisionClient();
  __resetVisionCredentialCache();
}

async function withEnv(env: Record<string, string | undefined>, fn: () => Promise<void> | void) {
  const merged = { ...BASE_ENV, ...env };
  const saved: Record<string, string | undefined> = {};
  for (const k of Object.keys(merged)) {
    saved[k] = process.env[k];
    if (merged[k] === undefined) delete process.env[k];
    else process.env[k] = merged[k];
  }
  resetAll();
  try {
    await fn();
  } finally {
    for (const k of Object.keys(saved)) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    resetAll();
  }
}

function captureConsole() {
  const lines: string[] = [];
  const orig = { log: console.log, warn: console.warn, error: console.error };
  const push = (...a: unknown[]) => void lines.push(a.map(String).join(" "));
  console.log = push;
  console.warn = push;
  console.error = push;
  return {
    lines,
    restore() {
      console.log = orig.log;
      console.warn = orig.warn;
      console.error = orig.error;
    },
  };
}

type Likelihood = "UNKNOWN" | "VERY_UNLIKELY" | "UNLIKELY" | "POSSIBLE" | "LIKELY" | "VERY_LIKELY";
function annotation(over: Partial<Record<"adult" | "spoof" | "medical" | "violence" | "racy", Likelihood>> = {}) {
  return {
    adult: "VERY_UNLIKELY",
    spoof: "VERY_UNLIKELY",
    medical: "VERY_UNLIKELY",
    violence: "VERY_UNLIKELY",
    racy: "VERY_UNLIKELY",
    ...over,
  };
}

/** Fake SDK client driven by a script; records every call. */
function fakeClient(script: (call: number) => unknown | Promise<unknown>) {
  const calls: { request: any; options: any }[] = [];
  return {
    calls,
    client: {
      async safeSearchDetection(request: unknown, options?: unknown) {
        calls.push({ request, options });
        const out = await script(calls.length);
        if (out instanceof Error) throw out;
        return [out];
      },
    },
  };
}

const grpcError = (code: number, message = "boom") => Object.assign(new Error(message), { code });

async function moderate() {
  return moderateImageByBuffer(IMG, "post"); // no ownerId -> hash cache (DB) is skipped
}

function assertNoSecrets(texts: string[]) {
  for (const t of texts) {
    assert.ok(!t.includes(SECRET_MARKER), `secret marker leaked in: ${t.slice(0, 120)}`);
    assert.ok(!/BEGIN PRIVATE KEY/.test(t), "private key header leaked");
  }
}

// ─── 1. Configuration is recognized ──────────────────────────────────────────

test("valid Vision configuration is recognized and exposes no secrets", async () => {
  const keyPath = validKeyFile();
  await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: keyPath }, () => {
    assert.equal(googleVisionProvider.isConfigured(), true);
    const s = publicSummary();
    assert.equal(s.providers.googleVision.configured, true);
    assert.equal(s.providers.googleVision.credentialFile, "ok");
    assert.equal(s.anyProviderConfigured, true);
    assert.ok(!s.warnings.some((w) => w.startsWith("[Vision]")), "no Vision warnings for a valid setup");
    assertNoSecrets([JSON.stringify(s)]);
  });
});

test("project id mismatch between env and key file is flagged without printing either id", async () => {
  const keyPath = validKeyFile("some-other-project");
  await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: keyPath }, () => {
    const r = inspectVisionCredentials();
    assert.equal(r.status, "ok");
    assert.equal(r.projectIdMismatch, true);
    const w = publicSummary().warnings.find((x) => x.startsWith("[Vision]"));
    assert.ok(w, "mismatch warning expected");
    assert.ok(!w!.includes("some-other-project") && !w!.includes(PROJECT));
  });
});

test("an API key alone no longer counts as a configured Vision provider", async () => {
  await withEnv({ GOOGLE_CLOUD_VISION_API_KEY: "AIza-fake-key-for-test" }, () => {
    assert.equal(googleVisionProvider.isConfigured(), false);
    assert.equal(publicSummary().providers.googleVision.configured, false);
  });
});

test("half-configured Vision (id without key file, or key file without id) stays inactive and warns", async () => {
  await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT }, () => {
    assert.equal(googleVisionProvider.isConfigured(), false);
    assert.ok(publicSummary().warnings.some((w) => w.includes("GOOGLE_APPLICATION_CREDENTIALS is missing")));
  });
  await withEnv({ GOOGLE_APPLICATION_CREDENTIALS: validKeyFile() }, () => {
    assert.equal(googleVisionProvider.isConfigured(), false);
    assert.ok(publicSummary().warnings.some((w) => w.includes("GOOGLE_CLOUD_PROJECT_ID is missing")));
  });
});

// ─── 2. Missing / invalid credentials fail safely ────────────────────────────

test("missing credential file: actionable diagnostic, content FAILS closed, nothing leaks", async () => {
  const missing = path.join(tmpRoot, "does-not-exist.json");
  await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: missing }, async () => {
    assert.equal(inspectVisionCredentials().status, "file_missing");
    const cap = captureConsole();
    let result: ModerationResult;
    try {
      result = await moderate();
    } finally {
      cap.restore();
    }
    assert.equal(result.decision, "FAILED", "unverifiable media must never be approved");
    const summaryJson = JSON.stringify(publicSummary());
    assert.ok(!summaryJson.includes(missing) && !summaryJson.includes("does-not-exist"), "path must not reach publicSummary()");
    assert.equal(publicSummary().providers.googleVision.credentialFile, "file_missing");
    assert.ok(cap.lines.some((l) => l.includes("[Moderation][Vision] credentials")), "server-side diagnostic expected");
    assert.ok(cap.lines.some((l) => l.includes("/etc/secrets/")), "diagnostic should explain the Render path");
    assertNoSecrets(cap.lines);
    assertNoSecrets(result.providerOutcomes.map((o) => o.error ?? ""));
  });
});

test("malformed credential files are classified without echoing their contents", async () => {
  const cases: [string, string, string][] = [
    ["invalid_json", `{ "private_key": "${SECRET_MARKER}" `, "invalid_json"],
    ["wrong type", JSON.stringify({ type: "authorized_user", client_secret: SECRET_MARKER }), "not_service_account"],
    ["incomplete", JSON.stringify({ type: "service_account", private_key: SECRET_MARKER }), "incomplete"],
  ];
  for (const [label, content, expected] of cases) {
    const file = writeFile(`bad-${label.replace(/\s/g, "-")}.json`, content);
    await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: file }, () => {
      const r = inspectVisionCredentials();
      assert.equal(r.status, expected, label);
      assertNoSecrets([r.message, JSON.stringify(publicSummary())]);
    });
  }
});

test("a directory or unreadable path is reported as unreadable/missing, not thrown", async () => {
  await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: tmpRoot }, () => {
    assert.ok(["file_unreadable", "file_missing"].includes(inspectVisionCredentials().status));
  });
});

// ─── 3. Permission / auth errors: no leak, no retry, fail closed ─────────────

for (const [name, code] of [
  ["PERMISSION_DENIED", 7],
  ["UNAUTHENTICATED", 16],
] as const) {
  test(`${name} (gRPC ${code}) is never retried, never leaks, and fails closed`, async () => {
    const keyPath = validKeyFile();
    await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: keyPath }, async () => {
      const fake = fakeClient(() =>
        grpcError(code, `${name}: sa fake@x.iam.gserviceaccount.com private_key ${SECRET_MARKER} ${FAKE_PRIVATE_KEY}`),
      );
      __setVisionClientForTests(fake.client);
      const cap = captureConsole();
      let result: ModerationResult;
      try {
        result = await moderate();
      } finally {
        cap.restore();
      }
      assert.equal(result.decision, "FAILED");
      assert.equal(fake.calls.length, 1, "auth failures must not be retried");
      assertNoSecrets(cap.lines);
      assertNoSecrets(result.providerOutcomes.map((o) => o.error ?? ""));
      assertNoSecrets([result.userMessage ?? "", result.error ?? ""]);
    });
  });
}

// ─── 4. SafeSearch mapping → decisions ───────────────────────────────────────

const MAPPING_CASES: { label: string; ann: ReturnType<typeof annotation>; expect: string }[] = [
  { label: "all VERY_UNLIKELY", ann: annotation(), expect: "APPROVED" },
  { label: "adult VERY_LIKELY blocks", ann: annotation({ adult: "VERY_LIKELY" }), expect: "REJECTED" },
  { label: "adult LIKELY goes to review (not auto-reject)", ann: annotation({ adult: "LIKELY" }), expect: "PENDING_REVIEW" },
  { label: "violence VERY_LIKELY goes to review (never auto-reject)", ann: annotation({ violence: "VERY_LIKELY" }), expect: "PENDING_REVIEW" },
  { label: "medical POSSIBLE is not actionable", ann: annotation({ medical: "POSSIBLE" }), expect: "APPROVED" },
  { label: "spoof VERY_LIKELY is ignored", ann: annotation({ spoof: "VERY_LIKELY" }), expect: "APPROVED" },
  { label: "racy POSSIBLE passes", ann: annotation({ racy: "POSSIBLE" }), expect: "APPROVED" },
  {
    label: "breastfeeding-style combo (adult UNLIKELY + medical POSSIBLE) passes",
    ann: annotation({ adult: "UNLIKELY", medical: "POSSIBLE" }),
    expect: "APPROVED",
  },
];

for (const c of MAPPING_CASES) {
  test(`SafeSearch mapping: ${c.label} -> ${c.expect}`, async () => {
    await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: validKeyFile() }, async () => {
      const fake = fakeClient(() => ({ safeSearchAnnotation: c.ann }));
      __setVisionClientForTests(fake.client);
      const result = await moderate();
      assert.equal(result.decision, c.expect);
      assert.equal(fake.calls.length, 1);
    });
  });
}

test("racy VERY_LIKELY never auto-rejects", async () => {
  await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: validKeyFile() }, async () => {
    __setVisionClientForTests(fakeClient(() => ({ safeSearchAnnotation: annotation({ racy: "VERY_LIKELY" }) })).client);
    assert.notEqual((await moderate()).decision, "REJECTED");
  });
});

test("an all-UNKNOWN SafeSearch response is an error (fail-closed), not 'safe'", async () => {
  await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: validKeyFile() }, async () => {
    const unknown = annotation({ adult: "UNKNOWN", violence: "UNKNOWN", racy: "UNKNOWN", medical: "UNKNOWN", spoof: "UNKNOWN" });
    const fake = fakeClient(() => ({ safeSearchAnnotation: unknown }));
    __setVisionClientForTests(fake.client);
    const cap = captureConsole();
    try {
      assert.equal((await moderate()).decision, "FAILED");
    } finally {
      cap.restore();
    }
    assert.equal(fake.calls.length, 1, "no-signal is non-retryable (no wasted paid calls)");
  });
});

test("empty responses and per-image error statuses fail closed", async () => {
  await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: validKeyFile() }, async () => {
    const cap = captureConsole();
    try {
      for (const body of [{}, { safeSearchAnnotation: null }, { error: { code: 3, message: "Bad image data" } }, { error: { code: 7, message: "denied" } }]) {
        __setVisionClientForTests(fakeClient(() => body).client);
        assert.equal((await moderate()).decision, "FAILED", JSON.stringify(body));
      }
    } finally {
      cap.restore();
    }
  });
});

// ─── 5. Real SDK helper accepts our request shape (regression) ───────────────

test("REAL SDK single-feature helper accepts the adapter's request (explicit string features used to throw)", async () => {
  await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: validKeyFile() }, async () => {
    const real = new ImageAnnotatorClient({ projectId: PROJECT });
    let seen: any;
    // Stub the transport BELOW the SDK's own helper so the helper's validation really runs.
    (real as any).annotateImage = (request: any, options: any, cb: any) => {
      seen = { request, options };
      cb(null, { safeSearchAnnotation: annotation() });
    };
    __setVisionClientForTests(real as any);
    try {
      const result = await moderate();
      assert.equal(result.decision, "APPROVED", "helper must not throw locally");
      assert.ok(Buffer.isBuffer(seen.request.image.content), "image bytes sent as content");
      assert.equal(seen.request.features.length, 1, "exactly the single feature the helper adds");
      assert.equal(typeof seen.request.features[0].type, "number", "feature type is the SDK's numeric enum");
    } finally {
      await real.close();
    }
  });
});

test("adapter sends a per-call timeout, disables hidden gax retries, and never passes explicit features", async () => {
  await withEnv(
    { GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: validKeyFile(), CONTENT_MODERATION_TIMEOUT_MS: "7000" },
    async () => {
      const fake = fakeClient(() => ({ safeSearchAnnotation: annotation() }));
      __setVisionClientForTests(fake.client);
      await googleVisionProvider.moderateImage({ buffer: IMG, surface: "post" });
      await googleVisionProvider.moderateImage({ url: "https://example.invalid/a.jpg", surface: "post" });
      assert.equal(fake.calls.length, 2);
      for (const call of fake.calls) {
        assert.equal(call.options.timeout, 7000);
        assert.equal(call.options.retry, null);
        assert.equal("features" in call.request, false);
      }
      assert.ok(Buffer.isBuffer(fake.calls[0].request.image.content));
      assert.equal(fake.calls[1].request.image.source.imageUri, "https://example.invalid/a.jpg");
    },
  );
});

// ─── 6. Timeouts, retries, fail-closed ───────────────────────────────────────

test("a transient UNAVAILABLE is retried (bounded) and then succeeds", async () => {
  await withEnv(
    { GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: validKeyFile(), CONTENT_MODERATION_MAX_RETRIES: "2" },
    async () => {
      const fake = fakeClient((n) => (n === 1 ? grpcError(14) : { safeSearchAnnotation: annotation() }));
      __setVisionClientForTests(fake.client);
      const cap = captureConsole();
      let result: ModerationResult;
      try {
        result = await moderate();
      } finally {
        cap.restore();
      }
      assert.equal(result.decision, "APPROVED");
      assert.equal(fake.calls.length, 2);
    },
  );
});

test("persistent UNAVAILABLE/quota errors exhaust the bounded retries and FAIL closed", async () => {
  for (const code of [14, 8]) {
    await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: validKeyFile() }, async () => {
      const fake = fakeClient(() => grpcError(code));
      __setVisionClientForTests(fake.client);
      const cap = captureConsole();
      let result: ModerationResult;
      try {
        result = await moderate();
      } finally {
        cap.restore();
      }
      assert.equal(result.decision, "FAILED", `gRPC ${code}`);
      assert.equal(fake.calls.length, 2, "1 attempt + MAX_RETRIES(1)");
    });
  }
});

test("a hung provider call times out and FAILS closed (never approves)", async () => {
  await withEnv(
    {
      GOOGLE_CLOUD_PROJECT_ID: PROJECT,
      GOOGLE_APPLICATION_CREDENTIALS: validKeyFile(),
      CONTENT_MODERATION_MAX_RETRIES: "0",
      CONTENT_MODERATION_TIMEOUT_MS: "2000", // config minimum
    },
    async () => {
      __setVisionClientForTests({ safeSearchDetection: () => new Promise<unknown[]>(() => {}) });
      const result = await moderate();
      assert.equal(result.decision, "FAILED");
      assert.equal(result.providerOutcomes[0].error, "Provider request timed out");
    },
  );
});

// ─── 7. Unreviewed media can never become approved ───────────────────────────

const approvedWithOutcome = (): ModerationResult => ({
  decision: "APPROVED",
  categories: [],
  severity: "low",
  criticalEscalation: false,
  providerOutcomes: [{ providerId: "test", verdict: "safe", categories: [] }],
});
const syntheticReview = (): ModerationResult => ({
  decision: "PENDING_REVIEW",
  categories: [],
  severity: "medium",
  criticalEscalation: false,
  providerOutcomes: [], // synthetic: "media unavailable" / "no frames extracted"
  error: "Referenced media could not be located for verification",
});

test("combineResults: a synthetic PENDING_REVIEW sub-result dominates an approved caption", async () => {
  await withEnv({}, () => {
    assert.equal(combineResults([approvedWithOutcome(), syntheticReview()]).decision, "PENDING_REVIEW");
  });
});

test("combineResults: a synthetic REJECTED sub-result dominates an approved caption", async () => {
  await withEnv({}, () => {
    const rejected: ModerationResult = { ...syntheticReview(), decision: "REJECTED" };
    assert.equal(combineResults([approvedWithOutcome(), rejected]).decision, "REJECTED");
  });
});

test("combineResults: all-approved sub-results still approve (no over-blocking)", async () => {
  await withEnv({}, () => {
    assert.equal(combineResults([approvedWithOutcome(), approvedWithOutcome()]).decision, "APPROVED");
  });
});

test("with NO image-capable provider configured, media FAILS closed", async () => {
  await withEnv({}, async () => {
    assert.equal((await moderate()).decision, "FAILED");
  });
});

// ─── 8. Stub can never approve in production ─────────────────────────────────

test("stub provider cannot approve content in production (media fails closed, warning emitted)", async () => {
  await withEnv(
    { NODE_ENV: "production", CONTENT_MODERATION_PROVIDER_STUB: "true", CONTENT_MODERATION_STUB_MODE: "approve" },
    async () => {
      const s = publicSummary();
      assert.equal(s.providers.stub.enabled, false);
      assert.ok(s.warnings.some((w) => /Stub provider requested but refused in production/.test(w)));
      assert.equal((await moderate()).decision, "FAILED");
    },
  );
});

// ─── 9. Provider separation + text-only behaviour ────────────────────────────

test("a missing OpenAI key is reported separately and does not mask a working Vision setup", async () => {
  await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: validKeyFile() }, () => {
    const s = publicSummary();
    assert.equal(s.providers.googleVision.configured, true);
    assert.equal(s.providers.openai.configured, false);
    assert.ok(s.warnings.some((w) => w.startsWith("[OpenAI]")));
    assert.ok(!s.warnings.some((w) => w.startsWith("[Vision]")));
  });
});

test("Vision is never called for text-only requests; local prohibited-terms policy still applies", async () => {
  await withEnv({ GOOGLE_CLOUD_PROJECT_ID: PROJECT, GOOGLE_APPLICATION_CREDENTIALS: validKeyFile() }, async () => {
    const fake = fakeClient(() => ({ safeSearchAnnotation: annotation() }));
    __setVisionClientForTests(fake.client);
    await moderateText({ text: "a perfectly ordinary caption", surface: "post" });
    const bad = await moderateText({ text: "selling nudes", surface: "post" });
    assert.equal(fake.calls.length, 0, "SafeSearch is an image classifier");
    assert.equal(bad.decision, "REJECTED");
  });
});
