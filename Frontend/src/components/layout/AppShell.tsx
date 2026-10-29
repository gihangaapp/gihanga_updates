import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { RightRail } from "./RightRail";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";
import { AppScrollbar } from "./AppScrollbar";
import { CreateHost } from "@/components/create/CreateHub";
import { useAuth } from "@/lib/auth-context";

export function AppShell({
  children,
  immersiveMobile = false,
}: {
  children: ReactNode;
  /** Hide the top bar / bottom nav and edge padding below lg so the page content can go full screen (e.g. reels). */
  immersiveMobile?: boolean;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || pathname.startsWith("/system")) return;
    if (!user) {
      navigate({ to: "/welcome" });
    } else if (!user.emailVerified) {
      navigate({ to: "/verify" });
    } else if (!user.onboarded) {
      navigate({ to: "/interests" });
    }
  }, [loading, user, pathname, navigate]);

  // Don't flash protected content before the redirect above fires.
  if (
    !loading &&
    (!user || !user.emailVerified || !user.onboarded) &&
    !pathname.startsWith("/system")
  ) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className={immersiveMobile ? "contents max-lg:hidden" : "contents"}>
          <TopBar />
        </div>
        <div className="mx-auto flex min-w-0 w-full max-w-[1400px] flex-1 justify-center">
          <main
            className={
              immersiveMobile
                ? "min-w-0 flex-1 px-3 pt-4 pb-32 max-lg:p-0 sm:px-5 lg:pb-10"
                : "min-w-0 flex-1 px-3 pt-4 pb-32 sm:px-5 lg:pb-10"
            }
          >
            {children}
          </main>
          <RightRail />
        </div>
      </div>
      <div className={immersiveMobile ? "max-lg:hidden" : undefined}>
        <BottomNav />
      </div>
      <CreateHost />
      <AppScrollbar />
    </div>
  );
}
