/**
 * Mixed broadcast for the browser-native (mesh) live transport.
 *
 * On the mesh there is no media server to fan every streamer out to plain
 * viewers, so viewers only ever received the host's own camera — they could
 * neither see nor hear a joined co-host. While at least one co-host is live,
 * the HOST composes everyone into ONE outgoing stream:
 *   • video: a canvas laid out exactly like the on-screen split grid
 *     (2 → even split, 3 → one wide tile + two, 4+ → 2-column grid);
 *   • audio: a Web-Audio mix of the host's mic and every co-host's voice.
 * The mixed stream is swapped onto the existing viewer connections with
 * RTCRtpSender.replaceTrack (no renegotiation, no reconnect), and swapped
 * back to the plain camera as soon as the last co-host leaves.
 */
import { useEffect, useState } from "react";
import type { CoHostRemoteStream } from "./browser-live";

const GAP = 6;
const RADIUS = 22;
const FPS = 30;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Same shapes as the CSS grid in the live page. */
function layoutRects(n: number, W: number, H: number, portrait: boolean): Rect[] {
  const rects: Rect[] = [];
  const inner = { x: GAP, y: GAP, w: W - GAP * 2, h: H - GAP * 2 };
  if (n <= 1) return [inner];
  if (n === 2) {
    if (portrait) {
      const h = (inner.h - GAP) / 2;
      return [
        { ...inner, h },
        { x: inner.x, y: inner.y + h + GAP, w: inner.w, h },
      ];
    }
    const w = (inner.w - GAP) / 2;
    return [
      { ...inner, w },
      { x: inner.x + w + GAP, y: inner.y, w, h: inner.h },
    ];
  }
  const cols = 2;
  const rows = Math.ceil(n / cols);
  const cw = (inner.w - GAP * (cols - 1)) / cols;
  const ch = (inner.h - GAP * (rows - 1)) / rows;
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    // 3 participants: the first tile spans the whole top row.
    if (n === 3 && i === 0) {
      rects.push({ x: inner.x, y: inner.y, w: inner.w, h: ch });
      continue;
    }
    const idx = n === 3 ? i + 1 : i; // shift the two lower tiles into row 2
    const rr = n === 3 ? Math.floor(idx / cols) : r;
    const cc = n === 3 ? idx % cols : c;
    rects.push({
      x: inner.x + cc * (cw + GAP),
      y: inner.y + rr * (ch + GAP),
      w: cw,
      h: ch,
    });
  }
  return rects;
}

function drawCover(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, r: Rect) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return;
  const scale = Math.max(r.w / vw, r.h / vh);
  const sw = r.w / scale;
  const sh = r.h / scale;
  ctx.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, r.x, r.y, r.w, r.h);
}

function clipRounded(ctx: CanvasRenderingContext2D, r: Rect) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(r.x, r.y, r.w, r.h, RADIUS);
  else ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
}

export function useCompositeBroadcast({
  localStream,
  tiles,
  enabled,
}: {
  localStream: MediaStream | null;
  tiles: CoHostRemoteStream[];
  enabled: boolean;
}): MediaStream | null {
  const [composite, setComposite] = useState<MediaStream | null>(null);
  const signature =
    enabled && localStream && tiles.length > 0
      ? [localStream.id, ...tiles.map((t) => `${t.participantId}:${t.stream.id}`)].join("|")
      : "";

  useEffect(() => {
    if (!signature || !localStream) {
      setComposite(null);
      return;
    }
    const streams = [localStream, ...tiles.map((t) => t.stream)];

    const settings = localStream.getVideoTracks()[0]?.getSettings();
    const portrait = !(settings?.width && settings?.height && settings.width > settings.height);
    const W = portrait ? 720 : 1280;
    const H = portrait ? 1280 : 720;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setComposite(null);
      return;
    }

    // Hidden, muted players keep every incoming stream decoding (and make
    // Chrome deliver remote audio to the Web-Audio graph below).
    const videos = streams.map((s) => {
      const v = document.createElement("video");
      v.muted = true;
      v.playsInline = true;
      v.srcObject = s;
      void v.play().catch(() => {});
      return v;
    });

    const draw = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      const rects = layoutRects(videos.length, W, H, portrait);
      videos.forEach((v, i) => {
        const r = rects[i];
        if (!r) return;
        ctx.save();
        clipRounded(ctx, r);
        ctx.fillStyle = "#0b0b0f";
        ctx.fillRect(r.x, r.y, r.w, r.h);
        if (v.readyState >= 2) drawCover(ctx, v, r);
        ctx.restore();
      });
    };
    draw();
    const timer = window.setInterval(draw, 1000 / FPS);

    // Audio: mix every participant's voice (host mic included).
    const AC: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    let audioCtx: AudioContext | null = null;
    let destTrack: MediaStreamTrack | undefined;
    const cleanups: Array<() => void> = [];
    if (AC) {
      audioCtx = new AC();
      const dest = audioCtx.createMediaStreamDestination();
      destTrack = dest.stream.getAudioTracks()[0];
      const connected = new Set<string>();
      const connectTracks = (s: MediaStream) => {
        for (const track of s.getAudioTracks()) {
          if (connected.has(track.id) || !audioCtx) continue;
          connected.add(track.id);
          audioCtx.createMediaStreamSource(new MediaStream([track])).connect(dest);
        }
      };
      streams.forEach((s) => {
        connectTracks(s);
        // Remote audio can arrive after the stream object does.
        const onAdd = () => connectTracks(s);
        s.addEventListener("addtrack", onAdd);
        cleanups.push(() => s.removeEventListener("addtrack", onAdd));
      });
      const resume = () => void audioCtx?.resume().catch(() => {});
      resume();
      window.addEventListener("pointerdown", resume);
      window.addEventListener("keydown", resume);
      cleanups.push(() => {
        window.removeEventListener("pointerdown", resume);
        window.removeEventListener("keydown", resume);
      });
    }

    const videoTrack = canvas.captureStream(FPS).getVideoTracks()[0];
    const out = new MediaStream();
    if (videoTrack) out.addTrack(videoTrack);
    if (destTrack) out.addTrack(destTrack);
    setComposite(out);

    return () => {
      window.clearInterval(timer);
      cleanups.forEach((fn) => fn());
      videos.forEach((v) => {
        v.srcObject = null;
      });
      videoTrack?.stop();
      destTrack?.stop();
      void audioCtx?.close().catch(() => {});
      setComposite(null);
    };
    // The signature captures every input that matters (stream identities).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return composite;
}
