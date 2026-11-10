import mongoose from "mongoose";
import { Router, Response } from "express";
import { Transaction } from "../../../../models/Transaction";
import { Wallet } from "../../../../models/Wallet";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { notify } from "../../../../lib/notify";

const router = Router();
const TRANSACTION_OPTIONS = {
  readPreference: "primary" as const,
  readConcern: { level: "snapshot" as const },
  writeConcern: { w: "majority" as const },
};

class StaffPaymentError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "StaffPaymentError";
  }
}

function isProviderManaged(tx: { provider?: string; momoReferenceId?: string }): boolean {
  return tx.provider === "MTN_MOMO" || Boolean(tx.momoReferenceId);
}

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

// MTN-linked payments are settled only after the backend independently verifies
// the provider's terminal status. Staff must not manually manufacture success.
router.post("/:id/approve", authenticateStaff, requirePermission("payments.approve"), async (req: AuthenticatedRequest, res: Response) => {
  const session = await mongoose.startSession();
  let settledTransaction: any = null;
  try {
    await session.withTransaction(async () => {
      const tx = await Transaction.findById(req.params.id).session(session);
      if (!tx) throw new StaffPaymentError(404, "Transaction not found");
      if (tx.status !== "pending") throw new StaffPaymentError(409, "Transaction is not pending");
      if (isProviderManaged(tx)) {
        throw new StaffPaymentError(409, "MTN transactions must be settled by verified provider status, not manual staff approval");
      }

      const claimed = await Transaction.findOneAndUpdate(
        { _id: tx._id, status: "pending", provider: { $ne: "MTN_MOMO" }, momoReferenceId: { $in: [null, ""] } },
        { $set: { status: "completed", approvedBy: req.staffUser!.userId, approvedAt: new Date(), settledAt: new Date() } },
        { new: true, session },
      );
      if (!claimed) throw new StaffPaymentError(409, "Transaction was already processed by another action");

      const amount = Math.abs(Number(tx.amount));
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new StaffPaymentError(422, "Transaction amount is invalid");
      if ((tx.kind === "deposit" && Number(tx.amount) <= 0) || (tx.kind === "payout" && Number(tx.amount) >= 0)) {
        throw new StaffPaymentError(422, "Transaction amount sign is inconsistent with its type");
      }

      let walletResult;
      if (tx.kind === "deposit") {
        walletResult = await Wallet.updateOne(
          { _id: tx.wallet },
          { $inc: { available: amount, lifetime: amount } },
          { session },
        );
      } else if (tx.kind === "payout") {
        walletResult = await Wallet.updateOne(
          { _id: tx.wallet, pending: { $gte: amount } },
          { $inc: { pending: -amount } },
          { session },
        );
      } else {
        throw new StaffPaymentError(422, "Only deposit and payout transactions can be approved here");
      }
      if (walletResult.matchedCount !== 1) throw new StaffPaymentError(409, "Wallet is missing or does not contain the expected payout hold");

      await AuditLog.create([{
        actor: req.staffUser!.userId,
        action: "payments.approve",
        targetId: String(tx._id),
        ipAddress: req.ip,
        meta: { kind: tx.kind, amount: tx.amount, user: String(tx.user) },
      }], { session });
      settledTransaction = claimed;
    }, TRANSACTION_OPTIONS);

    try {
      await notify({
        recipient: String(settledTransaction.user),
        kind: "payment",
        text: settledTransaction.kind === "deposit"
          ? `Your deposit of ${Math.abs(settledTransaction.amount)} was approved`
          : `Your withdrawal of ${Math.abs(settledTransaction.amount)} was approved`,
      });
    } catch (notificationError) {
      console.error("[StaffPayments] Approval notification failed:", notificationError instanceof Error ? notificationError.message : "unknown error");
    }

    return res.json({ transaction: settledTransaction });
  } catch (error: any) {
    const status = error instanceof StaffPaymentError ? error.statusCode : 500;
    return res.status(status).json({ error: error.message || "Approval failed" });
  } finally {
    await session.endSession();
  }
});

// POST /api/v1/system/payments/:id/reject
router.post("/:id/reject", authenticateStaff, requirePermission("payments.approve"), async (req: AuthenticatedRequest, res: Response) => {
  const session = await mongoose.startSession();
  let rejectedTransaction: any = null;
  const reason = String(req.body?.reason || "").trim().slice(0, 500);
  try {
    await session.withTransaction(async () => {
      const tx = await Transaction.findById(req.params.id).session(session);
      if (!tx) throw new StaffPaymentError(404, "Transaction not found");
      if (tx.status !== "pending") throw new StaffPaymentError(409, "Transaction is not pending");
      if (isProviderManaged(tx)) {
        throw new StaffPaymentError(409, "MTN transactions must be resolved from verified provider status, not manual staff rejection");
      }

      const claimed = await Transaction.findOneAndUpdate(
        { _id: tx._id, status: "pending", provider: { $ne: "MTN_MOMO" }, momoReferenceId: { $in: [null, ""] } },
        { $set: { status: "cancelled", failureReason: reason || "Rejected by staff", approvedBy: req.staffUser!.userId, approvedAt: new Date() } },
        { new: true, session },
      );
      if (!claimed) throw new StaffPaymentError(409, "Transaction was already processed by another action");

      if (tx.kind === "payout") {
        const amount = Math.abs(Number(tx.amount));
        if (!Number.isSafeInteger(amount) || amount <= 0 || Number(tx.amount) >= 0) {
          throw new StaffPaymentError(422, "Payout transaction amount is invalid");
        }
        const walletResult = await Wallet.updateOne(
          { _id: tx.wallet, pending: { $gte: amount } },
          { $inc: { available: amount, pending: -amount } },
          { session },
        );
        if (walletResult.matchedCount !== 1) throw new StaffPaymentError(409, "Wallet is missing or does not contain the expected payout hold");
      }

      await AuditLog.create([{
        actor: req.staffUser!.userId,
        action: "payments.reject",
        targetId: String(tx._id),
        ipAddress: req.ip,
        meta: { kind: tx.kind, amount: tx.amount, reason },
      }], { session });
      rejectedTransaction = claimed;
    }, TRANSACTION_OPTIONS);

    try {
      await notify({
        recipient: String(rejectedTransaction.user),
        kind: "payment",
        text: `Your ${rejectedTransaction.kind} request was declined${reason ? `: ${reason}` : ""}`,
      });
    } catch (notificationError) {
      console.error("[StaffPayments] Rejection notification failed:", notificationError instanceof Error ? notificationError.message : "unknown error");
    }

    return res.json({ transaction: rejectedTransaction });
  } catch (error: any) {
    const status = error instanceof StaffPaymentError ? error.statusCode : 500;
    return res.status(status).json({ error: error.message || "Rejection failed" });
  } finally {
    await session.endSession();
  }
});

export default router;
