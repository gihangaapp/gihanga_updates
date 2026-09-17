import { useState } from "react";
import { Layout, Sparkles, Heart, Music, MessageSquareQuote, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StoryTemplate {
  id: string;
  name: string;
  category: "simple" | "collage" | "birthday" | "memories" | "announcement" | "quote" | "music" | "community";
  background: string;
  defaultText: string;
  font: string;
  color: string;
  bgColor: string;
}

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: "quote_1",
    name: "Minimal Quote",
    category: "quote",
    background: "linear-gradient(135deg, #0F2027, #2C5364)",
    defaultText: "“Creativity is intelligence having fun.”",
    font: "serif",
    color: "#FFFFFF",
    bgColor: "transparent",
  },
  {
    id: "bday_1",
    name: "Celebration",
    category: "birthday",
    background: "linear-gradient(135deg, #FF512F, #DD2476)",
    defaultText: "🎉 Happy Birthday! 🎂✨",
    font: "sora",
    color: "#FFFFFF",
    bgColor: "#000000",
  },
  {
    id: "music_1",
    name: "Now Playing",
    category: "music",
    background: "linear-gradient(135deg, #8A2387, #E94057, #F27121)",
    defaultText: "🎵 On Repeat This Week",
    font: "manrope",
    color: "#FFFFFF",
    bgColor: "transparent",
  },
  {
    id: "announce_1",
    name: "Big News",
    category: "announcement",
    background: "linear-gradient(135deg, #00B4DB, #0083B0)",
    defaultText: "🚀 BIG ANNOUNCEMENT!",
    font: "black",
    color: "#FFFFFF",
    bgColor: "#000000",
  },
  {
    id: "comm_1",
    name: "Gihanga Vibe",
    category: "community",
    background: "linear-gradient(135deg, #11998e, #38ef7d)",
    defaultText: "🇷🇼 Muraho Gihanga Family!",
    font: "sora",
    color: "#000000",
    bgColor: "#FFFFFF",
  },
];

interface StoryTemplatePickerProps {
  onSelectTemplate: (template: StoryTemplate) => void;
  onClose: () => void;
}

export function StoryTemplatePicker({ onSelectTemplate, onClose }: StoryTemplatePickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "quote", label: "Quotes" },
    { id: "birthday", label: "Birthday" },
    { id: "announcement", label: "Announce" },
    { id: "music", label: "Music" },
    { id: "community", label: "Community" },
  ];

  const filtered = activeCategory === "all"
    ? STORY_TEMPLATES
    : STORY_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-float max-w-sm w-full mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold flex items-center gap-1.5">
          <Layout className="size-4 text-primary" /> Story Templates
        </h3>
        <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategory(c.id)}
            className={cn(
              "press rounded-full px-3 py-1 text-xs font-semibold shrink-0",
              activeCategory === c.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1 no-scrollbar">
        {filtered.map((tmpl) => (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => {
              onSelectTemplate(tmpl);
              onClose();
            }}
            className="press group relative aspect-[9/16] overflow-hidden rounded-2xl p-3 flex flex-col justify-center text-center shadow-sm hover:ring-2 hover:ring-primary"
            style={{ background: tmpl.background }}
          >
            <p className="text-xs font-bold text-white line-clamp-3 leading-tight drop-shadow">
              {tmpl.defaultText}
            </p>
            <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white/80 uppercase">
              {tmpl.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
