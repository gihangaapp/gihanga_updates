import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Heart,
  ImageIcon,
  Layers,
  Play,
  Sparkles,
  TrendingUp,
  Type,
  UserCheck,
  UserPlus,
  Video,
  Film,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { GAvatar, VerifiedBadge } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/format";
import { mediaUrl, type FeedPost, type PublicUser } from "@/lib/api-client";
import { useFollowUser, useFollowingSet } from "@/hooks/use-social";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

/* ───────────────────────── helpers ───────────────────────── */

export function toDisplayUser(u: {
  _id: string;
  name: string;
  username: string;
  avatarHue?: number;
  avatarUrl?: string | null;
  verified?: boolean;
  isCreator?: boolean;
  isLive?: boolean;
  bio?: string;
  followersCount?: number;
}) {
  return {
    id: u._id,
    name: u.name,
    username: u.username,
    bio: u.bio || "",
    avatarHue: u.avatarHue ?? 0,
    avatarUrl: u.avatarUrl || null,
    verified: Boolean(u.verified),
    creator: Boolean(u.isCreator),
    live: Boolean(u.isLive),
    followers: u.followersCount ?? 0,
    following: 0,
    posts: 0,
  };
}

/* ───────────────────────── categories ───────────────────────── */

export type PostCategory = "all" | "photo" | "video" | "reel" | "text";

const CATEGORIES: { id: PostCategory; label: string; icon: LucideIcon }[] = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "photo", label: "Photos", icon: ImageIcon },
  { id: "video", label: "Videos", icon: Video },
  { id: "reel", label: "Reels", icon: Film },
  { id: "text", label: "Text", icon: Type },
];

export function filterByCategory<T extends { kind: string }>(posts: T[], category: PostCategory) {
  return category === "all" ? posts : posts.filter((p) => p.kind === category);
}

export function CategoryChips({
  value,
  onChange,
}: {
  value: PostCategory;
  onChange: (next: PostCategory) => void;
}) {
  return (
    <div
      className="-mx-3 flex items-center gap-1.5 overflow-x-auto px-3 pb-1 no-scrollbar sm:mx-0 sm:px-0"
      role="tablist"
      aria-label="Post categories"
    >
      {CATEGORIES.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(c.id)}
            className={cn(
              "press relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm",
              active
                ? "bg-primary text-primary-foreground shadow-md"
                : "border border-border/60 bg-surface text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <c.icon className="size-4" />
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── layout bits ───────────────────────── */

export function SectionHeader({
  icon: Icon,
  iconClass,
  title,
  badge,
  right,
}: {
  icon: LucideIcon;
  iconClass?: string;
  title: string;
  badge?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className={cn("size-4.5 shrink-0 text-primary", iconClass)} />
        <h2 className="truncate font-display text-base font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
        {badge}
      </div>
      {right}
    </div>
  );
}

export function EmptyState({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="surface-card rounded-2xl p-8 text-center text-muted-foreground">
      <Icon className="mx-auto mb-2 size-8 text-muted-foreground/50" />
      <p className="text-sm font-semibold">{children}</p>
    </div>
  );
}

/** Calls onVisible when the sentinel scrolls near the viewport (lazy / infinite loading). */
export function InfiniteSentinel({
  onVisible,
  disabled,
}: {
  onVisible: () => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onVisible);
  cb.current = onVisible;
  useEffect(() => {
    const el = ref.current;
    if (!el || disabled || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) cb.current();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [disabled]);
  return <div ref={ref} aria-hidden className="h-1 w-full" />;
}

/* ───────────────────────── post cards ───────────────────────── */

export function PostGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">{children}</div>;
}

export function PostGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={`post-skeleton-${i}`}
          className="shimmer aspect-[3/4] rounded-2xl bg-muted"
          aria-hidden="true"
        />
      ))}
    </>
  );
}

export function PostCard({ post, index = 0 }: { post: FeedPost; index?: number }) {
  const isVideo = post.kind === "video" || post.kind === "reel";
  const first = post.media?.[0];
  const thumb = mediaUrl(post.thumbnailUrl);
  const mainSrc = mediaUrl(first?.url) || mediaUrl(post.mediaUrl);
  const imageSrc = isVideo ? thumb : mainSrc || thumb;
  const multi = (post.media?.length ?? 0) > 1 || (post.mediaUrl?.includes(",") ?? false);
  const isText = post.kind === "text" || (!mainSrc && !thumb);

  return (
    <Link
      to="/post/$postId"
      params={{ postId: post._id }}
      className="press group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-soft"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      {isText ? (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/25 via-surface to-primary-soft p-4 pt-12">
          <p className="line-clamp-6 text-center text-sm font-semibold leading-snug text-foreground">
            {post.body || "Post"}
          </p>
        </div>
      ) : isVideo && !imageSrc ? (
        <video
          src={mainSrc}
          muted
          playsInline
          preload="metadata"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <img
          src={imageSrc}
          alt={post.body ? post.body.slice(0, 40) : "Post media"}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            target.parentElement?.classList.add(
              "bg-gradient-to-tr",
              "from-slate-900",
              "to-slate-800",
            );
          }}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 bg-gradient-to-b from-black/70 via-black/20 to-transparent p-2.5 text-white">
        <GAvatar user={toDisplayUser(post.author)} size="xs" />
        <span className="min-w-0 flex-1 truncate text-[11px] font-bold drop-shadow-md">
          {post.author.username}
        </span>
        {multi && <Layers className="size-3.5 shrink-0 drop-shadow-md" />}
        {isVideo && <Play className="size-3.5 shrink-0 fill-white drop-shadow-md" />}
      </div>

      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5">
        <span className="flex items-center gap-1 text-[11px] font-extrabold text-white">
          {isVideo ? (
            <>
              <Play className="size-3 fill-white" />
              {formatCount(post.viewsCount || post.likesCount || 0)}
            </>
          ) : (
            <>
              <Heart className="size-3 fill-white" />
              {formatCount(post.likesCount || 0)}
            </>
          )}
        </span>
      </span>
    </Link>
  );
}

/* ───────────────────────── creator / user cards ───────────────────────── */

export function UserGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Loading accounts"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="surface-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="shimmer size-11 shrink-0 rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="shimmer h-3.5 w-3/4 rounded-full bg-muted" />
              <div className="shimmer h-3 w-1/2 rounded-full bg-muted" />
            </div>
          </div>
          <div className="shimmer mt-4 h-3 w-full rounded-full bg-muted" />
          <div className="shimmer mt-2 h-3 w-2/3 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function UserCard({ u, className }: { u: PublicUser; className?: string }) {
  const { user: currentUser } = useAuth();
  const followUser = useFollowUser();
  const { data: followingSet } = useFollowingSet();
  const isFollowing = followingSet?.has(u.username) ?? false;
  const isSelf = currentUser?.username === u.username;

  return (
    <div
      className={cn(
        "surface-card group relative flex flex-col justify-between rounded-2xl border border-border p-4 shadow-soft transition-all duration-200 hover:border-primary/40 hover:shadow-hover",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Link
          to="/profile/$username"
          params={{ username: u.username }}
          className="flex min-w-0 items-center gap-3"
        >
          <GAvatar
            user={toDisplayUser(u)}
            size="md"
            ring={u.isLive ? "live" : u.isCreator ? "creator" : "none"}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-sm font-extrabold text-foreground transition-colors group-hover:text-primary">
                {u.name}
              </span>
              {u.verified && <VerifiedBadge />}
            </div>
            <span className="block truncate text-xs font-medium text-muted-foreground">
              @{u.username}
            </span>
          </div>
        </Link>

        {!isSelf && (
          <Button
            variant={isFollowing ? "soft" : "default"}
            size="sm"
            onClick={() => {
              followUser.mutate({ username: u.username, follow: !isFollowing });
              if (!isFollowing) toast.success(`Following @${u.username}`);
            }}
            className={cn(
              "h-8 shrink-0 rounded-xl px-3 text-xs font-extrabold transition-transform active:scale-95",
              isFollowing
                ? "bg-muted text-foreground hover:bg-muted/80"
                : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
            )}
          >
            {isFollowing ? (
              <span className="flex items-center gap-1">
                <UserCheck className="size-3.5" /> Following
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <UserPlus className="size-3.5" /> Follow
              </span>
            )}
          </Button>
        )}
      </div>

      {u.bio && (
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{u.bio}</p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-foreground">{formatCount(u.followersCount || 0)}</span>
          <span>followers</span>
        </div>
        {u.isCreator && (
          <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
            Creator
          </span>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── hashtag cards ───────────────────────── */

export function TagCard({
  tag,
  rank,
  className,
}: {
  tag: { tag: string; postsCount: number; trend?: number };
  rank: number;
  className?: string;
}) {
  return (
    <Link
      to="/tag/$tag"
      params={{ tag: tag.tag }}
      className={cn(
        "surface-card lift group flex items-center gap-3.5 rounded-2xl border border-border p-3.5 transition-all hover:border-primary/50",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl font-display text-base font-black shadow-md",
          rank === 0
            ? "bg-gradient-to-tr from-amber-500 to-yellow-400 font-extrabold text-slate-950"
            : rank === 1
              ? "bg-gradient-to-tr from-slate-300 to-slate-100 font-extrabold text-slate-950"
              : rank === 2
                ? "bg-gradient-to-tr from-amber-700 to-amber-600 font-extrabold text-white"
                : "bg-primary-soft font-bold text-primary",
        )}
      >
        #{rank + 1}
      </span>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-foreground transition-colors group-hover:text-primary">
          #{tag.tag}
        </span>
        <span className="block truncate text-xs font-medium text-muted-foreground">
          {formatCount(tag.postsCount)} posts
        </span>
      </div>
      {!!tag.trend && tag.trend > 0 && (
        <span className="flex items-center gap-1 text-xs font-bold text-success">
          <TrendingUp className="size-3.5" />
          {tag.trend}
        </span>
      )}
    </Link>
  );
}

export function TagGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`tag-skeleton-${index}`}
          className="surface-card flex items-center gap-3.5 rounded-2xl border border-border p-3.5"
          aria-hidden="true"
        >
          <div className="shimmer size-10 shrink-0 rounded-xl bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="shimmer h-3.5 w-2/3 rounded-full bg-muted" />
            <div className="shimmer h-3 w-1/3 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </>
  );
}
