import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { AdminShell } from "@/components/system/AdminShell";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/system/dashboard")({
  component: StaffDashboardLayout,
});

function StaffDashboardLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { staffUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!staffUser || staffUser.role === "user") navigate({ to: "/system" });
  }, [loading, staffUser, navigate]);

  if (loading || !staffUser || staffUser.role === "user") {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="grid size-14 place-items-center rounded-2xl border border-border bg-card shadow-soft">
            <Loader2 className="size-6 animate-spin text-primary" />
          </span>
          <p className="text-sm font-semibold text-muted-foreground">Loading console…</p>
        </div>
      </div>
    );
  }

  return (
    <AdminShell>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <Outlet />
      </motion.div>
    </AdminShell>
  );
}
