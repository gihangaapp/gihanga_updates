import { Type, Smile, Music, PenTool, Sparkles, Layout, Palette } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StoryToolbarProps {
  onOpenText: () => void;
  onOpenStickers: () => void;
  onOpenDraw: () => void;
  onOpenEffects: () => void;
  onOpenTemplates: () => void;
  onOpenBackground: () => void;
}

export function StoryToolbar({
  onOpenText,
  onOpenStickers,
  onOpenDraw,
  onOpenEffects,
  onOpenTemplates,
  onOpenBackground,
}: StoryToolbarProps) {
  const tools = [
    { label: "Text", icon: Type, onClick: onOpenText },
    { label: "Stickers", icon: Smile, onClick: onOpenStickers },
    { label: "Draw", icon: PenTool, onClick: onOpenDraw },
    { label: "Effects", icon: Sparkles, onClick: onOpenEffects },
    { label: "Template", icon: Layout, onClick: onOpenTemplates },
    { label: "Background", icon: Palette, onClick: onOpenBackground },
    {
      label: "Music",
      icon: Music,
      onClick: () => toast("Music library coming soon!"),
    },
  ];

  return (
    <div className="flex items-center justify-around gap-1 rounded-full bg-black/70 p-2 backdrop-blur-md text-white">
      {tools.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.label}
            type="button"
            onClick={t.onClick}
            className="press flex flex-col items-center gap-1 rounded-xl p-2 hover:bg-white/10"
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-semibold">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
