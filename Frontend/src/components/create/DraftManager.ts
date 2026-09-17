/**
 * DraftManager — localStorage-based draft persistence for content creation.
 *
 * Stores serialized creation state (excluding File objects, which can't be serialized).
 * Media is tracked by preview data-URLs for thumbnails but NOT the raw file — the user
 * will need to re-attach large files if they restore a draft. Captions, settings, and
 * metadata are fully persisted.
 */

export type DraftType = "post" | "reel" | "story";

export interface DraftMediaItem {
  /** A small base64 thumbnail for display in the draft list (generated at save time). */
  thumbnail?: string;
  /** Original filename for display purposes. */
  fileName: string;
  /** MIME type of the original file. */
  mimeType: string;
  /** Whether this media item is a video. */
  isVideo: boolean;
}

export interface PostDraftData {
  type: "post";
  caption: string;
  location: string;
  audience: "public" | "followers" | "private";
  commentsEnabled: boolean;
  media: DraftMediaItem[];
  tags: string[];
  taggedPeople: string[];
}

export interface ReelDraftData {
  type: "reel";
  caption: string;
  location: string;
  audience: "public" | "followers" | "private";
  commentsEnabled: boolean;
  media: DraftMediaItem[];
  trimStart?: number;
  trimEnd?: number;
  coverTimestamp?: number;
  tags: string[];
  taggedPeople: string[];
}

export interface StoryDraftData {
  type: "story";
  slides: StorySlideData[];
}

export interface StorySlideData {
  background: string;
  mediaFileName?: string;
  mediaThumbnail?: string;
  mediaIsVideo?: boolean;
  mediaFile?: File;
  textElements: StoryTextElement[];
  filter?: string;
}

export interface StoryTextElement {
  id: string;
  text: string;
  font: string;
  fontSize: number;
  color: string;
  bgColor: string;
  alignment: "left" | "center" | "right";
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export type DraftData = PostDraftData | ReelDraftData | StoryDraftData;

export interface Draft {
  id: string;
  data: DraftData;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "gihanga_drafts";

function generateId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): Draft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Draft[];
  } catch {
    return [];
  }
}

function writeAll(drafts: Draft[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function saveDraft(data: DraftData, existingId?: string): string {
  const drafts = readAll();
  const now = Date.now();

  if (existingId) {
    const idx = drafts.findIndex((d) => d.id === existingId);
    if (idx >= 0) {
      drafts[idx] = { ...drafts[idx], data, updatedAt: now };
      writeAll(drafts);
      return existingId;
    }
  }

  const id = generateId();
  drafts.unshift({ id, data, createdAt: now, updatedAt: now });

  // Keep at most 20 drafts
  if (drafts.length > 20) drafts.length = 20;

  writeAll(drafts);
  return id;
}

export function loadDrafts(type?: DraftType): Draft[] {
  const all = readAll();
  if (!type) return all;
  return all.filter((d) => d.data.type === type);
}

export function loadDraft(id: string): Draft | null {
  return readAll().find((d) => d.id === id) ?? null;
}

export function deleteDraft(id: string): void {
  writeAll(readAll().filter((d) => d.id !== id));
}

export function hasDrafts(type?: DraftType): boolean {
  return loadDrafts(type).length > 0;
}

/**
 * Creates a small thumbnail from a File for draft persistence.
 * Returns a base64 data URL or undefined if the file can't be thumbnailed.
 */
export async function createThumbnail(file: File, maxSize = 120): Promise<string | undefined> {
  if (!file.type.startsWith("image/")) {
    // For video, try to grab a frame
    if (file.type.startsWith("video/")) {
      return createVideoThumbnail(file, maxSize);
    }
    return undefined;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(undefined); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/webp", 0.6));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => { resolve(undefined); URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(file);
  });
}

function createVideoThumbnail(file: File, maxSize: number): Promise<string | undefined> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxSize / video.videoWidth, maxSize / video.videoHeight, 1);
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(undefined); URL.revokeObjectURL(url); return; }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/webp", 0.6));
      URL.revokeObjectURL(url);
    };

    video.onerror = () => { resolve(undefined); URL.revokeObjectURL(url); };
    video.src = url;
  });
}
