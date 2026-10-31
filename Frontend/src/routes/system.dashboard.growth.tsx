import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Coins, Download, FileText, RefreshCw, TrendingUp, Users, UserRoundCheck, Activity } from "lucide-react";
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
  series: { date: string; newUsers: number; newPosts: number; pointsActivity: number; revenue: number }[];
  totals: {
    rangeDays: number;
    newUsers: number;
    newPosts: number;
    pointsActivity: number;
    previousNewUsers: number;
    previousNewPosts: number;
    previousPointsActivity: number;
    totalUsers: number;
    totalCreators: number;
  };
}

type MetricView = "all" | "users" | "posts" | "points";
type RangeDays = "7" | "30" | "90";

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

function exportGrowthCsv(data: GrowthData) {
  if (!data.series.length) {
    toast.error("There is no analytics data to export yet.");
    return;
  }
  const rows = [
    ["Date", "New users", "New posts", "Points activity"],
    ...data.series.map((item) => [item.date, item.newUsers, item.newPosts, item.pointsActivity]),
  ];
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
        "New users": item.newUsers,
        "New posts": item.newPosts,
        "Points activity": item.pointsActivity,
      })),
    [data],
  );

  const visibleSeries = useMemo(() => {
    if (metricView === "users") return [{ key: "New users", name: "New users", colorIndex: 1 as const }];
    if (metricView === "posts") return [{ key: "New posts", name: "New posts", colorIndex: 4 as const }];
    if (metricView === "points") return [{ key: "Points activity", name: "Points activity", colorIndex: 2 as const }];
    return [
      { key: "New users", name: "New users", colorIndex: 1 as const },
      { key: "New posts", name: "New posts", colorIndex: 4 as const },
    ];
  }, [metricView]);

  const startLabel = data?.range?.from
    ? new Date(data.range.from).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "—";
  const endLabel = data?.range?.to
    ? new Date(data.range.to).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "—";
  const totals = data?.totals;

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
            <Button variant="brand" onClick={() => data && exportGrowthCsv(data)} disabled={!data?.series.length}>
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
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            <AdminStatCard
              icon={Users}
              label={`New users (${days}d)`}
              value={formatCount(totals?.newUsers ?? 0)}
              trend={percentChange(totals?.newUsers ?? 0, totals?.previousNewUsers ?? 0)}
              hint="Versus previous period"
              tone="primary"
            />
            <AdminStatCard
              icon={FileText}
              label={`New posts (${days}d)`}
              value={formatCount(totals?.newPosts ?? 0)}
              trend={percentChange(totals?.newPosts ?? 0, totals?.previousNewPosts ?? 0)}
              hint="Versus previous period"
              tone="info"
            />
            <AdminStatCard
              icon={Coins}
              label={`Points activity (${days}d)`}
              value={`${formatCount(totals?.pointsActivity ?? 0)} pts`}
              trend={percentChange(totals?.pointsActivity ?? 0, totals?.previousPointsActivity ?? 0)}
              hint="Gift and fee transaction volume"
              tone="success"
            />
            <AdminStatCard
              icon={UserRoundCheck}
              label="Registered users"
              value={formatCount(totals?.totalUsers ?? 0)}
              hint="Current user accounts"
              tone="accent"
            />
            <AdminStatCard
              icon={Activity}
              label="Creators"
              value={formatCount(totals?.totalCreators ?? 0)}
              hint="Current creator accounts"
              tone="warning"
            />
          </div>

          <AdminCard className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <AdminCardHeader title="Platform activity" subtitle="Daily counts from registered users, posts and points transactions" />
              <AdminSegmented
                size="sm"
                options={[
                  { id: "all" as const, label: "Users + posts" },
                  { id: "users" as const, label: "Users" },
                  { id: "posts" as const, label: "Posts" },
                  { id: "points" as const, label: "Points" },
                ]}
                value={metricView}
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

          <div className="grid gap-5 lg:grid-cols-2">
            <AdminCard className="p-5">
              <AdminCardHeader title="User registrations" subtitle={`New accounts per day · ${days} days`} />
              <div className="mt-4">
                <AdminAreaChart data={combinedData} dataKey="New users" height={240} colorIndex={1} />
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-[11px] font-semibold text-muted-foreground">Daily average</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-foreground tabular-nums">{formatCount(Math.round((totals?.newUsers ?? 0) / Number(days)))} <span className="text-xs font-semibold text-muted-foreground">users / day</span></p>
              </div>
            </AdminCard>

            <AdminCard className="p-5">
              <AdminCardHeader title="Publishing activity" subtitle={`New posts per day · ${days} days`} />
              <div className="mt-4">
                <AdminAreaChart data={combinedData} dataKey="New posts" height={240} colorIndex={4} />
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-[11px] font-semibold text-muted-foreground">Daily average</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-foreground tabular-nums">{formatCount(Math.round((totals?.newPosts ?? 0) / Number(days)))} <span className="text-xs font-semibold text-muted-foreground">posts / day</span></p>
              </div>
            </AdminCard>
          </div>

          <AdminCard className="p-5">
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
          </AdminCard>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Analytics are based on persisted account, post and transaction records. Points activity is a platform-points volume measure, not a cash-revenue or profit figure.
          </p>
        </>
      )}
    </div>
  );
}
