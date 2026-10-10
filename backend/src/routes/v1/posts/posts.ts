import { Router, Request, Response } from "express";
import { Types } from "mongoose";
import { Post } from "../../../models/Post";
import { User } from "../../../models/User";
import { Follow } from "../../../models/Follow";
import { Like } from "../../../models/Like";
import { Bookmark } from "../../../models/Bookmark";
import { Hashtag } from "../../../models/Hashtag";
import { Comment } from "../../../models/Comment";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { getIO } from "../../../lib/socket";
import { awardPoints } from "../../../lib/rewards";
import { ContentView } from "../../../models/ContentView";
import { rateLimitHits, redis } from "../../../lib/redis";
import { invalidateUserMetrics, evaluateUser } from "../../../services/achievementService";

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

// POST /api/v1/posts — create a post (photo, video, reel or text)
router.post("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
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
    });

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
    }

    return res.status(201).json({ post: responsePost });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create post", details: error.message });
  }
});

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
router.get("/user/:username", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ username: String(req.params.username).toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { limit, before } = parsePagination(req);
    const query: any = { author: user._id, status: "published" };
    const isOwner = req.user?.userId === String(user._id);
    if (!isOwner) query.audience = "public";
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

// GET /api/v1/posts/:id — single post detail
router.get("/:id", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, status: "published" }).populate("author", AUTHOR_FIELDS);
    if (!post) return res.status(404).json({ error: "Post not found" });
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

    await Post.deleteOne({ _id: post._id });
    await Comment.deleteMany({ post: post._id });
    await Like.deleteMany({ target: post._id, kind: "post" });
    await Bookmark.deleteMany({ post: post._id });
    await User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } });
    if (post.tags.length) {
      await Promise.all(post.tags.map((tag) => Hashtag.findOneAndUpdate({ tag }, { $inc: { postsCount: -1 } })));
    }

    return res.json({ success: true, message: "Post deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete post", details: error.message });
  }
});

export default router;
