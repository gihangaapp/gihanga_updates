import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, PostAuthor } from "@/lib/api-client";

export interface LiveStreamData {
  _id: string;
  host: PostAuthor & { followersCount: number };
  title: string;
  subsOnly: boolean;
  giftsEnabled: boolean;
  viewerCount: number;
  peakViewers: number;
  totalGifts: number;
  reactionsCount: number;
  status: "pending" | "live" | "ended" | "force_ended";
  startedAt?: string;
  endedAt?: string;
  endReason?: string;
  createdAt: string;
}

export interface LiveChatEntry {
  _id: string;
  stream: string;
  sender: PostAuthor;
  body: string;
  isGift: boolean;
  giftAmount?: number;
  pinned?: boolean;
  createdAt: string;
}

export function useLiveStreams() {
  return useQuery({
    queryKey: ["live", "list"],
    queryFn: () => api.get<{ streams: LiveStreamData[] }>("/live"),
    refetchInterval: 5_000,
  });
}

export function useLiveStream(id: string) {
  return useQuery({
    queryKey: ["live", "detail", id],
    queryFn: () => api.get<{ stream: LiveStreamData }>(`/live/${id}`),
    enabled: Boolean(id),
    refetchInterval: 10_000,
  });
}

export function useLiveChatHistory(id: string) {
  return useQuery({
    queryKey: ["live", "chat-history", id],
    queryFn: () => api.get<{ messages: LiveChatEntry[]; pinned: LiveChatEntry | null }>(`/live/${id}/chat`),
    enabled: Boolean(id),
  });
}

/**
 * Starts a live stream. Pass `asStaff: true` when the broadcaster is a
 * moderator/admin/superadmin going live with their staff session — the
 * backend's `authenticateConsumerOrStaff` middleware accepts either token,
 * so this only changes which access token gets sent.
 */
export function useStartLive(asStaff = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; description?: string | undefined; subsOnly?: boolean | undefined; giftsEnabled?: boolean | undefined }) =>
      api.post<{ stream: LiveStreamData }>("/live/start", input, asStaff),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live"] }),
  });
}

export function useEndLive(asStaff = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ stream: LiveStreamData }>(`/live/${id}/end`, undefined, asStaff),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live"] }),
  });
}

export function useLiveHeartbeat(streamId: string, asStaff = false) {
  return useMutation({
    mutationFn: () =>
      api.post<{ ok: boolean; lastHeartbeatAt: string }>(`/live/${streamId}/heartbeat`, undefined, asStaff),
  });
}

export const GIFT_CATALOG = [
  { id: "heart", label: "Heart", cost: 10, emoji: "\u2764\uFE0F" },
  { id: "fire", label: "Fire", cost: 50, emoji: "\uD83D\uDD25" },
  { id: "crown", label: "Crown", cost: 200, emoji: "\uD83D\uDC51" },
  { id: "rocket", label: "Rocket", cost: 500, emoji: "\uD83D\uDE80" },
] as const;

export function useSendGift(streamId: string) {
  return useMutation({
    mutationFn: (giftId: (typeof GIFT_CATALOG)[number]["id"]) =>
      api.post<{ sent: boolean; amount: number; remainingPoints: number }>(`/live/${streamId}/gift`, { giftId }),
  });
}

export function useMyWallet() {
  return useQuery({
    queryKey: ["wallet", "me"],
    queryFn: () =>
      api.get<{ wallet: { available: number; pending: number; kingdomPoints: number; frozen: boolean } }>(
        "/wallet/me",
      ),
  });
}

// ── Moderation, earnings, reporting ─────────────────────────────────────────

// All of these are host/moderator actions — `asStaff` routes them through the
// staff access token for a moderator/admin/superadmin broadcasting or
// moderating with only their staff session open (see live.$streamId.tsx).

export function useAddModerator(streamId: string, asStaff = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => api.post(`/live/${streamId}/moderators`, { username }, asStaff),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live", "detail", streamId] }),
  });
}

export function useMuteViewer(streamId: string, asStaff = false) {
  return useMutation({
    mutationFn: (userId: string) => api.post<{ muted: boolean }>(`/live/${streamId}/viewers/${userId}/mute`, undefined, asStaff),
  });
}

export function useBanViewer(streamId: string, asStaff = false) {
  return useMutation({
    mutationFn: (userId: string) => api.post<{ banned: boolean }>(`/live/${streamId}/viewers/${userId}/ban`, undefined, asStaff),
  });
}

export function useLiveEarnings(streamId: string, enabled: boolean, asStaff = false) {
  return useQuery({
    queryKey: ["live", "earnings", streamId, asStaff],
    queryFn: () => api.get<{ totalPoints: number; giftCount: number }>(`/live/${streamId}/earnings`, asStaff),
    enabled,
  });
}

export function useUpdateLiveSettings(streamId: string, asStaff = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { giftsEnabled?: boolean; subsOnly?: boolean }) =>
      api.patch<{ stream: LiveStreamData }>(`/live/${streamId}/settings`, input, asStaff),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live", "detail", streamId] }),
  });
}

export function useInviteFollowers(streamId: string, asStaff = false) {
  return useMutation({
    mutationFn: () => api.post<{ invited: number }>(`/live/${streamId}/invite`, undefined, asStaff),
  });
}

export function useReportLive(streamId: string) {
  return useMutation({
    mutationFn: (input: { reason: string; excerpt?: string }) => api.post(`/live/${streamId}/report`, input),
  });
}

// ── Staff (moderator) ────────────────────────────────────────────────────────

export function useStaffLiveStreams() {
  return useQuery({
    queryKey: ["staff", "live", "list"],
    queryFn: () => api.get<{ streams: LiveStreamData[] }>("/system/live", true),
    refetchInterval: 15_000,
    retry: 1,
  });
}

export function useForceEndLive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<{ stream: LiveStreamData }>(`/system/live/${id}/force-end`, { reason }, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "live"] }),
  });
}

export function useLiveAlerts() {
  return useQuery({
    queryKey: ["staff", "live", "alerts"],
    queryFn: () => api.get<{ alerts: any[] }>("/system/live/alerts", true),
  });
}

export function useLiveKeywords() {
  return useQuery({
    queryKey: ["staff", "live", "keywords"],
    queryFn: () => api.get<{ keywords: string[] }>("/system/live/keywords", true),
  });
}

export function useSaveLiveKeywords() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keywords: string[]) => api.put<{ keywords: string[] }>("/system/live/keywords", { keywords }, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "live", "keywords"] }),
  });
}
