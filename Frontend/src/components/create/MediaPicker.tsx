import { useCallback, useRef, useState } from "react";
import { Camera, FolderOpen, Image as ImageIcon, Upload, Video, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const MAX_REEL_BYTES = 80 * 1024 * 1024;

export interface MediaFile {
  id: string;
  file: File;
  previewUrl: string;
  isVideo: boolean;
  duration?: number;
}

export type MediaAccept = "images" | "videos" | "all";

interface MediaPickerProps {
  accept?: MediaAccept;
  multiple?: boolean;
  maxFiles?: number;
  maxDurationSeconds?: number;
  files: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  className?: string;
  compact?: boolean;
}

function validateFile(file: File, accept: MediaAccept, maxDuration?: number): string | null {
  const isImage = IMAGE_TYPES.has(file.type);
  const isVideo = VIDEO_TYPES.has(file.type);

  if (!isImage && !isVideo) {
    return `"${file.name}" is not a supported format. Use JPG, PNG, WEBP, MP4, or MOV.`;
  }
  if (accept === "images" && !isImage) {
    return `"${file.name}" is not an image. Please select a photo.`;
  }
  if (accept === "videos" && !isVideo) {
    return `"${file.name}" is not a video. Please select a video file.`;
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    const maxMB = Math.round(maxBytes / 1024 / 1024);
    return `"${file.name}" is too large (max ${maxMB}MB).`;
  }

  return null;
}

function createMediaFile(file: File): MediaFile {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    isVideo: file.type.startsWith("video/"),
  };
}

export function MediaPicker({
  accept = "all",
  multiple = false,
  maxFiles = 10,
  maxDurationSeconds,
  files,
  onChange,
  className,
  compact = false,
}: MediaPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const acceptAttr =
    accept === "images"
      ? "image/jpeg,image/png,image/webp,image/gif"
      : accept === "videos"
        ? "video/mp4,video/webm,video/quicktime"
        : "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

  const processFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const newFiles: MediaFile[] = [];
      const arr = Array.from(incoming);

      for (const file of arr) {
        if (files.length + newFiles.length >= maxFiles) {
          toast.error(`You can add up to ${maxFiles} items`);
          break;
        }

        const error = validateFile(file, accept);
        if (error) {
          toast.error(error);
          continue;
        }

        const mediaFile = createMediaFile(file);

        // Check video duration if needed
        if (mediaFile.isVideo && maxDurationSeconds) {
          const duration = await getVideoDuration(file);
          if (duration > maxDurationSeconds) {
            toast.error(`"${file.name}" is ${Math.round(duration)}s — max ${maxDurationSeconds}s`);
            URL.revokeObjectURL(mediaFile.previewUrl);
            continue;
          }
          mediaFile.duration = duration;
        } else if (mediaFile.isVideo) {
          mediaFile.duration = await getVideoDuration(file);
        }

        newFiles.push(mediaFile);
      }

      if (newFiles.length > 0) {
        if (multiple) {
          onChange([...files, ...newFiles]);
        } else {
          // Revoke old previews
          files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
          onChange(newFiles.slice(0, 1));
        }
      }
    },
    [files, onChange, accept, multiple, maxFiles, maxDurationSeconds],
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    e.target.value = "";
  };

  // Compact mode: just a button
  if (compact || files.length > 0) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptAttr}
          multiple={multiple}
          className="hidden"
          onChange={handleFileInput}
        />
        <Button
          type="button"
          variant="outline"
          className={cn("justify-start gap-2", className)}
          onClick={() => fileInputRef.current?.click()}
        >
          {accept === "videos" ? (
            <Video className="size-4 text-accent" />
          ) : (
            <ImageIcon className="size-4 text-info" />
          )}
          {files.length > 0
            ? multiple
              ? "Add more media"
              : "Change media"
            : accept === "videos"
              ? "Choose a video"
              : "Choose photo or video"}
        </Button>
      </>
    );
  }

  // Full drop zone
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        multiple={multiple}
        className="hidden"
        onChange={handleFileInput}
      />
      <motion.div
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 transition-colors",
          isDragging
            ? "border-primary bg-primary-soft/50"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          className,
        )}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <div
          className={cn(
            "grid size-14 place-items-center rounded-2xl transition-colors",
            isDragging ? "bg-primary/20" : "bg-primary-soft",
          )}
        >
          <Upload
            className={cn(
              "size-7 transition-colors",
              isDragging ? "text-primary" : "text-primary/70",
            )}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">
            {isDragging ? "Drop your files here" : "Drag & drop or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {accept === "videos"
              ? "MP4, MOV • Max 200MB"
              : accept === "images"
                ? "JPG, PNG, WEBP • Max 15MB"
                : "Photos & Videos • JPG, PNG, WEBP, MP4, MOV"}
          </p>
          {multiple && (
            <p className="mt-0.5 text-xs text-muted-foreground">Up to {maxFiles} files</p>
          )}
        </div>
      </motion.div>
    </>
  );
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      resolve(0);
      URL.revokeObjectURL(url);
    };
    video.src = url;
  });
}
