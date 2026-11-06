import { n as api } from "./api-client-C-W0Sa9i.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as useAuth } from "./auth-context-CsN3soau.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-ads-Bg4PdVDV.js
function useAdConfig() {
	return useQuery({
		queryKey: ["ads", "config"],
		queryFn: async () => {
			try {
				return (await api.get("/ads/config"))?.config;
			} catch (err) {
				console.error("[useAdConfig Error]:", err);
				return null;
			}
		}
	});
}
function useCalculateAdPrice(advertisingMinutes, campaignDurationDays) {
	return useQuery({
		queryKey: [
			"ads",
			"calculate-price",
			advertisingMinutes,
			campaignDurationDays
		],
		queryFn: async () => {
			try {
				return (await api.post("/ads/calculate-price", {
					advertisingMinutes,
					campaignDurationDays
				}))?.price;
			} catch (err) {
				console.error("[useCalculateAdPrice Error]:", err);
				return null;
			}
		},
		enabled: advertisingMinutes > 0 && campaignDurationDays > 0
	});
}
function useMyAds() {
	return useQuery({
		queryKey: ["ads", "mine"],
		queryFn: async () => {
			try {
				return (await api.get("/ads"))?.campaigns ?? [];
			} catch (err) {
				console.error("[useMyAds Error]:", err);
				return [];
			}
		}
	});
}
function useCreateAd() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.post("/ads", input),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ads"] })
	});
}
function useUpdateAd() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...input }) => api.patch(`/ads/${id}`, input),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ads"] })
	});
}
function useDeleteAd() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.delete(`/ads/${id}`),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ads"] })
	});
}
function useFeedAds() {
	const { user, staffUser } = useAuth();
	const isStaffSession = Boolean(staffUser && !user);
	const viewerKey = user?.id || staffUser?.id || "anonymous";
	return useQuery({
		queryKey: [
			"ads",
			"delivery",
			"feed",
			viewerKey
		],
		queryFn: async () => {
			try {
				return (await api.get("/ads/delivery/feed", isStaffSession))?.ads ?? [];
			} catch (err) {
				console.error("[useFeedAds Error]:", err);
				return [];
			}
		},
		staleTime: 3e4
	});
}
function useStoryAds() {
	const { user, staffUser } = useAuth();
	const isStaffSession = Boolean(staffUser && !user);
	const viewerKey = user?.id || staffUser?.id || "anonymous";
	return useQuery({
		queryKey: [
			"ads",
			"delivery",
			"story",
			viewerKey
		],
		queryFn: async () => {
			try {
				return (await api.get("/ads/delivery/story", isStaffSession))?.ads ?? [];
			} catch (err) {
				console.error("[useStoryAds Error]:", err);
				return [];
			}
		},
		staleTime: 3e4
	});
}
function useReelAds() {
	const { user, staffUser } = useAuth();
	const isStaffSession = Boolean(staffUser && !user);
	const viewerKey = user?.id || staffUser?.id || "anonymous";
	return useQuery({
		queryKey: [
			"ads",
			"delivery",
			"reels",
			viewerKey
		],
		queryFn: async () => {
			try {
				return (await api.get("/ads/delivery/reels", isStaffSession))?.ads ?? [];
			} catch (err) {
				console.error("[useReelAds Error]:", err);
				return [];
			}
		},
		staleTime: 3e4
	});
}
function useAdReaction() {
	const queryClient = useQueryClient();
	const { user, staffUser } = useAuth();
	const isStaffSession = Boolean(staffUser && !user);
	return useMutation({
		mutationFn: ({ adId, reaction }) => api.post(`/ads/${adId}/reaction`, { reaction }, isStaffSession),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: ["ads", "delivery"] });
			const previous = queryClient.getQueriesData({ queryKey: ["ads", "delivery"] });
			queryClient.setQueriesData({ queryKey: ["ads", "delivery"] }, (current) => current?.map((ad) => {
				if (ad._id !== variables.adId) return ad;
				const hadReaction = Boolean(ad.viewerReaction);
				const nextReaction = variables.reaction;
				const delta = hadReaction ? nextReaction ? 0 : -1 : nextReaction ? 1 : 0;
				return {
					...ad,
					viewerReaction: nextReaction,
					analytics: {
						...ad.analytics,
						likes: Math.max(0, (ad.analytics?.likes || 0) + delta)
					}
				};
			}));
			return { previous };
		},
		onError: (_error, _variables, context) => {
			context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
		},
		onSuccess: (result, variables) => {
			queryClient.setQueriesData({ queryKey: ["ads", "delivery"] }, (current) => current?.map((ad) => ad._id === variables.adId ? {
				...ad,
				viewerReaction: result.reaction,
				analytics: {
					...ad.analytics,
					likes: result.likesCount
				}
			} : ad));
			queryClient.invalidateQueries({ queryKey: ["ads", "mine"] });
		}
	});
}
function useAdComments(adId, enabled = true) {
	const { user, staffUser } = useAuth();
	const isStaffSession = Boolean(staffUser && !user);
	return useQuery({
		queryKey: [
			"ads",
			"comments",
			adId
		],
		queryFn: ({ signal }) => api.get(`/ads/${adId}/comments`, isStaffSession, signal),
		enabled: Boolean(adId) && enabled
	});
}
function useCreateAdComment(adId) {
	const queryClient = useQueryClient();
	const { user, staffUser } = useAuth();
	const isStaffSession = Boolean(staffUser && !user);
	return useMutation({
		mutationFn: (body) => api.post(`/ads/${adId}/comments`, { body }, isStaffSession),
		onSuccess: (result) => {
			if (result.comment) queryClient.setQueryData([
				"ads",
				"comments",
				adId
			], (current) => ({
				comments: [result.comment, ...(current?.comments || []).filter((comment) => comment._id !== result.comment._id)],
				total: result.total ?? (current?.total || 0) + 1
			}));
			queryClient.invalidateQueries({ queryKey: [
				"ads",
				"comments",
				adId
			] });
			queryClient.invalidateQueries({ queryKey: ["ads", "delivery"] });
		}
	});
}
function useShareAd() {
	const queryClient = useQueryClient();
	const { user, staffUser } = useAuth();
	const isStaffSession = Boolean(staffUser && !user);
	return useMutation({
		mutationFn: (adId) => api.post(`/ads/${adId}/share`, void 0, isStaffSession),
		onSuccess: (result, adId) => {
			queryClient.setQueriesData({ queryKey: ["ads", "delivery"] }, (current) => current?.map((ad) => ad._id === adId ? {
				...ad,
				analytics: {
					...ad.analytics,
					shares: result.sharesCount
				}
			} : ad));
		}
	});
}
function useRecordImpression() {
	const { user, staffUser } = useAuth();
	const isStaffSession = Boolean(staffUser && !user);
	return useMutation({ mutationFn: (adId) => api.post(`/ads/${adId}/impression`, void 0, isStaffSession) });
}
function useRecordClick() {
	const { user, staffUser } = useAuth();
	const isStaffSession = Boolean(staffUser && !user);
	return useMutation({ mutationFn: (adId) => api.post(`/ads/${adId}/click`, void 0, isStaffSession) });
}
function useRecordView() {
	const { user, staffUser } = useAuth();
	const isStaffSession = Boolean(staffUser && !user);
	return useMutation({ mutationFn: ({ adId, seconds }) => api.post(`/ads/${adId}/view`, { seconds }, isStaffSession) });
}
function useAdFeedback() {
	const queryClient = useQueryClient();
	const { user, staffUser } = useAuth();
	const isStaffSession = Boolean(staffUser && !user);
	return useMutation({
		mutationFn: ({ id, action, reason }) => api.post(`/ads/${id}/feedback`, {
			action,
			reason
		}, isStaffSession),
		onSuccess: (_data, variables) => {
			if (variables.action === "hide") {
				queryClient.setQueriesData({ queryKey: [
					"ads",
					"delivery",
					"feed"
				] }, (current) => current?.filter((ad) => ad._id !== variables.id));
				queryClient.setQueriesData({ queryKey: [
					"ads",
					"delivery",
					"story"
				] }, (current) => current?.filter((ad) => ad._id !== variables.id));
				queryClient.setQueriesData({ queryKey: [
					"ads",
					"delivery",
					"reels"
				] }, (current) => current?.filter((ad) => ad._id !== variables.id));
			}
		}
	});
}
function useStaffAds(filters) {
	const params = new URLSearchParams();
	if (filters?.status) params.set("status", filters.status);
	if (filters?.placement) params.set("placement", filters.placement);
	if (filters?.adType) params.set("adType", filters.adType);
	if (filters?.paymentMethod) params.set("paymentMethod", filters.paymentMethod);
	const queryString = params.toString() ? `?${params.toString()}` : "";
	return useQuery({
		queryKey: [
			"staff",
			"ads",
			filters
		],
		queryFn: async () => {
			try {
				return (await api.get(`/system/ads${queryString}`, true))?.campaigns ?? [];
			} catch (err) {
				console.error("[useStaffAds Error]:", err);
				return [];
			}
		}
	});
}
function useStaffAdSummary() {
	return useQuery({
		queryKey: [
			"staff",
			"ads",
			"summary"
		],
		queryFn: async () => {
			try {
				return (await api.get("/system/ads/analytics/summary", true))?.summary;
			} catch (err) {
				console.error("[useStaffAdSummary Error]:", err);
				return null;
			}
		}
	});
}
function useApproveAd() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.post(`/system/ads/${id}/approve`, void 0, true),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["staff", "ads"] });
			queryClient.invalidateQueries({ queryKey: ["ads"] });
		}
	});
}
function useConfirmManualAdPayment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, reference }) => api.post(`/system/ads/${id}/confirm-manual-payment`, { reference }, true),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["staff", "ads"] });
			queryClient.invalidateQueries({ queryKey: ["ads"] });
		}
	});
}
function useRejectAd() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, reason, autoRefund }) => api.post(`/system/ads/${id}/reject`, {
			reason,
			autoRefund
		}, true),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["staff", "ads"] });
			queryClient.invalidateQueries({ queryKey: ["ads"] });
		}
	});
}
function usePauseAd() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.post(`/system/ads/${id}/pause`, void 0, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "ads"] })
	});
}
function useResumeAd() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.post(`/system/ads/${id}/resume`, void 0, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "ads"] })
	});
}
function useRemoveStaffAd() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.delete(`/system/ads/${id}`, true),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["staff", "ads"] });
			queryClient.invalidateQueries({ queryKey: [
				"staff",
				"ads",
				"summary"
			] });
			queryClient.invalidateQueries({ queryKey: ["ads"] });
		}
	});
}
function useRefundAd() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.post(`/system/ads/${id}/refund`, void 0, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "ads"] })
	});
}
function useSuperadminAdSettings() {
	return useQuery({
		queryKey: [
			"staff",
			"settings",
			"ads"
		],
		queryFn: async () => {
			try {
				return (await api.get("/system/settings/ads", true))?.config;
			} catch (err) {
				console.error("[useSuperadminAdSettings Error]:", err);
				return null;
			}
		}
	});
}
function useUpdateSuperadminAdSettings() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (updates) => api.put("/system/settings/ads", updates, true),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [
				"staff",
				"settings",
				"ads"
			] });
			queryClient.invalidateQueries({ queryKey: ["ads", "config"] });
		}
	});
}
//#endregion
export { useStaffAdSummary as C, useUpdateAd as D, useSuperadminAdSettings as E, useUpdateSuperadminAdSettings as O, useShareAd as S, useStoryAds as T, useReelAds as _, useApproveAd as a, useRemoveStaffAd as b, useCreateAd as c, useFeedAds as d, useMyAds as f, useRecordView as g, useRecordImpression as h, useAdReaction as i, useCreateAdComment as l, useRecordClick as m, useAdConfig as n, useCalculateAdPrice as o, usePauseAd as p, useAdFeedback as r, useConfirmManualAdPayment as s, useAdComments as t, useDeleteAd as u, useRefundAd as v, useStaffAds as w, useResumeAd as x, useRejectAd as y };
