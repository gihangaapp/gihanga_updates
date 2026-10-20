import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface StaffReport {
  _id: string;
  reporter: { name: string; username: string; avatarHue: number; avatarUrl: string | null };
  target: { name: string; username: string; avatarHue: number; avatarUrl: string | null };
  targetPost?: {
    _id: string;
    kind: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    body: string;
  };
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
    queryFn: () =>
      api.get<{ reports: StaffReport[] }>(`/system/moderation/queue?status=${status}`, true),
  });
}

export function useActionReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: "remove" | "warn" | "suspend" | "dismiss";
      reason?: string | undefined;
    }) => api.post(`/system/moderation/reports/${id}/action`, { action, reason }, true),
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
    mutationFn: ({
      key,
      ...input
    }: {
      key: string;
      enabled?: boolean;
      config?: Record<string, any>;
      name?: string;
      description?: string;
    }) => api.put(`/system/moderation/rules/${key}`, input, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "moderation", "rules"] }),
  });
}

// ─── AI moderation review queue (ModerationRecord-based) ─────────────────────

export interface ModerationAssessment {
  _id: string;
  contentType: "post" | "story" | "comment" | "live_title" | "live_chat" | "profile" | "avatar" | "media" | "video";
  contentId?: string;
  author?: { name: string; username: string; avatarHue: number; avatarUrl: string | null } | null;
  surface: string;
  decision: "APPROVED" | "REJECTED" | "PENDING_REVIEW" | "PROCESSING" | "FAILED";
  status: "processing" | "pending_review" | "approved" | "rejected" | "failed";
  severity: "low" | "medium" | "high" | "critical";
  criticalEscalation: boolean;
  categories: { category: string; score: number; providerLabel: string }[];
  userMessage?: string;
  error?: string;
  content?: {
    type: string;
    post?: { kind: string; body?: string; mediaUrl?: string; thumbnailUrl?: string; status: string };
    story?: { mediaUrl?: string; caption?: string; mediaType: string };
    comment?: { body: string };
    media?: { type: string; context: string };
  } | null;
  reviewedBy?: { name: string; username: string } | null;
  reviewedAt?: string;
  reviewNote?: string;
  appealStatus?: "none" | "pending" | "approved" | "rejected";
  createdAt: string;
}

export function useAssessmentsQueue(status: string, criticalOnly = false) {
  return useQuery({
    queryKey: ["staff", "moderation", "assessments", status, criticalOnly],
    queryFn: () =>
      api.get<{ records: ModerationAssessment[] }>(
        `/system/moderation/assessments?status=${status}${criticalOnly ? "&critical=true" : ""}`,
        true,
      ),
    refetchInterval: status === "pending_review" ? 30_000 : false,
  });
}

export function useAssessmentDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: "approve" | "reject" | "escalate"; note?: string }) =>
      api.post(`/system/moderation/assessments/${id}/decision`, { action, note }, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "moderation", "assessments"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "moderation", "statistics"] });
    },
  });
}

// ─── Appeals ─────────────────────────────────────────────────────────────────

export interface StaffAppeal {
  _id: string;
  statement: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  decisionNote?: string;
  user?: { name: string; username: string } | null;
  record?: {
    contentType: string;
    decision: string;
    status: string;
    userMessage?: string;
  } | null;
}

export function useAppeals(status: string) {
  return useQuery({
    queryKey: ["staff", "moderation", "appeals", status],
    queryFn: () =>
      api.get<{ appeals: StaffAppeal[] }>(`/system/moderation/appeals?status=${status}`, true),
  });
}

export function useAppealDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: "approve" | "reject"; note: string }) =>
      api.post(`/system/moderation/appeals/${id}/decision`, { action, note }, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "moderation", "appeals"] }),
  });
}

// ─── Statistics & health ─────────────────────────────────────────────────────

export function useModerationStatistics() {
  return useQuery({
    queryKey: ["staff", "moderation", "statistics"],
    queryFn: () => api.get<Record<string, any>>("/system/moderation/statistics", true),
  });
}

export function useModerationHealth() {
  return useQuery({
    queryKey: ["staff", "moderation", "health"],
    queryFn: () => api.get<Record<string, any>>("/system/moderation/health", true),
    refetchInterval: 60_000,
  });
}
