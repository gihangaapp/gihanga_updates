import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, ImageIcon, Search as SearchIcon, Users, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  CategoryChips,
  EmptyState,
  InfiniteSentinel,
  PostCard,
  PostGrid,
  PostGridSkeleton,
  SectionHeader,
  UserCard,
  UserGridSkeleton,
  filterByCategory,
  type PostCategory,
} from "@/components/explore/shared";
import { useSearch } from "@/hooks/use-search";
import { useExplore } from "@/hooks/use-posts";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Creators & Posts | Gihanga" },
      {
        name: "description",
        content: "Search creators, accounts and posts on Gihanga.",
      },
      { property: "og:title", content: "Search — Creators & Posts | Gihanga" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SearchPage,
});

export function SearchPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState<PostCategory>("all");
  const [visibleUsers, setVisibleUsers] = useState(12);

  const term = q.trim();

  // Search input is focused and ready to type as soon as the page opens
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(term), 250);
    return () => window.clearTimeout(timer);
  }, [term]);

  const search = useSearch(debounced);
  const searching = Boolean(term);
  const searchPending = searching && (term !== debounced || search.isLoading || search.isFetching);

  // Default view (no search term): browse posts
  const explore = useExplore();
  const explorePosts = filterByCategory(explore.data?.pages.flatMap((p) => p.posts) ?? [], category);

  // Searching view
  const users = searching && !searchPending ? (search.data?.users ?? []) : [];
  const matchedPosts = filterByCategory(
    searching && !searchPending ? (search.data?.posts ?? []) : [],
    category,
  );

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1000px] space-y-5 pb-12">
        {/* Search bar */}
        <div className="surface-card relative flex items-center gap-3 rounded-2xl border border-border p-2 pl-4 shadow-soft transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
          <SearchIcon className="size-5 shrink-0 text-primary" />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setVisibleUsers(12);
            }}
            placeholder="Search creators, accounts or posts…"
            aria-label="Search creators, accounts and posts"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                inputRef.current?.focus();
              }}
              className="press mr-2 grid size-7 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Categories */}
        <CategoryChips value={category} onChange={setCategory} />

        {searching ? (
          <>
            {/* Creators & accounts */}
            <section className="space-y-3.5">
              <SectionHeader
                icon={Users}
                title={
                  searchPending
                    ? "Searching creators…"
                    : search.isError
                      ? "Search couldn’t be completed"
                      : `Creators & accounts (${users.length})`
                }
              />
              {searchPending ? (
                <UserGridSkeleton count={3} />
              ) : users.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {users.slice(0, visibleUsers).map((u) => (
                      <UserCard key={u._id} u={u} />
                    ))}
                  </div>
                  {users.length > visibleUsers && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleUsers((n) => n + 12)}
                        className="press rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold hover:bg-muted"
                      >
                        Show more ({users.length - visibleUsers} remaining)
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState icon={Users}>
                  {search.isError
                    ? "Search couldn’t be completed. Check your connection and try again."
                    : `No creator or user accounts match “${term}”.`}
                </EmptyState>
              )}
            </section>

            {/* Posts mentioning the searched words */}
            <section className="space-y-3.5">
              <SectionHeader
                icon={FileText}
                title={
                  searchPending ? "Searching posts…" : `Posts matching “${term}”`
                }
              />
              <PostGrid>
                {searchPending && <PostGridSkeleton count={8} />}
                {matchedPosts.map((post, i) => (
                  <PostCard key={post._id} post={post} index={i} />
                ))}
                {!searchPending && !matchedPosts.length && (
                  <div className="col-span-full">
                    <EmptyState icon={ImageIcon}>
                      {category === "all"
                        ? `No posts mention “${term}”.`
                        : `No ${category} posts match “${term}”.`}
                    </EmptyState>
                  </div>
                )}
              </PostGrid>
            </section>
          </>
        ) : (
          <>
            {/* Default: posts only */}
            <PostGrid>
              {explorePosts.map((post, i) => (
                <PostCard key={post._id} post={post} index={i} />
              ))}
              {(explore.isLoading || explore.isFetchingNextPage) && (
                <PostGridSkeleton count={explore.isLoading ? 12 : 4} />
              )}
              {!explore.isLoading && !explorePosts.length && (
                <div className="col-span-full">
                  <EmptyState icon={ImageIcon}>
                    {explore.isError
                      ? "Couldn’t load posts right now. Check your connection and refresh."
                      : category === "all"
                        ? "No posts available yet."
                        : `No ${category} posts yet.`}
                  </EmptyState>
                </div>
              )}
            </PostGrid>
            <InfiniteSentinel
              disabled={!explore.hasNextPage || explore.isFetchingNextPage}
              onVisible={() => explore.fetchNextPage()}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
