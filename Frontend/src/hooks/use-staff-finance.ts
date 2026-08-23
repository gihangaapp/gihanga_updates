import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { WalletTransaction } from "./use-wallet";

export interface PendingPayment extends WalletTransaction {
  user: { name: string; username: string; email: string; mtnMomoNumber?: string };
}

export function useStaffPayments(status = "pending") {
  return useQuery({
    queryKey: ["staff", "payments", status],
    queryFn: () => api.get<{ transactions: PendingPayment[] }>(`/system/payments?status=${status}`, true),
    refetchInterval: 15_000,
  });
}

export function useApprovePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/system/payments/${id}/approve`, undefined, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "payments"] }),
  });
}

export function useRejectPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/system/payments/${id}/reject`, { reason }, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "payments"] }),
  });
}

// ── Reward config ────────────────────────────────────────────────────────────

export interface RewardRates {
  upload: number;
  like: number;
  follow: number;
  view_per_100: number;
  share: number;
  daily_login: number;
  referral: number;
}

export function useRewardConfig() {
  return useQuery({
    queryKey: ["staff", "rewards", "config"],
    queryFn: () => api.get<{ rates: RewardRates; pointsToCashRate: number }>("/system/rewards/config", true),
  });
}

export function useSaveRewardConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { rates?: Partial<RewardRates>; pointsToCashRate?: number }) =>
      api.put("/system/rewards/config", input, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "rewards", "config"] }),
  });
}
