import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Home } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page Not Found — Gihanga Updates" },
      {
        name: "description",
        content: "This Gihanga page has moved or never existed. Head back to the feed or explore what's trending.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Page Not Found — Gihanga Updates" },
      { property: "og:description", content: "This page has moved. Jump back into the feed." },
    ],
  }),
  component: CatchAllPage,
});

function CatchAllPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="surface-card animate-fade-up flex max-w-md flex-col items-center gap-4 p-10 text-center">
        <Logo />
        <p className="font-display text-6xl font-extrabold tracking-tight text-primary">404</p>
        <h1 className="font-display text-xl font-bold">This page slipped off the feed</h1>
        <p className="text-sm text-muted-foreground">
          The link is broken or the post was removed. Everything else is still right here.
        </p>
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          <Button variant="brand" asChild>
            <Link to="/">
              <Home className="size-4" />
              Back to feed
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/explore">
              <Compass className="size-4" />
              Explore
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
