import { Router, Response } from "express";
import { Advertisement } from "../../../../models/Advertisement";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { notify } from "../../../../lib/notify";

const router = Router();

// GET /api/v1/system/ads — every campaign, for the admin oversight dashboard
router.get("/", authenticateStaff, requirePermission("ads.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const query: any = {};
    if (status) query.status = status;
    const campaigns = await Advertisement.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("creator", "name username email");
    return res.json({ campaigns });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load campaigns", details: error.message });
  }
});

// POST /api/v1/system/ads/:id/approve
router.post("/:id/approve", authenticateStaff, requirePermission("ads.approve"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    campaign.status = "active";
    campaign.approvedBy = req.staffUser!.userId as any;
    campaign.startDate = campaign.startDate || new Date();
    await campaign.save();

    await AuditLog.create({ actor: req.staffUser!.userId, action: "ads.approve", targetId: String(campaign._id) });
    await notify({ recipient: String(campaign.creator), kind: "system", text: `Your ad campaign "${campaign.name}" was approved and is now live` });

    return res.json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to approve campaign", details: error.message });
  }
});

// POST /api/v1/system/ads/:id/reject
router.post("/:id/reject", authenticateStaff, requirePermission("ads.approve"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    campaign.status = "rejected";
    campaign.rejectionReason = reason?.trim() || "Did not meet ad guidelines";
    await campaign.save();

    await AuditLog.create({ actor: req.staffUser!.userId, action: "ads.reject", targetId: String(campaign._id), meta: { reason } });
    await notify({ recipient: String(campaign.creator), kind: "system", text: `Your ad campaign "${campaign.name}" was rejected: ${campaign.rejectionReason}` });

    return res.json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to reject campaign", details: error.message });
  }
});

// POST /api/v1/system/ads/:id/pause — admin kill switch, independent of the creator's own pause
router.post("/:id/pause", authenticateStaff, requirePermission("ads.manage"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findByIdAndUpdate(req.params.id, { status: "paused" }, { new: true });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    await AuditLog.create({ actor: req.staffUser!.userId, action: "ads.pause", targetId: String(campaign._id) });
    return res.json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to pause campaign", details: error.message });
  }
});

export default router;
