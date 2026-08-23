import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Film, Globe2, Image as ImageIcon, Loader2, Lock, MapPin, Radio, Sparkles, Users, Video, X } from "lucide-react";
import { toast } from "sonner";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useSessionUser } from "@/components/auth/AccountMenu";
import { uploadFile } from "@/lib/api-client";
import { useCreatePost } from "@/hooks/use-posts";
import { useCreateStory } from "@/hooks/use-stories";
import { cn } from "@/lib/utils";

export type CreateMode = "post" | "reel" | "story";

interface CreateState {
  open: boolean;
  mode: CreateMode;
}

let state: CreateState = { open: false, mode: "post" };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const snapshot = () => state;

export function openCreate(mode: CreateMode = "post") {
  state = { open: true, mode };
  emit();
}
function closeCreate() {
  state = { ...state, open: false };
  emit();
}

const audiences = [
  { id: "public", label: "Everyone", icon: Globe2 },
  { id: "followers", label: "Followers", icon: Users },
  { id: "private", label: "Only me", icon: Lock },
] as const;

const REEL_MAX_SECONDS = 120;

export function CreateHost() {
  const s = useSyncExternalStore(subscribe, snapshot, snapshot);
  const navigate = useNavigate();
  const { user } = useSessionUser();

  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState<(typeof audiences)[number]["id"]>("public");
  const [mode, setMode] = useState<CreateMode>("post");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPost = useCreatePost();
  const createStory = useCreateStory();

  useEffect(() => {
    if (!s.open) return;
    setMode(s.mode);
    setBody("");
    setFile(null);
    setPreviewUrl(null);
    setIsVideo(false);
    setLocation("");
    setAudience("public");
    setProgress(0);
  }, [s.open, s.mode]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  if (!user) return null;

  const tags = Array.from(body.matchAll(/#(\w+)/g)).map((m) => m[1] as string);
  const canPost = mode === "story" ? !!file : body.trim().length > 0 || !!file;

  function pickFile(f: File) {
    const video = f.type.startsWith("video/");
    if (mode === "reel" && !video) {
      toast.error("Reels need a video file");
      return;
    }
    if (video) {
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.onloadedmetadata = () => {
        URL.revokeObjectURL(probe.src);
        if (mode === "reel" && probe.duration > REEL_MAX_SECONDS) {
          toast.error("Reels must be 2 minutes or shorter");
          return;
        }
        setFile(f);
        setIsVideo(true);
        setPreviewUrl(URL.createObjectURL(f));
      };
      probe.src = URL.createObjectURL(f);
    } else {
      setFile(f);
      setIsVideo(false);
      setPreviewUrl(URL.createObjectURL(f));
    }
  }

  async function submit() {
    if (!canPost) return;
    setUploading(true);
    setProgress(0);
    try {
      let mediaUrl: string | undefined;
      let mediaKey: string | undefined;

      if (file) {
        const kind = mode === "story" ? "stories" : mode === "reel" ? "reels" : isVideo ? "videos" : "photos";
        const uploaded = await uploadFile(kind, file, setProgress);
        mediaUrl = uploaded.url;
        mediaKey = uploaded.key;
      }

      if (mode === "story") {
        await createStory.mutateAsync({
          mediaUrl: mediaUrl!,
          mediaKey,
          mediaType: isVideo ? "video" : "image",
          caption: body.trim() || undefined,
        });
        toast.success("Story added", { description: "Visible to your followers for 24 hours." });
        closeCreate();
        return;
      }

      await createPost.mutateAsync({
        kind: mode === "reel" ? "reel" : file ? (isVideo ? "video" : "photo") : "text",
        body: body.trim(),
        mediaUrl,
        mediaKey,
        location: location.trim() || undefined,
        tags,
        audience,
      });
      toast.success(mode === "reel" ? "Reel published" : "Posted to your feed");
      closeCreate();
      navigate({ to: mode === "reel" ? "/reels" : "/" });
    } catch (err: any) {
      toast.error(err?.message || "Couldn't publish — please try again");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={s.open} onOpenChange={(o) => (o ? openCreate(mode) : closeCreate())}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-[560px]">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-display text-lg font-extrabold tracking-tight">Create</DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 px-5 pt-4">
          {(
            [
              { id: "post", label: "Post", icon: Sparkles },
              { id: "reel", label: "Reel", icon: Video },
              { id: "story", label: "Story", icon: Radio },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setMode(t.id);
                setFile(null);
                setPreviewUrl(null);
              }}
              className={cn(
                "press flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold",
                mode === t.id ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-start gap-3 px-5 pt-4">
          <GAvatar user={user} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{user.name}</p>
            {mode !== "story" && (
              <div className="mt-1 flex gap-1">
                {audiences.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAudience(a.id)}
                    className={cn(
                      "press flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold",
                      audience === a.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <a.icon className="size-3" />
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={500}
          placeholder={
            mode === "story"
              ? "Add a caption to your story…"
              : mode === "reel"
                ? "Describe your reel. Use #tags to reach more people."
                : `What's the update, ${user.name.split(" ")[0]}?`
          }
          className="mt-3 min-h-[110px] resize-none border-0 bg-transparent px-5 text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
        />

        {previewUrl && (
          <div className="relative mx-5 overflow-hidden rounded-2xl bg-black">
            {isVideo ? (
              <video src={previewUrl} controls className="max-h-72 w-full" />
            ) : (
              <img src={previewUrl} alt="Selected media" className="max-h-72 w-full object-cover" />
            )}
            <button
              type="button"
              aria-label="Remove media"
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
              }}
              className="press absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-black/60 text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="px-5 pt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={mode === "reel" ? "video/*" : "image/*,video/*"}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickFile(f);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            {mode === "reel" ? <Film className="size-4" /> : <ImageIcon className="size-4" />}
            {file ? "Change media" : mode === "reel" ? "Choose a video (max 2 min)" : "Choose a photo or video"}
          </Button>
        </div>

        {mode !== "story" && (
          <div className="grid gap-2 px-5 pt-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-success" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a place"
                className="h-9"
              />
            </div>
          </div>
        )}

        {!!tags.length && (
          <div className="flex flex-wrap gap-1.5 px-5 pt-3">
            {tags.map((t) => (
              <span key={t} className="rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
                #{t}
              </span>
            ))}
          </div>
        )}

        {uploading && file && (
          <div className="px-5 pt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Uploading… {progress}%</p>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3 border-t border-border px-5 py-4">
          <span className="text-xs text-muted-foreground">{body.length}/500</span>
          <Button variant="ghost" className="ml-auto" onClick={closeCreate} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="brand" disabled={!canPost || uploading} onClick={submit}>
            {uploading && <Loader2 className="size-4 animate-spin" />}
            {mode === "story" ? "Share story" : mode === "reel" ? "Publish reel" : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
