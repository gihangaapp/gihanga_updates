import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Circle, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useStaffNotifications, useMarkStaffNotificationsRead, useOnlineDot } from "@/hooks/use-staff-notifications";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StaffTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggle } = useTheme();
  const { data } = useStaffNotifications();
  const markRead = useMarkStaffNotificationsRead();
  const online = useOnlineDot();
  const [bellOpen, setBellOpen] = useState(false);

  const unread = data?.unreadCount ?? 0;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="press grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <span
          className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
          title={online ? "Real-time connected" : "Reconnecting…"}
        >
          <Circle className={cn("size-2 fill-current", online ? "text-success" : "text-warning animate-pulse")} />
          {online ? "Live" : "Connecting"}
        </span>

        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggle}
          className="press grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
        >
          {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </button>

        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setBellOpen((v) => !v)}
            className="press relative grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
          >
            <Bell className="size-4.5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-bold text-danger-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-11 right-0 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-bold text-foreground">Notifications</p>
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={() => markRead.mutate()}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {!data?.notifications.length && (
                      <p className="p-6 text-center text-xs text-muted-foreground">No notifications yet.</p>
                    )}
                    {data?.notifications.map((n) => (
                      <div
                        key={n._id}
                        className={cn("border-b border-border/60 px-4 py-3 text-sm last:border-0", !n.read && "bg-primary-soft/40")}
                      >
                        <p className="text-foreground/90">{n.text}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)} ago</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
