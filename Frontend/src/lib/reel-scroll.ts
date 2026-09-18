/**
 * B5.8 — Reels scroll machinery (pure, DOM-free).
 *
 * The reel feed previously "danced": programmatic `scrollIntoView` raced the
 * mandatory CSS scroll-snap, scrolled page-level ancestors, and a rAF handler
 * flipped the active index (and thus the windowed DOM) mid-animation. The
 * rules below are the fixed contract the reels route now follows:
 *
 *  1. The ONLY thing that ever scrolls is the snap container itself, always
 *     to an EXACT card multiple (`index * clientHeight`) — never
 *     `scrollIntoView` (which also scrolls every scrollable ancestor,
 *     including the page) and never a non-snap target.
 *  2. The active index is derived from scroll GEOMETRY and committed only
 *     once scrolling has SETTLED — no state flips mid-flight.
 *  3. Wheel/trackpad is owned by us (preventDefault) and grouped into
 *     gestures: one navigation per gesture, re-armed only after a quiet
 *     period, so native snap and inertia tails can never fight us.
 *
 * Everything here is pure so the gesture grouping and index math are covered
 * by unit tests (tests/reel-scroll.test.ts) without a browser.
 */

/** Clamp a reel index to the list bounds. */
export function clampReelIndex(idx: number, count: number): number {
  if (!Number.isFinite(idx)) return 0;
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, Math.round(idx)));
}

/**
 * Nearest reel index for a scroll position. With every card exactly one
 * viewport tall (h-full children of a definite-height flex scroller), the
 * nearest card is simply `round(scrollTop / clientHeight)`.
 */
export function reelIndexFromScroll(scrollTop: number, clientHeight: number): number {
  if (!Number.isFinite(scrollTop) || !Number.isFinite(clientHeight) || clientHeight <= 0) {
    return 0;
  }
  return Math.max(0, Math.round(scrollTop / clientHeight));
}

/** Exact scroll offset that parks `index` at the top of the viewport. */
export function reelScrollOffset(index: number, clientHeight: number): number {
  return clampReelIndex(index, Number.POSITIVE_INFINITY) * clientHeight;
}

/** Wheel deltas below this per-event magnitude are drift/jitter noise. */
const WHEEL_EVENT_EPSILON = 8;
/** A gesture must accumulate this much (pixel-mode) delta to navigate. */
const WHEEL_NAV_THRESHOLD = 60;
/** Silence (ms) that ends a gesture and re-arms navigation. */
export const WHEEL_SILENCE_MS = 150;

export type WheelDecision = { nav: 1 } | { nav: -1 } | { ignore: true };

/**
 * Groups a stream of wheel deltas into gestures.
 *
 * - Deltas accumulate (signed) until they cross `WHEEL_NAV_THRESHOLD`; the
 *   FIRST crossing of a gesture emits exactly one `nav` in the accumulated
 *   direction and disarms.
 * - While disarmed, every further delta is ignored — this swallows trackpad
 *   inertia tails (decaying deltas of the same flick) which previously caused
 *   the skip-a-video-then-snap-back behaviour.
 * - Re-arm happens ONLY via `rearm()` — the caller invokes it after
 *   `WHEEL_SILENCE_MS` without wheel events, so one physical gesture always
 *   means one navigation, and a held/continuous stream never turbo-scrolls.
 */
export class ReelWheelArbiter {
  private armed = true;
  private total = 0;

  /** Feed one normalised (pixel-mode) wheel delta. */
  onWheelDelta(delta: number, _now: number): WheelDecision {
    if (!Number.isFinite(delta) || Math.abs(delta) < WHEEL_EVENT_EPSILON) {
      return { ignore: true };
    }
    if (!this.armed) {
      // Still inside the same gesture (or its inertia tail): swallow.
      this.total += delta;
      return { ignore: true };
    }
    this.total += delta;
    if (Math.abs(this.total) >= WHEEL_NAV_THRESHOLD) {
      const dir: 1 | -1 = this.total > 0 ? 1 : -1;
      this.total = 0;
      this.armed = false;
      return { nav: dir };
    }
    return { ignore: true };
  }

  /** True while a navigation from this gesture has already fired. */
  get isDisarmed(): boolean {
    return !this.armed;
  }

  /** Call after `WHEEL_SILENCE_MS` without wheel events. */
  rearm(): void {
    this.armed = true;
    this.total = 0;
  }
}

/** Normalise a WheelEvent delta to pixel units (Firefox line/page modes). */
export function normaliseWheelDelta(
  deltaY: number,
  deltaMode: number,
  viewportHeight: number,
): number {
  if (deltaMode === 1) return deltaY * 16; // DOM_DELTA_LINE ≈ 16 px/line
  if (deltaMode === 2) return deltaY * Math.max(1, viewportHeight); // DOM_DELTA_PAGE
  return deltaY;
}
