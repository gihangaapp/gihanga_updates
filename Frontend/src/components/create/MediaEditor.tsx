import { useState, useRef, useEffect } from "react";
import { Crop, RotateCw, ZoomIn, ZoomOut, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { MediaFile } from "./MediaPicker";

export type AspectRatio = "original" | "1:1" | "4:5" | "16:9";

interface MediaEditorProps {
  file: MediaFile;
  onSave: (editedFile: MediaFile) => void;
  onCancel: () => void;
}

export function MediaEditor({ file, onSave, onCancel }: MediaEditorProps) {
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("original");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Skip editing if video
  if (file.isVideo) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">Video editing (crop/rotate) is only supported for photos.</p>
        <Button variant="outline" className="mt-4" onClick={onCancel}>
          Back
        </Button>
      </div>
    );
  }

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      const editedBlob = await renderEditedImage(file.previewUrl, rotation, zoom, aspectRatio);
      const newFile = new File([editedBlob], file.file.name, { type: "image/jpeg" });
      const newPreview = URL.createObjectURL(newFile);
      onSave({
        ...file,
        file: newFile,
        previewUrl: newPreview,
      });
    } catch (err) {
      console.error("Failed to process edited image", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Editor Canvas Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black/90 flex items-center justify-center">
        <div
          className="relative transition-transform duration-200 ease-out flex items-center justify-center"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
          }}
        >
          <img
            src={file.previewUrl}
            alt="Editing target"
            className="max-h-[320px] max-w-full object-contain"
          />
        </div>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="flex items-center justify-center gap-2">
        {(["original", "1:1", "4:5", "16:9"] as const).map((ratio) => (
          <button
            key={ratio}
            type="button"
            onClick={() => setAspectRatio(ratio)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold press",
              aspectRatio === ratio
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {ratio.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Rotation & Zoom Controls */}
      <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4 border border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <ZoomIn className="size-4" /> Zoom
          </span>
          <span className="text-xs font-medium text-muted-foreground">{Math.round(zoom * 100)}%</span>
        </div>
        <Slider
          value={[zoom]}
          min={1}
          max={3}
          step={0.05}
          onValueChange={([val]) => setZoom(val)}
        />

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={rotate}
            className="gap-2"
          >
            <RotateCw className="size-4" />
            Rotate 90°
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setRotation(0);
              setZoom(1);
              setAspectRatio("original");
            }}
            className="text-xs text-muted-foreground"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button variant="brand" onClick={handleApply} disabled={isProcessing}>
          {isProcessing ? <RefreshCw className="size-4 animate-spin" /> : <Check className="size-4" />}
          Apply Changes
        </Button>
      </div>
    </div>
  );
}

function renderEditedImage(
  imageSrc: string,
  rotation: number,
  zoom: number,
  aspectRatio: AspectRatio
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No 2d context");

      let width = img.width;
      let height = img.height;

      // Adjust dimensions based on aspect ratio
      if (aspectRatio === "1:1") {
        const side = Math.min(width, height);
        width = side;
        height = side;
      } else if (aspectRatio === "4:5") {
        if (width / height > 4 / 5) {
          width = height * (4 / 5);
        } else {
          height = width * (5 / 4);
        }
      } else if (aspectRatio === "16:9") {
        if (width / height > 16 / 9) {
          width = height * (16 / 9);
        } else {
          height = width * (9 / 16);
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject("Blob generation failed");
      }, "image/jpeg", 0.92);
    };
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
}
