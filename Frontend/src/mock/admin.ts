/**
 * Mock admin / trust-and-safety data (frontend only).
 */
import type { User } from "@/types";
import { posts, users } from "./data";

const U = (i: number) => users[i] as User;

export interface PlatformStat {
  label: string;
  value: string;
  delta: number;
  hint: string;
}

export const platformStats: PlatformStat[] = [
  { label: "Daily active", value: "184.2K", delta: 6.4, hint: "vs last week" },
  { label: "Posts today", value: "12,940", delta: 3.1, hint: "vs yesterday" },
  { label: "Open reports", value: "37", delta: -18.2, hint: "queue trending down" },
  { label: "Ad revenue", value: "RWF 8.4M", delta: 11.7, hint: "month to date" },
];

export const platformTrend = Array.from({ length: 14 }, (_, i) => {
  const wave = Math.sin(i / 2.6) * 0.12;
  return {
    day: `${i + 1}`,
    users: Math.round(150_000 * (1 + i * 0.019) * (1 + wave)),
    posts: Math.round(9_800 * (1 + i * 0.024) * (1 + wave * 1.6)),
    reports: Math.round(64 * (1 - i * 0.031) * (1 + wave * 0.8)),
  };
});

export type ReportReason =
  | "Harassment"
  | "Spam"
  | "Nudity"
  | "Misinformation"
  | "Copyright"
  | "Violence";
export type ReportStatus = "pending" | "escalated" | "resolved" | "dismissed";

export interface ModerationReport {
  id: string;
  reason: ReportReason;
  status: ReportStatus;
  severity: "low" | "medium" | "high";
  reporter: User;
  target: User;
  excerpt: string;
  image?: string | undefined;
  reports: number;
  time: string;
}

export const moderationQueue: ModerationReport[] = [
  {
    id: "r1",
    reason: "Harassment",
    status: "pending",
    severity: "high",
    reporter: U(1),
    target: U(5),
    excerpt: "Repeated targeted replies on a creator's reel comment thread.",
    image: posts[0]?.image,
    reports: 24,
    time: "6m",
  },
  {
    id: "r2",
    reason: "Spam",
    status: "pending",
    severity: "medium",
    reporter: U(3),
    target: U(6),
    excerpt: "Bulk identical DM invites to an external betting link.",
    reports: 11,
    time: "22m",
  },
  {
    id: "r3",
    reason: "Copyright",
    status: "escalated",
    severity: "high",
    reporter: U(0),
    target: U(2),
    excerpt: "Reel audio flagged by rights holder for a licensed track.",
    image: posts[3]?.image,
    reports: 4,
    time: "1h",
  },
  {
    id: "r4",
    reason: "Misinformation",
    status: "pending",
    severity: "medium",
    reporter: U(4),
    target: U(1),
    excerpt: "Health claim post lacking sources, shared 1.2K times.",
    reports: 31,
    time: "2h",
  },
  {
    id: "r5",
    reason: "Nudity",
    status: "pending",
    severity: "low",
    reporter: U(6),
    target: U(3),
    excerpt: "Auto-classifier flagged a fashion shoot; likely false positive.",
    image: posts[2]?.image,
    reports: 2,
    time: "3h",
  },
  {
    id: "r6",
    reason: "Violence",
    status: "resolved",
    severity: "high",
    reporter: U(2),
    target: U(4),
    excerpt: "Graphic footage removed, strike issued to the account.",
    reports: 58,
    time: "5h",
  },
];

export type AccountState = "active" | "limited" | "suspended" | "review";

export interface AdminUserRow {
  user: User;
  state: AccountState;
  role: "member" | "creator" | "moderator" | "admin";
  joined: string;
  strikes: number;
  reports: number;
}

export const adminUsers: AdminUserRow[] = [
  { user: U(0), state: "active", role: "creator", joined: "Mar 2024", strikes: 0, reports: 1 },
  { user: U(1), state: "review", role: "member", joined: "Jan 2025", strikes: 1, reports: 6 },
  { user: U(2), state: "active", role: "moderator", joined: "Aug 2023", strikes: 0, reports: 0 },
  { user: U(3), state: "limited", role: "creator", joined: "Nov 2024", strikes: 2, reports: 9 },
  { user: U(4), state: "active", role: "creator", joined: "Feb 2023", strikes: 0, reports: 3 },
  { user: U(5), state: "suspended", role: "member", joined: "Jun 2025", strikes: 3, reports: 24 },
  { user: U(6), state: "active", role: "member", joined: "Apr 2026", strikes: 0, reports: 0 },
];

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export const auditLog: AuditEntry[] = [
  { id: "a1", actor: "chantalu", action: "Removed post", target: "@kevhab", time: "4m ago" },
  { id: "a2", actor: "system", action: "Auto-hid 14 comments", target: "spam cluster", time: "26m ago" },
  { id: "a3", actor: "admin", action: "Verified account", target: "@aline", time: "1h ago" },
  { id: "a4", actor: "chantalu", action: "Issued strike", target: "@ericnd", time: "3h ago" },
  { id: "a5", actor: "admin", action: "Approved payout", target: "RWF 640,000", time: "5h ago" },
  { id: "a6", actor: "system", action: "Blocked link domain", target: "bet-fast.link", time: "8h ago" },
];

export const moderationRules = [
  { id: "m1", name: "Auto-hide flagged comments", desc: "Hide comments once 5 unique reports land.", on: true },
  { id: "m2", name: "Nudity classifier", desc: "Route flagged media to human review first.", on: true },
  { id: "m3", name: "New-account link limits", desc: "Block outbound links for the first 7 days.", on: true },
  { id: "m4", name: "Shadow-ban repeat spammers", desc: "Reduce reach after two confirmed strikes.", on: false },
  { id: "m5", name: "Live stream keyword alerts", desc: "Ping moderators on high-risk phrases.", on: true },
];
