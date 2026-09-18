import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A3 — one state machine behind every live <video>, driving a single
 * <VideoStatusOverlay> with distinct, human messages. Never shown over
 * healthy video; debounced so it never flickers; announced to screen
 * readers (role="status") by the overlay component.
 *
 * States:
 *   connecting      — no connection yet ("Connecting to the stream…")
 *   waiting-host    — connected, no track ("Waiting for the host's video…")
 *   host-camera-off — track present but muted (host turned camera off)
 *   no-frames       — track present but frames stalled >3 s (auto-retry)
 *   autoplay-blocked— play() rejected (tappable "Tap to play")
 *   reconnecting    — LiveKit/signal reconnect in progress
 *   disconnected    — connection lost (retry button)
 *   host-left       — stream still live but the host's track vanished >N s
 *   ok              — healthy; overlay hidden
 */

export type LiveVideoHealthState =
  | "connecting"
  | "waiting-host"
  | "host-camera-off"
  | "no-frames"
  | "autoplay-blocked"
  | "reconnecting"
  | "disconnected"
  | "host-left"
  | "ok";

export interface UseLiveVideoHealthOptions {
  /** The <video> element to watch (ref). */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Transport connected (LiveKit room / mesh PC). */
  connected: boolean;
  /** A MediaStream is attached (host or remote). */
  hasStream: boolean;
  /** Remote track muted state (viewer-side camera-off detection). */
  remoteTrackMuted?: boolean | undefined;
  /** Transport-level reconnect signal (true while reconnecting). */
  reconnecting?: boolean | undefined;
  /** True when the stream document is still status:"live". */
  streamLive: boolean;
  /** Host-left detection only applies to the viewer's main host tile. */
  isViewer: boolean;
  /** How long a present-but-stalled track takes to trip no-frames. */
  stallThresholdMs?: number;
  /** How long the host's absence takes to trip host-left. */
  hostLeftThresholdMs?: number;
  /** Overlay debounce so momentary blips don't flicker the message. */
  debounceMs?: number;
}

const DEFAULTS = {
  stallThresholdMs: 3_000,
  hostLeftThresholdMs: 12_000,
  debounceMs: 400,
};

export interface LiveVideoHealth {
  state: LiveVideoHealthState;
  /** Distinct, human message for the current state ("" when ok). */
  message: string;
  /** A retry is available/automatic (no-frames auto-retry, disconnected button). */
  canRetry: boolean;
  /** Manual retry — re-attaches the stream and calls play() again. */
  retry: () => void;
}

export function useLiveVideoHealth(options: UseLiveVideoHealthOptions): LiveVideoHealth {
  const {
    videoRef,
    connected,
    hasStream,
    remoteTrackMuted = false,
    reconnecting = false,
    streamLive,
    isViewer,
    stallThresholdMs = DEFAULTS.stallThresholdMs,
    hostLeftThresholdMs = DEFAULTS.hostLeftThresholdMs,
    debounceMs = DEFAULTS.debounceMs,
  } = options;

  const [state, setState] = useState<LiveVideoHealthState>("connecting");
  const [playBlocked, setPlayBlocked] = useState(false);

  // ── Frame progression watcher (requestVideoFrameCallback when available,
  //    currentTime polling otherwise) ────────────────────────────────────────
  const lastFrameAtRef = useRef<number>(Date.now());
  const stalledSinceRef = useRef<number | null>(null);
  const hostAbsentSinceRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Track the attached stream so retry can re-attach it.
  useEffect(() => {
    const video = videoRef.current;
    if (video) streamRef.current = video.srcObject as MediaStream | null;
  }, [videoRef, hasStream, connected]);

  const retry = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setPlayBlocked(false);
    stalledSinceRef.current = null;
    lastFrameAtRef.current = Date.now();
    if (streamRef.current) {
      video.srcObject = streamRef.current;
    }
    void video.play().catch(() => setPlayBlocked(true));
    setState((s) => (s === "no-frames" || s === "disconnected" ? "connecting" : s));
  }, [videoRef]);

  // ── Autoplay-blocked detection ─────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlayFailure = () => setPlayBlocked(true);
    // Attempting play whenever the stream changes surfaces NotAllowedError.
    const attempt = video.play();
    if (attempt) attempt.catch(onPlayFailure);
    const handler = () => setPlayBlocked(false);
    video.addEventListener("playing", handler);
    return () => video.removeEventListener("playing", handler);
  }, [videoRef, hasStream, connected]);

  // ── Frame stall + host-left watcher ───────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markFrame = () => {
      lastFrameAtRef.current = Date.now();
      stalledSinceRef.current = null;
    };

    let rvfcId = 0;
    const useRvfc =
      typeof (video as HTMLVideoElement & { requestVideoFrameCallback?: unknown })
        .requestVideoFrameCallback === "function";
    if (useRvfc) {
      const v = video as HTMLVideoElement & {
        requestVideoFrameCallback: (cb: () => void) => number;
        cancelVideoFrameCallback?: (id: number) => void;
      };
      const loop = () => {
        markFrame();
        rvfcId = v.requestVideoFrameCallback(loop);
      };
      rvfcId = v.requestVideoFrameCallback(loop);
    }

    const timer = window.setInterval(() => {
      const now = Date.now();
      // currentTime advancing also counts as frame progression.
      if (video.currentTime > 0 && !video.paused && video.readyState >= 2) {
        markFrame();
      }
      // Stall detection: a present, playing-intended track with no frames.
      if (hasStream && connected) {
        const stalledFor = now - lastFrameAtRef.current;
        if (stalledFor > stallThresholdMs && !video.paused) {
          if (stalledSinceRef.current === null) stalledSinceRef.current = now;
        } else {
          stalledSinceRef.current = null;
        }
      } else {
        lastFrameAtRef.current = now;
        stalledSinceRef.current = null;
      }

      // Host-left detection (viewer main tile only).
      if (isViewer && streamLive && connected && !hasStream) {
        if (hostAbsentSinceRef.current === null) hostAbsentSinceRef.current = now;
      } else {
        hostAbsentSinceRef.current = null;
      }
    }, 500);

    return () => {
      window.clearInterval(timer);
      if (useRvfc) {
        const v = video as HTMLVideoElement & { cancelVideoFrameCallback?: (id: number) => void };
        v.cancelVideoFrameCallback?.(rvfcId);
      }
    };
  }, [videoRef, hasStream, connected, isViewer, streamLive, stallThresholdMs]);

  // ── Auto-retry with back-off while no-frames persists ─────────────────────
  useEffect(() => {
    if (state !== "no-frames") return;
    const t = window.setTimeout(() => retry(), 2_500);
    return () => window.clearTimeout(t);
  }, [state, retry]);

  // ── State computation (debounced) ─────────────────────────────────────────
  const computeTarget = useCallback((): LiveVideoHealthState => {
    if (reconnecting) return "reconnecting";
    if (!connected) return "connecting";
    if (playBlocked) return "autoplay-blocked";
    if (!streamLive) return "disconnected";
    if (isViewer && !hasStream) {
      if (
        hostAbsentSinceRef.current !== null &&
        Date.now() - hostAbsentSinceRef.current > hostLeftThresholdMs
      ) {
        return "host-left";
      }
      return "waiting-host";
    }
    if (!hasStream) return "waiting-host";
    if (remoteTrackMuted) return "host-camera-off";
    if (stalledSinceRef.current !== null && Date.now() - stalledSinceRef.current > 1_200) {
      return "no-frames";
    }
    return "ok";
  }, [
    connected,
    hasStream,
    isViewer,
    playBlocked,
    reconnecting,
    remoteTrackMuted,
    streamLive,
    hostLeftThresholdMs,
  ]);

  useEffect(() => {
    const target = computeTarget();
    if (target === state) return;
    // Debounce transitions INTO a bad state; clear instantly back to ok so
    // the overlay never lingers over healthy video.
    if (target === "ok") {
      setState("ok");
      return;
    }
    const t = window.setTimeout(() => {
      // Re-evaluate at commit time — the condition may have resolved.
      setState(computeTarget() === "ok" ? "ok" : computeTarget());
    }, debounceMs);
    return () => window.clearTimeout(t);
  }, [computeTarget, state, debounceMs]);

  const messages: Record<LiveVideoHealthState, string> = {
    connecting: "Connecting to the stream…",
    "waiting-host": "Waiting for the host's video…",
    "host-camera-off": "Host turned their camera off",
    "no-frames": "Video isn't loading — retrying…",
    "autoplay-blocked": "Tap to play",
    reconnecting: "Reconnecting…",
    disconnected: "Connection lost",
    "host-left": "Host left — waiting for them to return",
    ok: "",
  };

  return {
    state,
    message: messages[state],
    canRetry: state === "no-frames" || state === "disconnected" || state === "autoplay-blocked",
    retry,
  };
}
