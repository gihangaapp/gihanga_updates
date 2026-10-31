import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity, AlertTriangle, ArrowUpRight, Award, Bell, CheckCircle2, CircleHelp,
  ClipboardCheck, Eye, FileText, Flag, Gauge, HeartPulse, Megaphone, Radio,
  RefreshCw, Search, ShieldAlert, ShieldCheck, TrendingUp, UserRound,
  Users, Wallet, XCircle, Server, Hash, BookOpen, UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { getStaffSocket } from "@/lib/socket-client";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";
import { formatCount, timeAgo } from "@/lib/format";
import {
  AdminBadge, AdminCard, AdminCardHeader, AdminEmptyState, AdminErrorState,
  AdminPageHeader, AdminSkeletonRows, AdminStatCard,
} from "@/components/system/AdminUI";
import { AdminLineChart } from "@/components/system/AdminCharts";

type WorkspaceModule =
  | "operations" | "user-intelligence" | "creator-intelligence" | "creators"
  | "announcements" | "security" | "system-control" | "support" | "verification"
  | "approvals" | "post-review" | "comment-review" | "story-review" | "appeals"
  | "user-investigations" | "enforcement" | "guidelines" | "my-performance" | "trending";

type WorkspaceAction =
  | { kind: "support"; id: string; body: Record<string, unknown> }
  | { kind: "verification"; id: string; body: Record<string, unknown> }
  | { kind: "moderation"; id: string; body: Record<string, unknown> }
  | { kind: "appeal"; id: string; body: Record<string, unknown> }
  | { kind: "creator-revoke"; id: string; body: Record<string, unknown> }
  | { kind: "announcement-create"; body: Record<string, unknown> }
  | { kind: "announcement-publish"; id: string; body?: Record<string, unknown> };

const pageConfig: Record<WorkspaceModule, { title: string; description: string; icon: LucideIcon; endpoint?: string; permission: string }> = {
  operations: { title: "Operations Overview", description: "A live operational view of Gihanga Updates, backed by real account, content, report, live and interaction records.", icon: Activity, permission: "operations.view" },
  "user-intelligence": { title: "User Intelligence", description: "Review account profiles, activity, content, reports and account history. Personal account details are restricted to Superadmin.", icon: UserRound, endpoint: "/system/workspace/users", permission: "users.intelligence.view" },
  "creator-intelligence": { title: "Creator Intelligence", description: "Monitor creator reach, publishing activity and audience growth using recorded creator-attributed interactions.", icon: Award, endpoint: "/system/workspace/creators?sort=views", permission: "creator.analytics.view" },
  creators: { title: "Creator Management", description: "Manage the creator directory and identify accounts that may need verification, support or review.", icon: Users, endpoint: "/system/workspace/creators?sort=newest", permission: "creators.view" },
  announcements: { title: "Notifications & Announcements", description: "Prepare platform announcements and, for Superadmin, publish them to active user accounts.", icon: Megaphone, endpoint: "/system/workspace/announcements", permission: "announcements.view" },
  security: { title: "Security & Risk Intelligence", description: "Review evidence-based risk signals, failed moderation jobs and unusual report patterns. Signals are not automatic findings.", icon: ShieldAlert, endpoint: "/system/workspace/risk", permission: "security.view" },
  "system-control": { title: "System Control Center", description: "Inspect current API, database, runtime and moderation-provider health. Secrets are never returned to this console.", icon: Server, endpoint: "/system/workspace/health", permission: "system.health.view" },
  support: { title: "Support Center", description: "Manage user-submitted support tickets, assign priorities, reply to users and track resolution.", icon: CircleHelp, endpoint: "/system/workspace/support", permission: "support.view" },
  verification: { title: "Verification Center", description: "Review pending account verification requests and record reasoned decisions.", icon: ShieldCheck, endpoint: "/system/workspace/verification", permission: "verification.view" },
  approvals: { title: "Approval & Escalation Center", description: "See the current approval workload across verification, appeals, moderation reports and support.", icon: ClipboardCheck, endpoint: "/system/workspace/approvals", permission: "approvals.view" },
  "post-review": { title: "Post Review", description: "Review posts and reels flagged by the moderation pipeline. Human decisions are recorded against the original content.", icon: FileText, endpoint: "/system/workspace/moderation-content?type=post&status=pending_review", permission: "moderation.content.view" },
  "comment-review": { title: "Comment Review", description: "Review comments held by content moderation and record approval, rejection or escalation decisions.", icon: Flag, endpoint: "/system/workspace/moderation-content?type=comment&status=pending_review", permission: "moderation.content.view" },
  "story-review": { title: "Story Review", description: "Inspect stories awaiting moderation and take an accountable review decision.", icon: Radio, endpoint: "/system/workspace/moderation-content?type=story&status=pending_review", permission: "moderation.content.view" },
  appeals: { title: "Appeals", description: "Review users' appeals against moderation decisions. Critical-protocol cases remain subject to the existing escalation safeguards.", icon: ClipboardCheck, endpoint: "/system/moderation/appeals?status=pending", permission: "moderation.appeals.view" },
  "user-investigations": { title: "User Investigations", description: "Review patterns of reports against accounts. Report volume is an investigation lead, not proof of misconduct.", icon: Users, endpoint: "/system/workspace/investigations", permission: "moderation.investigations.view" },
  enforcement: { title: "Enforcement History", description: "Trace moderation and account enforcement actions. Moderators see their own actions; Admin and Superadmin can see the team scope.", icon: ShieldAlert, endpoint: "/system/workspace/enforcement", permission: "moderation.enforcement.view" },
  guidelines: { title: "Moderation Guidelines", description: "A working reference for consistent, evidence-based decisions and safe escalation.", icon: BookOpen, permission: "moderation.rules.view" },
  "my-performance": { title: "My Performance", description: "Review your own moderation workload and recent decisions. Activity volume is not a substitute for decision quality.", icon: Gauge, endpoint: "/system/workspace/performance", permission: "moderation.stats.view" },
  trending: { title: "Trending & Discovery", description: "Monitor real hashtag records and content-topic momentum to support discovery decisions.", icon: Hash, endpoint: "/system/workspace/trending", permission: "trending.view" },
};

const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
const displayDate = (value?: string) => value ? timeAgo(value) : "—";
const nameOf = (value: any) => value?.name || value?.username || value?.title || value?.subject || value?.summary || value?.type || "Untitled record";
const subOf = (value: any) => value?.summary || value?.message || value?.body || value?.statement || value?.reason || value?.status || "No additional details";
const statusTone = (status: string): "success" | "danger" | "warning" | "info" | "muted" => {
  if (/approved|published|resolved|active|online|connected/i.test(status)) return "success";
  if (/rejected|failed|banned|suspended|critical|urgent/i.test(status)) return "danger";
  if (/pending|processing|in_progress|waiting|review|draft/i.test(status)) return "warning";
  if (/live|verified/i.test(status)) return "info";
  return "muted";
};

function RecordRow({ title, subtitle, status, date, meta, children }: { title: string; subtitle?: string; status?: string; date?: string; meta?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold text-foreground">{title}</p>
          {status && <AdminBadge tone={statusTone(status)}>{status.replaceAll("_", " ")}</AdminBadge>}
        </div>
        {subtitle && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>}
        {(date || meta) && <p className="mt-1.5 text-[11px] text-muted-foreground/70">{meta}{meta && date ? " · " : ""}{date}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

function SmallButton({ children, onClick, variant = "primary", disabled }: { children: React.ReactNode; onClick: () => void; variant?: "primary" | "danger" | "muted"; disabled?: boolean }) {
  const styles = variant === "danger" ? "border-danger/25 bg-danger/10 text-danger hover:bg-danger/15" : variant === "muted" ? "border-border bg-muted/50 text-muted-foreground hover:bg-muted" : "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15";
  return <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}>{children}</button>;
}

export function AdminWorkspacePage({ module }: { module: WorkspaceModule }) {
  const config = pageConfig[module];
  const { staffUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [days, setDays] = useState(30);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  useEffect(() => {
    const socket = getStaffSocket();
    if (!socket) return;
    const onActivity = () => {
      void queryClient.invalidateQueries({ queryKey: ["staff-workspace", "activity"] });
      void queryClient.invalidateQueries({ queryKey: ["staff-workspace", "overview"] });
    };
    socket.on("platform:activity", onActivity);
    return () => { socket.off("platform:activity", onActivity); };
  }, [queryClient]);

  const canRead = hasPermission(staffUser, config.permission as any);
  const endpoint = useMemo(() => {
    if (!config.endpoint) return "";
    if (module === "user-intelligence") return `${config.endpoint}?q=${encodeURIComponent(search)}&limit=30`;
    if (module === "creator-intelligence" || module === "creators") return `${config.endpoint}&q=${encodeURIComponent(search)}&limit=50`;
    if (module === "support") { const supportStatus = ["open","in_progress","waiting_user","resolved","closed"].includes(statusFilter) ? statusFilter : ""; return `${config.endpoint}?q=${encodeURIComponent(search)}${supportStatus ? `&status=${supportStatus}` : ""}`; }
    if (module === "verification") { const verificationStatus = ["pending","approved","rejected"].includes(statusFilter) ? statusFilter : "pending"; return `${config.endpoint}?status=${verificationStatus}`; }
    if (module === "post-review" || module === "comment-review" || module === "story-review") {
      const type = module === "post-review" ? "post" : module === "comment-review" ? "comment" : "story";
      return `/system/workspace/moderation-content?type=${type}&status=${statusFilter || "pending_review"}`;
    }
    if (module === "appeals") { const appealStatus = ["pending","approved","rejected"].includes(statusFilter) ? statusFilter : "pending"; return `/system/moderation/appeals?status=${appealStatus}`; }
    return config.endpoint;
  }, [config.endpoint, module, search, statusFilter]);

  const workspaceQuery = useQuery({
    queryKey: ["staff-workspace", module, endpoint],
    queryFn: () => api.get<any>(endpoint, true),
    enabled: canRead && Boolean(endpoint) && module !== "operations",
    staleTime: 10_000,
    refetchInterval: module === "support" || module === "announcements" ? 30_000 : 45_000,
  });
  const overviewQuery = useQuery({ queryKey: ["staff-workspace", "overview"], queryFn: () => api.get<any>("/system/workspace/overview", true), enabled: canRead && module === "operations", refetchInterval: 20_000 });
  const activityQuery = useQuery({ queryKey: ["staff-workspace", "activity"], queryFn: () => api.get<any>("/system/workspace/activity?limit=40", true), enabled: canRead && module === "operations", refetchInterval: 12_000 });
  const analyticsQuery = useQuery({ queryKey: ["staff-workspace", "analytics", days], queryFn: () => api.get<any>(`/system/workspace/analytics?days=${days}`, true), enabled: canRead && module === "operations" && hasPermission(staffUser, "operations.activity.view"), staleTime: 60_000 });
  const userDetailQuery = useQuery({ queryKey: ["staff-workspace", "user-detail", selectedUserId], queryFn: () => api.get<any>(`/system/workspace/users/${selectedUserId}`, true), enabled: canRead && module === "user-intelligence" && Boolean(selectedUserId) });

  const actionMutation = useMutation({
    mutationFn: async (action: WorkspaceAction) => {
      if (action.kind === "support") return api.patch(`/system/workspace/support/${action.id}`, action.body, true);
      if (action.kind === "creator-revoke") return api.post(`/system/users/${action.id}/remove-creator`, action.body, true);
      if (action.kind === "verification") return api.post(`/system/workspace/verification/${action.id}/decision`, action.body, true);
      if (action.kind === "moderation") return api.post(`/system/moderation/assessments/${action.id}/decision`, action.body, true);
      if (action.kind === "appeal") return api.post(`/system/moderation/appeals/${action.id}/decision`, action.body, true);
      if (action.kind === "announcement-create") return api.post("/system/workspace/announcements", action.body, true);
      return api.post(`/system/workspace/announcements/${action.id}/publish`, action.body || {}, true);
    },
    onSuccess: (_result, action) => {
      toast.success(action.kind === "announcement-publish" ? "Announcement published" : action.kind === "announcement-create" ? "Draft saved" : action.kind === "creator-revoke" ? "Creator status removed" : "Changes saved");
      void queryClient.invalidateQueries({ queryKey: ["staff-workspace"] });
      void queryClient.invalidateQueries({ queryKey: ["staff", "overview"] });
      void queryClient.invalidateQueries({ queryKey: ["staff", "accounts"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Action could not be completed"),
  });

  const title = module === "operations"
    ? staffUser?.role === "superadmin" ? "Command Center" : staffUser?.role === "moderator" ? "Moderation Overview" : "Operations Overview"
    : config.title;
  const response = workspaceQuery.data || {};
  const items: any[] = module === "user-intelligence" ? response.users || []
    : module === "creator-intelligence" || module === "creators" ? response.creators || []
    : module === "announcements" ? response.announcements || []
    : module === "support" ? response.tickets || []
    : module === "verification" ? response.requests || []
    : module === "post-review" || module === "comment-review" || module === "story-review" ? response.records || []
    : module === "appeals" ? response.appeals || []
    : module === "security" ? response.signals || []
    : module === "user-investigations" ? response.investigations || []
    : module === "enforcement" ? response.entries || []
    : module === "trending" ? response.tags || []
    : module === "my-performance" ? response.recent || []
    : [];

  const submit = (action: WorkspaceAction) => actionMutation.mutate(action);
  const setNote = (id: string, value: string) => setNotes((prev) => ({ ...prev, [id]: value }));
  const errorMessage = workspaceQuery.error instanceof Error ? workspaceQuery.error.message : "Unable to load this workspace";

  if (!canRead) {
    return <AdminEmptyState icon={ShieldAlert} title="Permission required" description="Your staff role does not have access to this management area. Contact Superadmin if you believe this is incorrect." />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader icon={config.icon} title={title} description={config.description} accent={module === "security" ? "warning" : module.includes("review") || module === "appeals" ? "success" : "primary"} action={<SmallButton variant="muted" onClick={() => { void workspaceQuery.refetch(); void overviewQuery.refetch(); void activityQuery.refetch(); void analyticsQuery.refetch(); }}><RefreshCw className="size-3.5"/> Refresh</SmallButton>} />

      {module === "operations" && <OperationsPanel overview={overviewQuery.data} activity={activityQuery.data?.activity || []} analytics={analyticsQuery.data} days={days} setDays={setDays} loading={overviewQuery.isLoading} error={overviewQuery.error instanceof Error ? overviewQuery.error.message : ""} canViewFinancial={hasPermission(staffUser, "payments.view") && hasPermission(staffUser, "analytics.revenue")} canViewSupport={hasPermission(staffUser, "support.view")} canViewVerification={hasPermission(staffUser, "verification.view")} canViewAccounts={hasPermission(staffUser, "accounts.view")} canViewContent={hasPermission(staffUser, "content.view") || hasPermission(staffUser, "moderation.content.view")} canViewReports={hasPermission(staffUser, "moderation.queue.view")} canViewCreators={hasPermission(staffUser, "creators.view")} canViewLive={hasPermission(staffUser, "live.forceEnd")} canViewModeration={hasPermission(staffUser, "moderation.content.view")} canViewSystemHealth={hasPermission(staffUser, "system.health.view")} />}

      {module === "user-intelligence" && <>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, username or email…" />
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <RecordList title="User directory" rows={items} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No matching user accounts" render={(row) => <RecordRow key={row._id} title={`${row.name} · @${row.username}`} subtitle={`${row.email} · ${row.followersCount || 0} followers · ${row.postsCount || 0} posts`} status={row.status} date={displayDate(row.createdAt)}><SmallButton onClick={() => setSelectedUserId(row._id)}>Inspect profile</SmallButton></RecordRow>} />
          <AdminCard>
            <div className="p-4"><AdminCardHeader title="Account intelligence" subtitle="Select a user to view their actual activity and administrative history."/></div>
            {!selectedUserId ? <div className="px-4 pb-5"><AdminEmptyState icon={UserRound} title="No account selected" description="Choose a user from the directory to inspect their profile, content and history."/></div> : userDetailQuery.isLoading ? <div className="p-4"><AdminSkeletonRows rows={5}/></div> : userDetailQuery.error ? <div className="p-4"><AdminErrorState message="Could not load account details" onRetry={() => void userDetailQuery.refetch()}/></div> : <UserDetail data={userDetailQuery.data}/ >}
          </AdminCard>
        </div>
      </>}

      {(module === "creator-intelligence" || module === "creators") && <>
        <div className={`grid gap-4 sm:grid-cols-2 ${hasPermission(staffUser, "creator.analytics.view") ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
          <AdminStatCard icon={Users} label="Creators in directory" value={formatCount(response.total ?? items.length)} tone="primary" hint="Accounts marked as creators"/>
          <AdminStatCard icon={TrendingUp} label="Creator followers" value={formatCount(items.reduce((sum, row) => sum + number(row.followersCount), 0))} tone="aqua" hint="Followers across the loaded page"/>
          <AdminStatCard icon={FileText} label="Published activity" value={formatCount(items.reduce((sum, row) => sum + number(row.postsCount), 0))} tone="success" hint="Post count across the loaded page"/>
          {hasPermission(staffUser, "creator.analytics.view") && <AdminStatCard icon={Eye} label="Tracked 30-day views" value={formatCount(items.reduce((sum, row) => sum + number(row.views30d), 0))} tone="info" hint="Interactions attributed to creators"/>}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search creator name or username…" />
        <RecordList title="Creator directory" rows={items.filter((row) => !search || `${row.name} ${row.username}`.toLowerCase().includes(search.toLowerCase()))} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No creator accounts found" render={(row) => <RecordRow key={row._id} title={`${row.name} · @${row.username}`} subtitle={`${formatCount(row.followersCount)} followers · ${formatCount(row.postsCount)} posts${hasPermission(staffUser, "creator.analytics.view") ? ` · ${formatCount(row.views30d)} tracked views / 30d · ${formatCount(row.uniqueAudience30d)} unique audience` : ""}`} status={row.status} date={displayDate(row.createdAt)}><AdminBadge tone={row.verified ? "success" : "muted"}>{row.verified ? "Verified" : "Unverified"}</AdminBadge>{hasPermission(staffUser, "accounts.makeCreator") && <><input aria-label={`Reason to remove creator status from ${row.username}`} value={notes[`creator:${row._id}`] || ""} onChange={(e) => setNote(`creator:${row._id}`, e.target.value)} placeholder="Reason to revoke" className="h-8 w-36 rounded-lg border border-border bg-background px-2 text-[11px]"/><SmallButton variant="danger" disabled={actionMutation.isPending || (notes[`creator:${row._id}`] || "").trim().length < 5} onClick={() => { if (window.confirm(`Remove Creator status from @${row.username}? Their account and content will remain intact.`)) submit({ kind: "creator-revoke", id: row._id, body: { reason: notes[`creator:${row._id}`].trim() } }); }}>Remove Creator</SmallButton></>}</RecordRow>} />
      </>}

      {module === "support" && <>
        <div className="flex flex-wrap items-center gap-2"><SearchBar value={search} onChange={setSearch} placeholder="Search ticket subject or user…"/><select value={["open","in_progress","waiting_user","resolved","closed"].includes(statusFilter) ? statusFilter : ""} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm"><option value="">All statuses</option>{["open","in_progress","waiting_user","resolved","closed"].map((v) => <option key={v} value={v}>{v.replaceAll("_", " ")}</option>)}</select></div>
        <RecordList title="Support ticket queue" rows={items} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No support tickets match this filter" render={(row) => <SupportTicketRow key={row._id} ticket={row} reply={ticketReplies[row._id] || ""} setReply={(v) => setTicketReplies((prev) => ({ ...prev, [row._id]: v }))} busy={actionMutation.isPending} onUpdate={(body) => submit({ kind: "support", id: row._id, body })} staff={response.staff || []} canManage={hasPermission(staffUser, "support.manage")} />} />
      </>}

      {module === "verification" && <>
        <FilterSelect value={["pending","approved","rejected"].includes(statusFilter) ? statusFilter : "pending"} onChange={setStatusFilter} options={["pending","approved","rejected"]}/>
        <RecordList title="Account verification requests" rows={items} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No verification requests in this view" render={(row) => <div key={row._id} className="border-b border-border/60 p-4 last:border-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{row.user?.name || "Unknown user"} · @{row.user?.username || "unknown"}</p><AdminBadge tone={statusTone(row.status)}>{row.status}</AdminBadge><AdminBadge>{row.category}</AdminBadge></div><p className="mt-2 text-sm text-muted-foreground">{row.statement}</p>{(row.publicLinks || []).map((url: string) => <a key={url} href={url} target="_blank" rel="noreferrer" className="mt-1 mr-3 inline-block text-xs text-primary underline">{url}</a>)}<p className="mt-2 text-[11px] text-muted-foreground">Submitted {displayDate(row.createdAt)}</p>{row.status === "pending" && hasPermission(staffUser, "verification.review") && <div className="mt-3 flex flex-wrap gap-2"><input value={notes[row._id] || ""} onChange={(e) => setNote(row._id,e.target.value)} placeholder="Decision note (optional)" className="h-9 min-w-[200px] flex-1 rounded-lg border border-border bg-background px-3 text-xs"/><SmallButton disabled={actionMutation.isPending} onClick={() => submit({ kind: "verification", id: row._id, body: { action: "approve", note: notes[row._id] || "" } })}><CheckCircle2 className="size-3.5"/> Approve</SmallButton><SmallButton variant="danger" disabled={actionMutation.isPending || (notes[row._id] || "").trim().length < 5} onClick={() => submit({ kind: "verification", id: row._id, body: { action: "reject", note: notes[row._id] || "" } })}><XCircle className="size-3.5"/> Reject</SmallButton></div>}</div>} />
      </>}

      {module === "announcements" && <>
        {hasPermission(staffUser, "announcements.create") && <AdminCard><div className="space-y-3 p-4"><AdminCardHeader title="Create announcement draft" subtitle="Drafts do not notify users until Superadmin publishes them."/><input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} maxLength={120} placeholder="Announcement title" className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"/><textarea value={announcementMessage} onChange={(e) => setAnnouncementMessage(e.target.value)} maxLength={1000} rows={3} placeholder="Write a clear message for Gihanga Updates users…" className="w-full rounded-xl border border-border bg-background p-3 text-sm"/><div className="flex justify-between gap-3"><span className="text-[11px] text-muted-foreground">{announcementMessage.length}/1000 characters</span><SmallButton disabled={!announcementTitle.trim() || announcementMessage.trim().length < 5 || actionMutation.isPending} onClick={() => submit({ kind: "announcement-create", body: { title: announcementTitle.trim(), message: announcementMessage.trim() } })}>Save draft</SmallButton></div></div></AdminCard>}
        <RecordList title="Announcement history" rows={items} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No announcements yet" render={(row) => <RecordRow key={row._id} title={row.title} subtitle={row.message} status={row.status} date={displayDate(row.createdAt)} meta={`${row.recipientsCount || 0} recipients`} >{row.status === "draft" && hasPermission(staffUser,"announcements.publish") && <SmallButton disabled={actionMutation.isPending} onClick={() => { if (window.confirm(`Publish “${row.title}” to all active user accounts?`)) submit({ kind: "announcement-publish", id: row._id }); }}>Publish to users</SmallButton>}</RecordRow>} />
      </>}

      {(module === "post-review" || module === "comment-review" || module === "story-review") && <>
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={["pending_review","failed","processing","rejected","approved"]}/>
        <RecordList title="Moderation review queue" rows={items} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No moderation records in this queue" render={(row) => <ModerationRow key={row._id} record={row} note={notes[row._id] || ""} setNote={(v) => setNote(row._id,v)} busy={actionMutation.isPending} onDecision={(action) => submit({ kind: "moderation", id: row._id, body: { action, note: notes[row._id] || "" } })} canAct={hasPermission(staffUser, "moderation.assessments.action")} />} />
      </>}

      {module === "appeals" && <>
        <FilterSelect value={["pending","approved","rejected"].includes(statusFilter) ? statusFilter : "pending"} onChange={setStatusFilter} options={["pending","approved","rejected"]}/>
        <RecordList title="Appeal cases" rows={items} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No appeals in this view" render={(row) => <div key={row._id} className="border-b border-border/60 p-4 last:border-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{row.user?.name || "User appeal"} · @{row.user?.username || "unknown"}</p><AdminBadge tone={statusTone(row.status)}>{row.status}</AdminBadge></div><p className="mt-2 text-xs text-muted-foreground">{row.reason || row.message || "The user requested a review of a moderation decision."}</p><p className="mt-1 text-[11px] text-muted-foreground">Submitted {displayDate(row.submittedAt)}</p>{row.status === "pending" && hasPermission(staffUser,"moderation.appeals.action") && <div className="mt-3 flex flex-wrap gap-2"><input value={notes[row._id] || ""} onChange={(e) => setNote(row._id,e.target.value)} placeholder="Required decision note" className="h-9 min-w-[200px] flex-1 rounded-lg border border-border bg-background px-3 text-xs"/><SmallButton disabled={!notes[row._id]?.trim() || actionMutation.isPending} onClick={() => submit({ kind: "appeal", id: row._id, body: { action: "approve", note: notes[row._id] } })}>Approve appeal</SmallButton><SmallButton variant="danger" disabled={!notes[row._id]?.trim() || actionMutation.isPending} onClick={() => submit({ kind: "appeal", id: row._id, body: { action: "reject", note: notes[row._id] } })}>Reject appeal</SmallButton></div>}</div>} />
      </>}

      {module === "approvals" && <ApprovalsPanel data={response} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""}/ >}

      {module === "security" && <>
        <div className={`grid gap-4 sm:grid-cols-2 ${hasPermission(staffUser, "payments.view") && hasPermission(staffUser, "analytics.revenue") ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}><AdminStatCard icon={AlertTriangle} label="Risk signals" value={formatCount(items.length)} tone="warning" hint="Seven-day review window"/>{hasPermission(staffUser, "payments.view") && hasPermission(staffUser, "analytics.revenue") && <AdminStatCard icon={Wallet} label="Failed transactions" value={formatCount(response.failedPayments)} tone="danger" hint="Failed status in the last seven days"/>}<AdminStatCard icon={ShieldCheck} label="Automated decisions" value="Human review" tone="success" hint="Signals never trigger penalties by themselves"/></div>
        <RecordList title="Signals requiring attention" rows={items} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No risk signals were returned" render={(row) => <RecordRow key={row.id} title={row.title} subtitle={row.summary} status={row.severity} date={displayDate(row.createdAt)} meta={row.category?.replaceAll("_"," ")}/>}/>
        <p className="text-xs text-muted-foreground">{response.note || "Risk signals are investigative prompts only. Verify evidence and apply due process before taking action."}</p>
      </>}

      {module === "system-control" && <SystemHealthPanel data={response} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""}/ >}

      {module === "user-investigations" && <RecordList title="Accounts with repeated reports" rows={items} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No grouped report patterns found in the last 30 days" render={(row) => <RecordRow key={row._id} title={`${row.name || "Unknown account"} · @${row.username || "unknown"}`} subtitle={`${row.reportCases} report cases · ${row.reportSubmissions} report submissions · ${row.highSeverityCases} high-severity cases · ${row.pendingCases} open`} status={row.status} date={displayDate(row.lastReportedAt)} meta={row.isCreator ? "Creator account" : "Community account"}/>}/ >}

      {module === "enforcement" && <RecordList title="Moderation and enforcement trail" rows={items} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No enforcement actions found" render={(row) => <RecordRow key={row._id} title={row.action} subtitle={`${row.actor?.name || row.actorUsername || "Staff member"}${row.targetUser?.username ? ` → @${row.targetUser.username}` : ""}`} status={row.action?.split(".").pop()} date={displayDate(row.createdAt)} meta={row.targetId || "Platform action"}/>}/ >}

      {module === "my-performance" && <>
        <div className="grid gap-4 sm:grid-cols-3"><AdminStatCard icon={Activity} label="Actions in 30 days" value={formatCount(response.totalActions)} tone="primary"/><AdminStatCard icon={Flag} label="Reports reviewed" value={formatCount(response.reviewedReports)} tone="aqua"/><AdminStatCard icon={CheckCircle2} label="Assessments reviewed" value={formatCount(response.reviewedAssessments)} tone="success"/></div>
        <AdminCard><div className="p-4"><AdminCardHeader title="Recent personal activity" subtitle="Your own recorded staff actions"/></div><RecordList title="Recent personal activity" rows={items} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No recent actions" render={(row) => <RecordRow key={row._id} title={row.action} subtitle={row.targetId || row.meta?.contentType || "Staff action"} date={displayDate(row.createdAt)}/>}/></AdminCard>
        <p className="text-xs text-muted-foreground">{response.qualityNote}</p>
      </>}

      {module === "trending" && <RecordList title="Trending hashtag records" rows={items} loading={workspaceQuery.isLoading} error={workspaceQuery.error ? errorMessage : ""} empty="No hashtag records available" render={(row) => <RecordRow key={row._id} title={`#${row.tag}`} subtitle={`${formatCount(row.postsCount)} posts`} status={row.category || "community"} meta={`Trend score ${number(row.trend).toFixed(2)}`} date={displayDate(row.updatedAt)}/>}/ >}

      {module === "guidelines" && <GuidelinesPanel/>}

      {!(["operations","user-intelligence","creator-intelligence","creators","announcements","security","system-control","support","verification","approvals","post-review","comment-review","story-review","appeals","user-investigations","enforcement","my-performance","trending","guidelines"] as WorkspaceModule[]).includes(module) && <AdminEmptyState icon={config.icon} title="Workspace module unavailable" description="This module is not configured."/>}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3.5 focus-within:border-ring"><Search className="size-4 text-muted-foreground"/><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"/></div>;
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground">{options.map((option) => <option key={option} value={option}>{option.replaceAll("_"," ")}</option>)}</select>;
}

function RecordList({ title, rows, loading, error, empty, render }: { title: string; rows: any[]; loading: boolean; error: string; empty: string; render: (row: any) => React.ReactNode }) {
  return <AdminCard><div className="p-4"><AdminCardHeader title={title} subtitle={`${rows.length} record${rows.length === 1 ? "" : "s"} loaded`}/></div>{loading ? <div className="px-4 pb-4"><AdminSkeletonRows rows={5}/></div> : error ? <div className="p-4"><AdminErrorState message={error}/></div> : rows.length === 0 ? <div className="px-4 pb-4"><AdminEmptyState icon={Search} title={empty}/></div> : <div>{rows.map(render)}</div>}</AdminCard>;
}

function OperationsPanel({ overview, activity, analytics, days, setDays, loading, error, canViewFinancial, canViewSupport, canViewVerification, canViewAccounts, canViewContent, canViewReports, canViewCreators, canViewLive, canViewModeration, canViewSystemHealth }: { overview: any; activity: any[]; analytics: any; days: number; setDays: (days: number) => void; loading: boolean; error: string; canViewFinancial: boolean; canViewSupport: boolean; canViewVerification: boolean; canViewAccounts: boolean; canViewContent: boolean; canViewReports: boolean; canViewCreators: boolean; canViewLive: boolean; canViewModeration: boolean; canViewSystemHealth: boolean }) {
  const stats = overview?.stats || {};
  const series = (analytics?.series || []).map((row: any) => ({ label: new Date(row.date).toLocaleDateString(undefined,{month:"short",day:"numeric"}), "New users": row.newUsers ?? 0, Posts: row.posts ?? 0, Reports: row.reports ?? 0, "Content views": row.contentViews ?? 0, "Active users": row.activeUsers ?? 0 }));
  const chartSeries = [
    ...(canViewAccounts ? [{key:"New users",name:"New users",colorIndex:1 as const}] : []),
    ...(canViewContent ? [{key:"Posts",name:"Posts",colorIndex:2 as const},{key:"Content views",name:"Content views",colorIndex:3 as const}] : []),
    ...(canViewReports ? [{key:"Reports",name:"Reports",colorIndex:4 as const}] : []),
    {key:"Active users",name:"Active users",colorIndex:5 as const},
  ];
  const statCards = [
    ...(canViewAccounts ? [{ icon: Users, label: "Registered users", value: formatCount(stats.totalUsers), hint: `+${formatCount(stats.newUsers24h)} in the last 24 hours`, tone: "primary" as const }] : []),
    { icon: Activity, label: "Content-active users", value: formatCount(stats.contentActiveUsers24h), hint: "Distinct users with recorded content interactions in 24h", tone: "aqua" as const },
    ...(canViewContent ? [{ icon: FileText, label: "Published content records", value: formatCount(number(stats.totalPosts)+number(stats.totalStories)), hint: `${formatCount(stats.totalPosts)} posts · ${formatCount(stats.totalStories)} stories`, tone: "success" as const }] : []),
    ...(canViewReports ? [{ icon: Flag, label: "Open reports", value: formatCount(stats.pendingReports), hint: `${formatCount(stats.highReports)} high severity`, tone: stats.pendingReports ? "warning" as const : "muted" as const }] : []),
    ...(canViewCreators ? [{ icon: Award, label: "Creator accounts", value: formatCount(stats.totalCreators), hint: `+${formatCount(stats.newCreators30d)} newly created in 30 days`, tone: "accent" as const }] : []),
    ...(canViewLive ? [{ icon: Radio, label: "Live sessions now", value: formatCount(stats.liveNow), hint: "Current live stream status", tone: "info" as const }] : []),
    ...(canViewContent ? [{ icon: Eye, label: "Recorded content views", value: formatCount(stats.contentViews24h), hint: "Last 24 hours; event-tracked views", tone: "primary" as const }] : []),
    ...(canViewModeration ? [{ icon: ShieldAlert, label: "Pending content assessments", value: formatCount(stats.pendingAssessments), hint: "Items awaiting human review", tone: "warning" as const }] : []),
    ...(canViewSystemHealth ? [{ icon: Server, label: "Failed moderation jobs", value: formatCount(stats.failedModerationJobs), hint: "Pipeline jobs requiring attention", tone: "warning" as const }] : []),
    ...(canViewSupport ? [{ icon: CircleHelp, label: "Open support tickets", value: formatCount(stats.pendingSupport), hint: "Current open and in-progress cases", tone: "aqua" as const }] : []),
    ...(canViewVerification ? [{ icon: ShieldCheck, label: "Pending verifications", value: formatCount(stats.pendingVerification), hint: "Awaiting authorized review", tone: "info" as const }] : []),
    ...(canViewFinancial ? [{ icon: Wallet, label: "Ad payment revenue", value: `${formatCount(stats.adRevenueRwf)} RWF`, hint: "Completed ad_payment transactions only", tone: "success" as const }] : []),
  ];
  if (loading && !overview) return <AdminSkeletonRows rows={8}/>;
  return <>
    {error && <AdminErrorState message={error}/>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => <AdminStatCard key={card.label} icon={card.icon} label={card.label} value={card.value} hint={card.hint} tone={card.tone}/>) }
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
      <AdminCard><div className="flex flex-wrap items-center justify-between gap-3 p-4"><AdminCardHeader title="Platform activity trends" subtitle="Daily counts from persisted app records and interaction events."/><FilterSelect value={String(days)} onChange={(v) => setDays(Number(v))} options={["7","30","90"]}/></div><div className="px-3 pb-4">{series.length && chartSeries.length ? <AdminLineChart data={series} series={chartSeries} height={280}/> : <AdminEmptyState icon={TrendingUp} title="No analytics series yet" description="Activity trends will appear once there are records for this period."/>}</div></AdminCard>
      <AdminCard><div className="p-4"><AdminCardHeader title="Live platform activity" subtitle="Recent app activity, refreshed every 12 seconds"/></div>{activity.length ? <div className="max-h-[390px] overflow-y-auto">{activity.slice(0,16).map((event: any) => <div key={event.id} className="flex gap-3 border-t border-border/50 px-4 py-3"><span className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Activity className="size-4"/></span><div className="min-w-0"><p className="text-xs font-semibold text-foreground">{event.summary}</p><p className="mt-1 text-[11px] text-muted-foreground">{event.actor?.name ? `${event.actor.name} · ` : ""}{event.category} · {displayDate(event.createdAt)}</p></div></div>)}</div> : <div className="px-4 pb-4"><AdminEmptyState icon={Activity} title="No recent activity" description="New registrations, content, reports and live events will appear here."/></div>}</AdminCard>
    </div>
    <p className="text-[11px] text-muted-foreground">Metrics are limited to your current staff permissions. Active users are distinct accounts with persisted interaction events in the selected time window; content views are observed interaction events and ad revenue is completed ad_payment transactions in RWF only.</p>
  </>;
}

function UserDetail({ data }: { data: any }) {
  const user = data.user;
  if (!user) return <div className="p-4"><AdminEmptyState icon={UserRound} title="Account not found"/></div>;

  const sections = [
    { title: "Recent reports", rows: (data.reports || []).slice(0, 6), empty: "No report records found for this account." },
    { title: "Recorded interactions · last 90 days", rows: (data.interactions || []).slice(0, 8), empty: "No recorded interactions in this period." },
    { title: "Administrative history", rows: (data.administrativeHistory || []).slice(0, 6), empty: "No administrative actions linked to this account." },
  ];

  return <div className="space-y-4 p-4">
    <div className="flex items-center gap-3">
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-lg font-extrabold text-primary">{String(user.name || "?").slice(0,1).toUpperCase()}</div>
      <div className="min-w-0"><p className="truncate font-bold">{user.name}</p><p className="truncate text-xs text-muted-foreground">@{user.username} · {user.email}</p><p className="text-[10px] text-muted-foreground">Joined {displayDate(user.createdAt)}</p></div>
    </div>
    <div className="grid grid-cols-2 gap-2">{[["Followers",user.followersCount],["Following",user.followingCount],["Posts",user.postsCount],["Strikes",user.strikes]].map(([label,value]) => <div key={String(label)} className="rounded-xl bg-muted/50 p-3"><p className="text-lg font-extrabold">{formatCount(number(value))}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>)}</div>
    <div className="flex flex-wrap gap-2"><AdminBadge tone={statusTone(user.status)}>{user.status}</AdminBadge><AdminBadge tone={user.verified ? "success" : "muted"}>{user.verified ? "Verified" : "Unverified"}</AdminBadge><AdminBadge>{user.isCreator ? "Creator" : "Member"}</AdminBadge><AdminBadge tone={user.emailVerified ? "success" : "muted"}>{user.emailVerified ? "Email verified" : "Email unverified"}</AdminBadge></div>
    <section><p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Recent content</p>{(data.posts || []).slice(0,6).length ? (data.posts || []).slice(0,6).map((post: any) => <div key={post._id} className="border-t border-border/50 py-2"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold">{post.kind} · {post.status}</p><span className="text-[10px] text-muted-foreground">{displayDate(post.createdAt)}</span></div><p className="line-clamp-2 text-xs text-muted-foreground">{post.body || "Media post"}</p><p className="text-[10px] text-muted-foreground">{formatCount(post.viewsCount)} views · {formatCount(post.likesCount)} likes · {formatCount(post.commentsCount)} comments</p></div>) : <p className="text-xs text-muted-foreground">No recent content.</p>}</section>
    {sections.map((section, index) => <section key={section.title}><p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{section.title}</p>{section.rows.length ? <div className="space-y-2">{section.rows.map((entry: any, entryIndex: number) => {
      const report = index === 0;
      const interaction = index === 1;
      const title = report ? `${entry.reason || "Report"} · ${entry.severity || "unrated"}` : interaction ? String(entry.event || "interaction").replaceAll("_", " ") : String(entry.action || "Administrative action").replaceAll(".", " ");
      const detail = report ? entry.actionNote || `Report status: ${entry.status || "unknown"}` : interaction ? `${entry.targetKind || "Platform"}${entry.watchPercentage != null ? ` · ${entry.watchPercentage}% watched` : ""}` : typeof entry.meta === "object" && entry.meta ? Object.entries(entry.meta).map(([key,value]) => `${key}: ${String(value)}`).join(" · ") : "Recorded administrative action";
      const actor = !report && !interaction ? entry.actor?.name || entry.actor?.username : undefined;
      return <div key={entry._id || `${section.title}-${entryIndex}`} className="rounded-xl border border-border/60 bg-card/60 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold capitalize">{title}</p><span className="text-[10px] text-muted-foreground">{displayDate(entry.createdAt)}</span></div><p className="mt-1 text-xs text-muted-foreground">{detail}{actor ? ` · By ${actor}` : ""}</p>{report && <AdminBadge tone={statusTone(entry.status || "pending")}>{entry.status || "unknown"}</AdminBadge>}</div>;
    })}</div> : <p className="text-xs text-muted-foreground">{section.empty}</p>}</section>)}
  </div>;
}

function SupportTicketRow({ ticket, reply, setReply, busy, onUpdate, staff, canManage }: { ticket: any; reply: string; setReply: (value: string) => void; busy: boolean; onUpdate: (body: Record<string, unknown>) => void; staff: any[]; canManage: boolean }) {
  const [staffNote, setStaffNote] = useState(ticket.staffNote || "");
  return <div className="border-b border-border/60 p-4 last:border-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{ticket.subject}</p><AdminBadge tone={statusTone(ticket.status)}>{ticket.status?.replaceAll("_"," ")}</AdminBadge><AdminBadge tone={ticket.priority === "urgent" ? "danger" : ticket.priority === "high" ? "warning" : "muted"}>{ticket.priority}</AdminBadge></div><p className="mt-1 text-xs text-muted-foreground">{ticket.user?.name || "User"} · @{ticket.user?.username || "unknown"} · {ticket.category}</p><p className="mt-2 text-sm text-foreground/85">{ticket.message}</p>{Array.isArray(ticket.messages) && ticket.messages.length > 1 && <div className="mt-3 space-y-2 rounded-xl bg-muted/40 p-3">{ticket.messages.slice(-4).map((message: any, index: number) => <div key={`${message.createdAt || "message"}-${index}`}><p className="text-[10px] font-bold uppercase text-muted-foreground">{message.senderRole || "user"} · {displayDate(message.createdAt)}</p><p className="text-xs text-foreground/85">{message.body}</p></div>)}</div>}{canManage && <><textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="Reply to the user…" className="mt-3 w-full rounded-lg border border-border bg-background p-2.5 text-xs"/><div className="mt-2 grid gap-2 sm:grid-cols-2"><select value={ticket.assignedTo?._id || ""} onChange={(e) => onUpdate({ assignedTo: e.target.value || null })} className="h-9 rounded-lg border border-border bg-background px-2 text-xs"><option value="">Unassigned</option>{staff.map((person) => <option key={person._id} value={person._id}>{person.name} · {person.role}</option>)}</select><select value={ticket.priority || "normal"} onChange={(e) => onUpdate({ priority: e.target.value })} className="h-9 rounded-lg border border-border bg-background px-2 text-xs">{["low","normal","high","urgent"].map((priority) => <option key={priority} value={priority}>{priority} priority</option>)}</select></div><div className="mt-2 flex flex-wrap gap-2"><SmallButton disabled={busy || !reply.trim()} onClick={() => { onUpdate({ reply: reply.trim(), status: "waiting_user" }); setReply(""); }}>Send reply</SmallButton>{["open","in_progress","waiting_user","resolved","closed"].map((status) => <SmallButton key={status} variant="muted" disabled={busy || ticket.status === status} onClick={() => onUpdate({ status })}>{status.replaceAll("_"," ")}</SmallButton>)}</div><div className="mt-3 flex flex-wrap gap-2"><input value={staffNote} onChange={(e) => setStaffNote(e.target.value)} maxLength={2000} placeholder="Internal note — visible to staff only" className="h-9 min-w-[220px] flex-1 rounded-lg border border-border bg-background px-3 text-xs"/><SmallButton variant="muted" disabled={busy || staffNote === (ticket.staffNote || "")} onClick={() => onUpdate({ staffNote })}>Save internal note</SmallButton></div></>} {!canManage && <p className="mt-3 text-[11px] text-muted-foreground">Read-only support access. Ticket changes require the support.manage permission.</p>}</div>;
}

function ModerationRow({ record, note, setNote, busy, onDecision, canAct }: { record: any; note: string; setNote: (value: string) => void; busy: boolean; onDecision: (action: "approve" | "reject" | "escalate") => void; canAct: boolean }) {
  const content = record.content?.post || record.content?.story || record.content?.comment || record.content || {};
  const body = content.body || content.caption || record.userMessage || record.error || "Content was flagged for human review.";
  return <div className="border-b border-border/60 p-4 last:border-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{record.contentType} · {record.author?.name || "Unknown author"} (@{record.author?.username || "unknown"})</p><AdminBadge tone={record.severity === "critical" || record.severity === "high" ? "danger" : "warning"}>{record.severity || "review"}</AdminBadge><AdminBadge tone={statusTone(record.status)}>{record.status}</AdminBadge>{record.criticalEscalation && <AdminBadge tone="danger">Critical protocol</AdminBadge>}</div><p className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">{String(body).slice(0,600)}</p><p className="mt-1 text-[11px] text-muted-foreground">{record.categories?.join(", ") || "Automated content-safety assessment"} · {displayDate(record.createdAt)}</p><div className="mt-3 flex flex-wrap gap-2">{canAct ? <><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason required for reject / escalate" className="h-9 min-w-[220px] flex-1 rounded-lg border border-border bg-background px-3 text-xs"/><SmallButton disabled={busy || Boolean(record.criticalEscalation)} onClick={() => onDecision("approve")}><CheckCircle2 className="size-3.5"/> Approve</SmallButton><SmallButton variant="danger" disabled={busy || !note.trim()} onClick={() => onDecision("reject")}>Reject</SmallButton><SmallButton variant="muted" disabled={busy || !note.trim()} onClick={() => onDecision("escalate")}>Escalate</SmallButton></> : <p className="text-[11px] text-muted-foreground">Read-only review access. Decision permission is not assigned.</p>}</div></div>;
}

function ApprovalsPanel({ data, loading, error }: { data: any; loading: boolean; error: string }) {
  const counts = data.counts || {};
  const tiles = [["Verification",counts.verification,"/system/dashboard/verification"],["Appeals",counts.appeals,"/system/dashboard/appeals"],["Reports",counts.reports,"/system/dashboard/moderation"],["AI review queue",counts.moderation,"/system/dashboard/moderation"],["Support tickets",counts.support,"/system/dashboard/support"]];
  return <>{error && <AdminErrorState message={error}/>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{tiles.map(([label,value,to]) => <a key={String(label)} href={String(to)} className="rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"><p className="text-2xl font-extrabold">{loading ? "—" : formatCount(value)}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p><p className="mt-2 text-[11px] font-bold text-primary">Open queue <ArrowUpRight className="inline size-3"/></p></a>)}</div><RecordList title="Verification waiting for review" rows={data.verification || []} loading={loading} error="" empty="No verification approvals pending" render={(row: any) => <RecordRow key={row._id} title={`${row.user?.name || "User"} · @${row.user?.username || "unknown"}`} subtitle={row.statement} status="pending" date={displayDate(row.createdAt)}/>}/></>;
}

function SystemHealthPanel({ data, loading, error }: { data: any; loading: boolean; error: string }) {
  const cards = [ ["API",data.api?.status,data.api?.environment], ["Database",data.database?.status,data.database?.name], ["Moderation",data.moderation?.enabled ? "enabled" : "disabled",data.moderation?.failClosed ? "Fail-closed" : "Provider state"] ];
  return <><div className="grid gap-4 sm:grid-cols-3">{cards.map(([label,status,meta]) => <AdminStatCard key={String(label)} icon={label === "Database" ? Activity : label === "Moderation" ? ShieldCheck : Server} label={String(label)} value={loading ? "…" : String(status || "unknown")} tone={statusTone(String(status || "unknown"))} hint={String(meta || "No additional detail")}/>)}</div>{error && <AdminErrorState message={error}/>}<div className="grid gap-5 md:grid-cols-2"><AdminCard><div className="p-4"><AdminCardHeader title="Runtime diagnostics" subtitle="Current backend process only"/></div><div className="space-y-3 px-4 pb-4 text-xs">{[["Node runtime",data.api?.nodeVersion],["Uptime",data.api?.uptimeSeconds ? `${Math.floor(data.api.uptimeSeconds/3600)}h ${Math.floor(data.api.uptimeSeconds%3600/60)}m` : "—"],["RSS memory",data.runtime?.memoryRssMb ? `${data.runtime.memoryRssMb} MB` : "—"],["Heap used",data.runtime?.heapUsedMb ? `${data.runtime.heapUsedMb} MB` : "—"],["Checked",displayDate(data.checkedAt)]].map(([label,value]) => <div key={String(label)} className="flex justify-between gap-3 border-b border-border/50 pb-2"><span className="text-muted-foreground">{label}</span><strong>{String(value || "—")}</strong></div>)}</div></AdminCard><AdminCard><div className="p-4"><AdminCardHeader title="Moderation providers" subtitle="Secret-free provider readiness summary"/></div><div className="space-y-2 px-4 pb-4 text-xs">{Object.entries(data.moderation?.providers || {}).map(([name,provider]: [string,any]) => <div key={name} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3"><span className="font-semibold capitalize">{name.replaceAll(/([A-Z])/g," $1")}</span><AdminBadge tone={provider.configured ? "success" : "warning"}>{provider.configured ? "Configured" : "Not configured"}</AdminBadge></div>)}{(data.moderation?.warnings || []).map((warning: string) => <p key={warning} className="rounded-lg bg-warning/10 p-2 text-warning">{warning}</p>)}</div></AdminCard></div><p className="text-xs text-muted-foreground">{(data.limitations || []).join(" ")}</p><div className="flex flex-wrap gap-2"><a className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-primary" href="/system/dashboard/settings">Platform settings</a><a className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-primary" href="/system/dashboard/ad-settings">Ad settings & rates</a></div></>;
}

function GuidelinesPanel() {
  const entries = [
    ["Assess the actual content", "Review the specific post, comment, story or live context. Do not make a decision from a report count alone."],
    ["Use proportional enforcement", "Apply the least restrictive action that addresses the documented policy concern, following the platform's configured rules."],
    ["Document non-approval decisions", "Rejection and escalation actions require a clear staff note in the moderation API. Notes become part of the review record."],
    ["Escalate critical-protocol records", "Critical records cannot be approved through the standard assessment endpoint. Follow the existing escalation procedure."],
    ["Preserve user due process", "Use appeal review for eligible cases, disclose only appropriate information, and avoid exposing reporter identity."],
    ["Treat AI as assistance", "AI moderation classifications and provider errors are review signals. A human should resolve uncertain or high-impact cases."],
  ];
  return <div className="grid gap-4 md:grid-cols-2">{entries.map(([title,body],index) => <AdminCard key={title}><div className="flex gap-3 p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-extrabold text-primary">{index+1}</span><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p></div></div></AdminCard>)}</div>;
}
