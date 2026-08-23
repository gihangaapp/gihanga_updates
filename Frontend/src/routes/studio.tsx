import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  BarChart3,
  Eye,
  Film,
  Heart,
  Plus,
  Radio,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { openCreate } from "@/components/feed/CreateSheet";
import { useFeedState } from "@/lib/feed-store";
import { formatCount } from "@/lib/format";
import { mediaUrl } from "@/lib/api-client";
import { useStudioAnalytics } from "@/hooks/use-studio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Creator Studio — Gihanga Updates" },
      {
        name: "description",
        content:
          "Track views, followers and earnings, manage scheduled posts and drafts, and understand your audience in Gihanga Creator Studio.",
      },
      { property: "og:title", content: "Creator Studio — Gihanga Updates" },
      {
        property: "og:description",
        content: "Analytics, content management and audience insights for Gihanga creators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudioPage,
});

const ranges = ["7d", "30d", "90d"] as const;
const pieColors = [
  "oklch(0.62 0.13 205)",
  "oklch(0.72 0.13 190)",
  "oklch(0.55 0.11 240)",
  "oklch(0.78 0.1 175)",
  "oklch(0.46 0.09 250)",
];

function rwf(n: number) {
  return `${formatCount(n)} pts`;
}

function Stat({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  icon: typeof Eye;
}) {
  return (
    <div className="surface-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-4" />
        </span>
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      </div>
      <p className="font-display text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-success">
        <TrendingUp className="size-3" /> {delta}
      </p>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-card)",
  color: "var(--color-foreground)",
  fontSize: 12,
} as const;

function StudioPage() {
  const [range, setRange] = useState<(typeof ranges)[number]>("30d");
  const [metric, setMetric] = useState<"views" | "followers" | "earnings">("views");
  const [filter, setFilter] = useState<"all" | "published" | "scheduled" | "draft">("all");
  const { scheduled } = useFeedState();
  const { data, isLoading } = useStudioAnalytics();

  const days = range === "7d" ? (data?.dailyStats ?? []).slice(-7) : (data?.dailyStats ?? []);
  const chartData = days.map((d) => ({
    day: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    views: d.views,
    followers: d.followers,
    earnings: d.earnings,
  }));

  const rows = [
    ...scheduled.map((s) => ({
      id: s.id,
      title: s.body || "Untitled draft",
      image: s.image,
      status: "scheduled" as const,
      views: 0,
      engagement: 0,
      earnings: 0,
      date: s.scheduledFor?.replace("T", " · ") ?? "—",
    })),
    ...(data?.topContent ?? []).map((r) => ({
      id: r._id,
      title: r.body || `${r.kind} post`,
      image: mediaUrl(r.thumbnailUrl || r.mediaUrl),
      status: "published" as "published" | "scheduled" | "draft",
      views: r.views,
      engagement: r.views ? Math.round(((r.likes + r.comments) / Math.max(r.views, 1)) * 1000) / 10 : 0,
      earnings: 0,
      date: new Date(r.createdAt).toLocaleDateString(),
    })),
  ].filter((r) => filter === "all" || r.status === filter);

  if (isLoading) {
    return (
      <AppShell>
        <p className="py-16 text-center text-sm text-muted-foreground">Loading your studio…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[900px]">
        <header className="mb-4 flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-extrabold tracking-tight">Creator Studio</h1>
            <p className="text-sm text-muted-foreground">
              Your performance, content pipeline and audience — real numbers, updated live.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/wallet">
              <Wallet className="size-4" /> Wallet
            </Link>
          </Button>
          <Button variant="brand" onClick={() => openCreate("post")}>
            <Plus strokeWidth={3} /> Create
          </Button>
        </header>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Views (30d)" value={formatCount(data?.totals.totalViews ?? 0)} delta={`${data?.totals.posts ?? 0} posts`} icon={Eye} />
          <Stat label="New followers" value={formatCount(data?.totals.newFollowers30d ?? 0)} delta={`${formatCount(data?.totals.followers ?? 0)} total`} icon={UserPlus} />
          <Stat label="Likes (30d)" value={formatCount(data?.totals.totalLikes ?? 0)} delta="across all posts" icon={Heart} />
          <Stat
            label="Earnings (30d)"
            value={rwf((data?.revenueSplit ?? []).reduce((s, r) => s + r.value, 0))}
            delta={`${formatCount(data?.adSpend30d ?? 0)} ad spend`}
            icon={BarChart3}
          />
        </div>

        <section className="surface-card mb-4 p-4">
          <header className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="mr-auto font-display text-base font-bold">Performance</h2>
            <div className="flex gap-1 rounded-xl bg-elevated p-1">
              {(["views", "followers", "earnings"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetric(m)}
                  className={cn(
                    "press rounded-lg px-2.5 py-1 text-xs font-bold capitalize",
                    metric === m ? "bg-card text-primary shadow-soft" : "text-muted-foreground",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-1 rounded-xl bg-elevated p-1">
              {ranges.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    "press rounded-lg px-2.5 py-1 text-xs font-bold",
                    range === r ? "bg-card text-primary shadow-soft" : "text-muted-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </header>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -18, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="studioFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.13 195)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.68 0.13 195)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={54} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke="oklch(0.68 0.13 195)"
                  strokeWidth={2.5}
                  fill="url(#studioFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <section className="surface-card p-4">
            <h2 className="mb-3 font-display text-base font-bold">Revenue split (30d)</h2>
            {(data?.revenueSplit ?? []).some((r) => r.value > 0) ? (
              <div className="flex items-center gap-3">
                <div className="h-40 w-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data?.revenueSplit ?? []} dataKey="value" nameKey="label" innerRadius={38} outerRadius={68}>
                        {(data?.revenueSplit ?? []).map((_, i) => (
                          <Cell key={i} fill={pieColors[i % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="min-w-0 flex-1 space-y-1.5">
                  {(data?.revenueSplit ?? []).map((c, i) => (
                    <li key={c.label} className="flex items-center gap-2 text-sm">
                      <span className="size-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                      <span className="min-w-0 flex-1 truncate">{c.label}</span>
                      <span className="font-bold">{formatCount(c.value)} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No earnings yet this period.</p>
            )}
          </section>

          <section className="surface-card p-4">
            <h2 className="mb-3 font-display text-base font-bold">Audience insights</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{data?.note}</p>
          </section>
        </div>

        <section className="surface-card mb-4 overflow-hidden">
          <header className="flex flex-wrap items-center gap-2 border-b border-border p-4">
            <h2 className="mr-auto font-display text-base font-bold">Content</h2>
            {(["all", "published", "scheduled", "draft"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "press rounded-lg px-2.5 py-1 text-xs font-bold capitalize",
                  filter === f ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {f}
              </button>
            ))}
          </header>
          <ul className="divide-y divide-border">
            {rows.length === 0 && (
              <li className="p-8 text-center text-sm text-muted-foreground">No content yet — create your first post.</li>
            )}
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-3">
                <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-elevated">
                  {r.image ? (
                    <img src={r.image} alt="" loading="lazy" className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center text-muted-foreground">
                      <Film className="size-4" />
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{r.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.date} · {formatCount(r.views)} views · {r.engagement}% eng
                  </span>
                </span>
                <span
                  className={cn(
                    "hidden shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold capitalize sm:block",
                    r.status === "published" && "bg-success/12 text-success",
                    r.status === "scheduled" && "bg-warning/12 text-warning",
                    r.status === "draft" && "bg-muted text-muted-foreground",
                  )}
                >
                  {r.status}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open insights"
                  onClick={() => toast("Post insights", { description: r.title.slice(0, 60) })}
                >
                  <ArrowUpRight />
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card halo flex flex-wrap items-center gap-3 p-4">
          <span className="grid size-10 place-items-center rounded-2xl bg-danger/12 text-danger">
            <Radio className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <p className="font-display text-base font-bold">
              Go live to your {formatCount(data?.totals.followers ?? 0)} followers
            </p>
            <p className="text-sm text-muted-foreground">Live sessions are a great way to connect in real time.</p>
          </span>
          <Button variant="brand" asChild>
            <Link to="/live">Start setup</Link>
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
