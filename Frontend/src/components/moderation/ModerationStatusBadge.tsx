import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
} from "lucide-react";

export type ModerationStatus =
  | "processing"
  | "pending_review"
  | "approved"
  | "rejected"
  | "failed";

const STATUS_CONFIG: Record<
  ModerationStatus,
  { label: string; hint: string; icon: typeof Clock; tone: string }
> = {
  processing: {
    label: "Checking your content",
    hint: "This is visible to you only while our safety systems review it.",
    icon: Loader2,
    tone: "bg-primary/10 text-primary border-primary/20",
  },
  pending_review: {
    label: "Needs review",
    hint: "Our safety systems need a closer look — it will be reviewed before becoming visible to others.",
    icon: Clock,
    tone: "bg-warning/10 text-warning border-warning/25",
  },
  approved: {
    label: "Published",
    hint: "",
    icon: CheckCircle2,
    tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  rejected: {
    label: "Could not be published",
    hint: "",
    icon: ShieldAlert,
    tone: "bg-danger/10 text-danger border-danger/25",
  },
  failed: {
    label: "Processing failed",
    hint: "Nothing was published. You can safely try again.",
    icon: AlertTriangle,
    tone: "bg-muted text-muted-foreground border-border",
  },
};

/**
 * Non-graphic, user-safe moderation status chip + explanation.
 * Mirrors the backend's `moderation.userMessage` when present — never
 * thresholds, provider names or internal detail.
 */
export function ModerationStatusBadge({
  status,
  userMessage,
  onRetry,
  onAppeal,
  compact = false,
}: {
  status: ModerationStatus;
  userMessage?: string | undefined;
  onRetry?: (() => void) | undefined;
  onAppeal?: (() => void) | undefined;
  compact?: boolean;
}) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.processing;
  const Icon = config.icon;

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
          config.tone,
        )}
      >
        <Icon className={cn("size-3", status === "processing" && "animate-spin")} />
        {config.label}
      </span>
    );
  }

  return (
    <div className={cn("rounded-2xl border p-3 sm:p-4", config.tone)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4 shrink-0", status === "processing" && "animate-spin")} />
        <p className="text-sm font-bold">{config.label}</p>
      </div>
      {(userMessage || config.hint) && (
        <p className="mt-1 text-xs leading-relaxed opacity-90">{userMessage || config.hint}</p>
      )}
      {(status === "failed" || status === "rejected") && (
        <div className="mt-2 flex flex-wrap gap-2">
          {status === "failed" && onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          )}
          {status === "rejected" && onAppeal && (
            <Button size="sm" variant="outline" onClick={onAppeal}>
              Appeal this decision
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
