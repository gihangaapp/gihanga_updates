import { useState } from "react";
import { MoveLeft, MoveRight, Trash2, Video, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MediaFile } from "./MediaPicker";

interface MediaPreviewProps {
  files: MediaFile[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
  onReorder?: (newFiles: MediaFile[]) => void;
  className?: string;
}

export function MediaPreview({
  files,
  selectedIndex,
  onSelect,
  onRemove,
  onReorder,
  className,
}: MediaPreviewProps) {
  if (files.length === 0) return null;

  const active: MediaFile = files[selectedIndex] ?? files[0] ?? ({} as MediaFile);

  const moveLeft = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0 || !onReorder) return;
    const next = [...files];
    const temp = next[index - 1];
    const cur = next[index];
    if (temp === undefined || cur === undefined) return;
    next[index - 1] = cur;
    next[index] = temp;
    onReorder(next);
    if (selectedIndex === index) onSelect(index - 1);
    else if (selectedIndex === index - 1) onSelect(index);
  };

  const moveRight = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === files.length - 1 || !onReorder) return;
    const next = [...files];
    const temp = next[index + 1];
    const cur = next[index];
    if (temp === undefined || cur === undefined) return;
    next[index + 1] = cur;
    next[index] = temp;
    onReorder(next);
    if (selectedIndex === index) onSelect(index + 1);
    else if (selectedIndex === index + 1) onSelect(index);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Main Preview Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black/90 shadow-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex h-full w-full items-center justify-center"
          >
            {active.isVideo ? (
              <video
                src={active.previewUrl}
                controls
                playsInline
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                src={active.previewUrl}
                alt="Media preview"
                className="max-h-full max-w-full object-contain"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Remove Button for current active item */}
        <button
          type="button"
          aria-label="Remove item"
          onClick={() => onRemove(selectedIndex)}
          className="press absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80"
        >
          <X className="size-5" />
        </button>

        {/* Multi-item indicator overlay */}
        {files.length > 1 && (
          <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            {selectedIndex + 1} / {files.length}
          </div>
        )}
      </div>

      {/* Thumbnails list when multiple files are selected */}
      {files.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {files.map((file, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={file.id}
                onClick={() => onSelect(idx)}
                className={cn(
                  "group relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                {file.isVideo ? (
                  <div className="relative h-full w-full bg-muted">
                    <video src={file.previewUrl} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 grid place-items-center bg-black/30">
                      <Video className="size-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <img src={file.previewUrl} alt="" className="h-full w-full object-cover" />
                )}

                {/* Quick reorder overlay controls */}
                {onReorder && files.length > 1 && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 p-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => moveLeft(idx, e)}
                        className="rounded p-0.5 text-white hover:bg-white/20"
                        title="Move left"
                      >
                        <MoveLeft className="size-3" />
                      </button>
                    )}
                    {idx < files.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => moveRight(idx, e)}
                        className="ml-auto rounded p-0.5 text-white hover:bg-white/20"
                        title="Move right"
                      >
                        <MoveRight className="size-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
