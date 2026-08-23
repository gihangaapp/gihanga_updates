import mongoose from "mongoose";
import { Transaction } from "../models/Transaction";
import { Wallet } from "../models/Wallet";

export type ProviderStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

function finalUpdate(providerStatus: ProviderStatus, reason?: string) {
  return {
    $set: {
      momoStatus: providerStatus,
      ...(reason ? { momoReason: reason } : {}),
      ...(providerStatus === "SUCCESSFUL" ? { status: "completed", settledAt: new Date() } : {}),
      ...(providerStatus === "FAILED" ? { status: "failed", settledAt: new Date(), failureReason: reason || "MTN reported failure" } : {}),
    },
  };
}

async function applyWalletEffect(tx: any, session?: mongoose.ClientSession) {
  const walletQuery = Wallet.findById(tx.wallet);
  if (session) walletQuery.session(session);
  const wallet = await walletQuery;
  if (!wallet) throw new Error("Wallet not found for payment transaction");
  if (tx.kind === "deposit" && tx.status === "completed") {
    wallet.available += Math.abs(tx.amount);
    wallet.lifetime += Math.abs(tx.amount);
  } else if (tx.kind === "payout" && tx.status === "completed") {
    wallet.pending = Math.max(0, wallet.pending - Math.abs(tx.amount));
  } else if (tx.kind === "payout" && tx.status === "failed") {
    wallet.available += Math.abs(tx.amount);
    wallet.pending = Math.max(0, wallet.pending - Math.abs(tx.amount));
  }
  await wallet.save(session ? { session } : undefined);
}

async function fallbackSettlement(transactionId: string, providerStatus: ProviderStatus, reason?: string) {
  const tx = await Transaction.findOneAndUpdate({ _id: transactionId, status: "pending" }, finalUpdate(providerStatus, reason), { new: true });
  if (!tx) return { applied: false, transaction: await Transaction.findById(transactionId) };
  if (providerStatus !== "PENDING") await applyWalletEffect(tx);
  return { applied: providerStatus !== "PENDING", transaction: tx };
}

export async function settleMomoTransaction(transactionId: string, providerStatus: ProviderStatus, reason?: string) {
  if (providerStatus === "PENDING") return { applied: false, transaction: await Transaction.findById(transactionId) };
  const session = await mongoose.startSession();
  try {
    let result: { applied: boolean; transaction: any } = { applied: false, transaction: null };
    await session.withTransaction(async () => {
      const tx = await Transaction.findOneAndUpdate({ _id: transactionId, status: "pending" }, finalUpdate(providerStatus, reason), { new: true, session });
      if (!tx) return;
      await applyWalletEffect(tx, session);
      result = { applied: true, transaction: tx };
    });
    return result;
  } catch (error: any) {
    const message = String(error?.message || "");
    if (/transaction numbers are only allowed|replica set|mongos/i.test(message)) return fallbackSettlement(transactionId, providerStatus, reason);
    throw error;
  } finally {
    await session.endSession();
  }
}
