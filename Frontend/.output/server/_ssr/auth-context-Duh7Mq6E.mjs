import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as getConsumerAccessToken, c as setConsumerTokens, i as clearStaffTokens, l as setStaffTokens, n as api, o as getStaffAccessToken, r as clearConsumerTokens, t as API_ORIGIN } from "./api-client-C-02deeD.mjs";
import { t as lookup } from "../_libs/socket.io-client+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-context-Duh7Mq6E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var socket = null;
var staffSocket = null;
/** Connects (or reuses) a socket authenticated with the current access token. */
function getSocket() {
	const token = getConsumerAccessToken();
	if (!token) return null;
	if (!socket) socket = lookup(API_ORIGIN, {
		auth: { token },
		transports: ["websocket", "polling"]
	});
	else if (socket.auth && socket.auth.token !== token) {
		socket.auth = { token };
		socket.disconnect().connect();
	}
	return socket;
}
/** Staff (moderator/admin/superadmin) socket — joins `staff:moderators` for live moderation pushes. */
function getStaffSocket() {
	const token = getStaffAccessToken();
	if (!token) return null;
	if (!staffSocket) staffSocket = lookup(API_ORIGIN, {
		auth: {
			token,
			isStaff: true
		},
		transports: ["websocket", "polling"]
	});
	else if (staffSocket.auth && staffSocket.auth.token !== token) {
		staffSocket.auth = {
			token,
			isStaff: true
		};
		staffSocket.disconnect().connect();
	}
	return staffSocket;
}
/**
* Socket to use for the live-stream room (join/chat/react/moderate). Prefers
* the consumer socket (the common case), but falls back to the staff socket
* when the person is only logged in as staff — e.g. a moderator going live
* or moderating with just their `/system` session open. The backend's
* connection handler joins a staff socket to `user:<id>` too, so every
* `live:*` event works identically either way.
*/
function getLiveSocket() {
	return getSocket() ?? getStaffSocket();
}
function disconnectSocket() {
	socket?.disconnect();
	socket = null;
}
function disconnectStaffSocket() {
	staffSocket?.disconnect();
	staffSocket = null;
}
var AuthContext = (0, import_react.createContext)({
	user: null,
	staffUser: null,
	loading: true,
	signInConsumer: () => {},
	signInStaff: () => {},
	updateConsumerProfile: () => {},
	signOutConsumer: () => {},
	signOutStaff: () => {}
});
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [staffUser, setStaffUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		async function initAuth() {
			if (getConsumerAccessToken()) try {
				const data = await api.get("/auth/me");
				setUser(data.user);
				localStorage.setItem("gihanga_user_profile", JSON.stringify(data.user));
			} catch {
				clearConsumerTokens();
				localStorage.removeItem("gihanga_user_profile");
			}
			if (getStaffAccessToken()) try {
				const savedStaff = localStorage.getItem("gihanga_staff_profile");
				if (savedStaff) setStaffUser(JSON.parse(savedStaff));
				const data = await api.get("/system/auth/me", true);
				if (data?.user) {
					setStaffUser(data.user);
					localStorage.setItem("gihanga_staff_profile", JSON.stringify(data.user));
				}
			} catch {
				clearStaffTokens();
				localStorage.removeItem("gihanga_staff_profile");
				setStaffUser(null);
			}
			setLoading(false);
		}
		initAuth();
	}, []);
	const signInConsumer = (tokens, profile) => {
		setConsumerTokens(tokens.accessToken, tokens.refreshToken);
		localStorage.setItem("gihanga_user_profile", JSON.stringify(profile));
		setUser(profile);
	};
	const updateConsumerProfile = (profile) => {
		localStorage.setItem("gihanga_user_profile", JSON.stringify(profile));
		setUser(profile);
	};
	const signInStaff = (tokens, profile) => {
		setStaffTokens(tokens.accessToken, tokens.refreshToken);
		localStorage.setItem("gihanga_staff_profile", JSON.stringify(profile));
		setStaffUser(profile);
	};
	const signOutConsumer = () => {
		clearConsumerTokens();
		localStorage.removeItem("gihanga_user_profile");
		setUser(null);
		disconnectSocket();
	};
	const signOutStaff = () => {
		clearStaffTokens();
		localStorage.removeItem("gihanga_staff_profile");
		setStaffUser(null);
		disconnectStaffSocket();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			user,
			staffUser,
			loading,
			signInConsumer,
			signInStaff,
			updateConsumerProfile,
			signOutConsumer,
			signOutStaff
		},
		children
	});
}
function useAuth() {
	return (0, import_react.useContext)(AuthContext);
}
var isEmail = (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());
function passwordScore(v) {
	let s = 0;
	if (v.length >= 8) s++;
	if (v.length >= 12) s++;
	if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
	if (/\d/.test(v)) s++;
	if (/[^A-Za-z0-9]/.test(v)) s++;
	return Math.min(s, 4);
}
var strengthLabels = [
	"Too weak",
	"Weak",
	"Fair",
	"Strong",
	"Excellent"
];
var interestTopics = [
	{
		category: "Creative",
		topics: [
			"Photography",
			"Design",
			"Film",
			"Illustration",
			"Writing"
		]
	},
	{
		category: "Culture",
		topics: [
			"Music",
			"Dance",
			"Fashion",
			"Art",
			"Comedy"
		]
	},
	{
		category: "Life",
		topics: [
			"Food",
			"Travel",
			"Fitness",
			"Wellness",
			"Family"
		]
	},
	{
		category: "Ideas",
		topics: [
			"Tech",
			"Business",
			"Creator economy",
			"Science",
			"News"
		]
	},
	{
		category: "Play",
		topics: [
			"Football",
			"Basketball",
			"Gaming",
			"Motorsport",
			"Outdoors"
		]
	}
];
//#endregion
export { interestTopics as a, strengthLabels as c, getStaffSocket as i, useAuth as l, getLiveSocket as n, isEmail as o, getSocket as r, passwordScore as s, AuthProvider as t };
