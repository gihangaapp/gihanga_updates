import { Router, Response } from "express";
import { Notification } from "../../../../models/Notification";
import { authenticateStaff, AuthenticatedRequest } from "../../../../middleware/rbac";

const router = Router();

// GET /api/v1/system/notifications
router.get("/", authenticateStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.staffUser!.userId }).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ recipient: req.staffUser!.userId, read: false }),
    ]);
    return res.json({ notifications, unreadCount });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load notifications", details: error.message });
  }
});

router.post("/read-all", authenticateStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Notification.updateMany({ recipient: req.staffUser!.userId, read: false }, { read: true });
    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update notifications", details: error.message });
  }
});

export default router;
