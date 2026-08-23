import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Grid3x3, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { GAvatar, UserName } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { mediaUrl, type FeedPost } from "@/lib/api-client";
import { useBookmarkedPosts, useToggleBookmark } from "@/hooks/use-posts";
import { formatCount, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmarks — Your Saved Gihanga Posts" },
      {
        name: "description",
        content: "Everything you saved on Gihanga, kept in one private collection you can revisit anytime.",
      },
      { property: "og:title", content: "Bookmarks — Your Saved Gihanga Posts" },
      { property: "og:description", content: "Your private collection of saved Gihanga posts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookmarksPage,
});

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
    followers: 0,
    following: 0,
    posts: 0,
  };
}

function BookmarksPage() {
  const [view, setView] = useState<"list" | "grid">("list");
  const { data, isLoading } = useBookmarkedPosts();
  const toggleBookmark = useToggleBookmark();
  const items = data?.posts ?? [];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[680px]">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Saved</h1>
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
            {items.length}
          </span>
          <div className="glass ml-auto flex gap-1 rounded-xl border p-1">
            {(["list", "grid"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-label={`${v} view`}
                onClick={() => setView(v)}
                className={cn(
                  "press grid size-8 place-items-center rounded-lg",
                  view === v ? "bg-primary-soft text-primary" : "text-muted-foreground",
                )}
              >
                {v === "list" ? <Bookmark className="size-4" /> : <Grid3x3 className="size-4" />}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="p-10 text-center text-sm text-muted-foreground">Loading your saved posts…</p>
        ) : !items.length ? (
          <div className="surface-card flex flex-col items-center gap-3 p-12 text-center">
            <ImageOff className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nothing saved yet. Tap the bookmark icon on any post.
            </p>
            <Button variant="brand" asChild>
              <Link to="/explore">Explore posts</Link>
            </Button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((p) => {
              const image = mediaUrl(p.mediaUrl);
              return (
                <div key={p._id} className="relative aspect-square overflow-hidden rounded-2xl bg-elevated">
                  {image ? (
                    <img src={image} alt={p.body.slice(0, 60)} loading="lazy" className="size-full object-cover" />
                  ) : (
                    <p className="p-3 text-xs leading-snug">{p.body}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((p) => {
              const image = mediaUrl(p.mediaUrl);
              return (
                <li key={p._id} className="surface-card lift flex gap-3 p-3">
                  {image ? (
                    <img
                      src={image}
                      alt={p.body.slice(0, 60)}
                      loading="lazy"
                      className="size-20 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="gradient-brand grid size-20 shrink-0 place-items-center rounded-xl font-display text-lg font-bold text-primary-foreground">
                      G
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/profile/$username"
                      params={{ username: p.author.username }}
                      className="press flex items-center gap-2"
                    >
                      <GAvatar user={toDisplayUser(p.author)} size="xs" />
                      <UserName user={toDisplayUser(p.author)} className="text-xs" />
                      <span className="text-xs text-muted-foreground">· {timeAgo(p.createdAt)}</span>
                    </Link>
                    <p className="mt-1 line-clamp-2 text-sm leading-snug">{p.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatCount(p.likesCount)} likes · {formatCount(p.commentsCount)} comments
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove from saved"
                    onClick={() => {
                      toggleBookmark.mutate(p._id);
                      toast.success("Removed from saved");
                    }}
                    className="press h-fit rounded-full p-2 text-primary hover:bg-muted"
                  >
                    <Bookmark className="size-5 fill-primary" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
