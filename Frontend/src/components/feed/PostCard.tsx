import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSubmitNotInterested, logRecommendationEvent } from "@/hooks/use-recommendations";
import {
  Bookmark,
  EyeOff,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trash2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { GAvatar, VerifiedBadge } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCount, timeAgo } from "@/lib/format";
import { FeedPost } from "@/lib/api-client";
import { useToggleLike, useToggleBookmark, useDeletePost } from "@/hooks/use-posts";
import { useFollowUser, useFollowingSet } from "@/hooks/use-social";
import { useAuth } from "@/lib/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { PostMediaCarousel } from "@/components/viewing/PostMediaCarousel";
import { CommentSheet, InlineComments } from "@/components/viewing/CommentSheet";
import { ShareSheet } from "@/components/viewing/ShareSheet";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();
  const submitNotInterested = useSubmitNotInterested();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [inlineCommentsOpen, setInlineCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();
  const deletePost = useDeletePost();
  const followUser = useFollowUser();
  const { data: followingSet } = useFollowingSet();

  const isOwnPost = user?.username === post.author.username;
  const following = followingSet?.has(post.author.username) ?? post.followingAuthor;

  const handleLike = useCallback(() => {
    logRecommendationEvent({
      event: post.liked ? "post_unlike" : "post_like",
      targetKind: post.kind === "reel" ? "reel" : "post",
      targetId: post._id,
      creatorId: String(post.author._id ?? post.author),
      tags: post.tags,
    });
    toggleLike.mutate(post._id);
  }, [toggleLike, post._id, post.liked, post.kind, post.author, post.tags]);

  const handleCommentClick = () => {
    if (isMobile) {
      setCommentsOpen(true);
    } else {
      setInlineCommentsOpen((prev) => !prev);
    }
  };

  const maxCharLimit = 160;
  const isLongCaption = post.body && post.body.length > maxCharLimit;
  const displayCaption =
    isLongCaption && !isExpanded ? `${post.body.slice(0, maxCharLimit)}…` : post.body;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index, 4) * 0.04 }}
      className="surface-card mb-4 overflow-hidden border border-border bg-card shadow-soft"
    >
      {/* Header */}
      <header className="flex items-center gap-3 p-4 pb-3">
        <Link to="/profile/$username" params={{ username: post.author.username }} className="press">
          <GAvatar
            user={toDisplayUser(post.author)}
            size="md"
            ring={post.author.isLive ? "live" : "none"}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <Link
              to="/profile/$username"
              params={{ username: post.author.username }}
              className="truncate text-[15px] font-bold hover:underline"
            >
              {post.author.name}
            </Link>
            {post.author.verified && <VerifiedBadge />}
            {post.author.isCreator && (
              <span className="shrink-0 rounded-md bg-primary-soft px-1.5 py-px text-[10px] font-bold tracking-wide text-primary uppercase">
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
                <MapPin className="size-3 shrink-0 text-success" />
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
                {
                  onError: (err: any) =>
                    toast.error(err.message || "Couldn't update follow status"),
                },
              )
            }
          >
            {following ? "Following" : "Follow"}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Post options">
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => toggleBookmark.mutate(post._id)}>
              <Bookmark className="size-4" />
              {post.bookmarked ? "Remove from saved" : "Save post"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShareOpen(true)}>
              <Share2 className="size-4" />
              Share post
            </DropdownMenuItem>
            {!isOwnPost && (
              <DropdownMenuItem
                onClick={() => {
                  submitNotInterested.mutate(
                    { contentId: post._id, reason: "not_interested" },
                    {
                      onSuccess: () =>
                        toast.success("Recorded. We will show less content like this."),
                    },
                  );
                }}
              >
                <EyeOff className="size-4 text-muted-foreground" />
                Not interested
              </DropdownMenuItem>
            )}
            {isOwnPost ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-danger focus:bg-danger/10 focus:text-danger"
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
                  className="text-danger focus:bg-danger/10 focus:text-danger"
                  onClick={() => toast.success("Report sent to moderation team")}
                >
                  Report
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Caption Body */}
      {post.body && (
        <div className="px-4 pb-3">
          <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {displayCaption}
            {isLongCaption && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="ml-1 text-xs font-bold text-primary hover:underline"
              >
                {isExpanded ? "Show less" : "more"}
              </button>
            )}
          </p>
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

      {/* Media Player / Carousel — B1: pass the persisted media geometry so
          the stage reserves the image's true height (no crop, zero CLS). */}
      <PostMediaCarousel
        mediaUrlString={post.mediaUrl}
        thumbnailUrl={post.thumbnailUrl}
        blurDataUrl={post.blurDataUrl}
        aspectRatio={post.aspectRatio}
        mediaItems={post.media}
        kind={post.kind}
        body={post.body}
        liked={post.liked}
        onDoubleTapLike={handleLike}
        priority={index < 2}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between border-t border-border px-3 py-1.5">
        <div className="flex items-center gap-1">
          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            aria-label="Like post"
            aria-pressed={post.liked}
            className={cn(
              "press flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors",
              post.liked ? "text-danger bg-danger/10" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <motion.span whileTap={{ scale: 1.4 }}>
              <Heart className={cn("size-4", post.liked && "fill-current")} />
            </motion.span>
            <span className="tabular-nums">{formatCount(post.likesCount)}</span>
          </button>

          {/* Comment */}
          <button
            type="button"
            onClick={handleCommentClick}
            aria-label="Comment"
            className={cn(
              "press flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors",
              inlineCommentsOpen
                ? "text-primary bg-primary-soft"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <MessageCircle className="size-4" />
            <span className="tabular-nums">{formatCount(post.commentsCount)}</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label="Share"
            className="press flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Share2 className="size-4" />
            {post.sharesCount > 0 && (
              <span className="tabular-nums">{formatCount(post.sharesCount)}</span>
            )}
          </button>
        </div>

        {/* Save / Bookmark */}
        <button
          type="button"
          onClick={() => {
            toggleBookmark.mutate(post._id);
            toast.success(post.bookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
          }}
          aria-label="Save post"
          aria-pressed={post.bookmarked}
          className={cn(
            "press flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors",
            post.bookmarked
              ? "text-primary bg-primary-soft font-bold"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          <Bookmark className={cn("size-4", post.bookmarked && "fill-current")} />
        </button>
      </div>

      {/* Desktop Instagram-style Inline Hide/Show Comments Layout */}
      {inlineCommentsOpen && !isMobile && <InlineComments post={post} />}

      {/* Mobile Drawer Comments Sheet */}
      {isMobile && <CommentSheet post={post} open={commentsOpen} onOpenChange={setCommentsOpen} />}

      {/* Integrated Share Sheet */}
      <ShareSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={`Post by @${post.author.username} on Gihanga Updates`}
        text={post.body}
        url={`${typeof window !== "undefined" ? window.location.origin : ""}/post/${post._id}`}
      />
    </motion.article>
  );
}
