import { Router, Response } from "express";
import { Types } from "mongoose";
import { Story } from "../../../models/Story";
import { Follow } from "../../../models/Follow";
import { Notification } from "../../../models/Notification";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { moderationActive } from "../../../middleware/upload";
import { assessStory } from "../../../services/moderation/contentModerationService";
import { cancelJobsForContent } from "../../../services/moderation/moderationQueue";
import { purgeStoryMedia } from "../../../lib/storySweeper";
import { deleteCloudinaryAsset, isCloudinaryConfigured } from "../../../lib/cloudinary";

const router = Router();
const AUTHOR_FIELDS = "name username avatarHue avatarUrl isCreator verified";
const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

// POST /api/v1/stories — create (auto-expires 24h from now)
//
// CONTENT SAFETY: stories are created with moderation.status "processing"
// and are invisible in the story tray until APPROVED. Video stories go
// through the async frame-sampling queue; image + caption checks run inline.
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
      moderation: moderationActive() ? { status: "processing", updatedAt: new Date() } : undefined,
    });

    if (!moderationActive()) {
      const populated = await story.populate("author", AUTHOR_FIELDS);
      return res.status(201).json({ story: populated });
    }

    const result = await assessStory({
      storyId: String(story._id),
      authorId: req.user!.userId,
      caption: story.caption,
      mediaUrl: story.mediaUrl,
      mediaKey: story.mediaKey ? String(story.mediaKey) : undefined,
      isVideo: story.mediaType === "video",
    }).catch((err) => {
      console.error("[Moderation] assessStory failed:", err instanceof Error ? err.message : err);
      return null;
    });

    const fresh = await Story.findById(story._id).populate("author", AUTHOR_FIELDS);
    const responseStory = fresh ?? story;
    const moderationStatus = result
      ? result.decision === "APPROVED"
        ? "approved"
        : result.decision === "REJECTED"
          ? "rejected"
          : result.decision === "PENDING_REVIEW"
            ? "pending_review"
            : result.decision === "FAILED"
              ? "failed"
              : "processing"
      : "processing";

    return res.status(result?.decision === "REJECTED" ? 422 : 201).json({
      story: responseStory,
      moderation: {
        status: moderationStatus,
        userMessage: result?.userMessage,
      },
      ...(result?.decision === "PROCESSING" ? { processing: true } : {}),
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create story", details: error.message });
  }
});

// GET /api/v1/stories — active stories from you + people you follow, grouped by author
// Only APPROVED (or legacy) stories are listed; the author's own pending
// stories are included so they can see the "Checking…" state.
router.get("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const following = await Follow.find({ follower: req.user!.userId }).select("following").lean();
    const authorIds = [...following.map((f) => f.following), new Types.ObjectId(req.user!.userId)];

    const query: any = { author: { $in: authorIds }, expiresAt: { $gt: new Date() } };
    if (moderationActive()) {
      // Own stories: any state; others': approved or legacy only.
      query.$or = [
        { author: new Types.ObjectId(req.user!.userId) },
        { "moderation.status": "approved" },
        { moderation: { $exists: false } },
      ];
    }

    const stories = await Story.find(query)
      .sort({ createdAt: 1 })
      .populate("author", AUTHOR_FIELDS);

    const grouped = new Map<string, { author: any; items: any[]; seen: boolean }>();
    for (const story of stories) {
      const isOwn = String(story.author._id) === req.user!.userId;
      const st = (story as any).moderation?.status ?? "approved";
      if (!isOwn && st !== "approved") continue; // defence in depth
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

// POST /api/v1/stories/:id/reply — comment on a story & notify the author
// Own-story comments are allowed (they are just not self-notified).
router.post("/:id/reply", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Reply message is required" });
    }

    // Replies are user-generated text too — moderated before delivery.
    if (moderationActive()) {
      const { moderateText } = await import("../../../services/moderation/contentModerationService");
      const result = await moderateText({ text: message, surface: "story_reply" }).catch(() => null);
      if (result?.decision === "REJECTED") {
        return res.status(422).json({ error: result.userMessage || "This reply could not be sent." });
      }
    }

    const story = await Story.findById(req.params.id).populate("author", "name username");
    if (!story) return res.status(404).json({ error: "Story not found" });

    const authorId = String(story.author._id || story.author);
    const isOwnStory = authorId === req.user!.userId;

    // Create Notification for the story author (skip self-notifications).
    if (!isOwnStory) {
      await Notification.create({
        recipient: story.author._id || story.author,
        actor: req.user!.userId,
        kind: "story_reply",
        text: `replied to your story: "${message.trim().slice(0, 80)}"`,
        relatedPost: story._id as any,
      });
    }

    return res.status(201).json({ success: true, message: "Reply sent successfully!" });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to send story reply", details: error.message });
  }
});

// GET /api/v1/stories/:id/replies — comment thread for a story.
// Replies are stored as story_reply notifications tied to the story id
// (relatedPost), so the thread is readable by anyone who can see the story.
router.get("/:id/replies", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const story = await Story.findById(req.params.id).select("_id author");
    if (!story) return res.status(404).json({ error: "Story not found" });

    const { Notification } = await import("../../../models/Notification");
    const replies = await Notification.find({ kind: "story_reply", relatedPost: story._id })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate("actor", AUTHOR_FIELDS)
      .lean();

    return res.json({
      replies: replies.map((r: any) => ({
        _id: String(r._id),
        text: r.text,
        createdAt: r.createdAt,
        user: r.actor
          ? {
              _id: String(r.actor._id ?? r.actor),
              name: r.actor.name,
              username: r.actor.username,
              avatarHue: r.actor.avatarHue,
              avatarUrl: r.actor.avatarUrl,
              verified: r.actor.verified,
              isCreator: r.actor.isCreator,
            }
          : null,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load story replies", details: error.message });
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

// DELETE /api/v1/stories/:id — author only. Also purges the story's
// Cloudinary-hosted media + Media docs so deleted stories leave nothing behind.
router.delete("/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: "Story not found" });
    if (String(story.author) !== req.user!.userId) {
      return res.status(403).json({ error: "You can only delete your own stories" });
    }
    await cancelJobsForContent("story", String(story._id)).catch(() => undefined);
    await purgeStoryMedia(
      story.mediaKey ? String(story.mediaKey) : undefined,
      story.mediaUrl,
      story.mediaType === "video" ? "video" : "image",
    ).catch(() => undefined);
    if (story.mediaKey && story.mediaKey.startsWith("gihanga/") && isCloudinaryConfigured) {
      await deleteCloudinaryAsset(story.mediaKey, story.mediaType === "video" ? "video" : "image").catch(
        () => undefined,
      );
    }
    await Story.deleteOne({ _id: story._id });
    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete story", details: error.message });
  }
});

export default router;
