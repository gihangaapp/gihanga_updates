import { useId } from "react";
import { motion } from "motion/react";
import { type LucideIcon, RefreshCw, Search, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Gihanga Updates — Administration Console design kit ("Ocean Deep").
 * Layout language follows the FlowMail-style reference: soft white cards,
 * tinted icon chips, large tabular stat values, pill trend badges and
 * airy spacing — recolored onto Gihanga's navy → teal → aqua brand ramp.
 */

export type AdminTone = "primary" | "aqua" | "danger" | "success" | "warning" | "accent" | "info" | "muted";

const toneChip: Record<AdminTone, string> = {
  primary: "bg-primary/10 text-primary",
  aqua: "bg-aqua/15 text-aqua-foreground dark:text-aqua",
  danger: "bg-danger/10 text-danger",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  accent: "bg-accent/15 text-accent",
  info: "bg-info/10 text-info",
  muted: "bg-muted text-muted-foreground",
};

/* ── Card ─────────────────────────────────────────────────────────────────── */

export function AdminCard({
  className,
  children,
  interactive,
}: {
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-soft",
        interactive && "lift cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── Section header used inside cards ─────────────────────────────────────── */

export function AdminCardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-bold tracking-tight text-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Page header ──────────────────────────────────────────────────────────── */

export function AdminPageHeader({
  icon: Icon,
  title,
  description,
  accent = "primary",
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  accent?: AdminTone;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3.5">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-2xl border border-border/60 shadow-sm",
            toneChip[accent],
          )}
        >
          <Icon className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-[22px] leading-tight font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 max-w-2xl text-[13px] text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </motion.div>
  );
}

/* ── Trend badge ──────────────────────────────────────────────────────────── */

export function AdminTrend({ value, suffix = "%" }: { value: number | null; suffix?: string | undefined }) {
  if (value === null || Number.isNaN(value)) return null;
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
        positive ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
      )}
    >
      {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {positive ? "+" : ""}
      {value.toFixed(1)}
      {suffix}
    </span>
  );
}

/* ── Stat card (FlowMail-style KPI tile) ──────────────────────────────────── */

export function AdminStatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendSuffix,
  hint,
  tone = "primary",
  delay = 0,
  onClick,
  footer,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  trend?: number | null | undefined;
  trendSuffix?: string | undefined;
  hint?: string | undefined;
  tone?: AdminTone | undefined;
  delay?: number | undefined;
  onClick?: (() => void) | undefined;
  footer?: React.ReactNode | undefined;
}) {
  const Comp: any = onClick ? motion.button : motion.div;
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={onClick ? { y: -3 } : undefined}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-soft",
        onClick && "cursor-pointer",
      )}
    >
      <div
        className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.14]"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="flex items-start justify-between gap-2">
        <span className={cn("grid size-10 place-items-center rounded-xl", toneChip[tone])}>
          <Icon className="size-[18px]" />
        </span>
        {typeof trend === "number" && <AdminTrend value={trend} suffix={trendSuffix} />}
      </div>
      <p className="mt-3.5 font-display text-[26px] leading-none font-extrabold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground/70">{hint}</p>}
      {footer && <div className="mt-3">{footer}</div>}
    </Comp>
  );
}

/* ── Badge ────────────────────────────────────────────────────────────────── */

export function AdminBadge({
  children,
  tone = "muted",
  dot,
  className,
}: {
  children: React.ReactNode;
  tone?: AdminTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold whitespace-nowrap",
        toneChip[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ── Segmented tabs ───────────────────────────────────────────────────────── */

export function AdminSegmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: { id: T; label: React.ReactNode; count?: number | undefined }[];
  value: T;
  onChange: (id: T) => void;
  className?: string | undefined;
  size?: "sm" | "md" | undefined;
}) {
  const layoutKey = useId();
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/50 p-1 no-scrollbar",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 rounded-lg font-semibold transition-colors",
              size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            {active && (
              <motion.span
                layoutId={`admin-seg-${layoutKey}`}
                className="absolute inset-0 rounded-lg bg-card shadow-sm ring-1 ring-border/60"
              />
            )}
            <span className="relative">{opt.label}</span>
            {typeof opt.count === "number" && (
              <span
                className={cn(
                  "relative rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums",
                  active ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Search input ─────────────────────────────────────────────────────────── */

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "flex h-10 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3.5 transition-colors focus-within:border-ring focus-within:bg-card",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="text-[11px] font-bold text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}

/* ── Empty / error states ─────────────────────────────────────────────────── */

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-border-strong/60 bg-muted/20 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <p className="text-sm font-bold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function AdminErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-danger/25 bg-danger/5 py-10 text-center">
      <p className="text-sm font-semibold text-danger">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="press flex items-center gap-1.5 rounded-lg bg-danger/10 px-3.5 py-1.5 text-xs font-bold text-danger hover:bg-danger/15"
        >
          <RefreshCw className="size-3.5" /> Retry
        </button>
      )}
    </div>
  );
}

/* ── Toggle ───────────────────────────────────────────────────────────────── */

export function AdminToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40",
        checked ? "bg-primary" : "bg-border-strong",
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

/* ── Skeletons ────────────────────────────────────────────────────────────── */

export function AdminSkeletonRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/60" />
      ))}
    </div>
  );
}

export function AdminStatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="size-10 animate-pulse rounded-xl bg-muted/70" />
          <div className="mt-4 h-7 w-20 animate-pulse rounded-lg bg-muted/70" />
          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-muted/50" />
        </div>
      ))}
    </div>
  );
}

/* ── Gradient avatar ──────────────────────────────────────────────────────── */

export function AdminAvatar({
  name,
  hue,
  size = "md",
  className,
}: {
  name: string;
  hue?: number | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  className?: string | undefined;
}) {
  const h = hue ?? 250;
  const sizes = {
    sm: "size-8 text-[10px]",
    md: "size-10 text-xs",
    lg: "size-12 text-sm",
  };
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold text-white shadow-sm",
        sizes[size],
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(140deg, oklch(0.52 0.11 ${h}), oklch(0.72 0.1 ${h + 26}))`,
      }}
    >
      {name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()}
    </span>
  );
}

/* ── Table primitives ─────────────────────────────────────────────────────── */

export function AdminTableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {children}
    </div>
  );
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function AdminTh({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-border bg-muted/40 px-4 py-3 text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function AdminTd({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-border/50 px-4 py-3.5 last:border-0", className)}>{children}</td>
  );
}
