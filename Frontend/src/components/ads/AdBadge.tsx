import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdBadgeProps {
  className?: string;
  variant?: "solid" | "glass" | "outline";
}

export function AdBadge({ className, variant = "glass" }: AdBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        variant === "glass" &&
          "border border-amber-500/30 bg-amber-500/10 text-amber-500 backdrop-blur-sm",
        variant === "solid" && "bg-amber-500 text-black shadow-sm",
        variant === "outline" && "border border-amber-500 text-amber-500",
        className,
      )}
    >
      <Sparkles className="size-3 shrink-0" />
      <span>Sponsored</span>
    </span>
  );
}
