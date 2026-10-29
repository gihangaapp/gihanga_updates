import { Globe2, Users, Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type AudienceOption = "public" | "followers" | "private";

interface AudienceSelectorProps {
  value: AudienceOption;
  onChange: (value: AudienceOption) => void;
  compact?: boolean;
  className?: string;
}

const AUDIENCES: { id: AudienceOption; label: string; description: string; icon: typeof Globe2 }[] =
  [
    { id: "public", label: "Everyone", description: "Anyone on or off Gihanga", icon: Globe2 },
    {
      id: "followers",
      label: "Followers",
      description: "Only your confirmed followers",
      icon: Users,
    },
    { id: "private", label: "Only me", description: "Visible only to you", icon: Lock },
  ];

export function AudienceSelector({
  value,
  onChange,
  compact = true,
  className,
}: AudienceSelectorProps) {
  if (compact) {
    const selected = AUDIENCES.find((a) => a.id === value) ?? AUDIENCES[0];
    const SelectedIcon = selected.icon;
    return (
      <div className={cn("min-w-0 max-w-full", className)}>
        <Select value={value} onValueChange={(next) => onChange(next as AudienceOption)}>
          <SelectTrigger
            aria-label="Post audience"
            className="h-9 w-auto min-w-0 max-w-full gap-2 rounded-full border-primary/20 bg-primary-soft/60 px-3 text-xs font-bold text-primary focus:ring-primary/30 [&>span]:flex [&>span]:min-w-0 [&>span]:items-center"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <SelectedIcon className="size-3.5 shrink-0" />
              <SelectValue>{selected.label}</SelectValue>
            </span>
          </SelectTrigger>
          <SelectContent align="end" className="min-w-[170px]">
            {AUDIENCES.map((a) => {
              const Icon = a.icon;
              return (
                <SelectItem key={a.id} value={a.id} className="cursor-pointer py-2.5">
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span>{a.label}</span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
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
                  : "border-border hover:bg-muted",
              )}
            >
              <div
                className={cn(
                  "grid size-9 place-items-center rounded-xl",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
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
