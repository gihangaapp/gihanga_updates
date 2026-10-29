import type { FeedPost } from "@/lib/api-client";

const STORAGE_PREFIX = "gihanga:recent-published-post:v1:";
const HOME_VISITS_TO_PIN = 4;
const MAX_PIN_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const RECENT_POST_PIN_EVENT = "gihanga:recent-post-pin-updated";

export interface RecentPostPin {
  postId: string;
  post: FeedPost;
  visitsRemaining: number;
  savedAt: number;
}

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

function browserStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** A processing/review post must never be injected into a public feed. */
export function isRecentPostReady(post: FeedPost | undefined | null): post is FeedPost {
  if (!post) return false;
  if (post.status && post.status !== "published") return false;
  if (post.moderation && post.moderation.status !== "approved") return false;
  return true;
}

export function readRecentPublishedPost(userId: string): RecentPostPin | null {
  if (!userId) return null;
  const storage = browserStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(storageKey(userId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<RecentPostPin>;
    if (
      typeof value.postId !== "string" ||
      !value.post ||
      value.post._id !== value.postId ||
      typeof value.visitsRemaining !== "number" ||
      !Number.isInteger(value.visitsRemaining) ||
      value.visitsRemaining < 1 ||
      value.visitsRemaining > HOME_VISITS_TO_PIN ||
      typeof value.savedAt !== "number" ||
      Date.now() - value.savedAt > MAX_PIN_AGE_MS
    ) {
      storage.removeItem(storageKey(userId));
      return null;
    }
    return value as RecentPostPin;
  } catch {
    try { storage.removeItem(storageKey(userId)); } catch { /* Storage may be unavailable. */ }
    return null;
  }
}

/** Remember the user's latest successfully submitted post for their next four home visits. */
export function rememberRecentPublishedPost(userId: string, post: FeedPost) {
  if (!userId || !post?._id) return;
  const storage = browserStorage();
  if (!storage) return;
  const pin: RecentPostPin = {
    postId: post._id,
    post,
    visitsRemaining: HOME_VISITS_TO_PIN,
    savedAt: Date.now(),
  };
  try {
    storage.setItem(storageKey(userId), JSON.stringify(pin));
    window.dispatchEvent(new CustomEvent(RECENT_POST_PIN_EVENT, { detail: { userId } }));
  } catch {
    // Private browsing/full storage should not block post creation or feed use.
  }
}

/** Consume one visit only when the post is actually safe and ready to display. */
export function consumeRecentPostHomeVisit(
  userId: string,
  latestPost?: FeedPost,
): RecentPostPin | null {
  const current = readRecentPublishedPost(userId);
  if (!current) return null;
  const post = latestPost ?? current.post;
  if (!isRecentPostReady(post)) return current;
  const next: RecentPostPin = {
    ...current,
    post,
    visitsRemaining: Math.max(0, current.visitsRemaining - 1),
  };
  const storage = browserStorage();
  if (next.visitsRemaining === 0) {
    try { storage?.removeItem(storageKey(userId)); } catch { /* Ignore storage restrictions. */ }
  } else if (storage) {
    try { storage.setItem(storageKey(userId), JSON.stringify(next)); } catch { /* Cache is optional. */ }
  }
  // Keep the fourth-visit copy in component state; it simply isn't persisted.
  return next;
}
