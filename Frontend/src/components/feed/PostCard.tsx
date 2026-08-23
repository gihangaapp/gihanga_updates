import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bookmark,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Play,
  Send,
  Trash2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { GAvatar, VerifiedBadge } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCount, timeAgo } from "@/lib/format";
import { FeedPost, PostComment, mediaUrl } from "@/lib/api-client";
import { useToggleLike, useToggleBookmark, useDeletePost } from "@/hooks/use-posts";
import { useComments, useCreateComment, useToggleCommentLike, useFollowUser, useFollowingSet } from "@/hooks/use-social";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

function ActionButton({
  icon: Icon,
  label,
  count,
  active,
  tone = "primary",
  onClick,
}: {
  icon: typeof Heart;
  label: string;
  count?: number;
  active?: boolean;
  tone?: "primary" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "press flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-muted-foreground hover:bg-muted",
        active && (tone === "danger" ? "text-danger" : "text-primary"),
      )}
    >
      <Icon className={cn("size-[18px]", active && "fill-current")} />
      {count !== undefined && <span className="tabular-nums">{formatCount(count)}</span>}
    </button>
  );
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

export function PostCard({ post, index = 0 }: { post: FeedPost; index?: number }) {
  const { user } = useAuth();
  const [burst, setBurst] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const lastTap = useRef(0);

  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();
  const deletePost = useDeletePost();
  const followUser = useFollowUser();
  const { data: followingSet } = useFollowingSet();

  const isOwnPost = user?.username === post.author.username;
  const following = followingSet?.has(post.author.username) ?? post.followingAuthor;

  const like = useCallback(() => {
    toggleLike.mutate(post._id);
  }, [toggleLike, post._id]);

  const onMediaTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!post.liked) like();
      setBurst(true);
      window.setTimeout(() => setBurst(false), 700);
    }
    lastTap.current = now;
  };

  const image = mediaUrl(post.mediaUrl);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(index, 4) * 0.05 }}
      className="surface-card mb-4 overflow-hidden"
    >
      <header className="flex items-center gap-3 p-4 pb-3">
        <Link
          to="/profile/$username"
          params={{ username: post.author.username }}
          className="press"
        >
          <GAvatar user={toDisplayUser(post.author)} size="md" ring={post.author.isLive ? "live" : "none"} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            <span className="truncate text-[15px] font-bold">{post.author.name}</span>
            {post.author.verified && <VerifiedBadge />}
            {post.author.isCreator && (
              <span className="ml-1 hidden shrink-0 rounded-md bg-primary-soft px-1.5 py-px text-[10px] font-bold tracking-wide text-primary uppercase sm:inline">
                Creator
              </span>
            )}
          </div>
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">@{post.author.username}</span>
            <span aria-hidden>·</span>
            <span className="shrink-0">{timeAgo(post.createdAt)}</span>
            {post.location && (
              <>
                <span aria-hidden>·</span>
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{post.location}</span>
              </>
            )}
          </div>
        </div>
        {!isOwnPost && (
          <Button
            variant={following ? "soft" : "default"}
            size="sm"
            onClick={() =>
              followUser.mutate(
                { username: post.author.username, follow: !following },
                { onError: (err: any) => toast.error(err.message || "Couldn't update follow status") },
              )
            }
          >
            {following ? "Following" : "Follow"}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Post options">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => toggleBookmark.mutate(post._id)}>
              {post.bookmarked ? "Remove from bookmarks" : "Save post"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/post/${post._id}`);
                toast.success("Link copied");
              }}
            >
              Copy link
            </DropdownMenuItem>
            {isOwnPost ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-danger"
                  onClick={() => {
                    deletePost.mutate(post._id);
                    toast.success("Post deleted");
                  }}
                >
                  <Trash2 className="size-4" />
                  Delete post
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-danger"
                  onClick={() => toast.success("Report sent to moderation")}
                >
                  Report
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {post.body && (
        <div className="px-4 pb-3">
          <p className="text-[15px] leading-relaxed text-foreground/90">{post.body}</p>
          {post.tags.length > 0 && (
            <p className="mt-1.5 flex flex-wrap gap-x-2 text-[13px] font-semibold text-primary">
              {post.tags.map((t) => (
                <Link key={t} to="/tag/$tag" params={{ tag: t }} className="hover:underline">
                  #{t}
                </Link>
              ))}
            </p>
          )}
        </div>
      )}

      {image && post.kind !== "text" && (
        <div
          role="button"
          tabIndex={0}
          onClick={onMediaTap}
          onKeyDown={(e) => e.key === "Enter" && like()}
          aria-label="Double tap to like"
          className="relative mx-4 mb-3 overflow-hidden rounded-2xl bg-muted select-none"
        >
          {post.kind === "video" || post.kind === "reel" ? (
            <video
              src={image}
              poster={mediaUrl(post.thumbnailUrl)}
              controls
              playsInline
              className={cn(
                "w-full bg-black object-contain",
                post.kind === "reel" ? "aspect-9/16 max-h-[560px]" : "max-h-[520px]",
              )}
            />
          ) : (
            <img
              src={image}
              alt={post.body || "Post media"}
              loading="lazy"
              className="max-h-[600px] w-full object-contain"
            />
          )}

          {post.kind === "reel" && (
            <>
              <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/20" />
              <span className="glass absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold">
                <Play className="size-3 fill-current" />
                Reel
              </span>
              {post.viewsCount !== undefined && (
                <span className="glass absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums">
                  <Eye className="size-3.5" />
                  {formatCount(post.viewsCount)}
                </span>
              )}
            </>
          )}

          <AnimatePresence>
            {burst && (
              <motion.span
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 1.25, 1], opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, times: [0, 0.4, 1] }}
                className="pointer-events-none absolute inset-0 grid place-items-center"
              >
                <Heart className="size-24 fill-danger text-danger drop-shadow-2xl" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
        <ActionButton icon={Heart} label="Like" count={post.likesCount} active={post.liked} tone="danger" onClick={like} />
        <ActionButton
          icon={MessageCircle}
          label="Comments"
          count={post.commentsCount}
          onClick={() => setCommentsOpen(true)}
        />
        <ActionButton
          icon={Send}
          label="Share"
          count={post.sharesCount}
          onClick={() => {
            navigator.clipboard?.writeText(`${window.location.origin}/post/${post._id}`);
            toast.success("Link copied");
          }}
        />
        <div className="ml-auto">
          <ActionButton
            icon={Bookmark}
            label="Save"
            active={post.bookmarked}
            onClick={() => {
              toggleBookmark.mutate(post._id);
              toast.success(post.bookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
            }}
          />
        </div>
      </div>

      <CommentsDrawer post={post} open={commentsOpen} onOpenChange={setCommentsOpen} />
    </motion.article>
  );
}

function CommentsDrawer({
  post,
  open,
  onOpenChange,
}: {
  post: FeedPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useComments(open ? post._id : "");
  const createComment = useCreateComment(post._id);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);

  function submit() {
    if (!draft.trim()) return;
    createComment.mutate(
      { body: draft.trim(), parent: replyTo?.id },
      {
        onSuccess: () => {
          setDraft("");
          setReplyTo(null);
        },
        onError: (err: any) => toast.error(err.message || "Couldn't post your comment"),
      },
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Comments</DrawerTitle>
          <DrawerDescription>
            {formatCount(post.commentsCount)} on {post.author.name}&apos;s post
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 overflow-y-auto px-4 pb-3">
          {isLoading && <p className="py-6 text-center text-sm text-muted-foreground">Loading comments…</p>}
          {!isLoading && data?.comments.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Be the first to comment.</p>
          )}
          {data?.comments.map((comment) => (
            <CommentRow
              key={comment._id}
              comment={comment}
              postId={post._id}
              onReply={(id, name) => setReplyTo({ id, name })}
            />
          ))}
        </div>
        <div className="border-t border-border p-4">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              Replying to <span className="font-semibold">{replyTo.name}</span>
              <button type="button" className="text-primary hover:underline" onClick={() => setReplyTo(null)}>
                Cancel
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Add a comment…"
              className="h-11 flex-1 rounded-full border border-border bg-elevated px-4 text-sm outline-none focus:border-ring"
            />
            <Button size="sm" variant="brand" onClick={submit} disabled={!draft.trim() || createComment.isPending}>
              Post
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
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
    <div className={cn("flex items-start gap-3", depth > 0 && "ml-8 mt-3")}>
      <GAvatar user={toDisplayUser(comment.author)} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/85">{comment.body}</p>
        <div className="mt-1 flex gap-3 text-xs font-semibold text-muted-foreground">
          <button
            type="button"
            className={cn("hover:text-danger", comment.liked && "text-danger")}
            onClick={() => toggleLike.mutate(comment._id)}
          >
            {formatCount(comment.likesCount)} likes
          </button>
          <button type="button" className="hover:text-primary" onClick={() => onReply(comment._id, comment.author.name)}>
            Reply
          </button>
        </div>
        {comment.replies?.map((reply) => (
          <CommentRow key={reply._id} comment={reply} postId={postId} onReply={onReply} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}
