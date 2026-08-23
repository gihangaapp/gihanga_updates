import { Router, Response } from "express";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import {
  getRewardRates,
  setRewardRates,
  getPointsToCashRate,
  setPointsToCashRate,
  DEFAULT_REWARD_RATES,
} from "../../../../lib/rewards";
import { AuditLog } from "../../../../models/AuditLog";

const router = Router();

// GET /api/v1/system/rewards/config
router.get("/config", authenticateStaff, requirePermission("rewards.view"), async (_req, res: Response) => {
  try {
    const [rates, pointsToCashRate] = await Promise.all([getRewardRates(), getPointsToCashRate()]);
    return res.json({ rates, defaults: DEFAULT_REWARD_RATES, pointsToCashRate });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load reward config", details: error.message });
  }
});

// PUT /api/v1/system/rewards/config
router.put("/config", authenticateStaff, requirePermission("rewards.edit"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { rates, pointsToCashRate } = req.body;
    const updated = rates ? await setRewardRates(rates, req.staffUser!.userId) : await getRewardRates();
    const updatedRate =
      pointsToCashRate !== undefined
        ? await setPointsToCashRate(Number(pointsToCashRate), req.staffUser!.userId)
        : await getPointsToCashRate();

    await AuditLog.create({
      actor: req.staffUser!.userId,
      action: "rewards.edit",
      targetId: "reward_config",
      meta: { rates: updated, pointsToCashRate: updatedRate },
    });

    return res.json({ rates: updated, pointsToCashRate: updatedRate });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update reward config", details: error.message });
  }
});

export default router;
