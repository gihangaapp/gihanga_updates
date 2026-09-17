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
        <div className="flex items-center justify-center gap-1 border-b border-border bg-surface p-2">
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
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Creator Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {mode === "post" && <PostCreator onClose={closeCreate} />}
        {mode === "reel" && <ReelCreator onClose={closeCreate} />}
        {mode === "story" && <StoryCreator onClose={closeCreate} />}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={s.open} onOpenChange={(o) => (!o ? closeCreate() : null)}>
        <DrawerContent className={cn("p-0 overflow-hidden border-none", mode === "story" ? "h-[100vh] max-h-[100vh] rounded-none" : "h-[96vh] max-h-[96vh] rounded-t-3xl")}>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={s.open} onOpenChange={(o) => (!o ? closeCreate() : null)}>
      <DialogContent className="max-h-[92vh] max-w-[760px] overflow-hidden p-0 gap-0 rounded-3xl border-border">
        <DialogHeader className="sr-only">
          <DialogTitle>Content Creator</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
