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
/** Turns a relative `/uploads/...` path from the backend into an absolute URL. */
export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  const firstPath = (path.includes(",") ? path.split(",")[0] : path)?.trim() ?? "";
  if (!firstPath) return undefined;
  if (/^https?:\/\//.test(firstPath)) return firstPath;
  if (firstPath.startsWith("data:") || firstPath.startsWith("blob:")) return firstPath;
  const cleanPath = firstPath.startsWith("/") ? firstPath : `/${firstPath}`;
  return `${API_ORIGIN}${cleanPath}`;
}

/** Parses comma-separated media URLs into an array of absolute URLs */
export function mediaUrls(path?: string | null): string[] {
  if (!path) return [];
  const parts = path
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.map((p) => mediaUrl(p)).filter(Boolean) as string[];
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
  coverUrl?: string | null;
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
  isStaffRequest = false,
): Promise<T> {
  const token = isStaffRequest ? getStaffAccessToken() : getConsumerAccessToken();

  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Token Refresh on 401
  if (
    response.status === 401 &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh")
  ) {
    const refreshed = isStaffRequest ? await refreshStaffToken() : await refreshConsumerToken();
    if (refreshed) {
      const newToken = isStaffRequest ? getStaffAccessToken() : getConsumerAccessToken();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
      }
    }
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Request failed`);
    }
    return {} as T;
  }

  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}: Request failed`);
  }

  return data as T;
}

let consumerRefreshPromise: Promise<boolean> | null = null;
let staffRefreshPromise: Promise<boolean> | null = null;

async function refreshConsumerToken(): Promise<boolean> {
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
      // A temporary network failure is not proof that the session is invalid.
      // Keep the token so cache-first UI can remain available and retry later.
      return false;
    }
  })().finally(() => {
    consumerRefreshPromise = null;
  });
  return consumerRefreshPromise;
}

async function refreshStaffToken(): Promise<boolean> {
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
      // Preserve the session on a transport failure; only an explicit backend
      // rejection should remove stored credentials.
      return false;
    }
  })().finally(() => {
    staffRefreshPromise = null;
  });
  return staffRefreshPromise;
}

export const api = {
  get: <T>(endpoint: string, isStaff = false, signal?: AbortSignal) =>
    apiFetch<T>(endpoint, { method: "GET", ...(signal ? { signal } : {}) }, isStaff),
  post: <T>(endpoint: string, body?: any, isStaff = false) =>
    apiFetch<T>(
      endpoint,
      { method: "POST", ...(body !== undefined ? { body: JSON.stringify(body) } : {}) },
      isStaff,
    ),
  patch: <T>(endpoint: string, body?: any, isStaff = false) =>
    apiFetch<T>(
      endpoint,
      { method: "PATCH", ...(body !== undefined ? { body: JSON.stringify(body) } : {}) },
      isStaff,
    ),
  put: <T>(endpoint: string, body?: any, isStaff = false) =>
    apiFetch<T>(
      endpoint,
      { method: "PUT", ...(body !== undefined ? { body: JSON.stringify(body) } : {}) },
      isStaff,
    ),
  delete: <T>(endpoint: string, isStaff = false) =>
    apiFetch<T>(endpoint, { method: "DELETE" }, isStaff),
};

export interface UploadedMediaInfo {
  url: string;
  key?: string;
  mediaId?: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
  /** B1 — intrinsic geometry returned by the upload API. */
  width?: number;
  height?: number;
  aspectRatio?: number;
  orientation?: string;
  blurDataUrl?: string;
  thumbnailUrl?: string;
}

/**
 * Like mediaUrl, but appends the consumer access token as a query parameter
 * for CHECKED media delivery URLs (/api/v1/media/file/:id). Plain
 * <img>/<video> tags can't attach an Authorization header, so without this
 * an author's own still-pending story media rendered as an empty box.
 */
export function mediaUrlWithAuth(path?: string | null): string | undefined {
  const url = mediaUrl(path);
  if (!url || !url.includes("/api/v1/media/file/")) return url;

  // Native img/video elements cannot attach Authorization headers. Keep both
  // session types available: optionalAuth consumes the consumer token while
  // the media route separately verifies the staff token for reviewer previews.
  const consumerToken = getConsumerAccessToken();
  const staffToken = getStaffAccessToken();
  if (!consumerToken && !staffToken) return url;

  const [base, query = ""] = url.split("?", 2);
  const params = new URLSearchParams(query);
  if (consumerToken) params.set("token", consumerToken);
  if (staffToken) params.set("staffToken", staffToken);
  return `${base}?${params.toString()}`;
}

/**
 * Uploads a single file with progress reporting (fetch can't report upload progress,
 * so this uses XHR under the hood). Used for photos/videos/reels/avatars/stories/covers.
 *
 * If the access token has expired the first attempt comes back 401
 * ("Authentication required") — this transparently refreshes the consumer
 * token and retries ONCE so long sessions never break mid-upload.
 */
export function uploadFile(
  kind: "photos" | "videos" | "reels" | "avatars" | "stories" | "covers",
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadedMediaInfo> {
  const attempt = () =>
    new Promise<UploadedMediaInfo>((resolve, reject) => {
      const token = getConsumerAccessToken();
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/uploads/${kind}`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        let data: any = null;
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          data = null;
        }
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data?.error || "Upload failed"));
      };
      xhr.onerror = () => reject(new Error("Upload failed — check your connection"));

      const form = new FormData();
      form.append("file", file);
      xhr.send(form);
    });

  return (async () => {
    try {
      return await attempt();
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.includes("Authentication required") || msg.includes("401")) {
        const refreshed = await refreshConsumerToken();
        if (refreshed) return attempt();
      }
      throw err;
    }
  })();
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

/** B1 — per-item media metadata for multi-image posts. */
export interface FeedPostMediaItem {
  url: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  kind?: "photo" | "video";
}

export interface FeedPost {
  _id: string;
  author: PostAuthor;
  kind: PostKind;
  body: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  /** B1 — intrinsic media geometry (so the feed can size without cropping). */
  mediaWidth?: number;
  mediaHeight?: number;
  aspectRatio?: number;
  blurDataUrl?: string;
  /** B1 — per-item metadata for multi-image posts. */
  media?: FeedPostMediaItem[];
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
  /** Content-safety state — present on the author's own posts while a
 *  decision is pending/rejected so the UI can show status chips. Public
 *  feeds only ever contain approved posts, so this is undefined there. */
  status?: "published" | "processing" | "rejected" | "scheduled" | "draft" | "removed";
  moderation?: {
    status: "processing" | "pending_review" | "approved" | "rejected" | "failed";
    record?: string;
    userMessage?: string;
    updatedAt?: string;
  };
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
  kind: "like" | "comment" | "follow" | "mention" | "live" | "system" | "payment" | "reward" | "achievement";
  text: string;
  relatedPost?: {
    _id: string;
    kind: PostKind;
    mediaUrl?: string;
    thumbnailUrl?: string;
    body: string;
  };
  read: boolean;
  createdAt: string;
}

export interface PublicUser {
  _id: string;
  name: string;
  username: string;
  avatarHue: number;
  avatarUrl: string | null;
  coverUrl?: string | null;
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


// ── Achievement Badge System ─────────────────────────────────────────────────

export type AchievementCategory = "stars" | "diamonds";
export type AchievementMetric = "followers" | "views";
export type AchievementIcon = "star" | "diamond";
export type AchievementColor = "red" | "gold" | "blue" | "green";

/** A single badge's public state on a profile — locked or unlocked. */
export interface BadgeState {
  achievementId: string;
  name: string;
  category: AchievementCategory;
  metric: AchievementMetric;
  description: string;
  threshold: number;
  icon: AchievementIcon;
  color: AchievementColor;
  enabled: boolean;
  earned: boolean;
  /** ISO date string when the badge was awarded, if currently earned. */
  awardedAt: string | null;
}

/** A badge with detailed progress — current value, remaining, clamped %. */
export interface BadgeProgress extends BadgeState {
  current: number;
  remaining: number;
  progressPct: number;
}

export interface AchievementDefinitionsResponse {
  definitions: Array<{
    achievementId: string;
    name: string;
    category: AchievementCategory;
    metric: AchievementMetric;
    description: string;
    threshold: number;
    icon: AchievementIcon;
    color: AchievementColor;
  }>;
}

export interface UserBadgesResponse {
  badges: BadgeState[];
}

export interface MyProgressResponse {
  progress: BadgeProgress[];
}

export interface ReevaluateResponse {
  newlyAwarded: Array<{
    achievementId: string;
    name: string;
    category: AchievementCategory;
    color: AchievementColor;
    icon: AchievementIcon;
    threshold: number;
  }>;
  revoked: string[];
}
