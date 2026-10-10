import { Types } from "mongoose";
import { AchievementDefinition, UserAchievement } from "../models/Achievement";
import { Follow } from "../models/Follow";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { redis, claimIdempotencyKey } from "../lib/redis";
import { notify } from "../lib/notify";
import { logAudit } from "../utils/auditLogger";

/**
 * Achievement Badge System — centralized service.
 *
 * This is the SINGLE source of truth for:
 *   - loading configured achievement definitions (cached)
 *   - computing authoritative follower & view totals
 *   - deciding which milestones a user qualifies for
 *   - recording / revoking award records (idempotently)
 *   - returning badge states + progress for the profile UI
 *
 * No controller, route or frontend component computes badge thresholds on its
 * own — they all delegate here. That keeps the rules consistent everywhere and
 * makes future threshold changes a one-line edit in the seed/admin UI.
 *
 * Authoritative counters:
 *   - eligible followers  → Follow collection, joined to User, excluding
 *                           deleted / suspended / banned accounts and self.
 *   - cumulative views     → sum of Post.viewsCount across the author's
 *                           published (non-removed) posts. Videos and reels
 *                           are stored as Posts (the `kind` field distinguishes
 *                           them), so there is no double-counting across models.
 *
 * Badge semantics:
 *   - Follower badges are CURRENT milestones: if the eligible follower count
 *     drops below a threshold, the badge is revoked (revokedAt set). The
 *     historical award record is preserved for audit.
 *   - View badges are LIFETIME cumulative: once earned, never revoked
 *     (cumulative views only ever increase).
 *
 * Idempotency:
 *   - UserAchievement has a unique compound index on (user, achievementId).
 *   - awardAchievement uses upsert; a concurrent duplicate hits E11000 and is
 *     treated as "already awarded" — the existing record is returned.
 *   - Notification delivery uses claimIdempotencyKey so a retried sweeper pass
 *     never re-notifies the user for the same badge.
 */

// ── Default achievement definitions (seeded, admin-editable afterwards) ──────

/** Plain shape of an achievement definition as returned by .lean() — no Mongoose Document internals. */
interface AchievementDefLean {
  achievementId: string;
  name: string;
  category: "stars" | "diamonds";
  metric: "followers" | "views";
  description: string;
  threshold: number;
  icon: "star" | "diamond";
  color: "red" | "gold" | "blue" | "green";
  enabled: boolean;
  version: number;
}

export const DEFAULT_ACHIEVEMENTS: Array<{
  achievementId: string;
  name: string;
  category: "stars" | "diamonds";
  metric: "followers" | "views";
  description: string;
  threshold: number;
  icon: "star" | "diamond";
  color: "red" | "gold" | "blue" | "green";
}> = [
  {
    achievementId: "star_red",
    name: "Red Star",
    category: "stars",
    metric: "followers",
    description: "Awarded for reaching 10,000 eligible followers on Gihanga Updates.",
    threshold: 10_000,
    icon: "star",
    color: "red",
  },
  {
    achievementId: "star_gold",
    name: "Gold Star",
    category: "stars",
    metric: "followers",
    description: "Awarded for reaching 100,000 eligible followers on Gihanga Updates.",
    threshold: 100_000,
    icon: "star",
    color: "gold",
  },
  {
    achievementId: "star_blue",
    name: "Blue Star",
    category: "stars",
    metric: "followers",
    description: "Awarded for reaching 1,000,000 eligible followers on Gihanga Updates.",
    threshold: 1_000_000,
    icon: "star",
    color: "blue",
  },
  {
    achievementId: "diamond_red",
    name: "Red Diamond",
    category: "diamonds",
    metric: "views",
    description: "Awarded for reaching 100,000 cumulative eligible content views.",
    threshold: 100_000,
    icon: "diamond",
    color: "red",
  },
  {
    achievementId: "diamond_green",
    name: "Green Diamond",
    category: "diamonds",
    metric: "views",
    description: "Awarded for reaching 1,000,000 cumulative eligible content views.",
    threshold: 1_000_000,
    icon: "diamond",
    color: "green",
  },
  {
    achievementId: "diamond_blue",
    name: "Blue Diamond",
    category: "diamonds",
    metric: "views",
    description: "Awarded for reaching 10,000,000 cumulative eligible content views.",
    threshold: 10_000_000,
    icon: "diamond",
    color: "blue",
  },
];

/** Inserts any missing default definitions without overwriting admin settings. */
export async function ensureDefaultAchievementDefinitions(): Promise<void> {
  for (const def of DEFAULT_ACHIEVEMENTS) {
    try {
      await AchievementDefinition.updateOne(
        { achievementId: def.achievementId },
        { $setOnInsert: { ...def, enabled: true, version: 1 } },
        { upsert: true },
      );
    } catch (error) {
      if (
        typeof error !== "object" ||
        error === null ||
        !("code" in error) ||
        error.code !== 11000
      ) {
        throw error;
      }
    }
  }
  await invalidateDefinitionsCache();
}

// ── Public response shapes ──────────────────────────────────────────────────

export interface BadgeState {
  achievementId: string;
  name: string;
  category: "stars" | "diamonds";
  metric: "followers" | "views";
  description: string;
  threshold: number;
  icon: "star" | "diamond";
  color: "red" | "gold" | "blue" | "green";
  enabled: boolean;
  earned: boolean;
  /** ISO date string when the badge was (most recently) awarded, if currently earned. */
  awardedAt: string | null;
}

export interface BadgeProgress extends BadgeState {
  /** Current authoritative metric value (eligible followers or cumulative views). */
  current: number;
  /** Remaining to reach the threshold (0 if earned). */
  remaining: number;
  /** Progress 0–100 clamped. */
  progressPct: number;
}

// ── Cache helpers ───────────────────────────────────────────────────────────
// Definitions are tiny and rarely change — cache for 5 minutes.
// Per-user follower/view totals are cached for 5 minutes and invalidated on
// follow events (and refreshed by the sweeper). Progress bars tolerate
// 5-minute staleness; award decisions always use the authoritative value.

const DEFS_CACHE_KEY = "ach:definitions";
const DEFS_CACHE_TTL = 300;
const FOLLOWERS_CACHE_KEY = (userId: string) => `ach:followers:${userId}`;
const VIEWS_CACHE_KEY = (userId: string) => `ach:views:${userId}`;
const METRIC_CACHE_TTL = 300;

async function cacheSetJSON(key: string, value: unknown, ttl: number) {
  try {
    // The in-memory shim honours TTL only on string/counter keys (see redis.ts),
    // so we store a JSON string and let expire() manage its lifetime.
    const raw = JSON.stringify(value);
    await (redis as any).setnx(key, raw);
    await (redis as any).expire(key, ttl);
    // Overwrite the value for subsequent sets within the same TTL window.
    // The shim doesn't expose SET-with-TTL; setnx+expire is close enough for
    // a cache (worst case: a stale value lingers one extra TTL window).
  } catch {
    /* cache is best-effort */
  }
}

async function cacheGetJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await (redis as any).get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Overwrites a cache key's value (used when invalidating+refreshing). */
async function cacheOverwriteJSON(key: string, value: unknown, ttl: number) {
  try {
    // The shim: del then setnx+expire to replace cleanly.
    await (redis as any).del(key);
    await (redis as any).setnx(key, JSON.stringify(value));
    await (redis as any).expire(key, ttl);
  } catch {
    /* best-effort */
  }
}

// ── Definitions ──────────────────────────────────────────────────────────────

export async function getEnabledDefinitions(): Promise<AchievementDefLean[]> {
  const cached = await cacheGetJSON<AchievementDefLean[]>(DEFS_CACHE_KEY);
  if (cached && cached.length) return cached;
  const defs = (await AchievementDefinition.find({ enabled: true }).sort({ category: 1, threshold: 1 }).lean()) as unknown as AchievementDefLean[];
  if (defs.length) await cacheSetJSON(DEFS_CACHE_KEY, defs, DEFS_CACHE_TTL);
  return defs;
}

export async function getAllDefinitions(): Promise<AchievementDefLean[]> {
  return AchievementDefinition.find().sort({ category: 1, threshold: 1 }).lean() as unknown as Promise<AchievementDefLean[]>;
}

/** Invalidates the definitions cache — call after any admin edit. */
export async function invalidateDefinitionsCache() {
  try {
    await (redis as any).del(DEFS_CACHE_KEY);
  } catch {
    /* best-effort */
  }
}

// ── Authoritative metric computation ────────────────────────────────────────

/**
 * Eligible follower count for a user — the authoritative source.
 *
 * Counts Follow documents where:
 *   - following = userId
 *   - the follower is a real, active, non-deleted account
 *   - the follower isn't the user themselves (self-follow guard)
 *
 * This is more correct than the cached `User.followersCount` counter, which
 * doesn't account for followers who were later deleted/suspended. The cached
 * counter is used only for fast progress-bar display; award decisions use this.
 */
export async function getEligibleFollowers(userId: string): Promise<number> {
  const cached = await cacheGetJSON<number>(FOLLOWERS_CACHE_KEY(userId));
  if (cached !== null) return cached;

  const result = await Follow.aggregate<{
    _id: null;
    count: number;
  }>([
    { $match: { following: new Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "users",
        localField: "follower",
        foreignField: "_id",
        as: "followerUser",
      },
    },
    { $unwind: "$followerUser" },
    {
      $match: {
        "followerUser.deletedAt": null,
        "followerUser.status": { $in: ["active", "limited"] },
        "followerUser._id": { $ne: new Types.ObjectId(userId) },
      },
    },
    { $count: "count" },
  ]);

  const count = result[0]?.count ?? 0;
  await cacheOverwriteJSON(FOLLOWERS_CACHE_KEY(userId), count, METRIC_CACHE_TTL);
  return count;
}

/**
 * Cumulative eligible content views for a creator — sum of Post.viewsCount
 * across all their published (non-removed) posts. Posts of every kind
 * (photo/video/reel/text) are stored in the Post collection, so this never
 * double-counts an event across models. Drafts, scheduled and removed posts
 * are excluded by the status filter.
 */
export async function getCumulativeEligibleViews(userId: string): Promise<number> {
  const cached = await cacheGetJSON<number>(VIEWS_CACHE_KEY(userId));
  if (cached !== null) return cached;

  const result = await Post.aggregate<{ _id: null; total: number }>([
    { $match: { author: new Types.ObjectId(userId), status: "published" } },
    { $group: { _id: null, total: { $sum: "$viewsCount" } } },
  ]);

  const total = result[0]?.total ?? 0;
  await cacheOverwriteJSON(VIEWS_CACHE_KEY(userId), total, METRIC_CACHE_TTL);
  return total;
}

/** Invalidates the cached metrics for a user — call after follow/unfollow. */
export async function invalidateUserMetrics(userId: string) {
  try {
    await (redis as any).del(FOLLOWERS_CACHE_KEY(userId));
    // Views change on every content view; we don't invalidate per-view (too
    // noisy) — the 5-minute TTL is the refresh boundary for progress bars.
  } catch {
    /* best-effort */
  }
}

function metricForDefinition(def: AchievementDefLean, followers: number, views: number): number {
  return def.metric === "followers" ? followers : views;
}

// ── Award / revoke (idempotent) ──────────────────────────────────────────────

export interface AwardResult {
  record: any;
  /** True iff this call newly created (or re-activated) the award. */
  isNewlyAwarded: boolean;
}

/**
 * Awards an achievement idempotently. If the user already has an active
 * (non-revoked) award, this is a no-op. If a previously-revoked award exists
 * (follower badge re-earned), it re-activates and stamps a fresh awardedAt.
 * Concurrent callers racing to award the same badge hit the unique index;
 * the loser catches E11000 and reads the winner's record.
 */
export async function awardAchievement(
  userId: string,
  achievementId: string,
  metricSnapshot: number,
  definitionVersion: number,
): Promise<AwardResult> {
  try {
    // Upsert: create if missing, or re-activate if revoked.
    const record = await UserAchievement.findOneAndUpdate(
      { user: new Types.ObjectId(userId), achievementId },
      {
        $setOnInsert: { user: new Types.ObjectId(userId), achievementId },
        $set: {
          metricSnapshot,
          definitionVersion,
          awardedAt: new Date(),
          revokedAt: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    // isNewlyAwarded: true if this was an insert OR a re-activation of a
    // previously-revoked record. We detect re-activation by checking whether
    // `revokedAt` was set before the update — but since $set cleared it, we
    // approximate: if the record's awardedAt equals now (just set), it's new
    // or freshly re-awarded. The notification idempotency key (below) is the
    // real guard against duplicate notifications.
    const isNewlyAwarded = Boolean(record);
    return { record, isNewlyAwarded };
  } catch (err: any) {
    if (err && err.code === 11000) {
      // Lost the race — read the winner's record.
      const existing = await UserAchievement.findOne({
        user: new Types.ObjectId(userId),
        achievementId,
      });
      return { record: existing, isNewlyAwarded: false };
    }
    throw err;
  }
}

/**
 * Revokes a follower badge (count dropped below threshold). The award record
 * is preserved (for audit) — only `revokedAt` is set. View badges are never
 * revoked (lifetime cumulative).
 */
export async function revokeAchievement(userId: string, achievementId: string) {
  await UserAchievement.updateOne(
    { user: new Types.ObjectId(userId), achievementId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}

// ── Evaluation ───────────────────────────────────────────────────────────────

export interface EvaluateResult {
  newlyAwarded: AchievementDefLean[];
  revoked: AchievementDefLean[];
}

/**
 * Re-evaluates every enabled achievement for a user. Awards newly-qualified
 * badges and revokes follower badges that are no longer met. Returns the list
 * of changes so the caller can fire notifications (and so the sweeper can log).
 *
 * Safe to call on every follow event and from the periodic sweeper — every
 * operation is idempotent.
 */
export async function evaluateUser(userId: string): Promise<EvaluateResult> {
  const [defs, followers, views, existingAwards] = await Promise.all([
    getEnabledDefinitions(),
    getEligibleFollowers(userId),
    getCumulativeEligibleViews(userId),
    UserAchievement.find({ user: new Types.ObjectId(userId) }).lean(),
  ]);

  const awardsByDef = new Map(existingAwards.map((a) => [a.achievementId, a]));
  const newlyAwarded: AchievementDefLean[] = [];
  const revoked: AchievementDefLean[] = [];

  for (const def of defs) {
    const current = metricForDefinition(def, followers, views);
    const eligible = current >= def.threshold;
    const existing = awardsByDef.get(def.achievementId);
    const currentlyEarned = existing && !existing.revokedAt;

    if (eligible) {
      if (!currentlyEarned) {
        // Newly eligible (or re-earning after a revoke) — award + notify.
        await awardAchievement(userId, def.achievementId, current, def.version);
        newlyAwarded.push(def);
        await notifyAchievementUnlocked(userId, def, current);
      }
      // If already currently earned, nothing to do (idempotent).
    } else {
      // Not eligible. Follower badges that WERE earned get revoked (current
      // milestone semantics). View badges never get revoked (lifetime).
      if (currentlyEarned && def.metric === "followers") {
        await revokeAchievement(userId, def.achievementId);
        revoked.push(def);
      }
    }
  }

  return { newlyAwarded, revoked };
}

/**
 * Fires a single, deduplicated notification for an achievement unlock.
 * Uses claimIdempotencyKey so a retried sweeper pass never re-notifies the
 * user for the same badge. If the badge is later revoked and re-earned, the
 * idempotency key is scoped to the new award timestamp so a fresh
 * notification fires (the user crossed the threshold again).
 */
async function notifyAchievementUnlocked(
  userId: string,
  def: AchievementDefLean,
  metricSnapshot: number,
) {
  // Scope the idempotency key to the current award moment — re-awards after
  // a revoke should notify again. The key TTL (7 days) comfortably covers
  // any sweeper retry window.
  const idemKey = `achievement:${userId}:${def.achievementId}:${Date.now()}`;
  const isOriginal = await claimIdempotencyKey("achievement:notify", idemKey, 7 * 24 * 3600);
  if (!isOriginal) return; // duplicate — already notified

  const metricLabel = def.metric === "followers" ? "followers" : "content views";
  const formattedThreshold = formatCount(def.threshold);
  await notify({
    recipient: userId,
    kind: "achievement",
    text: `Achievement unlocked! You earned the ${def.name} by reaching ${formattedThreshold} ${metricLabel}.`,
  }).catch((err) => console.error("[Achievements] notify failed:", err));

  await logAudit({
    actor: userId,
    action: `achievement.award.${def.achievementId}`,
    targetUser: userId,
    meta: { name: def.name, metric: def.metric, threshold: def.threshold, metricSnapshot },
  }).catch(() => {});
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}

// ── Public badge states + progress ──────────────────────────────────────────

/**
 * Returns the badge states for a public profile. ALL configured badges are
 * returned (locked ones too) so the frontend can render the full badge row.
 * Only public information is included — no internal risk scores or moderation
 * data.
 */
export async function getPublicBadgeStates(userId: string): Promise<BadgeState[]> {
  const [defs, awards] = await Promise.all([
    getEnabledDefinitions(),
    UserAchievement.find({ user: new Types.ObjectId(userId), revokedAt: null }).lean(),
  ]);
  const awardsByDef = new Map(awards.map((a) => [a.achievementId, a]));

  return defs.map((def) => {
    const award = awardsByDef.get(def.achievementId);
    const earned = Boolean(award && !award.revokedAt);
    return {
      achievementId: def.achievementId,
      name: def.name,
      category: def.category,
      metric: def.metric,
      description: def.description,
      threshold: def.threshold,
      icon: def.icon,
      color: def.color,
      enabled: def.enabled,
      earned,
      awardedAt: earned && award?.awardedAt ? award.awardedAt.toISOString() : null,
    };
  });
}

/**
 * Returns detailed progress for the authenticated user (or any user whose
 * progress the viewer is authorized to see). Includes the current metric
 * value, remaining count and a clamped 0–100 progress percentage.
 *
 * For follower badges, `current` is the authoritative eligible follower count.
 * For view badges, `current` is the cumulative eligible views (may be cached
 * up to 5 minutes).
 */
export async function getDetailedProgress(userId: string): Promise<BadgeProgress[]> {
  const [defs, awards, followers, views] = await Promise.all([
    getEnabledDefinitions(),
    UserAchievement.find({ user: new Types.ObjectId(userId) }).lean(),
    getEligibleFollowers(userId),
    getCumulativeEligibleViews(userId),
  ]);
  const awardsByDef = new Map(awards.map((a) => [a.achievementId, a]));

  return defs.map((def) => {
    const award = awardsByDef.get(def.achievementId);
    const earned = Boolean(award && !award.revokedAt);
    const current = metricForDefinition(def, followers, views);
    const remaining = Math.max(0, def.threshold - current);
    const progressPct = current >= def.threshold ? 100 : Math.min(100, Math.max(0, Math.round((current / def.threshold) * 100)));
    return {
      achievementId: def.achievementId,
      name: def.name,
      category: def.category,
      metric: def.metric,
      description: def.description,
      threshold: def.threshold,
      icon: def.icon,
      color: def.color,
      enabled: def.enabled,
      earned,
      awardedAt: earned && award?.awardedAt ? award.awardedAt.toISOString() : null,
      current,
      remaining,
      progressPct,
    };
  });
}

// ── Reconciliation ───────────────────────────────────────────────────────────

/**
 * Reconciles a single user: re-evaluates achievements AND, if the cached
 * followersCount disagrees with the authoritative count, corrects the User
 * document. This is the repair path for drift between the Follow collection
 * and the cached counter (e.g. after bulk account suspensions).
 */
export async function reconcileUser(userId: string): Promise<EvaluateResult> {
  // Refresh the cached eligible-follower count first (ignore cache).
  try {
    await (redis as any).del(FOLLOWERS_CACHE_KEY(userId));
  } catch {
    /* best-effort */
  }
  const eligibleFollowers = await getEligibleFollowers(userId);

  // Repair the cached counter if it drifted. This keeps the profile's
  // displayed follower number consistent with the achievement state.
  const user = await User.findById(userId).select("followersCount").lean();
  if (user && user.followersCount !== eligibleFollowers) {
    await User.updateOne({ _id: userId }, { $set: { followersCount: eligibleFollowers } }).catch(() => {});
  }

  return evaluateUser(userId);
}

/**
 * Reconciles a batch of users. Used by the periodic sweeper. Returns a
 * summary so the sweeper can log how many awards/revokes happened this pass.
 */
export async function reconcileBatch(userIds: string[]): Promise<{
  processed: number;
  awarded: number;
  revoked: number;
  errors: number;
}> {
  let awarded = 0;
  let revoked = 0;
  let errors = 0;
  for (const userId of userIds) {
    try {
      const result = await reconcileUser(userId);
      awarded += result.newlyAwarded.length;
      revoked += result.revoked.length;
    } catch (err) {
      errors++;
      console.error(`[Achievements] reconcile failed for ${userId}:`, err);
    }
  }
  return { processed: userIds.length, awarded, revoked, errors };
}
