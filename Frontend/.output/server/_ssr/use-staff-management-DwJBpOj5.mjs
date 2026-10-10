import { n as api } from "./api-client-C-02deeD.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-staff-management-DwJBpOj5.js
function useStaffList() {
	return useQuery({
		queryKey: ["staff", "list"],
		queryFn: () => api.get("/system/staff", true)
	});
}
function usePromoteStaff() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.post("/system/staff/promote", input, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "list"] })
	});
}
function useCreateStaff() {
	return useMutation({ mutationFn: (input) => api.post("/system/staff/create", input, true) });
}
function useDemoteStaff() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.post(`/system/staff/${id}/demote`, void 0, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "list"] })
	});
}
function useAuditLog(filters) {
	const query = new URLSearchParams();
	if (filters.action) query.set("action", filters.action);
	if (filters.from) query.set("from", filters.from);
	if (filters.to) query.set("to", filters.to);
	if (filters.page) query.set("page", String(filters.page));
	return useQuery({
		queryKey: [
			"staff",
			"audit",
			filters
		],
		queryFn: () => api.get(`/system/audit?${query}`, true)
	});
}
function useStaffSettings() {
	return useQuery({
		queryKey: ["staff", "settings"],
		queryFn: () => api.get("/system/settings", true)
	});
}
function useSetFeatureFlag() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ key, value }) => api.put(`/system/settings/flags/${key}`, { value }, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "settings"] })
	});
}
function useSetMomoVisibility() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (visible) => api.put("/system/settings/momo-visibility", { visible }, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "settings"] })
	});
}
function useStaffCategories() {
	return useQuery({
		queryKey: ["staff", "categories"],
		queryFn: () => api.get("/system/settings/categories", true)
	});
}
function useCreateCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.post("/system/settings/categories", input, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "categories"] })
	});
}
function useUpdateCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...input }) => api.patch(`/system/settings/categories/${id}`, input, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "categories"] })
	});
}
function useDeleteCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.delete(`/system/settings/categories/${id}`, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "categories"] })
	});
}
//#endregion
export { useDemoteStaff as a, useSetMomoVisibility as c, useStaffSettings as d, useUpdateCategory as f, useDeleteCategory as i, useStaffCategories as l, useCreateCategory as n, usePromoteStaff as o, useCreateStaff as r, useSetFeatureFlag as s, useAuditLog as t, useStaffList as u };
