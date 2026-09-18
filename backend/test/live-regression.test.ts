/**
 * A4/A5 regression tests — pure decision logic + Redis-backed primitives,
 * runnable WITHOUT MongoDB (the same style as payment-regression.test.ts:
 * pure functions under test, static assertions for the DB-bound paths).
 *
 * Run: npm run test:live
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// ── Pure functions under test ───────────────────────────────────────────────
import { planSweep, MAX_DURATION_REASON, STALE_HOST_REASON, type SweepStreamInput } from "../src/lib/liveSweeper";
import { computeLiveKitTokenTtlSeconds } from "../src/lib/livekit";
import {
  resolveInteractionAccess,
  priceFor,
  txKindFor,
} from "../src/lib/paidInteractions";
import type { PaidInteractionsSettings } from "../src/models/LiveStream";

const liveRoute = readFileSync(new URL("../src/routes/v1/live/live.ts", import.meta.url), "utf8");
const signaling = readFileSync(new URL("../src/lib/liveSignaling.ts", import.meta.url), "utf8");
const walletLib = readFileSync(new URL("../src/lib/wallet.ts", import.meta.url), "utf8");
const service = readFileSync(new URL("../src/services/liveStreamService.ts", import.meta.url), "utf8");
const serverFile = readFileSync(new URL("../src/server.ts", import.meta.url), "utf8");

const PAID_ON: PaidInteractionsSettings = { enabled: true, likePrice: 2, commentPrice: 5, reactionPrice: 1 };
const PAID_OFF: PaidInteractionsSettings = { enabled: false, likePrice: 2, commentPrice: 5, reactionPrice: 1 };

const T0 = new Date("2026-01-01T12:00:00Z");
const stream = (over: Partial<SweepStreamInput>): SweepStreamInput => ({
  _id: "s1",
  status: "live",
  startedAt: T0,
  lastHeartbeatAt: T0,
  maxEndsAt: new Date(T0.getTime() + 5 * 3_600_000),
  timeWarningsSent: [],
  ...over,
});

// ── A4: sweeper planning ────────────────────────────────────────────────────

test("sweeper ends a stream whose 5h cap has been reached", () => {
  const now = new Date(T0.getTime() + 5 * 3_600_000 + 1000);
  const plan = planSweep(now, [stream({ _id: "cap" })]);
  assert.equal(plan.toEnd.length, 1);
  assert.equal(plan.toEnd[0]?.streamId, "cap");
  assert.equal(plan.toEnd[0]?.reason, MAX_DURATION_REASON);
  assert.equal(plan.toEnd[0]?.cause, "max-duration");
});

test("sweeper ends a stale stream whose heartbeat is older than the grace window", () => {
  const now = new Date(T0.getTime() + 91_000);
  const plan = planSweep(now, [stream({ _id: "stale", lastHeartbeatAt: new Date(T0.getTime() - 1000), maxEndsAt: new Date(now.getTime() + 4 * 3_600_000) })]);
  assert.equal(plan.toEnd.length, 1);
  assert.equal(plan.toEnd[0]?.cause, "stale-heartbeat");
  assert.equal(plan.toEnd[0]?.reason, STALE_HOST_REASON);
});

test("sweeper ignores already-ended streams (idempotent no-op)", () => {
  const now = new Date(T0.getTime() + 6 * 3_600_000);
  const plan = planSweep(now, [stream({ _id: "done", status: "ended" })]);
  assert.equal(plan.toEnd.length, 0);
  assert.equal(plan.warnings.length, 0);
});

test("sweeper does not end a healthy stream inside the cap", () => {
  const now = new Date(T0.getTime() + 10 * 60_000);
  const plan = planSweep(now, [stream({ _id: "ok", lastHeartbeatAt: now })]);
  assert.equal(plan.toEnd.length, 0);
});

test("sweeper emits each remaining-time warning exactly once per stream", () => {
  const nowAt30 = new Date(T0.getTime() + 4.5 * 3_600_000); // 30 min left
  const first = planSweep(nowAt30, [stream({ _id: "w", lastHeartbeatAt: nowAt30 })]);
  assert.equal(first.toEnd.length, 0);
  assert.equal(first.warnings.length, 1);
  assert.equal(first.warnings[0]?.minutesLeft, 30);

  // Re-running with the same timeWarningsSent state must NOT re-warn.
  const second = planSweep(nowAt30, [stream({ _id: "w", lastHeartbeatAt: nowAt30, timeWarningsSent: [0] })]);
  assert.equal(second.warnings.length, 0);

  // Crossing into the 5-minute mark warns again.
  const nowAt5 = new Date(T0.getTime() + 4 * 3_600_000 + 55 * 60_000);
  const third = planSweep(nowAt5, [stream({ _id: "w", lastHeartbeatAt: nowAt5, timeWarningsSent: [0] })]);
  assert.equal(third.warnings.length, 1);
  assert.equal(third.warnings[0]?.minutesLeft, 5);
});

test("cap takes precedence over a stale heartbeat (single end action, no double)", () => {
  const now = new Date(T0.getTime() + 5 * 3_600_000 + 5000);
  const plan = planSweep(now, [stream({ _id: "both", lastHeartbeatAt: T0 })]);
  assert.equal(plan.toEnd.length, 1);
  assert.equal(plan.toEnd[0]?.cause, "max-duration");
});

test("a stream missing lastHeartbeatAt falls back to startedAt for staleness", () => {
  const now = new Date(T0.getTime() + 95_000);
  const plan = planSweep(now, [stream({ _id: "nofbeat", lastHeartbeatAt: undefined, maxEndsAt: new Date(now.getTime() + 3_600_000) })]);
  assert.equal(plan.toEnd.length, 1);
  assert.equal(plan.toEnd[0]?.cause, "stale-heartbeat");
});

// ── A4: shared endStream service wiring (static) ────────────────────────────

test("every end path funnels through the single endStream() service", () => {
  for (const file of [liveRoute, signaling]) {
    assert.match(file, /endStream\(/);
  }
  // The service itself owns the atomic guard + idempotency.
  assert.match(service, /findOneAndUpdate\(\s*\{ _id: streamId, status: "live" \}/);
});

test("the sweeper is started by the server bootstrap", () => {
  assert.match(serverFile, /startLiveSweeper\(\)/);
});

test("POST /live/start persists maxEndsAt from the env-overridable cap", () => {
  assert.match(liveRoute, /maxEndsAt/);
  assert.match(liveRoute, /MAX_LIVE_DURATION_MS/);
});

// ── A4: token TTL can never outlive the cap ─────────────────────────────────

test("livekit token TTL clamps to remaining stream time (with 60s join grace)", () => {
  assert.equal(computeLiveKitTokenTtlSeconds(10 * 60_000), 660);
  assert.equal(computeLiveKitTokenTtlSeconds(5 * 3_600_000), 5 * 3_600 + 60);
});

test("livekit token TTL never exceeds the 6h ceiling and never drops below 60s", () => {
  assert.equal(computeLiveKitTokenTtlSeconds(Number.MAX_SAFE_INTEGER), 6 * 60 * 60);
  assert.equal(computeLiveKitTokenTtlSeconds(-999_999), 60);
  assert.equal(computeLiveKitTokenTtlSeconds(0), 60);
});

test("token minting passes the clamped TTL", () => {
  assert.match(liveRoute, /computeLiveKitTokenTtlSeconds\(remainingMs\)/);
});

// ── A5: paid interaction access resolution ─────────────────────────────────

const baseAccess = {
  streamHostId: "host1",
  streamModeratorIds: ["mod1"],
  streamMutedIds: ["mute1"],
  streamBannedIds: ["ban1"],
  streamStatus: "live",
  paidInteractions: PAID_ON,
  viewerId: "viewer1",
  viewerCanModerate: false,
};

test("paid interactions disabled -> everyone interacts free", () => {
  const r = resolveInteractionAccess({ ...baseAccess, kind: "comment", paidInteractions: PAID_OFF });
  assert.equal(r.access, "free");
  assert.equal(r.price, 0);
});

test("paid interactions enabled -> plain viewer pays the DB price", () => {
  for (const kind of ["like", "comment", "reaction"] as const) {
    const r = resolveInteractionAccess({ ...baseAccess, kind });
    assert.equal(r.access, "paid");
    assert.equal(r.price, priceFor(kind, PAID_ON));
  }
});

test("host, stream moderators and staff moderators interact free even when paid mode is on", () => {
  assert.equal(resolveInteractionAccess({ ...baseAccess, kind: "like", viewerId: "host1" }).access, "free");
  assert.equal(resolveInteractionAccess({ ...baseAccess, kind: "like", viewerId: "mod1" }).access, "free");
  assert.equal(resolveInteractionAccess({ ...baseAccess, kind: "like", viewerCanModerate: true }).access, "free");
});

test("muted and banned viewers are blocked BEFORE any charge", () => {
  const muted = resolveInteractionAccess({ ...baseAccess, kind: "comment", viewerId: "mute1" });
  assert.equal(muted.access, "blocked");
  assert.equal(muted.reason, "muted");
  const banned = resolveInteractionAccess({ ...baseAccess, kind: "comment", viewerId: "ban1" });
  assert.equal(banned.access, "blocked");
  assert.equal(banned.reason, "banned");
});

test("ended streams block all paid interactions", () => {
  const r = resolveInteractionAccess({ ...baseAccess, kind: "like", streamStatus: "ended" });
  assert.equal(r.access, "blocked");
  assert.equal(r.reason, "ended");
});

test("a zero price means free even when the toggle is on", () => {
  const freePriced: PaidInteractionsSettings = { enabled: true, likePrice: 0, commentPrice: 0, reactionPrice: 0 };
  const r = resolveInteractionAccess({ ...baseAccess, kind: "like", paidInteractions: freePriced });
  assert.equal(r.access, "free");
});

test("transaction kinds map correctly for wallet history", () => {
  assert.equal(txKindFor("like"), "live_like");
  assert.equal(txKindFor("comment"), "live_comment");
  assert.equal(txKindFor("reaction"), "live_reaction");
});

// ── A5: money safety (static analysis of the DB-bound paths) ────────────────

test("gift route spends through the atomic conditional debit, not check-then-debit", () => {
  assert.match(liveRoute, /debitWalletAtomic\(/);
  assert.doesNotMatch(liveRoute, /senderWallet\.kingdomPoints < amount/);
});

test("atomic debit refuses overdrafts and frozen wallets in one conditional update", () => {
  assert.match(walletLib, /frozen: \{ \$ne: true \}, \[balanceField\]: \{ \$gte: amount \}/);
  assert.match(walletLib, /\$inc: \{ \[balanceField\]: -amount \}/);
});

test("a failure after the debit writes a compensating refund (all-or-nothing)", () => {
  assert.match(liveRoute, /Refund — gift to/);
  assert.match(readFileSync(new URL("../src/lib/paidInteractions.ts", import.meta.url), "utf8"), /Refund — paid/);
});

test("paid socket events exist and free event names are preserved", () => {
  assert.match(signaling, /socket\.on\("live:paid-chat"/);
  assert.match(signaling, /socket\.on\("live:paid-react"/);
  assert.match(signaling, /socket\.on\("live:chat", handleLiveChat\)/);
  assert.match(signaling, /socket\.on\("live:react", handleLiveReact\)/);
  assert.match(signaling, /live:payment-failed/);
});

test("paid settings are exposed via PATCH /live/:id/settings with price bounds", () => {
  assert.match(liveRoute, /paidInteractions/);
  assert.match(liveRoute, /PAID_INTERACTION_BOUNDS/);
});

test("earnings endpoint includes the paid like/comment/reaction breakdown", () => {
  assert.match(liveRoute, /paidInteractions: \{/);
  assert.match(liveRoute, /"live_like", "live_comment", "live_reaction"/);
});

test("late joiners receive a co-host snapshot on live:join", () => {
  assert.match(signaling, /live:co-host:snapshot/);
});
