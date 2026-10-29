import { useEffect, useRef, useState } from "react";
import { Heart, CornerDownRight, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCount, timeAgo } from "@/lib/format";
import { FeedPost, PostComment } from "@/lib/api-client";
import { useComments, useCreateComment, useToggleCommentLike } from "@/hooks/use-social";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface CommentSheetProps {
  post: FeedPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDisplayUser(author: FeedPost["author"]) {
  return {
    id: author._id,
    name: author.name,
    username: author.username,
    bio: "",
    avatarHue: author.avatarHue,
    avatarUrl: author.avatarUrl,
    verified: author.verified,
    creator: author.isCreator,
    live: author.isLive,
    followers: 0,
    following: 0,
    posts: 0,
  };
}

export function InlineComments({ post }: { post: FeedPost }) {
  const { data, isLoading } = useComments(post._id);
  const createComment = useCreateComment(post._id);
  const { user } = useAuth();

  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [pendingComment, setPendingComment] = useState<{
    body: string;
    replyName?: string;
  } | null>(null);

  const handleSubmit = () => {
    const body = draft.trim();
    if (!body || createComment.isPending) return;
    setPendingComment({ body, ...(replyTo ? { replyName: replyTo.name } : {}) });
    setDraft("");
    createComment.mutate(
      { body, parent: replyTo?.id },
      {
        onSuccess: (result) => {
          setPendingComment(null);
          setReplyTo(null);
          if (result.pendingNotice) toast.info(result.pendingNotice);
        },
        onError: (err: any) => {
          setPendingComment(null);
          setDraft(body);
          toast.error(err.message || "Couldn't post comment");
        },
      },
    );
  };

  return (
    <div className="flex flex-col border-t border-border/80 bg-surface/50 p-4 gap-4 animate-fade-in">
      {/* Existing Comments List */}
      <div className="space-y-3.5 max-h-80 overflow-y-auto no-scrollbar pr-1">
        {pendingComment && <PendingComment body={pendingComment.body} replyName={pendingComment.replyName} user={user} />}
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
            <Loader2 className="size-4 animate-spin text-primary" /> Loading comments…
          </div>
        ) : !data?.comments || data.comments.length === 0 ? (
          !pendingComment && <p className="text-center py-4 text-xs text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          data.comments.map((comment) => (
            <CommentRow
              key={comment._id}
              comment={comment}
              postId={post._id}
              onReply={(id, name) => setReplyTo({ id, name })}
            />
          ))
        )}
      </div>

      {/* Reply indicator & Input Bar */}
      <div className="pt-2 border-t border-border/60">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
            <span>
              Replying to <strong className="text-foreground">@{replyTo.name}</strong>
            </span>
            <button
              type="button"
              className="text-danger hover:underline font-bold"
              onClick={() => setReplyTo(null)}
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            disabled={createComment.isPending}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={replyTo ? `Reply to ${replyTo.name}…` : "Add a comment…"}
            className="h-10 min-w-0 flex-1 rounded-full border border-border bg-elevated px-4 text-xs outline-none focus:border-primary disabled:opacity-60"
          />
          <Button
            size="sm"
            variant="brand"
            onClick={handleSubmit}
            disabled={!draft.trim() || createComment.isPending}
            className="rounded-full shrink-0"
          >
            {createComment.isPending ? <><Loader2 className="size-3.5 animate-spin" /> Sending…</> : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CommentSheet({ post, open, onOpenChange }: CommentSheetProps) {
  const isMobile = useIsMobile();
  const { data, isLoading } = useComments(open ? post._id : "");
  const createComment = useCreateComment(post._id);
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewportHeight, setViewportHeight] = useState(
    () => (typeof window !== "undefined" ? window.visualViewport?.height ?? window.innerHeight : 640),
  );
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    if (!open || !isMobile || typeof window === "undefined") return;
    const viewport = window.visualViewport;
    const updateViewport = () => {
      const height = viewport?.height ?? window.innerHeight;
      setViewportHeight(height);
      const inset = Math.max(0, window.innerHeight - height - (viewport?.offsetTop ?? 0));
      setKeyboardInset(inset > 120 ? inset : 0);
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
  }, [open, isMobile]);

  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [pendingComment, setPendingComment] = useState<{
    body: string;
    replyName?: string;
  } | null>(null);

  const handleSubmit = () => {
    const body = draft.trim();
    if (!body || createComment.isPending) return;
    setPendingComment({ body, ...(replyTo ? { replyName: replyTo.name } : {}) });
    setDraft("");
    createComment.mutate(
      { body, parent: replyTo?.id },
      {
        onSuccess: (result) => {
          setPendingComment(null);
          setReplyTo(null);
          if (result.pendingNotice) toast.info(result.pendingNotice);
        },
        onError: (err: any) => {
          setPendingComment(null);
          setDraft(body);
          toast.error(err.message || "Couldn't post comment");
        },
      },
    );
  };

  const content = (
    <div
      className="flex min-h-0 w-full flex-col"
      style={{
        height: isMobile
          ? `${Math.max(180, Math.min(viewportHeight * 0.68, 600))}px`
          : "min(75vh, 640px)",
      }}
    >
      {/* Comment List */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 no-scrollbar">
        {pendingComment && <PendingComment body={pendingComment.body} replyName={pendingComment.replyName} user={user} />}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary mb-2" />
            Loading comments…
          </div>
        ) : !data?.comments || data.comments.length === 0 ? (
          !pendingComment && <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground"><p className="font-bold text-foreground mb-1">No comments yet</p><p className="text-xs">Be the first to share your thoughts!</p></div>
        ) : (
          data.comments.map((comment) => (
            <CommentRow
              key={comment._id}
              comment={comment}
              postId={post._id}
              onReply={(id, name) => setReplyTo({ id, name })}
            />
          ))
        )}
      </div>

      {/* Reply indicator & Input Bar */}
      <div className="border-t border-border bg-surface p-4">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
            <span>
              Replying to <strong className="text-foreground">@{replyTo.name}</strong>
            </span>
            <button
              type="button"
              className="text-danger hover:underline font-bold"
              onClick={() => setReplyTo(null)}
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            disabled={createComment.isPending}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            onFocus={() =>
              window.setTimeout(
                () => inputRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
                100,
              )
            }
            placeholder={replyTo ? `Reply to ${replyTo.name}…` : "Add a comment…"}
            className="h-11 min-w-0 flex-1 rounded-full border border-border bg-elevated px-4 text-sm outline-none focus:border-primary disabled:opacity-60"
          />
          <Button
            size="icon"
            variant="brand"
            onClick={handleSubmit}
            disabled={!draft.trim() || createComment.isPending}
            className="rounded-full shrink-0"
          >
            {createComment.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          style={{
            bottom: keyboardInset > 0 ? `${keyboardInset}px` : "0px",
            maxHeight: `${Math.max(250, viewportHeight - 8)}px`,
          }}
          className="overflow-hidden rounded-t-3xl p-0 max-h-[85dvh]"
        >
          <DrawerHeader className="border-b border-border px-5 py-3">
            <DrawerTitle className="font-display text-base font-bold text-center">
              Comments
            </DrawerTitle>
            <DrawerDescription className="text-center text-xs">
              {formatCount(post.commentsCount)} comments on @{post.author.username}&apos;s post
            </DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0 rounded-3xl gap-0 border-border overflow-hidden">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-display text-base font-bold">Comments</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}

function PendingComment({
  body,
  replyName,
  user,
}: {
  body: string;
  replyName?: string | undefined;
  user: ReturnType<typeof useAuth>["user"];
}) {
  if (!user) return null;
  return (
    <div className="flex items-start gap-3 opacity-90" aria-live="polite">
      <GAvatar user={user} size="xs" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-foreground">{user.name}</span>
          <span className="text-[11px] text-muted-foreground">@{user.username}</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-primary">
            <Loader2 className="size-3 animate-spin" /> Sending…
          </span>
        </div>
        {replyName && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">Replying to @{replyName}</p>
        )}
        <p className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground/90">
          {body}
        </p>
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  postId,
  onReply,
  depth = 0,
}: {
  comment: PostComment;
  postId: string;
  onReply: (id: string, name: string) => void;
  depth?: number;
}) {
  const toggleLike = useToggleCommentLike(postId);

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        depth > 0 && "ml-7 mt-3 border-l-2 border-border/40 pl-3",
      )}
    >
      <GAvatar user={toDisplayUser(comment.author)} size="xs" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-bold text-foreground">{comment.author.name}</span>
          <span className="text-[11px] text-muted-foreground">@{comment.author.username}</span>
          <span aria-hidden className="text-[11px] text-muted-foreground">
            ·
          </span>
          <span className="text-[11px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {comment.body}
        </p>
        <div className="mt-1.5 flex items-center gap-4 text-[11px] font-semibold text-muted-foreground">
          <button
            type="button"
            className={cn(
              "press flex items-center gap-1 hover:text-danger disabled:opacity-50",
              comment.liked && "text-danger",
            )}
            aria-label={comment.liked ? "Unlike comment" : "Like comment"}
            aria-pressed={comment.liked}
            disabled={toggleLike.isPending}
            onClick={() =>
              toggleLike.mutate(comment._id, {
                onError: (err: any) => toast.error(err.message || "Couldn't like comment"),
              })
            }
          >
            <Heart className={cn("size-3", comment.liked && "fill-current")} />
            <span>{formatCount(comment.likesCount)}</span>
          </button>
          <button
            type="button"
            className="press flex items-center gap-1 hover:text-primary"
            onClick={() => onReply(comment._id, comment.author.username)}
          >
            <CornerDownRight className="size-3" />
            <span>Reply</span>
          </button>
        </div>
        {comment.replies?.map((reply) => (
          <CommentRow
            key={reply._id}
            comment={reply}
            postId={postId}
            onReply={onReply}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  );
}
