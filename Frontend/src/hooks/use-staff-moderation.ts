import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface StaffReport {
  _id: string;
  reporter: { name: string; username: string; avatarHue: number; avatarUrl: string | null };
  target: { name: string; username: string; avatarHue: number; avatarUrl: string | null };
  targetPost?: { _id: string; kind: string; mediaUrl?: string; thumbnailUrl?: string; body: string };
  targetLive?: { _id: string; title: string; status: string };
  reason: string;
  excerpt?: string;
  status: "pending" | "escalated" | "resolved" | "dismissed";
  severity: "low" | "medium" | "high";
  reportsCount: number;
  createdAt: string;
}

export function useModerationQueue(status: string) {
  return useQuery({
    queryKey: ["staff", "moderation", "queue", status],
    queryFn: () => api.get<{ reports: StaffReport[] }>(`/system/moderation/queue?status=${status}`, true),
  });
}

export function useActionReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "remove" | "warn" | "suspend" | "dismiss"; reason?: string | undefined }) =>
      api.post(`/system/moderation/reports/${id}/action`, { action, reason }, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "moderation", "queue"] }),
  });
}

export interface ModerationRule {
  _id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  config: Record<string, any>;
  editableBy: "admin" | "superadmin";
}

export function useModerationRules() {
  return useQuery({
    queryKey: ["staff", "moderation", "rules"],
    queryFn: () => api.get<{ rules: ModerationRule[] }>("/system/moderation/rules", true),
  });
}

export function useUpdateModerationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, ...input }: { key: string; enabled?: boolean; config?: Record<string, any>; name?: string; description?: string }) =>
      api.put(`/system/moderation/rules/${key}`, input, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "moderation", "rules"] }),
  });
}
