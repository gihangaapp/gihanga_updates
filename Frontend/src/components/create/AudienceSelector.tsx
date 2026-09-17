import { Globe2, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type AudienceOption = "public" | "followers" | "private";

interface AudienceSelectorProps {
  value: AudienceOption;
  onChange: (value: AudienceOption) => void;
  compact?: boolean;
  className?: string;
}

const AUDIENCES: { id: AudienceOption; label: string; description: string; icon: typeof Globe2 }[] = [
  { id: "public", label: "Everyone", description: "Anyone on or off Gihanga", icon: Globe2 },
  { id: "followers", label: "Followers", description: "Only your confirmed followers", icon: Users },
  { id: "private", label: "Only me", description: "Visible only to you", icon: Lock },
];

export function AudienceSelector({ value, onChange, compact = true, className }: AudienceSelectorProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {AUDIENCES.map((a) => {
          const Icon = a.icon;
          const isSelected = value === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onChange(a.id)}
              className={cn(
                "press flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                isSelected
                  ? "bg-primary-soft text-primary font-bold"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="size-3.5" />
              {a.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-xs font-bold text-muted-foreground uppercase">Audience</p>
      <div className="grid gap-2">
        {AUDIENCES.map((a) => {
          const Icon = a.icon;
          const isSelected = value === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onChange(a.id)}
              className={cn(
                "press flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary-soft/30 text-foreground"
                  : "border-border hover:bg-muted"
              )}
            >
              <div className={cn(
                "grid size-9 place-items-center rounded-xl",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
