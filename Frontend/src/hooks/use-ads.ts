import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export type AdType = "image" | "video" | "story_image" | "story_video";
export type AdPlacement = "feed" | "story";
export type AdStatus =
  | "draft"
  | "pending_payment"
  | "processing"
  | "paid"
  | "pending_review"
  | "approved"
  | "rejected"
  | "active"
  | "paused"
  | "expired"
  | "cancelled"
  | "refund_pending"
  | "refunded";

export type PaymentMethod = "real_money" | "gihanga_points" | "manual";
export type ManualPaymentStatus = "not_applicable" | "awaiting_payment" | "verified";
export type PaymentStatus =
  "unpaid" | "pending" | "processing" | "paid" | "refund_pending" | "refunded";

export interface AdConfig {
  enabled: boolean;
  pointsEnabled: boolean;
  rwfPerMinute: number;
  gpPerMinute: number;
  minMinutes: number;
  maxMinutes: number;
  maxVideoDurationSeconds: number;
  minCampaignDays: number;
  maxCampaignDays: number;
  frequencyCapPerHour: number;
}

export interface AdPriceResult {
  advertisingMinutes: number;
  campaignDurationDays: number;
  rwfTotal: number;
  rwfPerMinute: number;
  gpTotal: number;
  gpPerMinute: number;
  breakdown: { line: string; value: string }[];
  pointsEnabled: boolean;
}

export interface AdAnalytics {
  impressions: number;
  views: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  videoStarts: number;
  videoCompletions: number;
  totalWatchSeconds: number;
  ctr: number;
  completionRate: number;
  reach: number;
}

export type AdReaction = "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry";

export interface AdComment {
  _id: string;
  ad: string;
  author: { _id: string; name: string; username: string; avatarHue?: number; avatarUrl?: string | null; isCreator?: boolean; verified?: boolean };
  body: string;
  createdAt: string;
}

export interface Advertisement {
  _id: string;
  creator:
    | string
    | {
        _id: string;
        name: string;
        username: string;
        email: string;
        avatarHue?: number;
        avatarUrl?: string;
        isCreator?: boolean;
      };
  isCreator: boolean;
  adType: AdType;
  placement: AdPlacement;
  title: string;
  caption?: string;
  ctaText?: string;
  ctaUrl?: string;
  mediaUrl?: string;
  mediaKey?: string;
  mediaType?: "image" | "video";
  videoDurationSeconds?: number;
  thumbnailUrl?: string;
  commentsCount?: number;
  viewerReaction?: AdReaction | null;

  campaignDurationDays: number;
  startDate?: string;
  endDate?: string;

  advertisingMinutes: number;
  advertisingMinutesDelivered: number;

  rwfPricePerMinute: number;
  gpPricePerMinute: number;
  totalRwfCost: number;
  totalGpCost: number;

  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  manualPaymentStatus: ManualPaymentStatus;
  manualPaymentContact?: { name: string; email: string; phone: string };
  manualPaymentVerifiedAt?: string;
  manualPaymentReference?: string;

  status: AdStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  approvedAt?: string;

  targeting?: { interests?: string[]; location?: string };
  analytics: AdAnalytics;
  createdAt: string;
  updatedAt: string;
}

// ── Public & Advertiser Hooks ────────────────────────────────────────────────

export function useAdConfig() {
  return useQuery({
    queryKey: ["ads", "config"],
    queryFn: async () => {
      try {
        const res = await api.get<{ config: AdConfig }>("/ads/config");
        return res?.config;
      } catch (err) {
        console.error("[useAdConfig Error]:", err);
        return null;
      }
    },
  });
}

export function useCalculateAdPrice(advertisingMinutes: number, campaignDurationDays: number) {
  return useQuery({
    queryKey: ["ads", "calculate-price", advertisingMinutes, campaignDurationDays],
    queryFn: async () => {
      try {
        const res = await api.post<{ price: AdPriceResult }>("/ads/calculate-price", {
          advertisingMinutes,
          campaignDurationDays,
        });
        return res?.price;
      } catch (err) {
        console.error("[useCalculateAdPrice Error]:", err);
        return null;
      }
    },
    enabled: advertisingMinutes > 0 && campaignDurationDays > 0,
  });
}

export function useMyAds() {
  return useQuery({
    queryKey: ["ads", "mine"],
    queryFn: async () => {
      try {
        const res = await api.get<{ campaigns: Advertisement[] }>("/ads");
        return res?.campaigns ?? [];
      } catch (err) {
        console.error("[useMyAds Error]:", err);
        return [];
      }
    },
  });
}

export function useAd(id: string) {
  return useQuery({
    queryKey: ["ads", "detail", id],
    queryFn: async () => {
      try {
        const res = await api.get<{ campaign: Advertisement }>(`/ads/${id}`);
        return res?.campaign;
      } catch (err) {
        console.error("[useAd Error]:", err);
        return null;
      }
    },
    enabled: Boolean(id),
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      adType: AdType;
      placement: AdPlacement;
      title: string;
      caption?: string | undefined;
      ctaText?: string | undefined;
      ctaUrl?: string | undefined;
      mediaUrl?: string | undefined;
      mediaKey?: string | undefined;
      mediaType?: "image" | "video" | undefined;
      videoDurationSeconds?: number | undefined;
      thumbnailUrl?: string | undefined;
      campaignDurationDays: number;
      advertisingMinutes: number;
      contactName: string;
      contactEmail: string;
      contactPhone: string;
      targeting?: { interests?: string[]; location?: string };
    }) => api.post<{ campaign: Advertisement; price: AdPriceResult; message: string }>("/ads", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ads"] }),
  });
}

export function useUpdateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      status?: "active" | "paused";
      title?: string;
      caption?: string;
      ctaText?: string;
      ctaUrl?: string;
      mediaUrl?: string;
      thumbnailUrl?: string;
    }) => api.patch<{ campaign: Advertisement }>(`/ads/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ads"] }),
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/ads/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ads"] }),
  });
}

export function usePayAdWithPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, idempotencyKey }: { id: string; idempotencyKey?: string }) =>
      api.post<{
        success: boolean;
        campaign: Advertisement;
        pointsBefore: number;
        pointsDeducted: number;
        pointsAfter: number;
      }>(`/ads/${id}/pay/points`, { idempotencyKey }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function usePayAdWithMoney() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, idempotencyKey }: { id: string; idempotencyKey?: string }) =>
      api.post<{
        success: boolean;
        campaign: Advertisement;
      }>(`/ads/${id}/pay/money`, { idempotencyKey }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

// ── Ad Delivery Hooks ────────────────────────────────────────────────────────

export function useFeedAds() {
  const { user, staffUser } = useAuth();
  const isStaffSession = Boolean(staffUser && !user);
  const viewerKey = user?.id || staffUser?.id || "anonymous";
  return useQuery({
    queryKey: ["ads", "delivery", "feed", viewerKey],
    queryFn: async () => {
      try {
        const res = await api.get<{ ads: Advertisement[] }>("/ads/delivery/feed", isStaffSession);
        return res?.ads ?? [];
      } catch (err) {
        console.error("[useFeedAds Error]:", err);
        return [];
      }
    },
    staleTime: 30000,
  });
}

export function useStoryAds() {
  const { user, staffUser } = useAuth();
  const isStaffSession = Boolean(staffUser && !user);
  const viewerKey = user?.id || staffUser?.id || "anonymous";
  return useQuery({
    queryKey: ["ads", "delivery", "story", viewerKey],
    queryFn: async () => {
      try {
        const res = await api.get<{ ads: Advertisement[] }>("/ads/delivery/story", isStaffSession);
        return res?.ads ?? [];
      } catch (err) {
        console.error("[useStoryAds Error]:", err);
        return [];
      }
    },
    staleTime: 30000,
  });
}

export function useAdReaction() {
  const queryClient = useQueryClient();
  const { user, staffUser } = useAuth();
  const isStaffSession = Boolean(staffUser && !user);
  return useMutation<
    { liked: boolean; reaction: AdReaction | null; likesCount: number },
    Error,
    { adId: string; reaction: AdReaction | null },
    { previous: [readonly unknown[], Advertisement[] | undefined][] }
  >({
    mutationFn: ({ adId, reaction }) =>
      api.post<{ liked: boolean; reaction: AdReaction | null; likesCount: number }>(`/ads/${adId}/reaction`, { reaction }, isStaffSession),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["ads", "delivery"] });
      const previous = queryClient.getQueriesData<Advertisement[]>({ queryKey: ["ads", "delivery"] });
      queryClient.setQueriesData<Advertisement[]>({ queryKey: ["ads", "delivery"] }, (current) =>
        current?.map((ad) => {
          if (ad._id !== variables.adId) return ad;
          const hadReaction = Boolean(ad.viewerReaction);
          const nextReaction = variables.reaction;
          const delta = hadReaction ? (nextReaction ? 0 : -1) : (nextReaction ? 1 : 0);
          return {
            ...ad,
            viewerReaction: nextReaction,
            analytics: { ...ad.analytics, likes: Math.max(0, (ad.analytics?.likes || 0) + delta) },
          };
        }),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSuccess: (result, variables) => {
      queryClient.setQueriesData<Advertisement[]>({ queryKey: ["ads", "delivery"] }, (current) =>
        current?.map((ad) => ad._id === variables.adId
          ? { ...ad, viewerReaction: result.reaction, analytics: { ...ad.analytics, likes: result.likesCount } }
          : ad),
      );
      queryClient.invalidateQueries({ queryKey: ["ads", "mine"] });
    },
  });
}

export function useAdComments(adId: string, enabled = true) {
  const { user, staffUser } = useAuth();
  const isStaffSession = Boolean(staffUser && !user);
  return useQuery({
    queryKey: ["ads", "comments", adId],
    queryFn: ({ signal }) => api.get<{ comments: AdComment[]; total: number }>(`/ads/${adId}/comments`, isStaffSession, signal),
    enabled: Boolean(adId) && enabled,
  });
}

export function useCreateAdComment(adId: string) {
  const queryClient = useQueryClient();
  const { user, staffUser } = useAuth();
  const isStaffSession = Boolean(staffUser && !user);
  return useMutation({
    mutationFn: (body: string) => api.post<{ comment: AdComment | null; total?: number; moderation?: { status: string }; pendingNotice?: string }>(`/ads/${adId}/comments`, { body }, isStaffSession),
    onSuccess: (result) => {
      if (result.comment) {
        queryClient.setQueryData<{ comments: AdComment[]; total: number }>(["ads", "comments", adId], (current) => ({
          comments: [result.comment!, ...(current?.comments || []).filter((comment) => comment._id !== result.comment!._id)],
          total: result.total ?? (current?.total || 0) + 1,
        }));
      }
      queryClient.invalidateQueries({ queryKey: ["ads", "comments", adId] });
      queryClient.invalidateQueries({ queryKey: ["ads", "delivery"] });
    },
  });
}

export function useShareAd() {
  const queryClient = useQueryClient();
  const { user, staffUser } = useAuth();
  const isStaffSession = Boolean(staffUser && !user);
  return useMutation({
    mutationFn: (adId: string) => api.post<{ sharesCount: number }>(`/ads/${adId}/share`, undefined, isStaffSession),
    onSuccess: (result, adId) => {
      queryClient.setQueriesData<Advertisement[]>({ queryKey: ["ads", "delivery"] }, (current) =>
        current?.map((ad) => ad._id === adId ? { ...ad, analytics: { ...ad.analytics, shares: result.sharesCount } } : ad),
      );
    },
  });
}

export function useRecordImpression() {
  const { user, staffUser } = useAuth();
  const isStaffSession = Boolean(staffUser && !user);
  return useMutation({
    mutationFn: (adId: string) => api.post(`/ads/${adId}/impression`, undefined, isStaffSession),
  });
}

export function useRecordClick() {
  const { user, staffUser } = useAuth();
  const isStaffSession = Boolean(staffUser && !user);
  return useMutation({
    mutationFn: (adId: string) => api.post(`/ads/${adId}/click`, undefined, isStaffSession),
  });
}

export function useRecordView() {
  const { user, staffUser } = useAuth();
  const isStaffSession = Boolean(staffUser && !user);
  return useMutation({
    mutationFn: ({ adId, seconds }: { adId: string; seconds: number }) =>
      api.post(`/ads/${adId}/view`, { seconds }, isStaffSession),
  });
}

export function useAdFeedback() {
  const queryClient = useQueryClient();
  const { user, staffUser } = useAuth();
  const isStaffSession = Boolean(staffUser && !user);
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "hide" | "report"; reason?: string }) =>
      api.post<{ success: boolean; message: string }>(`/ads/${id}/feedback`, { action, reason }, isStaffSession),
    onSuccess: (_data, variables) => {
      if (variables.action === "hide") {
        queryClient.setQueriesData<Advertisement[]>({ queryKey: ["ads", "delivery", "feed"] }, (current) =>
          current?.filter((ad) => ad._id !== variables.id),
        );
        queryClient.setQueriesData<Advertisement[]>({ queryKey: ["ads", "delivery", "story"] }, (current) =>
          current?.filter((ad) => ad._id !== variables.id),
        );
      }
    },
  });
}

// ── Staff Oversight & Admin Hooks ────────────────────────────────────────────

export function useStaffAds(filters?: {
  status?: string | undefined;
  placement?: string | undefined;
  adType?: string | undefined;
  paymentMethod?: string | undefined;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.placement) params.set("placement", filters.placement);
  if (filters?.adType) params.set("adType", filters.adType);
  if (filters?.paymentMethod) params.set("paymentMethod", filters.paymentMethod);
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: ["staff", "ads", filters],
    queryFn: async () => {
      try {
        const res = await api.get<{ campaigns: Advertisement[] }>(
          `/system/ads${queryString}`,
          true,
        );
        return res?.campaigns ?? [];
      } catch (err) {
        console.error("[useStaffAds Error]:", err);
        return [];
      }
    },
  });
}

export function useStaffAdSummary() {
  return useQuery({
    queryKey: ["staff", "ads", "summary"],
    queryFn: async () => {
      try {
        const res = await api.get<{
          summary: {
            totalCampaigns: number;
            activeCampaigns: number;
            pendingReview: number;
            awaitingManualPayment: number;
            manualPaymentVerified: number;
            manualPaymentRevenue: number;
            approvedCampaigns: number;
            rejectedCampaigns: number;
            totalRwfRevenue: number;
            totalPointsSpent: number;
            totalAdvertisingMinutes: number;
            totalImpressions: number;
            totalClicks: number;
            totalViews: number;
          };
        }>("/system/ads/analytics/summary", true);
        return res?.summary;
      } catch (err) {
        console.error("[useStaffAdSummary Error]:", err);
        return null;
      }
    },
  });
}

export function useApproveAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ campaign: Advertisement }>(`/system/ads/${id}/approve`, undefined, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useConfirmManualAdPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reference }: { id: string; reference?: string }) =>
      api.post<{ campaign: Advertisement; message: string }>(
        `/system/ads/${id}/confirm-manual-payment`,
        { reference },
        true,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useRejectAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reason,
      autoRefund,
    }: {
      id: string;
      reason: string;
      autoRefund?: boolean;
    }) =>
      api.post<{ campaign: Advertisement }>(
        `/system/ads/${id}/reject`,
        { reason, autoRefund },
        true,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function usePauseAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ campaign: Advertisement }>(`/system/ads/${id}/pause`, undefined, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "ads"] }),
  });
}

export function useResumeAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ campaign: Advertisement }>(`/system/ads/${id}/resume`, undefined, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "ads"] }),
  });
}

export function useDisableAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ campaign: Advertisement }>(`/system/ads/${id}/disable`, undefined, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "ads"] }),
  });
}

export function useRefundAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ success: boolean; message: string; campaign: Advertisement }>(
        `/system/ads/${id}/refund`,
        undefined,
        true,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "ads"] }),
  });
}

// ── Superadmin Settings Hooks ────────────────────────────────────────────────

export function useSuperadminAdSettings() {
  return useQuery({
    queryKey: ["staff", "settings", "ads"],
    queryFn: async () => {
      try {
        const res = await api.get<{ config: AdConfig }>("/system/settings/ads", true);
        return res?.config;
      } catch (err) {
        console.error("[useSuperadminAdSettings Error]:", err);
        return null;
      }
    },
  });
}

export function useUpdateSuperadminAdSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<AdConfig>) =>
      api.put<{ config: AdConfig }>("/system/settings/ads", updates, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "settings", "ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads", "config"] });
    },
  });
}
