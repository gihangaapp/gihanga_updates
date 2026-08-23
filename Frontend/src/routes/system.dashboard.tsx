import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Wallet,
  Target,
  Radio,
  TrendingUp,
  Activity,
  Settings,
  History,
  Award,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";
import { StaffTopBar } from "@/components/staff/StaffTopBar";
import { useAuth } from "@/lib/auth-context";
import { hasAnyPermission, ROLE_LABEL, type Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard")({
  component: StaffDashboardLayout,
});

interface NavItem {
  to: string;
  label: string;
  icon: typeof ShieldAlert;
  permissions: Permission[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [{ to: "/system/dashboard", label: "Dashboard", icon: TrendingUp, permissions: ["moderation.queue.view", "accounts.view"] }],
  },
  {
    label: "Trust & Safety",
    items: [
      { to: "/system/dashboard/moderation", label: "Moderation Queue", icon: ShieldAlert, permissions: ["moderation.queue.view"] },
      { to: "/system/dashboard/live", label: "Live Oversight", icon: Radio, permissions: ["live.forceEnd"] },
      { to: "/system/dashboard/accounts", label: "User Accounts", icon: Users, permissions: ["accounts.view"] },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/system/dashboard/payments", label: "Payments Queue", icon: Wallet, permissions: ["payments.view"] },
      { to: "/system/dashboard/campaigns", label: "Ad Campaigns", icon: Target, permissions: ["ads.view"] },
      { to: "/system/dashboard/rewards", label: "Reward Config", icon: Award, permissions: ["rewards.view"] },
    ],
  },
  {
    label: "Platform",
    items: [
      { to: "/system/dashboard/growth", label: "Platform Growth", icon: TrendingUp, permissions: ["analytics.view"] },
      { to: "/system/dashboard/staff", label: "Staff Management", icon: ShieldCheck, permissions: ["staff.view"] },
      { to: "/system/dashboard/activity", label: "Staff Activity", icon: Activity, permissions: ["audit.viewAll"] },
      { to: "/system/dashboard/settings", label: "Platform Settings", icon: Settings, permissions: ["settings.view"] },
      { to: "/system/dashboard/audit", label: "Audit Log", icon: History, permissions: ["audit.viewOwn", "audit.viewAll"] },
    ],
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StaffDashboardLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { staffUser, signOutStaff, loading } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!staffUser || staffUser.role === "user") navigate({ to: "/system" });
  }, [loading, staffUser, navigate]);

  if (loading || !staffUser || staffUser.role === "user") {
    return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Loading console…</div>;
  }

  const role = staffUser.role as "moderator" | "admin" | "superadmin";
  const visibleSections = navSections
    .map((section) => ({ ...section, items: section.items.filter((item) => hasAnyPermission(staffUser, item.permissions)) }))
    .filter((section) => section.items.length > 0);

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-1 pb-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto">
        {visibleSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors",
                      active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="staff-nav-active"
                        className="absolute inset-0 rounded-xl bg-primary-soft"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <item.icon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {active && <ChevronRight className="size-3.5 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 p-2.5">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-primary-foreground"
          style={{ backgroundImage: `linear-gradient(140deg, oklch(0.5 0.11 ${staffUser.avatarHue || 250}), oklch(0.72 0.1 ${(staffUser.avatarHue || 250) + 24}))` }}
        >
          {initials(staffUser.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-foreground">{staffUser.name}</p>
          <p className="truncate text-[10px] font-semibold text-primary">{ROLE_LABEL[role]}</p>
        </div>
        <button
          type="button"
          aria-label="Sign out"
          onClick={() => {
            signOutStaff();
            toast.success("Signed out of the staff console");
            navigate({ to: "/system" });
          }}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/50 p-4 lg:flex">
        {sidebarContent}
      </aside>

      <div className="flex flex-1 flex-col">
        <StaffTopBar onMenuClick={() => setMobileNavOpen(true)} />

        <AnimatePresence>
          {mobileNavOpen && (
            <div className="fixed inset-0 z-40 flex lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60"
                onClick={() => setMobileNavOpen(false)}
              />
              <motion.div
                initial={{ x: -288 }}
                animate={{ x: 0 }}
                exit={{ x: -288 }}
                transition={{ type: "spring", stiffness: 400, damping: 38 }}
                className="relative flex h-full w-72 flex-col border-r border-border bg-card p-4"
              >
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileNavOpen(false)}
                  className="absolute top-4 right-4 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
                {sidebarContent}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
