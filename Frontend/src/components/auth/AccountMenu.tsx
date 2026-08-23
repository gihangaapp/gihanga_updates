import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Settings, User2 } from "lucide-react";
import { toast } from "sonner";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@/types";

export function useSessionUser(): { user: User | null; ready: boolean; signOut: () => void } {
  const { user: authUser, loading, signOutConsumer } = useAuth();
  const ready = !loading;

  const displayUser: User | null = authUser
    ? {
        id: authUser.id,
        name: authUser.name,
        username: authUser.username,
        bio: authUser.bio,
        avatarHue: authUser.avatarHue,
        avatarUrl: authUser.avatarUrl,
        creator: authUser.isCreator ?? false,
        verified: authUser.verified ?? false,
        live: authUser.isLive ?? false,
        followers: authUser.followersCount ?? 0,
        following: authUser.followingCount ?? 0,
        posts: authUser.postsCount ?? 0,
      }
    : null;

  return {
    ready,
    signOut: signOutConsumer,
    user: displayUser,
  };
}

export function AccountMenu({ compact }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { user, ready, signOut } = useSessionUser();

  if (!ready) {
    return <span className="size-9 rounded-full bg-muted" aria-hidden />;
  }

  if (!user) {
    return (
      <Button variant="brand" size={compact ? "pill" : "default"} asChild>
        <Link to="/welcome">Sign in</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Your account" className="press">
          <GAvatar user={user} size="sm" ring="story" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="leading-tight">
          <span className="block truncate">{user.name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            @{user.username}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile/$username" params={{ username: user.username }}>
            <User2 />
            Your profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            signOut();
            toast("Signed out");
            navigate({ to: "/welcome" });
          }}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
