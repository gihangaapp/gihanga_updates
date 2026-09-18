/**
 * A6 — unit tests for the pure connection-quality classifier (hysteresis).
 * Run: npm run test:quality
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifyHistory,
  createQualityState,
  pushSample,
  DEFAULT_QUALITY_THRESHOLDS,
  networkHintLooksPoor,
  type QualitySample,
} from "../src/lib/live-quality";

const T = DEFAULT_QUALITY_THRESHOLDS;
const t0 = 1_000_000;

const good = (at: number): QualitySample => ({
  at,
  loss: 0.001,
  rttMs: 120,
  bitrateKbps: 1400,
  online: true,
});
const bad = (at: number): QualitySample => ({
  at,
  loss: 0.15,
  rttMs: 900,
  bitrateKbps: 90,
  online: true,
});

test("all-good history stays good", () => {
  const samples = [good(t0), good(t0 + 2000), good(t0 + 4000), good(t0 + 6000)];
  assert.equal(classifyHistory(samples).level, "good");
});

test("sustained poor history flips to poor", () => {
  const samples = [
    good(t0),
    bad(t0 + 2000),
    bad(t0 + 4000),
    bad(t0 + 6000), // 6s sustained (3 samples x 2s)
    bad(t0 + 8000),
  ];
  const state = classifyHistory(samples);
  assert.equal(state.level, "poor");
});

test("a single bad sample does NOT flip (anti-flicker)", () => {
  const samples = [good(t0), good(t0 + 2000), bad(t0 + 4000), good(t0 + 6000), good(t0 + 8000)];
  assert.equal(classifyHistory(samples).level, "good");
});

test("poor recovers only after sustained good (hysteresis)", () => {
  // Enter poor.
  let state = classifyHistory([
    good(t0),
    bad(t0 + 2000),
    bad(t0 + 4000),
    bad(t0 + 6000),
    bad(t0 + 8000),
  ]);
  assert.equal(state.level, "poor");
  // One good sample — still poor.
  state = pushSample(state, good(t0 + 10000), T);
  assert.equal(state.level, "poor");
  // 4s of good — still poor (needs 8s).
  state = pushSample(state, good(t0 + 12000), T);
  state = pushSample(state, good(t0 + 14000), T);
  assert.equal(state.level, "poor");
  // 8s+ of good — recovered.
  state = pushSample(state, good(t0 + 16000), T);
  state = pushSample(state, good(t0 + 18000), T);
  state = pushSample(state, good(t0 + 20000), T);
  assert.equal(state.level, "good");
});

test("packet loss alone above threshold trips poor", () => {
  const samples = Array.from(
    { length: 5 },
    (_, i) => ({ at: t0 + i * 2000, loss: 0.09 }) as QualitySample,
  );
  assert.equal(classifyHistory(samples).level, "poor");
});

test("high RTT alone trips poor; low bitrate alone trips poor", () => {
  const rtt = Array.from(
    { length: 5 },
    (_, i) => ({ at: t0 + i * 2000, rttMs: 700 }) as QualitySample,
  );
  assert.equal(classifyHistory(rtt).level, "poor");
  const bitrate = Array.from(
    { length: 5 },
    (_, i) => ({ at: t0 + i * 2000, bitrateKbps: 120 }) as QualitySample,
  );
  assert.equal(classifyHistory(bitrate).level, "poor");
});

test("offline is an instant hard signal", () => {
  const samples = [good(t0), { at: t0 + 2000, online: false }];
  // Offline doesn't instantly flip (sustain still applies)…
  assert.equal(classifyHistory(samples).level, "good");
  // …but 6s of it does.
  const offline6 = [
    ...samples,
    { at: t0 + 4000, online: false },
    { at: t0 + 6000, online: false },
    { at: t0 + 8000, online: false },
  ];
  assert.equal(classifyHistory(offline6).level, "poor");
});

test("unknown metrics (NaN/absent) are ignored, not treated as poor", () => {
  const samples = Array.from({ length: 5 }, (_, i) => ({ at: t0 + i * 2000 }) as QualitySample);
  assert.equal(classifyHistory(samples).level, "good");
});

test("pushSample is pure (does not mutate the input state)", () => {
  const s = createQualityState(t0);
  const next = pushSample(s, bad(t0 + 2000), T);
  assert.equal(s.level, "good");
  assert.notEqual(next, s);
});

test("network hints: 2g and saveData look poor; 4g does not", () => {
  assert.equal(networkHintLooksPoor({ effectiveType: "2g" }), true);
  assert.equal(networkHintLooksPoor({ effectiveType: "slow-2g" }), true);
  assert.equal(networkHintLooksPoor({ saveData: true }), true);
  assert.equal(networkHintLooksPoor({ effectiveType: "4g" }), false);
  assert.equal(networkHintLooksPoor({}), false);
});
