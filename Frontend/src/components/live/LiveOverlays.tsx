import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, Signal, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { classifyHistory, networkHintLooksPoor, type QualitySample } from "@/lib/live-quality";
import { QUALITY_THRESHOLDS } from "@/lib/live-video-config";
import type { LiveVideoHealth } from "@/hooks/use-live-video-health";

/**
 * A3 — the single overlay used by every live <video>. Driven by
 * useLiveVideoHealth(); never rendered when state === "ok"; role="status"
 * for screen readers; debouncing happens in the hook so it never flickers.
 */
export function VideoStatusOverlay({
  health,
  role,
}: {
  health: LiveVideoHealth;
  role: "host" | "co-host" | "viewer";
}) {
  if (health.state === "ok") return null;

  const message =
    health.state === "disconnected"
      ? role === "viewer"
        ? "Connection lost"
        : "Your broadcast connection was lost"
      : health.state === "reconnecting"
        ? role === "viewer"
          ? "Reconnecting…"
          : "Your connection dropped — reconnecting…"
        : health.state === "host-left"
          ? "Host left — waiting for them to return"
          : health.state === "no-frames"
            ? "Video isn't loading — retrying…"
            : health.state === "autoplay-blocked"
              ? "Tap to play"
              : health.state === "host-camera-off"
                ? role === "viewer"
                  ? "Host turned their camera off"
                  : "Your camera is off"
                : health.state === "waiting-host"
                  ? role === "viewer"
                    ? "Waiting for the host's video…"
                    : "Waiting for your broadcast to start…"
                  : role === "viewer"
                    ? "Connecting to the stream…"
                    : "Starting your camera…";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/60 px-6 text-center backdrop-blur-[2px]",
        health.state === "autoplay-blocked" && "cursor-pointer",
      )}
      onClick={
        health.state === "autoplay-blocked" || health.state === "disconnected"
          ? health.retry
          : undefined
      }
    >
      {health.state === "connecting" ||
      health.state === "reconnecting" ||
      health.state === "no-frames" ? (
        <Loader2 className="size-8 animate-pulse text-white/80" />
      ) : health.state === "disconnected" ? (
        <WifiOff className="size-8 text-danger" />
      ) : health.state === "host-camera-off" ? (
        <Signal className="size-8 text-white/80" />
      ) : (
        <AlertTriangle className="size-8 text-white/80" />
      )}
      <p className="text-sm font-semibold text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
        {message}
      </p>
      {(health.state === "disconnected" || health.state === "no-frames") && health.canRetry && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            health.retry();
          }}
          className="press mt-1 flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-white/90"
        >
          <RefreshCw className="size-3.5" /> Retry
        </button>
      )}
      {health.state === "autoplay-blocked" && (
        <span className="text-xs text-white/60">
          Your browser blocked autoplay — tap anywhere to start the video
        </span>
      )}
    </div>
  );
}

/**
 * A6 — the non-blocking poor-connection banner with hysteresis. Shows for
 * sustained poor quality, auto-dismisses after sustained recovery. Never
 * covers the video controls; sits at the top of the stream area.
 */
export function ConnectionQualityBanner({
  samples,
  variant,
  escalated,
}: {
  samples: QualitySample[];
  variant: "viewer" | "broadcaster";
  escalated?: boolean | undefined;
}) {
  const [hint, setHint] = useState(false);

  // navigator.connection soft hints (effectiveType/saveData/downlink).
  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        saveData?: boolean;
        downlink?: number;
        addEventListener?: (type: string, cb: () => void) => void;
        removeEventListener?: (type: string, cb: () => void) => void;
      };
    };
    const update = () => setHint(networkHintLooksPoor(nav.connection ?? {}));
    update();
    nav.connection?.addEventListener?.("change", update);
    return () => nav.connection?.removeEventListener?.("change", update);
  }, []);

  const state = classifyHistory(samples, QUALITY_THRESHOLDS);
  const poor = state.level === "poor" || (hint && samples.length === 0);
  // Online/offline adds a hard signal the classifier sees via samples.
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if ((!poor && !offline) || escalated) return null;

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-none absolute inset-x-3 top-28 z-20 mx-auto flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold backdrop-blur-md",
        offline
          ? "border-danger/40 bg-danger/20 text-white"
          : "border-amber-400/40 bg-amber-500/20 text-amber-100",
      )}
    >
      {offline ? <WifiOff className="size-3.5" /> : <Wifi className="size-3.5 animate-pulse" />}
      {offline
        ? "You're offline — reconnecting…"
        : variant === "viewer"
          ? "Poor connection — try moving to a new location or switching networks."
          : "Your connection is weak — viewers may see lag."}
    </div>
  );
}
