import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Radio, Film, User, Plus } from "lucide-react";
import { openCreate } from "@/components/create/CreateHub";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const profileLink = user?.username ? `/profile/${user.username}` : "/welcome";

  const items = [
    { label: "Home", icon: Home, to: "/" },
    { label: "Live", icon: Radio, to: "/live" },
    { label: "Reels", icon: Film, to: "/reels" },
    { label: "Profile", icon: User, to: profileLink },
  ];

  const leftItems = items.slice(0, 2);
  const rightItems = items.slice(2, 4);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden pointer-events-none">
      {/* Container for mobile navigation bar */}
      <div className="relative w-full h-[68px] pb-[env(safe-area-inset-bottom)] pointer-events-auto">
        {/* SVG Scooped Cutout Background using Gihanga Updates brand surface/card colors */}
        <svg
          className="absolute inset-0 w-full h-full text-card fill-current drop-shadow-[0_-4px_16px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_-6px_20px_rgba(0,0,0,0.45)]"
          preserveAspectRatio="none"
          viewBox="0 0 1000 160"
        >
          <path d="M 0,0 L 415,0 C 450,0 458,72 500,72 C 542,72 550,0 585,0 L 1000,0 L 1000,160 L 0,160 Z" />
        </svg>

        {/* Center Floating Create Button using Gihanga Updates Brand Gradient */}
        <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-20">
          <button
            type="button"
            aria-label="Create post"
            onClick={() => openCreate("post")}
            className="press gradient-brand flex size-[52px] items-center justify-center rounded-full text-primary-foreground shadow-glow ring-[5px] ring-card transition-all active:scale-90"
          >
            <Plus className="size-6 text-primary-foreground" strokeWidth={3} />
          </button>
        </div>

        {/* Navigation Bar Items Content Overlay */}
        <div className="relative z-10 flex h-full items-center justify-between px-3">
          {/* Left Items (Home, Live) */}
          <div className="flex flex-1 items-center justify-around pr-3">
            {leftItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1 text-center transition-colors",
                    active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon
                    className={cn("size-[22px]", active && "fill-current")}
                    strokeWidth={active ? 2.5 : 1.9}
                  />
                  <span className={cn("text-[11px] leading-none tracking-tight", active ? "font-bold" : "font-medium")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Center cutout spacer */}
          <div className="w-14 shrink-0" />

          {/* Right Items (Reels, Profile) */}
          <div className="flex flex-1 items-center justify-around pl-3">
            {rightItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1 text-center transition-colors",
                    active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon
                    className={cn("size-[22px]", active && "fill-current")}
                    strokeWidth={active ? 2.5 : 1.9}
                  />
                  <span className={cn("text-[11px] leading-none tracking-tight", active ? "font-bold" : "font-medium")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
