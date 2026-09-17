import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UploadCloud, Eye, Radio, Sparkles, X, Type, Smile, PenTool, Palette, Send, ArrowLeft, Image as ImageIcon, Star, Video as VideoIcon } from "lucide-react";
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
import { useCreateStory } from "@/hooks/use-stories";

interface StoryCreatorProps {
  onClose: () => void;
}

type CreatorView = "camera" | "editor" | "preview";
type StoryModalView = "none" | "text" | "stickers" | "draw" | "effects" | "background" | "close_friends";

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
  const currentSlide = slides[activeSlideIndex] ?? slides[0];

  // Camera Snapshot / Recording Handler
  const handleCameraCapture = (captured: CapturedMedia) => {
    const next = [...slides];
    next[activeSlideIndex] = {
      ...next[activeSlideIndex],
      mediaFileName: captured.file.name,
      mediaThumbnail: captured.previewUrl,
      mediaIsVideo: captured.isVideo,
      mediaFile: captured.file,
    };
    setSlides(next);
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
    const next = [...slides];
    const currTexts = next[activeSlideIndex].textElements;
    const existingIdx = currTexts.findIndex((t) => t.id === element.id);

    if (existingIdx >= 0) {
      currTexts[existingIdx] = element;
    } else {
      currTexts.push(element);
    }
    setSlides(next);
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
        const uploaded = await uploadFile("stories", currentSlide.mediaFile, (pct) => setUploadProgress(pct));
        finalMediaUrl = uploaded.url;
      } else {
        // Render composite story canvas (Media + Drawings + Text + Stickers) to PNG Blob
        setUploadStage("uploading");
        const canvasBlob = await compositeStoryToBlob(currentSlide, stickers, drawingUrl);
        const storyFile = new File([canvasBlob], `story_${Date.now()}.png`, { type: "image/png" });
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
      toast.success(selectedAudience === "close_friends" ? "Shared with Close Friends!" : "Story shared with your followers!");
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
      <div className="relative flex-1 flex items-center justify-center p-2 overflow-hidden">
        <StoryCanvas
          slide={currentSlide}
          stickers={stickers}
          drawingUrl={drawingUrl}
          onUpdateTextPosition={(id, x, y) => {
            const next = [...slides];
            const txts = next[activeSlideIndex].textElements;
            const target = txts.find((t) => t.id === id);
            if (target) {
              target.x = x;
              target.y = y;
              setSlides(next);
            }
          }}
          onUpdateStickerPosition={(id, x, y) => {
            setStickers((prev) =>
              prev.map((s) => (s.id === id ? { ...s, x, y } : s))
            );
          }}
          onUpdateTextScale={(id, scale) => {
            const next = [...slides];
            const txts = next[activeSlideIndex].textElements;
            const target = txts.find((t) => t.id === id);
            if (target) {
              target.scale = scale;
              setSlides(next);
            }
          }}
          onUpdateStickerScale={(id, scale) => {
            setStickers((prev) =>
              prev.map((s) => (s.id === id ? { ...s, scale } : s))
            );
          }}
          onSelectTextElement={(el) => {
            setEditingTextElement(el);
            setActiveModal("text");
          }}
          onRemoveTextElement={(id) => {
            const next = [...slides];
            next[activeSlideIndex].textElements = next[activeSlideIndex].textElements.filter((t) => t.id !== id);
            setSlides(next);
          }}
          onRemoveSticker={(id) => setStickers(stickers.filter((s) => s.id !== id))}
        />
      </div>

      {/* Bottom Audience & Publish Bar */}
      <div className="relative z-30 flex items-center justify-between p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent gap-2">
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
              next[activeSlideIndex].background = bg;
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

// Composite Story Canvas to Blob (Bakes background media, drawings, text elements, and stickers onto PNG Blob)
function compositeStoryToBlob(
  slide: StorySlideData,
  stickers: StorySticker[],
  drawingUrl?: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject("No canvas 2d context");

    // 1. Draw Background
    const drawContent = () => {
      // 2. Draw Drawing Layer overlay (if present)
      const drawTextAndStickers = () => {
        // Draw Text Elements
        slide.textElements.forEach((el) => {
          ctx.save();
          const posX = (el.x / 100) * canvas.width;
          const posY = (el.y / 100) * canvas.height;
          const scale = el.scale || 1;
          ctx.translate(posX, posY);
          ctx.rotate(((el.rotation || 0) * Math.PI) / 180);

          if (el.bgColor && el.bgColor !== "transparent") {
            ctx.fillStyle = el.bgColor;
            ctx.font = `bold ${Math.round(el.fontSize * 2 * scale)}px sans-serif`;
            const textWidth = ctx.measureText(el.text).width;
            ctx.fillRect(-textWidth / 2 - 16, -el.fontSize * scale - 8, textWidth + 32, el.fontSize * 2.4 * scale);
          }

          ctx.fillStyle = el.color || "#FFFFFF";
          ctx.font = `bold ${Math.round(el.fontSize * 2 * scale)}px sans-serif`;
          ctx.textAlign = (el.alignment as CanvasTextAlign) || "center";
          ctx.fillText(el.text, 0, 0);
          ctx.restore();
        });

        // Draw Stickers (Emojis, Mentions, Locations, Hashtags)
        stickers.forEach((stk) => {
          ctx.save();
          const posX = ((stk.x ?? 50) / 100) * canvas.width;
          const posY = ((stk.y ?? 50) / 100) * canvas.height;
          const scale = stk.scale || 1;
          ctx.translate(posX, posY);
          ctx.rotate(((stk.rotation || 0) * Math.PI) / 180);

          if (stk.type === "emoji") {
            ctx.font = `${Math.round(80 * scale)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(stk.content, 0, 0);
          } else if (stk.type === "location") {
            ctx.font = `bold ${Math.round(28 * scale)}px sans-serif`;
            ctx.fillStyle = "#34d399";
            ctx.textAlign = "center";
            ctx.fillText(`📍 ${stk.content}`, 0, 0);
          } else if (stk.type === "mention") {
            ctx.font = `bold ${Math.round(32 * scale)}px sans-serif`;
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText(stk.content, 0, 0);
          } else if (stk.type === "hashtag") {
            ctx.font = `bold ${Math.round(30 * scale)}px sans-serif`;
            ctx.fillStyle = "#38bdf8";
            ctx.textAlign = "center";
            ctx.fillText(stk.content, 0, 0);
          } else {
            ctx.font = `bold ${Math.round(26 * scale)}px sans-serif`;
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText(stk.content, 0, 0);
          }
          ctx.restore();
        });

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Blob generation failed");
        }, "image/png");
      };

      if (drawingUrl) {
        const drawImg = new Image();
        drawImg.crossOrigin = "anonymous";
        drawImg.onload = () => {
          ctx.drawImage(drawImg, 0, 0, canvas.width, canvas.height);
          drawTextAndStickers();
        };
        drawImg.onerror = () => drawTextAndStickers();
        drawImg.src = drawingUrl;
      } else {
        drawTextAndStickers();
      }
    };

    if (slide.mediaThumbnail) {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        drawContent();
      };
      bgImg.onerror = () => {
        ctx.fillStyle = "#0c0c0e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawContent();
      };
      bgImg.src = slide.mediaThumbnail;
    } else {
      if (slide.background.startsWith("linear-gradient")) {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, "#8A2387");
        grad.addColorStop(0.5, "#E94057");
        grad.addColorStop(1, "#F27121");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = slide.background || "#0c0c0e";
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawContent();
    }
  });
}
