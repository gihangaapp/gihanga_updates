import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Activity, Clock } from "lucide-react";
import { StaffPageHeader, StaffCard, StaffEmptyState, StaffSkeletonRows, StaffBadge } from "@/components/staff/StaffUI";
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

  return (
    <div className="space-y-6">
      <StaffPageHeader
        icon={Activity}
        title="Staff Activity"
        description="Who's doing what — action counts across the team for the last 30 days."
        accent="accent"
      />

      {isLoading && <StaffSkeletonRows rows={5} />}

      {!isLoading && !activity.length && (
        <StaffEmptyState icon={Activity} title="No staff activity yet" description="Actions taken by staff will show up here." />
      )}

      <div className="space-y-3">
        {activity.map((a, i) => (
          <motion.div key={a.staffId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}>
            <StaffCard className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-primary-foreground"
                  style={{ backgroundImage: `linear-gradient(140deg, oklch(0.55 0.11 ${(i * 47) % 360}), oklch(0.75 0.1 ${((i * 47) % 360) + 24}))` }}
                >
                  {a.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-foreground">{a.name}</p>
                    <StaffBadge tone="primary">{ROLE_LABEL[a.role] ?? a.role}</StaffBadge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">@{a.username}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-extrabold text-foreground">{a.actionCount}</p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="size-3" /> {timeAgo(a.lastActionAt)} ago
                  </p>
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="gradient-brand h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(a.actionCount / maxCount) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.03 }}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(a.breakdown)
                  .sort(([, x], [, y]) => y - x)
                  .slice(0, 6)
                  .map(([action, count]) => (
                    <span key={action} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {action} × {count}
                    </span>
                  ))}
              </div>
            </StaffCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
