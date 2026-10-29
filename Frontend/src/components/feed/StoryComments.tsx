import { useEffect, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { timeAgo } from "@/lib/format";
import { useStoryReplies, useReplyToStory, type StoryReply } from "@/hooks/use-stories";
import { useSessionUser } from "@/components/auth/AccountMenu";

interface StoryCommentsProps {
  storyId: string;
  authorUsername: string;
  onClose: () => void;
}

function toDisplayUser(user: NonNullable<StoryReply["user"]>) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    bio: "",
    avatarHue: user.avatarHue,
    avatarUrl: user.avatarUrl,
    verified: user.verified,
    creator: user.isCreator,
    live: false,
    followers: 0,
    following: 0,
    posts: 0,
  };
}

/**
 * Comment thread for a story. Comments are stored through the story reply
 * endpoint (story_reply records tied to the story), so the sheet lists the
 * full thread and posts new comments via the same endpoint.
 */
export function StoryComments({ storyId, authorUsername, onClose }: StoryCommentsProps) {
  const { user: me } = useSessionUser();
  const { data, isLoading } = useStoryReplies(storyId);
  const replyToStory = useReplyToStory();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingReply, setPendingReply] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState(
    () => (typeof window !== "undefined" ? window.visualViewport?.height ?? window.innerHeight : 640),
  );
  const [viewportOffsetTop, setViewportOffsetTop] = useState(0);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640,
  );

  // Keep the composer attached to the visible viewport when the mobile keyboard opens.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const viewport = window.visualViewport;
    const updateViewport = () => {
      setViewportHeight(viewport?.height ?? window.innerHeight);
      setViewportOffsetTop(viewport?.offsetTop ?? 0);
      setIsMobile(window.innerWidth < 640);
    };
    updateViewport();
    viewport?.addEventListener("resize", updateViewport);
    viewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);
    return () => {
      viewport?.removeEventListener("resize", updateViewport);
      viewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const replies = data?.replies ?? [];

  const handleSend = async () => {
    const msg = text.trim();
    if (!msg || sending) return;
    setSending(true);
    setText("");
    setPendingReply(msg);
    try {
      await replyToStory.mutateAsync({ storyId, message: msg });
      setPendingReply(null);
    } catch (err: any) {
      setPendingReply(null);
      setText(msg);
      toast.error(err?.message || "Failed to send comment");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-x-0 top-0 z-[80] flex items-end justify-center sm:items-center"
      style={{ top: `${viewportOffsetTop}px`, height: `${viewportHeight}px` }}
      role="dialog"
      aria-modal="true"
      aria-label={`Comments on @${authorUsername}'s story`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close comments"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Sheet */}
      <div
        className="relative z-10 flex w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card text-card-foreground shadow-float sm:max-w-md sm:rounded-3xl"
        style={{
          height: isMobile
            ? `${Math.max(220, Math.min(viewportHeight * 0.78, 680))}px`
            : "min(60vh, 640px)",
          maxHeight: `${viewportHeight}px`,
        }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-display text-sm font-extrabold">Comments</h3>
          <button
            type="button"
            onClick={onClose}
            className="press grid size-8 place-items-center rounded-full bg-muted text-foreground hover:bg-muted/70"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Thread */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-3 no-scrollbar">
          {isLoading && !pendingReply ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : replies.length === 0 && !pendingReply ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm font-semibold">No comments yet</p>
              <p className="text-xs text-muted-foreground">
                Be the first to comment on @{authorUsername}'s story.
              </p>
            </div>
          ) : (
            <>
              {pendingReply && (
                <div className="flex items-start gap-2.5 opacity-85" aria-live="polite">
                  {me ? <GAvatar user={me} size="xs" /> : <span className="size-6 shrink-0 rounded-full bg-muted" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-snug">
                      <span className="font-bold">{me?.username ?? "you"}</span>{" "}
                      <span className="text-foreground/90">{pendingReply}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" /> Sending…
                    </p>
                  </div>
                </div>
              )}
              {replies.map((r) => (
                <div key={r._id} className="flex items-start gap-2.5">
                  {r.user ? (
                    <GAvatar user={toDisplayUser(r.user)} size="xs" />
                  ) : (
                    <span className="size-6 shrink-0 rounded-full bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-snug">
                      <span className="font-bold">{r.user?.username ?? "someone"}</span>{" "}
                      <span className="text-foreground/90">
                        {r.text.replace(/^replied to your story:\s*/i, "")}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(r.createdAt)}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Composer */}
        <div className="flex shrink-0 items-center gap-2 border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void handleSend();
              }
            }}
            maxLength={500}
            placeholder={me ? `Comment as ${me.username}…` : "Add a comment…"}
            className="h-10 min-w-0 flex-1 rounded-full"
          />
          <Button
            size="icon-sm"
            variant="brand"
            onClick={() => void handleSend()}
            disabled={!text.trim() || sending}
            className="shrink-0 rounded-full"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
