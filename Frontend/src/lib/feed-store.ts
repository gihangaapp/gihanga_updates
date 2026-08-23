/**
 * Frontend-only feed store. Holds posts created in-session (composer, story
 * creation, reel uploads) on top of the mock seed data. No backend.
 */
import { useMemo, useSyncExternalStore } from "react";
import type { Post, User } from "@/types";
import { posts as seedPosts } from "@/mock/data";

export interface DraftPost {
  body: string;
  image?: string;
  location?: string;
  tags: string[];
  kind: Post["kind"];
  scheduledFor?: string;
}

interface FeedState {
  created: Post[];
  myStory: { id: string; image?: string; at: number } | null;
  scheduled: (DraftPost & { id: string })[];
}

let state: FeedState = { created: [], myStory: null, scheduled: [] };
const listeners = new Set<() => void>();

function set(next: Partial<FeedState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => state;

export function useFeedState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useFeedPosts(): Post[] {
  const { created } = useFeedState();
  return useMemo(() => [...created, ...seedPosts], [created]);
}

let seq = 0;

export function createPost(author: User, draft: DraftPost): Post {
  seq += 1;
  const post: Post = {
    id: `new-${seq}`,
    author,
    kind: draft.kind,
    body: draft.body,
    ...(draft.image ? { image: draft.image } : {}),
    ...(draft.location ? { location: draft.location } : {}),
    time: "now",
    likes: 0,
    comments: 0,
    shares: 0,
    liked: false,
    saved: false,
    tags: draft.tags,
    topComments: [],
  };
  set({ created: [post, ...state.created] });
  return post;
}

export function schedulePost(draft: DraftPost) {
  seq += 1;
  set({ scheduled: [{ ...draft, id: `sched-${seq}` }, ...state.scheduled] });
}

export function addMyStory(image?: string) {
  seq += 1;
  set({ myStory: { id: `story-${seq}`, ...(image ? { image } : {}), at: Date.now() } });
}
