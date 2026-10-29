import { useEffect, useState } from "react";
import { Bell, Moon, Radio, Search, Sun } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";

export function TopBar() {
  const [isHidden, setIsHidden] = useState(false);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const unread = useUnreadNotificationCount();

  // Keep the top bar out of the way while scrolling down, and bring it back
  // as soon as the user scrolls upward (on every page that uses AppShell).
  useEffect(() => {
    let previousY = window.scrollY;
    let lastDirectionChange = 0;
    const handleScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - previousY;
      if (currentY <= 48) {
        setIsHidden(false);
        previousY = currentY;
        return;
      }
      if (Math.abs(delta) >= 5) {
        const now = performance.now();
        if (now - lastDirectionChange > 35) {
          setIsHidden(delta > 0);
          lastDirectionChange = now;
        }
        previousY = currentY;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    {/* Spacer reserves the top bar's height on mobile, where the bar is fixed */}
    <div aria-hidden className="h-16 lg:hidden" />
    <header
      aria-hidden={isHidden || undefined}
      className={`glass fixed inset-x-0 top-0 z-40 border-b transition-transform duration-300 ease-out will-change-transform lg:sticky lg:inset-x-auto ${isHidden ? "-translate-y-[110%]" : "translate-y-0"}`}
    >
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
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Live" asChild>
            <Link to="/live">
              <Radio />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="max-lg:hidden"
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
    </>
  );
}
