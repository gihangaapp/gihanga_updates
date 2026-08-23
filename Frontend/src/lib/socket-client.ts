import { io, Socket } from "socket.io-client";
import { API_ORIGIN, getConsumerAccessToken, getStaffAccessToken } from "./api-client";

let socket: Socket | null = null;
let staffSocket: Socket | null = null;

/** Connects (or reuses) a socket authenticated with the current access token. */
export function getSocket(): Socket | null {
  const token = getConsumerAccessToken();
  if (!token) return null;

  if (!socket) {
    socket = io(API_ORIGIN, { auth: { token }, transports: ["websocket", "polling"] });
  } else if (socket.auth && (socket.auth as any).token !== token) {
    // token was refreshed — reconnect with the new one
    socket.auth = { token };
    socket.disconnect().connect();
  }
  return socket;
}

/** Staff (moderator/admin/superadmin) socket — joins `staff:moderators` for live moderation pushes. */
export function getStaffSocket(): Socket | null {
  const token = getStaffAccessToken();
  if (!token) return null;

  if (!staffSocket) {
    staffSocket = io(API_ORIGIN, { auth: { token, isStaff: true }, transports: ["websocket", "polling"] });
  } else if (staffSocket.auth && (staffSocket.auth as any).token !== token) {
    staffSocket.auth = { token, isStaff: true };
    staffSocket.disconnect().connect();
  }
  return staffSocket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function disconnectStaffSocket() {
  staffSocket?.disconnect();
  staffSocket = null;
}
