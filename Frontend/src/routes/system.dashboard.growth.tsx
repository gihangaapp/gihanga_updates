import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Coins, Download, FileText, RefreshCw, TrendingUp, Users, UserRoundCheck, Activity, Smartphone, Clock3, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";
import { formatCount } from "@/lib/format";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminStatCard,
  AdminStatSkeleton,
  AdminSegmented,
  AdminErrorState,
  AdminEmptyState,
} from "@/components/system/AdminUI";
import { AdminAreaChart, AdminLineChart } from "@/components/system/AdminCharts";

export const Route = createFileRoute("/system/dashboard/growth")({
  component: GrowthPage,
});

interface GrowthData {
  range: { days: number; from: string; to: string; previousFrom: string; previousTo: string };
  series: { date: string; newUsers?: number; newPosts?: number; pointsActivity?: number; revenue?: number; activeUsers: number; contentViews?: number }[];
  retention?: { day1: { day: number; cohortUsers: number; returnedUsers: number; rate: number | null; cohortFrom: string; cohortTo: string }; day7: { day: number; cohortUsers: number; returnedUsers: number; rate: number | null; cohortFrom: string; cohortTo: string } };
  sessionInsights: { trackedSessions: number; multiEventSessions: number; averageObservedInteractionSpanMinutes: number; note: string };
  deviceBreakdown?: { device: string; sessions: number }[];
  dataNotes: string[];
  totals: {
    rangeDays: number;
    newUsers?: number;
    newPosts?: number;
    pointsActivity?: number;
    previousNewUsers?: number;
    previousNewPosts?: number;
    previousPointsActivity?: number;
    totalUsers?: number;
    totalCreators?: number;
  };
}

type MetricView = "all" | "users" | "posts" | "active" | "views" | "points";
type RangeDays = "7" | "30" | "90";

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

function exportGrowthCsv(data: GrowthData, canViewPoints: boolean) {
  if (!data.series.length) {
    toast.error("There is no analytics data to export yet.");
    return;
  }
  const headers = ["Date", "New users", "New posts", "Active users", "Content views", ...(canViewPoints ? ["Points activity"] : [])];
  const rows = [headers, ...data.series.map((item) => [item.date, item.newUsers ?? "", item.newPosts ?? "", item.activeUsers, item.contentViews ?? "", ...(canViewPoints ? [item.pointsActivity ?? ""] : [])])];
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `gihanga-platform-analytics-${data.range.days}d.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function GrowthPage() {
  const { staffUser } = useAuth();
  const canAnalytics = hasPermission(staffUser, "analytics.view");
  const canViewPoints = hasPermission(staffUser, "rewards.view");
  const canViewAccounts = hasPermission(staffUser, "accounts.view");
  const canViewContent = hasPermission(staffUser, "content.view") || hasPermission(staffUser, "moderation.content.view");
  const [days, setDays] = useState<RangeDays>("30");
  const [metricView, setMetricView] = useState<MetricView>("all");

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["staff", "growth", days],
    queryFn: () => api.get<GrowthData>(`/system/growth?days=${days}`, true),
    enabled: canAnalytics,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const combinedData = useMemo(
    () =>
      (data?.series ?? []).map((item) => ({
        label: new Date(`${item.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        "New users": item.newUsers ?? 0,
        "New posts": item.newPosts ?? 0,
        "Active users": item.activeUsers,
        "Content views": item.contentViews ?? 0,
        "Points activity": item.pointsActivity ?? 0,
      })),
    [data],
  );

  const visibleSeries = useMemo(() => {
    if (metricView === "users" && canViewAccounts) return [{ key: "New users", name: "New users", colorIndex: 1 as const }];
    if (metricView === "posts" && canViewContent) return [{ key: "New posts", name: "New posts", colorIndex: 4 as const }];
    if (metricView === "active") return [{ key: "Active users", name: "Daily active users", colorIndex: 2 as const }];
    if (metricView === "views" && canViewContent) return [{ key: "Content views", name: "Recorded content views", colorIndex: 4 as const }];
    if (metricView === "points" && canViewPoints) return [{ key: "Points activity", name: "Points activity", colorIndex: 2 as const }];
    return [
      ...(canViewAccounts ? [{ key: "New users", name: "New users", colorIndex: 1 as const }] : []),
      ...(canViewContent ? [{ key: "New posts", name: "New posts", colorIndex: 4 as const }] : []),
      { key: "Active users", name: "Daily active users", colorIndex: 2 as const },
    ];
  }, [metricView, canViewAccounts, canViewContent, canViewPoints]);

  const startLabel = data?.range?.from
    ? new Date(data.range.from).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "—";
  const endLabel = data?.range?.to
    ? new Date(data.range.to).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "—";
  const totals = data?.totals;
  const visibleMetricView = (metricView === "points" && !canViewPoints) || (metricView === "users" && !canViewAccounts) || ((metricView === "posts" || metricView === "views") && !canViewContent) ? "all" : metricView;

  if (!canAnalytics) {
    return (
      <div className="space-y-5">
        <AdminPageHeader icon={TrendingUp} title="Platform Growth" description="Platform-level analytics and engagement trends." accent="aqua" />
        <AdminEmptyState icon={Users} title="Analytics permission required" description="Growth analytics are available to Admins and Super Admins." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={TrendingUp}
        title="Platform Growth & Analytics"
        description="Explore registration, publishing and points activity using live platform records."
        accent="aqua"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="border-border" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button variant="brand" onClick={() => data && exportGrowthCsv(data, canViewPoints)} disabled={!data?.series.length}>
              <Download className="size-4" /> Export CSV
            </Button>
          </div>
        }
      />

      <AdminCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Reporting period</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{startLabel} – {endLabel}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Compared with the immediately preceding {days}-day period.</p>
        </div>
        <AdminSegmented
          options={[
            { id: "7" as const, label: "7 days" },
            { id: "30" as const, label: "30 days" },
            { id: "90" as const, label: "90 days" },
          ]}
          value={days}
          onChange={(next) => setDays(next)}
        />
      </AdminCard>

      {isLoading && <AdminStatSkeleton count={5} />}
      {isError && <AdminErrorState message={error instanceof Error ? error.message : "Analytics could not be loaded."} onRetry={() => refetch()} />}

      {data && !isError && (
        <>
          <div className={`grid grid-cols-2 gap-4 ${canViewPoints ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
            {canViewAccounts && <AdminStatCard
              icon={Users}
              label={`New users (${days}d)`}
              value={formatCount(totals?.newUsers ?? 0)}
              trend={percentChange(totals?.newUsers ?? 0, totals?.previousNewUsers ?? 0)}
              hint="Versus previous period"
              tone="primary"
            />}
            {canViewContent && <AdminStatCard
              icon={FileText}
              label={`New posts (${days}d)`}
              value={formatCount(totals?.newPosts ?? 0)}
              trend={percentChange(totals?.newPosts ?? 0, totals?.previousNewPosts ?? 0)}
              hint="Versus previous period"
              tone="info"
            />}
            {canViewPoints && <AdminStatCard
              icon={Coins}
              label={`Points activity (${days}d)`}
              value={`${formatCount(totals?.pointsActivity ?? 0)} pts`}
              trend={percentChange(totals?.pointsActivity ?? 0, totals?.previousPointsActivity ?? 0)}
              hint="Gift and fee transaction volume"
              tone="success"
            />}
            {canViewAccounts && <AdminStatCard
              icon={UserRoundCheck}
              label="Registered users"
              value={formatCount(totals?.totalUsers ?? 0)}
              hint="Current user accounts"
              tone="accent"
            />}
            {canViewAccounts && <AdminStatCard
              icon={Activity}
              label="Creators"
              value={formatCount(totals?.totalCreators ?? 0)}
              hint="Current creator accounts"
              tone="warning"
            />}
          </div>

          <AdminCard className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <AdminCardHeader title="Platform activity" subtitle="Daily counts from registered users, posts and points transactions" />
              <AdminSegmented
                size="sm"
                options={[
                  { id: "all" as const, label: canViewAccounts && canViewContent ? "Users + posts" : canViewAccounts ? "Users" : canViewContent ? "Posts" : "Activity" },
                  ...(canViewAccounts ? [{ id: "users" as const, label: "Users" }] : []),
                  ...(canViewContent ? [{ id: "posts" as const, label: "Posts" }] : []),
                  { id: "active" as const, label: "Active users" },
                  ...(canViewContent ? [{ id: "views" as const, label: "Views" }] : []),
                  ...(canViewPoints ? [{ id: "points" as const, label: "Points" }] : []),
                ]}
                value={visibleMetricView}
                onChange={setMetricView}
              />
            </div>
            <div className="mt-4">
              {combinedData.length ? (
                <AdminLineChart data={combinedData} series={visibleSeries} height={320} />
              ) : (
                <AdminEmptyState icon={Activity} title="No activity in this period" description="Analytics will appear here as platform activity is recorded." />
              )}
            </div>
          </AdminCard>

          {canViewAccounts && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard icon={UserCheck} label="Day 1 retention" value={data.retention?.day1?.rate == null ? "Not enough cohort data" : `${data.retention.day1.rate}%`} hint={`${formatCount(data.retention?.day1?.returnedUsers ?? 0)} of ${formatCount(data.retention?.day1?.cohortUsers ?? 0)} users returned on day 1`} tone="aqua" />
            <AdminStatCard icon={UserRoundCheck} label="Day 7 retention" value={data.retention?.day7?.rate == null ? "Not enough cohort data" : `${data.retention.day7.rate}%`} hint={`${formatCount(data.retention?.day7?.returnedUsers ?? 0)} of ${formatCount(data.retention?.day7?.cohortUsers ?? 0)} users returned on day 7`} tone="success" />
            <AdminStatCard icon={Activity} label="Tracked interaction sessions" value={formatCount(data.sessionInsights?.trackedSessions ?? 0)} hint={`${formatCount(data.sessionInsights?.multiEventSessions ?? 0)} sessions included multiple events`} tone="primary" />
            <AdminStatCard icon={Clock3} label="Observed interaction span" value={`${Number(data.sessionInsights?.averageObservedInteractionSpanMinutes || 0).toFixed(1)} min`} hint="First-to-last event for recorded session IDs; not full visit duration" tone="warning" />
          </div>}

          {!canViewAccounts && <div className="grid gap-4 sm:grid-cols-2"><AdminStatCard icon={Activity} label="Tracked interaction sessions" value={formatCount(data.sessionInsights?.trackedSessions ?? 0)} hint={`${formatCount(data.sessionInsights?.multiEventSessions ?? 0)} sessions included multiple events`} tone="primary"/><AdminStatCard icon={Clock3} label="Observed interaction span" value={`${Number(data.sessionInsights?.averageObservedInteractionSpanMinutes || 0).toFixed(1)} min`} hint="First-to-last event for recorded session IDs; not full visit duration" tone="warning"/></div>}

          {canViewAccounts && <div className="grid gap-5 lg:grid-cols-2">
            <AdminCard className="p-5">
              <AdminCardHeader title="Recorded device sessions" subtitle="Device labels saved when users open account settings; partial coverage, not all app visits." />
              <div className="mt-4 space-y-3">
                {(data.deviceBreakdown || []).length ? data.deviceBreakdown.map((device) => {
                  const total = data.deviceBreakdown.reduce((sum, item) => sum + item.sessions, 0);
                  const percent = total ? Math.round((device.sessions / total) * 100) : 0;
                  return <div key={device.device}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="font-semibold">{device.device}</span><span className="tabular-nums text-muted-foreground">{formatCount(device.sessions)} · {percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div></div>;
                }) : <AdminEmptyState icon={Smartphone} title="No recorded device sessions" description="Device insights appear when account settings save device-session records." />}
              </div>
            </AdminCard>
            <AdminCard className="p-5">
              <AdminCardHeader title="Measurement notes" subtitle="Read these before interpreting the metrics." />
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">{(data.dataNotes || []).map((note) => <li key={note} className="flex gap-2"><span className="text-primary">•</span><span>{note}</span></li>)}</ul>
            </AdminCard>
          </div>}

          {(canViewAccounts || canViewContent) && <div className="grid gap-5 lg:grid-cols-2">
            {canViewAccounts && <AdminCard className="p-5">
              <AdminCardHeader title="User registrations" subtitle={`New accounts per day · ${days} days`} />
              <div className="mt-4">
                <AdminAreaChart data={combinedData} dataKey="New users" height={240} colorIndex={1} />
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-[11px] font-semibold text-muted-foreground">Daily average</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-foreground tabular-nums">{formatCount(Math.round((totals?.newUsers ?? 0) / Number(days)))} <span className="text-xs font-semibold text-muted-foreground">users / day</span></p>
              </div>
            </AdminCard>}

            {canViewContent && <AdminCard className="p-5">
              <AdminCardHeader title="Publishing activity" subtitle={`New posts per day · ${days} days`} />
              <div className="mt-4">
                <AdminAreaChart data={combinedData} dataKey="New posts" height={240} colorIndex={4} />
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-[11px] font-semibold text-muted-foreground">Daily average</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-foreground tabular-nums">{formatCount(Math.round((totals?.newPosts ?? 0) / Number(days)))} <span className="text-xs font-semibold text-muted-foreground">posts / day</span></p>
              </div>
            </AdminCard>}
          </div>}

          {canViewPoints && <AdminCard className="p-5">
            <AdminCardHeader title="Points economy activity" subtitle="Absolute value of gift and fee transactions recorded during the selected period" />
            <div className="mt-4">
              <AdminAreaChart data={combinedData} dataKey="Points activity" height={230} colorIndex={2} />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">Selected-period points activity</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-success tabular-nums">{formatCount(totals?.pointsActivity ?? 0)} <span className="text-xs font-semibold text-muted-foreground">pts</span></p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-muted-foreground">Previous period</p>
                <p className="mt-1 text-sm font-bold text-foreground tabular-nums">{formatCount(totals?.previousPointsActivity ?? 0)} pts</p>
              </div>
            </div>
          </AdminCard>}

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Analytics are based on persisted account, post and interaction records. {canViewPoints ? "Points activity is a platform-points volume measure, not a cash-revenue or profit figure." : "Financial and points metrics are hidden unless explicitly assigned."}
          </p>
        </>
      )}
    </div>
  );
}
