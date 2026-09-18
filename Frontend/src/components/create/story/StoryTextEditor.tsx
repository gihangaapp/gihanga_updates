import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Check, Type, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoryTextElement } from "../DraftManager";

interface StoryTextEditorProps {
  onSave: (textElement: StoryTextElement) => void;
  onCancel: () => void;
  initialText?: StoryTextElement | undefined;
}

export const STORY_FONTS = [
  { id: "classic", label: "CLASSIC", fontClass: "font-display font-extrabold" },
  { id: "modern", label: "MODERN", fontClass: "font-sans font-bold" },
  { id: "bold", label: "BOLD", fontClass: "font-display font-black tracking-tight" },
  { id: "serif", label: "ELEGANT", fontClass: "font-serif italic font-semibold" },
  { id: "mono", label: "TYPEWRITER", fontClass: "font-mono font-medium" },
  {
    id: "fun",
    label: "PLAYFUL",
    fontClass: "font-display font-extrabold tracking-wider uppercase",
  },
  {
    id: "minimal",
    label: "MINIMAL",
    fontClass: "font-sans font-medium uppercase tracking-widest text-xs",
  },
];

export const STORY_TEXT_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#00C7BE",
  "#30B0C7",
  "#32ADE6",
  "#007AFF",
  "#5856D6",
  "#AF52DE",
  "#FF2D55",
];

export function StoryTextEditor({ onSave, onCancel, initialText }: StoryTextEditorProps) {
  const [text, setText] = useState(initialText?.text || "");
  const [font, setFont] = useState(initialText?.font || "classic");
  const [fontSize, setFontSize] = useState(initialText?.fontSize || 28);
  const [color, setColor] = useState(initialText?.color || "#FFFFFF");
  const [bgColor, setBgColor] = useState(initialText?.bgColor || "transparent");
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(
    initialText?.alignment || "center",
  );

  const selectedFontObj = STORY_FONTS.find((f) => f.id === font) ?? STORY_FONTS[0];

  const handleDone = () => {
    if (!text.trim()) {
      onCancel();
      return;
    }
    onSave({
      id: initialText?.id || `txt_${Date.now()}`,
      text: text.trim(),
      font,
      fontSize,
      color,
      bgColor,
      alignment,
      x: initialText?.x || 50,
      y: initialText?.y || 50,
      rotation: initialText?.rotation || 0,
      scale: initialText?.scale || 1,
    });
  };

  const cycleAlignment = () => {
    const alignments: ("left" | "center" | "right")[] = ["left", "center", "right"];
    const nextIdx = (alignments.indexOf(alignment) + 1) % 3;
    const next = alignments[nextIdx];
    if (next) setAlignment(next);
  };

  const cycleBgColor = () => {
    setBgColor((prev) =>
      prev === "transparent"
        ? "rgba(0,0,0,0.75)"
        : prev === "rgba(0,0,0,0.75)"
          ? "rgba(255,255,255,0.9)"
          : "transparent",
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/85 p-4 backdrop-blur-xl select-none">
      {/* Top Action Bar matching frame 4 */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {/* Alignment Toggle */}
          <button
            type="button"
            onClick={cycleAlignment}
            className="press grid size-9 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            {alignment === "left" && <AlignLeft className="size-4.5" />}
            {alignment === "center" && <AlignCenter className="size-4.5" />}
            {alignment === "right" && <AlignRight className="size-4.5" />}
          </button>

          {/* Highlight Pill Style Toggle (A) */}
          <button
            type="button"
            onClick={cycleBgColor}
            className={cn(
              "press flex size-9 items-center justify-center rounded-full border border-white/30 text-xs font-black transition-colors",
              bgColor !== "transparent" ? "bg-white text-black" : "bg-white/20 text-white",
            )}
          >
            A
          </button>
        </div>

        {/* Center Font Selector Pill */}
        <div className="flex items-center rounded-full border border-white/30 bg-black/60 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg backdrop-blur-md">
          {selectedFontObj?.label ?? ""}
        </div>

        {/* Top Right Done Button */}
        <button
          type="button"
          onClick={handleDone}
          className="press rounded-full bg-white px-4 py-1.5 text-xs font-extrabold text-black shadow-lg hover:bg-white/90"
        >
          Done
        </button>
      </div>

      {/* Main Workspace (Vertical Slider + Live Canvas Input) */}
      <div className="relative flex flex-1 items-center justify-center py-6 px-8">
        {/* Left Side Vertical Font Size Slider matching screenshot Frame 4 */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-20">
          <div className="relative h-48 w-1.5 rounded-full bg-white/30">
            <input
              type="range"
              min={16}
              max={56}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
            />
            {/* Visual Dot Thumb */}
            <div
              className="absolute left-1/2 -translate-x-1/2 size-4 rounded-full bg-white shadow-md transition-all"
              style={{
                top: `${100 - ((fontSize - 16) / (56 - 16)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Live Canvas Text Area */}
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="YOUR STORY HERE"
          style={{
            color: bgColor === "rgba(255,255,255,0.9)" && color === "#FFFFFF" ? "#000000" : color,
            backgroundColor: bgColor,
            fontSize: `${fontSize}px`,
            textAlign: alignment,
          }}
          className={cn(
            "w-full max-w-md resize-none border-0 bg-transparent p-4 leading-snug shadow-none focus:outline-none focus:ring-0 rounded-2xl transition-all",
            selectedFontObj?.fontClass ?? "",
          )}
        />
      </div>

      {/* Bottom Toolbars (Font Carousel + Color Circles Palette) */}
      <div className="flex flex-col gap-3 z-10 pb-2">
        {/* Font Style Selection Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar justify-center px-4">
          {STORY_FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFont(f.id)}
              className={cn(
                "press shrink-0 rounded-full px-3.5 py-1 text-[11px] font-extrabold tracking-wider transition-all",
                font === f.id
                  ? "bg-white text-black scale-105 shadow-md"
                  : "bg-white/20 text-white hover:bg-white/30",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Color Palette Circles Row */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar justify-center items-center px-4">
          {STORY_TEXT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "press size-7 shrink-0 rounded-full border-2 transition-transform",
                color === c ? "border-white scale-125 shadow-lg" : "border-transparent",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
