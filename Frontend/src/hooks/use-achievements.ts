import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, BadgeState, BadgeProgress } from "@/lib/api-client";

/**
 * Achievement Badge System — data hooks.
 *
 * Three read paths:
 *   - useAchievementDefinitions()   → the static badge set (icon/color/threshold shape).
 *     Loaded once app-wide so the badge row can render its skeleton before
 *     per-user data arrives.
 *   - useUserBadges(username)       → public badge states for any profile.
 *   - useMyAchievementProgress()    → the authenticated user's detailed progress
 *     (current value, remaining, %). Only available when logged in.
 *
 * Plus a manual re-evaluate mutation the profile owner can trigger after
 * hitting a milestone, so the unlock celebration can fire immediately rather
 * than waiting for the next sweeper pass.
 */

export function useAchievementDefinitions() {
  return useQuery({
    queryKey: ["achievement-definitions"],
    queryFn: () => api.get<{ definitions: BadgeState[] }>("/achievements/definitions"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserBadges(username: string) {
  return useQuery({
    queryKey: ["achievements", username],
    queryFn: () => api.get<{ badges: BadgeState[] }>(`/achievements/${username}`),
    enabled: Boolean(username),
    staleTime: 60 * 1000,
    // Graceful degradation: if the achievement service is unavailable, the
    // profile still loads — the badge row just renders empty.
    retry: 1,
  });
}

export function useMyAchievementProgress(enabled = true) {
  return useQuery({
    queryKey: ["achievements", "me", "progress"],
    queryFn: () => api.get<{ progress: BadgeProgress[] }>("/achievements/me/progress"),
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useReevaluateMyAchievements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<{ newlyAwarded: BadgeState[]; revoked: string[] }>("/achievements/me/reevaluate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
