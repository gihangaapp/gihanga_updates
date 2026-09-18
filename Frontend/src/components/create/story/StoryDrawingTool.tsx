import { useState, useRef, useEffect } from "react";
import {
  PenTool,
  Eraser,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Heart,
  Star,
  Undo2,
  Check,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { StorySlideData } from "../DraftManager";
import { STORY_FILTERS } from "./StoryEffects";

interface StoryDrawingToolProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  existingDrawing?: string | undefined;
  slide?: StorySlideData;
}

type DrawToolMode = "pen" | "eraser" | "rectangle" | "circle" | "arrow" | "line" | "heart" | "star";

const DRAW_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#007AFF",
  "#AF52DE",
  "#FF2D55",
  "#00F5D4",
  "#FEE440",
];

export function StoryDrawingTool({
  onSave,
  onCancel,
  existingDrawing,
  slide,
}: StoryDrawingToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<DrawToolMode>("pen");
  const [color, setColor] = useState("#FFFFFF");
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [isFilled, setIsFilled] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  // History stack for Undo
  const historyRef = useRef<ImageData[]>([]);
  const snapshotRef = useRef<ImageData | null>(null);

  const activeFilter = slide?.filter
    ? STORY_FILTERS.find((f) => f.id === slide.filter)?.cssFilter || "none"
    : "none";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Standard story 9:16 high-definition canvas resolution
    canvas.width = 720;
    canvas.height = 1280;

    if (existingDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveHistoryState();
      };
      img.src = existingDrawing;
    } else {
      saveHistoryState();
    }
  }, []);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current.push(data);
    } catch {
      /* best-effort — ignore */
    }
  };

  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;
    historyRef.current.pop(); // Remove current state
    const previous = historyRef.current[historyRef.current.length - 1];
    const canvas = canvasRef.current;
    if (!canvas || !previous) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.putImageData(previous, 0, 0);
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = "touches" in e ? e.touches[0] : undefined;
    const mouse = "clientX" in e ? e : undefined;
    const clientX = touch ? touch.clientX : mouse ? mouse.clientX : 0;
    const clientY = touch ? touch.clientY : mouse ? mouse.clientY : 0;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    setIsDrawing(true);
    setStartPos({ x, y });

    // Save current canvas snapshot for live shape dragging preview
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStartPos(null);
    snapshotRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.beginPath();
    }
    saveHistoryState();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    // Scale stroke width to 720x1280 resolution
    ctx.lineWidth = strokeWidth * 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      // Shape Tool: Restore snapshot so dragging previews smooth shape resizing
      if (snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      const width = x - startPos.x;
      const height = y - startPos.y;

      if (tool === "rectangle") {
        if (isFilled) ctx.fillRect(startPos.x, startPos.y, width, height);
        else ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (tool === "circle") {
        const rx = Math.abs(width) / 2;
        const ry = Math.abs(height) / 2;
        const cx = startPos.x + width / 2;
        const cy = startPos.y + height / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        if (isFilled) ctx.fill();
        else ctx.stroke();
      } else if (tool === "line") {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === "arrow") {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        // Arrow head
        const angle = Math.atan2(y - startPos.y, x - startPos.x);
        const headLen = ctx.lineWidth * 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
          x - headLen * Math.cos(angle - Math.PI / 6),
          y - headLen * Math.sin(angle - Math.PI / 6),
        );
        ctx.lineTo(
          x - headLen * Math.cos(angle + Math.PI / 6),
          y - headLen * Math.sin(angle + Math.PI / 6),
        );
        ctx.lineTo(x, y);
        ctx.fill();
      } else if (tool === "heart") {
        drawHeart(ctx, startPos.x + width / 2, startPos.y + height / 2, Math.abs(width), isFilled);
      } else if (tool === "star") {
        drawStar(
          ctx,
          startPos.x + width / 2,
          startPos.y + height / 2,
          5,
          Math.abs(width) / 2,
          Math.abs(width) / 4,
          isFilled,
        );
      }
    }
  };

  const drawHeart = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    fill: boolean,
  ) => {
    ctx.save();
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(cx, cy + size / 4);
    ctx.bezierCurveTo(cx, cy, cx - size / 2, cy, cx - size / 2, cy + topCurveHeight);
    ctx.bezierCurveTo(
      cx - size / 2,
      cy + (size + topCurveHeight) / 2,
      cx,
      cy + size / 2 + topCurveHeight,
      cx,
      cy + size / 2,
    );
    ctx.bezierCurveTo(
      cx,
      cy + size / 2 + topCurveHeight,
      cx + size / 2,
      cy + (size + topCurveHeight) / 2,
      cx + size / 2,
      cy + topCurveHeight,
    );
    ctx.bezierCurveTo(cx + size / 2, cy, cx, cy, cx, cy + size / 4);
    ctx.closePath();
    if (fill) ctx.fill();
    else ctx.stroke();
    ctx.restore();
  };

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    fill: boolean,
  ) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    if (fill) ctx.fill();
    else ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveHistoryState();
    }
  };

  const handleDone = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  const shapeTools: { id: DrawToolMode; label: string; icon: typeof Square }[] = [
    { id: "pen", label: "Pen", icon: PenTool },
    { id: "eraser", label: "Eraser", icon: Eraser },
    { id: "rectangle", label: "Square", icon: Square },
    { id: "circle", label: "Circle", icon: Circle },
    { id: "arrow", label: "Arrow", icon: ArrowUpRight },
    { id: "line", label: "Line", icon: Minus },
    { id: "heart", label: "Heart", icon: Heart },
    { id: "star", label: "Star", icon: Star },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 p-3 sm:p-4 backdrop-blur-2xl select-none text-white">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between z-10 gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="press grid size-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
          title="Cancel"
        >
          <X className="size-5" />
        </button>

        {/* Tool Mode Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-[280px]">
          {shapeTools.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTool(t.id)}
                className={cn(
                  "press grid size-9 shrink-0 place-items-center rounded-xl transition-all",
                  tool === t.id
                    ? "bg-white text-slate-950 shadow-lg font-bold"
                    : "bg-white/15 text-white hover:bg-white/25",
                )}
                title={t.label}
              >
                <Icon className="size-4.5" />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fill Toggle for Shapes */}
          {tool !== "pen" && tool !== "eraser" && (
            <button
              type="button"
              onClick={() => setIsFilled(!isFilled)}
              className={cn(
                "press rounded-full border border-white/30 px-3 py-1.5 text-xs font-extrabold transition-all",
                isFilled ? "bg-white text-slate-950" : "bg-white/15 text-white",
              )}
            >
              {isFilled ? "Fill" : "Outline"}
            </button>
          )}

          {/* Undo */}
          <button
            type="button"
            onClick={handleUndo}
            className="press grid size-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
            title="Undo"
          >
            <Undo2 className="size-4" />
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={clearCanvas}
            className="press grid size-9 place-items-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
            title="Clear all"
          >
            <Trash2 className="size-4" />
          </button>

          {/* Done / Save */}
          <Button
            variant="brand"
            size="sm"
            onClick={handleDone}
            className="rounded-full font-bold px-4"
          >
            <Check className="size-4 mr-1" /> Done
          </Button>
        </div>
      </div>

      {/* Canvas Area with Underlying Story Preview */}
      <div className="relative flex-1 flex items-center justify-center p-2 overflow-hidden">
        <div
          className="relative aspect-[9/16] h-full max-h-[680px] w-full overflow-hidden rounded-3xl shadow-2xl bg-black border border-white/20"
          style={{
            background: slide?.mediaThumbnail ? "black" : slide?.background || "#0c0c0e",
            filter: activeFilter,
          }}
        >
          {/* Background Media Preview */}
          {slide?.mediaThumbnail && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
                <img src={slide.mediaThumbnail} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          )}

          {/* Live High-Precision Drawing Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="absolute inset-0 h-full w-full cursor-crosshair touch-none z-10"
          />
        </div>
      </div>

      {/* Bottom Color Palette & Stroke Size */}
      <div className="flex flex-col gap-2.5 max-w-sm mx-auto w-full z-10 pb-1">
        {tool !== "eraser" && (
          <div className="flex gap-2 justify-center overflow-x-auto no-scrollbar py-1">
            {DRAW_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "press size-7 shrink-0 rounded-full border-2 transition-transform",
                  color === c
                    ? "border-white scale-125 shadow-lg ring-2 ring-white/50"
                    : "border-transparent",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 px-2">
          <span className="text-xs font-extrabold text-white shrink-0">Thickness</span>
          <Slider
            value={[strokeWidth]}
            min={2}
            max={36}
            step={1}
            onValueChange={(vals) => {
              const val = vals[0];
              if (val !== undefined) setStrokeWidth(val);
            }}
          />
        </div>
      </div>
    </div>
  );
}
