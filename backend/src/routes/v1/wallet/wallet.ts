import { Router, Request, Response } from "express";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { getWalletSummary, applyLedgerEntry, debitWalletAtomic } from "../../../lib/wallet";
import { getPointsToCashRate } from "../../../lib/rewards";
import { Transaction } from "../../../models/Transaction";
import { Wallet } from "../../../models/Wallet";
import { User } from "../../../models/User";
import { requestToPay, transfer, isMomoConfigured, getRequestToPayStatus, getTransferStatus, normalizePhone, getMomoCurrency, getMomoCallbackUrl } from "../../../lib/momo";
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
        // Save the same reference used in X-Reference-Id before contacting MTN.
        // This prevents a very fast callback racing the initial request response.
        const referenceId = crypto.randomUUID();
        const callbackUrl = getMomoCallbackUrl(referenceId);
        tx.momoReferenceId = referenceId;
        tx.momoStatus = "PENDING";
        await tx.save();
        await requestToPay({
          amount: numericAmount,
          phone: normalizedPhone,
          externalId: String(tx._id),
          payerMessage: "Gihanga Updates wallet deposit",
          referenceId,
          callbackUrl,
        });
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
        // Persist the reference before submission so the callback can resolve
        // the transaction even if MTN responds very quickly.
        const referenceId = crypto.randomUUID();
        const callbackUrl = getMomoCallbackUrl(referenceId);
        tx.momoReferenceId = referenceId;
        tx.momoStatus = "PENDING";
        await tx.save();
        await transfer({
          amount: numericAmount,
          phone: normalizedPhone,
          externalId: String(tx._id),
          payerMessage: "Gihanga Updates wallet withdrawal",
          referenceId,
          callbackUrl,
        });
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

// Public callback reachability check. GET never changes payment state.
const callbackHealth = (_req: Request, res: Response) =>
  res.status(200).json({
    ok: true,
    endpoint: "MTN MoMo callback",
    acceptedMethods: ["POST", "PUT"],
    message: "Callback endpoint is reachable. GET is a health check only.",
  });

router.get("/momo/callback", callbackHealth);
router.get("/momo/callback/:referenceId", callbackHealth);

// MTN sends callbacks using PUT (and some integration setups use POST).
// Never trust a callback's status as proof of payment: fetch the authoritative
// MTN transaction status before settling a wallet ledger entry.
const momoCallbackHandler = async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const lookup = String(req.params.referenceId || body.referenceId || body.externalId || "").trim();
    if (!lookup) return res.status(400).json({ error: "Callback reference is required" });

    const references: Record<string, unknown>[] = [
      { momoReferenceId: lookup },
      { internalReferenceId: lookup },
    ];
    if (mongoose.isValidObjectId(lookup)) references.push({ _id: lookup });

    const tx = await Transaction.findOne({ $or: references });
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (!tx.momoReferenceId) {
      return res.status(409).json({ error: "MTN reference is not attached to this transaction yet" });
    }

    const provider = tx.kind === "payout"
      ? await getTransferStatus(tx.momoReferenceId)
      : await getRequestToPayStatus(tx.momoReferenceId);

    if (provider.status === "PENDING") {
      return res.status(200).json({ ok: true, status: "PENDING" });
    }
    if (provider.status !== "SUCCESSFUL" && provider.status !== "FAILED") {
      return res.status(502).json({ error: "MTN returned an unrecognized payment status" });
    }

    const settled = await settleMomoTransaction(String(tx._id), provider.status, provider.reason);
    if (settled.applied) {
      await notify({
        recipient: String(tx.user),
        kind: "payment",
        text: provider.status === "SUCCESSFUL"
          ? (tx.kind === "deposit" ? `Your deposit of ${Math.abs(tx.amount)} was successful` : `Your withdrawal of ${Math.abs(tx.amount)} was completed`)
          : `Your ${tx.kind} could not be completed`,
      });
    }
    return res.status(200).json({ ok: true, status: provider.status, duplicate: !settled.applied });
  } catch {
    // MTN's callback is one-shot in this API. A non-2xx response is visible in
    // logs; the authenticated status endpoint/reconciler can still verify it.
    return res.status(502).json({ error: "Callback status verification failed; no wallet change was applied" });
  }
};

router.post("/momo/callback", momoCallbackHandler);
router.put("/momo/callback", momoCallbackHandler);
router.post("/momo/callback/:referenceId", momoCallbackHandler);
router.put("/momo/callback/:referenceId", momoCallbackHandler);

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

// POST /api/v1/wallet/buy-points — cash balance → Kingdom Points, at the same admin-set rate
// used by /convert-points (so buying and converting back is always value-neutral).
router.post("/buy-points", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const points = Math.floor(Number(req.body?.points));
    if (!Number.isFinite(points) || points <= 0) {
      return res.status(400).json({ error: "Enter a valid number of points" });
    }
    if (points > 1_000_000) return res.status(400).json({ error: "That is more points than can be bought at once" });

    const rate = await getPointsToCashRate();
    const cost = Math.max(1, Math.ceil(points / rate));

    // Atomic, race-free debit of the cash balance: refuses to overdraft.
    const debit = await debitWalletAtomic({
      userId: req.user!.userId,
      amount: cost,
      kind: "fee",
      label: `Bought ${points} Kingdom Points`,
      toBalance: "available",
    });
    if (!debit.ok) {
      if (debit.reason === "frozen") return res.status(403).json({ error: "Your wallet is frozen. Contact support." });
      if (debit.reason === "not-found") return res.status(404).json({ error: "Wallet not found" });
      return res.status(400).json({
        error: "Not enough cash balance. Deposit with MTN MoMo first, then buy points.",
        code: "insufficient-cash",
        required: cost,
      });
    }

    try {
      const { wallet } = await applyLedgerEntry({
        userId: req.user!.userId,
        kind: "bonus",
        amount: points,
        label: `Purchased ${points} Kingdom Points (${cost} RWF)`,
        toBalance: "kingdomPoints",
      });
      return res.json({ wallet, purchased: points, cost });
    } catch (creditError) {
      // Crediting failed after the cash was taken — give the cash back.
      await Wallet.updateOne({ user: req.user!.userId }, { $inc: { available: cost } }).catch(() => {});
      throw creditError;
    }
  } catch (error: any) {
    return res.status(500).json({ error: "Purchase failed", details: error.message });
  }
});

export default router;
