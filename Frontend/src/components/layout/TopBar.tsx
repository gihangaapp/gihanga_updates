import { Bell, Moon, Search, Sun } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";

export function TopBar() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const unread = useUnreadNotificationCount();

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
        <div className="lg:hidden">
          <Logo compact />
        </div>

        <div className="relative hidden min-w-0 flex-1 max-w-lg md:block">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search creators, hashtags, sounds…"
            onFocus={() => navigate({ to: "/explore" })}
            className="h-11 w-full rounded-2xl border border-border bg-elevated pr-4 pl-10 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-ring focus:bg-surface focus:shadow-soft"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Search"
            asChild
          >
            <Link to="/explore">
              <Search />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggle}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
            asChild
          >
            <Link to="/notifications">
            <Bell />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
            </Link>
          </Button>
          <span className="ml-1">
            <AccountMenu compact />
          </span>
        </div>
      </div>
    </header>
  );
}
