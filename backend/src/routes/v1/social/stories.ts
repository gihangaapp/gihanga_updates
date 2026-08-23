import { Router, Response } from "express";
import { Types } from "mongoose";
import { Story } from "../../../models/Story";
import { Follow } from "../../../models/Follow";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";

const router = Router();
const AUTHOR_FIELDS = "name username avatarHue avatarUrl isCreator verified";
const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

// POST /api/v1/stories — create (auto-expires 24h from now)
router.post("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mediaUrl, mediaKey, mediaType, caption, duration } = req.body;
    if (!mediaUrl) return res.status(400).json({ error: "mediaUrl is required" });

    const story = await Story.create({
      author: req.user!.userId,
      mediaUrl,
      mediaKey,
      mediaType: mediaType === "video" ? "video" : "image",
      caption: caption?.trim(),
      duration: duration || 4200,
      expiresAt: new Date(Date.now() + STORY_LIFETIME_MS),
    });

    const populated = await story.populate("author", AUTHOR_FIELDS);
    return res.status(201).json({ story: populated });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create story", details: error.message });
  }
});

// GET /api/v1/stories — active stories from you + people you follow, grouped by author
router.get("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const following = await Follow.find({ follower: req.user!.userId }).select("following").lean();
    const authorIds = [...following.map((f) => f.following), new Types.ObjectId(req.user!.userId)];

    const stories = await Story.find({ author: { $in: authorIds }, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: 1 })
      .populate("author", AUTHOR_FIELDS);

    const grouped = new Map<string, { author: any; items: any[]; seen: boolean }>();
    for (const story of stories) {
      const key = String(story.author._id);
      if (!grouped.has(key)) grouped.set(key, { author: story.author, items: [], seen: true });
      const group = grouped.get(key)!;
      const viewedByMe = story.viewers.some((v) => String(v.user) === req.user!.userId);
      group.items.push({ ...story.toObject(), viewedByMe });
      if (!viewedByMe) group.seen = false;
    }

    return res.json({ stories: Array.from(grouped.values()) });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load stories", details: error.message });
  }
});

// POST /api/v1/stories/:id/view — mark viewed by the current user
router.post("/:id/view", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: "Story not found" });

    const alreadyViewed = story.viewers.some((v) => String(v.user) === req.user!.userId);
    if (!alreadyViewed) {
      story.viewers.push({ user: req.user!.userId as any, viewedAt: new Date() });
      story.viewCount += 1;
      await story.save();
    }

    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to mark story viewed", details: error.message });
  }
});

// GET /api/v1/stories/:id/viewers — who has seen this story (author only)
router.get("/:id/viewers", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const story = await Story.findById(req.params.id).populate("viewers.user", AUTHOR_FIELDS);
    if (!story) return res.status(404).json({ error: "Story not found" });
    if (String(story.author) !== req.user!.userId) {
      return res.status(403).json({ error: "Only the author can see who viewed this story" });
    }
    return res.json({ viewers: story.viewers });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load viewers", details: error.message });
  }
});

// DELETE /api/v1/stories/:id — author only
router.delete("/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: "Story not found" });
    if (String(story.author) !== req.user!.userId) {
      return res.status(403).json({ error: "You can only delete your own stories" });
    }
    await Story.deleteOne({ _id: story._id });
    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete story", details: error.message });
  }
});

export default router;
