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

// POST /api/v1/posts/:id/view — bump the view counter (best-effort, no auth required)
router.post("/:id/view", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });
    return res.status(204).end();
  } catch {
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

    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete post", details: error.message });
  }
});

export default router;
