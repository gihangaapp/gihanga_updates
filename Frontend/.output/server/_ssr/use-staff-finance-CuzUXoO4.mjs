import { n as api } from "./api-client-C-02deeD.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-staff-finance-CuzUXoO4.js
function useStaffPayments(status = "pending") {
	return useQuery({
		queryKey: [
			"staff",
			"payments",
			status
		],
		queryFn: () => api.get(`/system/payments?status=${status}`, true),
		refetchInterval: 15e3
	});
}
function useApprovePayment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.post(`/system/payments/${id}/approve`, void 0, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "payments"] })
	});
}
function useRejectPayment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, reason }) => api.post(`/system/payments/${id}/reject`, { reason }, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "payments"] })
	});
}
function useRewardConfig() {
	return useQuery({
		queryKey: [
			"staff",
			"rewards",
			"config"
		],
		queryFn: () => api.get("/system/rewards/config", true)
	});
}
function useSaveRewardConfig() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.put("/system/rewards/config", input, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [
			"staff",
			"rewards",
			"config"
		] })
	});
}
//#endregion
export { useStaffPayments as a, useSaveRewardConfig as i, useRejectPayment as n, useRewardConfig as r, useApprovePayment as t };
