import { Router, Response } from "express";
import { Notification } from "../../../models/Notification";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";

const router = Router();

// GET /api/v1/notifications
router.get("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user!.userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("actor", "name username avatarHue avatarUrl")
        .populate("relatedPost", "kind mediaUrl thumbnailUrl body"),
      Notification.countDocuments({ recipient: req.user!.userId, read: false }),
    ]);

    return res.json({ notifications, unreadCount, page });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load notifications", details: error.message });
  }
});

// POST /api/v1/notifications/:id/read
router.post("/:id/read", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user!.userId },
      { read: true },
      { new: true },
    );
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    return res.json({ notification });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update notification", details: error.message });
  }
});

// POST /api/v1/notifications/read-all
router.post("/read-all", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Notification.updateMany({ recipient: req.user!.userId, read: false }, { read: true });
    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update notifications", details: error.message });
  }
});

export default router;
