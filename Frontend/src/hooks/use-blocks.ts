import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export function useBlockedSet() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["blocked-set"],
    queryFn: () => api.get<{ usernames: string[] }>("/blocks/mine"),
    enabled: Boolean(user),
    select: (data) => new Set(data.usernames),
    staleTime: 30_000,
  });
}

export function useToggleBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, block }: { username: string; block: boolean }) =>
      api.post<{ blocked: boolean }>(`/blocks/${username}`),
    onMutate: async ({ username, block }) => {
      queryClient.setQueryData<{ usernames: string[] }>(["blocked-set"], (prev) => {
        const set = new Set(prev?.usernames ?? []);
        if (block) set.add(username);
        else set.delete(username);
        return { usernames: Array.from(set) };
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-set"] });
      queryClient.invalidateQueries({ queryKey: ["following-set"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
