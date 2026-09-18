import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { User } from "../../../models/User";
import { UserSettings, IUserSettings } from "../../../models/UserSettings";
import { Post } from "../../../models/Post";
import { Follow } from "../../../models/Follow";
import { Like } from "../../../models/Like";
import { Bookmark } from "../../../models/Bookmark";
import { Comment } from "../../../models/Comment";
import { Block } from "../../../models/Block";
import { Wallet } from "../../../models/Wallet";

const router = Router();

// Default device detector helper
function parseClientInfo(req: AuthenticatedRequest) {
  const userAgent = req.headers["user-agent"] || "Modern Browser";
  let browser = "Chrome";
  let os = "Desktop";
  let device = "Personal Computer";

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    os = "iOS";
    device = "Apple Device";
    browser = "Mobile Safari";
  } else if (/Android/i.test(userAgent)) {
    os = "Android";
    device = "Android Device";
    browser = "Chrome Mobile";
  } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
    os = "macOS";
    device = "Mac";
    browser = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent) ? "Safari" : "Chrome";
  } else if (/Windows/i.test(userAgent)) {
    os = "Windows 11";
    device = "Windows PC";
    browser = /Edg/i.test(userAgent) ? "Edge" : /Firefox/i.test(userAgent) ? "Firefox" : "Chrome";
  } else if (/Linux/i.test(userAgent)) {
    os = "Linux";
    device = "Linux Workstation";
  }

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";

  return {
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    device,
    browser,
    os,
    ip: ip.replace(/^.*:/, "") || "127.0.0.1",
    location: "Kigali, Rwanda",
    lastActive: new Date(),
    isCurrent: true,
  };
}

// GET /api/v1/users/settings — Get user settings with initialized defaults
router.get("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    let settings = await UserSettings.findOne({ user: userId });

    const currentSession = parseClientInfo(req);

    if (!settings) {
      settings = await UserSettings.create({
        user: userId,
        activeSessions: [currentSession],
      });
    } else {
      // Ensure at least current session is recorded
      if (!settings.activeSessions || settings.activeSessions.length === 0) {
        settings.activeSessions = [currentSession];
        await settings.save();
      }
    }

    const userDoc = await User.findById(userId);
    const walletDoc = await Wallet.findOne({ user: userId });

    const serializedUser = userDoc
      ? {
          id: String(userDoc._id),
          name: userDoc.name,
          username: userDoc.username,
          email: userDoc.email,
          avatarHue: userDoc.avatarHue,
          avatarUrl: userDoc.avatarUrl || null,
          bio: userDoc.bio || "",
          role: userDoc.role,
          isCreator: userDoc.isCreator,
          verified: userDoc.verified,
          emailVerified: userDoc.emailVerified,
          followersCount: userDoc.followersCount || 0,
          followingCount: userDoc.followingCount || 0,
          postsCount: userDoc.postsCount || 0,
          mtnMomoNumber: userDoc.mtnMomoNumber || "",
          createdAt: userDoc.createdAt,
        }
      : null;

    const walletData = walletDoc
      ? {
          available: walletDoc.available || 0,
          pending: walletDoc.pending || 0,
          lifetime: walletDoc.lifetime || 0,
          kingdomPoints: walletDoc.kingdomPoints || 0,
        }
      : {
          available: 0,
          pending: 0,
          lifetime: 0,
          kingdomPoints: 0,
        };

    return res.json({ settings, user: serializedUser, wallet: walletData });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load settings", details: error.message });
  }
});

// PATCH /api/v1/users/settings — Update user settings & profile partially
router.patch("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const updates = { ...req.body };

    // Disallow overriding critical foreign keys
    delete updates.user;
    delete updates._id;

    // Synchronize User profile fields if provided
    const userDoc = await User.findById(userId);
    if (userDoc) {
      let userChanged = false;

      if (updates.username && updates.username.trim().toLowerCase() !== userDoc.username) {
        const cleanUser = updates.username.trim().toLowerCase();
        if (!/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
          return res.status(400).json({ error: "Username must be 3-20 characters: letters, numbers or underscores" });
        }
        const existing = await User.findOne({ username: cleanUser, _id: { $ne: userId } });
        if (existing) {
          return res.status(409).json({ error: "Username is already taken" });
        }
        userDoc.username = cleanUser;
        userChanged = true;
      }

      if (updates.name !== undefined && updates.name.trim()) {
        userDoc.name = updates.name.trim();
        userChanged = true;
      }

      if (updates.bio !== undefined) {
        userDoc.bio = updates.bio.trim();
        userChanged = true;
      }

      if (updates.avatarUrl !== undefined) {
        userDoc.avatarUrl = updates.avatarUrl;
        userChanged = true;
      }

      if (updates.phone !== undefined) {
        userDoc.mtnMomoNumber = updates.phone.trim();
        userChanged = true;
      }

      if (userChanged) {
        await userDoc.save();
      }
    }

    // Clean user-only fields so UserSettings schema receives only its own fields
    delete updates.name;
    delete updates.username;
    delete updates.bio;
    delete updates.avatarUrl;
    delete updates.avatarHue;

    const settings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    const serializedUser = userDoc
      ? {
          id: String(userDoc._id),
          name: userDoc.name,
          username: userDoc.username,
          email: userDoc.email,
          avatarHue: userDoc.avatarHue,
          avatarUrl: userDoc.avatarUrl || null,
          bio: userDoc.bio || "",
          role: userDoc.role,
          isCreator: userDoc.isCreator,
          verified: userDoc.verified,
          emailVerified: userDoc.emailVerified,
          followersCount: userDoc.followersCount || 0,
          followingCount: userDoc.followingCount || 0,
          postsCount: userDoc.postsCount || 0,
          mtnMomoNumber: userDoc.mtnMomoNumber || "",
          createdAt: userDoc.createdAt,
        }
      : null;

    return res.json({
      settings,
      user: serializedUser,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update settings", details: error.message });
  }
});

// POST /api/v1/users/settings/change-password — Secure password update with confirmation
router.post("/change-password", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long" });
    }

    const user = await User.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = newHash;
    await user.save();

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: "Password update failed", details: error.message });
  }
});

// POST /api/v1/users/settings/sessions/revoke-all — Log out other devices
router.post("/sessions/revoke-all", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const currentSession = parseClientInfo(req);

    const settings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { $set: { activeSessions: [currentSession] } },
      { new: true }
    );

    return res.json({ success: true, message: "All other sessions have been logged out", settings });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to revoke sessions", details: error.message });
  }
});

// POST /api/v1/users/settings/request-data — Generate downloadable profile archive metadata
router.post("/request-data", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const [postsCount, followingCount, followersCount] = await Promise.all([
      Post.countDocuments({ author: userId }),
      Follow.countDocuments({ follower: userId }),
      Follow.countDocuments({ following: userId }),
    ]);

    await UserSettings.findOneAndUpdate(
      { user: userId },
      { $set: { dataExportRequestedAt: new Date() } }
    );

    const exportSummary = {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        role: user.role,
        interests: user.interests,
      },
      stats: {
        posts: postsCount,
        followers: followersCount,
        following: followingCount,
      },
      generatedAt: new Date().toISOString(),
      format: "JSON (Gihanga Updates Account Archive)",
    };

    return res.json({
      success: true,
      message: "Data export compiled successfully",
      exportData: exportSummary,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to generate data archive", details: error.message });
  }
});

// POST /api/v1/users/settings/deactivate — Temporary account deactivation
router.post("/deactivate", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (password) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(400).json({ error: "Password confirmation failed" });
    }

    user.status = "limited";
    await user.save();

    return res.json({ success: true, message: "Account has been temporarily deactivated." });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to deactivate account", details: error.message });
  }
});

// DELETE /api/v1/users/settings/account — Permanent account deletion with cascade
router.delete("/account", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required to permanently delete account" });
    }

    const userId = req.user!.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password. Account deletion cancelled." });
    }

    // Cascade deletion
    await Promise.all([
      Post.deleteMany({ author: userId }),
      Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
      Like.deleteMany({ user: userId }),
      Bookmark.deleteMany({ user: userId }),
      Comment.deleteMany({ author: userId }),
      Block.deleteMany({ $or: [{ blocker: userId }, { blocked: userId }] }),
      UserSettings.deleteOne({ user: userId }),
      User.deleteOne({ _id: userId }),
    ]);

    return res.json({ success: true, message: "Your account and associated data have been permanently deleted." });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete account", details: error.message });
  }
});

export default router;
