import { useState } from "react";
import { ChevronLeft, ChevronRight, Globe2, Heart, Lock, MapPin, MessageCircle, Share2, Users } from "lucide-react";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import type { MediaFile } from "../MediaPicker";
import type { UserProfile } from "@/lib/api-client";

interface PostPreviewProps {
  user: UserProfile;
  caption: string;
  files: MediaFile[];
  location?: string;
  audience: "public" | "followers" | "private";
  onEdit: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
}

export function PostPreview({
  user,
  caption,
  files,
  location,
  audience,
  onEdit,
  onPublish,
  isPublishing,
}: PostPreviewProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const AudienceIcon =
    audience === "public" ? Globe2 : audience === "followers" ? Users : Lock;

  const currentMedia = files[activeMediaIndex];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Feed Preview</h3>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          Preview Mode
        </span>
      </div>

      {/* Simulated Post Card */}
      <div className="surface-card overflow-hidden border border-border bg-card">
        {/* Author Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <GAvatar user={user} size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground">@{user.username}</span>
              </div>
              {location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3 text-success" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
            <AudienceIcon className="size-3" />
            <span className="capitalize">{audience}</span>
          </div>
        </div>

        {/* Media Preview Stage */}
        {files.length > 0 && currentMedia && (
          <div className="relative aspect-square w-full bg-black flex items-center justify-center">
            {currentMedia.isVideo ? (
              <video
                src={currentMedia.previewUrl}
                controls
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                src={currentMedia.previewUrl}
                alt="Post preview media"
                className="max-h-full max-w-full object-contain"
              />
            )}

            {/* Carousel navigation arrows */}
            {files.length > 1 && (
              <>
                {activeMediaIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaIndex((prev) => prev - 1)}
                    className="press absolute left-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                )}
                {activeMediaIndex < files.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaIndex((prev) => prev + 1)}
                    className="press absolute right-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 rounded-full bg-black/50 px-2 py-1">
                  {files.map((_, i) => (
                    <div
                      key={i}
                      className={`size-1.5 rounded-full transition-all ${
                        i === activeMediaIndex ? "bg-white w-3" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Caption Body */}
        {caption.trim() && (
          <div className="p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            <span className="font-bold mr-1.5">{user.username}</span>
            {caption}
          </div>
        )}

        {/* Mock Action Bar */}
        <div className="flex items-center gap-4 px-4 py-3 border-t border-border/40 text-muted-foreground">
          <Heart className="size-5" />
          <MessageCircle className="size-5" />
          <Share2 className="size-5" />
          <span className="ml-auto text-xs font-semibold">Just now</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onEdit} disabled={isPublishing}>
          Back to Edit
        </Button>
        <Button variant="brand" onClick={onPublish} disabled={isPublishing}>
          Publish Post
        </Button>
      </div>
    </div>
  );
}
