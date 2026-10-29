/**
 * ContentModerationService — THE single pipeline every publishing path goes
 * through. Routes never call providers directly; they call this service.
 *
 * Lifecycle (see docs/MODERATION_SETUP.md for the full diagram):
 *   authenticate -> validate -> quarantine media -> run checks ->
 *   combine -> decide -> apply -> audit -> notify
 *
 * Publication requires an APPROVED result. Configured provider failures stay
 * fail-closed; when no visual provider is configured at all, the explicit
 * allowUnscannedMedia fallback can publish verified uploads after caption checks,
 * with the absence of visual screening recorded for operators.
 */

import crypto from "crypto";
import { Types } from "mongoose";
import { Post } from "../../models/Post";
import { Story } from "../../models/Story";
import { Comment } from "../../models/Comment";
import { Media, IMedia } from "../../models/Media";
import { ModerationRecord, IModerationRecord } from "../../models/ModerationRecord";
import { ModerationJob } from "../../models/ModerationJob";
import { User } from "../../models/User";
import { Follow } from "../../models/Follow";
import { Hashtag } from "../../models/Hashtag";
import { getIO, emitToUser } from "../../lib/socket";
import { notify } from "../../lib/notify";
import { notifyStaff } from "../../lib/staffNotify";
import { logAudit } from "../../utils/auditLogger";
import { getModerationConfig } from "../../lib/moderation/config";
import {
  ModerationResult,
  ModerateTextInput,
  ProviderOutcome,
  CategoryAssessment,
  ContentSurface,
} from "../../lib/moderation/types";
import { combineWithConfig } from "../../lib/moderation/decisionEngine";
import {
  prohibitedTermHit,
  userFailedMessage,
  userReviewMessage,
  categoryAction,
  AUTO_REJECT_CATEGORIES,
} from "../../lib/moderation/policy";
import { textCapableProviders, imageCapableProviders } from "../../lib/moderation/providers";
import {
  ModerationProvider,
  errorOutcome,
  withRetry,
} from "../../lib/moderation/providers/types";
import { enqueueModerationJob, queueStats } from "./moderationQueue";
import {
  planFrameSamplesFromConfig,
  cloudinaryFrameUrl,
  extractFramesLocally,
  probeVideoDurationSeconds,
} from "./videoFrameSampler";
import { quarantineRoot } from "../../middleware/upload";
import fs from "fs";
import path from "path";

const AUTHOR_FIELDS = "name username avatarHue avatarUrl isCreator verified isLive";
let loggedUnscannedMediaFallback = false;

/**
 * If no visual provider is configured at all, keep the social publishing flow
 * usable: captions still pass through the local text policy (and any configured
 * text provider), uploaded media must resolve to a platform Media record, and
 * provider failures are NOT treated this way. The moderation audit records the
 * missing visual check so an operator can add OpenAI/Vision later.
 */
function approvedWithoutVisualProvider(textResult: ModerationResult): ModerationResult {
  return {
    ...textResult,
    decision: "APPROVED",
    error: "No visual moderation provider is configured; caption checks were applied and media was published without visual AI scanning.",
  };
}

function logUnscannedMediaFallback() {
  if (loggedUnscannedMediaFallback) return;
  loggedUnscannedMediaFallback = true;
  console.warn(
    "[Moderation][WARN] No image-capable provider is configured. Verified uploaded media can publish after caption checks, without visual AI scanning. Configure OpenAI Moderation or Google Cloud Vision to enable visual checks.",
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hash helpers (safe caching / duplicate-scan avoidance)
// ────────────────────────────────────────────────────────────────────────────

export function hashBytes(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function hashText(text: string): string {
  return crypto.createHash("sha256").update(text.normalize("NFKC")).digest("hex");
}

/**
 * Looks for a recent APPROVED record for the SAME content hash from the SAME
 * owner (default scope). Only APPROVED decisions are ever reused — a previous
 * rejection always re-runs, so a user cannot learn/inherit state across
 * attempts. TTL from config prevents stale cache poisoning.
 */
async function findReusableApproval(
  mediaHash: string,
  ownerId?: string,
): Promise<IModerationRecord | null> {
  const config = getModerationConfig();
  if (config.hashTtlHours <= 0) return null;
  const since = new Date(Date.now() - config.hashTtlHours * 3600_000);
  const query: Record<string, unknown> = {
    mediaHash,
    decision: "APPROVED",
    criticalEscalation: false,
    createdAt: { $gte: since },
  };
  if (config.hashScope === "owner") query.author = ownerId ? new Types.ObjectId(ownerId) : undefined;
  if (config.hashScope === "owner" && !ownerId) return null;
  return ModerationRecord.findOne(query).sort({ createdAt: -1 });
}

// ────────────────────────────────────────────────────────────────────────────
// Provider execution
// ────────────────────────────────────────────────────────────────────────────

function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  // The timer is cleared as soon as the race settles: a dangling timer would
  // keep the event loop alive for the full timeout after every successful call.
  let timer: NodeJS.Timeout | undefined;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function callProvider(
  provider: ModerationProvider,
  fn: () => Promise<CategoryAssessment[]>,
): Promise<ProviderOutcome> {
  const config = getModerationConfig();
  const started = Date.now();
  try {
    const categories = await runWithTimeout(
      withRetry(fn, { maxRetries: config.maxRetries, label: provider.id }),
      config.timeoutMs * (config.maxRetries + 1),
      provider.id,
    );
    // Timeouts and errors THROW — reaching here means the call succeeded.
    // The verdict is POLICY-aware (not "any nonzero score" — providers like
    // OpenAI return a score for every category, so raw non emptiness would
    // flag literally everything): "flagged" when a category crosses a
    // threshold, or when a SEVERE category shows an elevated-but-sub-
    // threshold signal (suspicion bound = 60% of the review threshold).
    const suspicionBound = config.reviewThreshold * 0.6;
    const flagged = categories.some((c) => {
      const action = categoryAction(c, { review: config.reviewThreshold, block: config.blockThreshold });
      if (action !== "pass") return true;
      return AUTO_REJECT_CATEGORIES.has(c.category) && c.score >= suspicionBound;
    });
    return {
      providerId: provider.id,
      verdict: flagged ? "flagged" : "safe",
      categories,
      latencyMs: Date.now() - started,
    };
  } catch (err: any) {
    if (/timed out/i.test(String(err?.message))) {
      const outcome = errorOutcome(provider.id, err);
      outcome.error = "Provider request timed out";
      outcome.latencyMs = Date.now() - started;
      return outcome;
    }
    return { ...errorOutcome(provider.id, err), latencyMs: Date.now() - started };
  }
}

/** Local prohibited-terms pass — cheap, synchronous, zero-network. */
function localTermsOutcome(text: string): ProviderOutcome | null {
  const hit = prohibitedTermHit(text);
  if (!hit) return null;
  return {
    providerId: "local-policy",
    verdict: "flagged",
    categories: [{ category: "sexual_content", score: 0.99, providerLabel: "local.prohibited_term" }],
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Core: text moderation (synchronous, fast)
// ────────────────────────────────────────────────────────────────────────────

export async function moderateText(input: ModerateTextInput): Promise<ModerationResult> {
  const config = getModerationConfig();
  if (!config.enabled) {
    return {
      decision: "APPROVED",
      categories: [],
      severity: "low",
      criticalEscalation: false,
      providerOutcomes: [],
    };
  }

  const outcomes: ProviderOutcome[] = [];

  // Cheap local prohibited-term pass always runs first (zero network).
  const local = localTermsOutcome(input.text);
  if (local) outcomes.push(local);

  // AI providers when configured. If a provider call fails/times out, its
  // error outcome flows into the engine and fail-closed semantics apply.
  const providers = textCapableProviders();
  for (const provider of providers) {
    outcomes.push(
      await callProvider(provider, () => provider.moderateText({ text: input.text, surface: input.surface })),
    );
  }

  if (providers.length === 0) {
    // DEGRADED MODE — no text-capable AI provider is configured. The local
    // prohibited-terms policy is the active text check (documented in
    // MODERATION_SETUP.md); MEDIA still fails closed to human review because
    // no provider can verify it. This keeps local development usable while
    // never silently trusting unverifiable media.
    if (outcomes.length === 0) {
      return {
        decision: "APPROVED",
        categories: [],
        severity: "low",
        criticalEscalation: false,
        providerOutcomes: [],
      };
    }
    return combineWithConfig(outcomes);
  }

  return combineWithConfig(outcomes);
}

// ────────────────────────────────────────────────────────────────────────────
// Core: image moderation (synchronous when bytes/URL available)
// ────────────────────────────────────────────────────────────────────────────

export async function moderateImageByBuffer(
  buffer: Buffer,
  surface: ContentSurface,
  ownerId?: string,
  mimeType = "image/jpeg",
): Promise<ModerationResult> {
  const config = getModerationConfig();
  if (!config.enabled) {
    return { decision: "APPROVED", categories: [], severity: "low", criticalEscalation: false, providerOutcomes: [] };
  }

  const mediaHash = hashBytes(buffer);

  // Safe reuse of an earlier approval for byte-identical media.
  const reusable = await findReusableApproval(mediaHash, ownerId);
  if (reusable) {
    return {
      decision: "APPROVED",
      categories: [],
      severity: "low",
      criticalEscalation: false,
      providerOutcomes: [
        {
          providerId: "hash-cache",
          verdict: "safe",
          categories: [],
          cached: true,
        },
      ],
    };
  }

  const outcomes: ProviderOutcome[] = [];
  for (const provider of imageCapableProviders()) {
    if (provider.capabilities.includes("image")) {
      outcomes.push(
        await callProvider(provider, () => provider.moderateImage({ buffer, mimeType, surface })),
      );
    }
  }

  const result = combineWithConfig(outcomes);
  // Remember the hash so the record can be reused later.
  (result as any).mediaHash = mediaHash;
  return result;
}

export async function moderateImageByUrl(
  url: string,
  surface: ContentSurface,
  ownerId?: string,
): Promise<ModerationResult> {
  const config = getModerationConfig();
  if (!config.enabled) {
    return { decision: "APPROVED", categories: [], severity: "low", criticalEscalation: false, providerOutcomes: [] };
  }

  const outcomes: ProviderOutcome[] = [];
  for (const provider of imageCapableProviders()) {
    outcomes.push(await callProvider(provider, () => provider.moderateImage({ url, surface })));
  }
  return combineWithConfig(outcomes);
}

// ────────────────────────────────────────────────────────────────────────────
// Records + applying decisions
// ────────────────────────────────────────────────────────────────────────────

export interface AssessmentContext {
  contentType: IModerationRecord["contentType"];
  contentId?: string;
  authorId?: string;
  surface?: ContentSurface;
  mediaIds?: string[];
  mediaHash?: string;
}

export async function persistAssessment(
  context: AssessmentContext,
  result: ModerationResult,
): Promise<IModerationRecord> {
  return ModerationRecord.create({
    contentType: context.contentType,
    contentId: context.contentId ? new Types.ObjectId(context.contentId) : undefined,
    author: context.authorId ? new Types.ObjectId(context.authorId) : undefined,
    surface: context.surface,
    decision: result.decision,
    status: decisionToStatus(result.decision),
    severity: result.severity,
    criticalEscalation: result.criticalEscalation,
    categories: result.categories.map((c) => ({
      category: c.category,
      score: c.score,
      providerLabel: c.providerLabel,
    })),
    providerOutcomes: result.providerOutcomes,
    mediaHash: context.mediaHash ?? (result as any).mediaHash,
    mediaIds: context.mediaIds?.map((id) => new Types.ObjectId(id)),
    userMessage: result.userMessage,
    error: result.error,
    decidedAt: new Date(),
  });
}

export function decisionToStatus(decision: ModerationResult["decision"]): string {
  switch (decision) {
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "PENDING_REVIEW":
      return "pending_review";
    case "FAILED":
      return "failed";
    default:
      return "processing";
  }
}

/**
 * Publishes a post — the side effects that USED to live in the create route
 * now happen only on APPROVED (or staff approval). This is the single place
 * a post becomes publicly visible.
 */
export async function publishPost(postId: string): Promise<void> {
  const post = await Post.findById(postId);
  if (!post || post.status === "published") return;

  post.status = "published";
  post.moderation = {
    ...(post.moderation as any),
    status: "approved",
    updatedAt: new Date(),
  };
  await post.save();

  await User.findByIdAndUpdate(post.author, { $inc: { postsCount: 1 } });

  if (post.tags.length) {
    await Promise.all(
      post.tags.map((tag) =>
        Hashtag.findOneAndUpdate(
          { tag },
          { $inc: { postsCount: 1, trend: 1 } },
          { upsert: true, new: true, setDefaults: true },
        ),
      ),
    );
  }

  const populated = await post.populate("author", AUTHOR_FIELDS);
  const responsePost = { ...populated.toObject(), liked: false, bookmarked: false, followingAuthor: false };
  if (responsePost.audience === "public") {
    getIO()?.emit("post:created", responsePost);
  } else if (responsePost.audience === "followers") {
    const followers = await Follow.find({ following: post.author }).select("follower").lean();
    for (const follower of followers) emitToUser(String(follower.follower), "post:created", responsePost);
    emitToUser(String(post.author), "post:created", responsePost);
  } else {
    emitToUser(String(post.author), "post:created", responsePost);
  }
}

/** Critical (CSAM-protocol) escalation — staff-only, no user-facing details. */
async function escalateCritical(record: IModerationRecord, context: AssessmentContext) {
  await notifyStaff(
    "all",
    "CRITICAL safety escalation: a moderation record has been flagged under the critical-content protocol. Access it in the moderation dashboard immediately.",
    { recordId: String(record._id), contentType: context.contentType },
  );
  await logAudit({
    actor: context.authorId ?? "system",
    action: "moderation.critical_escalation",
    targetId: String(record._id),
    meta: { contentType: context.contentType, contentId: context.contentId },
  });
}

async function notifyOutcome(record: IModerationRecord, recipientId: string, relatedPostId?: string) {
  const messages: Record<string, string | undefined> = {
    approved: undefined, // published posts are their own signal — no spam
    rejected: record.userMessage || "Your content could not be published.",
    pending_review: userReviewMessage(),
    failed: userFailedMessage(),
  };
  const text = messages[record.status];
  if (!text) return;
  await notify({
    recipient: recipientId,
    kind: "system",
    text,
    ...(relatedPostId ? { relatedPost: relatedPostId } : {}),
  }).catch(() => undefined);
}

// ────────────────────────────────────────────────────────────────────────────
// Public API: content-type specific assessors
// ────────────────────────────────────────────────────────────────────────────

export interface AssessPostInput {
  postId: string;
  authorId: string;
  body: string;
  kind: "photo" | "video" | "reel" | "text";
  mediaUrls?: string[];
  mediaKeys?: string[];
}

/**
 * Entry point used by POST /posts AFTER the post document is created with
 * status "processing". Text is checked synchronously; images synchronously
 * (single image) or via the queue; videos ALWAYS via the queue.
 */
export async function assessPost(input: AssessPostInput): Promise<ModerationResult> {
  const config = getModerationConfig();
  const isVideo = input.kind === "video" || input.kind === "reel";
  const hasMedia = input.kind !== "text";

  // 1. Synchronous text check (caption/body).
  const textResult = await moderateText({ text: input.body || "", surface: input.kind === "reel" ? "reel" : "post" });

  // Rejections stand immediately.
  if (textResult.decision === "REJECTED" || textResult.decision === "PENDING_REVIEW") {
    const record = await persistAssessment(
      { contentType: "post", contentId: input.postId, authorId: input.authorId, surface: "post" },
      textResult,
    );
    await applyPostDecision(input.postId, textResult, record);
    return textResult;
  }

  // 2. Media checks.
  if (hasMedia) {
    const mediaDocs = await resolveMediaDocs(input.mediaUrls ?? [], input.mediaKeys ?? []);

    // Do not leave verified uploads permanently author-only merely because no
    // visual moderation provider is configured on this deployment. The caption
    // above has already passed the local text policy (and any configured text
    // provider); this fallback is NEVER used when a configured provider errors.
    // Media must resolve to platform-owned records before it can be approved.
    if (
      textResult.decision === "APPROVED" &&
      getModerationConfig().allowUnscannedMedia &&
      imageCapableProviders().length === 0 &&
      mediaDocs.length > 0
    ) {
      logUnscannedMediaFallback();
      const fallbackResult = approvedWithoutVisualProvider(textResult);
      const record = await persistAssessment(
        {
          contentType: "post",
          contentId: input.postId,
          authorId: input.authorId,
          surface: "post",
          mediaIds: mediaDocs.map((media) => String(media._id)),
          mediaHash: mediaDocs[0]?.contentHash,
        },
        fallbackResult,
      );
      await applyPostDecision(input.postId, fallbackResult, record);
      return fallbackResult;
    }

    if (isVideo) {
      // Videos: always async (frame sampling). Content stays "processing".
      const enqueue = await enqueueModerationJob({
        jobKey: `post:video:${input.postId}`,
        kind: "video",
        contentType: "post",
        contentId: input.postId,
      });
      if (!enqueue.ok) {
        // Queue full — fail-closed: the post stays private and is marked failed.
        const failed: ModerationResult = {
          decision: "FAILED",
          categories: [],
          severity: "medium",
          criticalEscalation: false,
          providerOutcomes: [],
          userMessage: userFailedMessage(),
          error: "Moderation queue is at capacity — please retry shortly",
        };
        const record = await persistAssessment(
          { contentType: "post", contentId: input.postId, authorId: input.authorId, surface: "post" },
          failed,
        );
        await applyPostDecision(input.postId, failed, record);
        return failed;
      }
      const processing: ModerationResult = {
        decision: "PROCESSING",
        categories: [],
        severity: "low",
        criticalEscalation: false,
        providerOutcomes: [],
      };
      return processing;
    }

    // Images: synchronous when configured and few; queued otherwise.
    const imageResults: ModerationResult[] = [];
    if (config.syncImageChecks && mediaDocs.length <= 3) {
      for (const media of mediaDocs) {
        const result = await moderateMediaDoc(media, "post", input.authorId);
        imageResults.push(result);
        if (result.decision === "REJECTED") break; // worst-first, save cost
      }
    } else if (mediaDocs.length > 0) {
      const enqueue = await enqueueModerationJob({
        jobKey: `post:images:${input.postId}`,
        kind: "image",
        contentType: "post",
        contentId: input.postId,
      });
      const processing: ModerationResult = {
        decision: "PROCESSING",
        categories: [],
        severity: "low",
        criticalEscalation: false,
        providerOutcomes: [],
      };
      return processing;
    }

    // Media was referenced but no Media record resolves: it cannot be verified,
    // so it must not be approved on the caption alone (fail-closed).
    if (mediaDocs.length === 0 && ((input.mediaUrls ?? []).length > 0 || (input.mediaKeys ?? []).length > 0)) {
      imageResults.push(unverifiableMediaResult());
    }

    // Combine text + all image results.
    const combined = combineResults([textResult, ...imageResults]);
    const record = await persistAssessment(
      {
        contentType: "post",
        contentId: input.postId,
        authorId: input.authorId,
        surface: "post",
        mediaIds: mediaDocs.map((m) => String(m._id)),
        mediaHash: mediaDocs[0]?.contentHash,
      },
      combined,
    );
    await applyPostDecision(input.postId, combined, record);
    return combined;
  }

  // 3. Text-only post: text result is final.
  const record = await persistAssessment(
    { contentType: "post", contentId: input.postId, authorId: input.authorId, surface: "post" },
    textResult,
  );
  await applyPostDecision(input.postId, textResult, record);
  return textResult;
}

/**
 * One-time startup repair for posts that were already stranded in processing
 * solely because the old code found zero usable visual providers. This is
 * deliberately narrow: records must say FAILED with no provider outcomes and
 * the exact "No safety check was able to run" error (or the corresponding
 * no-frame error for videos). Posts flagged for human review or rejected are
 * never auto-published by this repair.
 */
export async function recoverPostsStuckWithoutVisualProvider(): Promise<number> {
  const config = getModerationConfig();
  if (!config.enabled || !config.allowUnscannedMedia || imageCapableProviders().length > 0) return 0;

  const candidates = await Post.find({
    status: "processing",
    "moderation.status": "failed",
  })
    .sort({ createdAt: 1 })
    .limit(200);

  let recovered = 0;
  for (const post of candidates) {
    const priorFailure = await ModerationRecord.findOne({
      contentType: "post",
      contentId: post._id,
      decision: "FAILED",
      error: { $in: ["No safety check was able to run", "Video frames could not be extracted for verification"] },
    }).sort({ createdAt: -1 });
    if (!priorFailure || (priorFailure.providerOutcomes?.length ?? 0) > 0) continue;

    const captionResult = await moderateText({
      text: post.body || "",
      surface: post.kind === "reel" ? "reel" : "post",
    });
    if (captionResult.decision !== "APPROVED") continue;

    const mediaUrls = String(post.mediaUrl ?? "").split(",").map((url) => url.trim()).filter(Boolean);
    const mediaDocs = await resolveMediaDocs(mediaUrls, post.mediaKey ? [String(post.mediaKey)] : []);
    if (mediaDocs.length === 0) continue;

    logUnscannedMediaFallback();
    const result = approvedWithoutVisualProvider(captionResult);
    const record = await persistAssessment(
      {
        contentType: "post",
        contentId: String(post._id),
        authorId: String(post.author),
        surface: "post",
        mediaIds: mediaDocs.map((media) => String(media._id)),
        mediaHash: mediaDocs[0]?.contentHash,
      },
      result,
    );
    await applyPostDecision(String(post._id), result, record);
    recovered += 1;
  }

  return recovered;
}

/**
 * One-time recovery for posts that were held because the previous OpenAI
 * adapter could not accept raw image/video-frame buffers. The adapter now
 * sends those bytes as a supported base64 data URL. Only this exact technical
 * input failure is retried; safety rejections, human-review decisions, and
 * actual provider outages are not auto-published.
 */
export async function recoverPostsWithUnsupportedMediaInput(): Promise<number> {
  const candidates = await Post.find({
    status: "processing",
    "moderation.status": { $in: ["failed", "pending_review"] },
  })
    .sort({ createdAt: 1 })
    .limit(200);

  let retried = 0;
  for (const post of candidates) {
    if (!["photo", "video", "reel"].includes(String(post.kind))) continue;
    const priorFailure = await ModerationRecord.findOne({
      contentType: "post",
      contentId: post._id,
      providerOutcomes: {
        $elemMatch: { verdict: "error", error: "Provider cannot process this input type" },
      },
    }).sort({ createdAt: -1 });
    if (!priorFailure) continue;
    const hadUnsupportedProvider = (priorFailure.providerOutcomes ?? []).some(
      (outcome: any) => outcome?.verdict === "error" && outcome?.error === "Provider cannot process this input type",
    );
    if (!hadUnsupportedProvider) continue;

    const mediaUrls = String(post.mediaUrl ?? "").split(",").map((url) => url.trim()).filter(Boolean);
    if (mediaUrls.length === 0 && !post.mediaKey) continue;

    // A previous video/image-batch job may have completed with this unsupported
    // input error. Mark only those completed jobs retryable; queued jobs remain
    // untouched and will run with the updated adapter once the queue starts.
    await ModerationJob.updateMany(
      {
        jobKey: { $in: [`post:video:${String(post._id)}`, `post:images:${String(post._id)}`] },
        status: "done",
      },
      { $set: { status: "failed", lastError: "Retrying with image-buffer support" } },
    );

    await assessPost({
      postId: String(post._id),
      authorId: String(post.author),
      body: String(post.body ?? ""),
      kind: post.kind as "photo" | "video" | "reel",
      mediaUrls,
      mediaKeys: post.mediaKey ? [String(post.mediaKey)] : [],
    });
    retried += 1;
  }
  return retried;
}

/** Applies a decision to the Post document (visibility + messaging). */
export async function applyPostDecision(
  postId: string,
  result: ModerationResult,
  record: IModerationRecord,
): Promise<void> {
  const status = decisionToStatus(result.decision);
  if (result.decision === "APPROVED") {
    // Make every referenced asset deliverable BEFORE exposing the post to the
    // feeds. Publishing first can race the browser's first image request and
    // cause a permanent <img> error while the media is still quarantined.
    await approveMediaForPost(postId);
    await publishPost(postId);
    await ModerationRecord.updateOne({ _id: record._id }, { $set: { contentId: new Types.ObjectId(postId) } });
    return;
  }

  await Post.updateOne(
    { _id: postId },
    {
      $set: {
        status: result.decision === "REJECTED" ? "rejected" : "processing",
        moderation: {
          status,
          record: record._id,
          userMessage: result.userMessage,
          updatedAt: new Date(),
        },
      },
    },
  );

  if (result.criticalEscalation) {
    await escalateCritical(record, {
      contentType: "post",
      contentId: postId,
      authorId: String(record.author ?? ""),
    });
    await quarantineMediaForPost(postId, "rejected");
  } else if (result.decision === "REJECTED") {
    await quarantineMediaForPost(postId, "rejected");
  }

  if (record.author) {
    await notifyOutcome(record, String(record.author), postId);
  }
}

/** Marks a post's media approved (publicly deliverable). */
async function approveMediaForPost(postId: string) {
  const post = await Post.findById(postId).select("mediaUrl media mediaKey");
  if (!post) return;
  const urls = new Set<string>();
  if (post.mediaUrl) {
    for (const u of String(post.mediaUrl).split(",")) if (u.trim()) urls.add(u.trim());
  }
  for (const item of post.media ?? []) if (item.url) urls.add(item.url);
  const docs = await resolveMediaDocs(Array.from(urls), post.mediaKey ? [String(post.mediaKey)] : []);
  if (docs.length > 0) {
    await Media.updateMany(
      { _id: { $in: docs.map((doc) => doc._id) } },
      { $set: { moderationStatus: "approved" } },
    );
    return;
  }
  // Compatibility path for legacy public URLs that do not carry a media ID.
  if (urls.size > 0) {
    await Media.updateMany(
      { $or: [{ cdnUrl: { $in: Array.from(urls) } }, { "variants.url": { $in: Array.from(urls) } }] },
      { $set: { moderationStatus: "approved" } },
    );
  }
}

/** Quarantines a post's media (delivery refused / retention policy applies). */
async function quarantineMediaForPost(postId: string, status: "rejected" | "review" | "failed") {
  const post = await Post.findById(postId).select("mediaUrl media mediaKey");
  if (!post) return;
  const urls = new Set<string>();
  if (post.mediaUrl) {
    for (const u of String(post.mediaUrl).split(",")) if (u.trim()) urls.add(u.trim());
  }
  for (const item of post.media ?? []) if (item.url) urls.add(item.url);
  const docs = await resolveMediaDocs(Array.from(urls), post.mediaKey ? [String(post.mediaKey)] : []);
  if (docs.length > 0) {
    await Media.updateMany(
      { _id: { $in: docs.map((doc) => doc._id) } },
      { $set: { moderationStatus: status } },
    );
    return;
  }
  if (urls.size > 0) {
    await Media.updateMany(
      { $or: [{ cdnUrl: { $in: Array.from(urls) } }, { "variants.url": { $in: Array.from(urls) } }] },
      { $set: { moderationStatus: status } },
    );
  }
}

export async function moderateMediaDoc(
  media: IMedia,
  surface: ContentSurface,
  ownerId?: string,
): Promise<ModerationResult> {
  // Cloudinary-hosted: moderate via signed URL.
  if (media.storageKey && media.storageKey.startsWith("gihanga/")) {
    const url = signedCloudinaryUrl(media.storageKey, media.type === "video");
    if (url) return moderateImageByUrl(url, surface, ownerId);
  }
  // Local quarantined file: read bytes. New storage keys include the kind
  // folder; try the legacy filename-only folder layout for older records.
  if (media.storageKey && !media.storageKey.startsWith("gihanga/")) {
    const legacyKind = media.context === "reel" ? "reels"
      : media.context === "story" ? "stories"
        : media.context === "avatar" ? "avatars"
          : media.context === "cover" ? "covers"
            : media.type === "video" ? "videos" : "photos";
    const candidates = [
      path.join(quarantineRoot(), media.storageKey),
      path.join(quarantineRoot(), legacyKind, media.storageKey),
    ];
    const localPath = candidates.find((candidate) => fs.existsSync(candidate));
    if (localPath) {
      const buffer = fs.readFileSync(localPath);
      return moderateImageByBuffer(buffer, surface, ownerId, media.mimeType);
    }
  }
  // Legacy or missing: fail-closed when the pipeline is on.
  return {
    decision: "PENDING_REVIEW",
    categories: [],
    severity: "medium",
    criticalEscalation: false,
    providerOutcomes: [],
    userMessage: userReviewMessage(),
    error: "Media bytes unavailable for verification",
  };
}

function signedCloudinaryUrl(publicId: string, isVideo: boolean): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cloudinary, isCloudinaryConfigured } = require("../../lib/cloudinary");
    if (!isCloudinaryConfigured) return undefined;
    return cloudinary.url(publicId, {
      resource_type: isVideo ? "video" : "image",
      type: "authenticated",
      sign_url: true,
      secure: true,
    });
  } catch {
    return undefined;
  }
}

async function resolveMediaDocs(mediaUrls: string[], mediaKeys: string[]): Promise<IMedia[]> {
  const urls = mediaUrls.filter((url) => typeof url === "string" && url.trim()).map((url) => url.trim());
  const ids = new Set(mediaKeys.filter(Boolean).map(String).filter((key) => Types.ObjectId.isValid(key)));

  // Moderated uploads are referenced by the checked delivery URL, not the
  // raw Cloudinary cdnUrl. Resolve IDs embedded in /media/file/:id URLs too;
  // this is important for approving every image in a multi-photo post.
  for (const url of urls) {
    const match = url.match(/\/media\/file\/([a-f0-9]{24})(?:[/?#]|$)/i);
    if (match?.[1]) ids.add(match[1]);
  }

  const conditions: any[] = [];
  if (ids.size > 0) {
    conditions.push({ _id: { $in: Array.from(ids).filter((id) => Types.ObjectId.isValid(id)) } });
  }
  if (urls.length > 0) {
    conditions.push({ cdnUrl: { $in: urls } }, { "variants.url": { $in: urls } });
  }
  if (conditions.length === 0) return [];
  return Media.find({ $or: conditions });
}

export function combineResults(results: ModerationResult[]): ModerationResult {
  if (results.length === 1) return results[0];
  // Merge provider outcomes; decisions re-combined by the engine.
  const outcomes: ProviderOutcome[] = [];
  for (const r of results) outcomes.push(...r.providerOutcomes);
  const merged = combineWithConfig(outcomes);
  // A FAILED sub-result must dominate: never approve over a failed check.
  if (results.some((r) => r.decision === "FAILED") && merged.decision === "APPROVED") {
    return {
      ...merged,
      decision: "PENDING_REVIEW",
      userMessage: userReviewMessage(),
    };
  }
  // Synthetic sub-results ("media could not be located", "no video frames could
  // be extracted") carry NO provider outcomes, so re-combining outcomes alone
  // would silently drop them and approve on the remaining (e.g. caption-only)
  // evidence. A REJECTED or PENDING_REVIEW sub-result must therefore always
  // dominate an otherwise-APPROVED merge.
  if (merged.decision === "APPROVED") {
    const rejected = results.find((r) => r.decision === "REJECTED");
    if (rejected) return rejected;
    if (results.some((r) => r.decision === "PENDING_REVIEW")) {
      return {
        ...merged,
        decision: "PENDING_REVIEW",
        userMessage: userReviewMessage(),
      };
    }
  }
  return merged;
}

/**
 * Fail-closed placeholder for media that a post/story REFERENCES but whose
 * Media record cannot be found (so it cannot be verified). Never approve it.
 */
function unverifiableMediaResult(): ModerationResult {
  return {
    decision: "PENDING_REVIEW",
    categories: [],
    severity: "medium",
    criticalEscalation: false,
    providerOutcomes: [],
    userMessage: userReviewMessage(),
    error: "Referenced media could not be located for verification",
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Stories
// ────────────────────────────────────────────────────────────────────────────

export interface AssessStoryInput {
  storyId: string;
  authorId: string;
  caption?: string;
  mediaUrl: string;
  mediaKey?: string;
  isVideo: boolean;
}

export async function assessStory(input: AssessStoryInput): Promise<ModerationResult> {
  const textResult = await moderateText({ text: input.caption || "", surface: "story" });
  if (textResult.decision === "REJECTED" || textResult.decision === "PENDING_REVIEW") {
    const record = await persistAssessment(
      { contentType: "story", contentId: input.storyId, authorId: input.authorId, surface: "story" },
      textResult,
    );
    await applyStoryDecision(input.storyId, textResult, record);
    return textResult;
  }

  if (input.isVideo) {
    await enqueueModerationJob({
      jobKey: `story:video:${input.storyId}`,
      kind: "video",
      contentType: "story",
      contentId: input.storyId,
    });
    return { decision: "PROCESSING", categories: [], severity: "low", criticalEscalation: false, providerOutcomes: [] };
  }

  const mediaDocs = await resolveMediaDocs([input.mediaUrl], input.mediaKey ? [input.mediaKey] : []);
  let combined = textResult;
  if (mediaDocs.length > 0) {
    const mediaResult = await moderateMediaDoc(mediaDocs[0], "story", input.authorId);
    combined = combineResults([textResult, mediaResult]);
  } else if (input.mediaUrl || input.mediaKey) {
    // Referenced media cannot be located -> unverifiable -> never auto-approve.
    combined = combineResults([textResult, unverifiableMediaResult()]);
  }

  const record = await persistAssessment(
    {
      contentType: "story",
      contentId: input.storyId,
      authorId: input.authorId,
      surface: "story",
      mediaIds: mediaDocs.map((m) => String(m._id)),
      mediaHash: mediaDocs[0]?.contentHash,
    },
    combined,
  );
  await applyStoryDecision(input.storyId, combined, record);
  return combined;
}

export async function applyStoryDecision(
  storyId: string,
  result: ModerationResult,
  record: IModerationRecord,
): Promise<void> {
  const status = decisionToStatus(result.decision);
  await Story.updateOne(
    { _id: storyId },
    {
      $set: {
        moderation: {
          status,
          record: record._id,
          userMessage: result.userMessage,
          updatedAt: new Date(),
        },
      },
    },
  );

  if (result.decision === "APPROVED") {
    const story = await Story.findById(storyId).select("mediaUrl mediaKey");
    if (story) {
      // Resolve the story's Media doc(s) by id (mediaKey), cdnUrl or variant
      // URL. The old lookup matched ONLY `cdnUrl === story.mediaUrl`, but for
      // moderated uploads mediaUrl is the checked route
      // (/api/v1/media/file/:id) while cdnUrl is the raw Cloudinary URL —
      // they never matched, the Media doc stayed "pending" and the story
      // rendered as an empty box for every viewer except its author.
      const docs = await resolveMediaDocs(
        story.mediaUrl ? [story.mediaUrl] : [],
        story.mediaKey ? [story.mediaKey] : [],
      );
      const conditions: any[] = [];
      const ids = docs.map((d) => d._id).filter(Boolean);
      if (ids.length > 0) conditions.push({ _id: { $in: ids } });
      if (story.mediaUrl) conditions.push({ cdnUrl: story.mediaUrl });
      if (conditions.length > 0) {
        await Media.updateMany({ $or: conditions }, { $set: { moderationStatus: "approved" } });
      }
    }
    return;
  }

  if (result.decision === "REJECTED" && record.author) {
    await notifyOutcome(record, String(record.author));
  }
  if (result.criticalEscalation) {
    await escalateCritical(record, { contentType: "story", contentId: storyId, authorId: String(record.author ?? "") });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Comments (synchronous, fast text check)
// ────────────────────────────────────────────────────────────────────────────

export async function assessComment(commentId: string, authorId: string, body: string): Promise<ModerationResult> {
  const result = await moderateText({ text: body, surface: "comment" });
  const record = await persistAssessment(
    { contentType: "comment", contentId: commentId, authorId, surface: "comment" },
    result,
  );

  if (result.decision === "APPROVED") {
    await Comment.updateOne(
      { _id: commentId },
      { $set: { hidden: false, moderation: { status: "approved", record: record._id, updatedAt: new Date() } } },
    );
  } else {
    await Comment.updateOne(
      { _id: commentId },
      {
        $set: {
          hidden: true,
          moderation: {
            status: decisionToStatus(result.decision),
            record: record._id,
            userMessage: result.userMessage,
            updatedAt: new Date(),
          },
        },
      },
    );
    if (result.criticalEscalation) {
      await escalateCritical(record, { contentType: "comment", contentId: commentId, authorId });
    }
  }
  return result;
}

// ────────────────────────────────────────────────────────────────────────────
// Avatars & profile text
// ────────────────────────────────────────────────────────────────────────────

export async function assessAvatar(mediaDoc: IMedia, ownerId?: string): Promise<ModerationResult> {
  const result = await moderateMediaDoc(mediaDoc, "avatar", ownerId);
  const record = await persistAssessment(
    { contentType: "avatar", contentId: String(mediaDoc._id), authorId: ownerId, surface: "avatar", mediaIds: [String(mediaDoc._id)] },
    result,
  );
  await Media.updateOne(
    { _id: mediaDoc._id },
    {
      $set: {
        moderationStatus:
          result.decision === "APPROVED" ? "approved" : result.decision === "REJECTED" ? "rejected" : "review",
        moderationRecord: record._id,
      },
    },
  );
  if (result.criticalEscalation) {
    await escalateCritical(record, { contentType: "avatar", contentId: String(mediaDoc._id), authorId: ownerId });
  }
  return result;
}

export async function assessProfileText(userId: string, fields: { name?: string; bio?: string; username?: string }): Promise<ModerationResult> {
  const combinedText = [fields.name, fields.bio, fields.username].filter(Boolean).join("\n");
  const result = await moderateText({ text: combinedText, surface: "profile_text" });
  const record = await persistAssessment(
    { contentType: "profile", contentId: userId, authorId: userId, surface: "profile_text" },
    result,
  );
  if (result.criticalEscalation) {
    await escalateCritical(record, { contentType: "profile", contentId: userId, authorId: userId });
  }
  return result;
}

// ────────────────────────────────────────────────────────────────────────────
// Queue handler: videos, deferred images
// ────────────────────────────────────────────────────────────────────────────

import { ModerationJob } from "../../models/ModerationJob";

/** Registers the queue's job processor. Called at server startup. */
export function registerModerationJobHandler() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { registerJobHandler } = require("./moderationQueue") as typeof import("./moderationQueue");
  registerJobHandler(async (job) => {
    if (job.kind === "video") {
      await processVideoJob(job);
    } else if (job.kind === "image") {
      await processImagesJob(job);
    } else if (job.kind === "backfill") {
      await processBackfillJob(job);
    } else {
      // Unknown kind: park as failed so it can never silently complete.
      throw new Error(`Unsupported job kind: ${job.kind}`);
    }
    await ModerationJob.updateOne({ _id: job._id }, { $set: { status: "done" } });
  });
}

/**
 * FLAG-ONLY re-scan of already-published legacy content: runs the checks and
 * persists a review record for anything flagged, but NEVER changes the
 * post's publication state (staff review flagged items one by one — an
 * auditable, reversible rollout per the migration policy).
 */
async function processBackfillJob(job: any) {
  const postId = String(job.contentId);
  const post = await Post.findById(postId);
  if (!post || post.status !== "published") return;

  const captionResult = await moderateText({ text: post.body || "", surface: "post" });
  const mediaDocs = await resolveMediaDocs(
    String(post.mediaUrl ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    post.mediaKey ? [post.mediaKey] : [],
  );

  let combined = captionResult;
  if (post.kind === "video" || post.kind === "reel") {
    const frameResults = await moderateVideoFrames(mediaDocs[0], String(post.author));
    combined = combineResults([captionResult, ...frameResults]);
  } else if (mediaDocs.length > 0) {
    const mediaResult = await moderateMediaDoc(mediaDocs[0], "post", String(post.author));
    combined = combineResults([captionResult, mediaResult]);
  }

  // Only persist a record when something needs human eyes.
  if (combined.decision === "REJECTED" || combined.decision === "PENDING_REVIEW") {
    const record = await persistAssessment(
      {
        contentType: "post",
        contentId: postId,
        authorId: String(post.author),
        surface: "post",
        mediaIds: mediaDocs.map((m) => String(m._id)),
        mediaHash: mediaDocs[0]?.contentHash,
      },
      combined,
    );
    console.log(
      `[Backfill] Flagged legacy post ${postId} (${combined.decision}) — record ${record._id}; content stays published pending staff review.`,
    );
    if (combined.criticalEscalation) {
      await escalateCritical(record, { contentType: "post", contentId: postId, authorId: String(post.author) });
    }
  }
}

async function processImagesJob(job: any) {
  const postId = String(job.contentId);
  const post = await Post.findById(postId);
  if (!post || post.status === "removed" || post.status === "rejected") return;
  const mediaDocs = await resolveMediaDocs(
    String(post.mediaUrl ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    post.mediaKey ? [post.mediaKey] : [],
  );
  const results: ModerationResult[] = [];
  for (const media of mediaDocs) {
    const r = await moderateMediaDoc(media, "post", String(post.author));
    results.push(r);
    if (r.decision === "REJECTED") break;
  }
  const combined = combineResults(results);
  const record = await persistAssessment(
    {
      contentType: "post",
      contentId: postId,
      authorId: String(post.author),
      surface: "post",
      mediaIds: mediaDocs.map((m) => String(m._id)),
      mediaHash: mediaDocs[0]?.contentHash,
    },
    combined,
  );
  await applyPostDecision(postId, combined, record);
}

async function processVideoJob(job: any) {
  const contentType = job.contentType as "post" | "story";
  const contentId = String(job.contentId);

  if (contentType === "post") {
    const post = await Post.findById(contentId);
    if (!post || ["removed", "rejected", "published"].includes(post.status)) return;

    const captionResult = await moderateText({ text: post.body || "", surface: post.kind === "reel" ? "reel" : "post" });
    const mediaDocs = await resolveMediaDocs(
      String(post.mediaUrl ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      post.mediaKey ? [post.mediaKey] : [],
    );

    const frameResults = await moderateVideoFrames(mediaDocs[0], String(post.author));
    const combined = combineResults([captionResult, ...frameResults]);
    const record = await persistAssessment(
      {
        contentType: "post",
        contentId,
        authorId: String(post.author),
        surface: "post",
        mediaIds: mediaDocs.map((m) => String(m._id)),
        mediaHash: mediaDocs[0]?.contentHash,
      },
      combined,
    );
    await applyPostDecision(contentId, combined, record);
    return;
  }

  if (contentType === "story") {
    const story = await Story.findById(contentId);
    if (!story) return;
    const captionResult = await moderateText({ text: story.caption || "", surface: "story" });
    const mediaDocs = await resolveMediaDocs([story.mediaUrl], story.mediaKey ? [story.mediaKey] : []);
    const frameResults = await moderateVideoFrames(mediaDocs[0], String(story.author));
    const combined = combineResults([captionResult, ...frameResults]);
    const record = await persistAssessment(
      {
        contentType: "story",
        contentId,
        authorId: String(story.author),
        surface: "story",
        mediaIds: mediaDocs.map((m) => String(m._id)),
        mediaHash: mediaDocs[0]?.contentHash,
      },
      combined,
    );
    await applyStoryDecision(contentId, combined, record);
  }
}

/**
 * Samples frames from a video's Media doc and runs image moderation on each.
 * Returns one ModerationResult per sampled frame (worst-case dominates when
 * combined). Audio transcription is optional (OPENAI_TRANSCRIPTION_ENABLED).
 */
async function moderateVideoFrames(media: IMedia | undefined, ownerId: string): Promise<ModerationResult[]> {
  if (!media) {
    return [
      {
        decision: "PENDING_REVIEW",
        categories: [],
        severity: "medium",
        criticalEscalation: false,
        providerOutcomes: [],
        userMessage: userReviewMessage(),
        error: "Video media record unavailable",
      },
    ];
  }

  const isCloudinary = Boolean(media.storageKey && media.storageKey.startsWith("gihanga/"));
  const duration = media.duration ?? (await probeVideoDurationSecondsForMedia(media)) ?? undefined;
  const plan = planFrameSamplesFromConfig(duration);
  const results: ModerationResult[] = [];

  if (isCloudinary && media.storageKey) {
    for (const seconds of plan.timestamps) {
      const url = cloudinaryFrameUrl(media.storageKey, seconds, { authenticated: true });
      const result = await moderateImageByUrl(url, "post", ownerId);
      results.push(result);
      if (result.decision === "REJECTED") break;
    }
    return results;
  }

  // Local video: ffmpeg frame extraction (if available).
  if (media.storageKey) {
    const localPath = path.join(quarantineRoot(), media.storageKey);
    if (fs.existsSync(localPath)) {
      const frames = await extractFramesLocally(localPath, plan.timestamps);
      for (const frame of frames) {
        const result = await moderateImageByBuffer(frame.buffer, "post", ownerId, "image/jpeg");
        results.push(result);
        if (result.decision === "REJECTED") break;
      }
      if (frames.length > 0) return results;
    }
  }

  // No frame could be extracted: fail-closed -> human review.
  return [
    {
      decision: "PENDING_REVIEW",
      categories: [],
      severity: "medium",
      criticalEscalation: false,
      providerOutcomes: [],
      userMessage: userReviewMessage(),
      error: "Video frames could not be extracted for verification",
    },
  ];
}

async function probeVideoDurationSecondsForMedia(media: IMedia): Promise<number | undefined> {
  if (!media.storageKey || media.storageKey.startsWith("gihanga/")) return undefined;
  const localPath = path.join(quarantineRoot(), media.storageKey);
  if (!fs.existsSync(localPath)) return undefined;
  return probeVideoDurationSeconds(localPath);
}

// ────────────────────────────────────────────────────────────────────────────
// Live streams (title/chat) — see also lib/liveSignaling.ts integration
// ────────────────────────────────────────────────────────────────────────────

export async function assessLiveTitle(title: string, description: string | undefined, hostId: string): Promise<ModerationResult> {
  const result = await moderateText({ text: `${title}\n${description ?? ""}`, surface: "live_title" });
  const record = await persistAssessment(
    { contentType: "live_title", authorId: hostId, surface: "live_title" },
    result,
  );
  if (result.criticalEscalation) {
    await escalateCritical(record, { contentType: "live_title", authorId: hostId });
  }
  return result;
}

export async function assessLiveChatMessage(messageId: string, senderId: string, body: string): Promise<ModerationResult> {
  const result = await moderateText({ text: body, surface: "live_chat" });
  const record = await persistAssessment(
    { contentType: "live_chat", contentId: messageId, authorId: senderId, surface: "live_chat" },
    result,
  );
  return result;
}

// ────────────────────────────────────────────────────────────────────────────
// Observability
// ────────────────────────────────────────────────────────────────────────────

export function moderationServiceStats() {
  return { queue: queueStats() };
}
