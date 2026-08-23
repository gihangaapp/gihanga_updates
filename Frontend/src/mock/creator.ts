import type { Post } from "@/types";
import { posts } from "./data";

export interface DayPoint {
  day: string;
  views: number;
  followers: number;
  earnings: number;
}

export const analytics30d: DayPoint[] = Array.from({ length: 30 }, (_, i) => {
  const wave = Math.sin(i / 3.2) * 0.22 + Math.sin(i / 7) * 0.14;
  const growth = 1 + i * 0.031;
  return {
    day: `${((i + 7) % 30) + 1}`,
    views: Math.round(28_000 * growth * (1 + wave)),
    followers: Math.round(240 * growth * (1 + wave * 1.4)),
    earnings: Math.round(9_800 * growth * (1 + wave * 0.8)),
  };
});

export const audienceByCity = [
  { name: "Kigali", value: 46 },
  { name: "Musanze", value: 17 },
  { name: "Huye", value: 12 },
  { name: "Rubavu", value: 11 },
  { name: "Diaspora", value: 14 },
];

export const audienceByAge = [
  { band: "13-17", share: 8 },
  { band: "18-24", share: 39 },
  { band: "25-34", share: 33 },
  { band: "35-44", share: 14 },
  { band: "45+", share: 6 },
];

export const trafficSources = [
  { source: "For you", share: 52 },
  { source: "Following", share: 21 },
  { source: "Explore", share: 15 },
  { source: "Search", share: 8 },
  { source: "External", share: 4 },
];

export interface StudioContentRow {
  post: Post;
  status: "published" | "scheduled" | "draft";
  views: number;
  engagement: number;
  earnings: number;
  date: string;
}

export const studioContent: StudioContentRow[] = [
  {
    post: posts[1] as Post,
    status: "published",
    views: 1_420_000,
    engagement: 12.4,
    earnings: 284_000,
    date: "Aug 4",
  },
  {
    post: posts[0] as Post,
    status: "published",
    views: 388_400,
    engagement: 9.1,
    earnings: 92_400,
    date: "Aug 4",
  },
  {
    post: posts[3] as Post,
    status: "published",
    views: 204_900,
    engagement: 7.8,
    earnings: 48_200,
    date: "Aug 2",
  },
  {
    post: posts[2] as Post,
    status: "scheduled",
    views: 0,
    engagement: 0,
    earnings: 0,
    date: "Aug 8, 18:00",
  },
  {
    post: posts[4] as Post,
    status: "draft",
    views: 0,
    engagement: 0,
    earnings: 0,
    date: "—",
  },
];

export interface Transaction {
  id: string;
  label: string;
  kind: "payout" | "earning" | "tip" | "fee";
  amount: number;
  date: string;
  status: "completed" | "pending";
}

export const walletBalance = { available: 1_284_500, pending: 316_200, lifetime: 9_842_000 };

export const transactions: Transaction[] = [
  {
    id: "t1",
    label: "Reel bonus — August cycle",
    kind: "earning",
    amount: 284_000,
    date: "Aug 4",
    status: "completed",
  },
  {
    id: "t2",
    label: "Tips from 128 viewers",
    kind: "tip",
    amount: 96_400,
    date: "Aug 3",
    status: "completed",
  },
  {
    id: "t3",
    label: "Payout to MoMo •••• 4821",
    kind: "payout",
    amount: -750_000,
    date: "Aug 1",
    status: "completed",
  },
  {
    id: "t4",
    label: "Brand campaign — Inzozi Coffee",
    kind: "earning",
    amount: 420_000,
    date: "Jul 29",
    status: "pending",
  },
  {
    id: "t5",
    label: "Platform fee (8%)",
    kind: "fee",
    amount: -33_600,
    date: "Jul 29",
    status: "completed",
  },
  {
    id: "t6",
    label: "Live gifts — Studio rehearsal",
    kind: "tip",
    amount: 61_800,
    date: "Jul 27",
    status: "completed",
  },
];

export const revenueSplit = [
  { name: "Reel bonus", value: 44 },
  { name: "Brand deals", value: 28 },
  { name: "Tips & gifts", value: 19 },
  { name: "Subscriptions", value: 9 },
];

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: "active" | "paused" | "review";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
}

export const campaigns: Campaign[] = [
  {
    id: "c1",
    name: "Golden Hour print drop",
    objective: "Conversions",
    status: "active",
    budget: 240_000,
    spent: 148_900,
    impressions: 412_000,
    clicks: 9_840,
  },
  {
    id: "c2",
    name: "Reel series — Kigali Nights",
    objective: "Video views",
    status: "active",
    budget: 180_000,
    spent: 61_200,
    impressions: 288_400,
    clicks: 4_120,
  },
  {
    id: "c3",
    name: "Creator workshop signups",
    objective: "Leads",
    status: "paused",
    budget: 90_000,
    spent: 88_600,
    impressions: 121_000,
    clicks: 2_940,
  },
];

export const rwf = (n: number) =>
  `${n < 0 ? "-" : ""}${Math.abs(n).toLocaleString("en-US")} RWF`;
