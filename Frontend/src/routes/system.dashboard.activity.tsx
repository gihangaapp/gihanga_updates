import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Activity, Clock, Trophy } from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminBadge,
  AdminEmptyState,
  AdminSkeletonRows,
  AdminAvatar,
} from "@/components/system/AdminUI";
import { useStaffActivity } from "@/hooks/use-staff-notifications";
import { timeAgo } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/permissions";

export const Route = createFileRoute("/system/dashboard/activity")({
  component: StaffActivityPage,
});

function StaffActivityPage() {
  const { data, isLoading } = useStaffActivity();
  const activity = data?.activity ?? [];
  const maxCount = Math.max(...activity.map((a) => a.actionCount), 1);
  const totalActions = activity.reduce((acc, a) => acc + a.actionCount, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Activity}
        title="Staff Activity"
        description="Who's doing what — action counts across the team for the last 30 days."
        accent="accent"
      />

      {isLoading && <AdminSkeletonRows rows={5} />}

      {!isLoading && !activity.length && (
        <AdminEmptyState
          icon={Activity}
          title="No staff activity yet"
          description="Actions taken by staff will show up here."
        />
      )}

      {!isLoading && activity.length > 0 && (
        <>
          {/* Leaderboard podium for top 3 */}
          <div className="grid gap-4 sm:grid-cols-3">
            {activity.slice(0, 3).map((a, i) => (
              <motion.div
                key={a.staffId}
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <AdminCard
                  className={
                    i === 0
                      ? "relative overflow-hidden p-5 ring-1 ring-warning/40"
                      : "p-5"
                  }
                >
                  {i === 0 && (
                    <div
                      className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full opacity-15 blur-2xl"
                      style={{ background: "var(--warning)" }}
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <AdminAvatar name={a.name} hue={(i * 97 + 210) % 360} />
                    <span
                      className={`grid size-8 place-items-center rounded-xl ${
                        i === 0
                          ? "bg-warning/15 text-warning"
                          : i === 1
                            ? "bg-muted text-muted-foreground"
                            : "bg-accent/10 text-accent"
                      }`}
                    >
                      <Trophy className="size-4" />
                    </span>
                  </div>
                  <p className="mt-3 truncate text-sm font-bold text-foreground">{a.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <AdminBadge tone="primary">{ROLE_LABEL[a.role] ?? a.role}</AdminBadge>
                    <span className="text-[11px] text-muted-foreground">@{a.username}</span>
                  </div>
                  <p className="mt-3 font-display text-2xl font-extrabold text-foreground tabular-nums">
                    {a.actionCount}
                    <span className="ml-1 text-xs font-semibold text-muted-foreground">actions</span>
                  </p>
                </AdminCard>
              </motion.div>
            ))}
          </div>

          {/* Full list */}
          <AdminCard className="p-5">
            <AdminCardHeader
              title="All team members"
              subtitle={`${totalActions.toLocaleString()} total actions in the last 30 days`}
            />
            <div className="mt-5 space-y-4">
              {activity.map((a, i) => (
                <motion.div
                  key={a.staffId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.4) }}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <AdminAvatar name={a.name} hue={(i * 47) % 360} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[13px] font-bold text-foreground">{a.name}</p>
                        <AdminBadge tone="primary">{ROLE_LABEL[a.role] ?? a.role}</AdminBadge>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">@{a.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-extrabold text-foreground tabular-nums">
                        {a.actionCount}
                      </p>
                      <p className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" /> {timeAgo(a.lastActionAt)} ago
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "var(--gradient-brand)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(a.actionCount / maxCount) * 100}%` }}
                      transition={{ duration: 0.7, delay: Math.min(i * 0.03, 0.4) }}
                    />
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {Object.entries(a.breakdown)
                      .sort(([, x], [, y]) => y - x)
                      .slice(0, 6)
                      .map(([action, count]) => (
                        <AdminBadge key={action} tone="muted">
                          {action} × {count}
                        </AdminBadge>
                      ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </AdminCard>
        </>
      )}
    </div>
  );
}
