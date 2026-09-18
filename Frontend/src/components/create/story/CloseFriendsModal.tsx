import { useState, useEffect } from "react";
import { Star, Check, Search, X, Loader2 } from "lucide-react";
import { api, type PublicUser } from "@/lib/api-client";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CloseFriendsModalProps {
  onClose: () => void;
  onDone: (selectedUserIds: string[]) => void;
}

export function CloseFriendsModal({ onClose, onDone }: CloseFriendsModalProps) {
  const [followingUsers, setFollowingUsers] = useState<PublicUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isMounted = true;
    async function loadFollowing() {
      try {
        const res = await api.get<{ users: PublicUser[] }>("/social/following");
        if (isMounted) {
          setFollowingUsers(res?.users ?? []);
        }
      } catch {
        if (isMounted) setFollowingUsers([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadFollowing();
  }, []);

  const toggleSelect = (userId: string) => {
    const next = new Set(selectedIds);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedIds(next);
  };

  const filtered = followingUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = () => {
    onDone(Array.from(selectedIds));
    toast.success(`Close Friends list updated (${selectedIds.size} selected)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md select-none text-white">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-slate-900 p-5 shadow-2xl max-w-sm w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-emerald-500 text-slate-950 font-bold">
              <Star className="size-4 fill-slate-950" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold">Close Friends</h3>
              <p className="text-[11px] text-white/60">Choose followers to share private stories</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/60 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people you follow..."
            className="w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Following List */}
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto no-scrollbar">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-xs text-white/60 gap-2">
              <Loader2 className="size-4 animate-spin text-emerald-400" /> Loading people you
              follow…
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="py-8 text-center text-xs text-white/50">
              No people found in your following list.
            </p>
          )}

          {filtered.map((u) => {
            const selected = selectedIds.has(u._id);
            return (
              <button
                key={u._id}
                type="button"
                onClick={() => toggleSelect(u._id)}
                className={cn(
                  "flex items-center justify-between rounded-2xl p-2.5 transition-colors text-left",
                  selected ? "bg-emerald-500/20 border border-emerald-500/40" : "hover:bg-white/10",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GAvatar user={u} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold leading-tight">{u.name}</p>
                    <p className="truncate text-[10px] text-white/60">@{u.username}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "grid size-6 place-items-center rounded-full border transition-all",
                    selected
                      ? "border-emerald-500 bg-emerald-500 text-slate-950"
                      : "border-white/30",
                  )}
                >
                  {selected && <Check className="size-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <Button
          variant="brand"
          onClick={handleSave}
          className="w-full rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950"
        >
          Save Close Friends ({selectedIds.size})
        </Button>
      </div>
    </div>
  );
}
