import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as api } from "./api-client-DZOxvrvB.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as getStaffSocket, l as useAuth } from "./auth-context-CuF8V2_l.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-staff-notifications-CrbufWm0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useStaffNotifications() {
	const { staffUser } = useAuth();
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: ["staff", "notifications"],
		queryFn: () => api.get("/system/notifications", true),
		enabled: Boolean(staffUser)
	});
	(0, import_react.useEffect)(() => {
		if (!staffUser) return;
		const socket = getStaffSocket();
		if (!socket) return;
		const onNotification = (payload) => {
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
function useMarkStaffNotificationsRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => api.post("/system/notifications/read-all", void 0, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "notifications"] })
	});
}
function useStaffActivity() {
	return useQuery({
		queryKey: ["staff", "activity"],
		queryFn: () => api.get("/system/staff/activity", true)
	});
}
function useOnlineDot() {
	const [connected, setConnected] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
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
//#endregion
export { useStaffNotifications as i, useOnlineDot as n, useStaffActivity as r, useMarkStaffNotificationsRead as t };
