import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Crop,
  Eye,
  Film,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GAvatar } from "@/components/common/GAvatar";
import { MediaPicker, type MediaFile } from "../MediaPicker";
import { MediaPreview } from "../MediaPreview";
import { MediaEditor } from "../MediaEditor";
import { CaptionEditor } from "../CaptionEditor";
import { AudienceSelector, type AudienceOption } from "../AudienceSelector";
import { LocationInput } from "../LocationInput";
import { TagPeopleInput } from "../TagPeopleInput";
import { PostPreview } from "./PostPreview";
import { UploadProgress, type UploadStage } from "../UploadProgress";
import { UnsavedChangesGuard } from "../UnsavedChangesGuard";
import { saveDraft, type PostDraftData } from "../DraftManager";
import { useSessionUser } from "@/components/auth/AccountMenu";
import { uploadFile } from "@/lib/api-client";
import { useCreatePost } from "@/hooks/use-posts";

interface PostCreatorProps {
  onClose: () => void;
  initialDraftId?: string;
}

type ModeStep = "compose" | "edit-media" | "preview";

export function PostCreator({ onClose }: PostCreatorProps) {
  const navigate = useNavigate();
  const { user } = useSessionUser();

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState<AudienceOption>("public");
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [taggedPeople, setTaggedPeople] = useState<string[]>([]);
  const [step, setStep] = useState<ModeStep>("compose");

  // Unsaved changes & publishing state
  const [showUnsavedGuard, setShowUnsavedGuard] = useState(false);
  const [uploadStage, setUploadStage] = useState<UploadStage | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | undefined>();

  const createPost = useCreatePost();

  const hasUnsavedContent = files.length > 0 || caption.trim().length > 0;

  const handleCloseRequest = () => {
    if (hasUnsavedContent && !uploadStage) {
      setShowUnsavedGuard(true);
    } else {
      onClose();
    }
  };

  const handleSaveDraft = () => {
    saveDraft({
      type: "post",
      caption,
      location,
      audience,
      commentsEnabled,
      media: files.map((f) => ({
        fileName: f.file.name,
        mimeType: f.file.type,
        isVideo: f.isVideo,
      })),
      tags: Array.from(caption.matchAll(/#(\w+)/g))
        .map((m) => m[1])
        .filter((t): t is string => t !== undefined),
      taggedPeople,
    });
    toast.success("Draft saved");
    onClose();
  };

  const handleRemoveMedia = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    const removed = files[index];
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    setFiles(next);
    if (selectedIndex >= next.length) {
      setSelectedIndex(Math.max(0, next.length - 1));
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    setUploadStage("preparing");
    setUploadProgress(0);
    setUploadError(undefined);

    try {
      let mediaUrl: string | undefined;
      let mediaKey: string | undefined;
      let isVideo = false;
      // B1 — collect the geometry the upload API returns so the feed can
      // size this post's media without cropping and without layout shift.
      let firstWidth: number | undefined;
      let firstHeight: number | undefined;
      let firstRatio: number | undefined;
      let firstBlur: string | undefined;
      let thumbnailUrl: string | undefined;
      const mediaItems: {
        url: string;
        width?: number | undefined;
        height?: number | undefined;
        aspectRatio?: number | undefined;
        kind?: "photo" | "video" | undefined;
      }[] = [];

      if (files.length > 0) {
        setUploadStage("uploading");
        const uploadedUrls: string[] = [];
        isVideo = files[0]?.isVideo ?? false;

        for (let i = 0; i < files.length; i++) {
          const item = files[i];
          if (!item) continue;
          const kind = item.isVideo ? "videos" : "photos";
          const uploaded = await uploadFile(kind, item.file, (pct) => {
            setUploadProgress(Math.round(((i + pct / 100) / files.length) * 100));
          });
          uploadedUrls.push(uploaded.url);
          if (i === 0) {
            mediaKey = uploaded.key;
            firstWidth = uploaded.width;
            firstHeight = uploaded.height;
            firstRatio = uploaded.aspectRatio;
            firstBlur = uploaded.blurDataUrl;
            thumbnailUrl = uploaded.thumbnailUrl;
          }
          mediaItems.push({
            url: uploaded.url,
            width: uploaded.width,
            height: uploaded.height,
            aspectRatio: uploaded.aspectRatio,
            kind: item.isVideo ? "video" : "photo",
          });
        }

        mediaUrl = uploadedUrls.join(",");
      }

      setUploadStage("processing");
      await new Promise((r) => setTimeout(r, 400)); // Smooth processing state display

      setUploadStage("publishing");
      const tags = Array.from(caption.matchAll(/#(\w+)/g))
        .map((m) => m[1])
        .filter((t): t is string => t !== undefined);

      await createPost.mutateAsync({
        kind: isVideo ? "video" : files.length > 0 ? "photo" : "text",
        body: caption.trim(),
        mediaUrl,
        mediaKey,
        thumbnailUrl,
        location: location.trim() || undefined,
        tags,
        audience,
        // B1 — persisted media geometry.
        mediaWidth: firstWidth,
        mediaHeight: firstHeight,
        aspectRatio: firstRatio,
        blurDataUrl: firstBlur,
        media: mediaItems.length > 0 ? mediaItems : undefined,
      });

      setUploadStage("completed");
      toast.success("Posted to your feed!");
      setTimeout(() => {
        onClose();
        navigate({ to: "/" });
      }, 1000);
    } catch (err: any) {
      setUploadStage("failed");
      setUploadError(err?.message || "Failed to publish post. Please check your connection.");
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-full min-h-0 flex-col max-w-[720px] mx-auto w-full overscroll-contain">
      {/* Header — fixed; the body below scrolls so the footer stays reachable
          on short viewports (B3: header / body / footer structure). */}
      <div className="flex shrink-0 items-center justify-between border-b border-border p-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight">Create Post</h2>
            <p className="text-xs text-muted-foreground">Share photos, videos or updates</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedContent && (
            <Button variant="ghost" size="sm" onClick={handleSaveDraft}>
              Save Draft
            </Button>
          )}
          <button
            type="button"
            onClick={handleCloseRequest}
            className="press grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area — flex-1 min-h-0 so IT scrolls (not the dialog),
          with the footer always visible and safe-area padded below. */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 lg:p-5">
        {step === "preview" ? (
          <PostPreview
            user={user}
            caption={caption}
            files={files}
            location={location}
            audience={audience}
            onEdit={() => setStep("compose")}
            onPublish={handlePublish}
            isPublishing={uploadStage !== null}
          />
        ) : step === "edit-media" && files[selectedIndex] ? (
          <MediaEditor
            file={files[selectedIndex]}
            onSave={(edited) => {
              const next = [...files];
              next[selectedIndex] = edited;
              setFiles(next);
              setStep("compose");
            }}
            onCancel={() => setStep("compose")}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Media Section */}
            <div className="flex flex-col gap-4 lg:col-span-6">
              {files.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <MediaPreview
                    files={files}
                    selectedIndex={selectedIndex}
                    onSelect={setSelectedIndex}
                    onRemove={handleRemoveMedia}
                    onReorder={setFiles}
                  />
                  <div className="flex items-center justify-between">
                    <MediaPicker files={files} onChange={setFiles} multiple compact />
                    {!files[selectedIndex]?.isVideo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStep("edit-media")}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <Crop className="size-3.5" />
                        Edit Image
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <MediaPicker files={files} onChange={setFiles} multiple accept="all" />
              )}
            </div>

            {/* Right Column: Composer Controls */}
            <div className="flex flex-col gap-4 lg:col-span-6">
              {/* User & Audience */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GAvatar user={user} size="sm" />
                  <span className="text-sm font-bold">{user.name}</span>
                </div>
                <AudienceSelector value={audience} onChange={setAudience} compact />
              </div>

              {/* Caption Textarea */}
              <CaptionEditor
                value={caption}
                onChange={setCaption}
                placeholder={`What's the update, ${user.name.split(" ")[0]}?`}
                className="rounded-2xl border border-border p-3 bg-surface"
              />

              {/* Location & Tag People */}
              <div className="grid gap-3 pt-1">
                <LocationInput value={location} onChange={setLocation} />
                <TagPeopleInput taggedUsers={taggedPeople} onChange={setTaggedPeople} />
              </div>

              {/* (Footer actions moved to the sticky bar below — always reachable.) */}
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer with safe-area padding — the Publish/Preview buttons
          are ALWAYS reachable, even on 320×480 screens with the keyboard up. */}
      <div className="sticky bottom-0 shrink-0 border-t border-border bg-surface/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:border-t-0 lg:bg-transparent lg:p-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStep("preview")}
            disabled={files.length === 0 && !caption.trim()}
            className="gap-1.5 flex-1 sm:flex-none"
          >
            <Eye className="size-4" />
            Preview
          </Button>
          <Button
            type="button"
            variant="brand"
            size="sm"
            disabled={files.length === 0 && !caption.trim()}
            onClick={handlePublish}
            className="gap-1.5 flex-1 sm:flex-none"
          >
            Publish Post
          </Button>
        </div>
      </div>

      {/* Upload Progress Overlay */}
      {uploadStage && (
        <UploadProgress
          stage={uploadStage}
          progress={uploadProgress}
          error={uploadError}
          onRetry={handlePublish}
          onCancel={() => setUploadStage(null)}
          onDone={() => {
            setUploadStage(null);
            onClose();
          }}
        />
      )}

      {/* Unsaved Changes Guard */}
      <UnsavedChangesGuard
        open={showUnsavedGuard}
        onSaveDraft={handleSaveDraft}
        onDiscard={() => {
          setShowUnsavedGuard(false);
          onClose();
        }}
        onContinue={() => setShowUnsavedGuard(false)}
      />
    </div>
  );
}
