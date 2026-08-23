import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { RightRail } from "./RightRail";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";
import { CreateHost } from "@/components/feed/CreateSheet";
import { useAuth } from "@/lib/auth-context";

export function AppShell({ children }: { children: ReactNode }) {
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
  if (!loading && (!user || !user.emailVerified || !user.onboarded) && !pathname.startsWith("/system")) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="mx-auto flex w-full max-w-[1400px] flex-1 justify-center">
          <main className="min-w-0 flex-1 px-3 pt-4 pb-32 sm:px-5 lg:pb-10">{children}</main>
          <RightRail />
        </div>
      </div>
      <BottomNav />
      <CreateHost />
    </div>
  );
}
