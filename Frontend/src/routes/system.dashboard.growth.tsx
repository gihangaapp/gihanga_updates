import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Coins, Sparkles, TrendingUp, Users, FileText, Activity } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatCount } from "@/lib/format";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminStatCard,
  AdminStatSkeleton,
} from "@/components/system/AdminUI";
import { AdminAreaChart, AdminLineChart } from "@/components/system/AdminCharts";

export const Route = createFileRoute("/system/dashboard/growth")({
  component: GrowthPage,
});

interface GrowthData {
  series: { date: string; newUsers: number; newPosts: number; revenue: number }[];
  totals: {
    newUsers30d: number;
    newPosts30d: number;
    revenue30d: number;
    totalUsers: number;
    totalCreators: number;
  };
}

function GrowthPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "growth"],
    queryFn: () => api.get<GrowthData>("/system/growth", true),
  });

  const usersData = useMemo(
    () =>
      (data?.series ?? []).map((d) => ({
        label: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        "New users": d.newUsers,
      })),
    [data],
  );

  const combinedData = useMemo(
    () =>
      (data?.series ?? []).map((d) => ({
        label: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        "New users": d.newUsers,
        "New posts": d.newPosts,
      })),
    [data],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={TrendingUp}
        title="Platform Growth"
        description="Real signups, posts, and revenue over the last 30 days."
        accent="success"
      />

      {isLoading ? (
        <AdminStatSkeleton count={4} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <AdminStatCard
              icon={Users}
              label="Total users"
              value={formatCount(data?.totals.totalUsers ?? 0)}
              tone="primary"
              delay={0}
            />
            <AdminStatCard
              icon={Sparkles}
              label="Total creators"
              value={formatCount(data?.totals.totalCreators ?? 0)}
              tone="accent"
              delay={0.06}
            />
            <AdminStatCard
              icon={Users}
              label="New users (30d)"
              value={formatCount(data?.totals.newUsers30d ?? 0)}
              tone="aqua"
              delay={0.12}
            />
            <AdminStatCard
              icon={FileText}
              label="New posts (30d)"
              value={formatCount(data?.totals.newPosts30d ?? 0)}
              tone="info"
              delay={0.18}
            />
          </div>

          <AdminCard className="p-5">
            <AdminCardHeader
              title="Signups & content creation"
              subtitle="Daily new users and posts over the last 30 days"
              action={
                <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-chart-1" /> Users
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-chart-4" /> Posts
                  </span>
                </div>
              }
            />
            <div className="mt-4">
              <AdminLineChart
                data={combinedData}
                series={[
                  { key: "New users", name: "New users", colorIndex: 1 },
                  { key: "New posts", name: "New posts", colorIndex: 4 },
                ]}
                height={300}
              />
            </div>
          </AdminCard>

          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <AdminCard className="p-5">
              <AdminCardHeader title="Member growth" subtitle="New users per day" />
              <div className="mt-4">
                <AdminAreaChart data={usersData} dataKey="New users" height={240} />
              </div>
            </AdminCard>

            <AdminCard className="flex flex-col justify-between p-5">
              <AdminCardHeader
                title={
                  <span className="flex items-center gap-2">
                    <Coins className="size-4 text-success" /> Platform revenue (30d)
                  </span>
                }
                subtitle="From gifts and ad spend combined"
              />
              <div className="mt-6">
                <p className="font-display text-4xl font-extrabold tracking-tight text-success tabular-nums">
                  {formatCount(data?.totals.revenue30d ?? 0)}
                  <span className="ml-1.5 text-base font-bold text-muted-foreground">pts</span>
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 px-3.5 py-2.5 text-xs font-semibold text-success">
                  <Activity className="size-4" />
                  Kingdom Points economy across gifting and ads
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Avg / day</p>
                  <p className="mt-0.5 font-display text-lg font-extrabold text-foreground tabular-nums">
                    {formatCount(Math.round((data?.totals.newUsers30d ?? 0) / 30))}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Posts / day</p>
                  <p className="mt-0.5 font-display text-lg font-extrabold text-foreground tabular-nums">
                    {formatCount(Math.round((data?.totals.newPosts30d ?? 0) / 30))}
                  </p>
                </div>
              </div>
            </AdminCard>
          </div>
        </>
      )}
    </div>
  );
}
