import { useState } from "react";
import { Film, Heart, MessageCircle, Music2, Share2 } from "lucide-react";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/api-client";

interface ReelPreviewProps {
  user: UserProfile;
  videoUrl: string;
  caption: string;
  onEdit: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
}

export function ReelPreview({
  user,
  videoUrl,
  caption,
  onEdit,
  onPublish,
  isPublishing,
}: ReelPreviewProps) {
  return (
    <div className="flex flex-col gap-4 max-w-[360px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Reel Preview</h3>
        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
          Vertical Mode
        </span>
      </div>

      {/* Vertical Reel Stage */}
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-black shadow-float">
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          playsInline
          className="h-full w-full object-cover"
        />

        {/* Overlay Overlay Info */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-12">
          {/* Left: Author & Caption */}
          <div className="flex flex-col gap-2 max-w-[80%] text-white">
            <div className="flex items-center gap-2">
              <GAvatar user={user} size="xs" ring="story" />
              <span className="text-xs font-bold">@{user.username}</span>
            </div>

            {caption && (
              <p className="text-xs leading-normal line-clamp-3 font-medium opacity-90">
                {caption}
              </p>
            )}

            <div className="flex items-center gap-1 text-[11px] opacity-75">
              <Music2 className="size-3 animate-spin" />
              <span>Original audio - {user.name}</span>
            </div>
          </div>

          {/* Right: Mock Action Buttons */}
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="flex flex-col items-center gap-1">
              <Heart className="size-6" />
              <span className="text-[10px] font-bold">0</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="size-6" />
              <span className="text-[10px] font-bold">0</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Share2 className="size-6" />
              <span className="text-[10px] font-bold">Share</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onEdit} disabled={isPublishing}>
          Edit Reel
        </Button>
        <Button variant="brand" onClick={onPublish} disabled={isPublishing}>
          Publish Reel
        </Button>
      </div>
    </div>
  );
}
