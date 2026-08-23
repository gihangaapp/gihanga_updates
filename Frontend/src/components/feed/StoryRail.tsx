import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { openCreate } from "@/components/feed/CreateSheet";
import { StoryViewer } from "@/components/feed/StoryViewer";
import { GAvatar } from "@/components/common/GAvatar";
import { useStories } from "@/hooks/use-stories";
import { useSessionUser } from "@/components/auth/AccountMenu";
import { cn } from "@/lib/utils";

export function StoryRail() {
  const { user: me } = useSessionUser();
  const { data } = useStories();
  const railRef = useRef<HTMLDivElement>(null);
  const [viewing, setViewing] = useState<number | null>(null);

  if (!me) return null;

  const groups = data?.stories ?? [];
  const myGroupIndex = groups.findIndex((g) => g.author.username === me.username);
  const others = groups.filter((_, i) => i !== myGroupIndex);

  return (
    <section aria-label="Stories" className="surface-card mb-4 p-3">
      <div
        ref={railRef}
        className="flex gap-4 overflow-x-auto pb-1 no-scrollbar"
        style={{ scrollSnapType: "x proximity" }}
      >
        <button
          type="button"
          onClick={() => (myGroupIndex >= 0 ? setViewing(myGroupIndex) : openCreate("story"))}
          className="press flex w-[72px] shrink-0 flex-col items-center gap-1.5"
          style={{ scrollSnapAlign: "start" }}
        >
          <span className="relative">
            <GAvatar
              user={me}
              size="lg"
              ring={myGroupIndex >= 0 ? (groups[myGroupIndex]?.seen ? "seen" : "story") : "add"}
            />
            <span
              role="button"
              aria-label="Add to your story"
              onClick={(e) => {
                e.stopPropagation();
                openCreate("story");
              }}
              className="gradient-brand absolute -right-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full ring-3 ring-card"
            >
              <Plus className="size-3.5 text-primary-foreground" strokeWidth={3.5} />
            </span>
          </span>
          <span className="w-full truncate text-center text-[11px] font-semibold">Your story</span>
        </button>

        {others.map((group) => (
          <button
            key={group.author.username}
            type="button"
            onClick={() => setViewing(groups.findIndex((g) => g.author.username === group.author.username))}
            className="press flex w-[72px] shrink-0 flex-col items-center gap-1.5"
            style={{ scrollSnapAlign: "start" }}
          >
            <span className="relative">
              <GAvatar
                user={{
                  id: group.author._id,
                  name: group.author.name,
                  username: group.author.username,
                  bio: "",
                  avatarHue: group.author.avatarHue,
                  avatarUrl: group.author.avatarUrl,
                  verified: group.author.verified,
                  creator: group.author.isCreator,
                  live: group.author.isLive,
                  followers: 0,
                  following: 0,
                  posts: 0,
                }}
                size="lg"
                ring={group.author.isLive ? "live" : group.seen ? "seen" : "story"}
              />
              {group.author.isLive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-md bg-danger px-1.5 py-px text-[9px] font-bold tracking-wide text-danger-foreground">
                  LIVE
                </span>
              )}
            </span>
            <span
              className={cn(
                "w-full truncate text-center text-[11px]",
                group.seen ? "text-muted-foreground" : "font-semibold",
              )}
            >
              {group.author.username}
            </span>
          </button>
        ))}
      </div>
      {viewing !== null && (
        <StoryViewer groups={groups} startIndex={viewing} onClose={() => setViewing(null)} />
      )}
    </section>
  );
}
