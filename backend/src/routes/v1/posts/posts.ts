import { Router, Request, Response } from "express";
import { Types } from "mongoose";
import { Post } from "../../../models/Post";
import { User } from "../../../models/User";
import { Follow } from "../../../models/Follow";
import { Like } from "../../../models/Like";
import { Bookmark } from "../../../models/Bookmark";
import { Hashtag } from "../../../models/Hashtag";
import { Comment } from "../../../models/Comment";
import { Media } from "../../../models/Media";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { getIO, emitToUser } from "../../../lib/socket";
import { awardPoints } from "../../../lib/rewards";
import { ContentView } from "../../../models/ContentView";
import { rateLimitHits, redis } from "../../../lib/redis";
import { invalidateUserMetrics, evaluateUser } from "../../../services/achievementService";
import { moderationActive } from "../../../middleware/upload";
import { assessPost } from "../../../services/moderation/contentModerationService";
import { cancelJobsForContent, retryFailedJob } from "../../../services/moderation/moderationQueue";
import { decisionToStatus } from "../../../services/moderation/contentModerationService";
import { logInteractionEvent } from "../../../services/recommendation/eventTracker";
import { recordPlatformActivity } from "../../../services/platformActivity";

const router = Router();

const AUTHOR_FIELDS = "name username avatarHue avatarUrl isCreator verified isLive";

async function withViewerFlags(posts: any[], viewerId?: string) {
  if (!viewerId || posts.length === 0) {
    return posts.map((p) => ({ ...p.toObject(), liked: false, bookmarked: false, followingAuthor: false }));
  }
  const ids = posts.map((p) => p._id);
  const authorIds = [...new Set(posts.map((p) => String(p.author?._id ?? p.author)))];
  const [likes, bookmarks, follows] = await Promise.all([
    Like.find({ user: viewerId, kind: "post", target: { $in: ids } }).select("target").lean(),
    Bookmark.find({ user: viewerId, post: { $in: ids } }).select("post").lean(),
    Follow.find({ follower: viewerId, following: { $in: authorIds } }).select("following").lean(),
  ]);
  const likedSet = new Set(likes.map((l) => String(l.target)));
  const bookmarkedSet = new Set(bookmarks.map((b) => String(b.post)));
  const followingSet = new Set(follows.map((f) => String(f.following)));
  return posts.map((p) => ({
    ...p.toObject(),
    liked: likedSet.has(String(p._id)),
    bookmarked: bookmarkedSet.has(String(p._id)),
    followingAuthor: followingSet.has(String(p.author?._id ?? p.author)),
  }));
}

function parsePagination(req: Request) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const before = req.query.before ? new Date(String(req.query.before)) : undefined;
  return { limit, before };
}

/**
 * Resolves the platform Media documents for the media a post references.
 * SECURITY: when the moderation pipeline is active, media MUST have been
 * uploaded through the platform (a resolvable Media doc). This closes the
 * "paste any external URL" bypass — unverifiable media is refused outright.
 */
async function resolveUploadedMedia(
  mediaKey: unknown,
  mediaUrl: unknown,
  ownerId: string,
): Promise<{ ok: boolean; docs: any[] }> {
  const key = typeof mediaKey === "string" ? mediaKey.trim() : "";
  const urls = typeof mediaUrl === "string"
    ? mediaUrl.split(",").map((value) => value.trim()).filter(Boolean)
    : [];
  const ids = new Set<string>();

  if (key && Types.ObjectId.isValid(key)) ids.add(key);
  // The checked delivery URLs encode their Media document ID. Resolve every
  // item in a carousel instead of validating only the first mediaKey.
  for (const value of urls) {
    const match = value.match(/\/media\/file\/([a-f0-9]{24})(?:[/?#]|$)/i);
    if (match?.[1]) ids.add(match[1]);
  }

  const alternatives: any[] = [];
  if (ids.size) alternatives.push({ _id: { $in: [...ids] } });
  if (urls.length) alternatives.push({ cdnUrl: { $in: urls } }, { "variants.url": { $in: urls } });
  if (!alternatives.length) return { ok: false, docs: [] };

  const found = await Media.find({ $or: alternatives }).limit(10);
  // Existing legacy Media rows may not have ownerId. New uploads must match
  // the signed-in creator so a media ID cannot be reused by another account.
  const docs = found.filter((doc) => !doc.ownerId || String(doc.ownerId) === ownerId);
  if (!docs.length) return { ok: false, docs: [] };

  const resolvedIds = new Set(docs.map((doc) => String(doc._id)));
  const coveredUrls = new Set<string>();
  for (const value of urls) {
    const idMatch = value.match(/\/media\/file\/([a-f0-9]{24})(?:[/?#]|$)/i);
    if (idMatch?.[1] && resolvedIds.has(idMatch[1])) {
      coveredUrls.add(value);
      continue;
    }
    if (docs.some((doc) => doc.cdnUrl === value || (doc.variants ?? []).some((variant: any) => variant.url === value))) {
      coveredUrls.add(value);
    }
  }
  // If URLs were provided, each one must resolve to a platform Media record;
  // never allow a mixed trusted/untrusted multi-media post.
  const allUrlsResolved = urls.length === 0 || coveredUrls.size === urls.length;
  const keyResolved = Boolean(key && resolvedIds.has(key));
  return { ok: allUrlsResolved && (urls.length > 0 || keyResolved), docs };
}

// POST /api/v1/posts — create a post (photo, video, reel or text)
//
// CONTENT SAFETY LIFECYCLE: the post is created with status "processing" and
// is NOT publicly visible (every feed/recommendation/search read path filters
// status:"published"). The central ContentModerationService then:
//   - moderates the caption synchronously,
//   - moderates images synchronously (single/limited) or via the queue,
//   - queues video frame sampling for videos/reels,
// and ONLY an APPROVED decision publishes (publishPost()) — with counters,
// hashtags, socket broadcast and rewards firing at approval time, never
// before. Duplicate submissions are collapsed via the Idempotency-Key header.
router.post("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  let createdPostId: string | undefined;
  try {
    const { kind, body, mediaUrl, mediaKey, mediaMimeType, duration, thumbnailUrl, location, tags, audience } =
      req.body;

    if (!kind || !["photo", "video", "reel", "text"].includes(kind)) {
      return res.status(400).json({ error: "kind must be one of photo, video, reel, text" });
    }
    if (kind !== "text" && !mediaUrl) {
      return res.status(400).json({ error: "mediaUrl is required for photo, video and reel posts" });
    }
    if (kind === "text" && !body?.trim()) {
      return res.status(400).json({ error: "Text posts need a body" });
    }

    // ── Idempotency: a double-clicked "Post" button must not create twice ──
    const idemHeader = req.headers["idempotency-key"];
    const idemKey = typeof idemHeader === "string" && idemHeader.trim() ? idemHeader.trim().slice(0, 128) : undefined;
    if (idemKey) {
      const redisKey = `idem:post:create:${req.user!.userId}:${idemKey}`;
      const claimed = await redis.setnx(redisKey, "pending");
      if (claimed !== 1) {
        // Duplicate inside the 10-minute window: return the original result.
        const existingId = await (redis as any).get(redisKey);
        if (existingId && existingId !== "pending" && Types.ObjectId.isValid(existingId)) {
          const existing = await Post.findById(existingId).populate("author", AUTHOR_FIELDS);
          if (existing) {
            const [flagged] = await withViewerFlags([existing], req.user!.userId);
            return res.status(200).json({ post: flagged, duplicate: true });
          }
        }
        return res.status(409).json({ error: "This submission is already being processed" });
      }
      await redis.expire(redisKey, 600);
      (req as any).__idemRedisKey = redisKey;
    }

    // ── Media provenance check (anti-bypass) ─────────────────────────────────
    if (moderationActive() && kind !== "text") {
      const resolved = await resolveUploadedMedia(mediaKey, mediaUrl, req.user!.userId);
      if (!resolved.ok) {
        return res.status(400).json({
          error: "Media must be uploaded through the platform's upload API before posting",
        });
      }
    }

    // B1 — persist the media geometry the upload API already returns
    // (width/height/aspectRatio/blurDataUrl) so the feed can reserve the
    // image's true height BEFORE it loads: zero crop, zero layout shift.
    // All numbers are bounds-checked; nothing client-supplied is trusted
    // beyond sanity (aspectRatio must actually match a plausible image).
    const sanitizeDim = (raw: unknown): number | undefined => {
      const n = Number(raw);
      return Number.isFinite(n) && n >= 1 && n <= 20000 ? Math.round(n) : undefined;
    };
    const sanitizeRatio = (raw: unknown): number | undefined => {
      const n = Number(raw);
      return Number.isFinite(n) && n >= 0.1 && n <= 10 ? n : undefined;
    };
    const sanitizeBlur = (raw: unknown): string | undefined => {
      if (typeof raw !== "string") return undefined;
      if (!raw.startsWith("data:image/") || raw.length > 200_000) return undefined;
      return raw;
    };

    const mediaWidth = sanitizeDim(req.body.mediaWidth);
    const mediaHeight = sanitizeDim(req.body.mediaHeight);
    const aspectRatio = sanitizeRatio(req.body.aspectRatio);
    const blurDataUrl = sanitizeBlur(req.body.blurDataUrl);

    // Per-item metadata for multi-image posts: each entry { url, width,
    // height, aspectRatio, kind } — validated the same way and only kept
    // when its url is part of this post's mediaUrl list.
    const rawMediaList: unknown[] = Array.isArray(req.body.media) ? req.body.media : [];
    const urlWhitelist = new Set(String(mediaUrl ?? "").split(",").map((s) => s.trim()).filter(Boolean));
    const media = rawMediaList
      .filter(
        (item): item is Record<string, unknown> =>
          item !== null &&
          typeof item === "object" &&
          typeof (item as Record<string, unknown>).url === "string" &&
          urlWhitelist.has((item as Record<string, unknown>).url as string),
      )
      .slice(0, 10)
      .map((item) => ({
        url: String(item.url),
        width: sanitizeDim(item.width),
        height: sanitizeDim(item.height),
        aspectRatio: sanitizeRatio(item.aspectRatio),
        kind: item.kind === "video" ? "video" : "photo",
      }));

    const cleanTags: string[] = Array.isArray(tags)
      ? tags.map((t: string) => String(t).replace(/^#/, "").trim().toLowerCase()).filter(Boolean).slice(0, 10)
      : [];

    // Status starts at "processing" — NOT "published". The moderation
    // pipeline is the only thing that flips it to "published".
    const post = await Post.create({
      author: req.user!.userId,
      kind,
      body: body?.trim() || "",
      mediaUrl,
      mediaKey,
      mediaMimeType,
      duration,
      thumbnailUrl,
      mediaWidth,
      mediaHeight,
      aspectRatio,
      blurDataUrl,
      media: media.length > 0 ? media : undefined,
      location: location?.trim(),
      tags: cleanTags,
      audience: audience && ["public", "followers", "private"].includes(audience) ? audience : "public",
      status: moderationActive() ? "processing" : "published",
      moderation: moderationActive()
        ? { status: "processing", updatedAt: new Date() }
        : { status: "approved", updatedAt: new Date() },
    });
    createdPostId = String(post._id);
    void recordPlatformActivity({ type: "content.post.submitted", category: "content", summary: `A ${post.kind} was submitted for publishing`, actor: req.user!.userId, actorRole: "user", targetUser: req.user!.userId, targetId: String(post._id), visibility: "all_staff", requiredAnyPermissions: ["content.view", "moderation.content.view"], metadata: { kind: post.kind, status: post.status, tagCount: cleanTags.length } });

    // Remember the post for idempotent replays (del+setnx works on both the
    // in-memory shim and real ioredis — neither exposes plain SET).
    if ((req as any).__idemRedisKey) {
      await redis.del((req as any).__idemRedisKey);
      await redis.setnx((req as any).__idemRedisKey, String(post._id));
      await redis.expire((req as any).__idemRedisKey, 600);
    }

    if (!moderationActive()) {
      // Pipeline explicitly disabled (local-dev opt-out): legacy behaviour.
      await User.findByIdAndUpdate(req.user!.userId, { $inc: { postsCount: 1 } });
      await awardPoints(req.user!.userId, "upload", `Uploaded a ${kind}`).catch((err) =>
        console.error("[Rewards] Upload bonus failed:", err),
      );
      if (cleanTags.length) {
        await Promise.all(
          cleanTags.map((tag) =>
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
      return res.status(201).json({ post: responsePost });
    }

    // ── Central moderation pipeline ──────────────────────────────────────────
    // Fire-and-await: text + (usually) image checks complete inline so the
    // author immediately sees Published / Could-not-publish / Needs-review.
    // Videos return PROCESSING and continue in the background queue.
    const result = await assessPost({
      postId: String(post._id),
      authorId: req.user!.userId,
      body: post.body,
      kind,
      mediaUrls: String(mediaUrl ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      mediaKeys: mediaKey ? [String(mediaKey)] : [],
    }).catch((err) => {
      console.error("[Moderation] assessPost failed:", err instanceof Error ? err.message : err);
      return null;
    });

    if (!result) {
      // An assessment exception must not leave the row looking actively
      // processing forever. Mark it retryable immediately; the recovery loop
      // will rerun the checks, but will never publish without APPROVED.
      await Post.updateOne(
        { _id: post._id, status: "processing" },
        {
          $set: {
            "moderation.status": "failed",
            "moderation.userMessage": "Your post was saved, but its safety check could not finish. We will retry it automatically.",
            "moderation.updatedAt": new Date(),
          },
        },
      );
      const populated = await Post.findById(post._id).populate("author", AUTHOR_FIELDS);
      return res.status(202).json({
        post: { ...(populated ?? post).toObject(), liked: false, bookmarked: false, followingAuthor: false },
        moderation: {
          status: "failed",
          userMessage: "Your post was saved, but its safety check could not finish. We will retry it automatically.",
        },
        processing: true,
      });
    }

    const populated = await Post.findById(post._id).populate("author", AUTHOR_FIELDS);
    const responsePost = populated
      ? { ...populated.toObject(), liked: false, bookmarked: false, followingAuthor: false }
      : { ...post.toObject(), liked: false, bookmarked: false, followingAuthor: false };

    // Rewards fire on APPROVED publication (inside publishPost path) — keep
    // the original upload bonus semantics for approved posts.
    if (result.decision === "APPROVED") {
      await awardPoints(req.user!.userId, "upload", `Uploaded a ${kind}`).catch((err) =>
        console.error("[Rewards] Upload bonus failed:", err),
      );
    }

    return res.status(result.decision === "REJECTED" ? 422 : 201).json({
      post: responsePost,
      moderation: {
        status: decisionToStatus(result.decision),
        userMessage: result.userMessage,
        critical: false, // never surfaced to clients — see policy.ts
      },
      ...(result.decision === "PROCESSING" ? { processing: true } : {}),
    });
  } catch (error: any) {
    console.error("[Posts] Create/publish pipeline failed:", error instanceof Error ? error.message : "unknown error");
    if (createdPostId) {
      // Post.create may already have committed before a later moderation or
      // side-effect operation failed. Keep it recoverable rather than leaving
      // a silent, endlessly-processing row with no retry signal.
      await Post.updateOne(
        { _id: createdPostId, status: "processing" },
        {
          $set: {
            "moderation.status": "failed",
            "moderation.userMessage": "Your post was saved, but its safety check could not finish. We will retry it automatically.",
            "moderation.updatedAt": new Date(),
          },
        },
      ).catch(() => undefined);
      const saved = await Post.findById(createdPostId).populate("author", AUTHOR_FIELDS).catch(() => null);
      if (saved) {
        return res.status(202).json({
          post: { ...saved.toObject(), liked: false, bookmarked: false, followingAuthor: false },
          moderation: {
            status: "failed",
            userMessage: "Your post was saved, but its safety check could not finish. We will retry it automatically.",
          },
          processing: true,
        });
      }
    }
    return res.status(500).json({ error: "Failed to create post", details: error.message });
  }
});

// PATCH /api/v1/posts/:id — author edits caption/media. ANY safety-relevant
// change INVALIDATES the previous approval and re-enters moderation.
router.patch("/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (String(post.author) !== req.user!.userId) {
      return res.status(403).json({ error: "You can only edit your own posts" });
    }
    if (["removed"].includes(post.status)) {
      return res.status(400).json({ error: "Removed posts cannot be edited" });
    }

    const { body, location, tags, mediaUrl, mediaKey, mediaMimeType, thumbnailUrl } = req.body;

    // Determine whether this edit changes safety-relevant content.
    const textChanged = body !== undefined && body?.trim() !== post.body;
    const mediaChanged =
      (mediaUrl !== undefined && mediaUrl !== post.mediaUrl) ||
      (mediaKey !== undefined && mediaKey !== post.mediaKey);

    if (mediaChanged && moderationActive()) {
      const resolved = await resolveUploadedMedia(mediaKey ?? post.mediaKey, mediaUrl, req.user!.userId);
      if (!resolved.ok) {
        return res.status(400).json({ error: "Media must be uploaded through the platform's upload API before posting" });
      }
    }

    if (body !== undefined) post.body = body?.trim() || "";
    if (location !== undefined) post.location = location?.trim();
    if (mediaUrl !== undefined) post.mediaUrl = mediaUrl;
    if (mediaKey !== undefined) post.mediaKey = mediaKey;
    if (mediaMimeType !== undefined) post.mediaMimeType = mediaMimeType;
    if (thumbnailUrl !== undefined) post.thumbnailUrl = thumbnailUrl;
    if (Array.isArray(tags)) {
      post.tags = tags.map((t: string) => String(t).replace(/^#/, "").trim().toLowerCase()).filter(Boolean).slice(0, 10);
    }

    if (!moderationActive()) {
      await post.save();
      return res.json({ post: await post.populate("author", AUTHOR_FIELDS) });
    }

    if (textChanged || mediaChanged) {
      // Invalidate prior approval: re-enter the pipeline from scratch.
      post.status = "processing";
      post.moderation = { status: "processing", updatedAt: new Date() };
    }
    await post.save();

    if (textChanged || mediaChanged) {
      const result = await assessPost({
        postId: String(post._id),
        authorId: req.user!.userId,
        body: post.body,
        kind: post.kind,
        mediaUrls: String(post.mediaUrl ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        mediaKeys: post.mediaKey ? [String(post.mediaKey)] : [],
      }).catch(() => null);

      const fresh = await Post.findById(post._id).populate("author", AUTHOR_FIELDS);
      return res.json({
        post: fresh ?? post,
        moderation: result
          ? { status: decisionToStatus(result.decision), userMessage: result.userMessage }
          : { status: "processing" },
      });
    }

    return res.json({ post: await post.populate("author", AUTHOR_FIELDS) });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to edit post", details: error.message });
  }
});

// GET /api/v1/posts/mine — the author's own posts including moderation
// states (processing / pending_review / rejected / failed), so the UI can
// show "Checking your content…", "Needs review", "Could not be published".
router.get("/mine", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit, before } = parsePagination(req);
    const statusFilter = typeof req.query.moderation === "string" ? req.query.moderation : undefined;
    const query: any = {
      author: new Types.ObjectId(req.user!.userId),
      status: { $in: ["published", "processing", "rejected"] },
    };
    if (statusFilter && ["processing", "pending_review", "rejected", "failed", "approved"].includes(statusFilter)) {
      query["moderation.status"] = statusFilter;
    }
    if (before) query.createdAt = { $lt: before };
    const posts = await Post.find(query).sort({ createdAt: -1 }).limit(limit).populate("author", AUTHOR_FIELDS);
    return res.json({
      posts: await withViewerFlags(posts, req.user!.userId),
      nextCursor: posts.length === limit ? posts[posts.length - 1].createdAt : null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load your posts", details: error.message });
  }
});

// POST /api/v1/posts/:id/retry-moderation — re-run checks for a post that
// ended up "failed" (e.g. after a provider outage). Rate-limited.
router.post(
  "/:id/retry-moderation",
  authenticateConsumer,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const allowed = await rateLimitHits("post:retry", req.user!.userId, 10, 300);
      if (!allowed) return res.status(429).json({ error: "Too many retry attempts — try again later" });

      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: "Post not found" });
      if (String(post.author) !== req.user!.userId) {
        return res.status(403).json({ error: "You can only retry your own posts" });
      }
      if (!["failed", "rejected"].includes(post.moderation?.status ?? "")) {
        return res.status(400).json({ error: "This post is not in a retryable state" });
      }
      // Rejected posts may only be retried AFTER an edit (new content).
      if (post.moderation?.status === "rejected") {
        return res.status(400).json({ error: "Edit the post and save to resubmit it for review" });
      }

      post.status = "processing";
      post.moderation = { ...(post.moderation as any), status: "processing", updatedAt: new Date() };
      await post.save();

      const isVideo = post.kind === "video" || post.kind === "reel";
      if (isVideo) {
        await retryFailedJob(`post:video:${String(post._id)}`);
      } else {
        await retryFailedJob(`post:images:${String(post._id)}`);
      }

      const result = await assessPost({
        postId: String(post._id),
        authorId: String(post.author),
        body: post.body,
        kind: post.kind,
        mediaUrls: String(post.mediaUrl ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        mediaKeys: post.mediaKey ? [String(post.mediaKey)] : [],
      }).catch(() => null);

      const fresh = await Post.findById(post._id).populate("author", AUTHOR_FIELDS);
      return res.json({
        post: fresh,
        moderation: result ? { status: decisionToStatus(result.decision) } : { status: "processing" },
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to retry moderation", details: error.message });
    }
  },
);

// GET /api/v1/posts/feed — own posts + posts from people you follow, newest first
router.get("/feed", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit, before } = parsePagination(req);
    const following = await Follow.find({ follower: req.user!.userId }).select("following").lean();
    const authorIds = [...following.map((f) => f.following), new Types.ObjectId(req.user!.userId)];

    const query: any = { author: { $in: authorIds }, status: "published" };
    if (before) query.createdAt = { $lt: before };

    const posts = await Post.find(query).sort({ createdAt: -1 }).limit(limit).populate("author", AUTHOR_FIELDS);

    return res.json({
      posts: await withViewerFlags(posts, req.user!.userId),
      nextCursor: posts.length === limit ? posts[posts.length - 1].createdAt : null,
      isFollowingAnyone: following.length > 0,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load feed", details: error.message });
  }
});

// GET /api/v1/posts/explore — public posts platform-wide, newest first
router.get("/explore", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit, before } = parsePagination(req);
    const query: any = { status: "published", audience: "public", kind: { $ne: "reel" } };
    if (before) query.createdAt = { $lt: before };

    const posts = await Post.find(query).sort({ createdAt: -1 }).limit(limit).populate("author", AUTHOR_FIELDS);

    return res.json({
      posts: await withViewerFlags(posts, req.user?.userId),
      nextCursor: posts.length === limit ? posts[posts.length - 1].createdAt : null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load explore feed", details: error.message });
  }
});

// GET /api/v1/posts/reels — reel posts only, newest first
router.get("/reels", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit, before } = parsePagination(req);
    const query: any = { status: "published", audience: "public", kind: "reel" };
    if (before) query.createdAt = { $lt: before };

    const posts = await Post.find(query).sort({ createdAt: -1 }).limit(limit).populate("author", AUTHOR_FIELDS);

    return res.json({
      posts: await withViewerFlags(posts, req.user?.userId),
      nextCursor: posts.length === limit ? posts[posts.length - 1].createdAt : null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load reels", details: error.message });
  }
});

// GET /api/v1/posts/tag/:tag — posts carrying a given hashtag
router.get("/tag/:tag", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit, before } = parsePagination(req);
    const tag = String(req.params.tag).replace(/^#/, "").toLowerCase();
    const query: any = { status: "published", audience: "public", tags: tag };
    if (before) query.createdAt = { $lt: before };

    const [posts, hashtag] = await Promise.all([
      Post.find(query).sort({ createdAt: -1 }).limit(limit).populate("author", AUTHOR_FIELDS),
      Hashtag.findOne({ tag }).lean(),
    ]);

    return res.json({
      tag,
      postsCount: hashtag?.postsCount || 0,
      posts: await withViewerFlags(posts, req.user?.userId),
      nextCursor: posts.length === limit ? posts[posts.length - 1].createdAt : null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load tag", details: error.message });
  }
});

// GET /api/v1/posts/user/:username — a single user's post grid (for their profile page)
// The OWNER additionally sees their own in-flight moderation states so the
// profile grid can render "Checking…/Needs review/Could not be published"
// chips; everyone else sees published posts only.
router.get("/user/:username", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ username: String(req.params.username).toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { limit, before } = parsePagination(req);
    const isOwner = req.user?.userId === String(user._id);
    const query: any = {
      author: user._id,
      status: isOwner ? { $in: ["published", "processing", "rejected"] } : "published",
    };
    if (!isOwner) {
      const isFollowingAuthor = req.user
        ? await Follow.exists({ follower: req.user.userId, following: user._id })
        : false;
      query.audience = isFollowingAuthor ? { $in: ["public", "followers"] } : "public";
    }
    if (before) query.createdAt = { $lt: before };

    const posts = await Post.find(query).sort({ createdAt: -1 }).limit(limit).populate("author", AUTHOR_FIELDS);

    return res.json({
      posts: await withViewerFlags(posts, req.user?.userId),
      nextCursor: posts.length === limit ? posts[posts.length - 1].createdAt : null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load user posts", details: error.message });
  }
});

// GET /api/v1/posts/user/:username/liked — posts the user has liked (owner-only)
router.get("/user/:username/liked", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ username: String(req.params.username).toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (String(user._id) !== req.user!.userId) {
      return res.status(403).json({ error: "You can only view your own liked posts" });
    }

    const { limit } = parsePagination(req);
    const likes = await Like.find({ user: user._id, kind: "post" }).sort({ createdAt: -1 }).limit(limit);
    const posts = await Post.find({ _id: { $in: likes.map((l) => l.target) }, status: "published" }).populate(
      "author",
      AUTHOR_FIELDS,
    );

    return res.json({ posts: await withViewerFlags(posts, req.user!.userId), nextCursor: null });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load liked posts", details: error.message });
  }
});

// GET /api/v1/posts/:id — single post detail (published only; authors can
// fetch their own processing/rejected posts to render status + edit UI)
router.get("/:id", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await Post.findOne({ _id: req.params.id }).populate("author", AUTHOR_FIELDS);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const isOwner = req.user?.userId === String(post.author?._id ?? post.author);
    if (post.status !== "published" && !isOwner) {
      return res.status(404).json({ error: "Post not found" });
    }
    const [withFlags] = await withViewerFlags([post], req.user?.userId);
    return res.json({ post: withFlags });
  } catch {
    return res.status(404).json({ error: "Post not found" });
  }
});

// POST /api/v1/posts/:id/share — bumps the share counter and rewards the author
router.post("/:id/share", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { sharesCount: 1 } }, { new: true });
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (req.user?.userId) {
      await logInteractionEvent({
        userId: req.user.userId,
        event: post.kind === "reel" ? "reel_share" : "post_share",
        targetKind: post.kind === "reel" ? "reel" : "post",
        targetId: String(post._id),
        creatorId: String(post.author),
        tags: post.tags || [],
      });
    }
    await awardPoints(String(post.author), "share", "Your post was shared").catch((err) =>
      console.error("[Rewards] Share bonus failed:", err),
    );
    getIO()?.emit("post:updated", { postId: String(post._id), sharesCount: post.sharesCount });
    return res.json({ sharesCount: post.sharesCount });
  } catch {
    return res.status(404).json({ error: "Post not found" });
  }
});

// POST /api/v1/posts/:id/view — hardened view tracking.
//
// Requirements satisfied (per the Achievement Badge spec, section 8):
//   - Only counts a view for a PUBLISHED, non-removed post (drafts/scheduled/removed excluded).
//   - Authenticated users: deduplicated via the existing ContentView collection
//     (unique (user, content) index). A re-view bumps seenCount + lastSeenAt
//     but does NOT increment Post.viewsCount — so refreshing the page never
//     inflates the counter.
//   - Anonymous visitors: deduplicated via a short-TTL Redis fingerprint
//     (SHA1 of IP + UA), capped at one view per content per fingerprint per
//     10-minute window, with a per-IP rate limit so a single client can't
//     hammer the counter.
//   - Never trusts a client-supplied view total — the increment is always $inc: 1.
//   - After a genuine new view, asynchronously re-evaluates the author's
//     achievement eligibility (idempotent, non-blocking) so view-based badges
//     unlock promptly without slowing the response.
router.post("/:id/view", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, status: "published" }).select("_id author viewsCount").lean();
    if (!post) return res.status(404).json({ error: "Post not found" });

    let shouldIncrement = false;

    if (req.user) {
      // Authenticated viewer — dedup via ContentView (unique user+content index).
      // upsert with $setOnInsert so only the FIRST view creates a row; re-views
      // just refresh lastSeenAt + seenCount.
      const existing = await ContentView.findOne({ user: req.user.userId, content: post._id }).lean();
      if (!existing) {
        await ContentView.create({
          user: req.user.userId,
          content: post._id,
          kind: "post",
          seenCount: 1,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
        });
        shouldIncrement = true;
      } else {
        await ContentView.updateOne(
          { _id: existing._id },
          { $inc: { seenCount: 1 }, $set: { lastSeenAt: new Date() } },
        );
        // Re-view by the same authenticated user does NOT count again.
      }
    } else {
      // Anonymous viewer — dedup via a 10-minute Redis fingerprint window.
      const ip = (req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "anon");
      const ua = req.headers["user-agent"] || "";
      const crypto = await import("crypto");
      const fingerprint = crypto.createHash("sha1").update(`${ip}|${ua}|${post._id}`).digest("hex");

      // Rate limit: max 30 anonymous views per IP per 5 minutes.
      const allowed = await rateLimitHits("post-view", ip, 30, 300);
      if (!allowed) return res.status(429).json({ error: "Too many view requests" });

      const claimed = await (redis as any).setnx(`view:fp:${fingerprint}`, "1");
      if (claimed === 1) {
        await (redis as any).expire(`view:fp:${fingerprint}`, 600); // 10-min dedup window
        shouldIncrement = true;
      }
    }

    if (shouldIncrement) {
      await Post.updateOne({ _id: post._id }, { $inc: { viewsCount: 1 } });

      // Async, non-blocking achievement re-evaluation for the author. The
      // response never waits on this; failures are logged, never surfaced.
      const authorId = String(post.author);
      invalidateUserMetrics(authorId)
        .then(() => evaluateUser(authorId))
        .catch((err) => console.error("[Achievements] post-view re-eval failed:", err));
    }

    return res.status(204).end();
  } catch (err) {
    // View tracking is best-effort — never break the client over a counting error.
    console.error("[Posts] view tracking failed:", err);
    return res.status(204).end();
  }
});

// DELETE /api/v1/posts/:id — author (or staff, handled in the /system routes) only
router.delete("/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (String(post.author) !== req.user!.userId) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    // Cancel any in-flight moderation jobs for this content.
    await cancelJobsForContent("post", String(post._id)).catch(() => undefined);

    const wasPublished = post.status === "published";
    await Post.deleteOne({ _id: post._id });
    await Comment.deleteMany({ post: post._id });
    await Like.deleteMany({ target: post._id, kind: "post" });
    await Bookmark.deleteMany({ post: post._id });
    if (wasPublished) {
      await User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } });
      if (post.tags.length) {
        await Promise.all(post.tags.map((tag) => Hashtag.findOneAndUpdate({ tag }, { $inc: { postsCount: -1 } })));
      }
    }

    return res.json({ success: true, message: "Post deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete post", details: error.message });
  }
});

export default router;
