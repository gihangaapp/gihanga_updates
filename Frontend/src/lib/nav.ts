import {
  Bell,
  Bookmark,
  Compass,
  Film,
  Home,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  User,
  Wallet,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Route path when the page exists, otherwise undefined (Phase 2+). */
  to?: string;
  badge?: number;
  phase?: number;
}

import { Radio } from "lucide-react";

export const primaryNav: NavItem[] = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Reels", icon: Film, to: "/reels" },
  { label: "Explore", icon: Compass, to: "/explore" },
  { label: "Search", icon: Search, to: "/explore" },
  { label: "Trending", icon: TrendingUp, to: "/explore" },
  { label: "Notifications", icon: Bell, to: "/notifications" },
  { label: "Live Streams", icon: Radio, to: "/live" },
  { label: "Bookmarks", icon: Bookmark, to: "/bookmarks" },
];

export const secondaryNav: NavItem[] = [
  { label: "Creator Studio", icon: LayoutDashboard, to: "/studio" },
  { label: "Wallet", icon: Wallet, to: "/wallet" },
  { label: "Profile", icon: User, to: "/profile" },
  { label: "Settings", icon: Settings, to: "/settings" },
];


export const mobileNav: NavItem[] = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Explore", icon: Compass, to: "/explore" },
  { label: "Reels", icon: Film, to: "/reels" },
  { label: "Alerts", icon: Bell, to: "/notifications" },
  { label: "Profile", icon: User, to: "/profile" },
];
