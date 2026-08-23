/**
 * Domain types for Gihanga Updates (frontend-only, mock-data driven).
 */

export type MediaKind = "photo" | "video" | "reel" | "text";

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
