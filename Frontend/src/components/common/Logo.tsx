import logoImg from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <img
        src={logoImg}
        alt="Gihanga Updates Logo"
        className="size-9 shrink-0 object-contain rounded-xl shadow-glow"
      />
      {!compact && (
        <span className="min-w-0 leading-none">
          <span className="block font-display text-[15px] font-extrabold tracking-tight text-foreground">
            Gihanga
          </span>
          <span className="block text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Updates
          </span>
        </span>
      )}
    </span>
  );
}
