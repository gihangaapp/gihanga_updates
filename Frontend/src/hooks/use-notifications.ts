import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, AppNotification } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

interface NotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
  page: number;
}

export function useNotifications() {
  const { user } = useAuth();

  // Real-time updates are handled globally by <RealtimeProvider>, which invalidates
  // this query the instant a "notification:new" socket event arrives — no polling.
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<NotificationsResponse>("/notifications"),
    enabled: Boolean(user),
  });
}

export function useUnreadNotificationCount(): number {
  const { data } = useNotifications();
  return data?.unreadCount ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
