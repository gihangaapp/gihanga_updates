import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Crop, Eye, Film, Image as ImageIcon, MessageSquare, Sparkles, UploadCloud, X } from "lucide-react";
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
      tags: Array.from(caption.matchAll(/#(\w+)/g)).map((m) => m[1]),
      taggedPeople,
    });
    toast.success("Draft saved");
    onClose();
  };

  const handleRemoveMedia = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    URL.revokeObjectURL(files[index].previewUrl);
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

      if (files.length > 0) {
        setUploadStage("uploading");
        const uploadedUrls: string[] = [];
        isVideo = files[0].isVideo;

        for (let i = 0; i < files.length; i++) {
          const item = files[i];
          const kind = item.isVideo ? "videos" : "photos";
          const uploaded = await uploadFile(kind, item.file, (pct) => {
            setUploadProgress(Math.round(((i + pct / 100) / files.length) * 100));
          });
          uploadedUrls.push(uploaded.url);
          if (i === 0) mediaKey = uploaded.key;
        }

        mediaUrl = uploadedUrls.join(",");
      }

      setUploadStage("processing");
      await new Promise((r) => setTimeout(r, 400)); // Smooth processing state display

      setUploadStage("publishing");
      const tags = Array.from(caption.matchAll(/#(\w+)/g)).map((m) => m[1]);

      await createPost.mutateAsync({
        kind: isVideo ? "video" : files.length > 0 ? "photo" : "text",
        body: caption.trim(),
        mediaUrl,
        mediaKey,
        location: location.trim() || undefined,
        tags,
        audience,
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
    <div className="flex flex-col gap-5 p-5 max-w-[720px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
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

      {/* Main Content Area */}
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
                  <MediaPicker
                    files={files}
                    onChange={setFiles}
                    multiple
                    compact
                  />
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
              <MediaPicker
                files={files}
                onChange={setFiles}
                multiple
                accept="all"
              />
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

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("preview")}
                disabled={files.length === 0 && !caption.trim()}
                className="gap-1.5"
              >
                <Eye className="size-4" />
                Preview
              </Button>
              <Button
                type="button"
                variant="brand"
                disabled={files.length === 0 && !caption.trim()}
                onClick={handlePublish}
              >
                Publish Post
              </Button>
            </div>
          </div>
        </div>
      )}

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
