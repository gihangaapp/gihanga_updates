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
  momoReferenceId?: string;
  momoStatus?: string;
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
    refetchInterval: 20_000,
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: () => api.get<{ transactions: WalletTransaction[] }>("/wallet/transactions"),
    refetchInterval: 20_000,
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
