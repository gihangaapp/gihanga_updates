/**
 * Video frame sampling for moderation.
 *
 * FRAME-SAMPLING LIMITS (documented honestly): sampling proves only that the
 * SAMPLED frames are safe, not that every frame is. We mitigate by covering
 * the beginning, middle and end plus evenly spaced points, and by routing
 * borderline results to human review. Higher-risk surfaces can tighten
 * CONTENT_MODERATION_VIDEO_FRAME_INTERVAL_SECONDS.
 *
 * Frame extraction strategy (first available wins):
 *  1. Cloudinary-hosted video -> frame URLs via the `so_` (start offset)
 *     transformation, delivered as JPEG. No local binary needed. The URLs are
 *     fetchable by both OpenAI (image_url) and Google Vision (imageUri).
 *  2. Local-disk video + system ffmpeg -> extract JPEG frames to temp files
 *     and read them back as buffers (Vision accepts bytes; OpenAI cannot take
 *     bytes, so URL-capable providers are skipped for local frames).
 *  3. Neither available -> NO frames can be checked. Callers treat this as an
 *     incomplete verification (fail-closed: the video stays private).
 */

import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { getModerationConfig } from "../../lib/moderation/config";

export interface FrameSamplePlan {
  /** Timestamps (seconds) to sample. */
  timestamps: number[];
  /** How the timestamps were chosen (audit/debug). */
  strategy: "interval" | "short-video" | "unknown-duration";
}

/**
 * Pure planner — given a duration and config, produce sample points that
 * always include the beginning, middle and end of the video.
 */
export function planFrameSamples(
  durationSeconds: number | undefined,
  opts: { intervalSeconds: number; maxFrames: number },
): FrameSamplePlan {
  const maxFrames = Math.max(3, Math.min(opts.maxFrames, 30));

  if (!Number.isFinite(durationSeconds as number) || (durationSeconds as number) <= 0) {
    // Unknown duration: fall back to a fixed early spread. Callers should
    // prefer to obtain the real duration; this keeps processing bounded.
    return { timestamps: [0, 2, 5, 10, 20, 30].slice(0, maxFrames), strategy: "unknown-duration" };
  }

  const duration = Math.max(0, durationSeconds as number);

  // Very short clips: sample densely at fixed points (start / quarter / middle
  // / three-quarter / end).
  if (duration <= 6) {
    const points = [0, duration * 0.25, duration * 0.5, duration * 0.75, Math.max(0, duration - 0.2)];
    return { timestamps: dedupe(points).slice(0, maxFrames), strategy: "short-video" };
  }

  const interval = Math.max(2, opts.intervalSeconds);
  // Reserve two slots for the middle and end samples so the cap can never
  // squeeze out the two most important coverage points.
  const evenBudget = Math.max(1, maxFrames - 2);
  const evenPoints: number[] = [];
  const count = Math.min(Math.floor(duration / interval) + 1, evenBudget);
  for (let i = 0; i < count; i++) {
    evenPoints.push(Math.min(duration - 0.2, i * interval));
  }

  // Always guarantee middle + end coverage within the frame budget.
  const middle = duration / 2;
  const end = Math.max(0, duration - 0.2);
  const points = dedupe([...evenPoints, middle, end]).slice(0, maxFrames);
  points.sort((a, b) => a - b);
  return { timestamps: points, strategy: "interval" };
}

function dedupe(points: number[], epsilon = 0.05): number[] {
  const sorted = [...points].sort((a, b) => a - b);
  const out: number[] = [];
  for (const p of sorted) {
    if (out.length === 0 || p - out[out.length - 1] > epsilon) out.push(Math.round(p * 100) / 100);
  }
  return out;
}

/** Builds a Cloudinary frame URL (JPEG at `seconds` offset, signed when the asset is private). */
export function cloudinaryFrameUrl(
  publicId: string,
  seconds: number,
  opts: { authenticated: boolean },
): string {
  // Imported lazily to avoid a circular import at module load.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { cloudinary } = require("../../lib/cloudinary") as typeof import("../../lib/cloudinary");
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    // Cloudinary clamps `so` beyond the video length to the last frame — safe.
    transformation: [{ so: Math.max(0, Math.round(seconds * 10) / 10), format: "jpg" }],
    ...(opts.authenticated ? { type: "authenticated", sign_url: true } : {}),
    secure: true,
  });
}

let ffmpegAvailable: boolean | null = null;

/** Detects system ffmpeg once (spawn `-version`, 3s timeout). */
export async function isFfmpegAvailable(): Promise<boolean> {
  if (ffmpegAvailable !== null) return ffmpegAvailable;
  return new Promise((resolve) => {
    try {
      const proc = spawn("ffmpeg", ["-version"], { stdio: "ignore" });
      const timer = setTimeout(() => {
        proc.kill("SIGKILL");
        resolve(false);
      }, 3000);
      proc.on("error", () => {
        clearTimeout(timer);
        ffmpegAvailable = false;
        resolve(false);
      });
      proc.on("close", (code) => {
        clearTimeout(timer);
        ffmpegAvailable = code === 0;
        resolve(ffmpegAvailable);
      });
    } catch {
      ffmpegAvailable = false;
      resolve(false);
    }
  });
}

export interface ExtractedFrame {
  seconds: number;
  buffer: Buffer;
}

/**
 * Extracts frames from a LOCAL video file using ffmpeg into a temp dir.
 * Frames are read into memory as JPEG buffers (small: ~50-150KB each) and
 * the temp dir is ALWAYS removed afterwards — the whole video is never
 * loaded into memory.
 */
export async function extractFramesLocally(
  videoPath: string,
  timestamps: number[],
  opts: { maxWidth?: number } = {},
): Promise<ExtractedFrame[]> {
  if (!(await isFfmpegAvailable())) return [];
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gihanga-moderation-"));
  try {
    const frames: ExtractedFrame[] = [];
    const scale = opts.maxWidth ? `scale=${opts.maxWidth}:-2` : "scale=640:-2";
    for (const seconds of timestamps) {
      const outPath = path.join(tempDir, `frame-${String(seconds).replace(/\./g, "_")}.jpg`);
      // -ss BEFORE -i: fast seek; -frames:v 1: single frame; mjpeg quality 4.
      const ok = await new Promise<boolean>((resolve) => {
        try {
          const proc = spawn("ffmpeg", [
            "-hide_banner", "-loglevel", "error",
            "-ss", String(Math.max(0, seconds)),
            "-i", videoPath,
            "-frames:v", "1",
            "-vf", scale,
            "-q:v", "4",
            "-y", outPath,
          ], { stdio: "ignore" });
          const timer = setTimeout(() => {
            proc.kill("SIGKILL");
            resolve(false);
          }, 15000);
          proc.on("error", () => { clearTimeout(timer); resolve(false); });
          proc.on("close", (code) => { clearTimeout(timer); resolve(code === 0); });
        } catch {
          resolve(false);
        }
      });
      if (ok && fs.existsSync(outPath)) {
        const buffer = fs.readFileSync(outPath);
        if (buffer.length > 0 && buffer.length < 5 * 1024 * 1024) {
          frames.push({ seconds, buffer });
        }
        fs.rmSync(outPath, { force: true });
      }
    }
    return frames;
  } finally {
    // Security hygiene: temp files are ALWAYS cleaned up, success or not.
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/** Best-effort duration probe of a local video via ffmpeg (seconds). */
export async function probeVideoDurationSeconds(videoPath: string): Promise<number | undefined> {
  if (!(await isFfmpegAvailable())) return undefined;
  return new Promise((resolve) => {
    try {
      // ffprobe ships with ffmpeg.
      const proc = spawn("ffprobe", [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        videoPath,
      ]);
      let out = "";
      proc.stdout.on("data", (d) => (out += String(d)));
      const timer = setTimeout(() => { proc.kill("SIGKILL"); resolve(undefined); }, 8000);
      proc.on("error", () => { clearTimeout(timer); resolve(undefined); });
      proc.on("close", () => {
        clearTimeout(timer);
        const n = Number(out.trim());
        resolve(Number.isFinite(n) && n > 0 ? n : undefined);
      });
    } catch {
      resolve(undefined);
    }
  });
}

/** Config-driven helper. */
export function planFrameSamplesFromConfig(durationSeconds: number | undefined): FrameSamplePlan {
  const config = getModerationConfig();
  return planFrameSamples(durationSeconds, {
    intervalSeconds: config.videoFrameIntervalSeconds,
    maxFrames: config.videoMaxFrames,
  });
}
