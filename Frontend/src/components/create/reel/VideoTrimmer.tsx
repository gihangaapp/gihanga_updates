import { useState, useRef, useEffect } from "react";
import { Scissors, Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface VideoTrimmerProps {
  videoUrl: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
}

export function VideoTrimmer({
  videoUrl,
  duration,
  trimStart,
  trimEnd,
  onTrimChange,
}: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(trimStart);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = trimStart;
    }
  }, [trimStart]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);
    if (curr >= trimEnd) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.currentTime = trimStart;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Scissors className="size-4 text-accent" /> Video Trimmer
        </span>
        <span className="text-xs font-mono font-bold text-muted-foreground">
          {formatTime(trimStart)} - {formatTime(trimEnd)} ({Math.round(trimEnd - trimStart)}s)
        </span>
      </div>

      {/* Hidden Video element for playback sync */}
      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
      />

      {/* Trimmer Sliders */}
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span>Start Point</span>
            <span>{formatTime(trimStart)}</span>
          </div>
          <Slider
            value={[trimStart]}
            min={0}
            max={Math.max(0, trimEnd - 1)}
            step={0.5}
            onValueChange={([val]) => onTrimChange(val, trimEnd)}
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span>End Point</span>
            <span>{formatTime(trimEnd)}</span>
          </div>
          <Slider
            value={[trimEnd]}
            min={trimStart + 1}
            max={duration || 120}
            step={0.5}
            onValueChange={([val]) => onTrimChange(trimStart, val)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={togglePlay}
        className="press flex items-center justify-center gap-2 rounded-xl bg-muted py-2 text-xs font-bold hover:bg-muted/80"
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
        {isPlaying ? "Pause Trim Preview" : "Play Trimmed Selection"}
      </button>
    </div>
  );
}
