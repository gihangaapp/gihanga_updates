import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/feed/PostCard";
import { Button } from "@/components/ui/button";
import { useSinglePost } from "@/hooks/use-posts";

export const Route = createFileRoute("/post/$postId")({
  head: () => ({
    meta: [
      { title: "Post — Gihanga Updates" },
      { name: "description", content: "View post and comments on Gihanga Updates." },
    ],
  }),
  component: PostDetailPage,
});

function PostDetailPage() {
  const { postId } = Route.useParams();
  const { data, isLoading, isError } = useSinglePost(postId);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[620px] space-y-4 pb-12">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold">
            <Link to="/">
              <ArrowLeft className="size-4 mr-1.5" /> Back
            </Link>
          </Button>
          <h1 className="font-display text-lg font-extrabold tracking-tight text-foreground">
            Post
          </h1>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" /> Loading post…
          </div>
        )}

        {isError || (!isLoading && !data?.post) ? (
          <div className="surface-card rounded-3xl p-10 text-center text-muted-foreground border border-border space-y-3">
            <p className="text-sm font-semibold">This post isn't available anymore.</p>
            <Button variant="brand" size="sm" asChild>
              <Link to="/">Go back home</Link>
            </Button>
          </div>
        ) : null}

        {data?.post && (
          <div className="pt-2">
            <PostCard post={data.post} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
