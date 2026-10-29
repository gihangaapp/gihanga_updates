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

  // Story mode renders as its own full-screen section (see below) instead of
  // the Dialog/Drawer shell. Lock body scroll behind it so the page cannot
  // scroll while the story creator is open.
  useEffect(() => {
    if (s.open && mode === "story") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [s.open, mode]);

  if (!s.open) return null;

  const modeTabs = [
    { id: "post" as const, label: "Post", icon: Sparkles },
    { id: "reel" as const, label: "Reel", icon: Video },
    { id: "story" as const, label: "Story", icon: Radio },
  ];

  const content = (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden bg-background">
      {/* Mode Selector Tab Bar */}
      {mode !== "story" && (
        <div className="flex shrink-0 items-center justify-center gap-1 border-b border-border bg-surface p-1.5 sm:p-2">
          {modeTabs.map((t) => {
            const Icon = t.icon;
            const isActive = mode === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                className={cn(
                  "press flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all sm:flex-none sm:px-4",
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
          mode === "story" ? "overflow-hidden" : "overflow-x-hidden overflow-y-auto no-scrollbar",
        )}
      >
        {mode === "post" && <PostCreator onClose={closeCreate} />}
        {mode === "reel" && <ReelCreator onClose={closeCreate} />}
        {mode === "story" && <StoryCreator onClose={closeCreate} />}
      </div>
    </div>
  );

  // STORY MODE — a true full-screen SECTION, not a modal. No rounded sheet,
  // no vaul drag handle, no drag-to-close: the user closes it explicitly
  // with the ✕ button, and closing simply returns to whatever page they
  // were on before opening the creator (no navigation anywhere).
  if (mode === "story") {
    return (
      <div className="fixed inset-0 z-[70] overflow-hidden bg-slate-950">
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-950">
          {content}
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <Drawer open={s.open} onOpenChange={(o) => (!o ? closeCreate() : null)}>
        {/* B3 — dvh (not vh) so mobile browser chrome doesn't clip the
            creator. */}
        <DrawerContent
          className={cn(
            "left-0 right-0 w-full max-w-none p-0 overflow-hidden border-none",
            "h-[96dvh] max-h-[96dvh] rounded-t-3xl",
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
          max-height: the shell renders at full size immediately. */}
      <DialogContent className="h-[min(92dvh,900px)] max-h-[min(92dvh,900px)] w-[calc(100vw-1rem)] max-w-[760px] overflow-hidden p-0 gap-0 rounded-3xl border-border">
        <DialogHeader className="sr-only">
          <DialogTitle>Content Creator</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
