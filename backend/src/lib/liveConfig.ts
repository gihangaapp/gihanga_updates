/**
 * Central, env-overridable tuning knobs for the live-streaming subsystem.
 *
 * Everything here is a plain constant computed once at module load so the
 * sweeper, token minting, REST routes and socket handlers can never disagree
 * about the rules. Override any of them with the listed env var — the A7
 * regression pass (5h cap) intentionally supports shrinking the cap to a
 * couple of minutes via LIVE_MAX_HOURS to exercise the full end-of-stream
 * path in tests without waiting five real hours.
 */

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Hard server-enforced cap on a single live stream. Default: 5 hours. */
export const MAX_LIVE_DURATION_MS = Math.round(envNumber("LIVE_MAX_HOURS", 5) * 3_600_000);

/**
 * A host whose heartbeat is older than this is considered gone (crashed
 * browser, killed tab, lost network for good) and the sweeper ends the
 * stream. 90 s comfortably absorbs a 20 s heartbeat interval plus retries.
 */
export const STALE_HEARTBEAT_MS = Math.round(envNumber("LIVE_STALE_HEARTBEAT_SECONDS", 90) * 1000);

/** How often the sweeper scans for capped/stale streams. Default: 30 s. */
export const SWEEP_INTERVAL_MS = Math.round(envNumber("LIVE_SWEEP_INTERVAL_SECONDS", 30) * 1000);

/** Remaining-time warnings are emitted at these marks (minutes before cap). */
export const TIME_WARNING_MINUTES: readonly number[] = [30, 5, 1];

/** Redis key holding the cross-instance sweeper lock. */
export const SWEEPER_LOCK_KEY = "live:sweeper:lock";

/** Default paid-interaction prices (points) — per-stream overridable. */
export const PAID_INTERACTION_DEFAULTS = {
  likePrice: 2,
  commentPrice: 5,
  reactionPrice: 1,
} as const;

/** Sanity bounds for host/staff-configured prices. */
export const PAID_INTERACTION_BOUNDS = {
  minPrice: 0,
  maxLikePrice: 100,
  maxCommentPrice: 500,
  maxReactionPrice: 100,
} as const;

/** Setting-model key for staff-managed global defaults of the prices above. */
export const PAID_INTERACTIONS_SETTING_KEY = "live_paid_interactions_defaults";

/**
 * LiveKit join-token TTL ceiling. The route clamps the real TTL to
 * min(remaining stream time + 60 s grace, this ceiling) so a token can
 * never meaningfully outlive the 5 h cap.
 */
export const LIVEKIT_TOKEN_TTL_CEILING_S = 6 * 60 * 60;
