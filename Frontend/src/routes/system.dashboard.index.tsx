import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Users, Wallet, Radio, Target, FileText, UserX } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABEL } from "@/lib/permissions";
import { formatCount } from "@/lib/format";

export const Route = createFileRoute("/system/dashboard/")({
  component: DashboardIndex,
});

function useOverview() {
  return useQuery({
    queryKey: ["staff", "overview"],
    queryFn: () => api.get<{ stats: Record<string, number>; role: string }>("/system/overview", true),
  });
}

const cards: { key: string; label: string; icon: typeof Users; to: string; tone: string }[] = [
  { key: "pendingReports", label: "Pending reports", icon: AlertTriangle, to: "/system/dashboard/moderation", tone: "text-danger bg-danger/10" },
  { key: "totalUsers", label: "Total users", icon: Users, to: "/system/dashboard/accounts", tone: "text-info bg-sky-500/10" },
  { key: "newUsers24h", label: "New users (24h)", icon: Users, to: "/system/dashboard/accounts", tone: "text-success bg-emerald-500/10" },
  { key: "suspendedAccounts", label: "Suspended/banned", icon: UserX, to: "/system/dashboard/accounts", tone: "text-warning bg-amber-500/10" },
  { key: "pendingPayments", label: "Payments pending", icon: Wallet, to: "/system/dashboard/payments", tone: "text-primary bg-indigo-500/10" },
  { key: "liveNow", label: "Live right now", icon: Radio, to: "/system/dashboard/live", tone: "text-danger bg-danger/10" },
  { key: "pendingCampaigns", label: "Ad campaigns to review", icon: Target, to: "/system/dashboard/campaigns", tone: "text-accent bg-violet-500/10" },
  { key: "totalPosts", label: "Total posts", icon: FileText, to: "/system/dashboard/moderation", tone: "text-muted-foreground bg-muted" },
];

function DashboardIndex() {
  const { staffUser } = useAuth();
  const { data, isLoading } = useOverview();
  const stats = data?.stats ?? {};
  const visible = cards.filter((c) => stats[c.key] !== undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {staffUser?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-semibold text-primary">{staffUser ? ROLE_LABEL[staffUser.role] : ""}</span> — here's what needs attention.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading overview…</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((c) => (
            <Link
              key={c.key}
              to={c.to}
              className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted"
            >
              <span className={`mb-3 grid size-9 place-items-center rounded-xl ${c.tone}`}>
                <c.icon className="size-4.5" />
              </span>
              <p className="font-display text-2xl font-extrabold text-foreground">{formatCount(stats[c.key] ?? 0)}</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground group-hover:text-foreground/80">{c.label}</p>
            </Link>
          ))}
          {!visible.length && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              Nothing to show yet for your role.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
