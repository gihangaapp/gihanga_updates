/**
 * A6 — pure connection-quality classifier with hysteresis. No DOM, no
 * LiveKit imports: fully unit-testable (tests/live-quality.test.ts).
 *
 * Inputs are rolling samples (packet loss %, RTT ms, received bitrate kbps,
 * online flag). The classifier decides between "good" and "poor" with
 * hysteresis so the banner never flickers on a single bad sample:
 *   - entering "poor" requires POOR conditions sustained for poorSustainMs,
 *   - returning to "good" requires GOOD conditions sustained for
 *     recoverSustainMs.
 */

export interface QualityThresholds {
  poorLossPct: number;
  poorRttMs: number;
  poorBitrateKbps: number;
  poorSustainMs: number;
  recoverSustainMs: number;
}

export interface QualitySample {
  /** Epoch ms of the sample. */
  at: number;
  /** Packet loss fraction of the last interval, 0..1 (NaN/undefined = unknown). */
  loss?: number;
  /** Round-trip time in ms (unknown = undefined). */
  rttMs?: number;
  /** Received bitrate in kbps (unknown = undefined). */
  bitrateKbps?: number;
  /** navigator.onLine (a hard offline beats every other signal). */
  online?: boolean;
}

export type QualityLevel = "good" | "poor";

export interface QualityState {
  level: QualityLevel;
  /** First timestamp of the current sustained streak. */
  streakSince: number;
  /** Samples currently buffered (bounded by the caller). */
  samples: QualitySample[];
}

export const DEFAULT_QUALITY_THRESHOLDS: QualityThresholds = {
  poorLossPct: 8,
  poorRttMs: 600,
  poorBitrateKbps: 150,
  poorSustainMs: 6_000,
  recoverSustainMs: 8_000,
};

export function createQualityState(now = 0): QualityState {
  return { level: "good", streakSince: now, samples: [] };
}

function sampleIsPoor(sample: QualitySample, t: QualityThresholds): boolean {
  if (sample.online === false) return true;
  if (typeof sample.loss === "number" && Number.isFinite(sample.loss)) {
    if (sample.loss * 100 > t.poorLossPct) return true;
  }
  if (typeof sample.rttMs === "number" && Number.isFinite(sample.rttMs)) {
    if (sample.rttMs > t.poorRttMs) return true;
  }
  if (typeof sample.bitrateKbps === "number" && Number.isFinite(sample.bitrateKbps)) {
    if (sample.bitrateKbps < t.poorBitrateKbps && sample.bitrateKbps > 0) return true;
  }
  return false;
}

/**
 * Feed one sample; returns the (possibly unchanged) state. Pure: returns a
 * new state object, never mutates the input.
 */
export function pushSample(
  state: QualityState,
  sample: QualitySample,
  thresholds: QualityThresholds = DEFAULT_QUALITY_THRESHOLDS,
): QualityState {
  const samples = [...state.samples, sample].slice(-32);
  const poor = sampleIsPoor(sample, thresholds);

  const streakBroke = state.level === "good" ? poor !== true : poor !== false;
  const streakSince = streakBroke ? sample.at : state.streakSince;

  let level: QualityLevel = state.level;
  if (state.level === "good" && poor) {
    if (sample.at - streakSince >= thresholds.poorSustainMs) level = "poor";
  } else if (state.level === "poor" && !poor) {
    if (sample.at - streakSince >= thresholds.recoverSustainMs) level = "good";
  }

  return { level, streakSince, samples };
}

/**
 * Convenience: run a whole history at once (used by tests and by callers
 * that collect stats in batches).
 */
export function classifyHistory(
  samples: QualitySample[],
  thresholds: QualityThresholds = DEFAULT_QUALITY_THRESHOLDS,
): QualityState {
  return samples.reduce<QualityState>(
    (state, sample) => pushSample(state, sample, thresholds),
    createQualityState(),
  );
}

/** Browser NetworkInformation-derived soft signals. */
export interface NetworkHint {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
}

/**
 * Soft hint from navigator.connection — never flips the level alone, but a
 * 2g/saveData connection pre-disposes to poor so the banner appears a
 * little earlier rather than late.
 */
export function networkHintLooksPoor(hint: NetworkHint): boolean {
  if (hint.saveData === true) return true;
  if (hint.effectiveType === "2g" || hint.effectiveType === "slow-2g") return true;
  if (typeof hint.downlink === "number" && hint.downlink > 0 && hint.downlink < 0.25) return true;
  return false;
}
