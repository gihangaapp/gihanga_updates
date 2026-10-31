import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Filter,
  Image as ImageIcon,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api, mediaUrl } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";
import { formatCount, timeAgo } from "@/lib/format";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminStatCard,
  AdminBadge,
  AdminSearchInput,
  AdminEmptyState,
  AdminErrorState,
  AdminSkeletonRows,
  AdminSegmented,
  AdminAvatar,
} from "@/components/system/AdminUI";

export const Route = createFileRoute("/system/dashboard/content")({
  component: ContentManagementPage,
});

type ContentStatus = "published" | "scheduled" | "draft" | "processing" | "rejected" | "removed";
type ContentKind = "photo" | "video" | "reel" | "text";

interface StaffContentItem {
  _id: string;
  author?: { name: string; username: string; avatarUrl?: string; avatarHue?: number } | null;
  kind: ContentKind;
  body: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  status: ContentStatus;
  audience: "public" | "followers" | "private";
  tags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  createdAt: string;
  removedAt?: string;
  removedReason?: string;
  removedPreviousStatus?: string;
}

interface ContentResponse {
  posts: StaffContentItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  statusCounts: Record<string, number>;
}

const statusTone: Record<ContentStatus, "success" | "info" | "muted" | "warning" | "danger"> = {
  published: "success",
  scheduled: "info",
  draft: "muted",
  processing: "warning",
  rejected: "danger",
  removed: "danger",
};

function ContentManagementPage() {
  const { staffUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | ContentStatus>("all");
  const [kind, setKind] = useState<"all" | ContentKind>("all");
  const [page, setPage] = useState(1);
  const [removalTarget, setRemovalTarget] = useState<StaffContentItem | null>(null);
  const [reason, setReason] = useState("");

  const canView = hasPermission(staffUser, "content.view");
  const canRemove = hasPermission(staffUser, "content.remove");
  const canRestore = hasPermission(staffUser, "content.restore");

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20", status, kind });
    if (search) params.set("q", search);
    return params.toString();
  }, [page, status, kind, search]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["staff", "content", page, status, kind, search],
    queryFn: () => api.get<ContentResponse>(`/system/content?${queryString}`, true),
    enabled: canView,
    placeholderData: (previous) => previous,
  });

  const removeMutation = useMutation({
    mutationFn: (input: { id: string; reason: string }) =>
      api.post(`/system/content/${input.id}/remove`, { reason: input.reason }, true),
    onSuccess: async () => {
      toast.success("Content removed", { description: "The post is hidden from public feeds and its record is preserved." });
      setRemovalTarget(null);
      setReason("");
      await queryClient.invalidateQueries({ queryKey: ["staff", "content"] });
      await queryClient.invalidateQueries({ queryKey: ["staff", "overview"] });
    },
    onError: (err: Error) => toast.error(err.message || "Unable to remove content"),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.post(`/system/content/${id}/restore`, undefined, true),
    onSuccess: async () => {
      toast.success("Content restored", { description: "The previous content status has been restored." });
      await queryClient.invalidateQueries({ queryKey: ["staff", "content"] });
      await queryClient.invalidateQueries({ queryKey: ["staff", "overview"] });
    },
    onError: (err: Error) => toast.error(err.message || "Unable to restore content"),
  });

  const counts = data?.statusCounts ?? {};
  const posts = data?.posts ?? [];
  const statusOptions = [
    { id: "all" as const, label: "All content", count: Object.values(counts).reduce((sum, value) => sum + value, 0) },
    { id: "published" as const, label: "Published", count: counts.published ?? 0 },
    { id: "scheduled" as const, label: "Scheduled", count: counts.scheduled ?? 0 },
    { id: "draft" as const, label: "Drafts", count: counts.draft ?? 0 },
    { id: "processing" as const, label: "Processing", count: counts.processing ?? 0 },
    { id: "rejected" as const, label: "Rejected", count: counts.rejected ?? 0 },
    { id: "removed" as const, label: "Removed", count: counts.removed ?? 0 },
  ];

  if (!canView) {
    return (
      <div className="space-y-5">
        <AdminPageHeader icon={Archive} title="Content Management" description="Search and manage platform posts." accent="primary" />
        <AdminEmptyState icon={ShieldCheck} title="Permission required" description="The Content Management Center is available to Admins and Super Admins." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Archive}
        title="Content Management"
        description="Search platform posts, inspect engagement, remove policy-violating content and restore decisions when appropriate."
        accent="aqua"
        action={
          <Button variant="outline" className="border-border" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <AdminStatCard icon={FileText} label="All posts" value={formatCount(statusOptions[0].count ?? 0)} tone="primary" />
        <AdminStatCard icon={CheckCircle2} label="Published" value={formatCount(counts.published ?? 0)} tone="success" />
        <AdminStatCard icon={RefreshCw} label="Processing" value={formatCount(counts.processing ?? 0)} tone="warning" />
        <AdminStatCard icon={ShieldCheck} label="Rejected" value={formatCount(counts.rejected ?? 0)} tone="danger" />
        <AdminStatCard icon={Trash2} label="Removed" value={formatCount(counts.removed ?? 0)} tone="muted" />
      </div>

      <AdminCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <AdminSearchInput
            value={searchInput}
            onChange={(value) => setSearchInput(value)}
            placeholder="Search captions, hashtags or creator…"
            className="w-full xl:max-w-md"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 text-xs text-muted-foreground">
              <Filter className="size-3.5" />
              <select value={kind} onChange={(event) => { setKind(event.target.value as "all" | ContentKind); setPage(1); }} className="bg-transparent text-foreground outline-none">
                <option value="all">All types</option>
                <option value="photo">Photos</option>
                <option value="video">Videos</option>
                <option value="reel">Reels</option>
                <option value="text">Text</option>
              </select>
            </label>
            <Button
              variant="brand"
              className="h-10"
              onClick={() => { setSearch(searchInput.trim()); setPage(1); }}
            >
              <Search className="size-4" /> Search
            </Button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <AdminSegmented
            size="sm"
            options={statusOptions}
            value={status}
            onChange={(next) => { setStatus(next); setPage(1); }}
          />
        </div>
      </AdminCard>

      {isLoading && <AdminSkeletonRows rows={5} />}
      {isError && <AdminErrorState message={error instanceof Error ? error.message : "Unable to load content"} onRetry={() => refetch()} />}

      {!isLoading && !isError && posts.length === 0 && (
        <AdminEmptyState icon={Archive} title="No content found" description="Try another search term or adjust the content filters." />
      )}

      {!isLoading && !isError && posts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-semibold text-muted-foreground">
              {formatCount(data?.total ?? 0)} results · Page {data?.page ?? page}
            </p>
            {isFetching && <span className="text-[11px] font-medium text-primary">Updating…</span>}
          </div>
          <div className="grid gap-3">
            {posts.map((post, index) => {
              const preview = mediaUrl(post.thumbnailUrl || post.mediaUrl);
              const canTakeAction = post.status !== "removed" && canRemove;
              return (
                <motion.div key={post._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.2) }}>
                  <AdminCard className="overflow-hidden p-4 sm:p-5">
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-muted md:w-36">
                        {preview ? (
                          <img src={preview} alt="Content preview" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-muted-foreground">
                            {post.kind === "text" ? <FileText className="size-7" /> : post.kind === "video" || post.kind === "reel" ? <Video className="size-7" /> : <ImageIcon className="size-7" />}
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-bold capitalize text-white">{post.kind}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <AdminBadge tone={statusTone[post.status] ?? "muted"} dot>{post.status.replaceAll("_", " ")}</AdminBadge>
                          <AdminBadge tone="muted">{post.audience}</AdminBadge>
                          <span className="text-[11px] text-muted-foreground">{timeAgo(post.createdAt)} ago</span>
                        </div>
                        <p className="mt-2 line-clamp-2 whitespace-pre-wrap break-words text-sm font-semibold text-foreground">{post.body || "No caption provided"}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <AdminAvatar name={post.author?.name || "Unknown creator"} hue={post.author?.avatarHue ?? 205} size="sm" />
                            {post.author?.name || "Unknown creator"} <span className="text-muted-foreground/70">@{post.author?.username || "unknown"}</span>
                          </span>
                          <span>♥ {formatCount(post.likesCount)}</span>
                          <span>Comments {formatCount(post.commentsCount)}</span>
                          <span>Views {formatCount(post.viewsCount)}</span>
                        </div>
                        {post.status === "removed" && post.removedReason && (
                          <p className="mt-3 rounded-lg border border-danger/15 bg-danger/5 px-3 py-2 text-[11px] text-danger">
                            Removal reason: {post.removedReason}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2 md:flex-col md:items-end md:justify-center">
                        {canTakeAction && (
                          <Button size="sm" variant="destructive" onClick={() => { setRemovalTarget(post); setReason(""); }}>
                            <Trash2 className="size-3.5" /> Remove
                          </Button>
                        )}
                        {post.status === "removed" && canRestore && (
                          <Button size="sm" variant="outline" className="border-success/30 text-success hover:bg-success/10" onClick={() => restoreMutation.mutate(post._id)} disabled={restoreMutation.isPending}>
                            <RotateCcw className="size-3.5" /> Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  </AdminCard>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
            <Button size="sm" variant="outline" disabled={page <= 1 || isFetching} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              <ArrowLeft className="size-3.5" /> Previous
            </Button>
            <span className="text-xs font-semibold text-muted-foreground">Page {data?.page ?? page}</span>
            <Button size="sm" variant="outline" disabled={!data?.hasMore || isFetching} onClick={() => setPage((value) => value + 1)}>
              Next <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={Boolean(removalTarget)} onOpenChange={(open) => { if (!open) { setRemovalTarget(null); setReason(""); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Remove this content?</DialogTitle>
            <DialogDescription>
              This post will be hidden from public feeds. Its record and previous status will be preserved so the decision can be audited and reversed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="line-clamp-2 text-sm font-medium text-foreground">{removalTarget?.body || "No caption provided"}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">By @{removalTarget?.author?.username || "unknown"}</p>
            </div>
            <label className="block text-xs font-semibold text-foreground" htmlFor="content-removal-reason">Reason for removal</label>
            <textarea
              id="content-removal-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Explain which community guideline this content violates…"
              className="w-full resize-y rounded-xl border border-border bg-elevated px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRemovalTarget(null); setReason(""); }} disabled={removeMutation.isPending}>Cancel</Button>
              <Button variant="destructive" disabled={!removalTarget || reason.trim().length < 3 || removeMutation.isPending} onClick={() => removalTarget && removeMutation.mutate({ id: removalTarget._id, reason: reason.trim() })}>
                {removeMutation.isPending ? "Removing…" : "Confirm removal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
