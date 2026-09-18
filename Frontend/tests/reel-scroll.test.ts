/**
 * B5.8 — reels scroll machinery tests (pure, no DOM).
 *
 * Covers the two behaviours the project owner reported as broken:
 *  - "videos jump into the screen and dance"  -> index math must always land
 *    on exact card multiples, and state flips only after settle;
 *  - "skip the next/previous video then back" -> one wheel gesture (including
 *    its inertia tail) must navigate exactly ONCE.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clampReelIndex,
  reelIndexFromScroll,
  reelScrollOffset,
  normaliseWheelDelta,
  ReelWheelArbiter,
  WHEEL_SILENCE_MS,
} from "../src/lib/reel-scroll";

// ── index math ──────────────────────────────────────────────────────────────

test("reelIndexFromScroll rounds to the nearest card", () => {
  const H = 700;
  assert.equal(reelIndexFromScroll(0, H), 0);
  assert.equal(reelIndexFromScroll(349, H), 0);
  assert.equal(reelIndexFromScroll(351, H), 1);
  assert.equal(reelIndexFromScroll(1400, H), 2);
  assert.equal(reelIndexFromScroll(2099, H), 3);
});

test("reelIndexFromScroll is safe on zero/degenerate viewports", () => {
  assert.equal(reelIndexFromScroll(500, 0), 0);
  assert.equal(reelIndexFromScroll(Number.NaN, 700), 0);
  assert.equal(reelIndexFromScroll(-100, 700), 0); // iOS bounce above the top
});

test("reelScrollOffset parks a card exactly at the viewport top", () => {
  const H = 720;
  assert.equal(reelScrollOffset(0, H), 0);
  assert.equal(reelScrollOffset(3, H), 2160);
  // round-trip: offset -> index -> offset
  for (let i = 0; i < 5; i++) {
    assert.equal(reelIndexFromScroll(reelScrollOffset(i, H), H), i);
  }
});

test("clampReelIndex bounds and rounds", () => {
  assert.equal(clampReelIndex(-3, 10), 0);
  assert.equal(clampReelIndex(9, 10), 9);
  assert.equal(clampReelIndex(14, 10), 9);
  assert.equal(clampReelIndex(1.4, 10), 1);
  assert.equal(clampReelIndex(Number.NaN, 10), 0);
  assert.equal(clampReelIndex(0, 0), 0); // empty feed
});

// ── wheel gesture grouping ──────────────────────────────────────────────────

test("a single decisive mouse tick navigates exactly once", () => {
  const a = new ReelWheelArbiter();
  assert.deepEqual(a.onWheelDelta(-110, 0), { nav: -1 });
  // further ticks in the same gesture (before the silence re-arm) are ignored
  assert.deepEqual(a.onWheelDelta(-95, 60), { ignore: true });
  assert.deepEqual(a.onWheelDelta(-80, 120), { ignore: true });
});

test("a trackpad flick with inertia tail navigates exactly once (no skip-and-return)", () => {
  const a = new ReelWheelArbiter();
  // flick: rising then decaying deltas over ~900ms
  const tail = [120, 90, 70, 55, 40, 30, 22, 16, 11, 8, 5, 3];
  let t = 0;
  const decisions: string[] = [];
  for (const d of tail) {
    const r = a.onWheelDelta(d, (t += 30));
    decisions.push("nav" in r ? `nav:${r.nav}` : "ignore");
  }
  assert.deepEqual(decisions, ["nav:1", ...Array<string>(tail.length - 1).fill("ignore")]);
});

test("rearm after silence allows the next gesture to navigate", () => {
  const a = new ReelWheelArbiter();
  assert.deepEqual(a.onWheelDelta(120, 0), { nav: 1 });
  a.onWheelDelta(50, 100); // tail, ignored
  a.rearm(); // WHEEL_SILENCE_MS of quiet elapsed
  assert.deepEqual(a.onWheelDelta(120, 400), { nav: 1 });
});

test("sub-threshold drift accumulates but never navigates on its own", () => {
  const a = new ReelWheelArbiter();
  assert.deepEqual(a.onWheelDelta(6, 0), { ignore: true }); // below epsilon
  assert.deepEqual(a.onWheelDelta(20, 30), { ignore: true });
  assert.deepEqual(a.onWheelDelta(25, 60), { ignore: true }); // total 45 < 60
  assert.deepEqual(a.onWheelDelta(20, 90), { nav: 1 }); // total 65 crosses
  assert.deepEqual(a.onWheelDelta(20, 120), { ignore: true }); // disarmed
});

test("gesture direction follows the accumulated sign (natural scrolling)", () => {
  const a = new ReelWheelArbiter();
  // mixed small deltas netting negative
  assert.deepEqual(a.onWheelDelta(-30, 0), { ignore: true });
  assert.deepEqual(a.onWheelDelta(10, 30), { ignore: true });
  assert.deepEqual(a.onWheelDelta(-40, 60), { nav: -1 }); // net -60
});

test("isDisarmed reflects the gesture state", () => {
  const a = new ReelWheelArbiter();
  assert.equal(a.isDisarmed, false);
  a.onWheelDelta(120, 0);
  assert.equal(a.isDisarmed, true);
  a.rearm();
  assert.equal(a.isDisarmed, false);
});

test("the exported silence window matches the documented 150ms", () => {
  assert.equal(WHEEL_SILENCE_MS, 150);
});

// ── wheel delta normalisation ───────────────────────────────────────────────

test("normaliseWheelDelta converts line and page modes to pixels", () => {
  assert.equal(normaliseWheelDelta(3, 0, 700), 3); // pixel mode passes through
  assert.equal(normaliseWheelDelta(3, 1, 700), 48); // 3 lines * 16px
  assert.equal(normaliseWheelDelta(1, 2, 700), 700); // one page
  assert.equal(normaliseWheelDelta(1, 2, 0), 1); // degenerate viewport: >= 1px
});
