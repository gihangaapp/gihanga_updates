import { Router, Response } from "express";
import { Transaction } from "../../../../models/Transaction";
import { Wallet } from "../../../../models/Wallet";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { notify } from "../../../../lib/notify";

const router = Router();

// GET /api/v1/system/payments — pending deposits/withdrawals awaiting review
router.get("/", authenticateStaff, requirePermission("payments.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = (req.query.status as string) || "pending";
    const transactions = await Transaction.find({ kind: { $in: ["deposit", "payout"] }, status })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("user", "name username email mtnMomoNumber");
    return res.json({ transactions });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load payments queue", details: error.message });
  }
});

// POST /api/v1/system/payments/:id/approve
router.post("/:id/approve", authenticateStaff, requirePermission("payments.approve"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (tx.status !== "pending") return res.status(400).json({ error: "Transaction is not pending" });

    const wallet = await Wallet.findById(tx.wallet);
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    if (tx.kind === "deposit") {
      wallet.available += tx.amount;
      wallet.lifetime += tx.amount;
    } else if (tx.kind === "payout") {
      // amount is negative for payouts — the hold placed at request time already
      // moved it into `pending`; approving just releases the hold (it's gone for good).
      wallet.pending += tx.amount;
    }
    await wallet.save();

    tx.status = "completed";
    tx.approvedBy = req.staffUser!.userId as any;
    tx.approvedAt = new Date();
    await tx.save();

    await AuditLog.create({
      actor: req.staffUser!.userId,
      action: "payments.approve",
      targetId: String(tx._id),
      meta: { kind: tx.kind, amount: tx.amount, user: String(tx.user) },
    });

    await notify({
      recipient: String(tx.user),
      kind: "payment",
      text:
        tx.kind === "deposit"
          ? `Your deposit of ${Math.abs(tx.amount)} was approved`
          : `Your withdrawal of ${Math.abs(tx.amount)} was approved`,
    });

    return res.json({ transaction: tx });
  } catch (error: any) {
    return res.status(500).json({ error: "Approval failed", details: error.message });
  }
});

// POST /api/v1/system/payments/:id/reject
router.post("/:id/reject", authenticateStaff, requirePermission("payments.approve"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (tx.status !== "pending") return res.status(400).json({ error: "Transaction is not pending" });

    const wallet = await Wallet.findById(tx.wallet);
    if (wallet && tx.kind === "payout") {
      // Release the hold back to available since the withdrawal was rejected.
      wallet.available += Math.abs(tx.amount);
      wallet.pending += tx.amount;
      await wallet.save();
    }

    tx.status = "cancelled";
    tx.approvedBy = req.staffUser!.userId as any;
    tx.approvedAt = new Date();
    await tx.save();

    await AuditLog.create({
      actor: req.staffUser!.userId,
      action: "payments.reject",
      targetId: String(tx._id),
      meta: { kind: tx.kind, amount: tx.amount, reason },
    });

    await notify({
      recipient: String(tx.user),
      kind: "payment",
      text: `Your ${tx.kind} request was declined${reason ? `: ${reason}` : ""}`,
    });

    return res.json({ transaction: tx });
  } catch (error: any) {
    return res.status(500).json({ error: "Rejection failed", details: error.message });
  }
});

export default router;
