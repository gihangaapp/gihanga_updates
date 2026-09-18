/**
 * B4 — unit tests for the CSS linear-gradient parser, covering EVERY preset
 * in STORY_BACKGROUND_PRESETS plus edge cases.
 * Run: npm run test:gradient
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseLinearGradient, gradientLineForAngle } from "../src/lib/gradient";

const PRESETS = [
  "linear-gradient(135deg, #FF512F, #DD2476)",
  "linear-gradient(135deg, #8A2387, #E94057, #F27121)",
  "linear-gradient(135deg, #00B4DB, #0083B0)",
  "linear-gradient(135deg, #11998e, #38ef7d)",
  "linear-gradient(135deg, #FC466B, #3F5EFB)",
  "linear-gradient(135deg, #0F2027, #203A43, #2C5364)",
  "linear-gradient(135deg, #FFE000, #799F0C)",
];

test("every gradient preset parses with the correct angle and stop count", () => {
  for (const preset of PRESETS) {
    const parsed = parseLinearGradient(preset);
    assert.ok(parsed, `failed to parse: ${preset}`);
    assert.equal(parsed.angleDeg, 135);
    assert.equal(parsed.stops.length, preset.split(",").length - 1);
  }
});

test("preset colors are preserved EXACTLY (no more hard-coded purple→red→orange)", () => {
  const parsed = parseLinearGradient("linear-gradient(135deg, #00B4DB, #0083B0)");
  assert.ok(parsed);
  assert.equal(parsed.stops[0]?.color, "#00b4db");
  assert.equal(parsed.stops[1]?.color, "#0083b0");

  const three = parseLinearGradient("linear-gradient(135deg, #0F2027, #203A43, #2C5364)");
  assert.ok(three);
  assert.deepEqual(
    three.stops.map((s) => s.color),
    ["#0f2027", "#203a43", "#2c5364"],
  );
});

test("positions interpolate: two stops land at 0 and 1", () => {
  const parsed = parseLinearGradient("linear-gradient(135deg, #FF512F, #DD2476)");
  assert.ok(parsed);
  assert.equal(parsed.stops[0]?.pos, 0);
  assert.equal(parsed.stops[1]?.pos, 1);
});

test("explicit percentage positions are honoured", () => {
  const parsed = parseLinearGradient("linear-gradient(90deg, #111 20%, #222 80%)");
  assert.ok(parsed);
  assert.equal(parsed.stops[0]?.pos, 0.2);
  assert.equal(parsed.stops[1]?.pos, 0.8);
});

test("middle unpositioned stops spread evenly between positioned neighbours", () => {
  const parsed = parseLinearGradient("linear-gradient(90deg, #111 0%, #222 50%, #333 100%)");
  assert.ok(parsed);
  assert.equal(parsed.stops[1]?.pos, 0.5);
});

test("side-or-corner keywords map to CSS angles", () => {
  assert.equal(parseLinearGradient("linear-gradient(to right, #111, #222)")?.angleDeg, 90);
  assert.equal(parseLinearGradient("linear-gradient(to top, #111, #222)")?.angleDeg, 0);
  assert.equal(parseLinearGradient("linear-gradient(to bottom, #111, #222)")?.angleDeg, 180);
  assert.equal(parseLinearGradient("linear-gradient(to left, #111, #222)")?.angleDeg, 270);
});

test("missing angle defaults to 180deg (CSS default)", () => {
  assert.equal(parseLinearGradient("linear-gradient(#111, #222)")?.angleDeg, 180);
});

test("3-digit hex expands to 6 digits", () => {
  const parsed = parseLinearGradient("linear-gradient(90deg, #abc, #123)");
  assert.equal(parsed?.stops[0]?.color, "#aabbcc");
  assert.equal(parsed?.stops[1]?.color, "#112233");
});

test("rgba() and named colors parse (commas inside rgba are respected)", () => {
  const parsed = parseLinearGradient("linear-gradient(90deg, rgba(10, 20, 30, 0.5), white)");
  assert.ok(parsed);
  assert.equal(parsed.stops[0]?.color, "rgba(10, 20, 30, 0.5)");
  assert.equal(parsed.stops[1]?.color, "#ffffff");
});

test("non-gradient strings return null (solid colour fallback)", () => {
  assert.equal(parseLinearGradient("#000000"), null);
  assert.equal(parseLinearGradient(""), null);
  assert.equal(parseLinearGradient("radial-gradient(#111, #222)"), null);
});

test("gradient line for 135deg on a 720x1280 canvas crosses the box correctly", () => {
  const { x0, y0, x1, y1 } = gradientLineForAngle(135, 720, 1280);
  // For 135deg (to bottom-right), start is top-left area, end bottom-right.
  assert.ok(x0 < 360 && y0 < 640, `start (${x0},${y0}) should be in the top-left half`);
  assert.ok(x1 > 360 && y1 > 640, `end (${x1},${y1}) should be in the bottom-right half`);
  // Symmetric around the centre.
  assert.equal(Math.round(x0 + x1), 720);
  assert.equal(Math.round(y0 + y1), 1280);
});

test("gradient line for 0deg is vertical, spanning the full height (first stop at the bottom)", () => {
  const { x0, y0, x1, y1 } = gradientLineForAngle(0, 720, 1280);
  assert.equal(x0, x1);
  assert.equal(y0, 1280);
  assert.equal(y1, 0);
});

test("gradient line for 90deg is horizontal, spanning the full width", () => {
  const { x0, y0, x1, y1 } = gradientLineForAngle(90, 720, 1280);
  assert.equal(y0, y1);
  assert.ok(Math.abs(x0) < 1e-9, `x0 ≈ 0 (got ${x0})`);
  assert.ok(Math.abs(x1 - 720) < 1e-9, `x1 ≈ 720 (got ${x1})`);
});
