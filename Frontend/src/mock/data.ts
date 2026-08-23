import type { Hashtag, Post, Story, User } from "@/types";
import postHills from "@/assets/post-hills.jpg";
import postMarket from "@/assets/post-market.jpg";
import postDesk from "@/assets/post-desk.jpg";
import postDance from "@/assets/post-dance.jpg";

const mkUser = (
  id: string,
  name: string,
  username: string,
  bio: string,
  avatarHue: number,
  opts: Partial<User> = {},
): User => ({
  id,
  name,
  username,
  bio,
  avatarHue,
  verified: false,
  creator: false,
  followers: 0,
  following: 0,
  posts: 0,
  ...opts,
});

export const currentUser = mkUser(
  "u0",
  "Aline Mugisha",
  "aline",
  "Storyteller from Kigali. Building things that matter.",
  205,
  { verified: true, creator: true, followers: 48200, following: 312, posts: 284 },
);

export const users: User[] = [
  mkUser("u1", "Eric Ndayishimiye", "ericnd", "Documentary filmmaker. Hills & humans.", 235, {
    verified: true,
    creator: true,
    followers: 182400,
    following: 421,
    posts: 613,
    live: true,
  }),
  mkUser("u2", "Chantal Uwase", "chantalu", "Food, markets, and late-night city walks.", 186, {
    verified: true,
    creator: true,
    followers: 94100,
    following: 208,
    posts: 391,
  }),
  mkUser("u3", "Gihanga Newsroom", "gihanganews", "Official updates from the Gihanga desk.", 250, {
    verified: true,
    creator: true,
    followers: 1240000,
    following: 12,
    posts: 8420,
  }),
  mkUser("u4", "Kevin Habimana", "kevhab", "Creator economy nerd. I make dashboards pretty.", 212, {
    creator: true,
    followers: 22800,
    following: 640,
    posts: 158,
  }),
  mkUser("u5", "Diane Iradukunda", "dianei", "Dancer. Choreographer. Neon addict.", 168, {
    verified: true,
    creator: true,
    followers: 512000,
    following: 190,
    posts: 742,
    live: true,
  }),
  mkUser("u6", "Patrick Rugema", "prugema", "Football takes and weekend highlights.", 262, {
    followers: 8300,
    following: 1204,
    posts: 96,
  }),
  mkUser("u7", "Solange K.", "solange", "Product designer. Coffee dependent.", 196, {
    creator: true,
    followers: 41200,
    following: 388,
    posts: 233,
  }),
];

const U = (i: number): User => users[i] as User;

export const byUsername = (u: string) => users.find((x) => x.username === u) ?? U(0);

export const stories: Story[] = [
  { id: "s0", user: currentUser, seen: false, items: 0 },
  { id: "s1", user: U(0), seen: false, live: true, items: 4 },
  { id: "s2", user: U(4), seen: false, live: true, items: 7 },
  { id: "s3", user: U(1), seen: false, items: 3 },
  { id: "s4", user: U(3), seen: false, items: 2 },
  { id: "s5", user: U(6), seen: true, items: 5 },
  { id: "s6", user: U(2), seen: true, items: 9 },
  { id: "s7", user: U(5), seen: true, items: 1 },
];

const c = (id: string, user: User, body: string, time: string, likes: number) => ({
  id,
  user,
  body,
  time,
  likes,
});

export const posts: Post[] = [
  {
    id: "p1",
    author: U(0),
    kind: "photo",
    body: "Six hours of climbing for ninety seconds of light. The northern terraces never miss.",
    image: postHills,
    location: "Nyabihu, Rwanda",
    time: "24m",
    likes: 12840,
    comments: 412,
    shares: 168,
    liked: false,
    saved: false,
    tags: ["golderhour", "rwanda", "landscape"],
    topComments: [
      c("c1", U(1), "This is unreal. What lens?", "18m", 42),
      c("c2", U(6), "Saving this for my wallpaper, sorry not sorry.", "11m", 9),
    ],
  },
  {
    id: "p2",
    author: U(4),
    kind: "reel",
    body: "New piece. Three takes, no cuts, one very patient lighting tech.",
    image: postDance,
    duration: "0:42",
    time: "1h",
    likes: 98200,
    comments: 3140,
    shares: 7820,
    views: 1420000,
    liked: true,
    saved: false,
    tags: ["dance", "reels", "neon"],
    topComments: [c("c3", U(3), "The control on that last turn 🔥", "44m", 310)],
  },
  {
    id: "p3",
    author: U(2),
    kind: "text",
    body: "Gihanga Updates now supports scheduled posts, draft collaboration, and creator payouts in local currency. Rolling out to everyone this week.",
    time: "2h",
    likes: 6420,
    comments: 890,
    shares: 1240,
    liked: false,
    saved: true,
    tags: ["announcement", "creators"],
    topComments: [c("c4", U(3), "Payouts in RWF is the headline here.", "1h", 188)],
  },
  {
    id: "p4",
    author: U(1),
    kind: "photo",
    body: "Kimironko after 7pm is its own genre of cinema.",
    image: postMarket,
    location: "Kimironko Market",
    time: "4h",
    likes: 21400,
    comments: 604,
    shares: 312,
    liked: false,
    saved: false,
    tags: ["streetphotography", "kigali", "night"],
    topComments: [
      c("c5", U(0), "The color grade on this is criminal.", "3h", 64),
      c("c6", U(5), "Which stall has the best brochettes?", "2h", 21),
    ],
  },
  {
    id: "p5",
    author: U(6),
    kind: "photo",
    body: "Reworked my whole editing setup for vertical-first. Cut my turnaround in half.",
    image: postDesk,
    time: "6h",
    likes: 3820,
    comments: 142,
    shares: 88,
    liked: false,
    saved: false,
    tags: ["setup", "workflow", "creators"],
    topComments: [c("c7", U(3), "Full gear list please 🙏", "5h", 31)],
  },
];

export const trendingTags: Hashtag[] = [
  { tag: "GihangaLive", posts: 184200, trend: 128, category: "Trending in Rwanda" },
  { tag: "GoldenHour", posts: 92400, trend: 44, category: "Photography" },
  { tag: "AmapianoFriday", posts: 61800, trend: 31, category: "Music" },
  { tag: "CreatorPayouts", posts: 28400, trend: 96, category: "Business" },
  { tag: "KigaliEats", posts: 19200, trend: 12, category: "Food" },
];

export const suggestedCreators: User[] = [U(4), U(2), U(6), U(3)];

export const navCounts = { notifications: 12, messages: 4 };

export const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return `${n}`;
};
