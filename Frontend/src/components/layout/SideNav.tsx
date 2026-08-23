import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import { openCreate } from "@/components/feed/CreateSheet";
import { Logo } from "@/components/common/Logo";
import { GAvatar } from "@/components/common/GAvatar";
import { useSessionUser } from "@/components/auth/AccountMenu";
import { Button } from "@/components/ui/button";
import { primaryNav, secondaryNav, type NavItem } from "@/lib/nav";
import { formatCount } from "@/lib/format";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";
import { useLiveStreams } from "@/hooks/use-live";
import { cn } from "@/lib/utils";

function comingSoon(item: NavItem) {
  toast(`${item.label} arrives in Phase ${item.phase ?? 3}`, {
    description: "Phase 1 ships the design system and Home Feed.",
  });
}

function NavRow({
  item,
  active,
  user,
  badgeOverride,
}: {
  item: NavItem;
  active: boolean;
  user: { username?: string } | null;
  badgeOverride?: number | undefined;
}) {
  const badge = badgeOverride ?? item.badge;
  const body = (
    <>
      <span className="relative">
        <item.icon
          className={cn("size-[22px] shrink-0", active && "text-primary")}
          strokeWidth={active ? 2.6 : 2}
        />
        {!!badge && (
          <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
            {badge}
          </span>
        )}
      </span>
      <span className="truncate">{item.label}</span>
    </>
  );

  const cls = cn(
    "press flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-[15px] font-medium text-foreground/80 hover:bg-muted",
    active && "bg-primary-soft font-bold text-primary hover:bg-primary-soft",
  );

  const linkTo = item.to === "/profile" && user?.username ? `/profile/${user.username}` : item.to;

  if (linkTo) {
    return (
      <Link to={linkTo} className={cls}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => comingSoon(item)} className={cls}>
      {body}
    </button>
  );
}

export function SideNav() {
  const { user, signOut } = useSessionUser();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = useUnreadNotificationCount();
  const { data: liveData } = useLiveStreams();
  const liveCount = liveData?.streams.length ?? 0;

  const badgeFor = (label: string) => {
    if (label === "Notifications") return unread;
    if (label === "Live Streams") return liveCount;
    return undefined;
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-border bg-sidebar px-4 py-5 lg:flex">
      <Link to="/" className="press mb-6 px-1">
        <Logo />
      </Link>

      <nav className="flex flex-col gap-1" aria-label="Primary">
        {primaryNav.map((item) => (
          <NavRow key={item.label} item={item} active={item.to === pathname} user={user} badgeOverride={badgeFor(item.label)} />
        ))}
      </nav>

      {user?.creator ? (
        <>
          <div className="my-4 h-px bg-border" />
          <nav className="flex flex-col gap-1" aria-label="Creator">
            {secondaryNav.map((item) => (
              <NavRow key={item.label} item={item} active={item.to === pathname} user={user} badgeOverride={badgeFor(item.label)} />
            ))}
          </nav>
        </>
      ) : null}

      {user?.creator ? (
        <Button
          variant="brand"
          size="lg"
          className="mt-5 w-full"
          onClick={() => openCreate("post")}
        >
          <Plus strokeWidth={3} />
          Create
        </Button>
      ) : null}

      {user ? (
        <div className="mt-auto flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5">
          <GAvatar user={user} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold">{user.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {formatCount(user.followers)} followers
            </span>
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
            onClick={() => {
              signOut();
              toast("Signed out");
            }}
          >
            <LogOut />
          </Button>
        </div>
      ) : (
        <div className="mt-auto rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-bold">Join Gihanga Updates</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create an account to post, follow and save.
          </p>
          <Button variant="brand" className="mt-3 w-full" asChild>
            <Link to="/welcome">Get started</Link>
          </Button>
        </div>
      )}
    </aside>
  );
}
