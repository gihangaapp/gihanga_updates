import type { Post, User } from "@/types";
import { currentUser, posts, users } from "./data";

const U = (i: number) => users[i] as User;

export type NotificationKind = "like" | "comment" | "follow" | "mention" | "live" | "system";

export interface Notification {
  id: string;
  kind: NotificationKind;
  user?: User;
  text: string;
  time: string;
  unread: boolean;
  postImage?: string;
}

export const notifications: Notification[] = [
  {
    id: "n1",
    kind: "like",
    user: U(4),
    text: "and 2,410 others liked your photo",
    time: "2m",
    unread: true,
    postImage: posts[0]?.image as string,
  },
  {
    id: "n2",
    kind: "comment",
    user: U(0),
    text: "commented: “The color grade on this is criminal.”",
    time: "18m",
    unread: true,
    postImage: posts[3]?.image as string,
  },
  { id: "n3", kind: "follow", user: U(6), text: "started following you", time: "44m", unread: true },
  {
    id: "n4",
    kind: "live",
    user: U(4),
    text: "is live: “Studio rehearsal, take three”",
    time: "1h",
    unread: true,
  },
  {
    id: "n5",
    kind: "mention",
    user: U(2),
    text: "mentioned you in a post about creator payouts",
    time: "3h",
    unread: false,
  },
  {
    id: "n6",
    kind: "system",
    text: "Your account is now eligible for local-currency payouts.",
    time: "5h",
    unread: false,
  },
  {
    id: "n7",
    kind: "like",
    user: U(1),
    text: "and 840 others liked your reel",
    time: "8h",
    unread: false,
    postImage: posts[1]?.image as string,
  },
  { id: "n8", kind: "follow", user: U(5), text: "started following you", time: "1d", unread: false },
];

export interface Message {
  id: string;
  fromMe: boolean;
  body: string;
  time: string;
}

export interface Conversation {
  id: string;
  user: User;
  messages: Message[];
  unread: number;
  online?: boolean;
}

export const conversations: Conversation[] = [
  {
    id: "t1",
    user: U(0),
    unread: 2,
    online: true,
    messages: [
      { id: "m1", fromMe: false, body: "Are we still shooting the terraces at 5?", time: "09:12" },
      { id: "m2", fromMe: true, body: "Yes — golden hour hits around 17:40.", time: "09:14" },
      { id: "m3", fromMe: false, body: "Perfect. Bringing the 85mm and the ND kit.", time: "09:15" },
      { id: "m4", fromMe: false, body: "Also, did you see the payout update? 👀", time: "09:16" },
    ],
  },
  {
    id: "t2",
    user: U(4),
    unread: 0,
    online: true,
    messages: [
      { id: "m5", fromMe: false, body: "Rehearsal clip is up, tell me it slaps.", time: "Yest" },
      { id: "m6", fromMe: true, body: "It slaps. That last turn is unreal.", time: "Yest" },
    ],
  },
  {
    id: "t3",
    user: U(2),
    unread: 1,
    messages: [
      {
        id: "m7",
        fromMe: false,
        body: "Newsroom wants a feature on your setup — interested?",
        time: "Mon",
      },
    ],
  },
  {
    id: "t4",
    user: U(6),
    unread: 0,
    messages: [
      { id: "m8", fromMe: true, body: "Brochettes after the match?", time: "Sun" },
      { id: "m9", fromMe: false, body: "Always. Kimironko, 8pm.", time: "Sun" },
    ],
  },
  {
    id: "t5",
    user: U(1),
    unread: 0,
    messages: [{ id: "m10", fromMe: false, body: "Sent you the market contact sheet.", time: "Sat" }],
  },
];

export interface Reel {
  id: string;
  author: User;
  body: string;
  image: string;
  audio: string;
  duration: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  tags: string[];
}

const media = posts.filter((p) => p.image).map((p) => p.image as string);

export const reels: Reel[] = [
  {
    id: "r1",
    author: U(4),
    body: "Three takes, no cuts, one very patient lighting tech.",
    image: media[3] ?? (media[0] as string),
    audio: "Amapiano Friday — Nyota",
    duration: "0:42",
    likes: 98200,
    comments: 3140,
    shares: 7820,
    views: 1420000,
    tags: ["dance", "neon"],
  },
  {
    id: "r2",
    author: U(0),
    body: "Six hours up, ninety seconds of light.",
    image: media[0] as string,
    audio: "Original audio — aline",
    duration: "0:28",
    likes: 41200,
    comments: 812,
    shares: 1960,
    views: 604000,
    tags: ["goldenhour", "rwanda"],
  },
  {
    id: "r3",
    author: U(1),
    body: "Kimironko after 7pm is its own genre of cinema.",
    image: media[1] as string,
    audio: "City Nights — Ishimwe",
    duration: "1:04",
    likes: 28400,
    comments: 604,
    shares: 940,
    views: 388000,
    tags: ["kigali", "night"],
  },
  {
    id: "r4",
    author: U(6),
    body: "Vertical-first edit workflow in 60 seconds.",
    image: media[2] as string,
    audio: "Lo-fi Desk — Loop 4",
    duration: "0:58",
    likes: 9120,
    comments: 240,
    shares: 410,
    views: 121000,
    tags: ["workflow", "creators"],
  },
];

export const savedPosts: Post[] = [posts[2], posts[0], posts[3]].filter(Boolean) as Post[];

export const exploreGrid = posts.filter((p) => p.image);

export const settingsUser = currentUser;
