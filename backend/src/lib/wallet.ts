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
 *
 * NOTE (money-safety): this legacy helper CLAMPS the resulting balance to
 * >= 0 and therefore can silently absorb an overdraft. It must only be used
 * for CREDITS, or for debits whose funds were already verified/held by the
 * caller. Any new code that spends points without a prior hold must use
 * debitWalletAtomic() below instead — it refuses to overdraft at the
 * database level and cannot race.
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

export interface AtomicDebitInput {
  userId: string;
  amount: number;
  kind: TransactionKind;
  label: string;
  toBalance?: "kingdomPoints" | "available";
  relatedLive?: string;
}

export type AtomicDebitResult =
  | { ok: true; wallet: any; remainingPoints: number }
  | { ok: false; reason: "insufficient" | "frozen" | "not-found" };

/**
 * Race-free, server-authoritative wallet debit.
 *
 * A single conditional findOneAndUpdate does the whole job: it matches ONLY
 * when the balance still covers the amount and the wallet isn't frozen, and
 * decrements in the same atomic write. Two concurrent spends of the same
 * points can never both succeed — the loser simply doesn't match the filter
 * and gets { ok:false, reason:"insufficient" } — and the balance can never
 * go negative. The matching Transaction row is written after the successful
 * flip; if THAT write fails the debit is refunded so the ledger and the
 * balance stay consistent.
 */
export async function debitWalletAtomic(input: AtomicDebitInput): Promise<AtomicDebitResult> {
  const amount = Math.floor(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("debitWalletAtomic requires a positive integer amount");
  }
  const balanceField = input.toBalance ?? "kingdomPoints";

  // Read-only pre-check purely for a friendlier frozen/not-found error —
  // the authoritative guard is the conditional update below.
  const existing = await Wallet.findOne({ user: input.userId });
  if (!existing) return { ok: false, reason: "not-found" };
  if (existing.frozen) return { ok: false, reason: "frozen" };

  const wallet = await Wallet.findOneAndUpdate(
    { user: input.userId, frozen: { $ne: true }, [balanceField]: { $gte: amount } },
    { $inc: { [balanceField]: -amount } },
    { new: true },
  );
  if (!wallet) {
    // Distinguish frozen vs insufficient for a precise user-facing message.
    const fresh = await Wallet.findOne({ user: input.userId });
    if (fresh?.frozen) return { ok: false, reason: "frozen" };
    return { ok: false, reason: "insufficient" };
  }

  const currentBalance = (wallet as any)[balanceField] as number;

  try {
    await Transaction.create({
      wallet: wallet._id,
      user: input.userId,
      kind: input.kind,
      amount: -amount,
      label: input.label,
      status: "completed",
      relatedLive: input.relatedLive,
    });
  } catch (err) {
    // Keep wallet and ledger consistent — undo the debit if the row failed.
    await Wallet.updateOne({ _id: wallet._id }, { $inc: { [balanceField]: amount } }).catch(() => {});
    throw err;
  }

  return { ok: true, wallet, remainingPoints: currentBalance };
}

export async function getWalletSummary(userId: string) {
  const wallet = await getOrCreateWallet(userId);
  return wallet;
}
