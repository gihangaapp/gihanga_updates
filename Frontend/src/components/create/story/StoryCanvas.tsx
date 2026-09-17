import { useState, useRef } from "react";
import { Trash2, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorySlideData, StoryTextElement } from "../DraftManager";
import type { StorySticker } from "./StoryStickerPicker";
import { STORY_FILTERS } from "./StoryEffects";
import { STORY_FONTS } from "./StoryTextEditor";

interface StoryCanvasProps {
  slide: StorySlideData;
  stickers: StorySticker[];
  drawingUrl?: string;
  onUpdateTextPosition?: (textId: string, x: number, y: number) => void;
  onUpdateStickerPosition?: (stickerId: string, x: number, y: number) => void;
  onUpdateTextScale?: (textId: string, scale: number) => void;
  onUpdateStickerScale?: (stickerId: string, scale: number) => void;
  onSelectTextElement?: (text: StoryTextElement) => void;
  onRemoveSticker?: (stickerId: string) => void;
  onRemoveTextElement?: (textId: string) => void;
}

export function StoryCanvas({
  slide,
  stickers,
  drawingUrl,
  onUpdateTextPosition,
  onUpdateStickerPosition,
  onUpdateTextScale,
  onUpdateStickerScale,
  onSelectTextElement,
  onRemoveSticker,
  onRemoveTextElement,
}: StoryCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);

  const activeFilterObj = STORY_FILTERS.find((f) => f.id === slide.filter) || STORY_FILTERS[0];

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setDraggingId(id);
    setActiveElementId(id);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMoveText = (id: string, e: React.PointerEvent) => {
    if (draggingId !== id || !containerRef.current || !onUpdateTextPosition) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    onUpdateTextPosition(id, xPct, yPct);
  };

  const handlePointerMoveSticker = (id: string, e: React.PointerEvent) => {
    if (draggingId !== id || !containerRef.current || !onUpdateStickerPosition) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    onUpdateStickerPosition(id, xPct, yPct);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      setDraggingId(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={() => setActiveElementId(null)}
      className="relative aspect-[9/16] h-full max-h-[640px] w-full overflow-hidden rounded-3xl shadow-2xl select-none bg-black"
      style={{
        background: slide.mediaThumbnail ? "black" : slide.background,
        filter: activeFilterObj.cssFilter,
      }}
    >
      {/* Background Media (Photos/Videos) */}
      {slide.mediaThumbnail && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          {slide.mediaIsVideo ? (
            <video
              src={slide.mediaThumbnail}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={slide.mediaThumbnail}
              alt="Story background"
              className="h-full w-full object-cover"
            />
          )}
        </div>
      )}

      {/* Drawing Overlay Layer */}
      {drawingUrl && (
        <img
          src={drawingUrl}
          alt="User drawing"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none z-10"
        />
      )}

      {/* Layered Text Elements (Draggable & Resizable with Handles) */}
      {slide.textElements.map((el) => {
        const fontObj = STORY_FONTS.find((f) => f.id === el.font) || STORY_FONTS[0];
        const isSelected = activeElementId === el.id;
        const currentScale = el.scale || 1;

        return (
          <div
            key={el.id}
            onPointerDown={(e) => handlePointerDown(el.id, e)}
            onPointerMove={(e) => handlePointerMoveText(el.id, e)}
            onPointerUp={handlePointerUp}
            onClick={(e) => {
              e.stopPropagation();
              setActiveElementId(el.id);
              if (onSelectTextElement) onSelectTextElement(el);
            }}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg) scale(${currentScale})`,
              color: el.bgColor === "rgba(255,255,255,0.9)" && el.color === "#FFFFFF" ? "#000000" : el.color,
              backgroundColor: el.bgColor,
              fontSize: `${el.fontSize}px`,
              textAlign: el.alignment,
            }}
            className={cn(
              "group absolute z-20 cursor-grab active:cursor-grabbing rounded-xl p-2.5 font-bold leading-snug drop-shadow-md touch-none max-w-[85%]",
              fontObj.fontClass,
              isSelected && "ring-2 ring-white/80 shadow-2xl"
            )}
          >
            {el.text}

            {/* Resize & Delete Floating Handles for Selected Text */}
            {isSelected && (
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-slate-900/90 px-2 py-1 shadow-2xl backdrop-blur-md z-30">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUpdateTextScale) onUpdateTextScale(el.id, Math.max(0.5, currentScale - 0.15));
                  }}
                  className="grid size-6 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  title="Make Smaller"
                >
                  <ZoomOut className="size-3" />
                </button>
                <span className="text-[10px] font-bold text-white/70 px-1">{Math.round(currentScale * 100)}%</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUpdateTextScale) onUpdateTextScale(el.id, Math.min(2.5, currentScale + 0.15));
                  }}
                  className="grid size-6 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  title="Make Larger"
                >
                  <ZoomIn className="size-3" />
                </button>
                {onRemoveTextElement && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTextElement(el.id);
                    }}
                    className="grid size-6 place-items-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    title="Delete"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Layered Stickers (Draggable & Resizable with Handles) */}
      {stickers.map((stk) => {
        const xPos = stk.x ?? 50;
        const yPos = stk.y ?? 50;
        const isSelected = activeElementId === stk.id;
        const currentScale = stk.scale || 1;

        return (
          <div
            key={stk.id}
            onPointerDown={(e) => handlePointerDown(stk.id, e)}
            onPointerMove={(e) => handlePointerMoveSticker(stk.id, e)}
            onPointerUp={handlePointerUp}
            onClick={(e) => {
              e.stopPropagation();
              setActiveElementId(stk.id);
            }}
            style={{
              left: `${xPos}%`,
              top: `${yPos}%`,
              transform: `translate(-50%, -50%) rotate(${stk.rotation || 0}deg) scale(${currentScale})`,
            }}
            className={cn(
              "group absolute z-20 cursor-grab active:cursor-grabbing touch-none select-none p-1 rounded-2xl",
              isSelected && "ring-2 ring-white/80"
            )}
          >
            {stk.type === "emoji" ? (
              <span className="text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">{stk.content}</span>
            ) : stk.type === "location" ? (
              <span className="font-extrabold text-emerald-400 text-lg tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                📍 {stk.content}
              </span>
            ) : stk.type === "mention" ? (
              <span className="font-extrabold text-white text-xl tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                {stk.content}
              </span>
            ) : stk.type === "hashtag" ? (
              <span className="font-extrabold text-sky-400 text-lg tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                {stk.content}
              </span>
            ) : (
              <span className="font-extrabold text-white text-base tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                {stk.content}
              </span>
            )}

            {/* Resize & Delete Floating Handles for Selected Sticker */}
            {isSelected && (
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-slate-900/90 px-2 py-1 shadow-2xl backdrop-blur-md z-30">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUpdateStickerScale) onUpdateStickerScale(stk.id, Math.max(0.4, currentScale - 0.15));
                  }}
                  className="grid size-6 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  title="Make Smaller"
                >
                  <ZoomOut className="size-3" />
                </button>
                <span className="text-[10px] font-bold text-white/70 px-1">{Math.round(currentScale * 100)}%</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUpdateStickerScale) onUpdateStickerScale(stk.id, Math.min(2.5, currentScale + 0.15));
                  }}
                  className="grid size-6 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  title="Make Larger"
                >
                  <ZoomIn className="size-3" />
                </button>
                {onRemoveSticker && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSticker(stk.id);
                    }}
                    className="grid size-6 place-items-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    title="Delete"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
