import { Router, Response } from "express";
import { User } from "../../../models/User";
import { Follow } from "../../../models/Follow";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";

const router = Router();
const PUBLIC_FIELDS =
  "name username avatarHue avatarUrl bio isCreator verified isLive followersCount followingCount postsCount createdAt";

// GET /api/v1/users/suggested — a handful of accounts the viewer doesn't already follow
router.get("/suggested", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const following = await Follow.find({ follower: req.user!.userId }).select("following").lean();
    const excludeIds = [...following.map((f) => f.following), req.user!.userId];

    const users = await User.find({ _id: { $nin: excludeIds } })
      .select("name username avatarHue avatarUrl isCreator verified isLive followersCount")
      .sort({ followersCount: -1 })
      .limit(5);

    return res.json({ users });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load suggestions", details: error.message });
  }
});

// GET /api/v1/users/:username
router.get("/:username", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ username: String(req.params.username).toLowerCase() }).select(PUBLIC_FIELDS);
    if (!user) return res.status(404).json({ error: "User not found" });

    let isFollowing = false;
    let isFollowedBy = false;
    if (req.user && req.user.userId !== String(user._id)) {
      const [a, b] = await Promise.all([
        Follow.exists({ follower: req.user.userId, following: user._id }),
        Follow.exists({ follower: user._id, following: req.user.userId }),
      ]);
      isFollowing = Boolean(a);
      isFollowedBy = Boolean(b);
    }

    return res.json({
      user: { ...user.toObject(), isFollowing, isFollowedBy, isSelf: req.user?.userId === String(user._id) },
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load profile", details: error.message });
  }
});

export default router;
