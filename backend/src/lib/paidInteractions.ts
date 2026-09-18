import { LiveStream, PaidInteractionsSettings } from "../models/LiveStream";
import { User } from "../models/User";
import { Wallet } from "../models/Wallet";
import { Transaction } from "../models/Transaction";
import { applyLedgerEntry, debitWalletAtomic } from "./wallet";
import { claimIdempotencyKey, rateLimitHits } from "./redis";
import {
  PAID_INTERACTION_BOUNDS,
  PAID_INTERACTION_DEFAULTS,
  PAID_INTERACTIONS_SETTING_KEY,
} from "./liveConfig";
import { Setting } from "../models/Setting";

/**
 * Server-authoritative paid live interactions (A5).
 *
 * Interpretation implemented (as pinned by the engineering brief):
 * "moderators' live streams" = streams hosted by users whose role is
 * moderator/admin/superadmin (staff hosts). The feature is a per-stream,
 * host-controlled monetisation setting — defaulting ON for staff-hosted
 * streams and OFF for everyone else — with staff-settable global price
 * defaults via the existing Setting model.
 *
 * Guarantees:
 *  - the price ALWAYS comes from the DB (client-sent prices are ignored),
 *  - the debit is a single conditional findOneAndUpdate (no overdraft, no
 *    double-spend across concurrent requests),
 *  - every duplicate within the idempotency window charges exactly once,
 *  - muted/banned users are rejected BEFORE any money moves,
 *  - host/moderators/staff with moderation rights interact for free,
 *  - a failure after the debit writes a compensating refund.
 */

export type PaidInteractionKind = "like" | "comment" | "reaction";

export type PaymentFailureReason =
  | "disabled"
  | "insufficient"
  | "frozen"
  | "muted"
  | "banned"
  | "rate-limited"
  | "ended"
  | "not-configured";

export interface PaidInteractionFailure {
  ok: false;
  reason: PaymentFailureReason;
  message: string;
}

export interface PaidInteractionSuccess {
  ok: true;
  price: number;
  remainingPoints: number;
  duplicate: boolean;
}

export type PaidInteractionResult = PaidInteractionSuccess | PaidInteractionFailure;

/** Staff-settable global defaults (Setting model, category "features"). */
export async function getPaidInteractionDefaults(): Promise<{
  likePrice: number;
  commentPrice: number;
  reactionPrice: number;
}> {
  const setting = await Setting.findOne({ key: PAID_INTERACTIONS_SETTING_KEY }).lean();
  const value = setting?.value as Partial<PaidInteractionsSettings> | undefined;
  return {
    likePrice: clampPrice(value?.likePrice, PAID_INTERACTION_DEFAULTS.likePrice, PAID_INTERACTION_BOUNDS.maxLikePrice),
    commentPrice: clampPrice(value?.commentPrice, PAID_INTERACTION_DEFAULTS.commentPrice, PAID_INTERACTION_BOUNDS.maxCommentPrice),
    reactionPrice: clampPrice(value?.reactionPrice, PAID_INTERACTION_DEFAULTS.reactionPrice, PAID_INTERACTION_BOUNDS.maxReactionPrice),
  };
}

function clampPrice(raw: unknown, fallback: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < PAID_INTERACTION_BOUNDS.minPrice) return fallback;
  return Math.min(Math.floor(n), max);
}

export function priceFor(kind: PaidInteractionKind, settings: PaidInteractionsSettings): number {
  switch (kind) {
    case "like":
      return Math.max(0, Math.floor(settings.likePrice));
    case "comment":
      return Math.max(0, Math.floor(settings.commentPrice));
    case "reaction":
      return Math.max(0, Math.floor(settings.reactionPrice));
  }
}

export function txKindFor(kind: PaidInteractionKind): "live_like" | "live_comment" | "live_reaction" {
  return kind === "like" ? "live_like" : kind === "comment" ? "live_comment" : "live_reaction";
}

/**
 * Pure decision helper: can this user perform this interaction for free,
 * must they pay, or are they blocked outright? Tested without any I/O.
 */
export function resolveInteractionAccess(input: {
  kind: PaidInteractionKind;
  streamHostId: string;
  streamModeratorIds: string[];
  streamMutedIds: string[];
  streamBannedIds: string[];
  streamStatus: string;
  paidInteractions: PaidInteractionsSettings;
  viewerId: string;
  viewerCanModerate: boolean;
}): { access: "free" | "paid" | "blocked"; reason?: PaymentFailureReason; price: number } {
  const {
    kind,
    streamHostId,
    streamModeratorIds,
    streamMutedIds,
    streamBannedIds,
    streamStatus,
    paidInteractions,
    viewerId,
    viewerCanModerate,
  } = input;

  if (streamStatus !== "live") return { access: "blocked", reason: "ended", price: 0 };
  if (streamBannedIds.some((id) => String(id) === viewerId)) {
    return { access: "blocked", reason: "banned", price: 0 };
  }
  // Muted users may not comment; likes/reactions from muted users are also
  // rejected so a mute is a real moderation lever. Host/mods are exempt.
  const isHost = String(streamHostId) === viewerId;
  const isModerator = streamModeratorIds.some((id) => String(id) === viewerId);
  if (!isHost && !isModerator && !viewerCanModerate && streamMutedIds.some((id) => String(id) === viewerId)) {
    return { access: "blocked", reason: "muted", price: 0 };
  }

  const price = priceFor(kind, paidInteractions);
  if (!paidInteractions.enabled || price <= 0) return { access: "free", price: 0 };
  if (isHost || isModerator || viewerCanModerate) return { access: "free", price: 0 };
  return { access: "paid", price };
}

export interface ChargePaidInteractionInput {
  streamId: string;
  userId: string;
  kind: PaidInteractionKind;
  /** Client-supplied idempotency key; a random one is minted when missing. */
  idempotencyKey?: string;
  /** Viewer's platform role (staff interact free). */
  viewerRole?: string;
  /** Viewer's staff moderation permission flag, when authenticated as staff. */
  viewerCanModerate?: boolean;
  /** Pre-fetched stream document (avoids a second query on the socket path). */
  stream?: unknown;
}

const RATE_LIMIT_MAX = 40; // paid interactions per user per stream per minute
const RATE_LIMIT_WINDOW_S = 60;
const IDEMPOTENCY_WINDOW_S = 300;

/**
 * Charges one paid interaction. On success the caller still emits the
 * chat/reaction event itself (so the emit order matches the existing free
 * path); this function only owns validation + money movement + idempotency.
 */
export async function chargePaidInteraction(
  input: ChargePaidInteractionInput,
): Promise<PaidInteractionResult> {
  const { streamId, userId, kind } = input;

  const stream =
    (input.stream as InstanceType<typeof LiveStream> | undefined) ?? (await LiveStream.findById(streamId));
  if (!stream) return failure("ended", "This stream is no longer live.");
  if (stream.status !== "live") return failure("ended", "This stream has ended.");

  const viewer = await User.findById(userId).select("role").lean();
  const viewerRole = input.viewerRole ?? viewer?.role ?? "user";
  const canModeratePlatform =
    input.viewerCanModerate ?? (viewerRole === "moderator" || viewerRole === "admin" || viewerRole === "superadmin");

  const access = resolveInteractionAccess({
    kind,
    streamHostId: String(stream.host),
    streamModeratorIds: stream.moderators.map((m) => String(m)),
    streamMutedIds: stream.mutedUsers.map((m) => String(m)),
    streamBannedIds: stream.bannedUsers.map((b) => String(b)),
    streamStatus: stream.status,
    paidInteractions: stream.paidInteractions,
    viewerId: userId,
    viewerCanModerate: canModeratePlatform,
  });

  if (access.access === "blocked") {
    const messages: Record<PaymentFailureReason, string> = {
      banned: "You're banned from this stream.",
      muted: "You've been muted in this stream.",
      ended: "This stream has ended.",
      disabled: "Paid interactions are disabled for this stream.",
      insufficient: "Not enough Kingdom Points.",
      frozen: "Your wallet is frozen.",
      "rate-limited": "Slow down — too many interactions.",
      "not-configured": "Paid interactions are not configured.",
    };
    return failure(access.reason ?? "disabled", messages[access.reason ?? "disabled"]);
  }
  if (access.access === "free") {
    return { ok: true, price: 0, remainingPoints: -1, duplicate: false };
  }

  const price = access.price;

  // Idempotency — duplicates inside the window are no-ops (not failures).
  const key = input.idempotencyKey?.trim() || `${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  const claimed = await claimIdempotencyKey(`live:${streamId}:${kind}`, key, IDEMPOTENCY_WINDOW_S);
  if (!claimed) {
    const wallet = await Wallet.findOne({ user: userId }).lean();
    return { ok: true, price, remainingPoints: wallet?.kingdomPoints ?? 0, duplicate: true };
  }

  const allowed = await rateLimitHits(`live-paid:${streamId}`, userId, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_S);
  if (!allowed) return failure("rate-limited", "Slow down — too many interactions.");

  // ── Money movement ─────────────────────────────────────────────────────────
  const hostId = String(stream.host);
  const debit = await debitWalletAtomic({
    userId,
    amount: price,
    kind: txKindFor(kind),
    label: paidLabel(kind, streamId),
    toBalance: "kingdomPoints",
    relatedLive: streamId,
  });

  if (!debit.ok) {
    if (debit.reason === "frozen") return failure("frozen", "Your wallet is frozen.");
    if (debit.reason === "not-found") {
      // No wallet at all => zero balance.
      await Wallet.create({ user: userId }).catch(() => {});
      return failure("insufficient", "Not enough Kingdom Points.");
    }
    return failure("insufficient", "Not enough Kingdom Points.");
  }

  // Credit the host (minus an optional platform fee). Failure here refunds
  // the viewer so the operation stays all-or-nothing.
  try {
    const feeBps = await getPlatformFeeBps();
    const feePoints = feeBps > 0 ? Math.floor((price * feeBps) / 10_000) : 0;
    const hostCredit = price - feePoints;

    if (hostCredit > 0) {
      await applyLedgerEntry({
        userId: hostId,
        kind: txKindFor(kind),
        amount: hostCredit,
        label: hostCreditLabel(kind),
        toBalance: "kingdomPoints",
        relatedLive: streamId,
      });
    }
    if (feePoints > 0) {
      const hostWallet = await Wallet.findOne({ user: hostId });
      if (hostWallet) {
        await Transaction.create({
          wallet: hostWallet._id,
          user: hostId,
          kind: "fee",
          amount: feePoints,
          label: `Platform fee on a paid ${kind}`,
          status: "completed",
          relatedLive: streamId,
        });
      }
    }

    return { ok: true, price, remainingPoints: debit.remainingPoints, duplicate: false };
  } catch (err) {
    // Compensating refund — the viewer must not pay for a failed interaction.
    await applyLedgerEntry({
      userId,
      kind: txKindFor(kind),
      amount: price,
      label: `Refund — paid ${kind} failed`,
      toBalance: "kingdomPoints",
      relatedLive: streamId,
    }).catch(() => {});
    console.error("[chargePaidInteraction] host credit failed; viewer refunded:", err);
    return failure("not-configured", "The interaction could not be completed — you were not charged.");
  }
}

async function getPlatformFeeBps(): Promise<number> {
  const setting = await Setting.findOne({ key: "live_paid_interactions_fee_bps" }).lean();
  const n = Number((setting?.value as { bps?: number } | undefined)?.bps ?? 0);
  return Number.isFinite(n) && n >= 0 && n <= 5_000 ? Math.floor(n) : 0;
}

function failure(reason: PaymentFailureReason, message: string): PaidInteractionFailure {
  return { ok: false, reason, message };
}

function paidLabel(kind: PaidInteractionKind, streamId: string): string {
  return `Paid ${kind} on live ${streamId}`;
}

function hostCreditLabel(kind: PaidInteractionKind): string {
  return `Earning from a paid ${kind}`;
}

export { PAID_INTERACTION_BOUNDS, PAID_INTERACTION_DEFAULTS };
