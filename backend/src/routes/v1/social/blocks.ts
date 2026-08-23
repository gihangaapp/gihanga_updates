import { Router, Response } from "express";
import { Block } from "../../../models/Block";
import { User } from "../../../models/User";
import { Follow } from "../../../models/Follow";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";

const router = Router();

// GET /api/v1/blocks/mine — usernames the current user has blocked
router.get("/mine", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rows = await Block.find({ blocker: req.user!.userId }).populate("blocked", "username");
    return res.json({ usernames: rows.map((r: any) => r.blocked?.username).filter(Boolean) });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load blocked users", details: error.message });
  }
});

// POST /api/v1/blocks/:username — toggle block
router.post("/:username", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const target = await User.findOne({ username: String(req.params.username).toLowerCase() });
    if (!target) return res.status(404).json({ error: "User not found" });
    if (String(target._id) === req.user!.userId) return res.status(400).json({ error: "You can't block yourself" });

    const existing = await Block.findOne({ blocker: req.user!.userId, blocked: target._id });
    if (existing) {
      await Block.deleteOne({ _id: existing._id });
      return res.json({ blocked: false });
    }

    await Block.create({ blocker: req.user!.userId, blocked: target._id });
    // Blocking also unwinds any follow relationship in either direction.
    await Follow.deleteMany({
      $or: [
        { follower: req.user!.userId, following: target._id },
        { follower: target._id, following: req.user!.userId },
      ],
    });

    return res.json({ blocked: true });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update block", details: error.message });
  }
});

export default router;
