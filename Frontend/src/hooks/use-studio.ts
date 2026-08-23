import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface StudioAnalytics {
  totals: { posts: number; followers: number; totalViews: number; totalLikes: number; newFollowers30d: number };
  dailyStats: { date: string; views: number; likes: number; comments: number; followers: number; earnings: number }[];
  topContent: {
    _id: string;
    kind: string;
    body: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    createdAt: string;
  }[];
  revenueSplit: { label: string; value: number }[];
  adSpend30d: number;
  note: string;
}

export function useStudioAnalytics() {
  return useQuery({
    queryKey: ["studio", "analytics"],
    queryFn: () => api.get<StudioAnalytics>("/studio/analytics"),
  });
}
