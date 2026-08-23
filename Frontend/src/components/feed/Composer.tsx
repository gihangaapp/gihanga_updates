import { CalendarClock, Image, MapPin, Radio, Video } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { useSessionUser } from "@/components/auth/AccountMenu";
import { openCreate, type CreateMode } from "@/components/feed/CreateSheet";

const actions: { label: string; icon: typeof Image; tone: string; mode?: CreateMode; to?: string }[] = [
  { label: "Photo", icon: Image, tone: "text-info", mode: "post" },
  { label: "Video", icon: Video, tone: "text-accent", mode: "reel" },
  { label: "Go live", icon: Radio, tone: "text-danger", to: "/live" },
  { label: "Schedule", icon: CalendarClock, tone: "text-warning", mode: "post" },
  { label: "Place", icon: MapPin, tone: "text-success", mode: "post" },
];

export function Composer() {
  const navigate = useNavigate();
  const { user } = useSessionUser();
  if (!user) return null;

  return (
    <section className="surface-card mb-4 p-4">
      <div className="flex items-start gap-3">
        <GAvatar user={user} size="md" />
        <button
          type="button"
          onClick={() => openCreate("post")}
          className="press h-11 min-w-0 flex-1 rounded-2xl bg-elevated px-4 text-left text-sm text-muted-foreground hover:bg-muted"
        >
          What&apos;s the update, {user.name.split(" ")[0]}?
        </button>
        <Button variant="brand" className="hidden sm:inline-flex" onClick={() => openCreate("post")}>
          Post
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-1 overflow-x-auto border-t border-border pt-3 no-scrollbar">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => (a.to ? navigate({ to: a.to }) : openCreate(a.mode ?? "post"))}
            className="press flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-muted-foreground hover:bg-muted"
          >
            <a.icon className={`size-4 ${a.tone}`} />
            {a.label}
          </button>
        ))}
      </div>
    </section>
  );
}
