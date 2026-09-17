import { Router, Response } from "express";
import { User } from "../../../models/User";
import { Follow } from "../../../models/Follow";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";

const router = Router();
const PUBLIC_FIELDS =
  "name username avatarHue avatarUrl bio isCreator verified isLive followersCount followingCount postsCount createdAt";

// GET /api/v1/users/top-creators — top creators and users with high follower counts for onboarding
router.get("/top-creators", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { interests } = req.query;
    const filter: any = { role: "user" };

    if (interests && typeof interests === "string") {
      const interestList = interests.split(",").map((s) => s.trim()).filter(Boolean);
      if (interestList.length > 0) {
        filter.$or = [
          { interests: { $in: interestList } },
          { isCreator: true }
        ];
      }
    }

    const users = await User.find(filter)
      .select("name username avatarHue avatarUrl isCreator verified isLive followersCount bio role interests")
      .sort({ isCreator: -1, followersCount: -1 })
      .limit(12);

    return res.json({ users });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load top creators", details: error.message });
  }
});

// GET /api/v1/users/suggested — a handful of accounts the viewer doesn't already follow
router.get("/suggested", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const following = await Follow.find({ follower: req.user!.userId }).select("following").lean();
    const excludeIds = [...following.map((f) => f.following), req.user!.userId];

    const users = await User.find({
      _id: { $nin: excludeIds },
      isCreator: true,
      role: "user",
    })
      .select("name username avatarHue avatarUrl isCreator verified isLive followersCount role")
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

// PATCH /api/v1/users/profile
router.patch("/profile", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, username, bio, avatarUrl, avatarHue } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUser = username.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
        return res.status(400).json({ error: "Username must be 3-20 characters: letters, numbers or underscores" });
      }
      const existing = await User.findOne({ username: cleanUser, _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ error: "Username is already taken" });
      }
      user.username = cleanUser;
    }

    if (name !== undefined && name.trim()) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (avatarHue !== undefined) user.avatarHue = Number(avatarHue) || user.avatarHue;

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: String(user._id),
        name: user.name,
        username: user.username,
        email: user.email,
        avatarHue: user.avatarHue,
        avatarUrl: user.avatarUrl || null,
        bio: user.bio,
        role: user.role,
        isCreator: user.isCreator,
        verified: user.verified,
        emailVerified: user.emailVerified,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        postsCount: user.postsCount || 0,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update profile", details: error.message });
  }
});

export default router;
