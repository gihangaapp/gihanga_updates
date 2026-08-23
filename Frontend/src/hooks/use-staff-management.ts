import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface StaffMember {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "moderator" | "admin" | "superadmin";
  status: string;
  createdAt: string;
}

export function useStaffList() {
  return useQuery({
    queryKey: ["staff", "list"],
    queryFn: () => api.get<{ staff: StaffMember[] }>("/system/staff", true),
  });
}

export function usePromoteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { identifier: string; role: "moderator" | "admin" }) =>
      api.post("/system/staff/promote", input, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "list"] }),
  });
}

export function useDemoteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/system/staff/${id}/demote`, undefined, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "list"] }),
  });
}

// ── Audit log ────────────────────────────────────────────────────────────────

export interface AuditEntry {
  _id: string;
  actor: { name: string; username: string; role: string } | null;
  action: string;
  targetUser?: { name: string; username: string } | null;
  targetId?: string;
  meta?: Record<string, any>;
  createdAt: string;
}

export function useAuditLog(filters: { action?: string | undefined; from?: string | undefined; to?: string | undefined; page?: number | undefined }) {
  const query = new URLSearchParams();
  if (filters.action) query.set("action", filters.action);
  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", filters.to);
  if (filters.page) query.set("page", String(filters.page));

  return useQuery({
    queryKey: ["staff", "audit", filters],
    queryFn: () =>
      api.get<{ entries: AuditEntry[]; page: number; total: number; hasMore: boolean; scope: "own" | "all" }>(
        `/system/audit?${query}`,
        true,
      ),
  });
}

// ── Platform settings ────────────────────────────────────────────────────────

export function useStaffSettings() {
  return useQuery({
    queryKey: ["staff", "settings"],
    queryFn: () => api.get<{ flags: { key: string; value: any }[]; momoVisible: boolean }>("/system/settings", true),
  });
}

export function useSetFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: boolean }) => api.put(`/system/settings/flags/${key}`, { value }, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "settings"] }),
  });
}

export function useSetMomoVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (visible: boolean) => api.put("/system/settings/momo-visibility", { visible }, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "settings"] }),
  });
}

export interface StaffCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  order: number;
}

export function useStaffCategories() {
  return useQuery({
    queryKey: ["staff", "categories"],
    queryFn: () => api.get<{ categories: StaffCategory[] }>("/system/settings/categories", true),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) => api.post("/system/settings/categories", input, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "categories"] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; active?: boolean; name?: string; description?: string }) =>
      api.patch(`/system/settings/categories/${id}`, input, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "categories"] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/system/settings/categories/${id}`, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "categories"] }),
  });
}
