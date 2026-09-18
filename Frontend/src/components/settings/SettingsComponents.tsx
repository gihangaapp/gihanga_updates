import React from "react";
import { LucideIcon, Check, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  badge,
  danger,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon | undefined;
  children: React.ReactNode;
  badge?: string;
  danger?: boolean;
}) {
  return (
    <section
      className={cn(
        "surface-card rounded-3xl p-5 sm:p-6 border transition-all shadow-soft space-y-5",
        danger ? "border-danger/30 bg-danger/5" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={cn(
                "grid size-10 place-items-center rounded-2xl shadow-sm",
                danger ? "bg-danger/20 text-danger" : "bg-primary-soft text-primary",
              )}
            >
              <Icon className="size-5" />
            </div>
          )}
          <div>
            <h2
              className={cn(
                "font-display text-base font-extrabold tracking-tight",
                danger ? "text-danger" : "text-foreground",
              )}
            >
              {title}
            </h2>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>

        {badge && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black uppercase text-primary border border-primary/20">
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SettingsRow({
  id,
  label,
  hint,
  icon: Icon,
  children,
  className,
}: {
  id?: string | undefined;
  label: string;
  hint?: string | undefined;
  icon?: LucideIcon | undefined;
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1.5",
        className,
      )}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {Icon && <Icon className="size-4.5 text-muted-foreground mt-0.5 shrink-0" />}
        <div className="min-w-0 flex-1">
          {id ? (
            <Label
              htmlFor={id}
              className="text-sm font-bold text-foreground cursor-pointer block truncate"
            >
              {label}
            </Label>
          ) : (
            <span className="text-sm font-bold text-foreground block truncate">{label}</span>
          )}
          {hint && <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{hint}</p>}
        </div>
      </div>
      <div className="shrink-0 sm:self-center">{children}</div>
    </div>
  );
}

export function SettingsToggle({
  id,
  label,
  hint,
  checked,
  onChange,
  disabled,
  icon,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  icon?: LucideIcon | undefined;
}) {
  return (
    <SettingsRow id={id} label={label} hint={hint} icon={icon}>
      <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </SettingsRow>
  );
}

export function SettingsSelect<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  hint?: string | undefined;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (val: T) => void;
  icon?: LucideIcon | undefined;
}) {
  return (
    <SettingsRow label={label} hint={hint} icon={icon}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className="h-9 rounded-xl bg-elevated border border-border px-3 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </SettingsRow>
  );
}
