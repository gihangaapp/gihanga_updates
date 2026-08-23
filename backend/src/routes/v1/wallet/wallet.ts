import { Router, Response } from "express";
import mongoose from "mongoose";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { getWalletSummary, applyLedgerEntry } from "../../../lib/wallet";
import { getPointsToCashRate } from "../../../lib/rewards";
import { Transaction } from "../../../models/Transaction";
import { Wallet } from "../../../models/Wallet";
import { User } from "../../../models/User";
import { requestToPay, transfer, isMomoConfigured, getRequestToPayStatus, getTransferStatus, normalizePhone, getMomoCurrency } from "../../../lib/momo";
import { settleMomoTransaction } from "../../../lib/paymentSettlement";
import { notify } from "../../../lib/notify";
import { notifyStaff } from "../../../lib/staffNotify";

const router = Router();

// GET /api/v1/wallet/me
router.get("/me", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const wallet = await getWalletSummary(req.user!.userId);
    const pointsToCashRate = await getPointsToCashRate();
    return res.json({
      wallet,
      pointsToCashRate,
      momo: { depositConfigured: isMomoConfigured("collection"), withdrawConfigured: isMomoConfigured("disbursement") },
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load wallet", details: error.message });
  }
});

// GET /api/v1/wallet/transactions — paginated history
router.get("/transactions", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const [transactions, total] = await Promise.all([
      Transaction.find({ user: req.user!.userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments({ user: req.user!.userId }),
    ]);

    return res.json({ transactions, page, total, hasMore: page * limit < total });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load transactions", details: error.message });
  }
});

const MIN_DEPOSIT = 500; // RWF
const MIN_WITHDRAW = 1000;

// POST /api/v1/wallet/deposit — MTN MoMo Collections RequestToPay
router.post("/deposit", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, phoneNumber } = req.body;
    const numericAmount = Number(amount);
    if (!Number.isSafeInteger(numericAmount) || numericAmount < MIN_DEPOSIT) {
      return res.status(400).json({ error: `Minimum deposit is ${MIN_DEPOSIT} RWF` });
    }
    if (!phoneNumber?.trim()) return res.status(400).json({ error: "A mobile money phone number is required" });
    let normalizedPhone: string;
    try { normalizedPhone = normalizePhone(phoneNumber); } catch { return res.status(400).json({ error: "Enter a valid Rwanda MTN phone number" }); }

    const wallet = await Wallet.findOne({ user: req.user!.userId }).then(
      (w) => w ?? Wallet.create({ user: req.user!.userId }),
    );
    if (wallet.frozen) return res.status(403).json({ error: "Your wallet is frozen — contact support" });
    const idempotencyKey = String(req.get("Idempotency-Key") || req.body?.idempotencyKey || "").trim();
    if (idempotencyKey) {
      const prior = await Transaction.findOne({ user: req.user!.userId, kind: "deposit", idempotencyKey });
      if (prior) return res.status(202).json({ transaction: prior, message: "This payment request already exists.", mode: prior.momoReferenceId ? "live" : "simulated" });
    }

    // Record the attempt as pending immediately — this is the row an admin sees in the
    // payments queue and the one the MoMo callback (or manual approval) will complete.
    const tx = await Transaction.create({
      wallet: wallet._id,
      user: req.user!.userId,
      kind: "deposit",
      amount: numericAmount,
      label: "MTN MoMo wallet deposit",
      status: "pending",
      provider: "MTN_MOMO",
      currency: getMomoCurrency(),
      customerPhone: normalizedPhone,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });
    await notifyStaff("payments", `New deposit request: ${numericAmount} pending review`, { transactionId: String(tx._id) });

    if (isMomoConfigured("collection")) {
      try {
        const { referenceId } = await requestToPay({
          amount: numericAmount,
          phone: normalizedPhone,
          externalId: String(tx._id),
          payerMessage: "Gihanga Updates wallet deposit",
        });
        tx.momoReferenceId = referenceId;
        tx.momoStatus = "PENDING";
        await tx.save();
        return res.status(202).json({
          transaction: tx,
          message: "Check your phone to approve the payment request.",
          mode: "live",
        });
      } catch (momoError: any) {
        tx.status = "failed";
        await tx.save();
        return res.status(502).json({ error: momoError.message || "MTN MoMo request failed" });
      }
    }

    // Simulated-pending mode: no MoMo credentials configured yet. The transaction stays
    // pending until an admin approves it from the payments queue (or real credentials
    // are added later and this code path is naturally replaced by the live one above).
    return res.status(202).json({
      transaction: tx,
      message:
        "MTN MoMo isn't connected yet on this server, so your deposit is pending admin review instead of an instant phone prompt.",
      mode: "simulated",
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Deposit request failed", details: error.message });
  }
});

// POST /api/v1/wallet/withdraw — MTN MoMo Disbursements Transfer
router.post("/withdraw", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, phoneNumber } = req.body;
    const numericAmount = Number(amount);
    if (!Number.isSafeInteger(numericAmount) || numericAmount < MIN_WITHDRAW) {
      return res.status(400).json({ error: `Minimum withdrawal is ${MIN_WITHDRAW} RWF` });
    }
    if (!phoneNumber?.trim()) return res.status(400).json({ error: "A mobile money phone number is required" });
    let normalizedPhone: string;
    try { normalizedPhone = normalizePhone(phoneNumber); } catch { return res.status(400).json({ error: "Enter a valid Rwanda MTN phone number" }); }

    const wallet = await Wallet.findOne({ user: req.user!.userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    if (wallet.frozen) return res.status(403).json({ error: "Your wallet is frozen — contact support" });
    const idempotencyKey = String(req.get("Idempotency-Key") || req.body?.idempotencyKey || "").trim();
    if (idempotencyKey) {
      const prior = await Transaction.findOne({ user: req.user!.userId, kind: "payout", idempotencyKey });
      if (prior) return res.status(202).json({ transaction: prior, message: "This withdrawal request already exists.", mode: prior.momoReferenceId ? "live" : "simulated" });
    }
    if (wallet.available < numericAmount) return res.status(400).json({ error: "Insufficient available balance" });

    // Hold the funds immediately so the same balance can't be withdrawn twice while pending.
    wallet.available -= numericAmount;
    wallet.pending += numericAmount;
    await wallet.save();

    const tx = await Transaction.create({
      wallet: wallet._id,
      user: req.user!.userId,
      kind: "payout",
      amount: -numericAmount,
      label: "MTN MoMo wallet withdrawal",
      status: "pending",
      provider: "MTN_MOMO",
      currency: getMomoCurrency(),
      customerPhone: normalizedPhone,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });
    await notifyStaff("payments", `New withdrawal request: ${numericAmount} pending review`, { transactionId: String(tx._id) });

    if (isMomoConfigured("disbursement")) {
      try {
        const { referenceId } = await transfer({
          amount: numericAmount,
          phone: normalizedPhone,
          externalId: String(tx._id),
          payerMessage: "Gihanga Updates wallet withdrawal",
        });
        tx.momoReferenceId = referenceId;
        tx.momoStatus = "PENDING";
        await tx.save();
        return res.status(202).json({ transaction: tx, message: "Withdrawal submitted to MTN MoMo.", mode: "live" });
      } catch (momoError: any) {
        // Roll back the hold — the disbursement never actually left.
        wallet.available += numericAmount;
        wallet.pending = Math.max(0, wallet.pending - numericAmount);
        await wallet.save();
        tx.status = "failed";
        await tx.save();
        return res.status(502).json({ error: momoError.message || "MTN MoMo transfer failed" });
      }
    }

    return res.status(202).json({
      transaction: tx,
      message:
        "MTN MoMo isn't connected yet on this server, so your withdrawal is held pending admin approval instead of an instant payout.",
      mode: "simulated",
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Withdrawal request failed", details: error.message });
  }
});

// GET /api/v1/wallet/momo/status/:transactionId — backend-authoritative status verification.
router.get("/momo/status/:transactionId", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.transactionId, user: req.user!.userId });
    if (!tx) return res.status(404).json({ error: "Payment transaction not found" });
    if (!tx.momoReferenceId) return res.json({ transaction: tx, status: tx.status });
    const provider = tx.kind === "payout" ? await getTransferStatus(tx.momoReferenceId) : await getRequestToPayStatus(tx.momoReferenceId);
    if (provider.status === "SUCCESSFUL" || provider.status === "FAILED") await settleMomoTransaction(String(tx._id), provider.status, provider.reason);
    const latest = await Transaction.findById(tx._id);
    return res.json({ transaction: latest, status: latest?.status || tx.status });
  } catch {
    return res.status(502).json({ error: "Payment status is temporarily unavailable. Please try again." });
  }
});

// POST /api/v1/wallet/momo/callback — MTN's async webhook for both Collections and Disbursements.
// Public endpoint (MTN calls it directly) — the payload's reference id is the only proof needed
// since it's an unguessable UUID we generated and control.
router.post("/momo/callback", async (req, res: Response) => {
  try {
        const { referenceId, externalId, status, reason } = req.body || {};
    const lookup = referenceId || externalId;
    if (!lookup || !["PENDING", "SUCCESSFUL", "FAILED"].includes(status)) return res.status(400).json({ error: "Invalid MTN callback" });
    const references: Record<string, unknown>[] = [{ momoReferenceId: lookup }, { internalReferenceId: lookup }];
    if (mongoose.isValidObjectId(lookup)) references.push({ _id: lookup });
    const tx = await Transaction.findOne({ $or: references });
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (status === "PENDING") return res.status(200).json({ ok: true, status: "pending" });
    const settled = await settleMomoTransaction(String(tx._id), status, reason);
    if (settled.applied) {
      await notify({ recipient: String(tx.user), kind: "payment", text: status === "SUCCESSFUL" ? (tx.kind === "deposit" ? `Your deposit of ${Math.abs(tx.amount)} was successful` : `Your withdrawal of ${Math.abs(tx.amount)} was completed`) : `Your ${tx.kind} could not be completed` });
    }
    return res.status(200).json({ ok: true, duplicate: !settled.applied });

    /* Legacy callback mutation removed: settlement is now provider-verified and idempotent.
    const wallet = await Wallet.findById(tx.wallet);

    if (status === "SUCCESSFUL") {
      tx.status = "completed";
      if (wallet) {
        if (tx.kind === "deposit") {
          wallet.available += tx.amount;
          wallet.lifetime += tx.amount;
        } else if (tx.kind === "payout") {
          wallet.pending += tx.amount; // amount is negative for payouts — this releases the hold
        }
        await wallet.save();
      }
      await notify({
        recipient: String(tx.user),
        kind: "payment",
        text:
          tx.kind === "deposit"
            ? `Your deposit of ${Math.abs(tx.amount)} was successful`
            : `Your withdrawal of ${Math.abs(tx.amount)} was completed`,
      });
    } else if (status === "FAILED") {
      tx.status = "failed";
      if (wallet && tx.kind === "payout") {
        // Release the hold back to available since the payout never happened.
        wallet.available += Math.abs(tx.amount);
        wallet.pending += tx.amount;
        await wallet.save();
      }
      await notify({ recipient: String(tx.user), kind: "payment", text: `Your ${tx.kind} could not be completed` });
    }

    await tx.save();
    return res.status(200).json({ ok: true });
    */
  } catch (error: any) {
    return res.status(500).json({ error: "Callback processing failed", details: error.message });
  }
});

// POST /api/v1/wallet/convert-points — Kingdom Points → cash balance, at the admin-set rate
router.post("/convert-points", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { points } = req.body;
    const numericPoints = Number(points);
    if (!numericPoints || numericPoints <= 0) return res.status(400).json({ error: "Enter a valid number of points" });

    const wallet = await Wallet.findOne({ user: req.user!.userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    if (wallet.kingdomPoints < numericPoints) return res.status(400).json({ error: "Not enough Kingdom Points" });

    const rate = await getPointsToCashRate();
    const cashAmount = numericPoints / rate;

    await applyLedgerEntry({
      userId: req.user!.userId,
      kind: "fee",
      amount: -numericPoints,
      label: `Converted ${numericPoints} points to cash`,
      toBalance: "kingdomPoints",
    });
    const { wallet: updated } = await applyLedgerEntry({
      userId: req.user!.userId,
      kind: "earning",
      amount: cashAmount,
      label: `Points conversion (${numericPoints} pts @ ${rate}/unit)`,
      toBalance: "available",
    });

    return res.json({ wallet: updated, converted: cashAmount });
  } catch (error: any) {
    return res.status(500).json({ error: "Conversion failed", details: error.message });
  }
});

export default router;
