/**
 * Video frame sampling + upload anti-spoofing tests.
 *
 * Verifies:
 *  - the sampling plan always covers beginning, middle and end
 *  - frame counts respect the configured cap (cost control)
 *  - unknown durations fall back to a bounded plan
 *  - short videos sample densely
 *  - magic-byte sniffing rejects MIME-spoofed uploads
 *
 * Run: npm run test:moderation
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { planFrameSamples } from "../src/services/moderation/videoFrameSampler";
import { sniffMimeCategory } from "../src/middleware/upload";

// ─── Sampling plan ───────────────────────────────────────────────────────────

test("sampling plan covers beginning, middle and end of a long video", () => {
  const plan = planFrameSamples(120, { intervalSeconds: 10, maxFrames: 12 });
  assert.equal(plan.strategy, "interval");
  assert.ok(plan.timestamps.includes(0), "must sample the start");
  assert.ok(plan.timestamps.includes(60), "must sample the middle (120/2)");
  assert.ok(plan.timestamps.includes(119.8), "must sample the end (clamped)");
});

test("sampling plan respects the max-frames cap", () => {
  const plan = planFrameSamples(600, { intervalSeconds: 2, maxFrames: 6 });
  assert.ok(plan.timestamps.length <= 6, `got ${plan.timestamps.length}`);
});

test("timestamps are sorted, deduped and within duration", () => {
  const duration = 45;
  const plan = planFrameSamples(duration, { intervalSeconds: 10, maxFrames: 12 });
  for (let i = 1; i < plan.timestamps.length; i++) {
    assert.ok(plan.timestamps[i] > plan.timestamps[i - 1], "sorted and deduped");
  }
  for (const t of plan.timestamps) {
    assert.ok(t >= 0 && t <= duration, `timestamp ${t} out of range`);
  }
});

test("short videos sample at fractional points", () => {
  const plan = planFrameSamples(4, { intervalSeconds: 10, maxFrames: 12 });
  assert.equal(plan.strategy, "short-video");
  assert.ok(plan.timestamps.includes(0));
  assert.ok(plan.timestamps.includes(2)); // middle of 4s
  assert.ok(plan.timestamps.some((t) => Math.abs(t - 3.8) < 0.01), "end sampled");
});

test("unknown duration produces a bounded early-window plan", () => {
  const plan = planFrameSamples(undefined, { intervalSeconds: 10, maxFrames: 6 });
  assert.equal(plan.strategy, "unknown-duration");
  assert.ok(plan.timestamps.length <= 6);
  assert.ok(plan.timestamps.every((t) => t >= 0 && t <= 30));
});

test("zero/negative durations are handled safely", () => {
  const plan = planFrameSamples(0, { intervalSeconds: 10, maxFrames: 6 });
  assert.ok(Array.isArray(plan.timestamps));
  const neg = planFrameSamples(-5, { intervalSeconds: 10, maxFrames: 6 });
  assert.ok(Array.isArray(neg.timestamps));
});

// ─── MIME sniffing (upload anti-spoofing) ────────────────────────────────────

test("JPEG magic bytes are detected as image", () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, ...Buffer.alloc(20, 0)]);
  assert.equal(sniffMimeCategory(jpeg), "image");
});

test("PNG magic bytes are detected as image", () => {
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47]), Buffer.alloc(20, 0)]);
  assert.equal(sniffMimeCategory(png), "image");
});

test("MP4 ftyp box is detected as video", () => {
  const mp4 = Buffer.concat([Buffer.alloc(4, 0), Buffer.from("ftypisom"), Buffer.alloc(20, 0)]);
  assert.equal(sniffMimeCategory(mp4), "video");
});

test("WEBM/EBML header is detected as video", () => {
  const webm = Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(20, 0)]);
  assert.equal(sniffMimeCategory(webm), "video");
});

test("an executable payload spoofing .jpg is detected as unknown", () => {
  // MZ header (Windows PE) — the classic disguised-executable case.
  const exe = Buffer.concat([Buffer.from([0x4d, 0x5a]), Buffer.alloc(30, 0)]);
  assert.equal(sniffMimeCategory(exe), "unknown");
});

test("a script payload spoofing .png is detected as unknown", () => {
  const script = Buffer.from("#!/bin/bash\nrm -rf /", "utf-8");
  assert.equal(sniffMimeCategory(script), "unknown");
});

test("tiny buffers are classified unknown (never trusted)", () => {
  assert.equal(sniffMimeCategory(Buffer.alloc(4)), "unknown");
});
