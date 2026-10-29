import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as getConsumerAccessToken, i as clearStaffTokens, l as setConsumerTokens, n as api, o as getStaffAccessToken, r as clearConsumerTokens, t as API_ORIGIN, u as setStaffTokens } from "./api-client-DZOxvrvB.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as lookup } from "../_libs/socket.io-client+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-context-CuF8V2_l.js
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
/**
* Small IndexedDB persistence layer for the social content users revisit most.
* Cache entries are partitioned by authenticated user, restored before the
* returning user's feed is mounted, and refreshed by React Query in the
* background when stale. IndexedDB is optional: unsupported/private browsing
* falls back to the in-memory QueryClient without changing app behavior.
*/
var DB_NAME = "gihanga-query-cache";
var DB_VERSION = 1;
var STORE_NAME = "snapshots";
var SCHEMA_VERSION = 1;
var SCHEMA_KEY = "__schema_version__";
var SNAPSHOT_MAX_AGE_MS = 6048e5;
var MAX_PERSISTED_QUERIES = 50;
var MAX_PERSISTED_FEED_PAGES = 3;
var PERSIST_DEBOUNCE_MS = 180;
var dbPromise = null;
var schemaPromise = null;
function openDatabase() {
	if (dbPromise) return dbPromise;
	if (typeof indexedDB === "undefined") return Promise.resolve(null);
	dbPromise = new Promise((resolve) => {
		try {
			const request = indexedDB.open(DB_NAME, DB_VERSION);
			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
			};
			request.onsuccess = () => {
				request.result.onversionchange = () => request.result.close();
				resolve(request.result);
			};
			request.onerror = () => resolve(null);
			request.onblocked = () => resolve(null);
		} catch {
			resolve(null);
		}
	});
	return dbPromise;
}
function withStore(mode, run) {
	return openDatabase().then((db) => {
		if (!db) return null;
		return new Promise((resolve) => {
			try {
				const transaction = db.transaction(STORE_NAME, mode);
				const request = run(transaction.objectStore(STORE_NAME));
				let result = null;
				request.onsuccess = () => {
					result = request.result ?? null;
				};
				transaction.oncomplete = () => resolve(result);
				transaction.onerror = () => resolve(null);
				transaction.onabort = () => resolve(null);
			} catch {
				resolve(null);
			}
		});
	});
}
async function ensureSchema() {
	if (schemaPromise) return schemaPromise;
	schemaPromise = (async () => {
		if (await withStore("readonly", (store) => store.get(SCHEMA_KEY)) !== SCHEMA_VERSION) {
			await withStore("readwrite", (store) => store.clear());
			await withStore("readwrite", (store) => store.put(SCHEMA_VERSION, SCHEMA_KEY));
		}
	})();
	return schemaPromise;
}
function storageKey(userId) {
	return `user:${userId}:query-snapshot`;
}
function isPersistableQuery(query) {
	const root = query.queryKey[0];
	return root === "posts" || root === "recommendations" || root === "stories" || root === "profile" || root === "user-profile" || root === "following-set" || root === "notifications";
}
function trimQueryData(data) {
	if (!data || typeof data !== "object") return data;
	const value = data;
	if (!Array.isArray(value.pages) || value.pages.length <= MAX_PERSISTED_FEED_PAGES) return data;
	return {
		...value,
		pages: value.pages.slice(0, MAX_PERSISTED_FEED_PAGES),
		pageParams: Array.isArray(value.pageParams) ? value.pageParams.slice(0, MAX_PERSISTED_FEED_PAGES) : value.pageParams
	};
}
async function restoreUserQueryCache(queryClient, userId, isCurrent = () => true) {
	if (!userId) return;
	await ensureSchema();
	const snapshot = await withStore("readonly", (store) => store.get(storageKey(userId)));
	if (!isCurrent() || !snapshot || snapshot.schemaVersion !== SCHEMA_VERSION || !Array.isArray(snapshot.queries) || Date.now() - snapshot.storedAt > SNAPSHOT_MAX_AGE_MS) return;
	for (const entry of snapshot.queries) {
		if (!Array.isArray(entry.queryKey) || entry.data === void 0) continue;
		if (Date.now() - entry.updatedAt > SNAPSHOT_MAX_AGE_MS) continue;
		try {
			queryClient.setQueryData(entry.queryKey, entry.data, { updatedAt: entry.updatedAt });
		} catch {}
	}
}
async function writeUserSnapshot(queryClient, userId) {
	if (!userId) return;
	const queries = queryClient.getQueryCache().findAll().filter((query) => isPersistableQuery(query) && query.state.data !== void 0).sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt).slice(0, MAX_PERSISTED_QUERIES).map((query) => ({
		queryKey: query.queryKey,
		data: trimQueryData(query.state.data),
		updatedAt: query.state.dataUpdatedAt || Date.now()
	}));
	let safeSnapshot;
	try {
		safeSnapshot = JSON.parse(JSON.stringify({
			schemaVersion: SCHEMA_VERSION,
			storedAt: Date.now(),
			queries
		}));
	} catch {
		return;
	}
	await ensureSchema();
	await withStore("readwrite", (store) => store.put(safeSnapshot, storageKey(userId)));
}
/** Subscribe after hydration and coalesce bursts of cache updates into one write. */
function startUserQueryCachePersistence(queryClient, userId) {
	let timer = null;
	let disposed = false;
	const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
		if (event.type !== "updated") return;
		if (event.action.type !== "success" && event.action.type !== "setState") return;
		if (!isPersistableQuery(event.query)) return;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = null;
			if (!disposed) writeUserSnapshot(queryClient, userId);
		}, PERSIST_DEBOUNCE_MS);
	});
	return () => {
		disposed = true;
		if (timer) clearTimeout(timer);
		timer = null;
		unsubscribe();
	};
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
	const queryClient = useQueryClient();
	const [user, setUser] = (0, import_react.useState)(null);
	const [staffUser, setStaffUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [cacheReadyUserId, setCacheReadyUserId] = (0, import_react.useState)(null);
	const stopCachePersistence = (0, import_react.useRef)(null);
	const authRun = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		let active = true;
		const runId = ++authRun.current;
		const readCachedProfile = (key) => {
			try {
				const raw = localStorage.getItem(key);
				if (!raw) return null;
				const parsed = JSON.parse(raw);
				return parsed && typeof parsed.id === "string" ? parsed : null;
			} catch {
				return null;
			}
		};
		const validateConsumerSession = async () => {
			if (!getConsumerAccessToken()) return;
			try {
				const data = await api.get("/auth/me");
				if (!active || authRun.current !== runId) return;
				setUser(data.user);
				setCacheReadyUserId(data.user.id);
				localStorage.setItem("gihanga_user_profile", JSON.stringify(data.user));
			} catch {
				if (!active || authRun.current !== runId) return;
				if (!getConsumerAccessToken()) {
					stopCachePersistence.current?.();
					stopCachePersistence.current = null;
					setCacheReadyUserId(null);
					setUser(null);
					localStorage.removeItem("gihanga_user_profile");
					queryClient.removeQueries({ queryKey: ["posts"] });
					queryClient.removeQueries({ queryKey: ["recommendations"] });
					queryClient.removeQueries({ queryKey: ["stories"] });
				}
			}
		};
		const validateStaffSession = async () => {
			if (!getStaffAccessToken()) return;
			try {
				const data = await api.get("/system/auth/me", true);
				if (!active || authRun.current !== runId) return;
				if (data?.user) {
					setStaffUser(data.user);
					localStorage.setItem("gihanga_staff_profile", JSON.stringify(data.user));
				}
			} catch {
				if (!active || authRun.current !== runId) return;
				if (!getStaffAccessToken()) {
					setStaffUser(null);
					localStorage.removeItem("gihanga_staff_profile");
				}
			}
		};
		async function initAuth() {
			const consumerToken = getConsumerAccessToken();
			const staffToken = getStaffAccessToken();
			const cachedConsumer = consumerToken ? readCachedProfile("gihanga_user_profile") : null;
			const cachedStaff = staffToken ? readCachedProfile("gihanga_staff_profile") : null;
			if (cachedConsumer && consumerToken) try {
				await restoreUserQueryCache(queryClient, cachedConsumer.id, () => active && authRun.current === runId && getConsumerAccessToken() === consumerToken);
			} catch {}
			if (!active || authRun.current !== runId) return;
			if (cachedConsumer && consumerToken) {
				setUser(cachedConsumer);
				setCacheReadyUserId(cachedConsumer.id);
			}
			if (cachedStaff && staffToken) setStaffUser(cachedStaff);
			if (Boolean(consumerToken && cachedConsumer || staffToken && cachedStaff)) setLoading(false);
			await Promise.all([validateConsumerSession(), validateStaffSession()]);
			if (active && authRun.current === runId) setLoading(false);
		}
		initAuth();
		return () => {
			active = false;
		};
	}, [queryClient]);
	(0, import_react.useEffect)(() => {
		stopCachePersistence.current?.();
		stopCachePersistence.current = null;
		if (user?.id && cacheReadyUserId === user.id) stopCachePersistence.current = startUserQueryCachePersistence(queryClient, user.id);
		return () => {
			stopCachePersistence.current?.();
			stopCachePersistence.current = null;
		};
	}, [
		cacheReadyUserId,
		queryClient,
		user?.id
	]);
	const signInConsumer = (tokens, profile) => {
		const runId = ++authRun.current;
		setConsumerTokens(tokens.accessToken, tokens.refreshToken);
		localStorage.setItem("gihanga_user_profile", JSON.stringify(profile));
		if (user?.id !== profile.id) {
			stopCachePersistence.current?.();
			stopCachePersistence.current = null;
			queryClient.clear();
		}
		setCacheReadyUserId(null);
		setUser(profile);
		setLoading(false);
		restoreUserQueryCache(queryClient, profile.id, () => authRun.current === runId && getConsumerAccessToken() === tokens.accessToken).finally(() => {
			if (authRun.current === runId && getConsumerAccessToken() === tokens.accessToken) setCacheReadyUserId(profile.id);
		});
	};
	const updateConsumerProfile = (profile) => {
		localStorage.setItem("gihanga_user_profile", JSON.stringify(profile));
		setUser(profile);
	};
	const signInStaff = (tokens, profile) => {
		authRun.current += 1;
		setStaffTokens(tokens.accessToken, tokens.refreshToken);
		localStorage.setItem("gihanga_staff_profile", JSON.stringify(profile));
		setStaffUser(profile);
		setLoading(false);
	};
	const signOutConsumer = () => {
		authRun.current += 1;
		stopCachePersistence.current?.();
		stopCachePersistence.current = null;
		queryClient.clear();
		setCacheReadyUserId(null);
		setLoading(false);
		clearConsumerTokens();
		localStorage.removeItem("gihanga_user_profile");
		setUser(null);
		disconnectSocket();
	};
	const signOutStaff = () => {
		authRun.current += 1;
		clearStaffTokens();
		localStorage.removeItem("gihanga_staff_profile");
		setStaffUser(null);
		setLoading(false);
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
