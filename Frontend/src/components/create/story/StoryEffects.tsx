import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StoryFilter {
  id: string;
  name: string;
  cssFilter: string;
}

export const STORY_FILTERS: StoryFilter[] = [
  { id: "normal", name: "Normal", cssFilter: "none" },
  { id: "warm", name: "Warm", cssFilter: "sepia(0.25) saturate(1.2) contrast(1.05)" },
  { id: "cool", name: "Cool", cssFilter: "hue-rotate(180deg) saturate(1.1)" },
  { id: "vivid", name: "Vivid", cssFilter: "saturate(1.5) contrast(1.1)" },
  { id: "bw", name: "B&W", cssFilter: "grayscale(1) contrast(1.2)" },
  { id: "vintage", name: "Vintage", cssFilter: "sepia(0.4) contrast(0.9) brightness(1.1)" },
  { id: "blur", name: "Soft Blur", cssFilter: "blur(2px)" },
];

interface StoryEffectsProps {
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
}

export function StoryEffects({ selectedFilter, onSelectFilter }: StoryEffectsProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-black/60 p-3 backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
        <Sparkles className="size-3.5 text-info" /> Filters & Effects
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STORY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFilter(f.id)}
            className={cn(
              "press rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition-all",
              selectedFilter === f.id
                ? "bg-white text-black scale-105"
                : "bg-white/20 text-white hover:bg-white/30",
            )}
          >
            {f.name}
          </button>
        ))}
      </div>
    </div>
  );
}
