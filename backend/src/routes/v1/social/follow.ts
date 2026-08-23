import { Router, Response } from "express";
import { Follow } from "../../../models/Follow";
import { User } from "../../../models/User";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { notify } from "../../../lib/notify";
import { getIO } from "../../../lib/socket";
import { awardPoints } from "../../../lib/rewards";

const router = Router();
const PUBLIC_FIELDS = "name username avatarHue avatarUrl isCreator verified bio followersCount followingCount postsCount isLive";

// GET /api/v1/follow/mine — usernames the current user follows (for client-side follow-state sync)
router.get("/mine", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rows = await Follow.find({ follower: req.user!.userId }).populate("following", "username").limit(5000);
    const usernames = rows.map((r: any) => r.following?.username).filter(Boolean);
    return res.json({ usernames });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load follow state", details: error.message });
  }
});

// POST /api/v1/follow/:username
router.post("/:username", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const target = await User.findOne({ username: String(req.params.username).toLowerCase() });
    if (!target) return res.status(404).json({ error: "User not found" });
    if (String(target._id) === req.user!.userId) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }

    const existing = await Follow.findOne({ follower: req.user!.userId, following: target._id });
    if (existing) {
      return res.json({ following: true, followersCount: target.followersCount });
    }

    await Follow.create({ follower: req.user!.userId, following: target._id });
    const [, updatedTarget] = await Promise.all([
      User.findByIdAndUpdate(req.user!.userId, { $inc: { followingCount: 1 } }),
      User.findByIdAndUpdate(target._id, { $inc: { followersCount: 1 } }, { new: true }),
    ]);

    await notify({
      recipient: String(target._id),
      actor: req.user!.userId,
      kind: "follow",
      text: "started following you",
    });

    getIO()?.emit("user:followers-changed", { username: target.username, followersCount: updatedTarget?.followersCount ?? 0 });
    await awardPoints(String(target._id), "follow", "You got a new follower").catch((err) =>
      console.error("[Rewards] Follow bonus failed:", err),
    );

    return res.json({ following: true, followersCount: updatedTarget?.followersCount ?? 0 });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to follow user", details: error.message });
  }
});

// DELETE /api/v1/follow/:username
router.delete("/:username", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const target = await User.findOne({ username: String(req.params.username).toLowerCase() });
    if (!target) return res.status(404).json({ error: "User not found" });

    const removed = await Follow.findOneAndDelete({ follower: req.user!.userId, following: target._id });
    if (!removed) {
      return res.json({ following: false, followersCount: target.followersCount });
    }

    const [, updatedTarget] = await Promise.all([
      User.findByIdAndUpdate(req.user!.userId, { $inc: { followingCount: -1 } }),
      User.findByIdAndUpdate(target._id, { $inc: { followersCount: -1 } }, { new: true }),
    ]);

    getIO()?.emit("user:followers-changed", { username: target.username, followersCount: updatedTarget?.followersCount ?? 0 });

    return res.json({ following: false, followersCount: updatedTarget?.followersCount ?? 0 });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to unfollow user", details: error.message });
  }
});

// GET /api/v1/follow/:username/followers
router.get("/:username/followers", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const target = await User.findOne({ username: String(req.params.username).toLowerCase() });
    if (!target) return res.status(404).json({ error: "User not found" });

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);

    const rows = await Follow.find({ following: target._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("follower", PUBLIC_FIELDS);

    let followingSet = new Set<string>();
    if (req.user) {
      const mine = await Follow.find({
        follower: req.user.userId,
        following: { $in: rows.map((r) => r.follower) },
      }).select("following");
      followingSet = new Set(mine.map((f) => String(f.following)));
    }

    return res.json({
      users: rows.map((r: any) => ({ ...r.follower.toObject(), isFollowing: followingSet.has(String(r.follower._id)) })),
      page,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load followers", details: error.message });
  }
});

// GET /api/v1/follow/:username/following
router.get("/:username/following", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const target = await User.findOne({ username: String(req.params.username).toLowerCase() });
    if (!target) return res.status(404).json({ error: "User not found" });

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);

    const rows = await Follow.find({ follower: target._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("following", PUBLIC_FIELDS);

    let followingSet = new Set<string>();
    if (req.user) {
      const mine = await Follow.find({
        follower: req.user.userId,
        following: { $in: rows.map((r) => r.following) },
      }).select("following");
      followingSet = new Set(mine.map((f) => String(f.following)));
    }

    return res.json({
      users: rows.map((r: any) => ({ ...r.following.toObject(), isFollowing: followingSet.has(String(r.following._id)) })),
      page,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load following", details: error.message });
  }
});

export default router;
