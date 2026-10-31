import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Eye,
  FileText,
  History,
  Lightbulb,
  Radio,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABEL } from "@/lib/permissions";
import { formatCount, timeAgo } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import {
  AdminCard,
  AdminCardHeader,
  AdminBadge,
  AdminStatCard,
  AdminStatSkeleton,
} from "@/components/system/AdminUI";
import {
  AdminAreaChart,
  AdminBarChart,
  AdminDonutChart,
  AdminLineChart,
  AdminProgressRow,
} from "@/components/system/AdminCharts";

export const Route = createFileRoute("/system/dashboard/")({
  component: DashboardIndex,
});

/* ── Data ─────────────────────────────────────────────────────────────────── */

interface GrowthData {
  series: { date: string; newUsers: number; newPosts: number; pointsActivity?: number; revenue?: number }[];
  totals: {
    newUsers30d: number;
    newPosts30d: number;
    revenue30d?: number;
    pointsActivity?: number;
    totalUsers: number;
    totalCreators: number;
  };
}

interface AuditEntry {
  _id: string;
  actor: { name: string; username: string; role: string } | null;
  action: string;
  targetUser?: { name: string; username: string } | null;
  createdAt: string;
}

function useOverview() {
  return useQuery({
    queryKey: ["staff", "overview"],
    queryFn: async () => {
      try {
        const res = await api.get<{ stats: Record<string, number>; role: string }>(
          "/system/overview",
          true,
        );
        return res;
      } catch {
        return { stats: {}, role: "" };
      }
    },
    refetchInterval: 60_000,
  });
}

function useGrowth(enabled: boolean) {
  return useQuery({
    queryKey: ["staff", "growth"],
    queryFn: async () => {
      try {
        return await api.get<GrowthData>("/system/growth", true);
      } catch {
        return null;
      }
    },
    enabled,
  });
}

function useRecentAudit(enabled: boolean) {
  return useQuery({
    queryKey: ["staff", "audit", "dashboard-recent"],
    queryFn: async () => {
      try {
        return await api.get<{ entries: AuditEntry[] }>("/system/audit?page=1", true);
      } catch {
        return null;
      }
    },
    enabled,
  });
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function weekTrend(series: { date: string; [k: string]: any }[], key: string): number | null {
  if (!series || series.length < 8) return null;
  const now = series.slice(-7).reduce((a, d) => a + (Number(d[key]) || 0), 0);
  const before = series.slice(-14, -7).reduce((a, d) => a + (Number(d[key]) || 0), 0);
  if (!before) return now > 0 ? 100 : null;
  return ((now - before) / before) * 100;
}

function actionTone(action: string): "success" | "danger" | "warning" | "primary" | "muted" {
  if (/ban|reject|remove|demote|force/i.test(action)) return "danger";
  if (/approve|verify|promote|create|grant/i.test(action)) return "success";
  if (/suspend|pause|warn|escalate/i.test(action)) return "warning";
  if (/login|view/i.test(action)) return "muted";
  return "primary";
}

function actionLabel(action: string): string {
  return action
    .split(".")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" · ");
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

function DashboardIndex() {
  const { staffUser } = useAuth();
  const { data: overview, isLoading } = useOverview();
  const canAnalytics = hasPermission(staffUser, "analytics.view");
  const canAuditAll = hasPermission(staffUser, "audit.viewAll");
  const { data: growth } = useGrowth(canAnalytics);
  const { data: audit } = useRecentAudit(canAuditAll || hasPermission(staffUser, "audit.viewOwn"));

  const stats = overview?.stats ?? {};

  /* 30-day line chart (posts / users / revenue normalised view) */
  const lineData = useMemo(() => {
    const series = growth?.series ?? [];
    return series.map((d) => ({
      label: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      "New posts": d.newPosts,
      "New users": d.newUsers,
    }));
  }, [growth]);

  /* Monthly-ish buckets from the 30d series for the bar chart */
  const barData = useMemo(() => {
    const series = growth?.series ?? [];
    if (series.length) {
      const weeks: { label: string; value: number }[] = [];
      const chunk = Math.ceil(series.length / 5) || 1;
      for (let i = 0; i < series.length; i += chunk) {
        const slice = series.slice(i, i + chunk);
        weeks.push({
          label: `W${Math.floor(i / chunk) + 1}`,
          value: slice.reduce((a, d) => a + d.newUsers, 0),
        });
      }
      return weeks;
    }
    return [];
  }, [growth]);

  const donutData = useMemo(
    () => [
      { name: "Posts", value: Number(stats["totalPosts"] ?? 0) },
      { name: "Live streams", value: Number(stats["liveNow"] ?? 0) },
      { name: "Ad campaigns", value: Number(stats["pendingCampaigns"] ?? 0) },
    ],
    [stats],
  );
  const donutTotal = donutData.reduce((a, d) => a + d.value, 0) || 1;
  const hasDonutData = donutTotal > 1 || donutData.some((d) => d.value > 0);

  const usersTrend = weekTrend(growth?.series ?? [], "newUsers");
  const postsTrend = weekTrend(growth?.series ?? [], "newPosts");
  const pointsTrend = weekTrend(growth?.series ?? [], "pointsActivity");

  const firstName = staffUser?.name?.split(" ")[0] ?? "there";
  const role = staffUser?.role ?? "";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const recentEntries = (audit?.entries ?? []).slice(0, 6);

  /* Queues that need attention (progress panel) */
  const pendingReports = Number(stats["pendingReports"] ?? 0);
  const pendingPayments = Number(stats["pendingPayments"] ?? 0);
  const pendingCampaigns = Number(stats["pendingCampaigns"] ?? 0);
  const queues = [
    {
      label: "Moderation reports",
      value: pendingReports,
      display: String(pendingReports),
      meta: "Awaiting a staff decision",
      to: "/system/dashboard/moderation",
      permission: "moderation.queue.view" as const,
      colorIndex: 1 as const,
    },
    {
      label: "Payment settlements",
      value: pendingPayments,
      display: String(pendingPayments),
      meta: "MTN MoMo deposits & withdrawals",
      to: "/system/dashboard/payments",
      permission: "payments.view" as const,
      colorIndex: 4 as const,
    },
    {
      label: "Ad campaign reviews",
      value: pendingCampaigns,
      display: String(pendingCampaigns),
      meta: "Sponsored content to approve",
      to: "/system/dashboard/campaigns",
      permission: "ads.view" as const,
      colorIndex: 2 as const,
    },
  ].filter((item) => hasPermission(staffUser, item.permission));
  const queueMax = Math.max(...queues.map((queue) => queue.value), 1);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">{today}</p>
          <h1 className="mt-1 font-display text-[26px] leading-tight font-extrabold tracking-tight text-foreground">
            {greeting}, {firstName}{" "}
            <span className="text-gradient-brand">👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-bold text-primary">{ROLE_LABEL[role] || role}</span> — here's
            what's happening across your authorized workspaces.
          </p>
        </div>
        {staffUser?.role === "superadmin" && (
          <Link
            to="/system/register"
            className="press gradient-brand flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold text-primary-foreground shadow-glow"
          >
            <UserPlus className="size-4" /> Register Administrator
          </Link>
        )}
      </motion.div>

      {/* KPI row */}
      {isLoading ? (
        <AdminStatSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <AdminStatCard
            icon={Users}
            label="Total users"
            value={formatCount(stats["totalUsers"] ?? 0)}
            trend={usersTrend}
            hint={`${formatCount(stats["newUsers24h"] ?? 0)} joined in the last 24h`}
            tone="primary"
            delay={0}
          />
          <AdminStatCard
            icon={FileText}
            label="Total posts"
            value={formatCount(stats["totalPosts"] ?? 0)}
            trend={postsTrend}
            hint={`${formatCount(stats["newPosts24h"] ?? 0)} new posts in the last 24h`}
            tone="aqua"
            delay={0.06}
          />
          <AdminStatCard
            icon={AlertTriangle}
            label="Pending reports"
            value={formatCount(stats["pendingReports"] ?? 0)}
            hint="Community flags awaiting review"
            tone="danger"
            delay={0.12}
          />
          {canAnalytics ? (
            <AdminStatCard
              icon={Wallet}
              label="Points activity (30d)"
              value={`${formatCount(growth?.totals?.pointsActivity ?? growth?.totals?.revenue30d ?? 0)} pts`}
              trend={pointsTrend}
              hint="Gift and fee transaction volume; not cash revenue"
              tone="success"
              delay={0.18}
            />
          ) : (
            <AdminStatCard
              icon={Radio}
              label="Live streams now"
              value={formatCount(stats["liveNow"] ?? 0)}
              hint="Live sessions you can oversee"
              tone="success"
              delay={0.18}
            />
          )}
        </div>
      )}

      {/* Charts row — FlowMail 3-column composition */}
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* Platform activity line chart */}
        <AdminCard className="p-5">
          <AdminCardHeader
            title={canAnalytics ? "Platform activity" : "Moderation snapshot"}
            subtitle={canAnalytics ? "New posts and users over the last 30 days" : "Live community safety workload"}
            action={canAnalytics ? (
              <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-chart-1" /> Posts
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-chart-4" /> Users
                </span>
              </div>
            ) : null}
          />
          <div className="mt-4">
            {canAnalytics ? (
              lineData.length > 1 ? (
                <AdminLineChart
                  data={lineData}
                  series={[
                    { key: "New posts", name: "New posts", colorIndex: 1 },
                    { key: "New users", name: "New users", colorIndex: 4 },
                  ]}
                  height={272}
                />
              ) : (
                <div className="grid h-[272px] place-items-center rounded-xl bg-muted/30 text-center">
                  <div>
                    <TrendingUp className="mx-auto mb-2 size-7 text-muted-foreground/60" />
                    <p className="text-sm font-semibold text-muted-foreground">No analytics data yet</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">Activity charts appear once growth data is available.</p>
                  </div>
                </div>
              )
            ) : (
              <div className="grid h-[272px] grid-cols-2 gap-3">
                <div className="flex flex-col justify-between rounded-xl border border-danger/15 bg-danger/5 p-4">
                  <span className="grid size-10 place-items-center rounded-xl bg-danger/10 text-danger"><ShieldAlert className="size-5" /></span>
                  <div>
                    <p className="font-display text-3xl font-extrabold tabular-nums text-foreground">{formatCount(stats["pendingReports"] ?? 0)}</p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">Reports awaiting review</p>
                  </div>
                  <Link to="/system/dashboard/moderation" className="text-xs font-bold text-primary hover:underline">Open reports queue →</Link>
                </div>
                <div className="flex flex-col justify-between rounded-xl border border-aqua/20 bg-aqua/5 p-4">
                  <span className="grid size-10 place-items-center rounded-xl bg-aqua/15 text-aqua-foreground dark:text-aqua"><Radio className="size-5" /></span>
                  <div>
                    <p className="font-display text-3xl font-extrabold tabular-nums text-foreground">{formatCount(stats["liveNow"] ?? 0)}</p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">Live sessions to oversee</p>
                  </div>
                  <Link to="/system/dashboard/live" className="text-xs font-bold text-primary hover:underline">Open live oversight →</Link>
                </div>
              </div>
            )}
          </div>
        </AdminCard>

        {/* Right rail: donut + queues */}
        <div className="space-y-5">
          {canAnalytics && (
            <AdminCard className="p-5">
              <AdminCardHeader title="Content mix" subtitle="Distribution across the platform" />
            {hasDonutData ? (
              <>
                <div className="mt-2 grid grid-cols-[150px_1fr] items-center gap-4 sm:grid-cols-[160px_1fr]">
                  <AdminDonutChart
                    data={donutData}
                    centerLabel="Pieces tracked"
                    centerValue={formatCount(donutTotal)}
                    height={150}
                  />
                  <div className="space-y-2.5">
                    {donutData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                          <span
                            className="size-2.5 rounded-sm"
                            style={{ background: `var(--chart-${i + 1})` }}
                          />
                          {d.name}
                        </span>
                        <span className="text-xs font-bold text-foreground tabular-nums">
                          {((d.value / donutTotal) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-3 flex flex-col items-center justify-center gap-2 py-8 text-center">
                <span className="grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <Eye className="size-5" />
                </span>
                <p className="text-[13px] font-semibold text-muted-foreground">
                  Nothing to distribute yet
                </p>
                <p className="text-[11px] text-muted-foreground/70">
                  The mix appears once content exists on the platform.
                </p>
              </div>
            )}
            </AdminCard>
          )}

          <AdminCard className="p-5">
            <AdminCardHeader
              title="Needs attention"
              subtitle="Queues waiting on staff"
              action={
                hasPermission(staffUser, "moderation.queue.view") ? (
                  <Link
                    to="/system/dashboard/moderation"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    View all
                  </Link>
                ) : null
              }
            />
            <div className="mt-5 space-y-5">
              {queues.length ? queues.map((q, i) => (
                <AdminProgressRow
                  key={q.label}
                  label={q.label}
                  value={(q.value / queueMax) * 100}
                  display={q.display}
                  meta={q.meta}
                  delay={i * 0.08}
                  colorIndex={q.colorIndex}
                />
              )) : (
                <p className="py-5 text-center text-xs text-muted-foreground">No operational queues are assigned to this role.</p>
              )}
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Growth bar + recent activity table */}
      <div className="grid gap-5 xl:grid-cols-[1fr_1.5fr]">
        <AdminCard className="p-5">
          <AdminCardHeader
            title={canAnalytics ? "Audience growth" : "Safety operations"}
            subtitle={canAnalytics ? "New members per week" : "Your assigned community protection tools"}
            action={canAnalytics ? (
              <Link
                to="/system/dashboard/growth"
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                Details <ArrowUpRight className="size-3.5" />
              </Link>
            ) : null}
          />
          {canAnalytics ? (
          <>
          <div className="mt-4">
            {barData.length > 1 ? (
              <AdminBarChart data={barData} height={232} />
            ) : (
              <div className="grid h-[232px] place-items-center rounded-xl bg-muted/30 text-center">
                <div>
                  <Users className="mx-auto mb-2 size-7 text-muted-foreground/60" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    Growth data coming soon
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] font-semibold text-muted-foreground">New members (30d)</p>
              <p className="mt-0.5 font-display text-lg font-extrabold text-foreground tabular-nums">
                {formatCount(growth?.totals?.newUsers30d ?? stats["newUsers24h"] ?? 0)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] font-semibold text-muted-foreground">Creators</p>
              <p className="mt-0.5 font-display text-lg font-extrabold text-foreground tabular-nums">
                {formatCount(growth?.totals?.totalCreators ?? 0)}
              </p>
            </div>
          </div>
          </>
          ) : (
            <div className="mt-4 grid gap-3">
              <Link to="/system/dashboard/moderation" className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3.5 transition-colors hover:border-primary/30 hover:bg-primary-soft/20">
                <span className="grid size-10 place-items-center rounded-xl bg-danger/10 text-danger"><ShieldAlert className="size-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-foreground">Report investigations</span><span className="block text-xs text-muted-foreground">Review reports, evidence and appeals</span></span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
              <Link to="/system/dashboard/live" className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3.5 transition-colors hover:border-primary/30 hover:bg-primary-soft/20">
                <span className="grid size-10 place-items-center rounded-xl bg-aqua/15 text-aqua-foreground dark:text-aqua"><Radio className="size-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-foreground">Live stream safety</span><span className="block text-xs text-muted-foreground">Watch and escalate unsafe live sessions</span></span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            </div>
          )}
        </AdminCard>

        {/* Recent staff activity table */}
        <AdminCard className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-5 pb-4">
            <AdminCardHeader
              title={canAuditAll ? "Recent staff activity" : "Your recent staff activity"}
              subtitle={canAuditAll ? "Latest actions from the administration team" : "Recent actions performed by your account"}
            />
            <Link
              to="/system/dashboard/audit"
              className="shrink-0 text-xs font-bold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {recentEntries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <History className="size-7 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-muted-foreground">No activity recorded yet</p>
              <p className="text-xs text-muted-foreground/70">
                Staff actions will appear here as they happen.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-5 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      Action
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      Staff member
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      When
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map((e, i) => (
                    <motion.tr
                      key={e._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-semibold text-foreground">
                          {actionLabel(e.action)}
                        </p>
                        {e.targetUser && (
                          <p className="text-xs text-muted-foreground">
                            on @{e.targetUser.username}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-semibold text-foreground/90">
                          {e.actor ? e.actor.name : "System"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {e.actor ? `@${e.actor.username}` : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <AdminBadge tone={actionTone(e.action)} dot>
                          {/ban|reject|remove/i.test(e.action)
                            ? "Enforced"
                            : /approve|verify|create/i.test(e.action)
                              ? "Completed"
                              : /suspend|pause/i.test(e.action)
                                ? "Limited"
                                : /login/i.test(e.action)
                                  ? "Signed in"
                                  : "Logged"}
                        </AdminBadge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {timeAgo(e.createdAt)} ago
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>

      {/* AI insights row */}
      <div className="grid gap-5 lg:grid-cols-3">
        <AdminCard className="p-5 lg:col-span-2">
          <AdminCardHeader
            title={
              <span className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Sparkles className="size-4" />
                </span>
                AI insights
              </span>
            }
            subtitle="Automated observations from platform data"
          />
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card shadow-sm">
                <Clock className="size-4 text-primary" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-foreground">Live activity now</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {stats["liveNow"]
                    ? `${stats["liveNow"]} live stream${stats["liveNow"] > 1 ? "s are" : " is"} currently active. Check Live Oversight for reports and safety issues.`
                    : "There are no live streams currently active in the platform snapshot."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card shadow-sm">
                <Lightbulb className="size-4 text-warning" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-foreground">Reports awaiting review</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {stats["pendingReports"]
                    ? `${stats["pendingReports"]} report${stats["pendingReports"] > 1 ? "s are" : " is"} awaiting a staff decision. Review the oldest items first.`
                    : "The reports queue is currently clear. Continue monitoring user reports and AI safety reviews."}
                </p>
              </div>
            </div>
          </div>
          <Link
            to="/system/dashboard/moderation"
            className="press gradient-brand mt-4 flex h-11 items-center justify-center gap-2 rounded-xl text-[13px] font-bold text-primary-foreground shadow-glow"
          >
            <Sparkles className="size-4" /> Open moderation workspace
          </Link>
        </AdminCard>

        {/* Quick links */}
        <AdminCard className="p-5">
          <AdminCardHeader title="Quick actions" subtitle="Jump straight into a workspace" />
          <div className="mt-4 space-y-2">
            {[
              { to: "/system/dashboard/accounts", icon: Users, label: "Search user accounts", permission: "accounts.view" as const },
              { to: "/system/dashboard/live", icon: Radio, label: "Watch live streams", permission: "live.forceEnd" as const },
              { to: "/system/dashboard/content", icon: FileText, label: "Manage platform content", permission: "content.view" as const },
              { to: "/system/dashboard/campaigns", icon: Target, label: "Review ad campaigns", permission: "ads.view" as const },
              { to: "/system/dashboard/activity", icon: Activity, label: "See staff leaderboard", permission: "audit.viewAll" as const },
              { to: "/system/dashboard/audit", icon: Eye, label: "Inspect the audit trail", permission: "audit.viewOwn" as const },
            ].filter((q) => hasPermission(staffUser, q.permission)).map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-[13px] font-semibold text-foreground/85 transition-all hover:border-primary/30 hover:bg-primary-soft/30 hover:text-foreground"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary-soft group-hover:text-primary">
                  <q.icon className="size-4" />
                </span>
                <span className="flex-1">{q.label}</span>
                <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
