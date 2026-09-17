import { Schema, model, Document, Types } from "mongoose";

export interface IUserSettings extends Document {
  user: Types.ObjectId;

  // Account details
  phone?: string;
  phoneVerified: boolean;
  dob?: string;
  gender?: string;
  website?: string;
  creatorCategory?: string;

  // Privacy Settings
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

  // Security Settings
  twoFactorEnabled: boolean;
  twoFactorMethod: "app" | "email" | "sms";
  loginAlerts: boolean;
  passwordChangeAlerts: boolean;
  securityAlerts: boolean;
  activeSessions: Array<{
    id: string;
    device: string;
    browser: string;
    os: string;
    ip: string;
    location: string;
    lastActive: Date;
    isCurrent: boolean;
  }>;

  // Notification Settings (Granular Push & Email)
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

  // Content & Feed Preferences
  sensitiveContentFilter: "standard" | "less" | "more";
  autoplayVideos: "always" | "wifi" | "never";
  dataSaver: boolean;
  preferredVideoQuality: "auto" | "high" | "low";
  hideSuggestedContent: boolean;
  defaultFeed: "for_you" | "following";

  // Messaging Preferences
  messageRequests: "everyone" | "followers" | "following" | "nobody";
  readReceipts: boolean;
  typingIndicator: boolean;
  autoDownloadMedia: "always" | "wifi" | "never";
  blockedWords: string[];

  // Live & Creator Defaults
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

  // Language & Regional Defaults
  language: string;
  region: string;
  timezone: string;
  dateFormat: string;
  currency: string;

  // Storage & Export Metadata
  cacheClearedAt?: Date;
  dataExportRequestedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

    phone: { type: String },
    phoneVerified: { type: Boolean, default: false },
    dob: { type: String },
    gender: { type: String, default: "prefer_not_to_say" },
    website: { type: String, default: "" },
    creatorCategory: { type: String, default: "General Creator" },

    isPrivateAccount: { type: Boolean, default: false },
    whoCanFollow: { type: String, enum: ["everyone", "approval"], default: "everyone" },
    whoCanMessage: { type: String, enum: ["everyone", "followers", "following", "nobody"], default: "everyone" },
    whoCanComment: { type: String, enum: ["everyone", "followers", "following", "nobody"], default: "everyone" },
    whoCanMention: { type: String, enum: ["everyone", "followers", "following", "nobody"], default: "everyone" },
    whoCanTag: { type: String, enum: ["everyone", "followers", "following", "nobody"], default: "everyone" },
    whoCanRemix: { type: String, enum: ["everyone", "followers", "nobody"], default: "everyone" },
    showOnlineStatus: { type: Boolean, default: true },
    showActivityStatus: { type: Boolean, default: true },
    showReadReceipts: { type: Boolean, default: true },
    showTypingIndicator: { type: Boolean, default: true },
    showLikedPosts: { type: Boolean, default: true },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String, enum: ["app", "email", "sms"], default: "email" },
    loginAlerts: { type: Boolean, default: true },
    passwordChangeAlerts: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    activeSessions: {
      type: [
        {
          id: { type: String },
          device: { type: String },
          browser: { type: String },
          os: { type: String },
          ip: { type: String },
          location: { type: String },
          lastActive: { type: Date, default: Date.now },
          isCurrent: { type: Boolean, default: false },
        },
      ],
      default: [],
    },

    pushLikes: { type: Boolean, default: true },
    pushComments: { type: Boolean, default: true },
    pushFollows: { type: Boolean, default: true },
    pushMentions: { type: Boolean, default: true },
    pushMessages: { type: Boolean, default: true },
    pushLive: { type: Boolean, default: true },
    pushCreator: { type: Boolean, default: true },
    pushRewards: { type: Boolean, default: true },
    pushWallet: { type: Boolean, default: true },
    pushPromotions: { type: Boolean, default: false },

    emailDigest: { type: Boolean, default: true },
    emailSecurity: { type: Boolean, default: true },
    emailNews: { type: Boolean, default: false },
    emailTransactions: { type: Boolean, default: true },

    inAppSounds: { type: Boolean, default: true },
    inAppVibration: { type: Boolean, default: true },
    quietModeEnabled: { type: Boolean, default: false },
    quietModeStart: { type: String, default: "22:00" },
    quietModeEnd: { type: String, default: "07:00" },

    sensitiveContentFilter: { type: String, enum: ["standard", "less", "more"], default: "standard" },
    autoplayVideos: { type: String, enum: ["always", "wifi", "never"], default: "always" },
    dataSaver: { type: Boolean, default: false },
    preferredVideoQuality: { type: String, enum: ["auto", "high", "low"], default: "auto" },
    hideSuggestedContent: { type: Boolean, default: false },
    defaultFeed: { type: String, enum: ["for_you", "following"], default: "for_you" },

    messageRequests: { type: String, enum: ["everyone", "followers", "following", "nobody"], default: "everyone" },
    readReceipts: { type: Boolean, default: true },
    typingIndicator: { type: Boolean, default: true },
    autoDownloadMedia: { type: String, enum: ["always", "wifi", "never"], default: "wifi" },
    blockedWords: { type: [String], default: [] },

    defaultLiveTitle: { type: String, default: "Live with Gihanga community" },
    defaultLiveAudience: { type: String, enum: ["public", "followers", "subscribers"], default: "public" },
    allowLiveComments: { type: Boolean, default: true },
    saveLiveReplays: { type: Boolean, default: true },
    notifyFollowersOnLive: { type: Boolean, default: true },
    liveSlowMode: { type: Boolean, default: false },
    liveSlowModeSeconds: { type: Number, default: 5 },
    creatorEarningsAlerts: { type: Boolean, default: true },
    creatorMilestoneAlerts: { type: Boolean, default: true },

    theme: { type: String, enum: ["light", "dark", "system"], default: "dark" },
    density: { type: String, enum: ["comfortable", "compact"], default: "comfortable" },
    animations: { type: String, enum: ["full", "reduced"], default: "full" },
    reducedMotion: { type: Boolean, default: false },
    largerText: { type: Boolean, default: false },
    highContrast: { type: Boolean, default: false },
    screenReaderLabels: { type: Boolean, default: true },
    captionsEnabled: { type: Boolean, default: false },

    language: { type: String, default: "en" },
    region: { type: String, default: "RW" },
    timezone: { type: String, default: "Africa/Kigali" },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    currency: { type: String, default: "RWF" },

    cacheClearedAt: { type: Date },
    dataExportRequestedAt: { type: Date },
  },
  { timestamps: true }
);

export const UserSettings = model<IUserSettings>("UserSettings", UserSettingsSchema);
