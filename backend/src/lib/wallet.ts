import { Types } from "mongoose";
import { Wallet } from "../models/Wallet";
import { Transaction, TransactionKind, TransactionStatus } from "../models/Transaction";

async function getOrCreateWallet(userId: string | Types.ObjectId) {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) wallet = await Wallet.create({ user: userId });
  return wallet;
}

interface LedgerEntryInput {
  userId: string;
  kind: TransactionKind;
  amount: number; // positive = credit, negative = debit
  label: string;
  status?: TransactionStatus;
  toBalance?: "available" | "pending" | "kingdomPoints";
  relatedPost?: string;
  relatedLive?: string;
}

/**
 * Applies a single ledger entry: adjusts the wallet balance (only for
 * status "completed" — "pending" entries are recorded but don't move money
 * yet, e.g. a MoMo deposit still waiting on the callback) and writes a
 * matching Transaction row so the history is always reconstructable.
 */
export async function applyLedgerEntry(input: LedgerEntryInput) {
  const wallet = await getOrCreateWallet(input.userId);
  const status = input.status ?? "completed";
  const balanceField = input.toBalance ?? "available";

  if (status === "completed") {
    (wallet as any)[balanceField] = Math.max(0, (wallet as any)[balanceField] + input.amount);
    if (input.amount > 0 && balanceField !== "pending") wallet.lifetime += input.amount;
    await wallet.save();
  }

  const tx = await Transaction.create({
    wallet: wallet._id,
    user: input.userId,
    kind: input.kind,
    amount: input.amount,
    label: input.label,
    status,
    relatedPost: input.relatedPost,
    relatedLive: input.relatedLive,
  });

  return { wallet, transaction: tx };
}

export async function getWalletSummary(userId: string) {
  const wallet = await getOrCreateWallet(userId);
  return wallet;
}
