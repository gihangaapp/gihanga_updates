import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface StaffAccount {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "user" | "moderator" | "admin" | "superadmin";
  isCreator: boolean;
  status: "active" | "limited" | "suspended" | "banned" | "review";
  emailVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
}

export function useStaffAccounts(params: { q?: string | undefined; status?: string | undefined; page?: number | undefined }) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));

  return useQuery({
    queryKey: ["staff", "accounts", params],
    queryFn: () => api.get<{ users: StaffAccount[]; page: number; total: number; hasMore: boolean }>(`/system/users?${query}`, true),
  });
}

function useAccountAction(action: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; reason?: string | undefined }) =>
      api.post<{ user: StaffAccount }>(`/system/users/${id}/${action}`, body, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "accounts"] }),
  });
}

export const useVerifyAccount = () => useAccountAction("verify");
export const useSuspendAccount = () => useAccountAction("suspend");
export const useReinstateAccount = () => useAccountAction("reinstate");
export const useBanAccount = () => useAccountAction("ban");
export const useMakeCreator = () => useAccountAction("make-creator");

export function useGrantPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, points, reason }: { id: string; points: number; reason?: string | undefined }) =>
      api.post(`/system/users/${id}/grant-points`, { points, reason }, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "accounts"] }),
  });
}
