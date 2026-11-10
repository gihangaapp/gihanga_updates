import mongoose from "mongoose";
import { Transaction } from "../models/Transaction";
import { Wallet } from "../models/Wallet";

export type ProviderStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

const TRANSACTION_OPTIONS = {
  readPreference: "primary" as const,
  readConcern: { level: "snapshot" as const },
  writeConcern: { w: "majority" as const },
};

function finalUpdate(providerStatus: Exclude<ProviderStatus, "PENDING">, reason?: string) {
  if (providerStatus === "SUCCESSFUL") {
    return {
      $set: {
        momoStatus: providerStatus,
        status: "completed",
        settledAt: new Date(),
        ...(reason ? { momoReason: reason.slice(0, 500) } : {}),
      },
      $unset: { failureReason: 1, ...(reason ? {} : { momoReason: 1 }) },
    };
  }
  const failure = (reason || "MTN reported failure").slice(0, 500);
  return {
    $set: {
      momoStatus: providerStatus,
      status: "failed",
      settledAt: new Date(),
      momoReason: failure,
      failureReason: failure,
    },
  };
}

/**
 * Apply the wallet side of a terminal MTN result inside the same MongoDB
 * transaction that changes the Transaction document. No non-atomic fallback
 * is permitted: a failed transaction must leave both documents unchanged.
 */
async function applyWalletEffect(
  tx: { wallet: mongoose.Types.ObjectId; kind: string; amount: number; status: string },
  session: mongoose.ClientSession,
): Promise<void> {
  const amount = Math.abs(Number(tx.amount));
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Payment transaction has an invalid wallet amount");
  }

  let result;
  if (tx.kind === "deposit") {
    if (Number(tx.amount) <= 0) throw new Error("Deposit transaction amount must be positive");
    if (tx.status === "failed") return; // Failed collections never credit the wallet.
    result = await Wallet.updateOne(
      { _id: tx.wallet },
      { $inc: { available: amount, lifetime: amount } },
      { session },
    );
  } else if (tx.kind === "payout") {
    if (Number(tx.amount) >= 0) throw new Error("Payout transaction amount must be negative");
    // Funds must already be held in pending before a payout can be finalized.
    // This guard prevents a corrupt or duplicate transaction from making the
    // pending balance negative or releasing more than was reserved.
    result = await Wallet.updateOne(
      { _id: tx.wallet, pending: { $gte: amount } },
      {
        $inc: tx.status === "completed"
          ? { pending: -amount }
          : { available: amount, pending: -amount },
      },
      { session },
    );
  } else {
    throw new Error(`Unsupported MTN wallet transaction kind: ${tx.kind}`);
  }

  if (result.matchedCount !== 1) {
    throw new Error(tx.kind === "payout"
      ? "Wallet does not contain the expected pending payout hold"
      : "Wallet not found for payment transaction");
  }
}

export async function settleMomoTransaction(
  transactionId: string,
  providerStatus: ProviderStatus,
  reason?: string,
) {
  if (providerStatus === "PENDING") {
    return { applied: false, transaction: await Transaction.findById(transactionId) };
  }

  const session = await mongoose.startSession();
  try {
    let result: { applied: boolean; transaction: any } = { applied: false, transaction: null };
    await session.withTransaction(async () => {
      // Claim only a pending row. Concurrent callbacks, browser polling and
      // the reconciliation worker cannot all settle the same payment.
      const tx = await Transaction.findOneAndUpdate(
        { _id: transactionId, status: "pending", provider: "MTN_MOMO" },
        finalUpdate(providerStatus, reason),
        { new: true, session },
      );

      if (!tx) {
        result = {
          applied: false,
          transaction: await Transaction.findById(transactionId).session(session),
        };
        return;
      }

      await applyWalletEffect(tx, session);
      result = { applied: true, transaction: tx };
    }, TRANSACTION_OPTIONS);

    return result;
  } finally {
    await session.endSession();
  }
}
