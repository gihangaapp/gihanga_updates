import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Gift, Plus, Radio, ShieldAlert, StopCircle, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { getStaffSocket } from "@/lib/socket-client";
import { StaffPageHeader, StaffCard, StaffEmptyState, StaffErrorState, StaffSkeletonRows } from "@/components/staff/StaffUI";
import {
  useStaffLiveStreams,
  useForceEndLive,
  useLiveAlerts,
  useLiveKeywords,
  useSaveLiveKeywords,
} from "@/hooks/use-live";

export const Route = createFileRoute("/system/dashboard/live")({
  component: LiveOversightPage,
});

function ForceEndButton({ id, username }: { id: string; username: string }) {
  const forceEnd = useForceEndLive();
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button size="sm" variant="destructive" onClick={() => setOpen(true)}>
        <StopCircle className="mr-1 size-3.5" />
        Force-End
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason…"
        className="h-8 w-32 rounded-lg border border-border bg-elevated px-2 text-xs text-foreground outline-none"
      />
      <Button
        size="sm"
        variant="destructive"
        disabled={!reason.trim() || forceEnd.isPending}
        onClick={() =>
          forceEnd.mutate(
            { id, reason: reason.trim() },
            {
              onSuccess: () => toast.error(`Live stream for @${username} was force-ended.`),
              onError: (err: any) => toast.error(err.message || "Couldn't force-end this stream"),
            },
          )
        }
      >
        Confirm
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}

function KeywordManager() {
  const { data } = useLiveKeywords();
  const saveKeywords = useSaveLiveKeywords();
  const [draft, setDraft] = useState("");
  const keywords = data?.keywords ?? [];

  function add() {
    const clean = draft.trim().toLowerCase();
    if (!clean || keywords.includes(clean)) return;
    saveKeywords.mutate([...keywords, clean]);
    setDraft("");
  }

  return (
    <StaffCard className="p-5">
      <h2 className="font-display text-base font-bold text-foreground">Live chat keyword alerts</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Messages containing any of these words are flagged and pushed to moderators in real time.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-foreground"
          >
            {kw}
            <button
              type="button"
              aria-label={`Remove ${kw}`}
              onClick={() => saveKeywords.mutate(keywords.filter((k) => k !== kw))}
              className="text-muted-foreground hover:text-danger"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {!keywords.length && <p className="text-xs text-muted-foreground">No keywords configured yet.</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a keyword…"
          className="h-9 flex-1 rounded-lg border border-border bg-elevated px-3 text-sm text-foreground outline-none"
        />
        <Button size="sm" variant="outline" onClick={add}>
          <Plus className="size-3.5" /> Add
        </Button>
      </div>
    </StaffCard>
  );
}

function LiveOversightPage() {
  const { staffUser } = useAuth();
  const { data, isLoading, isError, error, refetch } = useStaffLiveStreams();
  const { data: alertsData } = useLiveAlerts();
  const [liveViewerCounts, setLiveViewerCounts] = useState<Record<string, number>>({});
  const streams = data?.streams ?? [];
  const alerts = alertsData?.alerts ?? [];

  useEffect(() => {
    if (!staffUser) return;
    const socket = getStaffSocket();
    if (!socket) return;

    const onAlert = (alert: any) => {
      toast.warning(`Flagged message from @${alert.sender?.username}`, { description: alert.body });
    };
    const onViewerCount = (payload: { streamId: string; viewerCount: number }) => {
      setLiveViewerCounts((prev) => ({ ...prev, [payload.streamId]: payload.viewerCount }));
    };
    socket.on("moderation:live-alert", onAlert);
    socket.on("live:viewer-count", onViewerCount);
    return () => {
      socket.off("moderation:live-alert", onAlert);
      socket.off("live:viewer-count", onViewerCount);
    };
  }, [staffUser]);

  return (
    <div className="space-y-6">
      <StaffPageHeader
        icon={Radio}
        title="Live Stream Oversight"
        description="Monitor active live broadcasts and enforce safety guardrails in real time."
        accent="danger"
      />

      {isError && <StaffErrorState message={(error as any)?.message || "Couldn't load live streams."} onRetry={() => refetch()} />}

      {isLoading && !isError && <StaffSkeletonRows rows={3} />}

      {!isLoading && !isError && (
        <div className="grid gap-4 sm:grid-cols-2">
          {streams.map((s, i) => {
            const liveCount = liveViewerCounts[s._id] ?? s.viewerCount;
            return (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <StaffCard className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-2.5 py-1 text-xs font-bold text-danger">
                      <Radio className="size-3.5 animate-pulse" /> LIVE
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Users className="size-3.5" /> {formatCount(liveCount)} watching
                    </span>
                  </div>

                  <div>
                    <p className="font-display text-base font-bold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Host: <strong className="text-foreground">@{s.host.username}</strong> ({s.host.name})
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Gift className="size-3.5 text-warning" />
                      <strong className="text-warning">{formatCount(s.totalGifts)} pts</strong> in gifts
                    </span>
                    <ForceEndButton id={s._id} username={s.host.username} />
                  </div>
                </StaffCard>
              </motion.div>
            );
          })}

          {!streams.length && (
            <div className="sm:col-span-2">
              <StaffEmptyState icon={Radio} title="No live streams right now" description="Active broadcasts will show up here in real time." />
            </div>
          )}
        </div>
      )}

      {alerts.length > 0 && (
        <StaffCard className="border-warning/30 bg-warning/5 p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-warning">
            <ShieldAlert className="size-4" /> Flagged chat messages
          </h2>
          <ul className="mt-3 space-y-2">
            {alerts.map((a: any) => (
              <li key={a._id} className="rounded-xl bg-card/80 p-3 text-sm">
                <span className="font-semibold text-foreground">@{a.sender?.username}</span>{" "}
                <span className="text-muted-foreground">in "{a.stream?.title}":</span>{" "}
                <span className="text-foreground/90">{a.body}</span>
              </li>
            ))}
          </ul>
        </StaffCard>
      )}

      <KeywordManager />
    </div>
  );
}
