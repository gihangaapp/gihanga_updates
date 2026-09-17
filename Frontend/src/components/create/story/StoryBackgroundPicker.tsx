import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryBackgroundPickerProps {
  selectedBg: string;
  onSelectBg: (bg: string) => void;
}

export const STORY_BACKGROUND_PRESETS = [
  "linear-gradient(135deg, #FF512F, #DD2476)",
  "linear-gradient(135deg, #8A2387, #E94057, #F27121)",
  "linear-gradient(135deg, #00B4DB, #0083B0)",
  "linear-gradient(135deg, #11998e, #38ef7d)",
  "linear-gradient(135deg, #FC466B, #3F5EFB)",
  "linear-gradient(135deg, #0F2027, #203A43, #2C5364)",
  "linear-gradient(135deg, #FFE000, #799F0C)",
  "#000000",
  "#1E293B",
  "#475569",
  "#0F172A",
];

export function StoryBackgroundPicker({
  selectedBg,
  onSelectBg,
}: StoryBackgroundPickerProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-black/60 p-3 backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
        <Palette className="size-3.5" /> Background Presets
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STORY_BACKGROUND_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectBg(preset)}
            className={cn(
              "press size-8 shrink-0 rounded-full border-2 transition-transform",
              selectedBg === preset ? "border-white scale-110" : "border-transparent"
            )}
            style={{ background: preset }}
          />
        ))}
      </div>
    </div>
  );
}
