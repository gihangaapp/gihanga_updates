/**
 * Achievement Badge Row — renders ALL configured badges (locked + unlocked)
 * in two visually distinct groups separated by a thin divider:
 *
 *   [★ Red  ★ Gold  ★ Blue]  │  [◆ Red  ◆ Green  ◆ Blue]
 *        Stars (followers)          Diamonds (views)
 *
 * Each badge is a button that opens a Radix Popover with the detail panel.
 * Locked badges are outlined silhouettes; unlocked badges are filled — but
 * the earned/locked state is NEVER communicated by color alone (each badge
 * also carries an accessible label and the popover states it explicitly).
 *
 * Placement: directly below the profile bio/stats, before the action buttons
 * (matches the supplied wireframe). Responsive: wraps on small screens, never
 * overflows horizontally.
 */
import { useState } from "react";
import { BadgeState, BadgeProgress } from "@/lib/api-client";
import { BadgeIconSvg, BadgeColor } from "./badge-icons";
import { AchievementBadgeDetail } from "./AchievementBadgeDetail";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/format";

interface AchievementBadgeRowProps {
  /** All configured badges for this profile (locked + unlocked). */
  badges: BadgeState[];
  /** When the viewer is the profile owner, the detailed progress (current/remaining/%). */
  progress?: BadgeProgress[] | undefined;
  /** Whether to show skeleton placeholders while loading. */
  isLoading?: boolean | undefined;
}

function BadgeButton({
  badge,
  progress,
}: {
  badge: BadgeState;
  progress?: BadgeProgress[] | undefined;
}) {
  const [open, setOpen] = useState(false);
  const { value: colorValue } = (() => {
    // resolveBadgeColor is in badge-icons but we import statically to avoid a cycle
    const map: Record<BadgeColor, string> = {
      red: "var(--color-danger)",
      gold: "var(--color-warning)",
      blue: "var(--color-info)",
      green: "var(--color-success)",
    };
    return { value: map[badge.color] };
  })();

  const detailed = progress?.find((p) => p.achievementId === badge.achievementId);
  const thresholdLabel =
    badge.threshold >= 1_000_000
      ? `${badge.threshold / 1_000_000}M`
      : badge.threshold >= 1_000
        ? `${badge.threshold / 1_000}K`
        : String(badge.threshold);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${badge.name} — ${badge.earned ? "earned" : "locked"}: ${thresholdLabel} ${badge.metric}`}
          className={cn(
            "press group flex flex-col items-center gap-1.5 rounded-xl px-2 py-1.5 outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "transition-transform hover:-translate-y-0.5",
          )}
        >
          <span
            className={cn(
              "grid place-items-center rounded-full p-0.5 transition-all",
              badge.earned && "drop-shadow-sm",
            )}
            style={badge.earned ? { filter: `drop-shadow(0 2px 6px ${colorValue}40)` } : undefined}
          >
            <BadgeIconSvg icon={badge.icon} color={badge.color} filled={badge.earned} size={38} />
          </span>
          <span className="flex flex-col items-center leading-none">
            <span
              className={cn(
                "text-[11px] font-extrabold tabular-nums",
                badge.earned ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {thresholdLabel}
            </span>
            <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
              {badge.metric === "followers" ? "followers" : "views"}
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-auto border-border bg-popover p-3 text-popover-foreground shadow-float"
      >
        <AchievementBadgeDetail badge={badge} progress={detailed} />
      </PopoverContent>
    </Popover>
  );
}

function BadgeSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2 py-1.5">
      <div className="size-[38px] animate-pulse rounded-full bg-muted" />
      <div className="h-2.5 w-6 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function AchievementBadgeRow({ badges, progress, isLoading }: AchievementBadgeRowProps) {
  if (isLoading) {
    return (
      <div
        className="flex flex-wrap items-center gap-2"
        aria-busy="true"
        aria-label="Loading achievements"
      >
        <BadgeSkeleton />
        <BadgeSkeleton />
        <BadgeSkeleton />
        <span className="mx-1 h-8 w-px bg-border" aria-hidden />
        <BadgeSkeleton />
        <BadgeSkeleton />
        <BadgeSkeleton />
      </div>
    );
  }

  if (!badges || badges.length === 0) return null;

  const stars = badges.filter((b) => b.category === "stars");
  const diamonds = badges.filter((b) => b.category === "diamonds");

  return (
    <section aria-label="Achievement badges" className="flex flex-wrap items-start gap-1.5">
      {stars.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-0.5"
          role="group"
          aria-label="Gihanga Stars — follower milestones"
        >
          {stars.map((b) => (
            <BadgeButton key={b.achievementId} badge={b} progress={progress} />
          ))}
        </div>
      )}
      {stars.length > 0 && diamonds.length > 0 && (
        <span className="mx-1 h-10 w-px self-center bg-border" aria-hidden />
      )}
      {diamonds.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-0.5"
          role="group"
          aria-label="Gihanga Diamonds — view milestones"
        >
          {diamonds.map((b) => (
            <BadgeButton key={b.achievementId} badge={b} progress={progress} />
          ))}
        </div>
      )}
      {badges.some((b) => b.earned) && (
        <p className="sr-only">
          Earned:{" "}
          {badges
            .filter((b) => b.earned)
            .map((b) => b.name)
            .join(", ")}
          . Locked:{" "}
          {badges
            .filter((b) => !b.earned)
            .map((b) => `${b.name} (${formatCount(b.threshold)} ${b.metric})`)
            .join(", ")}
          .
        </p>
      )}
    </section>
  );
}
