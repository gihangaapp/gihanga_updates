import { Link, useRouterState } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { openCreate } from "@/components/feed/CreateSheet";
import { mobileNav, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = useUnreadNotificationCount();

  const cell = (item: NavItem, active: boolean) => {
    const badge = item.label === "Alerts" ? unread : item.badge;
    return (
    <>
      <span className="relative">
        <item.icon className="size-[22px]" strokeWidth={active ? 2.8 : 2} />
        {!!badge && (
          <span className="absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
      <span
        className={cn(
          "gradient-brand h-[3px] w-6 rounded-full transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </>
    );
  };

  const { user } = useAuth();
  const profileLink = user?.username ? `/profile/${user.username}` : "/welcome";

  return (
    <>
      <button
        type="button"
        aria-label="Create post"
        onClick={() => openCreate("post")}
        className="gradient-brand press fixed right-5 bottom-24 z-50 grid size-14 place-items-center rounded-2xl shadow-glow lg:hidden"
      >
        <Plus className="size-7 text-primary-foreground" strokeWidth={3} />
      </button>

      <nav
        aria-label="Mobile"
        className="glass fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        {mobileNav.map((item) => {
          const to = item.to === "/profile" ? profileLink : item.to;
          const active = to === pathname;
          const cls = cn(
            "press flex flex-1 flex-col items-center gap-1 rounded-xl py-1",
            active ? "text-primary" : "text-muted-foreground",
          );
          return to ? (
            <Link key={item.label} to={to} className={cls}>
              {cell(item, active)}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={() => toast(`${item.label} arrives in Phase ${item.phase ?? 3}`)}
              className={cls}
            >
              {cell(item, active)}
            </button>
          );
        })}
      </nav>
    </>
  );
}
