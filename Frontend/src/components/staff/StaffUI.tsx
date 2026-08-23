import { motion } from "motion/react";
import { type LucideIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/** Base surface card used everywhere in the staff console — theme-aware. */
export function StaffCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card/60 backdrop-blur-sm", className)}>{children}</div>
  );
}

export function StaffPageHeader({
  icon: Icon,
  title,
  description,
  accent = "primary",
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  accent?: "primary" | "danger" | "success" | "warning" | "accent";
  action?: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    danger: "bg-danger/10 text-danger",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/15 text-accent",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-start justify-between gap-3"
    >
      <div className="flex items-start gap-3">
        <span className={cn("mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl", tones[accent])}>
          <Icon className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action}
    </motion.div>
  );
}

export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
  delay = 0,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "primary" | "danger" | "success" | "warning" | "accent" | "info";
  delay?: number;
  onClick?: () => void;
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    danger: "bg-danger/10 text-danger",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/15 text-accent",
    info: "bg-info/10 text-info",
  };
  const Comp: any = onClick ? motion.button : motion.div;
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={onClick ? { y: -2 } : undefined}
      className={cn(
        "rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-shadow",
        onClick && "cursor-pointer hover:shadow-md",
      )}
    >
      <span className={cn("mb-3 grid size-9 place-items-center rounded-xl", tones[tone])}>
        <Icon className="size-4.5" />
      </span>
      <p className="font-display text-2xl font-extrabold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground/70">{hint}</p>}
    </Comp>
  );
}

export function StaffBadge({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "primary" | "danger" | "success" | "warning" | "accent" | "info";
  className?: string;
}) {
  const tones: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary-soft text-primary",
    danger: "bg-danger/10 text-danger",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/15 text-accent",
    info: "bg-info/10 text-info",
  };
  return (
    <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-bold capitalize", tones[tone], className)}>
      {children}
    </span>
  );
}

export function StaffEmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
      <Icon className="size-7 text-muted-foreground" />
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-xs text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export function StaffErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-danger/20 bg-danger/5 py-10 text-center">
      <p className="text-sm font-semibold text-danger">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="press flex items-center gap-1.5 rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/15"
        >
          <RefreshCw className="size-3.5" /> Retry
        </button>
      )}
    </div>
  );
}

export function StaffToggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <motion.span
        className="absolute top-0.5 size-5 rounded-full bg-white shadow"
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />
    </button>
  );
}

export function StaffSkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/60" />
      ))}
    </div>
  );
}
