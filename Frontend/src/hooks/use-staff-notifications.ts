import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { getStaffSocket } from "@/lib/socket-client";

export interface StaffNotification {
  _id: string;
  kind: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export function useStaffNotifications() {
  const { staffUser } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["staff", "notifications"],
    queryFn: () => api.get<{ notifications: StaffNotification[]; unreadCount: number }>("/system/notifications", true),
    enabled: Boolean(staffUser),
  });

  useEffect(() => {
    if (!staffUser) return;
    const socket = getStaffSocket();
    if (!socket) return;

    const onNotification = (payload: { text: string }) => {
      toast.info(payload.text);
      queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] });
    };
    socket.on("staff:notification", onNotification);
    return () => {
      socket.off("staff:notification", onNotification);
    };
  }, [staffUser, queryClient]);

  return query;
}

export function useMarkStaffNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/system/notifications/read-all", undefined, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] }),
  });
}

export interface StaffActivityEntry {
  staffId: string;
  name: string;
  username: string;
  role: string;
  actionCount: number;
  lastActionAt: string;
  breakdown: Record<string, number>;
}

export function useStaffActivity() {
  return useQuery({
    queryKey: ["staff", "activity"],
    queryFn: () => api.get<{ activity: StaffActivityEntry[]; since: string }>("/system/staff/activity", true),
  });
}

export function useOnlineDot() {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const socket = getStaffSocket();
    if (!socket) return;
    setConnected(socket.connected);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  return connected;
}
