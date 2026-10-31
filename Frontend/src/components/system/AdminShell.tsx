import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Archive,
  ArrowRight,
  Award,
  Bell,
  ChevronDown,
  ChevronRight,
  Circle,
  Crown,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Radio,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  UserPlus,
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
    label: "Content Operations",
    items: [
      {
        to: "/system/dashboard/content",
        label: "Content Management",
        icon: Archive,
        permissions: ["content.view"],
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

const ROLE_BADGE_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: typeof ShieldCheck }
> = {
  superadmin: {
    label: "Super Admin",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: Crown,
  },
  admin: {
    label: "Admin",
    badgeClass: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    icon: Shield,
  },
  moderator: {
    label: "Moderator",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: ShieldCheck,
  },
};

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

  const badgeConfig =
    (role && ROLE_BADGE_CONFIG[role]) || {
      label: "Staff",
      badgeClass: "bg-primary/15 text-primary border-primary/30",
      icon: ShieldCheck,
    };

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

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Ensure current active section is never collapsed on page load or route transition
  useEffect(() => {
    visibleSections.forEach((section) => {
      const hasActiveChild = section.items.some((item) =>
        item.to === "/system/dashboard"
          ? pathname === "/system/dashboard" || pathname === "/system/dashboard/"
          : pathname.startsWith(item.to),
      );
      if (hasActiveChild) {
        setCollapsedSections((prev) => (prev[section.label] ? { ...prev, [section.label]: false } : prev));
      }
    });
  }, [pathname, visibleSections]);

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div className="flex h-full flex-col select-none bg-card">
      {/* ── Brand & Status Header ────────────────────────────────────────── */}
      <div className="border-b border-border/40 px-4 py-3.5">
        <Link
          to="/system/dashboard"
          onClick={onNavigate}
          className="group flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <Logo compact className="scale-105 transition-transform duration-200 group-hover:scale-110" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-[14px] leading-tight font-extrabold tracking-tight text-foreground truncate">
                Gihanga Updates
              </p>
              <p className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">
                Console
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
              badgeConfig.badgeClass,
            )}
          >
            <badgeConfig.icon className="size-2.5" />
            {badgeConfig.label}
          </span>
        </Link>
      </div>

      {/* ── Nav Links Container (Zero Native Scrollbar) ──────────────────── */}
      <nav
        className="flex-1 space-y-3 overflow-y-auto px-2.5 py-3 no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {visibleSections.map((section) => {
          const isCollapsed = Boolean(collapsedSections[section.label]);
          const sectionBadgeCount = section.items.reduce((acc, item) => {
            const badge = item.badgeKey ? stats?.[item.badgeKey] : undefined;
            return typeof badge === "number" && badge > 0 ? acc + badge : acc;
          }, 0);

          return (
            <div key={section.label} className="space-y-0.5">
              {/* Section Header Toggle */}
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                className="group flex w-full items-center justify-between rounded-lg px-2 py-1 text-left cursor-pointer transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground/75 uppercase transition-colors group-hover:text-foreground">
                    {section.label}
                  </span>
                  {isCollapsed && sectionBadgeCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-danger/15 px-1 text-[9px] font-extrabold text-danger">
                      {sectionBadgeCount > 99 ? "99+" : sectionBadgeCount}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "size-3 text-muted-foreground/50 transition-transform duration-200 group-hover:text-muted-foreground",
                    isCollapsed ? "-rotate-90" : "rotate-0",
                  )}
                />
              </button>

              {/* Collapsible item list */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {section.items.map((item) => {
                      const active =
                        item.to === "/system/dashboard"
                          ? pathname === "/system/dashboard" || pathname === "/system/dashboard/"
                          : pathname.startsWith(item.to);
                      const badge = item.badgeKey ? stats?.[item.badgeKey] : undefined;
                      const isLiveItem = item.to === "/system/dashboard/live";

                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={onNavigate}
                          className={cn(
                            "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] font-medium transition-all duration-150",
                            active
                              ? "bg-primary/12 text-primary font-bold shadow-sm"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:translate-x-0.5",
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="admin-nav-active-pill"
                              className="absolute top-1.5 bottom-1.5 left-0 w-1 rounded-r-full bg-primary"
                              transition={{ type: "spring", stiffness: 500, damping: 38 }}
                            />
                          )}
                          <item.icon
                            className={cn(
                              "size-[16px] shrink-0 transition-transform duration-150 group-hover:scale-110",
                              active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>

                          {/* Live pulse indicator */}
                          {isLiveItem && typeof badge === "number" && badge > 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-danger/15 px-1.5 py-0.5 text-[10px] font-bold text-danger">
                              <span className="size-1.5 rounded-full bg-danger animate-ping" />
                              {badge}
                            </span>
                          )}

                          {/* Standard badge */}
                          {!isLiveItem && typeof badge === "number" && badge > 0 && (
                            <span
                              className={cn(
                                "grid h-4.5 min-w-4.5 place-items-center rounded-full px-1.5 text-[10px] font-extrabold tabular-nums",
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-danger/12 text-danger group-hover:bg-danger/20",
                              )}
                            >
                              {badge > 99 ? "99+" : badge}
                            </span>
                          )}

                          {active && <ChevronRight className="size-3 shrink-0 text-primary opacity-60" />}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* ── Register Administrator Action ────────────────────────────────── */}
      {(staffUser?.role === "superadmin" || staffUser?.role === "admin") && (
        <div className="px-2.5 pt-1 pb-2">
          <Link
            to="/system/register"
            onClick={onNavigate}
            className="group flex items-center justify-between rounded-xl border border-primary/25 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent p-2 text-xs font-bold text-foreground transition-all hover:border-primary/50 hover:bg-primary-soft/50 shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <UserPlus className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11.5px] font-bold leading-tight group-hover:text-primary transition-colors">
                  Add Administrator
                </p>
                <p className="truncate text-[9.5px] font-medium text-muted-foreground">
                  Provision team role
                </p>
              </div>
            </div>
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        </div>
      )}

      {/* ── User Profile Footer ──────────────────────────────────────────── */}
      <div className="border-t border-border/40 p-2.5 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-muted/60">
          <div className="relative shrink-0">
            <AdminAvatar name={staffUser?.name ?? "Staff"} hue={staffUser?.avatarHue} size="sm" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground leading-tight">{staffUser?.name}</p>
            <p className="truncate text-[10.5px] font-semibold text-primary">
              {role ? ROLE_LABEL[role] : "Staff"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={onSignOut}
            className="press grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger cursor-pointer"
          >
            <LogOut className="size-3.5" />
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
      <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 border-r border-border bg-card lg:flex">
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
