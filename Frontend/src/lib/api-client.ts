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
function resolveApiBaseUrl(): string {
  const configured = import.meta.env["VITE_API_URL"];
  if (configured) return configured;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:4000/api/v1`;
  }
  return "http://localhost:4000/api/v1";
}

const API_BASE_URL = resolveApiBaseUrl();
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

/** Turns a relative `/uploads/...` path from the backend into an absolute URL. */
export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}

const CONSUMER_TOKEN_KEY = "gihanga_consumer_access_token";
const CONSUMER_REFRESH_KEY = "gihanga_consumer_refresh_token";
const STAFF_TOKEN_KEY = "gihanga_staff_access_token";
const STAFF_REFRESH_KEY = "gihanga_staff_refresh_token";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "user" | "moderator" | "admin" | "superadmin";
  isCreator: boolean;
  verified: boolean;
  emailVerified: boolean;
  avatarHue: number;
  avatarUrl: string | null;
  bio: string;
  interests: string[];
  onboarded: boolean;
  isLive: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt?: string;
  permissions?: string[];
}

export function getConsumerAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSUMER_TOKEN_KEY);
}

export function setConsumerTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(CONSUMER_TOKEN_KEY, accessToken);
  localStorage.setItem(CONSUMER_REFRESH_KEY, refreshToken);
}

export function clearConsumerTokens() {
  localStorage.removeItem(CONSUMER_TOKEN_KEY);
  localStorage.removeItem(CONSUMER_REFRESH_KEY);
}

export function getStaffAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STAFF_TOKEN_KEY);
}

export function getConsumerRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSUMER_REFRESH_KEY);
}

export function getStaffRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STAFF_REFRESH_KEY);
}

export function setStaffTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(STAFF_TOKEN_KEY, accessToken);
  localStorage.setItem(STAFF_REFRESH_KEY, refreshToken);
}

export function clearStaffTokens() {
  localStorage.removeItem(STAFF_TOKEN_KEY);
  localStorage.removeItem(STAFF_REFRESH_KEY);
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isStaffRequest = false
): Promise<T> {
  const token = isStaffRequest ? getStaffAccessToken() : getConsumerAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Token Refresh on 401
  if (response.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh")) {
    const refreshed = isStaffRequest ? await refreshStaffToken() : await refreshConsumerToken();
    if (refreshed) {
      const newToken = isStaffRequest ? getStaffAccessToken() : getConsumerAccessToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
      }
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Request failed`);
  }

  return data as T;
}

async function refreshConsumerToken(): Promise<boolean> {
  const refreshToken = getConsumerRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearConsumerTokens();
      return false;
    }

    const data = await res.json();
    setConsumerTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return true;
  } catch {
    clearConsumerTokens();
    return false;
  }
}

async function refreshStaffToken(): Promise<boolean> {
  const refreshToken = getStaffRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/system/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearStaffTokens();
      return false;
    }

    const data = await res.json();
    setStaffTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return true;
  } catch {
    clearStaffTokens();
    return false;
  }
}

export const api = {
  get: <T>(endpoint: string, isStaff = false) => apiFetch<T>(endpoint, { method: "GET" }, isStaff),
  post: <T>(endpoint: string, body?: any, isStaff = false) =>
    apiFetch<T>(endpoint, { method: "POST", ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }, isStaff),
  patch: <T>(endpoint: string, body?: any, isStaff = false) =>
    apiFetch<T>(endpoint, { method: "PATCH", ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }, isStaff),
  put: <T>(endpoint: string, body?: any, isStaff = false) =>
    apiFetch<T>(endpoint, { method: "PUT", ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }, isStaff),
  delete: <T>(endpoint: string, isStaff = false) =>
    apiFetch<T>(endpoint, { method: "DELETE" }, isStaff),
};

/**
 * Uploads a single file with progress reporting (fetch can't report upload progress,
 * so this uses XHR under the hood). Used for photos/videos/reels/avatars/stories.
 */
export function uploadFile(
  kind: "photos" | "videos" | "reels" | "avatars" | "stories",
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ url: string; key: string; mimeType: string; sizeBytes: number; kind: string }> {
  return new Promise((resolve, reject) => {
    const token = getConsumerAccessToken();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/uploads/${kind}`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.error || "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed — check your connection"));

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

// ── Social feature types ────────────────────────────────────────────────────

export interface PostAuthor {
  _id: string;
  name: string;
  username: string;
  avatarHue: number;
  avatarUrl: string | null;
  isCreator: boolean;
  verified: boolean;
  isLive: boolean;
}

export type PostKind = "photo" | "video" | "reel" | "text";

export interface FeedPost {
  _id: string;
  author: PostAuthor;
  kind: PostKind;
  body: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  location?: string;
  tags: string[];
  audience: "public" | "followers" | "private";
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  liked: boolean;
  bookmarked: boolean;
  followingAuthor: boolean;
  createdAt: string;
}

export interface PostComment {
  _id: string;
  post: string;
  author: PostAuthor;
  body: string;
  parent?: string;
  likesCount: number;
  repliesCount: number;
  liked: boolean;
  replies: PostComment[];
  createdAt: string;
}

export interface StoryItem {
  _id: string;
  author: PostAuthor;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  duration: number;
  expiresAt: string;
  viewCount: number;
  viewedByMe: boolean;
  createdAt: string;
}

export interface StoryGroup {
  author: PostAuthor;
  items: StoryItem[];
  seen: boolean;
}

export interface AppNotification {
  _id: string;
  recipient: string;
  actor?: PostAuthor;
  kind: "like" | "comment" | "follow" | "mention" | "live" | "system" | "payment" | "reward";
  text: string;
  relatedPost?: { _id: string; kind: PostKind; mediaUrl?: string; thumbnailUrl?: string; body: string };
  read: boolean;
  createdAt: string;
}

export interface PublicUser {
  _id: string;
  name: string;
  username: string;
  avatarHue: number;
  avatarUrl: string | null;
  bio: string;
  isCreator: boolean;
  verified: boolean;
  isLive: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  isFollowing: boolean;
  isFollowedBy?: boolean;
  isSelf?: boolean;
}
