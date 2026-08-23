import * as React from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { passwordScore, strengthLabels } from "@/lib/mock-auth";

export function AuthField({
  label,
  icon: Icon,
  error,
  hint,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: LucideIcon | undefined;
  error?: string | undefined;
  hint?: React.ReactNode | undefined;
}) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-xs font-bold tracking-wide uppercase text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          id={fieldId}
          aria-invalid={!!error}
          className={cn(
            "h-12 w-full rounded-2xl border border-border bg-surface/80 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground",
            "focus:border-ring focus:bg-surface focus:shadow-glow",
            Icon && "pl-10",
            error && "border-danger",
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function PasswordField({
  label,
  error,
  hint,
  value,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | undefined;
  hint?: React.ReactNode | undefined;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <AuthField
        {...props}
        value={value}
        label={label}
        error={error}
        hint={hint}
        type={show ? "text" : "password"}
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="press absolute top-[30px] right-3 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function PasswordStrength({ value }: { value: string }) {
  const score = passwordScore(value);
  const tone =
    score <= 1 ? "bg-danger" : score === 2 ? "bg-warning" : score === 3 ? "bg-info" : "bg-success";

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              value && i < score ? tone : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {value ? strengthLabels[score] : "Use 8+ characters with a number and a symbol."}
      </p>
    </div>
  );
}

export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>
          Step {step} of {total}
        </span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="gradient-brand h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
