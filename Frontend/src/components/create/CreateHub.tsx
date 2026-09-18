import { useEffect, useState, useSyncExternalStore } from "react";
import { Film, Radio, Sparkles, Video } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { PostCreator } from "./post/PostCreator";
import { ReelCreator } from "./reel/ReelCreator";
import { StoryCreator } from "./story/StoryCreator";
import { cn } from "@/lib/utils";

export type CreateMode = "post" | "reel" | "story";

interface CreateState {
  open: boolean;
  mode: CreateMode;
}

let state: CreateState = { open: false, mode: "post" };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const snapshot = () => state;

export function openCreate(mode: CreateMode = "post") {
  state = { open: true, mode };
  emit();
}

export function closeCreate() {
  state = { ...state, open: false };
  emit();
}

export function CreateHost() {
  const s = useSyncExternalStore(subscribe, snapshot, snapshot);
  const isMobile = useIsMobile();

  const [mode, setMode] = useState<CreateMode>("post");

  useEffect(() => {
    if (s.open) {
      setMode(s.mode);
    }
  }, [s.open, s.mode]);

  if (!s.open) return null;

  const modeTabs = [
    { id: "post" as const, label: "Post", icon: Sparkles },
    { id: "reel" as const, label: "Reel", icon: Video },
    { id: "story" as const, label: "Story", icon: Radio },
  ];

  const content = (
    <div className="flex flex-col min-h-0 h-full w-full bg-background">
      {/* Mode Selector Tab Bar */}
      {mode !== "story" && (
        <div className="flex shrink-0 items-center justify-center gap-1 border-b border-border bg-surface p-2">
          {modeTabs.map((t) => {
            const Icon = t.icon;
            const isActive = mode === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                className={cn(
                  "press flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                  isActive
                    ? "bg-primary-soft text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Creator Body — scrollable for post/reel; full-bleed (no scroll)
          for story so the camera area gets the entire definite height. */}
      <div
        className={cn(
          "flex-1 min-h-0",
          mode === "story" ? "overflow-hidden" : "overflow-y-auto no-scrollbar",
        )}
      >
        {mode === "post" && <PostCreator onClose={closeCreate} />}
        {mode === "reel" && <ReelCreator onClose={closeCreate} />}
        {mode === "story" && <StoryCreator onClose={closeCreate} />}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={s.open} onOpenChange={(o) => (!o ? closeCreate() : null)}>
        {/* B3 — dvh (not vh) so mobile browser chrome doesn't clip the
            creator; the story mode is full-bleed and safe-area aware. */}
        <DrawerContent
          className={cn(
            "p-0 overflow-hidden border-none",
            mode === "story"
              ? "h-[100dvh] max-h-[100dvh] rounded-none pb-[env(safe-area-inset-bottom)]"
              : "h-[96dvh] max-h-[96dvh] rounded-t-3xl",
          )}
        >
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={s.open} onOpenChange={(o) => (!o ? closeCreate() : null)}>
      {/* B3 — a DEFINITE height (min(92dvh, 900px)) instead of a bare
          max-height: the story shell renders at full size immediately, with
          the camera fading in on top — zero layout jump. */}
      <DialogContent className="h-[min(92dvh,900px)] max-h-[min(92dvh,900px)] max-w-[760px] overflow-hidden p-0 gap-0 rounded-3xl border-border">
        <DialogHeader className="sr-only">
          <DialogTitle>Content Creator</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
