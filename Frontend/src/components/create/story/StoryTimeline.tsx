import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorySlideData } from "../DraftManager";

interface StoryTimelineProps {
  slides: StorySlideData[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
}

export function StoryTimeline({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
}: StoryTimelineProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto p-2 no-scrollbar rounded-2xl bg-black/60 backdrop-blur-md">
      {slides.map((slide, idx) => {
        const isActive = idx === activeSlideIndex;
        return (
          <div
            key={idx}
            onClick={() => onSelectSlide(idx)}
            className={cn(
              "group relative aspect-[9/16] h-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all",
              isActive
                ? "border-white ring-2 ring-white/40 scale-105"
                : "border-transparent opacity-70 hover:opacity-100",
            )}
            style={{ background: slide.background }}
          >
            {slide.mediaThumbnail ? (
              <img src={slide.mediaThumbnail} alt="" className="h-full w-full object-cover" />
            ) : slide.textElements[0] ? (
              <div className="flex h-full w-full items-center justify-center p-1">
                <span className="text-[8px] font-bold text-white line-clamp-2">
                  {slide.textElements[0].text}
                </span>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/80">
                #{idx + 1}
              </div>
            )}

            {/* Delete slide button */}
            {slides.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSlide(idx);
                }}
                className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-2.5 text-danger" />
              </button>
            )}
          </div>
        );
      })}

      {/* Add Slide Button */}
      <button
        type="button"
        onClick={onAddSlide}
        className="press flex aspect-[9/16] h-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-white/40 bg-white/10 text-white hover:bg-white/20"
      >
        <Plus className="size-5" />
        <span className="text-[9px] font-bold">Add</span>
      </button>
    </div>
  );
}
