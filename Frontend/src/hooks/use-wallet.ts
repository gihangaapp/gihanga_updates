import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface WalletData {
  available: number;
  pending: number;
  lifetime: number;
  kingdomPoints: number;
  frozen: boolean;
  mtnMomoNumber?: string;
}

export interface WalletTransaction {
  _id: string;
  kind: string;
  amount: number;
  label: string;
  status: "created" | "pending" | "completed" | "failed" | "cancelled" | "expired";
  failureReason?: string;
  momoReason?: string;
  momoReferenceId?: string;
  momoStatus?: string;
  provider?: "MTN_MOMO";
  createdAt: string;
}

export function useWallet() {
  return useQuery({
    queryKey: ["wallet", "me"],
    queryFn: () =>
      api.get<{
        wallet: WalletData;
        pointsToCashRate: number;
        momo: { depositConfigured: boolean; withdrawConfigured: boolean };
      }>("/wallet/me"),
    refetchInterval: 8_000,
  });
}

export function useWalletTransactions() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: async () => {
      let result = await api.get<{ transactions: WalletTransaction[] }>("/wallet/transactions");
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      const pendingMomo = result.transactions
        .filter((tx) => tx.provider === "MTN_MOMO" && tx.status === "pending" && Boolean(tx.momoReferenceId) && new Date(tx.createdAt).getTime() >= cutoff)
        .slice(0, 5);

      if (pendingMomo.length > 0) {
        const checks = await Promise.allSettled(
          pendingMomo.map((tx) => api.get(`/wallet/momo/status/${encodeURIComponent(tx._id)}`)),
        );
        if (checks.some((check) => check.status === "fulfilled")) {
          result = await api.get<{ transactions: WalletTransaction[] }>("/wallet/transactions");
          await queryClient.invalidateQueries({ queryKey: ["wallet", "me"] });
        }
      }
      return result;
    },
    refetchInterval: (query) => {
      const transactions = query.state.data?.transactions ?? [];
      const hasRecentPendingMomo = transactions.some((tx) =>
        tx.provider === "MTN_MOMO" && tx.status === "pending" && Boolean(tx.momoReferenceId)
        && new Date(tx.createdAt).getTime() >= Date.now() - 24 * 60 * 60 * 1000,
      );
      return hasRecentPendingMomo ? 5_000 : 20_000;
    },
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { amount: number; phoneNumber: string }) =>
      api.post<{ transaction: WalletTransaction; message: string; mode: "live" | "simulated" }>(
        "/wallet/deposit",
        { ...input, idempotencyKey: crypto.randomUUID() },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { amount: number; phoneNumber: string }) =>
      api.post<{ transaction: WalletTransaction; message: string; mode: "live" | "simulated" }>(
        "/wallet/withdraw",
        { ...input, idempotencyKey: crypto.randomUUID() },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useConvertPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (points: number) =>
      api.post<{ wallet: WalletData; converted: number }>("/wallet/convert-points", { points }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet"] }),
  });
}
