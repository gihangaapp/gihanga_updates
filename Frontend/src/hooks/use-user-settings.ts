import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserSettingsData {
  _id?: string;
  user: string;

  // Account
  phone?: string;
  phoneVerified: boolean;
  dob?: string;
  gender: string;
  website?: string;
  creatorCategory?: string;

  // Privacy
  isPrivateAccount: boolean;
  whoCanFollow: "everyone" | "approval";
  whoCanMessage: "everyone" | "followers" | "following" | "nobody";
  whoCanComment: "everyone" | "followers" | "following" | "nobody";
  whoCanMention: "everyone" | "followers" | "following" | "nobody";
  whoCanTag: "everyone" | "followers" | "following" | "nobody";
  whoCanRemix: "everyone" | "followers" | "nobody";
  showOnlineStatus: boolean;
  showActivityStatus: boolean;
  showReadReceipts: boolean;
  showTypingIndicator: boolean;
  showLikedPosts: boolean;

  // Security
  twoFactorEnabled: boolean;
  twoFactorMethod: "app" | "email" | "sms";
  loginAlerts: boolean;
  passwordChangeAlerts: boolean;
  securityAlerts: boolean;
  activeSessions: ActiveSession[];

  // Notifications
  pushLikes: boolean;
  pushComments: boolean;
  pushFollows: boolean;
  pushMentions: boolean;
  pushMessages: boolean;
  pushLive: boolean;
  pushCreator: boolean;
  pushRewards: boolean;
  pushWallet: boolean;
  pushPromotions: boolean;

  emailDigest: boolean;
  emailSecurity: boolean;
  emailNews: boolean;
  emailTransactions: boolean;

  inAppSounds: boolean;
  inAppVibration: boolean;
  quietModeEnabled: boolean;
  quietModeStart: string;
  quietModeEnd: string;

  // Content & Feed
  sensitiveContentFilter: "standard" | "less" | "more";
  autoplayVideos: "always" | "wifi" | "never";
  dataSaver: boolean;
  preferredVideoQuality: "auto" | "high" | "low";
  hideSuggestedContent: boolean;
  defaultFeed: "for_you" | "following";

  // Messages
  messageRequests: "everyone" | "followers" | "following" | "nobody";
  readReceipts: boolean;
  typingIndicator: boolean;
  autoDownloadMedia: "always" | "wifi" | "never";
  blockedWords: string[];

  // Live & Creator
  defaultLiveTitle: string;
  defaultLiveAudience: "public" | "followers" | "subscribers";
  allowLiveComments: boolean;
  saveLiveReplays: boolean;
  notifyFollowersOnLive: boolean;
  liveSlowMode: boolean;
  liveSlowModeSeconds: number;
  creatorEarningsAlerts: boolean;
  creatorMilestoneAlerts: boolean;

  // Appearance & Accessibility
  theme: "light" | "dark" | "system";
  density: "comfortable" | "compact";
  animations: "full" | "reduced";
  reducedMotion: boolean;
  largerText: boolean;
  highContrast: boolean;
  screenReaderLabels: boolean;
  captionsEnabled: boolean;

  // Language & Region
  language: string;
  region: string;
  timezone: string;
  dateFormat: string;
  currency: string;

  // Storage
  cacheClearedAt?: string;
  dataExportRequestedAt?: string;
}

export interface UserSettingsUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarHue?: number;
  avatarUrl: string | null;
  bio: string;
  role?: string;
  isCreator?: boolean;
  verified?: boolean;
  emailVerified?: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  mtnMomoNumber?: string;
  createdAt?: string;
}

export interface UserSettingsWallet {
  available: number;
  pending: number;
  lifetime: number;
  kingdomPoints: number;
}

export interface SettingsPayload {
  settings: UserSettingsData;
  user: UserSettingsUser | null;
  wallet: UserSettingsWallet;
}

export function useUserSettings() {
  return useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const res = await api.get<SettingsPayload>("/users/settings");
      return res;
    },
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<UserSettingsData> & Partial<UserSettingsUser>) => {
      const res = await api.patch<{ settings: UserSettingsData; user?: UserSettingsUser; message: string }>("/users/settings", updates);
      return res;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<SettingsPayload>(["user-settings"], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          settings: data.settings || prev.settings,
          user: data.user ? { ...prev.user, ...data.user } as UserSettingsUser : prev.user,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
    onError: () => {
      toast.error("Failed to save settings. Please try again.");
    },
  });
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      const res = await api.get<{ usernames: string[] }>("/blocks/mine");
      return res.usernames || [];
    },
  });
}

export function useToggleBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      return api.post<{ blocked: boolean }>(`/blocks/${encodeURIComponent(username)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return api.post<{ success: boolean; message: string }>("/users/settings/change-password", data);
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return api.post<{ success: boolean; message: string }>("/users/settings/sessions/revoke-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast.success("All other sessions logged out.");
    },
  });
}

export function useRequestAccountData() {
  return useMutation({
    mutationFn: async () => {
      return api.post<{ success: boolean; message: string; exportData: any }>("/users/settings/request-data");
    },
  });
}

export function useDeactivateAccount() {
  return useMutation({
    mutationFn: async (data: { password?: string }) => {
      return api.post<{ success: boolean; message: string }>("/users/settings/deactivate", data);
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (data: { password: string }) => {
      return api.delete<{ success: boolean; message: string }>("/users/settings/account");
    },
  });
}
