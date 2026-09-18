/**
 * Domain types for Gihanga Updates (frontend-only, mock-data driven).
 */

export type MediaKind = "photo" | "video" | "reel" | "text";

/**
 * Structural subset satisfied by EVERY user-shaped object in the app — the
 * domain User, the API's UserProfile and PublicUser. Display components
 * (GAvatar/UserName/…) accept this so callers can pass any of the three
 * without adapter boilerplate.
 */
export interface DisplayUser {
  id?: string;
  name: string;
  bio?: string;
  creator?: boolean;
  live?: boolean;
  followers?: number;
  following?: number;
  posts?: number;
  username: string;
  avatarHue: number;
  avatarUrl?: string | null;
  verified?: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatarHue: number;
  avatarUrl?: string | null;
  verified: boolean;
  creator: boolean;
  live?: boolean;
  followers: number;
  following: number;
  posts: number;
}

export interface Story {
  id: string;
  user: User;
  seen: boolean;
  live?: boolean;
  items: number;
}

export interface Comment {
  id: string;
  user: User;
  body: string;
  time: string;
  likes: number;
}

export interface Post {
  id: string;
  author: User;
  kind: MediaKind;
  body: string;
  image?: string;
  duration?: string;
  location?: string;
  time: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  liked: boolean;
  saved: boolean;
  tags: string[];
  topComments: Comment[];
}

export interface Hashtag {
  tag: string;
  posts: number;
  trend: number;
  category: string;
}
