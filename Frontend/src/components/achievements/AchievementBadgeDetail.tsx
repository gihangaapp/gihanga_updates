/**
 * Achievement Badge detail panel — shown in a Radix Popover when a badge is
 * tapped. Different content for locked vs. unlocked badges:
 *
 *   Locked  → name, requirement, current progress, remaining, progress bar,
 *             motivational message.
 *   Unlocked → name, category, "Achievement unlocked!", award date (if available).
 *
 * Progress values come entirely from the backend — the frontend never decides
 * on its own whether a badge is earned or how close it is.
 */
import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { BadgeState, BadgeProgress } from "@/lib/api-client";
import { formatCount } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { resolveBadgeColor } from "./badge-icons";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

const MOTIVATIONAL = [
  "You're getting closer to your next Gihanga achievement!",
  "Keep going — your community is growing.",
  "Every follower brings you one step closer.",
  "Your content is reaching more people every day.",
];

export function AchievementBadgeDetail({
  badge,
  progress,
}: {
  /** Public badge state. When the viewer is the profile owner, pass `progress` too for live values. */
  badge: BadgeState;
  progress?: BadgeProgress | undefined;
}) {
  // Prefer the richer `progress` (owner view); fall back to the public badge state.
  const data: BadgeProgress = progress ?? (badge as BadgeProgress);
  const earned = Boolean(data.earned);
  const { label: colorLabel } = resolveBadgeColor(data.color);
  const awardDate = formatDate(data.awardedAt ?? null);
  const metricLabel = data.metric === "followers" ? "eligible followers" : "eligible content views";

  if (earned) {
    return (
      <div className="w-[280px] space-y-3 p-1">
        <div className="flex items-center gap-2">
          <CheckCircle2
            className="size-5 shrink-0"
            style={{ color: resolveBadgeColor(data.color).value }}
          />
          <div className="min-w-0">
            <p className="font-display text-sm font-bold leading-tight text-foreground">
              {data.name}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {data.category === "stars" ? "Gihanga Star" : "Gihanga Diamond"} · {colorLabel}
            </p>
          </div>
        </div>
        <div className="rounded-lg bg-success/10 px-3 py-2 text-xs font-semibold text-success">
          Achievement unlocked!
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{data.description}</p>
        {awardDate && (
          <p className="text-[11px] text-muted-foreground">
            Awarded on <span className="font-semibold text-foreground">{awardDate}</span>
          </p>
        )}
      </div>
    );
  }

  // Locked badge — show progress toward the threshold.
  const current = data.current ?? 0;
  const remaining = data.remaining ?? data.threshold;
  const pct =
    data.progressPct ??
    (data.threshold ? Math.min(100, Math.round((current / data.threshold) * 100)) : 0);
  const message = MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)] ?? MOTIVATIONAL[0];

  return (
    <div className="w-[280px] space-y-3 p-1">
      <div className="flex items-center gap-2">
        <Lock className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="font-display text-sm font-bold leading-tight text-foreground">
            {data.name}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {data.category === "stars" ? "Gihanga Star" : "Gihanga Diamond"} · {colorLabel}
          </p>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Requirement:{" "}
        <span className="font-semibold text-foreground">{formatCount(data.threshold)}</span>{" "}
        {metricLabel}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {formatCount(current)} / {formatCount(data.threshold)}
          </span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>
      <p className="text-[11px] text-muted-foreground">
        Remaining: <span className="font-semibold text-foreground">{formatCount(remaining)}</span>{" "}
        {data.metric === "followers" ? "followers" : "views"}
      </p>
      <p className="flex items-start gap-1.5 text-[11px] italic leading-relaxed text-foreground/80">
        <Sparkles
          className="size-3.5 shrink-0 mt-0.5 text-warning"
          style={{ color: resolveBadgeColor(data.color).value }}
        />
        {message}
      </p>
    </div>
  );
}
