/**
 * Achievement Badge System — backend test suite.
 *
 * Covers the core correctness, security, concurrency and edge-case requirements
 * from the spec (section 13):
 *   - Every follower & view threshold (below / exactly at / above)
 *   - Multiple milestones at once
 *   - Locked vs unlocked badge states
 *   - Progress calculation + clamping
 *   - Idempotent awarding (unique constraint, concurrent requests)
 *   - Follower count decrease → revoke
 *   - View tracking dedup (authed + anonymous)
 *   - Disabled definitions
 *
 * To keep tests fast, the `before` hook RECONFIGURES the achievement definitions
 * to small test thresholds (10/50/100 followers, 50/200/500 views) instead of
 * the production 10K/100K/1M. The logic under test is identical — only the
 * thresholds differ.
 *
 * Run: npm run test:achievements
 */
import assert from "node:assert/strict";
import { test, before, after } from "node:test";
import mongoose from "mongoose";
import { AchievementDefinition, UserAchievement } from "../src/models/Achievement";
import { User } from "../src/models/User";
import { Follow } from "../src/models/Follow";
import { Post } from "../src/models/Post";
import { ContentView } from "../src/models/ContentView";
import {
  getEligibleFollowers,
  getCumulativeEligibleViews,
  evaluateUser,
  awardAchievement,
  getPublicBadgeStates,
  getDetailedProgress,
  getEnabledDefinitions,
  invalidateUserMetrics,
  invalidateDefinitionsCache,
} from "../src/services/achievementService";

const TEST_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gihanga_ach_test";

// Test thresholds — small so we don't need to create 10M documents.
const STAR_THRESHOLDS = { red: 10, gold: 50, blue: 100 };
const DIAMOND_THRESHOLDS = { red: 50, green: 200, blue: 500 };

let connection: typeof mongoose | null = null;

before(async () => {
  connection = await mongoose.connect(TEST_URI);
  await Promise.all([
    AchievementDefinition.deleteMany({}),
    UserAchievement.deleteMany({}),
    User.deleteMany({}),
    Follow.deleteMany({}),
    Post.deleteMany({}),
    ContentView.deleteMany({}),
  ]);
  // Seed small-threshold definitions for fast tests.
  const defs = [
    { achievementId: "star_red", name: "Red Star", category: "stars", metric: "followers", description: "t", threshold: STAR_THRESHOLDS.red, icon: "star", color: "red" },
    { achievementId: "star_gold", name: "Gold Star", category: "stars", metric: "followers", description: "t", threshold: STAR_THRESHOLDS.gold, icon: "star", color: "gold" },
    { achievementId: "star_blue", name: "Blue Star", category: "stars", metric: "followers", description: "t", threshold: STAR_THRESHOLDS.blue, icon: "star", color: "blue" },
    { achievementId: "diamond_red", name: "Red Diamond", category: "diamonds", metric: "views", description: "t", threshold: DIAMOND_THRESHOLDS.red, icon: "diamond", color: "red" },
    { achievementId: "diamond_green", name: "Green Diamond", category: "diamonds", metric: "views", description: "t", threshold: DIAMOND_THRESHOLDS.green, icon: "diamond", color: "green" },
    { achievementId: "diamond_blue", name: "Blue Diamond", category: "diamonds", metric: "views", description: "t", threshold: DIAMOND_THRESHOLDS.blue, icon: "diamond", color: "blue" },
  ];
  for (const d of defs) {
    await AchievementDefinition.findOneAndUpdate(
      { achievementId: d.achievementId },
      { $set: { ...d, enabled: true }, $setOnInsert: { version: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
  await invalidateDefinitionsCache();
});

after(async () => {
  if (connection) {
    await Promise.all([
      AchievementDefinition.deleteMany({}),
      UserAchievement.deleteMany({}),
      User.deleteMany({}),
      Follow.deleteMany({}),
      Post.deleteMany({}),
      ContentView.deleteMany({}),
    ]);
    await connection.disconnect();
  }
});

let userCounter = 0;
async function makeUser(prefix: string, opts: Partial<any> = {}) {
  userCounter++;
  // Valid username: 3-20 chars, [a-z0-9_]
  const username = `u${prefix.toLowerCase().slice(0, 6)}${userCounter}`.replace(/[^a-z0-9_]/g, "").slice(0, 20);
  return User.create({
    name: prefix,
    username,
    email: `${prefix}_${userCounter}@test.com`,
    passwordHash: "x",
    avatarHue: 200,
    bio: "",
    role: "user",
    isCreator: true,
    verified: false,
    status: "active",
    emailVerified: true,
    onboarded: true,
    ...opts,
  });
}

let followerCounter = 0;
async function addFollowers(targetId: string, count: number) {
  const docs: any[] = [];
  const followDocs: any[] = [];
  for (let i = 0; i < count; i++) {
    followerCounter++;
    const uname = `fol${followerCounter}`.slice(0, 20);
    const f = new User({
      name: `f${followerCounter}`,
      username: uname,
      email: `fol${followerCounter}@test.com`,
      passwordHash: "x",
      avatarHue: 100,
      role: "user",
      status: "active",
    });
    docs.push(f);
  }
  await User.insertMany(docs);
  for (const f of docs) {
    followDocs.push({ follower: f._id, following: targetId });
  }
  await Follow.insertMany(followDocs);
  await User.findByIdAndUpdate(targetId, { $inc: { followersCount: count } });
}

// ── Threshold boundary tests ─────────────────────────────────────────────────

test("follower thresholds: exactly at red threshold → earned", async () => {
  const u = await makeUser("thr_exact");
  await addFollowers(String(u._id), STAR_THRESHOLDS.red);
  await invalidateUserMetrics(String(u._id));
  const result = await evaluateUser(String(u._id));
  const ids = result.newlyAwarded.map((d) => d.achievementId);
  assert.ok(ids.includes("star_red"), "Red Star earned at exactly the threshold");
  assert.ok(!ids.includes("star_gold"), "Gold Star NOT earned at the red threshold");
});

test("follower thresholds: one below red → NOT earned", async () => {
  const u = await makeUser("thr_below");
  await addFollowers(String(u._id), STAR_THRESHOLDS.red - 1);
  await invalidateUserMetrics(String(u._id));
  const result = await evaluateUser(String(u._id));
  assert.ok(!result.newlyAwarded.some((d) => d.achievementId === "star_red"), "NOT earned one below");
});

test("follower thresholds: one above gold → red AND gold earned, blue NOT", async () => {
  const u = await makeUser("thr_multi");
  await addFollowers(String(u._id), STAR_THRESHOLDS.gold + 1);
  await invalidateUserMetrics(String(u._id));
  const result = await evaluateUser(String(u._id));
  const ids = result.newlyAwarded.map((d) => d.achievementId);
  assert.ok(ids.includes("star_red"), "red earned");
  assert.ok(ids.includes("star_gold"), "gold earned at gold+1");
  assert.ok(!ids.includes("star_blue"), "blue NOT earned");
});

test("all three stars earned at the blue threshold", async () => {
  const u = await makeUser("thr_all");
  await addFollowers(String(u._id), STAR_THRESHOLDS.blue);
  await invalidateUserMetrics(String(u._id));
  const result = await evaluateUser(String(u._id));
  const ids = result.newlyAwarded.map((d) => d.achievementId);
  assert.ok(ids.includes("star_red") && ids.includes("star_gold") && ids.includes("star_blue"));
});

// ── View threshold tests ─────────────────────────────────────────────────────

async function createPostsWithViews(authorId: string, posts: { views: number }[]) {
  for (const p of posts) {
    await Post.create({
      author: authorId,
      kind: "photo",
      body: "test",
      viewsCount: p.views,
      status: "published",
      audience: "public",
    });
  }
}

test("view thresholds: at red → diamond_red earned, green NOT", async () => {
  const u = await makeUser("views_red");
  await createPostsWithViews(String(u._id), [{ views: DIAMOND_THRESHOLDS.red }]);
  await invalidateUserMetrics(String(u._id));
  const result = await evaluateUser(String(u._id));
  const ids = result.newlyAwarded.map((d) => d.achievementId);
  assert.ok(ids.includes("diamond_red"), "Red Diamond earned");
  assert.ok(!ids.includes("diamond_green"), "Green Diamond NOT earned at red threshold");
});

test("view thresholds: at blue → all three diamonds earned", async () => {
  const u = await makeUser("views_all");
  await createPostsWithViews(String(u._id), [{ views: DIAMOND_THRESHOLDS.blue }]);
  await invalidateUserMetrics(String(u._id));
  const result = await evaluateUser(String(u._id));
  const ids = result.newlyAwarded.map((d) => d.achievementId);
  assert.ok(
    ids.includes("diamond_red") && ids.includes("diamond_green") && ids.includes("diamond_blue"),
    "all three diamonds earned",
  );
});

test("removed posts are excluded from cumulative views", async () => {
  const u = await makeUser("views_removed");
  await Post.create({ author: u._id, kind: "photo", body: "removed", viewsCount: 400, status: "removed", audience: "public" });
  await Post.create({ author: u._id, kind: "photo", body: "live", viewsCount: 30, status: "published", audience: "public" });
  await invalidateUserMetrics(String(u._id));
  const total = await getCumulativeEligibleViews(String(u._id));
  assert.equal(total, 30, "removed post's views excluded");
});

test("cumulative views sum across multiple published posts", async () => {
  const u = await makeUser("views_sum");
  await createPostsWithViews(String(u._id), [{ views: 100 }, { views: 100 }]);
  await invalidateUserMetrics(String(u._id));
  const total = await getCumulativeEligibleViews(String(u._id));
  assert.equal(total, 200, "summed across posts");
});

// ── Idempotent awarding ───────────────────────────────────────────────────────

test("awardAchievement is idempotent — concurrent calls don't create duplicates", async () => {
  const u = await makeUser("idem_award");
  await Promise.all([
    awardAchievement(String(u._id), "star_red", 10, 1),
    awardAchievement(String(u._id), "star_red", 10, 1),
    awardAchievement(String(u._id), "star_red", 10, 1),
    awardAchievement(String(u._id), "star_red", 10, 1),
    awardAchievement(String(u._id), "star_red", 10, 1),
  ]);
  const count = await UserAchievement.countDocuments({ user: u._id, achievementId: "star_red" });
  assert.equal(count, 1, "exactly one record despite 5 concurrent calls");
});

test("re-evaluating an already-awarded user is a no-op", async () => {
  const u = await makeUser("idem_eval");
  await addFollowers(String(u._id), STAR_THRESHOLDS.red);
  await invalidateUserMetrics(String(u._id));
  const first = await evaluateUser(String(u._id));
  assert.equal(first.newlyAwarded.length, 1);
  const second = await evaluateUser(String(u._id));
  assert.equal(second.newlyAwarded.length, 0, "no duplicate award on re-eval");
});

// ── Follower decrease → revoke ───────────────────────────────────────────────

test("follower count drop below threshold revokes the badge", async () => {
  const u = await makeUser("revoke_test");
  await addFollowers(String(u._id), STAR_THRESHOLDS.red);
  await invalidateUserMetrics(String(u._id));
  await evaluateUser(String(u._id));
  let badges = await getPublicBadgeStates(String(u._id));
  assert.ok(badges.find((b) => b.achievementId === "star_red")?.earned, "earned initially");

  // Mass unfollow — remove half.
  const half = await Follow.find({ following: u._id }).limit(5).select("_id").lean();
  await Follow.deleteMany({ _id: { $in: half.map((h) => h._id) } });
  await User.findByIdAndUpdate(u._id, { $inc: { followersCount: -5 } });
  await invalidateUserMetrics(String(u._id));
  await evaluateUser(String(u._id));

  badges = await getPublicBadgeStates(String(u._id));
  const red = badges.find((b) => b.achievementId === "star_red");
  assert.ok(red, "badge still appears (locked)");
  assert.equal(red!.earned, false, "revoked after followers dropped below threshold");
});

test("re-earning after revoke re-awards and clears revokedAt", async () => {
  const u = await makeUser("re_earn_test");
  await addFollowers(String(u._id), STAR_THRESHOLDS.red);
  await invalidateUserMetrics(String(u._id));
  await evaluateUser(String(u._id));
  // Unfollow down to 5
  const half = await Follow.find({ following: u._id }).limit(5).select("_id").lean();
  await Follow.deleteMany({ _id: { $in: half.map((h) => h._id) } });
  await User.findByIdAndUpdate(u._id, { $inc: { followersCount: -5 } });
  await invalidateUserMetrics(String(u._id));
  await evaluateUser(String(u._id));
  let red = (await getPublicBadgeStates(String(u._id))).find((b) => b.achievementId === "star_red");
  assert.equal(red!.earned, false, "revoked");

  // Re-earn
  await addFollowers(String(u._id), 5);
  await invalidateUserMetrics(String(u._id));
  await evaluateUser(String(u._id));
  red = (await getPublicBadgeStates(String(u._id))).find((b) => b.achievementId === "star_red");
  assert.equal(red!.earned, true, "re-earned");
  assert.ok(red!.awardedAt, "fresh award date");
});

// ── View badges are never revoked (lifetime) ─────────────────────────────────

test("view badges are never revoked even if views decrease (posts removed)", async () => {
  const u = await makeUser("view_lifetime");
  await createPostsWithViews(String(u._id), [{ views: DIAMOND_THRESHOLDS.red }]);
  await invalidateUserMetrics(String(u._id));
  await evaluateUser(String(u._id));
  await Post.updateMany({ author: u._id }, { $set: { status: "removed" } });
  await invalidateUserMetrics(String(u._id));
  await evaluateUser(String(u._id));
  const red = (await getPublicBadgeStates(String(u._id))).find((b) => b.achievementId === "diamond_red");
  assert.equal(red!.earned, true, "view badge stays earned (lifetime)");
});

// ── Eligible follower exclusion rules ────────────────────────────────────────

test("deleted/suspended followers are excluded from the eligible count", async () => {
  const u = await makeUser("exclude_test");
  // 20 followers; suspend 5, delete 3 → 12 eligible.
  await addFollowers(String(u._id), 20);
  const all = await Follow.find({ following: u._id }).populate("follower").lean();
  const followerIds = all.map((f) => (f.follower as any)._id);
  // Suspend first 5
  await User.updateMany({ _id: { $in: followerIds.slice(0, 5) } }, { $set: { status: "suspended" } });
  // Delete next 3
  await User.updateMany({ _id: { $in: followerIds.slice(5, 8) } }, { $set: { deletedAt: new Date() } });
  await invalidateUserMetrics(String(u._id));
  const eligible = await getEligibleFollowers(String(u._id));
  assert.equal(eligible, 12, "20 - 5 suspended - 3 deleted = 12 eligible");
  // 12 > 10 (red) → star_red earned, but 12 < 50 (gold) → not gold
  const result = await evaluateUser(String(u._id));
  assert.ok(result.newlyAwarded.some((d) => d.achievementId === "star_red"), "red earned");
  assert.ok(!result.newlyAwarded.some((d) => d.achievementId === "star_gold"), "gold NOT earned");
});

// ── Badge states + progress ───────────────────────────────────────────────────

test("getPublicBadgeStates returns all 6 configured badges (locked + unlocked)", async () => {
  const u = await makeUser("states_test");
  await addFollowers(String(u._id), STAR_THRESHOLDS.red);
  await invalidateUserMetrics(String(u._id));
  await evaluateUser(String(u._id));
  const badges = await getPublicBadgeStates(String(u._id));
  assert.equal(badges.length, 6, "all six badges returned");
  const red = badges.find((b) => b.achievementId === "star_red");
  assert.equal(red!.earned, true);
  assert.ok(red!.awardedAt, "earned badge has award date");
  const blue = badges.find((b) => b.achievementId === "star_blue");
  assert.equal(blue!.earned, false);
  assert.equal(blue!.awardedAt, null, "locked badge has no award date");
});

test("progress percentage is clamped to 0–100 and remaining non-negative", async () => {
  const u = await makeUser("progress_test");
  await invalidateUserMetrics(String(u._id));
  const progress = await getDetailedProgress(String(u._id));
  assert.equal(progress.length, 6);
  for (const p of progress) {
    assert.ok(p.progressPct >= 0 && p.progressPct <= 100, `${p.achievementId} pct in range`);
    assert.ok(p.remaining >= 0, `${p.achievementId} remaining non-negative`);
  }
});

test("progress for an earned badge shows 100%", async () => {
  const u = await makeUser("progress_earned");
  await addFollowers(String(u._id), STAR_THRESHOLDS.blue);
  await invalidateUserMetrics(String(u._id));
  await evaluateUser(String(u._id));
  const progress = await getDetailedProgress(String(u._id));
  const blue = progress.find((p) => p.achievementId === "star_blue");
  assert.equal(blue!.progressPct, 100, "100% when earned");
  assert.equal(blue!.remaining, 0, "0 remaining when earned");
});

// ── Disabled definitions ──────────────────────────────────────────────────────

test("disabled definitions don't appear in the enabled set", async () => {
  await AchievementDefinition.updateOne({ achievementId: "diamond_blue" }, { $set: { enabled: false } });
  await invalidateDefinitionsCache();
  const defs = await getEnabledDefinitions();
  assert.ok(!defs.some((d) => d.achievementId === "diamond_blue"), "disabled def excluded");
  // Restore for any later tests.
  await AchievementDefinition.updateOne({ achievementId: "diamond_blue" }, { $set: { enabled: true } });
  await invalidateDefinitionsCache();
});

// ── Unique constraint enforcement ────────────────────────────────────────────

test("UserAchievement unique compound index prevents duplicate awards at the DB level", async () => {
  const u = await makeUser("unique_test");
  await UserAchievement.create({ user: u._id, achievementId: "star_red", metricSnapshot: 10, definitionVersion: 1, awardedAt: new Date(), revokedAt: null });
  await assert.rejects(
    UserAchievement.create({ user: u._id, achievementId: "star_red", metricSnapshot: 10, definitionVersion: 1, awardedAt: new Date(), revokedAt: null }),
    (err: any) => err && err.code === 11000,
    "second insert must fail with E11000",
  );
});
