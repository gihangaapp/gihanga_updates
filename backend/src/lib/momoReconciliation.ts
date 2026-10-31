import { Transaction } from "../models/Transaction";
import { getRequestToPayStatus, getTransferStatus, isMomoConfigured } from "./momo";
import { settleMomoTransaction } from "./paymentSettlement";
import { notify } from "./notify";

const INTERVAL_MS = Math.max(10_000, Number(process.env.MTN_RECONCILIATION_INTERVAL_MS) || 20_000);
const MAX_BATCH = Math.min(20, Math.max(1, Number(process.env.MTN_RECONCILIATION_BATCH_SIZE) || 10));
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
let sweepRunning = false;
let started = false;

type ProviderStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

function providerMatchesTransaction(tx: any, provider: { amount?: string; currency?: string }): boolean {
  const metadata = tx.metadata && typeof tx.metadata === "object" ? tx.metadata as Record<string, unknown> : {};
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

export async function reconcilePendingMomoTransactions(): Promise<{ checked: number; settled: number; review: number }> {
  if (sweepRunning) return { checked: 0, settled: 0, review: 0 };
  sweepRunning = true;
  let checked = 0;
  let settled = 0;
  let review = 0;

  try {
    const supportedKinds: string[] = [];
    if (isMomoConfigured("collection")) supportedKinds.push("deposit");
    if (isMomoConfigured("disbursement")) supportedKinds.push("payout");
    if (supportedKinds.length === 0) return { checked, settled, review };

    const cutoff = new Date(Date.now() - MAX_AGE_MS);
    const pending = await Transaction.find({
      provider: "MTN_MOMO",
      status: "pending",
      kind: { $in: supportedKinds },
      momoReferenceId: { $exists: true, $ne: "" },
      createdAt: { $gte: cutoff },
      momoStatus: { $ne: "REVIEW_REQUIRED" },
    })
      .select("_id user kind amount momoReferenceId metadata")
      .sort({ createdAt: 1 })
      .limit(MAX_BATCH)
      .lean();

    for (const tx of pending) {
      checked += 1;
      try {
        const provider = tx.kind === "payout"
          ? await getTransferStatus(String(tx.momoReferenceId))
          : await getRequestToPayStatus(String(tx.momoReferenceId));

        console.info(`[MoMoReconcile] Transaction ${String(tx._id)} provider status: ${provider.status}.`);
        if (provider.status === "PENDING") continue;
        if (provider.status !== "SUCCESSFUL" && provider.status !== "FAILED") {
          console.warn(`[MoMoReconcile] Unrecognized status for transaction ${String(tx._id)}; leaving pending.`);
          continue;
        }

        if (provider.status === "SUCCESSFUL" && !providerMatchesTransaction(tx, provider)) {
          await Transaction.updateOne(
            { _id: tx._id, status: "pending" },
            { $set: { momoStatus: "REVIEW_REQUIRED", momoReason: "Provider amount/currency did not match the stored wallet quote" } },
          );
          review += 1;
          console.error(`[MoMoReconcile] Transaction ${String(tx._id)} requires review: provider amount/currency mismatch. No wallet credit applied.`);
          continue;
        }

        const result = await settleMomoTransaction(String(tx._id), provider.status as ProviderStatus, provider.reason);
        if (result.applied) {
          settled += 1;
          console.log(`[MoMoReconcile] Transaction ${String(tx._id)} settled as ${provider.status}.`);
          try {
            await notify({
              recipient: String(tx.user),
              kind: "payment",
              text: provider.status === "SUCCESSFUL"
                ? (tx.kind === "deposit"
                    ? `Your deposit of ${Math.abs(Number(tx.amount)).toLocaleString()} RWF was successful`
                    : `Your withdrawal of ${Math.abs(Number(tx.amount)).toLocaleString()} RWF was completed`)
                : `Your ${tx.kind} could not be completed`,
            });
          } catch (notificationError) {
            console.error(`[MoMoReconcile] Notification failed for transaction ${String(tx._id)}:`, notificationError instanceof Error ? notificationError.message : "unknown error");
          }
        }
      } catch (error) {
        console.error(`[MoMoReconcile] Status check failed for transaction ${String(tx._id)}:`, error instanceof Error ? error.message : "unknown provider error");
      }
    }
  } catch (error) {
    console.error("[MoMoReconcile] Sweep failed:", error instanceof Error ? error.message : "unknown error");
  } finally {
    sweepRunning = false;
  }

  if (checked > 0 && (settled > 0 || review > 0)) {
    console.log(`[MoMoReconcile] Checked ${checked}; settled ${settled}; sent to review ${review}.`);
  }
  return { checked, settled, review };
}

export function startMomoReconciliationSweeper(): void {
  if (started) return;
  started = true;
  const run = () => {
    void reconcilePendingMomoTransactions();
  };
  const initial = setTimeout(run, 8_000);
  initial.unref?.();
  const interval = setInterval(run, INTERVAL_MS);
  interval.unref?.();
  console.log(`[MoMoReconcile] Started — polling pending MTN transactions every ${Math.round(INTERVAL_MS / 1000)}s, batch ${MAX_BATCH}.`);
}
