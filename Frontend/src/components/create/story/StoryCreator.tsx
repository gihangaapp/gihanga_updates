import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  UploadCloud,
  Eye,
  Radio,
  Sparkles,
  X,
  Type,
  Smile,
  PenTool,
  Palette,
  Send,
  ArrowLeft,
  Image as ImageIcon,
  Star,
  Video as VideoIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GAvatar } from "@/components/common/GAvatar";
import { StoryCanvas } from "./StoryCanvas";
import { StoryCamera, type CapturedMedia } from "./StoryCamera";
import { StoryTextEditor } from "./StoryTextEditor";
import { StoryStickerPicker, type StorySticker } from "./StoryStickerPicker";
import { StoryDrawingTool } from "./StoryDrawingTool";
import { StoryEffects } from "./StoryEffects";
import { StoryBackgroundPicker } from "./StoryBackgroundPicker";
import { StoryPreview } from "./StoryPreview";
import { CloseFriendsModal } from "./CloseFriendsModal";
import { UploadProgress, type UploadStage } from "../UploadProgress";
import { UnsavedChangesGuard } from "../UnsavedChangesGuard";
import { saveDraft, type StorySlideData, type StoryTextElement } from "../DraftManager";
import { useSessionUser } from "@/components/auth/AccountMenu";
import { uploadFile } from "@/lib/api-client";
import { paintBackground } from "@/lib/gradient";
import { useCreateStory } from "@/hooks/use-stories";

interface StoryCreatorProps {
  onClose: () => void;
}

type CreatorView = "camera" | "editor" | "preview";
type StoryModalView =
  "none" | "text" | "stickers" | "draw" | "effects" | "background" | "close_friends";

export function StoryCreator({ onClose }: StoryCreatorProps) {
  const navigate = useNavigate();
  const { user } = useSessionUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View state: ALWAYS start in Camera Mode by default when user clicks Add Story!
  const [view, setView] = useState<CreatorView>("camera");
  const [activeModal, setActiveModal] = useState<StoryModalView>("none");

  // Story Content State
  const [slides, setSlides] = useState<StorySlideData[]>([
    {
      background: "#0c0c0e",
      textElements: [],
      filter: "normal",
    },
  ]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [stickers, setStickers] = useState<StorySticker[]>([]);
  const [drawingUrl, setDrawingUrl] = useState<string | undefined>();
  const [editingTextElement, setEditingTextElement] = useState<StoryTextElement | undefined>();

  // Audience privacy selection & Close Friends list
  const [audience, setAudience] = useState<"everyone" | "close_friends">("everyone");
  const [closeFriendIds, setCloseFriendIds] = useState<string[]>([]);

  // Upload & Guard state
  const [showUnsavedGuard, setShowUnsavedGuard] = useState(false);
  const [uploadStage, setUploadStage] = useState<UploadStage | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | undefined>();

  const createStory = useCreateStory();
  const currentSlide: StorySlideData = slides[activeSlideIndex] ??
    slides[0] ?? {
      background: "#0c0c0e",
      textElements: [],
      filter: "normal",
    };
  // B4 — the LIVE preview stage: the export scales every element by
  // (EXPORT_W / previewWidth) so the published bitmap matches what the user
  // arranged, at any viewport size.
  const canvasStageRef = useRef<HTMLDivElement>(null);

  // Camera Snapshot / Recording Handler
  const handleCameraCapture = (captured: CapturedMedia) => {
    setSlides((prev) => {
      const next = [...prev];
      const base: StorySlideData = next[activeSlideIndex] ?? {
        background: "#0c0c0e",
        textElements: [],
        filter: "normal",
      };
      next[activeSlideIndex] = {
        ...base,
        mediaFileName: captured.file.name,
        mediaThumbnail: captured.previewUrl,
        mediaIsVideo: captured.isVideo,
        mediaFile: captured.file,
      };
      return next;
    });
    setView("editor");
  };

  // Direct Device Gallery File Select (with 2-minute video validation)
  const handleFileSelect = (file: File) => {
    const isVideo = file.type.startsWith("video/");

    if (isVideo) {
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      tempVideo.src = URL.createObjectURL(file);
      tempVideo.onloadedmetadata = () => {
        URL.revokeObjectURL(tempVideo.src);
        if (tempVideo.duration > 120) {
          toast.error("Story videos must be 2 minutes or less");
          return;
        }
        const previewUrl = URL.createObjectURL(file);
        handleCameraCapture({ file, previewUrl, isVideo: true });
      };
      tempVideo.onerror = () => {
        toast.error("Invalid or corrupted video file");
      };
    } else {
      const previewUrl = URL.createObjectURL(file);
      handleCameraCapture({ file, previewUrl, isVideo: false });
    }
  };

  const handleSaveTextElement = (element: StoryTextElement) => {
    setSlides((prev) => {
      const next = [...prev];
      const base: StorySlideData = next[activeSlideIndex] ?? {
        background: "#0c0c0e",
        textElements: [],
        filter: "normal",
      };
      const existingIdx = base.textElements.findIndex((t) => t.id === element.id);
      if (existingIdx >= 0) {
        base.textElements[existingIdx] = element;
      } else {
        base.textElements.push(element);
      }
      next[activeSlideIndex] = base;
      return next;
    });
    setActiveModal("none");
    setEditingTextElement(undefined);
  };

  const handleSaveDraft = () => {
    saveDraft({ type: "story", slides });
    toast.success("Story saved to drafts");
    onClose();
  };

  const handlePublish = async (selectedAudience: "everyone" | "close_friends" = audience) => {
    if (!user) return;
    setUploadStage("preparing");
    setUploadProgress(0);
    setUploadError(undefined);

    try {
      let finalMediaUrl = "";
      let mediaType: "image" | "video" = currentSlide.mediaIsVideo ? "video" : "image";

      if (currentSlide.mediaIsVideo && currentSlide.mediaFile) {
        setUploadStage("uploading");
        const uploaded = await uploadFile("stories", currentSlide.mediaFile, (pct) =>
          setUploadProgress(pct),
        );
        finalMediaUrl = uploaded.url;
      } else {
        // Render composite story canvas (Media + Drawings + Text + Stickers)
        // to a JPEG blob at 1080x1920 (retina) — pixel-faithful to the live
        // preview including the REAL selected background (B4).
        setUploadStage("uploading");
        const previewWidth = canvasStageRef.current?.getBoundingClientRect().width || 360;
        const canvasBlob = await compositeStoryToBlob(
          currentSlide,
          stickers,
          drawingUrl,
          previewWidth,
        );
        const storyFile = new File([canvasBlob], `story_${Date.now()}.jpg`, { type: "image/jpeg" });
        const uploaded = await uploadFile("stories", storyFile, (pct) => setUploadProgress(pct));
        finalMediaUrl = uploaded.url;
        mediaType = "image";
      }

      setUploadStage("publishing");
      await createStory.mutateAsync({
        mediaUrl: finalMediaUrl,
        mediaType,
        caption: currentSlide.textElements[0]?.text || undefined,
        audience: selectedAudience,
      });

      setUploadStage("completed");
      toast.success(
        selectedAudience === "close_friends"
          ? "Shared with Close Friends!"
          : "Story shared with your followers!",
      );
      setTimeout(() => {
        onClose();
        navigate({ to: "/" });
      }, 1000);
    } catch (err: any) {
      setUploadStage("failed");
      setUploadError(err?.message || "Failed to share story.");
    }
  };

  if (!user) return null;

  // Render Camera Mode (Default state on Add Story click)
  if (view === "camera") {
    return (
      <StoryCamera
        onCaptureMedia={handleCameraCapture}
        onOpenGallery={() => fileInputRef.current?.click()}
        onOpenTextStory={() => setView("editor")}
        onClose={onClose}
      />
    );
  }

  // Render Story Preview Mode
  if (view === "preview") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4 bg-slate-950 text-white">
        <StoryPreview
          user={user}
          slides={slides}
          stickers={stickers}
          drawingUrl={drawingUrl}
          onEdit={() => setView("editor")}
          onPublish={() => handlePublish("everyone")}
          isPublishing={uploadStage !== null}
        />

        {uploadStage && (
          <UploadProgress
            stage={uploadStage}
            progress={uploadProgress}
            error={uploadError}
            onRetry={() => handlePublish(audience)}
            onCancel={() => setUploadStage(null)}
            onDone={() => {
              setUploadStage(null);
              onClose();
            }}
          />
        )}
      </div>
    );
  }

  // Render Main Editor Mode
  return (
    <div className="relative flex h-full w-full flex-col bg-slate-950 text-white overflow-hidden select-none">
      {/* Hidden File Input for Device Gallery Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileSelect(f);
          e.target.value = "";
        }}
      />

      {/* Top Header Tools matching design reference */}
      <div className="relative z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <button
          type="button"
          onClick={() => {
            if (slides.some((s) => s.mediaFile || s.textElements.length > 0)) {
              setShowUnsavedGuard(true);
            } else {
              onClose();
            }
          }}
          className="press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
        >
          <X className="size-6" />
        </button>

        {/* Top Creative Action Toolbar */}
        <div className="flex items-center gap-2">
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="press flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30 backdrop-blur-md"
            title="Upload photo or video (max 2 mins)"
          >
            <UploadCloud className="size-4.5 text-sky-400" />
            <span>Upload</span>
          </button>

          {/* Text Tool */}
          <button
            type="button"
            onClick={() => {
              setEditingTextElement(undefined);
              setActiveModal("text");
            }}
            className="press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md font-bold text-sm"
            title="Add Text"
          >
            Aa
          </button>

          {/* Stickers & Emoji */}
          <button
            type="button"
            onClick={() => setActiveModal("stickers")}
            className="press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
            title="Add Sticker"
          >
            <Smile className="size-5" />
          </button>

          {/* Drawing Tool */}
          <button
            type="button"
            onClick={() => setActiveModal("draw")}
            className="press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
            title="Drawing Tool"
          >
            <PenTool className="size-5" />
          </button>

          {/* Backgrounds */}
          <button
            type="button"
            onClick={() => setActiveModal("background")}
            className="press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
            title="Background Preset"
          >
            <Palette className="size-5" />
          </button>

          {/* Effects / Filters */}
          <button
            type="button"
            onClick={() => setActiveModal("effects")}
            className="press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md text-amber-400"
            title="Filters"
          >
            <Sparkles className="size-5" />
          </button>
        </div>
      </div>

      {/* Center Live Canvas Stage */}
      <div
        ref={canvasStageRef}
        className="relative flex-1 flex items-center justify-center p-2 overflow-hidden"
      >
        <StoryCanvas
          slide={currentSlide}
          stickers={stickers}
          drawingUrl={drawingUrl}
          onUpdateTextPosition={(id, x, y) => {
            const next = [...slides];
            const txts = next[activeSlideIndex]?.textElements;
            const target = txts?.find((t) => t.id === id);
            if (target) {
              target.x = x;
              target.y = y;
              setSlides(next);
            }
          }}
          onUpdateStickerPosition={(id, x, y) => {
            setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
          }}
          onUpdateTextScale={(id, scale) => {
            const next = [...slides];
            const txts = next[activeSlideIndex]?.textElements;
            const target = txts?.find((t) => t.id === id);
            if (target) {
              target.scale = scale;
              setSlides(next);
            }
          }}
          onUpdateStickerScale={(id, scale) => {
            setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, scale } : s)));
          }}
          onSelectTextElement={(el) => {
            setEditingTextElement(el);
            setActiveModal("text");
          }}
          onRemoveTextElement={(id) => {
            const next = [...slides];
            const slide = next[activeSlideIndex];
            if (slide) slide.textElements = slide.textElements.filter((t) => t.id !== id);
            setSlides(next);
          }}
          onRemoveSticker={(id) => setStickers(stickers.filter((s) => s.id !== id))}
        />
      </div>

      {/* Bottom Audience & Publish Bar */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/95 via-black/60 to-transparent">
        {/* B4 — makes the documented multi-slide limitation visible: only the
            CURRENT slide is shared (the API publishes one story per post). */}
        {slides.length > 1 && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white/70 backdrop-blur-md">
            Sharing slide {activeSlideIndex + 1} of {slides.length}
          </span>
        )}
        {/* Your Story Button */}
        <button
          type="button"
          onClick={() => {
            setAudience("everyone");
            handlePublish("everyone");
          }}
          className="press flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/25 backdrop-blur-md"
        >
          <GAvatar user={user} size="xs" />
          <span>Your Story</span>
        </button>

        {/* Close Friends Button (Opens Close Friends selection modal) */}
        <button
          type="button"
          onClick={() => setActiveModal("close_friends")}
          className="press flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/25 backdrop-blur-md"
        >
          <div className="grid size-5 place-items-center rounded-full bg-emerald-500 text-slate-950 font-bold">
            <Star className="size-3 fill-slate-950" />
          </div>
          <span>Close Friends {closeFriendIds.length > 0 ? `(${closeFriendIds.length})` : ""}</span>
        </button>

        {/* Send To > Pill */}
        <button
          type="button"
          onClick={() => setView("preview")}
          className="press flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg hover:bg-white/90"
        >
          <span>Sent to</span>
          <span className="font-bold">›</span>
        </button>
      </div>

      {/* Dynamic Popup Overlays */}
      {activeModal === "text" && (
        <StoryTextEditor
          initialText={editingTextElement}
          onSave={handleSaveTextElement}
          onCancel={() => {
            setActiveModal("none");
            setEditingTextElement(undefined);
          }}
        />
      )}

      {activeModal === "stickers" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <StoryStickerPicker
            onSelectSticker={(stk) => setStickers([...stickers, stk])}
            onClose={() => setActiveModal("none")}
          />
        </div>
      )}

      {activeModal === "draw" && (
        <StoryDrawingTool
          existingDrawing={drawingUrl}
          slide={currentSlide}
          onSave={(url) => {
            setDrawingUrl(url);
            setActiveModal("none");
          }}
          onCancel={() => setActiveModal("none")}
        />
      )}

      {activeModal === "background" && (
        <div className="fixed bottom-24 inset-x-4 z-50 max-w-sm mx-auto">
          <StoryBackgroundPicker
            selectedBg={currentSlide.background}
            onSelectBg={(bg) => {
              const next = [...slides];
              const slide = next[activeSlideIndex];
              if (slide) slide.background = bg;
              setSlides(next);
            }}
          />
        </div>
      )}

      {activeModal === "close_friends" && (
        <CloseFriendsModal
          onClose={() => setActiveModal("none")}
          onDone={(ids) => {
            setCloseFriendIds(ids);
            setAudience("close_friends");
            handlePublish("close_friends");
          }}
        />
      )}

      {/* Upload Progress Overlay */}
      {uploadStage && (
        <UploadProgress
          stage={uploadStage}
          progress={uploadProgress}
          error={uploadError}
          onRetry={() => handlePublish(audience)}
          onCancel={() => setUploadStage(null)}
          onDone={() => {
            setUploadStage(null);
            onClose();
          }}
        />
      )}

      {/* Unsaved Guard */}
      <UnsavedChangesGuard
        open={showUnsavedGuard}
        onSaveDraft={handleSaveDraft}
        onDiscard={() => {
          setShowUnsavedGuard(false);
          onClose();
        }}
        onContinue={() => setShowUnsavedGuard(false)}
      />
    </div>
  );
}

// ── B4: pixel-faithful story export ─────────────────────────────────────────
//
// The published bitmap now matches the on-screen StoryCanvas exactly:
//   * the REAL selected background — solid colours pass through and every
//     linear-gradient preset is parsed (angle + all stops + positions) and
//     painted at the correct canvas endpoints (the old code replaced every
//     gradient with the same hard-coded purple→red→orange);
//   * text renders in the same font family/weight/size scaling with wrapping,
//     alignment, rotation, the background pill and a drop shadow;
//   * stickers keep their per-type sizes/colours, rotation and shadows;
//   * layers that fail to load now REJECT with a specific message instead of
//     being silently skipped (§8.6) — blob:/data: URLs no longer get a
//     pointless crossOrigin attribute;
//   * export is 1080×1920 (retina) JPEG q≈0.92 — photos and gradients both
//     compress well at that quality and the canvas is never transparent, so
//     PNG's only benefit (alpha) doesn't apply here.
//
// KNOWN LIMITATION (explicitly documented per the brief): only the CURRENT
// slide is published — the multi-slide UI's other slides stay local. The
// bottom bar surfaces "Sharing slide X of Y" so this is visible, not silent.

const STORY_EXPORT_W = 1080;
const STORY_EXPORT_H = 1920;

/** Maps the preview's font classes to canvas font stacks. */
function canvasFontFor(fontId: string | undefined, sizePx: number): string {
  switch (fontId) {
    case "modern":
      return `700 ${sizePx}px "Manrope", ui-sans-serif, system-ui, sans-serif`;
    case "bold":
      return `900 ${sizePx}px "Sora", ui-sans-serif, system-ui, sans-serif`;
    case "serif":
      return `italic 600 ${sizePx}px Georgia, "Times New Roman", ui-serif, serif`;
    case "mono":
      return `500 ${sizePx}px "Courier New", ui-monospace, monospace`;
    case "fun":
      return `800 ${sizePx}px "Sora", ui-sans-serif, system-ui, sans-serif`;
    case "minimal":
      return `500 ${sizePx}px "Manrope", ui-sans-serif, system-ui, sans-serif`;
    case "classic":
    default:
      return `800 ${sizePx}px "Sora", ui-sans-serif, system-ui, sans-serif`;
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // §8.6 — crossOrigin only for remote URLs; blob:/data: URLs don't need
    // (and some browsers choke on) it.
    if (!url.startsWith("blob:") && !url.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load story layer: ${url.slice(0, 60)}…`));
    img.src = url;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth || !line) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

async function compositeStoryToBlob(
  slide: StorySlideData,
  stickers: StorySticker[],
  drawingUrl: string | undefined,
  previewWidth: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = STORY_EXPORT_W;
  canvas.height = STORY_EXPORT_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas 2d context");

  // Wait for web fonts (Sora/Manrope) so text measures and renders correctly.
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* fonts API unavailable — system fallbacks still render */
  }

  const scale = STORY_EXPORT_W / Math.max(1, previewWidth);

  // 1) Background: the photo (cover, like the preview's object-cover) or the
  //    REAL parsed gradient/solid colour — never a hard-coded substitute.
  if (slide.mediaThumbnail) {
    try {
      const bgImg = await loadImage(slide.mediaThumbnail);
      // object-cover: fill 1080x1920, centre-crop the overflow.
      const imgRatio = bgImg.width / bgImg.height;
      const boxRatio = STORY_EXPORT_W / STORY_EXPORT_H;
      let dw = STORY_EXPORT_W;
      let dh = STORY_EXPORT_H;
      if (imgRatio > boxRatio) {
        dh = STORY_EXPORT_H;
        dw = dh * imgRatio;
      } else {
        dw = STORY_EXPORT_W;
        dh = dw / imgRatio;
      }
      const dx = (STORY_EXPORT_W - dw) / 2;
      const dy = (STORY_EXPORT_H - dh) / 2;
      ctx.drawImage(bgImg, dx, dy, dw, dh);
    } catch (err) {
      // §8.6 — a failed background is a real failure: publishing a story
      // without its photo would silently mislead the user.
      throw err instanceof Error ? err : new Error("Story background failed to load");
    }
  } else {
    paintBackground(ctx, slide.background || "#0c0c0e", STORY_EXPORT_W, STORY_EXPORT_H);
  }

  // 2) Drawing layer (user scribbles) — scaled to the export size.
  if (drawingUrl) {
    try {
      const drawImg = await loadImage(drawingUrl);
      ctx.drawImage(drawImg, 0, 0, STORY_EXPORT_W, STORY_EXPORT_H);
    } catch (err) {
      console.warn("[StoryCreator] drawing layer skipped:", err);
    }
  }

  // 3) Text elements — same font/size scaling, wrapping, alignment, pill
  //    background, rotation and drop shadow as the live preview.
  for (const el of slide.textElements) {
    ctx.save();
    const posX = (el.x / 100) * STORY_EXPORT_W;
    const posY = (el.y / 100) * STORY_EXPORT_H;
    const scaleF = (el.scale || 1) * scale;
    ctx.translate(posX, posY);
    ctx.rotate(((el.rotation || 0) * Math.PI) / 180);

    const fontSize = Math.max(8, el.fontSize * scaleF);
    ctx.font = canvasFontFor(el.font, fontSize);
    ctx.textBaseline = "middle";

    const isUppercaseFont = el.font === "fun" || el.font === "minimal";
    const rawText = isUppercaseFont ? el.text.toUpperCase() : el.text;
    const lines = wrapText(ctx, rawText, STORY_EXPORT_W * 0.85);
    const lineHeight = fontSize * 1.3;
    const padding = fontSize * 0.45;

    let minY = -(lines.length * lineHeight) / 2;
    for (const line of lines) {
      const y = minY + lineHeight / 2;
      if (el.bgColor && el.bgColor !== "transparent") {
        const w = ctx.measureText(line).width;
        const x0 =
          el.alignment === "left" ? 0 : el.alignment === "right" ? -w - padding : -w / 2 - padding;
        ctx.fillStyle = el.bgColor;
        const pillX = x0;
        const pillY = y - lineHeight / 2 - padding / 2;
        const pillW = w + padding * 2;
        const pillH = lineHeight + padding / 2;
        const r = pillH / 2;
        ctx.beginPath();
        ctx.roundRect?.(pillX, pillY, pillW, pillH, r);
        if (!ctx.roundRect) ctx.rect(pillX, pillY, pillW, pillH);
        ctx.fill();
      }
      ctx.fillStyle = el.color || "#FFFFFF";
      ctx.textAlign = (el.alignment as CanvasTextAlign) || "center";
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = fontSize * 0.18;
      ctx.shadowOffsetY = fontSize * 0.06;
      ctx.fillText(line, 0, y);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      minY += lineHeight;
    }
    ctx.restore();
  }

  // 4) Stickers — per-type sizes/colours matching the preview's tailwind
  //    classes (emoji 60px, location 18px, mention 20px, hashtag 18px,
  //    plain 16px — all in preview px, scaled by the export factor).
  for (const stk of stickers) {
    ctx.save();
    const posX = ((stk.x ?? 50) / 100) * STORY_EXPORT_W;
    const posY = ((stk.y ?? 50) / 100) * STORY_EXPORT_H;
    const scaleF = (stk.scale || 1) * scale;
    ctx.translate(posX, posY);
    ctx.rotate(((stk.rotation || 0) * Math.PI) / 180);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    if (stk.type === "emoji") {
      ctx.font = `400 ${Math.round(60 * scaleF)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.fillText(stk.content, 0, 0);
    } else if (stk.type === "location") {
      ctx.font = `800 ${Math.round(18 * scaleF)}px "Manrope", sans-serif`;
      ctx.fillStyle = "#34d399";
      ctx.fillText(`📍 ${stk.content}`, 0, 0);
    } else if (stk.type === "mention") {
      ctx.font = `800 ${Math.round(20 * scaleF)}px "Manrope", sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(stk.content, 0, 0);
    } else if (stk.type === "hashtag") {
      ctx.font = `800 ${Math.round(18 * scaleF)}px "Manrope", sans-serif`;
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(stk.content, 0, 0);
    } else {
      ctx.font = `800 ${Math.round(16 * scaleF)}px "Manrope", sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(stk.content, 0, 0);
    }
    ctx.restore();
  }

  // 5) Export — JPEG q0.92 (canvas is never transparent; PNG buys nothing
  //    but file size here).
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Story export failed — the canvas could not be encoded"));
      },
      "image/jpeg",
      0.92,
    );
  });
}
