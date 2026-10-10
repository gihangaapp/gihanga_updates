import { n as api } from "./api-client-C-02deeD.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-ads-B0t9iPcQ.js
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
function usePayAdWithPoints() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, idempotencyKey }) => api.post(`/ads/${id}/pay/points`, { idempotencyKey }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ads"] });
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
		}
	});
}
function usePayAdWithMoney() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, idempotencyKey }) => api.post(`/ads/${id}/pay/money`, { idempotencyKey }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ads"] });
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
		}
	});
}
function useFeedAds() {
	return useQuery({
		queryKey: [
			"ads",
			"delivery",
			"feed"
		],
		queryFn: async () => {
			try {
				return (await api.get("/ads/delivery/feed"))?.ads ?? [];
			} catch (err) {
				console.error("[useFeedAds Error]:", err);
				return [];
			}
		},
		staleTime: 3e4
	});
}
function useRecordImpression() {
	return useMutation({ mutationFn: (adId) => api.post(`/ads/${adId}/impression`) });
}
function useRecordClick() {
	return useMutation({ mutationFn: (adId) => api.post(`/ads/${adId}/click`) });
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
export { useStaffAds as _, useDeleteAd as a, useUpdateSuperadminAdSettings as b, usePauseAd as c, useRecordClick as d, useRecordImpression as f, useStaffAdSummary as g, useResumeAd as h, useCreateAd as i, usePayAdWithMoney as l, useRejectAd as m, useApproveAd as n, useFeedAds as o, useRefundAd as p, useCalculateAdPrice as r, useMyAds as s, useAdConfig as t, usePayAdWithPoints as u, useSuperadminAdSettings as v, useUpdateAd as y };
