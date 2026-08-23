import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export type CampaignObjective = "reach" | "views" | "clicks" | "leads" | "conversions";
export type CampaignStatus = "review" | "active" | "paused" | "completed" | "rejected";

export interface Campaign {
  _id: string;
  name: string;
  objective: CampaignObjective;
  audience?: string;
  dailyBudget: number;
  totalBudget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  status: CampaignStatus;
  rejectionReason?: string;
  createdAt: string;
  creator?: { name: string; username: string; email: string };
}

export function useMyCampaigns() {
  return useQuery({
    queryKey: ["ads", "mine"],
    queryFn: () => api.get<{ campaigns: Campaign[] }>("/ads"),
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      objective: CampaignObjective;
      audience?: string;
      dailyBudget: number;
      totalBudget: number;
      targetPosts?: string[];
    }) => api.post<{ campaign: Campaign }>("/ads", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ads"] }),
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; status?: "active" | "paused"; name?: string; dailyBudget?: number; totalBudget?: number }) =>
      api.patch<{ campaign: Campaign }>(`/ads/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ads"] }),
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/ads/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ads"] }),
  });
}

// ── Staff oversight ──────────────────────────────────────────────────────────

export function useStaffCampaigns(status?: string) {
  return useQuery({
    queryKey: ["staff", "ads", status ?? "all"],
    queryFn: () => api.get<{ campaigns: Campaign[] }>(`/system/ads${status ? `?status=${status}` : ""}`, true),
  });
}

export function useApproveCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ campaign: Campaign }>(`/system/ads/${id}/approve`, undefined, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "ads"] }),
  });
}

export function useRejectCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<{ campaign: Campaign }>(`/system/ads/${id}/reject`, { reason }, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "ads"] }),
  });
}
