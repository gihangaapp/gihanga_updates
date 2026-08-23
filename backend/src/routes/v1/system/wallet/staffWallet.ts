import { Router, Response } from "express";
import { Wallet } from "../../../../models/Wallet";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { notify } from "../../../../lib/notify";

const router = Router();

router.post("/:userId/freeze", authenticateStaff, requirePermission("wallet.freeze"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const wallet = await Wallet.findOneAndUpdate({ user: String(req.params.userId) }, { frozen: true }, { new: true, upsert: true });
    await AuditLog.create({ actor: req.staffUser!.userId, action: "wallet.freeze", targetId: String(req.params.userId) });
    await notify({ recipient: String(req.params.userId), kind: "system", text: "Your wallet has been frozen. Contact support for details." });
    return res.json({ wallet });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to freeze wallet", details: error.message });
  }
});

router.post("/:userId/unfreeze", authenticateStaff, requirePermission("wallet.unfreeze"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const wallet = await Wallet.findOneAndUpdate({ user: String(req.params.userId) }, { frozen: false }, { new: true, upsert: true });
    await AuditLog.create({ actor: req.staffUser!.userId, action: "wallet.unfreeze", targetId: String(req.params.userId) });
    await notify({ recipient: String(req.params.userId), kind: "system", text: "Your wallet has been unfrozen." });
    return res.json({ wallet });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to unfreeze wallet", details: error.message });
  }
});

export default router;
