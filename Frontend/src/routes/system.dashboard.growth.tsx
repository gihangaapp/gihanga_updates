import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, TrendingUp, Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatCount } from "@/lib/format";

export const Route = createFileRoute("/system/dashboard/growth")({
  component: GrowthPage,
});

interface GrowthData {
  series: { date: string; newUsers: number; newPosts: number; revenue: number }[];
  totals: { newUsers30d: number; newPosts30d: number; revenue30d: number; totalUsers: number; totalCreators: number };
}

const tooltipStyle = { background: "#0D111C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, color: "#fff" };

function GrowthPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "growth"],
    queryFn: () => api.get<GrowthData>("/system/growth", true),
  });

  const chartData = (data?.series ?? []).map((d) => ({
    day: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    newUsers: d.newUsers,
    revenue: d.revenue,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
          <TrendingUp className="size-6 text-success" /> Platform Growth
        </h1>
        <p className="text-sm text-muted-foreground">Real signups, posts, and revenue over the last 30 days.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total users", value: data?.totals.totalUsers ?? 0, icon: Users },
              { label: "Total creators", value: data?.totals.totalCreators ?? 0, icon: Sparkles },
              { label: "New users (30d)", value: data?.totals.newUsers30d ?? 0, icon: TrendingUp },
              { label: "New posts (30d)", value: data?.totals.newPosts30d ?? 0, icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                <s.icon className="mb-2 size-4 text-primary" />
                <p className="font-display text-2xl font-extrabold text-foreground">{formatCount(s.value)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-bold text-foreground">New users, last 30 days</h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -18, right: 6, top: 6 }}>
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818CF8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="#64748b" />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={40} stroke="#64748b" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="newUsers" stroke="#818CF8" strokeWidth={2.5} fill="url(#growthFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-1 text-sm font-bold text-foreground">Platform revenue (30d)</h2>
            <p className="text-3xl font-extrabold text-success">{formatCount(data?.totals.revenue30d ?? 0)} pts</p>
            <p className="mt-1 text-xs text-muted-foreground">From gifts and ad spend combined.</p>
          </div>
        </>
      )}
    </div>
  );
}
