import React, { useState, useRef, useMemo, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  User,
  Shield,
  Lock,
  Bell,
  Eye,
  Moon,
  Sun,
  Globe,
  Smartphone,
  CreditCard,
  Sparkles,
  MessageSquare,
  Video,
  Radio,
  Sliders,
  Database,
  Link as LinkIcon,
  Ban,
  HelpCircle,
  Info,
  Trash2,
  Search,
  Check,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  LogOut,
  Copy,
  ExternalLink,
  Download,
  Clock,
  ShieldCheck,
  Key,
  Camera,
  CheckCircle2,
  X,
  Volume2,
  SlidersHorizontal,
  ChevronDown,
  Monitor,
  Laptop,
  CheckCheck,
  Flame,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/lib/auth-context";
import { api, uploadFile, mediaUrl } from "@/lib/api-client";
import {
  useUserSettings,
  useUpdateUserSettings,
  useBlockedUsers,
  useToggleBlockUser,
  useChangePassword,
  useRevokeAllSessions,
  useRequestAccountData,
  useDeactivateAccount,
  useDeleteAccount,
  UserSettingsData,
  UserSettingsUser,
  UserSettingsWallet,
} from "@/hooks/use-user-settings";
import {
  SettingsSection,
  SettingsRow,
  SettingsToggle,
  SettingsSelect,
} from "@/components/settings/SettingsComponents";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Manage Your Gihanga Account" },
      {
        name: "description",
        content:
          "Manage your Gihanga Updates account security, privacy, notifications, wallet, live streaming, and preferences.",
      },
      { property: "og:title", content: "Settings — Gihanga Updates" },
      {
        property: "og:description",
        content: "Complete control center for your Gihanga Updates account.",
      },
    ],
  }),
  component: SettingsPage,
});

type SectionKey =
  | "overview"
  | "account"
  | "profile"
  | "privacy"
  | "security"
  | "notifications"
  | "feed"
  | "messages"
  | "creator"
  | "wallet"
  | "ads"
  | "appearance"
  | "accessibility"
  | "language"
  | "storage"
  | "connected_apps"
  | "blocked"
  | "support"
  | "about"
  | "management";

interface NavGroup {
  label: string;
  items: {
    key: SectionKey;
    label: string;
    icon: any;
    badge?: string;
    description: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        key: "overview",
        label: "Overview",
        icon: Sparkles,
        description: "Account summary, health check and quick shortcuts",
      },
      {
        key: "account",
        label: "Account",
        icon: User,
        description: "Personal details, username, email & phone",
      },
      {
        key: "profile",
        label: "Profile",
        icon: Camera,
        description: "Photo, bio, links, and creator customization",
      },
    ],
  },
  {
    label: "Privacy & Security",
    items: [
      {
        key: "privacy",
        label: "Privacy",
        icon: Eye,
        description: "Account visibility, interaction limits, and activity status",
      },
      {
        key: "security",
        label: "Security",
        icon: Shield,
        badge: "Protected",
        description: "Password, 2FA, login devices, and security alerts",
      },
      {
        key: "blocked",
        label: "Blocked Accounts",
        icon: Ban,
        description: "Manage blocked users and restricted accounts",
      },
    ],
  },
  {
    label: "Preferences",
    items: [
      {
        key: "notifications",
        label: "Notifications",
        icon: Bell,
        description: "Push, email, in-app alerts, and quiet hours",
      },
      {
        key: "feed",
        label: "Content & Feed",
        icon: SlidersHorizontal,
        description: "Sensitive filter, autoplay, and feed personalization",
      },
      {
        key: "messages",
        label: "Messages",
        icon: MessageSquare,
        description: "Direct message requests, receipts, and media download",
      },
      {
        key: "appearance",
        label: "Appearance",
        icon: Moon,
        description: "Dark mode, themes, density, and animation",
      },
      {
        key: "accessibility",
        label: "Accessibility",
        icon: Sliders,
        description: "Reduced motion, text scaling, and contrast",
      },
      {
        key: "language",
        label: "Language & Region",
        icon: Globe,
        description: "Interface language, timezone, and currency",
      },
    ],
  },
  {
    label: "Monetization & Creator",
    items: [
      {
        key: "creator",
        label: "Live & Creator",
        icon: Radio,
        badge: "Creator",
        description: "Streaming defaults, moderation, and replay storage",
      },
      {
        key: "wallet",
        label: "Wallet & Payments",
        icon: Wallet,
        description: "Gihanga Points, MTN MoMo, earnings, and payouts",
      },
      {
        key: "ads",
        label: "Ads & Promotions",
        icon: Zap,
        description: "Ad preferences, topic personalization, and boost limits",
      },
    ],
  },
  {
    label: "System & Support",
    items: [
      {
        key: "storage",
        label: "Data & Storage",
        icon: Database,
        description: "Clear cached data, video usage, and export archive",
      },
      {
        key: "connected_apps",
        label: "Connected Apps",
        icon: LinkIcon,
        description: "Third-party integrations and active authorizations",
      },
      {
        key: "support",
        label: "Help & Support",
        icon: HelpCircle,
        description: "Help center, report issues, and community guidelines",
      },
      {
        key: "about",
        label: "About",
        icon: Info,
        description: "Gihanga version, legal terms, and ecosystem info",
      },
      {
        key: "management",
        label: "Account Management",
        icon: Trash2,
        description: "Deactivate account, delete permanently, and session log out",
      },
    ],
  },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { user: authUser, updateConsumerProfile, signOutConsumer } = useAuth();
  const { theme, setTheme } = useTheme();

  const { data: settingsPayload, isLoading } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const [activeSection, setActiveSection] = useState<SectionKey>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);

  // Synchronized user data from settings payload or active auth session
  const user: UserSettingsUser | null = useMemo(() => {
    if (settingsPayload?.user) {
      return settingsPayload.user;
    }
    if (authUser) {
      const mapped: UserSettingsUser = {
        id: authUser.id,
        name: authUser.name,
        username: authUser.username,
        email: authUser.email,
        avatarHue: authUser.avatarHue,
        avatarUrl: authUser.avatarUrl || null,
        bio: authUser.bio || "",
        role: authUser.role,
        isCreator: authUser.isCreator,
        verified: authUser.verified,
        emailVerified: authUser.emailVerified,
        followersCount: authUser.followersCount || 0,
        followingCount: authUser.followingCount || 0,
        postsCount: authUser.postsCount || 0,
        mtnMomoNumber: "",
      };
      return mapped;
    }
    return null;
  }, [settingsPayload?.user, authUser]);

  const settings = settingsPayload?.settings;
  const wallet = settingsPayload?.wallet;

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: { key: SectionKey; label: string; group: string; description: string }[] = [];
    NAV_GROUPS.forEach((g) => {
      g.items.forEach((item) => {
        if (
          item.label.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          g.label.toLowerCase().includes(query)
        ) {
          results.push({
            key: item.key,
            label: item.label,
            group: g.label,
            description: item.description,
          });
        }
      });
    });
    return results;
  }, [searchQuery]);

  const handleSelectSection = (key: SectionKey) => {
    setActiveSection(key);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async (updates: Partial<UserSettingsData> & Partial<UserSettingsUser>) => {
    const res = await updateSettings.mutateAsync(updates);
    if (res.user && authUser) {
      // Only defined fields flow into the profile (exactOptionalPropertyTypes).
      const patch: Partial<typeof authUser> = {};
      for (const [key, value] of Object.entries(res.user)) {
        if (value !== undefined) {
          (patch as Record<string, unknown>)[key] = value;
        }
      }
      updateConsumerProfile({ ...authUser, ...patch });
    }
    return res;
  };

  const currentNavGroup = NAV_GROUPS.find((g) => g.items.some((i) => i.key === activeSection));
  const currentNavItem = currentNavGroup?.items.find((i) => i.key === activeSection);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {/* Header with Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Settings & Privacy
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm mt-0.5">
              Control your experience, security, and account preferences across Gihanga Updates.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-2xl bg-card border-border/80 text-xs font-semibold focus-visible:ring-primary shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Search Quick Results overlay if typing */}
        {searchQuery.trim().length > 0 && (
          <div className="mb-6 rounded-3xl border border-primary/20 bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Matching Settings ({searchResults.length})
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-primary font-bold hover:underline"
              >
                Clear
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No matching settings found for "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {searchResults.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      handleSelectSection(item.key);
                      setSearchQuery("");
                    }}
                    className="flex items-start gap-3 rounded-2xl p-3 text-left hover:bg-elevated/80 transition-all border border-transparent hover:border-border"
                  >
                    <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{item.label}</span>
                        <span className="rounded-md bg-elevated px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {item.group}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Left Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-20 space-y-6">
            <div className="surface-card rounded-3xl p-4 border border-border shadow-soft space-y-5">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="space-y-1">
                  <span className="px-3 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </span>
                  <div className="space-y-0.5 pt-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleSelectSection(item.key)}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-left group",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-foreground hover:bg-elevated hover:text-foreground",
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={cn(
                                "size-4.5 shrink-0 transition-transform group-hover:scale-110",
                                isActive ? "text-primary-foreground" : "text-muted-foreground",
                              )}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                                isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-primary/10 text-primary",
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Support / Logout Card */}
            <div className="rounded-3xl p-4 bg-elevated/60 border border-border/60 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>Gihanga Shield Active</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOutConsumer()}
                className="h-8 text-xs font-bold text-danger hover:bg-danger/10 hover:text-danger rounded-xl gap-1.5"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </Button>
            </div>
          </aside>

          {/* Mobile Navigation / Drilldown Header */}
          <div className="lg:hidden col-span-1">
            {!isMobileMenuOpen ? (
              <div className="mb-4 flex items-center justify-between rounded-2xl bg-card border border-border p-3 shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                  <ArrowLeft className="size-4" />
                  All Settings
                </button>
                <span className="text-xs font-black text-foreground">{currentNavItem?.label}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {NAV_GROUPS.map((group) => (
                  <div
                    key={group.label}
                    className="surface-card rounded-3xl p-4 border border-border"
                  >
                    <span className="px-2 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </span>
                    <div className="mt-2 divide-y divide-border/40">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => handleSelectSection(item.key)}
                            className="w-full flex items-center justify-between gap-3 py-3 px-2 text-left hover:bg-elevated/50 rounded-xl transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                                <Icon className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-foreground flex items-center gap-2">
                                  {item.label}
                                  {item.badge && (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-extrabold text-primary">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <main
            className={cn(
              "col-span-1 lg:col-span-8",
              isMobileMenuOpen ? "hidden lg:block" : "block",
            )}
          >
            {/* Breadcrumb path for desktop */}
            <div className="mb-4 hidden lg:flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <button
                type="button"
                onClick={() => setActiveSection("overview")}
                className="hover:text-primary transition-colors font-bold"
              >
                Settings
              </button>
              <span>›</span>
              <span>{currentNavGroup?.label}</span>
              <span>›</span>
              <span className="font-bold text-foreground">{currentNavItem?.label}</span>
            </div>

            {/* Render Selected View */}
            {activeSection === "overview" && (
              <OverviewSection
                user={user}
                settings={settings}
                wallet={wallet}
                onNavigate={handleSelectSection}
              />
            )}

            {activeSection === "account" && (
              <AccountSection user={user} settings={settings} onSave={handleUpdate} />
            )}

            {activeSection === "profile" && (
              <ProfileSection user={user} settings={settings} onSave={handleUpdate} />
            )}

            {activeSection === "privacy" && (
              <PrivacySection settings={settings} onSave={handleUpdate} />
            )}

            {activeSection === "security" && (
              <SecuritySection settings={settings} onSave={handleUpdate} />
            )}

            {activeSection === "notifications" && (
              <NotificationsSection settings={settings} onSave={handleUpdate} />
            )}

            {activeSection === "feed" && <FeedSection settings={settings} onSave={handleUpdate} />}

            {activeSection === "messages" && (
              <MessagesSection settings={settings} onSave={handleUpdate} />
            )}

            {activeSection === "creator" && (
              <CreatorSection settings={settings} onSave={handleUpdate} />
            )}

            {activeSection === "wallet" && (
              <WalletSection settings={settings} wallet={wallet} user={user} />
            )}

            {activeSection === "ads" && <AdsSection settings={settings} onSave={handleUpdate} />}

            {activeSection === "appearance" && (
              <AppearanceSection
                settings={settings}
                theme={theme}
                setTheme={setTheme}
                onSave={handleUpdate}
              />
            )}

            {activeSection === "accessibility" && (
              <AccessibilitySection settings={settings} onSave={handleUpdate} />
            )}

            {activeSection === "language" && (
              <LanguageSection settings={settings} onSave={handleUpdate} />
            )}

            {activeSection === "storage" && (
              <StorageSection settings={settings} onSave={handleUpdate} />
            )}

            {activeSection === "connected_apps" && <ConnectedAppsSection />}

            {activeSection === "blocked" && <BlockedAccountsSection />}

            {activeSection === "support" && <HelpSupportSection />}

            {activeSection === "about" && <AboutSection />}

            {activeSection === "management" && <AccountManagementSection />}
          </main>
        </div>
      </div>
    </AppShell>
  );
}

// -------------------------------------------------------------
// 1. OVERVIEW SECTION DASHBOARD
// -------------------------------------------------------------
function OverviewSection({
  user,
  settings,
  wallet,
  onNavigate,
}: {
  user: UserSettingsUser | null;
  settings?: UserSettingsData | undefined;
  wallet?: UserSettingsWallet | undefined;
  onNavigate: (section: SectionKey) => void;
}) {
  const securityScore = useMemo(() => {
    let score = 1;
    if (user?.emailVerified) score += 1;
    if (settings?.phoneVerified || Boolean(user?.mtnMomoNumber)) score += 1;
    if (settings?.twoFactorEnabled) score += 1;
    if (settings?.activeSessions && settings.activeSessions.length > 0) score += 1;
    return score;
  }, [settings, user]);

  const pointsDisplay = wallet?.kingdomPoints ?? 0;
  const cashDisplay = wallet?.available ? `${wallet.available.toLocaleString()} RWF` : "0 RWF";
  const momoStatus = settings?.phoneVerified || Boolean(user?.mtnMomoNumber);

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <div className="surface-card rounded-3xl p-6 border border-border shadow-soft relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-16 shrink-0 relative">
              {user?.avatarUrl ? (
                <img
                  src={mediaUrl(user.avatarUrl)}
                  alt={user?.name || "User avatar"}
                  className="size-16 rounded-full object-cover object-center ring-4 ring-primary/20 shadow-md aspect-square"
                />
              ) : (
                <GAvatar
                  user={
                    {
                      id: user?.id || "me",
                      name: user?.name || "Member",
                      username: user?.username || "user",
                      avatarHue: user?.avatarHue ?? 205,
                      avatarUrl: null,
                      creator: Boolean(user?.isCreator),
                      verified: Boolean(user?.verified),
                      live: false,
                      followers: user?.followersCount || 0,
                      following: user?.followingCount || 0,
                      posts: user?.postsCount || 0,
                    } as any
                  }
                  size="lg"
                  className="size-16 ring-4 ring-primary/20 shadow-md aspect-square"
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-black text-foreground">
                  {user?.name || "Gihanga Member"}
                </h2>
                {user?.verified && <CheckCircle2 className="size-4 text-primary fill-primary/20" />}
                <Badge variant="secondary" className="text-[10px] font-black uppercase">
                  {settings?.creatorCategory || (user?.isCreator ? "Creator" : "Member")}
                </Badge>
              </div>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">
                @{user?.username || "username"} • {user?.email || "No email"}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground font-semibold">
                <span>{user?.followersCount || 0} followers</span>
                <span>•</span>
                <span>{user?.followingCount || 0} following</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-center">
            <Button
              onClick={() => onNavigate("profile")}
              className="flex-1 sm:flex-none rounded-xl font-bold text-xs h-9"
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("account")}
              className="flex-1 sm:flex-none rounded-xl font-bold text-xs h-9"
            >
              Account Info
            </Button>
          </div>
        </div>
      </div>

      {/* Security Health Card */}
      <div className="surface-card rounded-3xl p-5 border border-border shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">Security Health Indicator</h3>
              <p className="text-xs text-muted-foreground">
                {securityScore >= 4
                  ? "✓ Your account security is strong"
                  : "⚠ Action recommended to maximize protection"}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-black",
              securityScore >= 4
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border border-amber-500/20",
            )}
          >
            {securityScore >= 4 ? "Protected" : "Action Needed"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          <div className="rounded-2xl bg-elevated/70 p-3 text-center border border-border/40">
            <CheckCircle2 className="size-4 text-emerald-500 mx-auto mb-1" />
            <span className="text-[11px] font-bold block text-foreground">Password</span>
            <span className="text-[10px] text-muted-foreground">Strong</span>
          </div>
          <div className="rounded-2xl bg-elevated/70 p-3 text-center border border-border/40">
            {user?.emailVerified ? (
              <CheckCircle2 className="size-4 text-emerald-500 mx-auto mb-1" />
            ) : (
              <AlertCircle className="size-4 text-amber-500 mx-auto mb-1" />
            )}
            <span className="text-[11px] font-bold block text-foreground">Email</span>
            <span className="text-[10px] text-muted-foreground">
              {user?.emailVerified ? "Verified" : "Unverified"}
            </span>
          </div>
          <div className="rounded-2xl bg-elevated/70 p-3 text-center border border-border/40">
            {momoStatus ? (
              <CheckCircle2 className="size-4 text-emerald-500 mx-auto mb-1" />
            ) : (
              <AlertCircle className="size-4 text-amber-500 mx-auto mb-1" />
            )}
            <span className="text-[11px] font-bold block text-foreground">Phone</span>
            <span className="text-[10px] text-muted-foreground">
              {momoStatus ? "Verified" : "Unverified"}
            </span>
          </div>
          <div className="rounded-2xl bg-elevated/70 p-3 text-center border border-border/40">
            {settings?.twoFactorEnabled ? (
              <CheckCircle2 className="size-4 text-emerald-500 mx-auto mb-1" />
            ) : (
              <AlertCircle className="size-4 text-amber-500 mx-auto mb-1" />
            )}
            <span className="text-[11px] font-bold block text-foreground">2-Factor Auth</span>
            <span className="text-[10px] text-muted-foreground">
              {settings?.twoFactorEnabled ? "Active" : "Recommended"}
            </span>
          </div>
          <div className="rounded-2xl bg-elevated/70 p-3 text-center border border-border/40 col-span-2 sm:col-span-1">
            <Laptop className="size-4 text-primary mx-auto mb-1" />
            <span className="text-[11px] font-bold block text-foreground">Active Devices</span>
            <span className="text-[10px] text-muted-foreground">
              {settings?.activeSessions?.length || 1} Device(s)
            </span>
          </div>
        </div>
      </div>

      {/* Snapshot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Privacy Snapshot */}
        <div className="surface-card rounded-3xl p-5 border border-border shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="size-4.5 text-primary" />
              <h3 className="text-sm font-extrabold text-foreground">Privacy Summary</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("privacy")}
              className="text-xs font-bold text-primary hover:underline"
            >
              Manage
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Account Visibility</span>
              <span className="font-bold text-foreground">
                {settings?.isPrivateAccount ? "Private" : "Public"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Direct Messages</span>
              <span className="font-bold text-foreground capitalize">
                {settings?.whoCanMessage || "Everyone"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Online Status</span>
              <span className="font-bold text-foreground">
                {settings?.showOnlineStatus !== false ? "Visible" : "Hidden"}
              </span>
            </div>
          </div>
        </div>

        {/* Wallet & Points Snapshot */}
        <div className="surface-card rounded-3xl p-5 border border-border shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="size-4.5 text-primary" />
              <h3 className="text-sm font-extrabold text-foreground">Gihanga Wallet</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("wallet")}
              className="text-xs font-bold text-primary hover:underline"
            >
              Open Wallet
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Points Balance</span>
              <span className="font-extrabold text-primary">{pointsDisplay} Pts</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Available Cash</span>
              <span className="font-bold text-foreground">{cashDisplay}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">MTN MoMo Status</span>
              <span className={cn("font-bold", momoStatus ? "text-emerald-500" : "text-amber-500")}>
                {momoStatus ? "✓ Verified" : "Not connected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. ACCOUNT SETTINGS
// -------------------------------------------------------------
function AccountSection({
  user,
  settings,
  onSave,
}: {
  user: UserSettingsUser | null;
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData> & Partial<UserSettingsUser>) => Promise<unknown>;
}) {
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [phone, setPhone] = useState(settings?.phone || user?.mtnMomoNumber || "");
  const [dob, setDob] = useState(settings?.dob || "1998-05-14");
  const [gender, setGender] = useState(settings?.gender || "prefer_not_to_say");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
    if (user?.username) setUsername(user.username);
    if (settings?.phone || user?.mtnMomoNumber)
      setPhone(settings?.phone || user?.mtnMomoNumber || "");
    if (settings?.dob) setDob(settings.dob);
    if (settings?.gender) setGender(settings.gender);
  }, [user, settings]);

  const handleSaveAccountInfo = async () => {
    setIsSaving(true);
    try {
      await onSave({
        name: displayName.trim(),
        username: username.trim().toLowerCase(),
        phone: phone.trim(),
        dob,
        gender,
      });
      toast.success("Account information updated successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update account information",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Personal Information"
        description="Review and update your core identity credentials and contact information."
        icon={User}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Display Name</Label>
            <Input
              value={displayName}
              placeholder="Your full name"
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold">Username</Label>
              <span className="text-[10px] text-muted-foreground">Permanent handle</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                @
              </span>
              <Input
                value={username}
                placeholder="username"
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                className="pl-7 h-10 rounded-xl font-mono text-xs font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold">Email Address</Label>
              <span
                className={cn(
                  "text-[10px] font-bold",
                  user?.emailVerified ? "text-emerald-500" : "text-amber-500",
                )}
              >
                {user?.emailVerified ? "✓ Verified" : "⚠ Unverified"}
              </span>
            </div>
            <Input
              value={user?.email || ""}
              disabled
              placeholder="user@example.com"
              className="h-10 rounded-xl bg-elevated/50 font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Contact support to change your primary login email.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold">Phone Number</Label>
              <span
                className={cn(
                  "text-[10px] font-bold",
                  settings?.phoneVerified || Boolean(user?.mtnMomoNumber)
                    ? "text-emerald-500"
                    : "text-muted-foreground",
                )}
              >
                {settings?.phoneVerified || Boolean(user?.mtnMomoNumber)
                  ? "✓ Verified"
                  : "Unverified"}
              </span>
            </div>
            <Input
              value={phone}
              placeholder="+250 788 000 000"
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 rounded-xl font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Date of Birth</Label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="h-10 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Gender</Label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-10 rounded-xl bg-elevated border border-border px-3 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="custom">Custom / Non-binary</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
          <Button
            onClick={handleSaveAccountInfo}
            disabled={isSaving}
            className="rounded-xl font-bold text-xs h-9 px-5"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 3. PROFILE SETTINGS
// -------------------------------------------------------------
function ProfileSection({
  user,
  settings,
  onSave,
}: {
  user: UserSettingsUser | null;
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData> & Partial<UserSettingsUser>) => Promise<unknown>;
}) {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [website, setWebsite] = useState(settings?.website || "");
  const [creatorCategory, setCreatorCategory] = useState(
    settings?.creatorCategory || "General Creator",
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.bio !== undefined) setBio(user.bio);
    if (user?.avatarUrl) setAvatarUrl(user.avatarUrl);
    if (settings?.website) setWebsite(settings.website);
    if (settings?.creatorCategory) setCreatorCategory(settings.creatorCategory);
  }, [user, settings]);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadFile("avatars", file);
      setAvatarUrl(res.url);
      await onSave({ avatarUrl: res.url });
      toast.success("Profile photo uploaded and updated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        bio: bio.trim(),
        website: website.trim(),
        creatorCategory,
        avatarUrl,
      });
      toast.success("Profile customization saved");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Public Profile Customization"
        description="This information will appear on your public creator card, posts, and search results."
        icon={Camera}
      >
        {/* Profile Avatar Editor + Live Preview */}
        <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-elevated/40 p-4 border border-border/50">
          <div className="relative group size-20 shrink-0">
            {avatarUrl ? (
              <img
                src={mediaUrl(avatarUrl)}
                alt={name || "User avatar"}
                className="size-20 rounded-full object-cover object-center ring-4 ring-primary/20 shadow-md aspect-square"
              />
            ) : (
              <GAvatar
                user={
                  {
                    id: user?.id || "me",
                    name: name || user?.name || "Member",
                    username: user?.username || "user",
                    avatarHue: user?.avatarHue ?? 205,
                    avatarUrl: null,
                    creator: Boolean(user?.isCreator),
                    verified: Boolean(user?.verified),
                    live: false,
                    followers: user?.followersCount || 0,
                    following: user?.followingCount || 0,
                    posts: user?.postsCount || 0,
                  } as any
                }
                size="xl"
                className="size-20 ring-4 ring-primary/20 shadow-md aspect-square"
              />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="size-5 mb-0.5" />
              <span className="text-[9px] font-bold">{isUploading ? "..." : "Change"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h4 className="text-sm font-extrabold text-foreground">
              {name || user?.username || "Your Name"}
            </h4>
            <p className="text-xs text-muted-foreground">@{user?.username || "username"}</p>
            <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-8 rounded-xl text-xs font-bold"
              >
                {isUploading ? "Uploading..." : "Upload New Photo"}
              </Button>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Display Name</Label>
            <Input
              value={name}
              placeholder="Your public name"
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold">Bio</Label>
              <span className="text-[10px] text-muted-foreground">{bio.length}/160</span>
            </div>
            <textarea
              value={bio}
              maxLength={160}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell the community about yourself, your art, or your business..."
              className="w-full rounded-xl bg-elevated border border-border p-3 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Website / Link</Label>
              <Input
                value={website}
                placeholder="https://example.com"
                onChange={(e) => setWebsite(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Creator Category</Label>
              <select
                value={creatorCategory}
                onChange={(e) => setCreatorCategory(e.target.value)}
                className="w-full h-10 rounded-xl bg-elevated border border-border px-3 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="General Creator">General Creator</option>
                <option value="Music & Audio">Music & Audio</option>
                <option value="Visual Art & Design">Visual Art & Design</option>
                <option value="Tech & Innovation">Tech & Innovation</option>
                <option value="News & Media">News & Media</option>
                <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                <option value="Gaming & Esports">Gaming & Esports</option>
                <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="rounded-xl font-bold text-xs h-9 px-5"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 4. PRIVACY SETTINGS
// -------------------------------------------------------------
function PrivacySection({
  settings,
  onSave,
}: {
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData>) => Promise<unknown>;
}) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Account Visibility"
        description="Choose who can discover your profile, watch your stories, and view your posts."
        icon={Eye}
      >
        <SettingsToggle
          id="isPrivateAccount"
          label="Private Account"
          hint="When enabled, only users you approve will be able to follow you and view your media."
          checked={settings?.isPrivateAccount || false}
          onChange={(val) => onSave({ isPrivateAccount: val })}
        />

        <SettingsSelect
          label="Who can follow you"
          hint="Control whether anyone can immediately follow or if you must review follow requests."
          value={settings?.whoCanFollow || "everyone"}
          options={[
            { value: "everyone", label: "Everyone (Instant Follow)" },
            { value: "approval", label: "Requires Follow Approval" },
          ]}
          onChange={(val: any) => onSave({ whoCanFollow: val })}
        />
      </SettingsSection>

      <SettingsSection
        title="Interactions & Mentions"
        description="Manage permissions for commenting, direct messaging, and referencing your account."
        icon={MessageSquare}
      >
        <SettingsSelect
          label="Who can send you direct messages"
          hint="Control who can start new chat conversations with you."
          value={settings?.whoCanMessage || "everyone"}
          options={[
            { value: "everyone", label: "Everyone" },
            { value: "followers", label: "Followers only" },
            { value: "following", label: "People you follow" },
            { value: "nobody", label: "Nobody" },
          ]}
          onChange={(val: any) => onSave({ whoCanMessage: val })}
        />

        <SettingsSelect
          label="Who can comment on your posts"
          hint="Filter who is allowed to write replies and comments on your feed posts."
          value={settings?.whoCanComment || "everyone"}
          options={[
            { value: "everyone", label: "Everyone" },
            { value: "followers", label: "Followers only" },
            { value: "following", label: "People you follow" },
            { value: "nobody", label: "Nobody" },
          ]}
          onChange={(val: any) => onSave({ whoCanComment: val })}
        />

        <SettingsSelect
          label="Who can tag or mention you"
          hint="Choose who can tag your @username in posts, reels, and stories."
          value={settings?.whoCanMention || "everyone"}
          options={[
            { value: "everyone", label: "Everyone" },
            { value: "followers", label: "Followers only" },
            { value: "following", label: "People you follow" },
            { value: "nobody", label: "Nobody" },
          ]}
          onChange={(val: any) => onSave({ whoCanMention: val })}
        />

        <SettingsSelect
          label="Remix & Duet Permissions"
          hint="Allow creators to sample your audio clips and build reels using your content."
          value={settings?.whoCanRemix || "everyone"}
          options={[
            { value: "everyone", label: "Everyone" },
            { value: "followers", label: "Followers only" },
            { value: "nobody", label: "Nobody" },
          ]}
          onChange={(val: any) => onSave({ whoCanRemix: val })}
        />
      </SettingsSection>

      <SettingsSection
        title="Activity & Presence"
        description="Control what information is visible when you are active on Gihanga Updates."
        icon={Sliders}
      >
        <SettingsToggle
          id="showOnlineStatus"
          label="Show Online Status"
          hint="Allow people you follow and message to see when you're currently active."
          checked={settings?.showOnlineStatus !== false}
          onChange={(val) => onSave({ showOnlineStatus: val })}
        />

        <SettingsToggle
          id="showReadReceipts"
          label="Show Read Receipts"
          hint="Let chat participants know when you have read their messages."
          checked={settings?.showReadReceipts !== false}
          onChange={(val) => onSave({ showReadReceipts: val })}
        />

        <SettingsToggle
          id="showTypingIndicator"
          label="Show Typing Indicator"
          hint="Display the typing bubble when you are writing a message."
          checked={settings?.showTypingIndicator !== false}
          onChange={(val) => onSave({ showTypingIndicator: val })}
        />

        <SettingsToggle
          id="showLikedPosts"
          label="Display Liked Posts on Profile"
          hint="Allow other users to view your public Likes tab on your profile page."
          checked={settings?.showLikedPosts !== false}
          onChange={(val) => onSave({ showLikedPosts: val })}
        />
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 5. SECURITY SETTINGS
// -------------------------------------------------------------
function SecuritySection({
  settings,
  onSave,
}: {
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData>) => Promise<unknown>;
}) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const changePasswordMutation = useChangePassword();
  const revokeSessionsMutation = useRevokeAllSessions();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <SettingsSection
        title="Login Credentials"
        description="Keep your password strong and updated regularly to prevent unauthorized access."
        icon={Key}
      >
        <SettingsRow
          label="Account Password"
          hint="Last changed 3 months ago. We recommend at least 10 characters with mixed symbols."
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordModal(true)}
            className="rounded-xl text-xs font-bold"
          >
            Change Password
          </Button>
        </SettingsRow>
      </SettingsSection>

      {/* Two-Factor Authentication */}
      <SettingsSection
        title="Two-Factor Authentication (2FA)"
        description="Protect your Gihanga account with an extra security layer upon login."
        icon={Shield}
        badge={settings?.twoFactorEnabled ? "Active" : "Recommended"}
      >
        <SettingsToggle
          id="twoFactorEnabled"
          label="Enable Two-Factor Authentication"
          hint="Require a 6-digit confirmation code when signing in from an unrecognized browser or phone."
          checked={settings?.twoFactorEnabled || false}
          onChange={(val) => onSave({ twoFactorEnabled: val })}
        />

        {settings?.twoFactorEnabled && (
          <SettingsSelect
            label="Preferred 2FA Method"
            hint="Choose how you wish to receive your secondary security codes."
            value={settings?.twoFactorMethod || "app"}
            options={[
              { value: "app", label: "Authenticator App (Google Auth, Authy)" },
              { value: "email", label: "Email Verification Code" },
              { value: "sms", label: "SMS / Text Message" },
            ]}
            onChange={(val: any) => onSave({ twoFactorMethod: val })}
          />
        )}
      </SettingsSection>

      {/* Active Login Sessions */}
      <SettingsSection
        title="Login Activity & Sessions"
        description="Review all devices currently authenticated to your Gihanga Updates account."
        icon={Laptop}
      >
        <div className="space-y-3">
          {settings?.activeSessions && settings.activeSessions.length > 0 ? (
            settings.activeSessions.map((sess) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-elevated/60 border border-border/40"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="size-5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {sess.device} • {sess.browser}
                      </span>
                      {sess.isCurrent && (
                        <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[9px] font-extrabold">
                          This Device
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {sess.location} • {new Date(sess.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-elevated/60 border border-border/40">
              <div className="flex items-center gap-3">
                <Monitor className="size-5 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      Current Browser Session
                    </span>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[9px] font-extrabold">
                      This Device
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Kigali, Rwanda • Active now
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => revokeSessionsMutation.mutate()}
              disabled={revokeSessionsMutation.isPending}
              className="rounded-xl text-xs font-bold text-danger hover:bg-danger/10 hover:text-danger"
            >
              {revokeSessionsMutation.isPending ? "Logging out..." : "Log Out All Other Devices"}
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* Security Alerts */}
      <SettingsSection
        title="Security Alerts & Notifications"
        description="Receive instant alerts when sensitive changes happen to your account."
        icon={Bell}
      >
        <SettingsToggle
          id="loginAlerts"
          label="Unrecognized Device Logins"
          hint="Send an alert when someone logs into your account from a new location."
          checked={settings?.loginAlerts !== false}
          onChange={(val) => onSave({ loginAlerts: val })}
        />

        <SettingsToggle
          id="passwordChangeAlerts"
          label="Password & Email Modifications"
          hint="Alert you immediately if your credentials or recovery info are altered."
          checked={settings?.passwordChangeAlerts !== false}
          onChange={(val) => onSave({ passwordChangeAlerts: val })}
        />
      </SettingsSection>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs grid place-items-center p-4">
          <div className="w-full max-w-md surface-card rounded-3xl p-6 border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-extrabold text-foreground">
                Change Password
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Current Password</Label>
                <Input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">New Password</Label>
                <Input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Confirm New Password</Label>
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isChangingPassword}
                  className="rounded-xl text-xs font-bold"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 6. NOTIFICATION SETTINGS
// -------------------------------------------------------------
function NotificationsSection({
  settings,
  onSave,
}: {
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData>) => Promise<unknown>;
}) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Push Notifications"
        description="Choose which interactions trigger instant notifications on your device."
        icon={Bell}
      >
        <SettingsToggle
          id="pushLikes"
          label="Likes & Reactions"
          hint="When someone likes your post, reel, or comment."
          checked={settings?.pushLikes !== false}
          onChange={(val) => onSave({ pushLikes: val })}
        />

        <SettingsToggle
          id="pushComments"
          label="Comments & Replies"
          hint="When someone leaves a comment on your content."
          checked={settings?.pushComments !== false}
          onChange={(val) => onSave({ pushComments: val })}
        />

        <SettingsToggle
          id="pushFollows"
          label="New Followers"
          hint="When someone starts following your creator channel."
          checked={settings?.pushFollows !== false}
          onChange={(val) => onSave({ pushFollows: val })}
        />

        <SettingsToggle
          id="pushMentions"
          label="Mentions & Tags"
          hint="When someone tags your @username in a caption or story."
          checked={settings?.pushMentions !== false}
          onChange={(val) => onSave({ pushMentions: val })}
        />

        <SettingsToggle
          id="pushMessages"
          label="Direct Messages"
          hint="When you receive new private messages or chat requests."
          checked={settings?.pushMessages !== false}
          onChange={(val) => onSave({ pushMessages: val })}
        />

        <SettingsToggle
          id="pushLive"
          label="Live Streams"
          hint="When creators you follow start a live broadcast."
          checked={settings?.pushLive !== false}
          onChange={(val) => onSave({ pushLive: val })}
        />
      </SettingsSection>

      <SettingsSection
        title="Quiet Hours Mode"
        description="Mute non-urgent notifications during your resting hours."
        icon={Clock}
      >
        <SettingsToggle
          id="quietModeEnabled"
          label="Enable Quiet Hours"
          hint="Automatically mute sound and push alerts during your designated window."
          checked={settings?.quietModeEnabled || false}
          onChange={(val) => onSave({ quietModeEnabled: val })}
        />

        {settings?.quietModeEnabled && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Start Time</Label>
              <Input
                type="time"
                value={settings?.quietModeStart || "22:00"}
                onChange={(e) => onSave({ quietModeStart: e.target.value })}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">End Time</Label>
              <Input
                type="time"
                value={settings?.quietModeEnd || "07:00"}
                onChange={(e) => onSave({ quietModeEnd: e.target.value })}
                className="h-10 rounded-xl"
              />
            </div>
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        title="Email Notifications"
        description="Stay informed about transactions, security updates, and creator digests."
        icon={Globe}
      >
        <SettingsToggle
          id="emailSecurity"
          label="Security & Account Alerts"
          hint="Critical account and payment notifications (recommended)."
          checked={settings?.emailSecurity !== false}
          onChange={(val) => onSave({ emailSecurity: val })}
        />

        <SettingsToggle
          id="emailTransactions"
          label="Wallet & Financial Receipts"
          hint="Receive emailed invoices for point purchases and MoMo withdrawals."
          checked={settings?.emailTransactions !== false}
          onChange={(val) => onSave({ emailTransactions: val })}
        />

        <SettingsToggle
          id="emailDigest"
          label="Weekly Creator Digest"
          hint="A summary of your top performing posts, follower growth, and trending hashtags."
          checked={settings?.emailDigest || false}
          onChange={(val) => onSave({ emailDigest: val })}
        />
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 7. CONTENT & FEED SETTINGS
// -------------------------------------------------------------
function FeedSection({
  settings,
  onSave,
}: {
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData>) => Promise<unknown>;
}) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Content Preferences & Filters"
        description="Fine-tune your browsing experience and video playback options."
        icon={SlidersHorizontal}
      >
        <SettingsSelect
          label="Sensitive Content Filter"
          hint="Control the amount of sensitive or age-restricted media displayed in your feed."
          value={settings?.sensitiveContentFilter || "standard"}
          options={[
            { value: "less", label: "Strict (Hide all sensitive material)" },
            { value: "standard", label: "Standard (Default protection)" },
            { value: "more", label: "Relaxed (Show all content)" },
          ]}
          onChange={(val: any) => onSave({ sensitiveContentFilter: val })}
        />

        <SettingsSelect
          label="Autoplay Videos & Reels"
          hint="Choose under which network conditions videos automatically play in your feed."
          value={settings?.autoplayVideos || "always"}
          options={[
            { value: "always", label: "Always Autoplay (Wi-Fi + Cellular)" },
            { value: "wifi", label: "Only on Wi-Fi" },
            { value: "never", label: "Never Autoplay" },
          ]}
          onChange={(val: any) => onSave({ autoplayVideos: val })}
        />

        <SettingsToggle
          id="dataSaver"
          label="Data Saver Mode"
          hint="Stream lower resolution videos and compress images to conserve mobile data."
          checked={settings?.dataSaver || false}
          onChange={(val) => onSave({ dataSaver: val })}
        />

        <SettingsSelect
          label="Preferred Video Quality"
          hint="Set default stream resolution for reels and video broadcasts."
          value={settings?.preferredVideoQuality || "auto"}
          options={[
            { value: "auto", label: "Automatic (Optimized for speed)" },
            { value: "high", label: "High Definition (1080p)" },
            { value: "low", label: "Low Data (480p)" },
          ]}
          onChange={(val: any) => onSave({ preferredVideoQuality: val })}
        />
      </SettingsSection>

      <SettingsSection
        title="Feed Personalization"
        description="Gihanga adapts to content you watch, like, and share."
        icon={Sparkles}
      >
        <SettingsSelect
          label="Default Feed View"
          hint="Select the feed tab displayed by default when opening Gihanga Updates."
          value={settings?.defaultFeed || "for_you"}
          options={[
            { value: "for_you", label: "For You (Discovery & Recommended)" },
            { value: "following", label: "Following (Accounts you follow)" },
          ]}
          onChange={(val: any) => onSave({ defaultFeed: val })}
        />

        <SettingsToggle
          id="hideSuggestedContent"
          label="Reduce Suggested Posts"
          hint="Prioritize posts strictly from people you follow in your main timeline."
          checked={settings?.hideSuggestedContent || false}
          onChange={(val) => onSave({ hideSuggestedContent: val })}
        />
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 8. MESSAGES SETTINGS
// -------------------------------------------------------------
function MessagesSection({
  settings,
  onSave,
}: {
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData>) => Promise<unknown>;
}) {
  const [newBlockedWord, setNewBlockedWord] = useState("");
  const blockedWords = settings?.blockedWords || [];

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedWord.trim()) return;
    const word = newBlockedWord.trim().toLowerCase();
    if (!blockedWords.includes(word)) {
      onSave({ blockedWords: [...blockedWords, word] });
    }
    setNewBlockedWord("");
  };

  const handleRemoveWord = (wordToRemove: string) => {
    onSave({ blockedWords: blockedWords.filter((w) => w !== wordToRemove) });
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Direct Messaging Controls"
        description="Manage privacy, message requests, and chat behavior."
        icon={MessageSquare}
      >
        <SettingsSelect
          label="Message Requests"
          hint="Who can send you incoming chat requests."
          value={settings?.messageRequests || "everyone"}
          options={[
            { value: "everyone", label: "Everyone" },
            { value: "followers", label: "Followers only" },
            { value: "following", label: "People you follow" },
            { value: "nobody", label: "Nobody" },
          ]}
          onChange={(val: any) => onSave({ messageRequests: val })}
        />

        <SettingsToggle
          id="msgReadReceipts"
          label="Read Receipts"
          hint="Show when you have viewed messages in direct conversations."
          checked={settings?.readReceipts !== false}
          onChange={(val) => onSave({ readReceipts: val })}
        />

        <SettingsToggle
          id="msgTypingIndicator"
          label="Typing Indicators"
          hint="Display real-time typing indicators in chat rooms."
          checked={settings?.typingIndicator !== false}
          onChange={(val) => onSave({ typingIndicator: val })}
        />

        <SettingsSelect
          label="Auto-Download Media"
          hint="Automatically download incoming photos, audio clips, and documents."
          value={settings?.autoDownloadMedia || "wifi"}
          options={[
            { value: "always", label: "Always (Wi-Fi + Mobile)" },
            { value: "wifi", label: "Wi-Fi Only" },
            { value: "never", label: "Never (Manual Download)" },
          ]}
          onChange={(val: any) => onSave({ autoDownloadMedia: val })}
        />
      </SettingsSection>

      <SettingsSection
        title="Hidden Words & Comment Filter"
        description="Messages and comments containing these words or phrases will be automatically filtered."
        icon={Ban}
      >
        <form onSubmit={handleAddWord} className="flex gap-2">
          <Input
            placeholder="Add word or phrase to filter..."
            value={newBlockedWord}
            onChange={(e) => setNewBlockedWord(e.target.value)}
            className="h-10 rounded-xl text-xs"
          />
          <Button type="submit" size="sm" className="rounded-xl font-bold text-xs">
            Add Filter
          </Button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {blockedWords.length === 0 ? (
            <span className="text-xs text-muted-foreground">No filtered words added yet.</span>
          ) : (
            blockedWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 rounded-xl bg-elevated border border-border px-3 py-1 text-xs font-bold text-foreground"
              >
                {word}
                <button
                  type="button"
                  onClick={() => handleRemoveWord(word)}
                  className="text-muted-foreground hover:text-danger"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 9. LIVE & CREATOR SETTINGS
// -------------------------------------------------------------
function CreatorSection({
  settings,
  onSave,
}: {
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData>) => Promise<unknown>;
}) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Live Broadcast Defaults"
        description="Configure stream defaults, audience privacy, and replay archiving."
        icon={Radio}
        badge="Live Studio"
      >
        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Default Stream Title</Label>
          <Input
            value={settings?.defaultLiveTitle || "Live with Gihanga Community"}
            onChange={(e) => onSave({ defaultLiveTitle: e.target.value })}
            className="h-10 rounded-xl text-xs font-bold"
          />
        </div>

        <SettingsSelect
          label="Default Audience"
          hint="Select who is invited when you begin a new live broadcast."
          value={settings?.defaultLiveAudience || "public"}
          options={[
            { value: "public", label: "Public (Open to everyone)" },
            { value: "followers", label: "Followers Only" },
            { value: "subscribers", label: "Subscribers / Top Supporters" },
          ]}
          onChange={(val: any) => onSave({ defaultLiveAudience: val })}
        />

        <SettingsToggle
          id="notifyFollowersOnLive"
          label="Broadcast Notification"
          hint="Send push alert to followers as soon as you go live."
          checked={settings?.notifyFollowersOnLive !== false}
          onChange={(val) => onSave({ notifyFollowersOnLive: val })}
        />

        <SettingsToggle
          id="saveLiveReplays"
          label="Save Live Replays"
          hint="Automatically archive full broadcast recordings to your Creator Studio."
          checked={settings?.saveLiveReplays !== false}
          onChange={(val) => onSave({ saveLiveReplays: val })}
        />
      </SettingsSection>

      <SettingsSection
        title="Chat Moderation"
        description="Ensure a respectful and engaging atmosphere during your live streams."
        icon={Shield}
      >
        <SettingsToggle
          id="allowLiveComments"
          label="Allow Live Chat"
          hint="Enable real-time viewer messages during your broadcast."
          checked={settings?.allowLiveComments !== false}
          onChange={(val) => onSave({ allowLiveComments: val })}
        />

        <SettingsToggle
          id="liveSlowMode"
          label="Chat Slow Mode"
          hint="Limit viewers to one message every 5 seconds to reduce spam."
          checked={settings?.liveSlowMode || false}
          onChange={(val) => onSave({ liveSlowMode: val })}
        />
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 10. WALLET & PAYMENTS SETTINGS
// -------------------------------------------------------------
function WalletSection({
  settings,
  wallet,
  user,
}: {
  settings?: UserSettingsData | undefined;
  wallet?: UserSettingsWallet | undefined;
  user: UserSettingsUser | null;
}) {
  const points = wallet?.kingdomPoints ?? 0;
  const cash = wallet?.available ? `${wallet.available.toLocaleString()} RWF` : "0 RWF";
  const phone = settings?.phone || user?.mtnMomoNumber;

  const maskedPhone = useMemo(() => {
    if (!phone) return "No Mobile Money linked";
    const cleaned = phone.replace(/\s+/g, "");
    if (cleaned.length < 7) return cleaned;
    return `${cleaned.substring(0, 6)} •••• ${cleaned.substring(cleaned.length - 3)}`;
  }, [phone]);

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <div className="surface-card rounded-3xl p-6 border border-border shadow-soft bg-gradient-to-br from-card to-primary/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Creator Balance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="font-display text-3xl font-black text-foreground">{cash}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              ≈ {points} Gihanga Points available
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button className="rounded-xl font-bold text-xs h-9">Withdraw to MoMo</Button>
            <Button variant="outline" className="rounded-xl font-bold text-xs h-9">
              Add Points
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <SettingsSection
        title="Connected Payment Methods"
        description="Manage your payout channels and payment sources."
        icon={CreditCard}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-elevated border border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500/20 text-amber-500 grid place-items-center font-black text-xs">
                MTN
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    MTN Mobile Money (Rwanda)
                  </span>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[9px] font-extrabold">
                    Primary Payout
                  </span>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                  {maskedPhone} {phone ? "• Verified" : ""}
                </p>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold text-primary">
              Manage
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 11. ADS & PROMOTIONS SETTINGS
// -------------------------------------------------------------
function AdsSection({
  settings,
  onSave,
}: {
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData>) => Promise<unknown>;
}) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Personal Advertising Preferences"
        description="Control how advertising content is personalized to your interests."
        icon={Zap}
      >
        <SettingsToggle
          id="personalizedAds"
          label="Personalized Ads"
          hint="Allow Gihanga to tailor promoted posts based on your viewing history and creator interests."
          checked={true}
          onChange={() => toast.info("Ad preferences saved")}
        />

        <SettingsToggle
          id="partnerAds"
          label="Ecosystem Partner Offers"
          hint="Receive discounts and promotions from vetted Rwandan creators and businesses."
          checked={true}
          onChange={() => toast.info("Partner preferences saved")}
        />
      </SettingsSection>

      <SettingsSection
        title="Creator Promotions & Boosts"
        description="Monitor budget limits and point spending for boosted posts."
        icon={Sparkles}
      >
        <SettingsRow
          label="Promotions Balance"
          hint="Use Gihanga Points to boost reels and reach wider audiences."
        >
          <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
            Create Campaign
          </Button>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 12. APPEARANCE SETTINGS
// -------------------------------------------------------------
function AppearanceSection({
  settings,
  theme,
  setTheme,
  onSave,
}: {
  settings?: UserSettingsData | undefined;
  theme: string;
  setTheme: (theme: "light" | "dark") => void;
  onSave: (updates: Partial<UserSettingsData>) => Promise<unknown>;
}) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Theme & Interface Styling"
        description="Personalize the visual aesthetics of Gihanga Updates."
        icon={Moon}
      >
        <div className="space-y-2">
          <Label className="text-xs font-bold">Color Theme</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setTheme("light");
                onSave({ theme: "light" });
              }}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all",
                theme === "light"
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border bg-elevated hover:border-primary/50",
              )}
            >
              <Sun className="size-5 text-amber-500" />
              <div>
                <span className="text-xs font-bold block text-foreground">Light Mode</span>
                <span className="text-[10px] text-muted-foreground">Clean daylight theme</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme("dark");
                onSave({ theme: "dark" });
              }}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all",
                theme === "dark"
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border bg-elevated hover:border-primary/50",
              )}
            >
              <Moon className="size-5 text-primary" />
              <div>
                <span className="text-xs font-bold block text-foreground">Dark Mode</span>
                <span className="text-[10px] text-muted-foreground">
                  Sleek obsidian night theme
                </span>
              </div>
            </button>
          </div>
        </div>

        <SettingsSelect
          label="Interface Density"
          hint="Adjust padding and element sizes across lists and cards."
          value={settings?.density || "comfortable"}
          options={[
            { value: "comfortable", label: "Comfortable (Standard spacing)" },
            { value: "compact", label: "Compact (Fit more on screen)" },
          ]}
          onChange={(val: any) => onSave({ density: val })}
        />

        <SettingsSelect
          label="Micro-Animations"
          hint="Control spring physics and transition effects."
          value={settings?.animations || "full"}
          options={[
            { value: "full", label: "Full (Smooth spring animations)" },
            { value: "reduced", label: "Reduced (Minimal transitions)" },
          ]}
          onChange={(val: any) => onSave({ animations: val })}
        />
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 13. ACCESSIBILITY SETTINGS
// -------------------------------------------------------------
function AccessibilitySection({
  settings,
  onSave,
}: {
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData>) => Promise<unknown>;
}) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Accessibility & Readability"
        description="Make Gihanga Updates easier to navigate and read."
        icon={Sliders}
      >
        <SettingsToggle
          id="reducedMotion"
          label="Reduced Motion"
          hint="Minimizes smooth page sliding and video background effects."
          checked={settings?.reducedMotion || false}
          onChange={(val) => onSave({ reducedMotion: val })}
        />

        <SettingsToggle
          id="largerText"
          label="Larger Typography"
          hint="Increases font scaling across captions, comments, and navigation labels."
          checked={settings?.largerText || false}
          onChange={(val) => onSave({ largerText: val })}
        />

        <SettingsToggle
          id="highContrast"
          label="High Contrast Mode"
          hint="Boosts text and border contrast for clearer visibility in bright environments."
          checked={settings?.highContrast || false}
          onChange={(val) => onSave({ highContrast: val })}
        />

        <SettingsToggle
          id="captionsEnabled"
          label="Closed Captions & Subtitles"
          hint="Display automatic transcripts on video reels and creator streams."
          checked={settings?.captionsEnabled !== false}
          onChange={(val) => onSave({ captionsEnabled: val })}
        />
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 14. LANGUAGE & REGION
// -------------------------------------------------------------
function LanguageSection({
  settings,
  onSave,
}: {
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData>) => Promise<unknown>;
}) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Language & Regional Preferences"
        description="Select your preferred language, date formats, and regional display units."
        icon={Globe}
      >
        <SettingsSelect
          label="Interface Language"
          hint="The primary language used throughout Gihanga Updates."
          value={settings?.language || "en"}
          options={[
            { value: "en", label: "English (US)" },
            { value: "rw", label: "Ikinyarwanda" },
            { value: "fr", label: "Français" },
            { value: "sw", label: "Kiswahili" },
          ]}
          onChange={(val: any) => onSave({ language: val })}
        />

        <SettingsSelect
          label="Country / Region"
          hint="Localizes trending topics, verified creator highlights, and currency."
          value={settings?.region || "RW"}
          options={[
            { value: "RW", label: "Rwanda" },
            { value: "KE", label: "Kenya" },
            { value: "UG", label: "Uganda" },
            { value: "TZ", label: "Tanzania" },
            { value: "CD", label: "DR Congo" },
            { value: "GLOBAL", label: "International / Global" },
          ]}
          onChange={(val: any) => onSave({ region: val })}
        />

        <SettingsSelect
          label="Timezone"
          hint="Used for scheduling posts and calculating quiet hours."
          value={settings?.timezone || "Africa/Kigali"}
          options={[
            { value: "Africa/Kigali", label: "Kigali (CAT, GMT+2)" },
            { value: "Africa/Nairobi", label: "Nairobi (EAT, GMT+3)" },
            { value: "UTC", label: "Coordinated Universal Time (UTC)" },
          ]}
          onChange={(val: any) => onSave({ timezone: val })}
        />
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 15. DATA & STORAGE
// -------------------------------------------------------------
function StorageSection({
  settings,
  onSave,
}: {
  settings?: UserSettingsData | undefined;
  onSave: (updates: Partial<UserSettingsData>) => Promise<unknown>;
}) {
  const [isClearingCache, setIsClearingCache] = useState(false);
  const requestDataMutation = useRequestAccountData();

  const handleClearCache = () => {
    setIsClearingCache(true);
    setTimeout(() => {
      onSave({ cacheClearedAt: new Date().toISOString() });
      setIsClearingCache(false);
      toast.success("Cache cleared successfully (57.0 MB freed)");
    }, 600);
  };

  const handleDownloadData = async () => {
    try {
      const res = await requestDataMutation.mutateAsync();
      const blob = new Blob([JSON.stringify(res.exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gihanga-account-archive-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Account data archive downloaded");
    } catch {
      toast.error("Failed to generate account archive");
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Local Storage & Temporary Files"
        description="Manage cached media, previews, and offline assets on this browser."
        icon={Database}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-elevated border border-border">
            <span className="text-xs font-bold text-muted-foreground block">Cached Media</span>
            <span className="text-lg font-black text-foreground mt-1 block">42.8 MB</span>
          </div>
          <div className="p-4 rounded-2xl bg-elevated border border-border">
            <span className="text-xs font-bold text-muted-foreground block">App Assets</span>
            <span className="text-lg font-black text-foreground mt-1 block">14.2 MB</span>
          </div>
        </div>

        <SettingsRow
          label="Clear Local Cache"
          hint="Clearing cache frees disk space without deleting any of your posts, messages, or account data."
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            disabled={isClearingCache}
            className="rounded-xl text-xs font-bold"
          >
            {isClearingCache ? "Clearing..." : "Clear Cache"}
          </Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="Download Your Data Archive"
        description="Request a machine-readable JSON copy of your profile, posts, settings, and interactions."
        icon={Download}
      >
        <SettingsRow
          label="Export Account Data"
          hint="Generates a secure archive containing all data associated with your Gihanga Updates identity."
        >
          <Button
            size="sm"
            onClick={handleDownloadData}
            disabled={requestDataMutation.isPending}
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            <Download className="size-3.5" />
            {requestDataMutation.isPending ? "Generating..." : "Download JSON Archive"}
          </Button>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 16. CONNECTED APPS
// -------------------------------------------------------------
function ConnectedAppsSection() {
  const [apps, setApps] = useState([
    {
      id: "app-1",
      name: "Gihanga Creator Studio Desktop",
      permissions: "Stream keys, Live analytics, Story management",
      lastUsed: "2 hours ago",
    },
    {
      id: "app-2",
      name: "Kigali Soundcloud Connector",
      permissions: "Audio snippet imports",
      lastUsed: "Yesterday",
    },
  ]);

  const handleDisconnect = (id: string, name: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    toast.success(`Disconnected from ${name}`);
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Authorized Applications"
        description="Third-party applications and desktop tools with access to your Gihanga Updates account."
        icon={LinkIcon}
      >
        {apps.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No third-party apps are currently connected to your account.
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-elevated border border-border"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-foreground">{app.name}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Permissions: {app.permissions}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 mt-1">
                    Last active: {app.lastUsed}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(app.id, app.name)}
                  className="rounded-xl text-xs font-bold text-danger hover:bg-danger/10 hover:text-danger"
                >
                  Disconnect
                </Button>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 17. BLOCKED ACCOUNTS
// -------------------------------------------------------------
function BlockedAccountsSection() {
  const { data: blockedUsernames, isLoading } = useBlockedUsers();
  const toggleBlock = useToggleBlockUser();
  const [filterQuery, setFilterQuery] = useState("");

  const filtered = useMemo(() => {
    if (!blockedUsernames) return [];
    if (!filterQuery.trim()) return blockedUsernames;
    return blockedUsernames.filter((u) => u.toLowerCase().includes(filterQuery.toLowerCase()));
  }, [blockedUsernames, filterQuery]);

  const handleUnblock = async (username: string) => {
    try {
      await toggleBlock.mutateAsync(username);
      toast.success(`Unblocked @${username}`);
    } catch {
      toast.error("Failed to unblock user");
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Blocked Accounts"
        description="Blocked accounts cannot see your posts, send messages, or discover your profile."
        icon={Ban}
      >
        {blockedUsernames && blockedUsernames.length > 3 && (
          <Input
            placeholder="Search blocked users..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="h-10 rounded-xl text-xs mb-3"
          />
        )}

        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Loading blocked list...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {filterQuery ? "No matching blocked users." : "You have not blocked any users."}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((username) => (
              <div
                key={username}
                className="flex items-center justify-between p-3 rounded-2xl bg-elevated border border-border"
              >
                <div className="flex items-center gap-3">
                  <GAvatar
                    user={
                      {
                        id: username,
                        name: username,
                        username,
                        avatarHue: 205,
                        avatarUrl: null,
                        creator: false,
                        verified: false,
                        live: false,
                        followers: 0,
                        following: 0,
                        posts: 0,
                      } as any
                    }
                    size="sm"
                    className="size-8 aspect-square"
                  />
                  <span className="text-xs font-bold text-foreground">@{username}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnblock(username)}
                  className="rounded-xl text-xs font-bold"
                >
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 18. HELP & SUPPORT
// -------------------------------------------------------------
function HelpSupportSection() {
  const [problemDescription, setProblemDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setProblemDescription("");
      toast.success("Problem report sent to Gihanga Support team. Ticket #4921 opened.");
    }, 700);
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Help Center & Community Guidelines"
        description="Learn how to make the most of Gihanga Updates and maintain a positive community."
        icon={HelpCircle}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="mailto:support@gihanga.rw"
            className="p-4 rounded-2xl bg-elevated border border-border hover:border-primary/50 transition-all flex items-center justify-between group"
          >
            <div>
              <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary">
                Contact Support
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">support@gihanga.rw</p>
            </div>
            <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary" />
          </a>

          <div className="p-4 rounded-2xl bg-elevated border border-border">
            <h4 className="text-xs font-extrabold text-foreground">Community Guidelines</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Read our safety standards and content policy
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Report a Problem"
        description="Encountering a bug, video loading issue, or payment concern? Let our engineering team know."
        icon={AlertTriangle}
      >
        <form onSubmit={handleSubmitProblem} className="space-y-3">
          <textarea
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            rows={3}
            required
            placeholder="Briefly explain what went wrong..."
            className="w-full rounded-xl bg-elevated border border-border p-3 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="rounded-xl font-bold text-xs"
            >
              {isSubmitting ? "Submitting..." : "Send Problem Report"}
            </Button>
          </div>
        </form>
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 19. ABOUT SECTION
// -------------------------------------------------------------
function AboutSection() {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="About Gihanga Updates"
        description="The next-generation pan-African digital creator & social networking platform."
        icon={Info}
      >
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-2 border-b border-border/40">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono font-bold text-foreground">v2.4.0 (Build 2026.09)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/40">
            <span className="text-muted-foreground">Engineering</span>
            <span className="font-bold text-foreground">Gihanga Tech Lab • Kigali, Rwanda</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/40">
            <span className="text-muted-foreground">Terms of Service</span>
            <span className="font-bold text-primary cursor-pointer hover:underline">
              Read Terms
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Privacy Policy</span>
            <span className="font-bold text-primary cursor-pointer hover:underline">
              Read Privacy Policy
            </span>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}

// -------------------------------------------------------------
// 20. ACCOUNT MANAGEMENT (DANGER ZONE)
// -------------------------------------------------------------
function AccountManagementSection() {
  const navigate = useNavigate();
  const { signOutConsumer } = useAuth();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const deactivateMutation = useDeactivateAccount();
  const deleteMutation = useDeleteAccount();

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync({});
      toast.success("Account temporarily deactivated");
      signOutConsumer();
      navigate({ to: "/login" });
    } catch {
      toast.error("Failed to deactivate account");
    }
  };

  const handleDeletePermanent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      toast.error("Please enter your current password to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ password: deletePassword });
      toast.success("Your Gihanga account has been permanently deleted");
      signOutConsumer();
      navigate({ to: "/register" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Incorrect password. Could not delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Session Termination"
        description="Sign out from your active device or close all ongoing sessions."
        icon={LogOut}
      >
        <SettingsRow
          label="Sign Out of Current Session"
          hint="You can log back in at any time with your credentials."
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOutConsumer()}
            className="rounded-xl text-xs font-bold"
          >
            Sign Out
          </Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="Danger Zone: Account Closure"
        description="Temporary deactivation or permanent deletion of your profile and data."
        icon={Trash2}
        danger
      >
        <SettingsRow
          label="Temporarily Deactivate Account"
          hint="Hide your profile, posts, and comments until you log back in."
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeactivateModal(true)}
            className="rounded-xl text-xs font-bold border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
          >
            Deactivate
          </Button>
        </SettingsRow>

        <SettingsRow
          label="Permanently Delete Account"
          hint="Irreversible action: Deletes all posts, stories, reels, points, and chat records permanently."
        >
          <Button
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-xl text-xs font-bold bg-danger hover:bg-danger/90 text-white"
          >
            Delete Account
          </Button>
        </SettingsRow>
      </SettingsSection>

      {/* Deactivation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs grid place-items-center p-4">
          <div className="w-full max-w-md surface-card rounded-3xl p-6 border border-border shadow-2xl space-y-4">
            <h3 className="font-display text-base font-extrabold text-foreground">
              Deactivate Account?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your profile, posts, and followers will be temporarily hidden. You can reactivate your
              account at any time simply by logging back in.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeactivateModal(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeactivate}
                disabled={deactivateMutation.isPending}
                className="rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white"
              >
                {deactivateMutation.isPending ? "Deactivating..." : "Confirm Deactivation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs grid place-items-center p-4">
          <div className="w-full max-w-md surface-card rounded-3xl p-6 border border-danger/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="size-5" />
              <h3 className="font-display text-base font-extrabold">Permanent Account Deletion</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This action <strong className="text-danger">CANNOT</strong> be undone. All your posts,
              followers, points balance, and messaging history will be erased from Gihanga Updates.
            </p>

            <form onSubmit={handleDeletePermanent} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Confirm Your Password</Label>
                <Input
                  type="password"
                  required
                  placeholder="Enter current password..."
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isDeleting}
                  className="rounded-xl text-xs font-bold bg-danger hover:bg-danger/90 text-white"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
