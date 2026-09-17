import { useState } from "react";
import { ChevronLeft, ChevronRight, Send, X } from "lucide-react";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/api-client";
import type { StorySlideData } from "../DraftManager";
import { StoryCanvas } from "./StoryCanvas";
import type { StorySticker } from "./StoryStickerPicker";

interface StoryPreviewProps {
  user: UserProfile;
  slides: StorySlideData[];
  stickers: StorySticker[];
  drawingUrl?: string;
  onEdit: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
}

export function StoryPreview({
  user,
  slides,
  stickers,
  drawingUrl,
  onEdit,
  onPublish,
  isPublishing,
}: StoryPreviewProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const currentSlide = slides[activeSlideIndex] ?? slides[0];

  return (
    <div className="flex flex-col gap-4 max-w-[360px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Story Preview</h3>
        <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-semibold text-warning">
          24h Expiry
        </span>
      </div>

      {/* Simulated Viewer Container */}
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-black shadow-float">
        <StoryCanvas
          slide={currentSlide}
          stickers={stickers}
          drawingUrl={drawingUrl}
        />

        {/* Top Progress Bars */}
        <div className="absolute top-3 inset-x-3 z-30 flex gap-1">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className={`h-full bg-white transition-all ${
                  i <= activeSlideIndex ? "w-full" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Top User Info Overlay */}
        <div className="absolute top-6 left-3 z-30 flex items-center gap-2 text-white">
          <GAvatar user={user} size="xs" ring="story" />
          <span className="text-xs font-bold">{user.username}</span>
          <span className="text-[10px] opacity-75">Just now</span>
        </div>

        {/* Slide navigation controls */}
        {slides.length > 1 && (
          <>
            {activeSlideIndex > 0 && (
              <button
                type="button"
                onClick={() => setActiveSlideIndex((prev) => prev - 1)}
                className="press absolute left-2 top-1/2 z-30 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/40 text-white"
              >
                <ChevronLeft className="size-5" />
              </button>
            )}
            {activeSlideIndex < slides.length - 1 && (
              <button
                type="button"
                onClick={() => setActiveSlideIndex((prev) => prev + 1)}
                className="press absolute right-2 top-1/2 z-30 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/40 text-white"
              >
                <ChevronRight className="size-5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onEdit} disabled={isPublishing}>
          Back to Edit
        </Button>
        <Button variant="brand" onClick={onPublish} disabled={isPublishing}>
          <Send className="size-4" />
          Share Story
        </Button>
      </div>
    </div>
  );
}
