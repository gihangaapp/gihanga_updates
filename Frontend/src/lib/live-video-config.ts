/**
 * A1 — single source of truth for every tunable live-video quality constant.
 * Change numbers here (or via VITE_* env) without touching transport code.
 *
 * Applied to BOTH transports: the LiveKit SFU path (livekit-live.ts) and the
 * legacy browser mesh (browser-live.ts), plus useCameraPreview so what the
 * host previews equals what is broadcast.
 */

function envNumber(name: string, fallback: number): number {
  const raw = import.meta.env[name] as string | undefined;
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const isMobileViewport = (): boolean =>
  typeof window !== "undefined" &&
  (navigator.maxTouchPoints > 0 || "ontouchstart" in window) &&
  window.matchMedia("(max-width: 767px)").matches;

export const LIVE_VIDEO_QUALITY = {
  /**
   * Capture constraints. Desktop hosts aim for 1080p (with a graceful chain
   * down to 720p/360p via `ideal` + `min`); mobile defaults to 720p where
   * most front cameras top out anyway and bitrate budgets are tighter.
   */
  capture: {
    desktop: { width: { ideal: 1920 }, height: { ideal: 1080 } },
    mobile: { width: { ideal: 1280 }, height: { ideal: 720 } },
    frameRate: { ideal: envNumber("VITE_LIVE_FPS", 30), max: 30 },
    /** Absolute floor before we refuse to look worse than this. */
    min: { width: 640, height: 360 },
  },
  /** 720p30 target bitrate (kbps) — the sweet spot for talking-head HD. */
  maxBitrateKbps: envNumber("VITE_LIVE_MAX_BITRATE_KBPS", 1_800),
  maxBitrate: envNumber("VITE_LIVE_MAX_BITRATE_KBPS", 1_800) * 1000,
  /** Simulcast layers (LiveKit path) — low/mid/high. */
  simulcastLayers: [
    { scaleResolutionDownBy: 4, maxBitrate: 150_000 }, // ~180p
    { scaleResolutionDownBy: 2, maxBitrate: 500_000 }, // ~360p
    { scaleResolutionDownBy: 1, maxBitrate: envNumber("VITE_LIVE_MAX_BITRATE_KBPS", 1_800) * 1000 }, // 720p
  ] as const,
  /** Preferred codecs in order — VP8 first (best simulcast support), H264 fallback. */
  preferredCodecs: ["vp8", "h264"] as const,
} as const;

/** Full video MediaTrackConstraints for host/co-host capture. */
export function liveCaptureConstraints(): MediaTrackConstraints {
  const base = isMobileViewport()
    ? LIVE_VIDEO_QUALITY.capture.mobile
    : LIVE_VIDEO_QUALITY.capture.desktop;
  return {
    width: { ideal: base.width.ideal, min: LIVE_VIDEO_QUALITY.capture.min.width },
    height: { ideal: base.height.ideal, min: LIVE_VIDEO_QUALITY.capture.min.height },
    frameRate: { ...LIVE_VIDEO_QUALITY.capture.frameRate },
  };
}

/** Camera-preview constraints (same shape so preview == broadcast). */
export function livePreviewConstraints(facingMode: "user" | "environment"): MediaTrackConstraints {
  const capture = liveCaptureConstraints();
  return { ...capture, facingMode };
}

/**
 * A6 — connection-quality thresholds with hysteresis. The classifier is a
 * pure function (live-quality.ts); these are its knobs.
 * poor: sustained ≥ 6 s of (loss > 8% or RTT > 600 ms or bitrate < 150 kbps)
 * recover: ≥ 8 s of all-good before the banner disappears.
 */
export const QUALITY_THRESHOLDS = {
  poorLossPct: 8,
  poorRttMs: 600,
  poorBitrateKbps: 150,
  poorSustainMs: 6_000,
  recoverSustainMs: 8_000,
  /** Reconnecting longer than this escalates to the A3 black-screen overlay. */
  reconnectEscalateMs: 10_000,
} as const;

/**
 * A1 mesh fallback — STUN-only (stun.l.google.com) fails on strict/mobile
 * NATs. Optional TURN via VITE_TURN_URL / VITE_TURN_USERNAME /
 * VITE_TURN_CREDENTIAL (names only in .env.example, never committed).
 */
export function liveIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ];
  const turnUrl = import.meta.env["VITE_TURN_URL"] as string | undefined;
  const turnUsername = import.meta.env["VITE_TURN_USERNAME"] as string | undefined;
  const turnCredential = import.meta.env["VITE_TURN_CREDENTIAL"] as string | undefined;
  if (turnUrl) {
    servers.push({
      urls: turnUrl
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean),
      ...(turnUsername ? { username: turnUsername } : {}),
      ...(turnCredential ? { credential: turnCredential } : {}),
    });
  }
  return servers;
}

/** A1 mesh fallback — sender encoding parameters applied after negotiation. */
export const MESH_VIDEO_SEND_PARAMS = {
  maxBitrate: envNumber("VITE_LIVE_MAX_BITRATE_KBPS", 1_800) * 1000,
  scaleResolutionDownBy: 1,
} as const;
