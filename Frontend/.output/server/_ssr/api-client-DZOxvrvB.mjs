//#region node_modules/.nitro/vite/services/ssr/assets/api-client-DZOxvrvB.js
/**
* API Client for Gihanga Updates frontend.
* Manages access & refresh token storage and automatic refresh interceptor.
*/
/**
* Resolves the backend's base URL. If VITE_API_URL is set, that always wins
* (use this for a real deployment). Otherwise, derive it from whatever host
* the page itself was loaded from — so opening the app at
* http://localhost:8080 talks to http://localhost:4000, and opening the
* exact same build at http://192.168.1.23:8080 (e.g. from a phone on the
* same network) automatically talks to http://192.168.1.23:4000, with zero
* per-device configuration.
*/
function resolveApiBaseUrl() {
	const configured = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	}["VITE_API_URL"];
	if (configured) return configured;
	if (typeof window !== "undefined") return `${window.location.protocol}//${window.location.hostname}:4000/api/v1`;
	return "http://localhost:4000/api/v1";
}
var API_BASE_URL = resolveApiBaseUrl();
var API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
/** Turns a relative `/uploads/...` path from the backend into an absolute URL. */
/** Turns a relative `/uploads/...` path from the backend into an absolute URL. */
function mediaUrl(path) {
	if (!path) return void 0;
	const firstPath = (path.includes(",") ? path.split(",")[0] : path)?.trim() ?? "";
	if (!firstPath) return void 0;
	if (/^https?:\/\//.test(firstPath)) return firstPath;
	if (firstPath.startsWith("data:") || firstPath.startsWith("blob:")) return firstPath;
	return `${API_ORIGIN}${firstPath.startsWith("/") ? firstPath : `/${firstPath}`}`;
}
var CONSUMER_TOKEN_KEY = "gihanga_consumer_access_token";
var CONSUMER_REFRESH_KEY = "gihanga_consumer_refresh_token";
var STAFF_TOKEN_KEY = "gihanga_staff_access_token";
var STAFF_REFRESH_KEY = "gihanga_staff_refresh_token";
function getConsumerAccessToken() {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(CONSUMER_TOKEN_KEY);
}
function setConsumerTokens(accessToken, refreshToken) {
	localStorage.setItem(CONSUMER_TOKEN_KEY, accessToken);
	localStorage.setItem(CONSUMER_REFRESH_KEY, refreshToken);
}
function clearConsumerTokens() {
	localStorage.removeItem(CONSUMER_TOKEN_KEY);
	localStorage.removeItem(CONSUMER_REFRESH_KEY);
}
function getStaffAccessToken() {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(STAFF_TOKEN_KEY);
}
function getConsumerRefreshToken() {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(CONSUMER_REFRESH_KEY);
}
function getStaffRefreshToken() {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(STAFF_REFRESH_KEY);
}
function setStaffTokens(accessToken, refreshToken) {
	localStorage.setItem(STAFF_TOKEN_KEY, accessToken);
	localStorage.setItem(STAFF_REFRESH_KEY, refreshToken);
}
function clearStaffTokens() {
	localStorage.removeItem(STAFF_TOKEN_KEY);
	localStorage.removeItem(STAFF_REFRESH_KEY);
}
async function apiFetch(endpoint, options = {}, isStaffRequest = false) {
	const token = isStaffRequest ? getStaffAccessToken() : getConsumerAccessToken();
	const headers = {
		"Content-Type": "application/json",
		...options.headers
	};
	if (token) headers["Authorization"] = `Bearer ${token}`;
	let response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers
	});
	if (response.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh")) {
		if (isStaffRequest ? await refreshStaffToken() : await refreshConsumerToken()) {
			const newToken = isStaffRequest ? getStaffAccessToken() : getConsumerAccessToken();
			if (newToken) {
				headers["Authorization"] = `Bearer ${newToken}`;
				response = await fetch(`${API_BASE_URL}${endpoint}`, {
					...options,
					headers
				});
			}
		}
	}
	if (response.status === 204 || response.headers.get("content-length") === "0") {
		if (!response.ok) throw new Error(`HTTP ${response.status}: Request failed`);
		return {};
	}
	const text = await response.text();
	let data = {};
	if (text) try {
		data = JSON.parse(text);
	} catch {
		data = { message: text };
	}
	if (!response.ok) throw new Error(data.error || data.message || `HTTP ${response.status}: Request failed`);
	return data;
}
var consumerRefreshPromise = null;
var staffRefreshPromise = null;
async function refreshConsumerToken() {
	if (consumerRefreshPromise) return consumerRefreshPromise;
	consumerRefreshPromise = (async () => {
		const refreshToken = getConsumerRefreshToken();
		if (!refreshToken) {
			clearConsumerTokens();
			return false;
		}
		try {
			const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refreshToken })
			});
			if (!res.ok) {
				clearConsumerTokens();
				return false;
			}
			const data = await res.json();
			setConsumerTokens(data.tokens.accessToken, data.tokens.refreshToken);
			return true;
		} catch {
			return false;
		}
	})().finally(() => {
		consumerRefreshPromise = null;
	});
	return consumerRefreshPromise;
}
async function refreshStaffToken() {
	if (staffRefreshPromise) return staffRefreshPromise;
	staffRefreshPromise = (async () => {
		const refreshToken = getStaffRefreshToken();
		if (!refreshToken) {
			clearStaffTokens();
			return false;
		}
		try {
			const res = await fetch(`${API_BASE_URL}/system/auth/refresh`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refreshToken })
			});
			if (!res.ok) {
				clearStaffTokens();
				return false;
			}
			const data = await res.json();
			setStaffTokens(data.tokens.accessToken, data.tokens.refreshToken);
			return true;
		} catch {
			return false;
		}
	})().finally(() => {
		staffRefreshPromise = null;
	});
	return staffRefreshPromise;
}
var api = {
	get: (endpoint, isStaff = false, signal) => apiFetch(endpoint, {
		method: "GET",
		...signal ? { signal } : {}
	}, isStaff),
	post: (endpoint, body, isStaff = false) => apiFetch(endpoint, {
		method: "POST",
		...body !== void 0 ? { body: JSON.stringify(body) } : {}
	}, isStaff),
	patch: (endpoint, body, isStaff = false) => apiFetch(endpoint, {
		method: "PATCH",
		...body !== void 0 ? { body: JSON.stringify(body) } : {}
	}, isStaff),
	put: (endpoint, body, isStaff = false) => apiFetch(endpoint, {
		method: "PUT",
		...body !== void 0 ? { body: JSON.stringify(body) } : {}
	}, isStaff),
	delete: (endpoint, isStaff = false) => apiFetch(endpoint, { method: "DELETE" }, isStaff)
};
/**
* Like mediaUrl, but appends the consumer access token as a query parameter
* for CHECKED media delivery URLs (/api/v1/media/file/:id). Plain
* <img>/<video> tags can't attach an Authorization header, so without this
* an author's own still-pending story media rendered as an empty box.
*/
function mediaUrlWithAuth(path) {
	const url = mediaUrl(path);
	if (!url || !url.includes("/api/v1/media/file/")) return url;
	const token = getConsumerAccessToken();
	if (!token) return url;
	return `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
}
/**
* Uploads a single file with progress reporting (fetch can't report upload progress,
* so this uses XHR under the hood). Used for photos/videos/reels/avatars/stories/covers.
*
* If the access token has expired the first attempt comes back 401
* ("Authentication required") — this transparently refreshes the consumer
* token and retries ONCE so long sessions never break mid-upload.
*/
function uploadFile(kind, file, onProgress) {
	const attempt = () => new Promise((resolve, reject) => {
		const token = getConsumerAccessToken();
		const xhr = new XMLHttpRequest();
		xhr.open("POST", `${API_BASE_URL}/uploads/${kind}`);
		if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100));
		};
		xhr.onload = () => {
			let data = null;
			try {
				data = JSON.parse(xhr.responseText);
			} catch {
				data = null;
			}
			if (xhr.status >= 200 && xhr.status < 300) resolve(data);
			else reject(new Error(data?.error || "Upload failed"));
		};
		xhr.onerror = () => reject(/* @__PURE__ */ new Error("Upload failed — check your connection"));
		const form = new FormData();
		form.append("file", file);
		xhr.send(form);
	});
	return (async () => {
		try {
			return await attempt();
		} catch (err) {
			const msg = String(err?.message || "");
			if (msg.includes("Authentication required") || msg.includes("401")) {
				if (await refreshConsumerToken()) return attempt();
			}
			throw err;
		}
	})();
}
//#endregion
export { getConsumerAccessToken as a, mediaUrlWithAuth as c, uploadFile as d, clearStaffTokens as i, setConsumerTokens as l, api as n, getStaffAccessToken as o, clearConsumerTokens as r, mediaUrl as s, API_ORIGIN as t, setStaffTokens as u };
