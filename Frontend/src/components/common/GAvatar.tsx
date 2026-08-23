import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/api-client";
import type { User } from "@/types";

const sizes = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
} as const;

export type AvatarSize = keyof typeof sizes;

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function GAvatar({
  user,
  size = "md",
  ring,
  className,
}: {
  user: User;
  size?: AvatarSize;
  ring?: "story" | "seen" | "live" | "add" | "none";
  className?: string;
}) {
  const inner = user.avatarUrl ? (
    <img
      src={mediaUrl(user.avatarUrl)}
      alt={user.name}
      className={cn("shrink-0 rounded-full object-cover select-none", sizes[size], className)}
    />
  ) : (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-bold text-primary-foreground select-none",
        sizes[size],
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(140deg, oklch(0.5 0.11 ${user.avatarHue}), oklch(0.74 0.1 ${user.avatarHue + 24}))`,
      }}
      aria-hidden
    >
      {initials(user.name)}
    </span>
  );

  if (!ring || ring === "none") return inner;

  return (
    <span
      className={cn(
        "grid place-items-center rounded-full p-[2.5px]",
        ring === "story" && "story-ring",
        ring === "add" && "story-ring-add",
        ring === "live" && "bg-danger",
        ring === "seen" && "bg-border-strong",
      )}
    >
      <span className="rounded-full bg-surface p-[2px]">{inner}</span>
    </span>
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <BadgeCheck
      className={cn("size-4 shrink-0 fill-info text-info-foreground", className)}
      aria-label="Verified account"
    />
  );
}

export function UserName({
  user,
  className,
  showHandle,
}: {
  user: User;
  className?: string;
  showHandle?: boolean;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-1", className)}>
      <span className="truncate font-semibold">{user.name}</span>
      {user.verified && <VerifiedBadge />}
      {showHandle && (
        <span className="truncate text-sm text-muted-foreground">@{user.username}</span>
      )}
    </span>
  );
}
