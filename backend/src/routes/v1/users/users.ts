import { Router, Response } from "express";
import { User } from "../../../models/User";
import { Post } from "../../../models/Post";
import { Follow } from "../../../models/Follow";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { moderationActive } from "../../../middleware/upload";
import { Media } from "../../../models/Media";
import { assessProfileText } from "../../../services/moderation/contentModerationService";

const router = Router();
const PUBLIC_FIELDS =
  "name username avatarHue avatarUrl coverUrl bio isCreator verified isLive followersCount followingCount postsCount createdAt";

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
    const isSelf = req.user?.userId === String(user._id);
    const [publishedPostsCount, followState] = await Promise.all([
      // Use the indexed post collection as the source of truth so older or
      // previously stale denormalized counters cannot leave a profile at zero.
      // The author also sees an in-flight post in their count while moderation
      // runs; visitors only count content that has actually been published.
      Post.countDocuments({
        author: user._id,
        status: isSelf ? { $in: ["published", "processing"] } : "published",
      }).exec(),
      req.user && req.user.userId !== String(user._id)
        ? Promise.all([
            Follow.exists({ follower: req.user.userId, following: user._id }),
            Follow.exists({ follower: user._id, following: req.user.userId }),
          ])
        : Promise.resolve([null, null] as const),
    ]);
    isFollowing = Boolean(followState[0]);
    isFollowedBy = Boolean(followState[1]);

    return res.json({
      user: {
        ...user.toObject(),
        postsCount: publishedPostsCount,
        isFollowing,
        isFollowedBy,
        isSelf,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load profile", details: error.message });
  }
});

// PATCH /api/v1/users/profile
//
// CONTENT SAFETY: name/username/bio are user-generated text and moderated
// before the change is applied. An avatarUrl change is only accepted when
// it points at a Media document previously approved as an avatar (uploads
// of avatars already run the image check at upload time).
router.patch("/profile", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, username, bio, avatarUrl, coverUrl, avatarHue } = req.body;

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
    if (avatarHue !== undefined) user.avatarHue = Number(avatarHue) || user.avatarHue;

    // ── Moderation: profile text (name/username/bio) ────────────────────────
    if (moderationActive() && (name !== undefined || bio !== undefined || username !== undefined)) {
      const result = await assessProfileText(userId, {
        name: name !== undefined ? String(name).trim() : undefined,
        bio: bio !== undefined ? String(bio).trim() : undefined,
        username: username !== undefined ? String(username).trim().toLowerCase() : undefined,
      }).catch(() => null);

      if (result?.decision === "REJECTED") {
        return res.status(422).json({
          error: result.userMessage || "These profile changes could not be saved.",
        });
      }
      if (result?.decision === "PENDING_REVIEW") {
        return res.status(202).json({
          message: "Your profile changes are being reviewed and will appear once cleared.",
          user: publicUserShape(user),
        });
      }
    }

    // ── Moderation: avatar must reference APPROVED platform media ───────────
    if (avatarUrl !== undefined && avatarUrl !== user.avatarUrl) {
      if (moderationActive() && avatarUrl) {
        const { Media } = await import("../../../models/Media");
        const media = await Media.findOne({
          $or: [{ cdnUrl: avatarUrl }, { "variants.url": avatarUrl }],
        });
        if (!media || media.moderationStatus !== "approved") {
          return res.status(400).json({
            error: "Profile pictures must be uploaded through the platform and pass safety checks",
          });
        }
      }
      user.avatarUrl = avatarUrl;
    }

    // A cover may only reference this user's approved image upload while media
    // moderation is enabled. Cover is optional, so existing profiles are unchanged.
    if (coverUrl !== undefined && coverUrl !== user.coverUrl) {
      if (moderationActive() && coverUrl) {
        const mediaId = typeof coverUrl === "string"
          ? coverUrl.match(/\/media\/file\/([a-f0-9]{24})(?:[/?#]|$)/i)?.[1]
          : undefined;
        const coverMedia = mediaId
          ? await Media.findOne({
              _id: mediaId,
              ownerId: userId,
              context: "cover",
              moderationStatus: "approved",
            })
          : await Media.findOne({
              ownerId: userId,
              context: "cover",
              moderationStatus: "approved",
              $or: [{ cdnUrl: coverUrl }, { "variants.url": coverUrl }],
            });
        if (!coverMedia) {
          return res.status(400).json({
            error: "Cover photos must be uploaded through the platform and pass safety checks",
          });
        }
      }
      user.coverUrl = coverUrl || undefined;
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: publicUserShape(user),
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update profile", details: error.message });
  }
});

function publicUserShape(user: any) {
  return {
    id: String(user._id),
    name: user.name,
    username: user.username,
    email: user.email,
    avatarHue: user.avatarHue,
    avatarUrl: user.avatarUrl || null,
    coverUrl: user.coverUrl || null,
    bio: user.bio,
    role: user.role,
    isCreator: user.isCreator,
    verified: user.verified,
    emailVerified: user.emailVerified,
    followersCount: user.followersCount || 0,
    followingCount: user.followingCount || 0,
    postsCount: user.postsCount || 0,
    createdAt: user.createdAt,
  };
}

export default router;
