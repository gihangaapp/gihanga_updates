import { Router, Request, Response } from "express";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { getWalletSummary, applyLedgerEntry, debitWalletAtomic } from "../../../lib/wallet";
import { getPointsToCashRate } from "../../../lib/rewards";
import { Transaction } from "../../../models/Transaction";
import { Wallet } from "../../../models/Wallet";
import { User } from "../../../models/User";
import { requestToPay, transfer, isMomoConfigured, getRequestToPayStatus, getTransferStatus, normalizePhone, getMomoProviderQuote, getMomoCallbackUrl } from "../../../lib/momo";
import { settleMomoTransaction } from "../../../lib/paymentSettlement";
import { notify } from "../../../lib/notify";
import { notifyStaff } from "../../../lib/staffNotify";
import { rateLimitHits } from "../../../lib/redis";

const router = Router();

const MONGO_TRANSACTION_OPTIONS = {
  readPreference: "primary" as const,
  readConcern: { level: "snapshot" as const },
  writeConcern: { w: "majority" as const },
};

class WalletRequestError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "WalletRequestError";
  }
}

function readIdempotencyKey(req: Request): string {
  return String(req.get("Idempotency-Key") || req.body?.idempotencyKey || "").trim();
}

function isValidIdempotencyKey(value: string): boolean {
  return value.length >= 8 && value.length <= 128 && /^[A-Za-z0-9._:-]+$/.test(value);
}

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: number }).code === 11000);
}

function providerHttpStatus(error: unknown): number | null {
  const message = error instanceof Error ? error.message : String(error || "");
  const match = message.match(/\(HTTP (\d{3})\)/i);
  return match ? Number(match[1]) : null;
}

// Only a clear 4xx rejection (excluding timeout/conflict/rate-limit cases)
// proves the provider refused the request. Network errors and 5xx responses
// are ambiguous: keep the funds reserved and reconcile by the saved reference.
function isDefinitiveProviderRejection(error: unknown): boolean {
  const status = providerHttpStatus(error);
  return status !== null && status >= 400 && status < 500 && ![408, 409, 425, 429].includes(status);
}

function providerErrorMessage(error: unknown): string {
  return (error instanceof Error ? error.message : "MTN provider response was unavailable").slice(0, 500);
}

function providerMatchesWalletTransaction(
  tx: { metadata?: unknown },
  provider: { amount?: string; currency?: string },
): boolean {
  const metadata = tx.metadata && typeof tx.metadata === "object"
    ? tx.metadata as Record<string, unknown>
    : {};
  const expectedAmount = Number(metadata.momoProviderAmount);
  const expectedCurrency = String(metadata.momoProviderCurrency || "").toUpperCase();
  const actualAmount = Number(provider.amount);
  const actualCurrency = String(provider.currency || "").toUpperCase();
  return Number.isFinite(expectedAmount)
    && Number.isFinite(actualAmount)
    && Math.abs(expectedAmount - actualAmount) < 0.000001
    && Boolean(expectedCurrency)
    && actualCurrency === expectedCurrency;
}

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
  const userId = req.user!.userId;
  const idempotencyKey = readIdempotencyKey(req);
  try {
    const { amount, phoneNumber } = req.body;
    const numericAmount = Number(amount);
    if (!Number.isSafeInteger(numericAmount) || numericAmount < MIN_DEPOSIT) {
      return res.status(400).json({ error: `Minimum deposit is ${MIN_DEPOSIT} RWF` });
    }
    if (!phoneNumber?.trim()) return res.status(400).json({ error: "A mobile money phone number is required" });
    let normalizedPhone: string;
    try { normalizedPhone = normalizePhone(phoneNumber); } catch { return res.status(400).json({ error: "Enter a valid Rwanda MTN phone number" }); }

    if (!isValidIdempotencyKey(idempotencyKey)) {
      return res.status(400).json({ error: "A valid Idempotency-Key is required for payment requests" });
    }
    const prior = await Transaction.findOne({ user: userId, kind: "deposit", idempotencyKey });
    if (prior) return res.status(202).json({ transaction: prior, message: "This payment request already exists.", mode: prior.momoReferenceId ? "live" : "simulated" });

    if (!(await rateLimitHits("wallet:deposit", userId, 5, 3600))) {
      res.set("Retry-After", "3600");
      return res.status(429).json({ error: "Too many deposit attempts. Please try again later." });
    }

    const wallet = await Wallet.findOne({ user: userId }).then(
      (w) => w ?? Wallet.create({ user: userId }),
    );
    if (wallet.frozen) return res.status(403).json({ error: "Your wallet is frozen — contact support" });

    let providerQuote: ReturnType<typeof getMomoProviderQuote> | null = null;
    const collectionConfigured = isMomoConfigured("collection");
    let providerReferenceId: string | undefined;
    let providerCallbackUrl: string | undefined;
    if (collectionConfigured) {
      try {
        providerQuote = getMomoProviderQuote(numericAmount);
        providerReferenceId = crypto.randomUUID();
        providerCallbackUrl = getMomoCallbackUrl(providerReferenceId);
      } catch (quoteError: any) {
        return res.status(503).json({ error: quoteError.message || "MTN currency/callback configuration is incomplete" });
      }
    }

    let tx: any;
    try {
      tx = await Transaction.create({
        wallet: wallet._id,
        user: userId,
        kind: "deposit",
        amount: numericAmount,
        label: "MTN MoMo wallet deposit",
        status: "pending",
        ...(collectionConfigured ? {
          provider: "MTN_MOMO",
          momoReferenceId: providerReferenceId,
          momoStatus: "PENDING",
        } : {}),
        currency: "RWF",
        customerPhone: normalizedPhone,
        metadata: {
          walletCurrency: "RWF",
          ...(providerQuote ? {
            momoProviderAmount: providerQuote.amount,
            momoProviderCurrency: providerQuote.currency,
            ...(providerQuote.sandboxRwfPerEur ? { sandboxRwfPerEur: providerQuote.sandboxRwfPerEur } : {}),
          } : {}),
        },
        idempotencyKey,
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const existing = await Transaction.findOne({ user: userId, kind: "deposit", idempotencyKey });
        if (existing) return res.status(202).json({ transaction: existing, message: "This payment request already exists.", mode: existing.momoReferenceId ? "live" : "simulated" });
      }
      throw error;
    }

    try {
      await notifyStaff("payments", `New deposit request: ${numericAmount.toLocaleString()} RWF pending review`, { transactionId: String(tx._id) });
    } catch (notifyError) {
      console.error("[Wallet] Could not notify staff about deposit:", notifyError instanceof Error ? notifyError.message : "unknown error");
    }

    if (collectionConfigured) {
      try {
        await requestToPay({
          amount: numericAmount,
          phone: normalizedPhone,
          externalId: String(tx._id),
          payerMessage: "Gihanga Updates wallet deposit",
          referenceId: providerReferenceId!,
          callbackUrl: providerCallbackUrl,
        });
        return res.status(202).json({
          transaction: tx,
          message: "Check your phone to approve the payment request.",
          mode: "live",
        });
      } catch (momoError) {
        const message = providerErrorMessage(momoError);
        if (isDefinitiveProviderRejection(momoError)) {
          await settleMomoTransaction(String(tx._id), "FAILED", message);
          return res.status(502).json({ error: message, transaction: await Transaction.findById(tx._id) });
        }
        tx.momoStatus = "SUBMISSION_UNKNOWN";
        tx.momoReason = message;
        await tx.save();
        console.error(`[MoMo] Deposit submission outcome uncertain for transaction ${String(tx._id)}; keeping it pending for provider reconciliation.`);
        return res.status(202).json({
          transaction: tx,
          message: "MTN submission is being verified. Do not submit this deposit again; check the transaction status shortly.",
          mode: "live",
        });
      }
    }

    return res.status(202).json({
      transaction: tx,
      message: "MTN MoMo is not configured, so this deposit is pending manual review.",
      mode: "simulated",
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Deposit request failed", details: error.message });
  }
});

// POST /api/v1/wallet/withdraw — MTN MoMo Disbursements Transfer
router.post("/withdraw", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const idempotencyKey = readIdempotencyKey(req);
  try {
    const { amount, phoneNumber } = req.body;
    const numericAmount = Number(amount);
    if (!Number.isSafeInteger(numericAmount) || numericAmount < MIN_WITHDRAW) {
      return res.status(400).json({ error: `Minimum withdrawal is ${MIN_WITHDRAW} RWF` });
    }
    if (!phoneNumber?.trim()) return res.status(400).json({ error: "A mobile money phone number is required" });
    let normalizedPhone: string;
    try { normalizedPhone = normalizePhone(phoneNumber); } catch { return res.status(400).json({ error: "Enter a valid Rwanda MTN phone number" }); }

    if (!isValidIdempotencyKey(idempotencyKey)) {
      return res.status(400).json({ error: "A valid Idempotency-Key is required for withdrawal requests" });
    }
    const prior = await Transaction.findOne({ user: userId, kind: "payout", idempotencyKey });
    if (prior) return res.status(202).json({ transaction: prior, message: "This withdrawal request already exists.", mode: prior.momoReferenceId ? "live" : "simulated" });

    if (!(await rateLimitHits("wallet:withdraw", userId, 3, 3600))) {
      res.set("Retry-After", "3600");
      return res.status(429).json({ error: "Too many withdrawal attempts. Please try again later." });
    }

    const initialWallet = await Wallet.findOne({ user: userId });
    if (!initialWallet) return res.status(404).json({ error: "Wallet not found" });
    if (initialWallet.frozen) return res.status(403).json({ error: "Your wallet is frozen — contact support" });

    const disbursementConfigured = isMomoConfigured("disbursement");
    let providerQuote: ReturnType<typeof getMomoProviderQuote> | null = null;
    let providerReferenceId: string | undefined;
    let providerCallbackUrl: string | undefined;
    if (disbursementConfigured) {
      try {
        providerQuote = getMomoProviderQuote(numericAmount);
        providerReferenceId = crypto.randomUUID();
        providerCallbackUrl = getMomoCallbackUrl(providerReferenceId);
      } catch (quoteError: any) {
        return res.status(503).json({ error: quoteError.message || "MTN currency/callback configuration is incomplete" });
      }
    }

    // Reserve funds and create the payout row in one Atlas transaction. A crash
    // cannot leave a wallet hold without its matching transaction record.
    const session = await mongoose.startSession();
    let tx: any = null;
    try {
      await session.withTransaction(async () => {
        const reservedWallet = await Wallet.findOneAndUpdate(
          { user: userId, frozen: { $ne: true }, available: { $gte: numericAmount } },
          { $inc: { available: -numericAmount, pending: numericAmount } },
          { new: true, session },
        );
        if (!reservedWallet) {
          const current = await Wallet.findOne({ user: userId }).session(session);
          if (!current) throw new WalletRequestError(404, "Wallet not found");
          if (current.frozen) throw new WalletRequestError(403, "Your wallet is frozen — contact support");
          throw new WalletRequestError(400, "Insufficient available balance");
        }

        const created = await Transaction.create([{
          wallet: reservedWallet._id,
          user: userId,
          kind: "payout",
          amount: -numericAmount,
          label: "MTN MoMo wallet withdrawal",
          status: "pending",
          ...(disbursementConfigured ? {
            provider: "MTN_MOMO",
            momoReferenceId: providerReferenceId,
            momoStatus: "PENDING",
          } : {}),
          currency: "RWF",
          customerPhone: normalizedPhone,
          metadata: {
            walletCurrency: "RWF",
            ...(providerQuote ? {
              momoProviderAmount: providerQuote.amount,
              momoProviderCurrency: providerQuote.currency,
              ...(providerQuote.sandboxRwfPerEur ? { sandboxRwfPerEur: providerQuote.sandboxRwfPerEur } : {}),
            } : {}),
          },
          idempotencyKey,
        }], { session });
        tx = created[0];
      }, MONGO_TRANSACTION_OPTIONS);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const existing = await Transaction.findOne({ user: userId, kind: "payout", idempotencyKey });
        if (existing) return res.status(202).json({ transaction: existing, message: "This withdrawal request already exists.", mode: existing.momoReferenceId ? "live" : "simulated" });
      }
      if (error instanceof WalletRequestError) return res.status(error.statusCode).json({ error: error.message });
      throw error;
    } finally {
      await session.endSession();
    }

    try {
      await notifyStaff("payments", `New withdrawal request: ${numericAmount.toLocaleString()} RWF pending review`, { transactionId: String(tx._id) });
    } catch (notifyError) {
      console.error("[Wallet] Could not notify staff about withdrawal:", notifyError instanceof Error ? notifyError.message : "unknown error");
    }

    if (disbursementConfigured) {
      try {
        await transfer({
          amount: numericAmount,
          phone: normalizedPhone,
          externalId: String(tx._id),
          payerMessage: "Gihanga Updates wallet withdrawal",
          referenceId: providerReferenceId!,
          callbackUrl: providerCallbackUrl,
        });
        return res.status(202).json({ transaction: tx, message: "Withdrawal submitted to MTN MoMo.", mode: "live" });
      } catch (momoError) {
        const message = providerErrorMessage(momoError);
        if (isDefinitiveProviderRejection(momoError)) {
          // A clear provider 4xx refusal is terminal; use the same atomic
          // settlement path to return the held RWF exactly once.
          await settleMomoTransaction(String(tx._id), "FAILED", message);
          return res.status(502).json({ error: message, transaction: await Transaction.findById(tx._id) });
        }
        // Network/5xx outcomes are ambiguous. Do not release funds until MTN's
        // transfer-status endpoint establishes whether the transfer exists.
        tx.momoStatus = "SUBMISSION_UNKNOWN";
        tx.momoReason = message;
        await tx.save();
        console.error(`[MoMo] Withdrawal submission outcome uncertain for transaction ${String(tx._id)}; keeping the payout hold for provider reconciliation.`);
        return res.status(202).json({
          transaction: tx,
          message: "MTN submission is being verified. Your withdrawal remains pending; do not submit it again.",
          mode: "live",
        });
      }
    }

    return res.status(202).json({
      transaction: tx,
      message: "MTN MoMo is not configured, so this withdrawal is held pending manual review.",
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
    console.info(`[MoMoStatus] Transaction ${String(tx._id)} provider status: ${provider.status}.`);
    if (provider.status === "SUCCESSFUL" && !providerMatchesWalletTransaction(tx, provider)) {
      return res.status(409).json({ error: "MTN payment amount or currency did not match the expected RWF wallet transaction. No wallet balance was changed." });
    }
    if (provider.status === "SUCCESSFUL" || provider.status === "FAILED") await settleMomoTransaction(String(tx._id), provider.status, provider.reason);
    const latest = await Transaction.findById(tx._id);
    return res.json({ transaction: latest, status: latest?.status || tx.status });
  } catch (error) {
    console.error(`[MoMoStatus] Status verification failed for transaction ${String(req.params.transactionId)}:`, error instanceof Error ? error.message : "unknown provider error");
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

    if (provider.status === "SUCCESSFUL" && !providerMatchesWalletTransaction(tx, provider)) {
      return res.status(409).json({ error: "MTN payment amount or currency did not match the expected RWF wallet transaction; no wallet change was applied" });
    }

    const settled = await settleMomoTransaction(String(tx._id), provider.status, provider.reason);
    if (settled.applied) {
      await notify({
        recipient: String(tx.user),
        kind: "payment",
        text: provider.status === "SUCCESSFUL"
          ? (tx.kind === "deposit" ? `Your deposit of ${Math.abs(tx.amount).toLocaleString()} RWF was successful` : `Your withdrawal of ${Math.abs(tx.amount).toLocaleString()} RWF was completed`)
          : `Your ${tx.kind} could not be completed`,
      });
    }
    return res.status(200).json({ ok: true, status: provider.status, duplicate: !settled.applied });
  } catch (error) {
    // MTN's callback is one-shot; the status reconciler is the fallback.
    console.error("[MoMoCallback] Verification failed:", error instanceof Error ? error.message : "unknown provider error");
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
      label: `Points conversion (${numericPoints} pts @ ${rate} points/RWF)`,
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
