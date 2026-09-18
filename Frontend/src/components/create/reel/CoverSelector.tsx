import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface CoverSelectorProps {
  videoUrl: string;
  duration: number;
  selectedTimestamp: number;
  onSelectTimestamp: (ts: number) => void;
}

export function CoverSelector({
  videoUrl,
  duration,
  selectedTimestamp,
  onSelectTimestamp,
}: CoverSelectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = selectedTimestamp;
    }
  }, [selectedTimestamp]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <ImageIcon className="size-4 text-info" /> Select Reel Cover Frame
        </span>
        <span className="text-xs font-mono font-semibold text-muted-foreground">
          {Math.floor(selectedTimestamp)}s
        </span>
      </div>

      {/* Frame Preview Stage */}
      <div className="relative aspect-[9/16] max-h-56 w-full overflow-hidden rounded-xl bg-black flex items-center justify-center mx-auto">
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>

      {/* Frame Scrubber Slider */}
      <Slider
        value={[selectedTimestamp]}
        min={0}
        max={duration || 10}
        step={0.2}
        onValueChange={(vals) => {
          const val = vals[0];
          if (val !== undefined) onSelectTimestamp(val);
        }}
      />

      <p className="text-[11px] text-center text-muted-foreground">
        Drag the slider to choose the frame that will be shown on your profile grid and reels tab.
      </p>
    </div>
  );
}
