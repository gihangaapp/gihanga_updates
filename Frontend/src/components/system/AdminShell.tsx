import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Award,
  Bell,
  ChevronRight,
  Circle,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Radio,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/hooks/use-theme";
import {
  useStaffNotifications,
  useMarkStaffNotificationsRead,
  useOnlineDot,
} from "@/hooks/use-staff-notifications";
import { hasAnyPermission, ROLE_LABEL, type Permission } from "@/lib/permissions";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/Logo";
import { AdminAvatar } from "@/components/system/AdminUI";

/* ── Navigation model ─────────────────────────────────────────────────────── */

export interface AdminNavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permissions: Permission[];
  badgeKey?: string;
}

export interface AdminNavSection {
  label: string;
  items: AdminNavItem[];
}

export const adminNavSections: AdminNavSection[] = [
  {
    label: "Overview",
    items: [
      {
        to: "/system/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        permissions: ["moderation.queue.view", "accounts.view"],
      },
    ],
  },
  {
    label: "Trust & Safety",
    items: [
      {
        to: "/system/dashboard/moderation",
        label: "Moderation Queue",
        icon: ShieldAlert,
        permissions: ["moderation.queue.view"],
        badgeKey: "pendingReports",
      },
      {
        to: "/system/dashboard/live",
        label: "Live Oversight",
        icon: Radio,
        permissions: ["live.forceEnd"],
        badgeKey: "liveNow",
      },
      {
        to: "/system/dashboard/accounts",
        label: "User Accounts",
        icon: Users,
        permissions: ["accounts.view"],
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        to: "/system/dashboard/payments",
        label: "Payments Queue",
        icon: Wallet,
        permissions: ["payments.view"],
        badgeKey: "pendingPayments",
      },
      {
        to: "/system/dashboard/campaigns",
        label: "Ad Campaigns",
        icon: Target,
        permissions: ["ads.view"],
        badgeKey: "pendingCampaigns",
      },
      {
        to: "/system/dashboard/rewards",
        label: "Reward Config",
        icon: Award,
        permissions: ["rewards.view"],
      },
      {
        to: "/system/dashboard/achievements",
        label: "Achievement Badges",
        icon: Sparkles,
        permissions: ["achievements.view"],
      },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        to: "/system/dashboard/growth",
        label: "Platform Growth",
        icon: TrendingUp,
        permissions: ["analytics.view"],
      },
      {
        to: "/system/dashboard/staff",
        label: "Staff Management",
        icon: ShieldCheck,
        permissions: ["staff.view"],
      },
      {
        to: "/system/dashboard/activity",
        label: "Staff Activity",
        icon: Activity,
        permissions: ["audit.viewAll"],
      },
      {
        to: "/system/dashboard/settings",
        label: "Platform Settings",
        icon: Settings,
        permissions: ["settings.view"],
      },
      {
        to: "/system/dashboard/ad-settings",
        label: "Ad Settings & Rates",
        icon: Sparkles,
        permissions: ["settings.view"],
      },
      {
        to: "/system/dashboard/audit",
        label: "Audit Log",
        icon: History,
        permissions: ["audit.viewOwn", "audit.viewAll"],
      },
    ],
  },
];

const ALL_NAV_ITEMS = adminNavSections.flatMap((s) => s.items);

function useNavBadges() {
  const { staffUser } = useAuth();
  return useQuery({
    queryKey: ["staff", "overview", "badges"],
    queryFn: async () => {
      try {
        const res = await api.get<{ stats: Record<string, number> }>("/system/overview", true);
        return res.stats ?? {};
      } catch {
        return {};
      }
    },
    enabled: Boolean(staffUser),
    refetchInterval: 60_000,
  });
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */

export function AdminSidebar({
  onNavigate,
  onSignOut,
}: {
  onNavigate?: () => void;
  onSignOut: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { staffUser } = useAuth();
  const { data: stats } = useNavBadges();

  const role = staffUser?.role as "moderator" | "admin" | "superadmin";
  const visibleSections = useMemo(
    () =>
      adminNavSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => hasAnyPermission(staffUser, item.permissions)),
        }))
        .filter((section) => section.items.length > 0),
    [staffUser],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-7">
        <Logo compact className="scale-110" />
        <div className="min-w-0">
          <p className="font-display text-[15px] leading-tight font-extrabold tracking-tight text-foreground">
            Gihanga Updates
          </p>
          <p className="text-[10px] font-bold tracking-[0.16em] text-primary uppercase">
            Admin Console
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {visibleSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[10px] font-bold tracking-[0.14em] text-muted-foreground/80 uppercase">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.to === "/system/dashboard"
                    ? pathname === "/system/dashboard" || pathname === "/system/dashboard/"
                    : pathname.startsWith(item.to);
                const badge = item.badgeKey ? stats?.[item.badgeKey] : undefined;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
                      active
                        ? "bg-primary-soft text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="admin-nav-active-bar"
                        className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full"
                        style={{ background: "var(--gradient-brand)" }}
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "size-[17px] shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {typeof badge === "number" && badge > 0 && (
                      <span
                        className={cn(
                          "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-extrabold tabular-nums",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-danger/10 text-danger group-hover:bg-danger/15",
                        )}
                      >
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                    {active && <ChevronRight className="size-3.5 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Register CTA — admins and superadmins */}
      {(staffUser?.role === "superadmin" || staffUser?.role === "admin") && (
        <div className="px-3 pb-3">
          <Link
            to="/system/register"
            className="press gradient-brand flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
          >
            <ShieldCheck className="size-4" /> Register Administrator
          </Link>
        </div>
      )}

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-muted">
          <AdminAvatar name={staffUser?.name ?? "Staff"} hue={staffUser?.avatarHue} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-foreground">{staffUser?.name}</p>
            <p className="truncate text-[11px] font-semibold text-primary">
              {role ? ROLE_LABEL[role] : "Staff"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={onSignOut}
            className="press grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Topbar ───────────────────────────────────────────────────────────────── */

function pageTitleFor(pathname: string): string {
  const item = [...ALL_NAV_ITEMS]
    .sort((a, b) => b.to.length - a.to.length)
    .find(
      (i) =>
        (i.to === "/system/dashboard" && (pathname === "/system/dashboard" || pathname === "/system/dashboard/")) ||
        (i.to !== "/system/dashboard" && pathname.startsWith(i.to)),
    );
  return item?.label ?? "Dashboard";
}

function GlobalSearch() {
  const navigate = useNavigate();
  const { staffUser } = useAuth();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const clean = q.trim().toLowerCase();
    if (!clean) return [];
    return ALL_NAV_ITEMS.filter(
      (i) =>
        hasAnyPermission(staffUser, i.permissions) && i.label.toLowerCase().includes(clean),
    ).slice(0, 6);
  }, [q, staffUser]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("admin-global-search")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative hidden md:block">
      <div className="flex h-10 w-64 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3.5 transition-colors focus-within:border-ring focus-within:bg-card lg:w-72">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          id="admin-global-search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) {
              navigate({ to: results[0].to });
              setQ("");
              setOpen(false);
            }
          }}
          placeholder="Search pages…"
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden shrink-0 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground lg:block">
          ⌘K
        </kbd>
      </div>

      <AnimatePresence>
        {open && q.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 right-0 z-50 w-72 overflow-hidden rounded-2xl border border-border bg-popover shadow-float"
          >
            {results.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">No matching pages.</p>
            ) : (
              results.map((r) => (
                <button
                  key={r.to}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    navigate({ to: r.to });
                    setQ("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-semibold text-foreground/90 transition-colors hover:bg-muted"
                >
                  <r.icon className="size-4 text-muted-foreground" />
                  {r.label}
                  <ChevronRight className="ml-auto size-3.5 text-muted-foreground" />
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationBell() {
  const { data } = useStaffNotifications();
  const markRead = useMarkStaffNotificationsRead();
  const [open, setOpen] = useState(false);
  const unread = data?.unreadCount ?? 0;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="press relative grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-extrabold text-danger-foreground"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              className="absolute top-12 right-0 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-float"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-bold text-foreground">Notifications</p>
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={() => markRead.mutate()}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {!data?.notifications.length && (
                  <div className="px-4 py-10 text-center">
                    <Bell className="mx-auto mb-2 size-6 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">You're all caught up.</p>
                  </div>
                )}
                {data?.notifications.map((n, i) => (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "border-b border-border/50 px-4 py-3 text-[13px] last:border-0",
                      !n.read && "bg-primary-soft/40",
                    )}
                  >
                    <p className="leading-snug text-foreground/90">{n.text}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)} ago</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileMenu({ onSignOut }: { onSignOut: () => void }) {
  const { staffUser } = useAuth();
  const [open, setOpen] = useState(false);
  const role = staffUser?.role as "moderator" | "admin" | "superadmin";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className="press flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-muted"
      >
        <AdminAvatar name={staffUser?.name ?? "Staff"} hue={staffUser?.avatarHue} size="sm" />
        <span className="hidden text-left lg:block">
          <span className="block max-w-[120px] truncate text-[13px] leading-tight font-bold text-foreground">
            {staffUser?.name}
          </span>
          <span className="block text-[10px] font-semibold text-primary">
            {role ? ROLE_LABEL[role] : "Staff"}
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              className="absolute top-12 right-0 z-50 w-56 overflow-hidden rounded-2xl border border-border bg-popover shadow-float"
            >
              <div className="border-b border-border px-4 py-3.5">
                <p className="truncate text-sm font-bold text-foreground">{staffUser?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{staffUser?.email}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                  <ShieldCheck className="size-3" />
                  {role ? ROLE_LABEL[role] : "Staff"}
                </span>
              </div>
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSignOut();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-danger transition-colors hover:bg-danger/10"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminTopBar({
  onMenuClick,
  onSignOut,
}: {
  onMenuClick: () => void;
  onSignOut: () => void;
}) {
  const { theme, toggle } = useTheme();
  const online = useOnlineDot();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = pageTitleFor(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="press grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <motion.h2
        key={title}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-lg font-bold tracking-tight text-foreground"
      >
        {title}
      </motion.h2>

      <div className="ml-auto flex items-center gap-1.5">
        <GlobalSearch />

        <span
          className="mr-1 hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground sm:flex"
          title={online ? "Real-time connected" : "Reconnecting…"}
        >
          <Circle
            className={cn("size-2 fill-current", online ? "text-success" : "text-warning animate-pulse")}
          />
          {online ? "Live" : "Connecting"}
        </span>

        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggle}
          className="press grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </button>

        <NotificationBell />
        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <ProfileMenu onSignOut={onSignOut} />
      </div>
    </header>
  );
}

/* ── Full shell (layout composition) ──────────────────────────────────────── */

export function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { staffUser, signOutStaff } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleSignOut() {
    signOutStaff();
    toast.success("Signed out of the admin console");
    navigate({ to: "/system" });
  }

  const sidebar = <AdminSidebar onNavigate={() => setMobileNavOpen(false)} onSignOut={handleSignOut} />;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 border-r border-border bg-card lg:flex">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar onMenuClick={() => setMobileNavOpen(true)} onSignOut={handleSignOut} />

        <AnimatePresence>
          {mobileNavOpen && (
            <div className="fixed inset-0 z-40 flex lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileNavOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 400, damping: 38 }}
                className="relative flex h-full w-[280px] flex-col border-r border-border bg-card"
              >
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileNavOpen(false)}
                  className="absolute top-5 right-4 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
                {sidebar}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
