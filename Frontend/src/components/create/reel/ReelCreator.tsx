import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Film, Video, X, Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GAvatar } from "@/components/common/GAvatar";
import { MediaPicker, type MediaFile } from "../MediaPicker";
import { CaptionEditor } from "../CaptionEditor";
import { AudienceSelector, type AudienceOption } from "../AudienceSelector";
import { LocationInput } from "../LocationInput";
import { TagPeopleInput } from "../TagPeopleInput";
import { VideoTrimmer } from "./VideoTrimmer";
import { CoverSelector } from "./CoverSelector";
import { ReelPreview } from "./ReelPreview";
import { UploadProgress, type UploadStage } from "../UploadProgress";
import { UnsavedChangesGuard } from "../UnsavedChangesGuard";
import { saveDraft } from "../DraftManager";
import { useSessionUser } from "@/components/auth/AccountMenu";
import { uploadFile } from "@/lib/api-client";
import { useCreatePost } from "@/hooks/use-posts";

interface ReelCreatorProps {
  onClose: () => void;
}

type ReelStep = "select" | "editor" | "preview";

export function ReelCreator({ onClose }: ReelCreatorProps) {
  const navigate = useNavigate();
  const { user } = useSessionUser();

  const [videoFile, setVideoFile] = useState<MediaFile | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState<AudienceOption>("public");
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [taggedPeople, setTaggedPeople] = useState<string[]>([]);
  const [step, setStep] = useState<ReelStep>("select");

  // Video Editor state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(120);
  const [coverTimestamp, setCoverTimestamp] = useState(0);

  // Upload & Guard state
  const [showUnsavedGuard, setShowUnsavedGuard] = useState(false);
  const [uploadStage, setUploadStage] = useState<UploadStage | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | undefined>();

  const createPost = useCreatePost();

  const handleVideoSelect = (files: MediaFile[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setVideoFile(selected);
      setTrimStart(0);
      setTrimEnd(selected.duration || 120);
      setCoverTimestamp(0);
      setStep("editor");
    }
  };

  const handleSaveDraft = () => {
    if (!videoFile) return;
    saveDraft({
      type: "reel",
      caption,
      location,
      audience,
      commentsEnabled,
      media: [{
        fileName: videoFile.file.name,
        mimeType: videoFile.file.type,
        isVideo: true,
      }],
      trimStart,
      trimEnd,
      coverTimestamp,
      tags: Array.from(caption.matchAll(/#(\w+)/g)).map((m) => m[1]),
      taggedPeople,
    });
    toast.success("Reel saved to drafts");
    onClose();
  };

  const handlePublish = async () => {
    if (!user || !videoFile) return;
    setUploadStage("preparing");
    setUploadProgress(0);
    setUploadError(undefined);

    try {
      setUploadStage("uploading");
      const uploaded = await uploadFile("reels", videoFile.file, (pct) => setUploadProgress(pct));

      setUploadStage("processing");
      await new Promise((r) => setTimeout(r, 600)); // Processing simulation

      setUploadStage("publishing");
      const tags = Array.from(caption.matchAll(/#(\w+)/g)).map((m) => m[1]);

      await createPost.mutateAsync({
        kind: "reel",
        body: caption.trim(),
        mediaUrl: uploaded.url,
        mediaKey: uploaded.key,
        location: location.trim() || undefined,
        tags,
        audience,
      });

      setUploadStage("completed");
      toast.success("Reel published successfully!");
      setTimeout(() => {
        onClose();
        navigate({ to: "/reels" });
      }, 1000);
    } catch (err: any) {
      setUploadStage("failed");
      setUploadError(err?.message || "Failed to upload reel.");
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-5 p-5 max-w-[720px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-accent/20 text-accent">
            <Video className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight">Create Reel</h2>
            <p className="text-xs text-muted-foreground">Share short videos up to 2 minutes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {videoFile && (
            <Button variant="ghost" size="sm" onClick={handleSaveDraft}>
              Save Draft
            </Button>
          )}
          <button
            type="button"
            onClick={() => {
              if (videoFile && !uploadStage) setShowUnsavedGuard(true);
              else onClose();
            }}
            className="press grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {step === "preview" && videoFile ? (
        <ReelPreview
          user={user}
          videoUrl={videoFile.previewUrl}
          caption={caption}
          onEdit={() => setStep("editor")}
          onPublish={handlePublish}
          isPublishing={uploadStage !== null}
        />
      ) : !videoFile ? (
        /* Video Entry Options */
        <div className="flex flex-col gap-6 py-8 items-center text-center">
          <div className="grid size-20 place-items-center rounded-full bg-accent/15 text-accent animate-pulse">
            <Film className="size-10" />
          </div>
          <div>
            <h3 className="text-base font-bold">Select a video for your Reel</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Reels work best with portrait (9:16) videos up to 2 minutes long.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <MediaPicker
              accept="videos"
              maxDurationSeconds={120}
              files={[]}
              onChange={handleVideoSelect}
              className="flex-1 h-32"
            />
          </div>
        </div>
      ) : (
        /* Video Editor & Composer Workspace */
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Trimmer & Cover */}
          <div className="flex flex-col gap-4 lg:col-span-6">
            <VideoTrimmer
              videoUrl={videoFile.previewUrl}
              duration={videoFile.duration || 120}
              trimStart={trimStart}
              trimEnd={trimEnd}
              onTrimChange={(start, end) => {
                setTrimStart(start);
                setTrimEnd(end);
              }}
            />
            <CoverSelector
              videoUrl={videoFile.previewUrl}
              duration={videoFile.duration || 120}
              selectedTimestamp={coverTimestamp}
              onSelectTimestamp={setCoverTimestamp}
            />
          </div>

          {/* Right Column: Details & Publish */}
          <div className="flex flex-col gap-4 lg:col-span-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GAvatar user={user} size="xs" />
                <span className="text-xs font-bold">{user.name}</span>
              </div>
              <AudienceSelector value={audience} onChange={setAudience} compact />
            </div>

            <CaptionEditor
              value={caption}
              onChange={setCaption}
              placeholder="Describe your reel. Use #tags to reach more people…"
              className="rounded-2xl border border-border p-3 bg-surface"
            />

            <LocationInput value={location} onChange={setLocation} />
            <TagPeopleInput taggedUsers={taggedPeople} onChange={setTaggedPeople} />

            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-surface">
              <span className="text-xs font-semibold">Allow comments</span>
              <Switch checked={commentsEnabled} onCheckedChange={setCommentsEnabled} />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
              <Button
                variant="outline"
                onClick={() => setStep("preview")}
                className="gap-1.5"
              >
                <Eye className="size-4" />
                Preview Reel
              </Button>
              <Button variant="brand" onClick={handlePublish}>
                Publish Reel
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

      {/* Guard */}
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
