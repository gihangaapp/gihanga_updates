import { Router, Response } from "express";
import { Types, connection } from "mongoose";
import { User, type UserRole } from "../../../../models/User";
import { Post } from "../../../../models/Post";
import { Story } from "../../../../models/Story";
import { Comment } from "../../../../models/Comment";
import { Report } from "../../../../models/Report";
import { LiveStream } from "../../../../models/LiveStream";
import { Transaction } from "../../../../models/Transaction";
import { UserInteraction } from "../../../../models/UserInteraction";
import { AuditLog } from "../../../../models/AuditLog";
import { PlatformEvent } from "../../../../models/PlatformEvent";
import { Hashtag } from "../../../../models/Hashtag";
import { ModerationRecord } from "../../../../models/ModerationRecord";
import { ModerationJob } from "../../../../models/ModerationJob";
import { SupportTicket } from "../../../../models/SupportTicket";
import { VerificationRequest } from "../../../../models/VerificationRequest";
import { Announcement } from "../../../../models/Announcement";
import { Notification } from "../../../../models/Notification";
import { authenticateStaff, requirePermission, getEffectiveStaffPermissions, type AuthenticatedRequest } from "../../../../middleware/rbac";
import { logAudit } from "../../../../utils/auditLogger";
import { notify } from "../../../../lib/notify";
import { publicSummary as moderationSummary } from "../../../../lib/moderation/config";

const router = Router();
const DAY_MS = 24 * 60 * 60 * 1000;
const SAFE_USER_FIELDS = "name username email avatarHue avatarUrl role status isCreator verified emailVerified followersCount followingCount postsCount strikes createdAt updatedAt";
const ACTIVITY_LIMIT = 100;

function cleanQuery(value: unknown, max = 100) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeRegex(value: string) {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

function dayStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function groupedByDay(model: any, dateField: string, from: Date, extraMatch: Record<string, unknown> = {}) {
  const match: Record<string, unknown> = { ...extraMatch, [dateField]: { $gte: from } };
  return model.aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } }, count: { $sum: 1 } } },
  ]);
}

function mapActivity(type: string, category: string, summary: string, createdAt: Date | string, actor?: any, targetId?: string, metadata?: any) {
  return {
    id: `${type}:${targetId || new Date(createdAt).getTime()}`,
    type,
    category,
    summary,
    actor: actor ? { name: actor.name, username: actor.username, role: actor.role } : null,
    targetId,
    metadata,
    createdAt,
  };
}

// GET /api/v1/system/workspace/overview — role-aware, live platform snapshot.
router.get("/overview", authenticateStaff, requirePermission("operations.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.staffUser!.role;
    const permissions = getEffectiveStaffPermissions(role, req.staffUser!.permissions);
    const since24h = new Date(Date.now() - DAY_MS);
    const since30d = new Date(Date.now() - 30 * DAY_MS);
    const [totalUsers, newUsers24h, totalCreators, newCreators30d, totalPosts, totalStories, totalComments, pendingReports, highReports, liveNow, contentActiveUsers24h, contentViews24h, pendingAssessments, failedModerationJobs, pendingSupport, pendingVerification, adRevenue] = await Promise.all([
      permissions.has("accounts.view") ? User.countDocuments({ role: "user" }) : Promise.resolve(0),
      permissions.has("accounts.view") ? User.countDocuments({ role: "user", createdAt: { $gte: since24h } }) : Promise.resolve(0),
      permissions.has("creators.view") ? User.countDocuments({ role: "user", isCreator: true }) : Promise.resolve(0),
      permissions.has("creators.view") ? User.countDocuments({ role: "user", isCreator: true, createdAt: { $gte: since30d } }) : Promise.resolve(0),
      permissions.has("content.view") || permissions.has("moderation.content.view") ? Post.countDocuments({}) : Promise.resolve(0),
      permissions.has("content.view") || permissions.has("moderation.content.view") ? Story.countDocuments({}) : Promise.resolve(0),
      permissions.has("content.view") || permissions.has("moderation.content.view") ? Comment.countDocuments({}) : Promise.resolve(0),
      permissions.has("moderation.queue.view") ? Report.countDocuments({ status: { $in: ["pending", "escalated"] } }) : Promise.resolve(0),
      permissions.has("moderation.queue.view") ? Report.countDocuments({ status: { $in: ["pending", "escalated"] }, severity: "high" }) : Promise.resolve(0),
      permissions.has("live.forceEnd") ? LiveStream.countDocuments({ status: "live" }) : Promise.resolve(0),
      (permissions.has("operations.activity.view") && (permissions.has("accounts.view") || permissions.has("content.view") || permissions.has("moderation.content.view"))) ? UserInteraction.distinct("user", { createdAt: { $gte: since24h }, user: { $exists: true } }).then((ids) => ids.length) : Promise.resolve(0),
      (permissions.has("operations.activity.view") && (permissions.has("content.view") || permissions.has("moderation.content.view"))) ? UserInteraction.countDocuments({ createdAt: { $gte: since24h }, event: { $in: ["post_view", "reel_start", "story_open", "post_impression", "reel_impression"] } }) : Promise.resolve(0),
      permissions.has("moderation.content.view") ? ModerationRecord.countDocuments({ status: "pending_review" }) : Promise.resolve(0),
      permissions.has("system.health.view") ? ModerationJob.countDocuments({ status: "failed" }) : Promise.resolve(0),
      permissions.has("support.view") ? SupportTicket.countDocuments({ status: { $in: ["open", "in_progress", "waiting_user"] } }) : Promise.resolve(0),
      permissions.has("verification.view") ? VerificationRequest.countDocuments({ status: "pending" }) : Promise.resolve(0),
      permissions.has("payments.view") && permissions.has("analytics.revenue") ? Transaction.aggregate([{ $match: { kind: "ad_payment", status: "completed", currency: "RWF" } }, { $group: { _id: null, amount: { $sum: "$amount" } } }]).then((r) => Number(r[0]?.amount || 0)) : Promise.resolve(0),
    ]);

    const result: Record<string, number> = {
      totalUsers,
      newUsers24h,
      totalCreators,
      newCreators30d,
      totalPosts,
      totalStories,
      totalComments,
      pendingReports,
      highReports,
      liveNow,
      contentActiveUsers24h,
      contentViews24h,
      pendingAssessments,
      failedModerationJobs,
    };
    if (permissions.has("support.view")) result.pendingSupport = pendingSupport;
    if (permissions.has("verification.view")) result.pendingVerification = pendingVerification;
    if (permissions.has("payments.view") && permissions.has("analytics.revenue")) result.adRevenueRwf = adRevenue;
    return res.json({ stats: result, role, sampledAt: new Date().toISOString(), activityBasis: "Content-active users are distinct accounts with recorded content interactions in the last 24 hours; this is not a full session metric." });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load operations overview", details: error.message });
  }
});

// GET /api/v1/system/workspace/activity — one operational timeline from actual app collections.
router.get("/activity", authenticateStaff, requirePermission("operations.activity.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 60, 10), ACTIVITY_LIMIT);
    const role = req.staffUser!.role;
    const permissions = getEffectiveStaffPermissions(role, req.staffUser!.permissions);
    const canViewTeamAudit = permissions.has("audit.viewAll");
    const canViewPayments = permissions.has("payments.view") && permissions.has("analytics.revenue");
    const since = req.query.since ? new Date(String(req.query.since)) : new Date(Date.now() - 14 * DAY_MS);
    const validSince = Number.isNaN(since.getTime()) ? new Date(Date.now() - 14 * DAY_MS) : since;
    const canViewAccounts = permissions.has("accounts.view");
    const canViewContent = permissions.has("content.view") || permissions.has("moderation.content.view");
    const canViewReports = permissions.has("moderation.queue.view");
    const canViewLive = permissions.has("live.forceEnd");
    const eventScopes: Record<string, unknown>[] = [
      ...(canViewAccounts ? [{ category: "users" }] : []),
      ...(canViewContent ? [{ category: "content" }, { category: "community" }] : []),
      ...(canViewReports ? [{ category: "moderation" }] : []),
      ...(canViewLive ? [{ category: "live" }] : []),
      ...(permissions.has("support.view") ? [{ category: "system", requiredAnyPermissions: "support.view" }] : []),
      ...(permissions.has("verification.view") ? [{ category: "system", requiredAnyPermissions: "verification.view" }] : []),
      ...(canViewPayments ? [{ category: "finance" }] : []),
      ...(canViewTeamAudit ? [{ category: "staff", requiredAnyPermissions: "audit.viewAll" }] : []),
    ];
    const visibilityFilter = role === "moderator"
      ? { visibility: "all_staff" }
      : role === "admin"
        ? { visibility: { $in: ["all_staff", "admins"] } }
        : {};
    const [events, users, posts, stories, comments, reports, streams, interactions, audit, transactions] = await Promise.all([
      eventScopes.length ? PlatformEvent.find({ createdAt: { $gte: validSince }, ...visibilityFilter, $or: eventScopes })
        .sort({ createdAt: -1 }).limit(limit).populate("actor", "name username role").lean() : Promise.resolve([]),
      canViewAccounts ? User.find({ role: "user", createdAt: { $gte: validSince } }).sort({ createdAt: -1 }).limit(12).select("name username createdAt").lean() : Promise.resolve([]),
      canViewContent ? Post.find({ createdAt: { $gte: validSince } }).sort({ createdAt: -1 }).limit(12).select("kind status body author createdAt").populate("author", "name username role").lean() : Promise.resolve([]),
      canViewContent ? Story.find({ createdAt: { $gte: validSince } }).sort({ createdAt: -1 }).limit(8).select("mediaType caption author createdAt moderation.status").populate("author", "name username role").lean() : Promise.resolve([]),
      canViewContent ? Comment.find({ createdAt: { $gte: validSince } }).sort({ createdAt: -1 }).limit(8).select("body author post createdAt hidden").populate("author", "name username role").lean() : Promise.resolve([]),
      canViewReports ? Report.find({ createdAt: { $gte: validSince } }).sort({ createdAt: -1 }).limit(10).select("reason severity status target createdAt").populate("target", "name username").lean() : Promise.resolve([]),
      canViewLive ? LiveStream.find({ createdAt: { $gte: validSince } }).sort({ createdAt: -1 }).limit(8).select("title status host viewerCount createdAt startedAt endedAt").populate("host", "name username role").lean() : Promise.resolve([]),
      (permissions.has("operations.activity.view") && (canViewAccounts || canViewContent)) ? UserInteraction.find({ createdAt: { $gte: validSince }, event: { $in: ["post_like", "post_comment", "post_share", "reel_start", "reel_100_percent", "story_open", "user_follow"] } }).sort({ createdAt: -1 }).limit(20).select("event targetKind user createdAt").populate("user", "name username role").lean() : Promise.resolve([]),
      canViewTeamAudit ? AuditLog.find({ createdAt: { $gte: validSince } }).sort({ createdAt: -1 }).limit(15).select("action actorUsername actor targetId createdAt").populate("actor", "name username role") : AuditLog.find({ actor: req.staffUser!.userId, createdAt: { $gte: validSince } }).sort({ createdAt: -1 }).limit(15).select("action actorUsername targetId createdAt"),
      canViewPayments ? Transaction.find({ createdAt: { $gte: validSince }, status: { $in: ["completed", "failed"] } }).sort({ createdAt: -1 }).limit(12).select("kind status amount currency user createdAt").populate("user", "name username role").lean() : Promise.resolve([]),
    ]);

    const rows: any[] = [];
    const eventTargets = new Set(events.filter((event) => event.targetId).map((event) => `${event.category}:${event.targetId}`));
    const hasEvent = (category: string, id: unknown) => eventTargets.has(`${category}:${String(id)}`);
    for (const event of events) rows.push(mapActivity(event.type, event.category, event.summary, event.createdAt, event.actor, event.targetId, event.metadata));
    for (const user of users) if (!hasEvent("users", user._id)) rows.push(mapActivity("user.registered", "users", `@${user.username} joined Gihanga Updates`, user.createdAt, user, String(user._id)));
    for (const post of posts) if (!hasEvent("content", post._id)) rows.push(mapActivity("content.post.created", "content", `A ${post.kind} was created (${post.status})`, post.createdAt, post.author, String(post._id), { kind: post.kind, status: post.status }));
    for (const story of stories) if (!hasEvent("content", story._id)) rows.push(mapActivity("content.story.created", "content", `A ${story.mediaType} story was published`, story.createdAt, story.author, String(story._id), { moderation: story.moderation?.status }));
    for (const comment of comments) if (!hasEvent("community", comment._id)) rows.push(mapActivity("community.comment.created", "community", `A comment was added${comment.hidden ? " and is hidden pending review" : ""}`, comment.createdAt, comment.author, String(comment._id)));
    for (const report of reports) if (!hasEvent("moderation", report._id)) rows.push(mapActivity("moderation.report.submitted", "moderation", `${report.reason} report · ${report.severity} priority · ${report.status}`, report.createdAt, report.target, String(report._id)));
    for (const stream of streams) if (!hasEvent("live", stream._id)) rows.push(mapActivity("live.session.updated", "live", `Live session “${stream.title}” is ${stream.status}`, stream.endedAt || stream.startedAt || stream.createdAt, stream.host, String(stream._id), { status: stream.status, viewerCount: stream.viewerCount }));
    for (const interaction of interactions) {
      const actor = interaction.user as any;
      rows.push(mapActivity(`engagement.${interaction.event}`, "community", `${actor?.username ? `@${actor.username}` : "A member"} performed ${interaction.event.replaceAll("_", " ")}`, interaction.createdAt, actor, String(interaction._id)));
    }
    for (const transaction of transactions as any[]) {
      const actor = transaction.user as any;
      rows.push(mapActivity(`finance.transaction.${transaction.status}`, "finance", `${transaction.kind} transaction ${transaction.status} · ${Number(transaction.amount || 0).toLocaleString()} ${transaction.currency || ""}`.trim(), transaction.createdAt, actor, String(transaction._id), { kind: transaction.kind, status: transaction.status }));
    }
    for (const item of audit as any[]) {
      if (canViewTeamAudit || String(item.actor?._id || item.actor || "") === req.staffUser!.userId || item.actorUsername === req.staffUser!.username) {
        rows.push(mapActivity(`staff.${item.action}`, "staff", `Staff action: ${item.action}`, item.createdAt, item.actor || (item.actorUsername ? { username: item.actorUsername, name: item.actorUsername } : null), item.targetId));
      }
    }
    const sorted = rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
    return res.json({ activity: sorted, since: validSince.toISOString(), source: "MongoDB application records and the centralized platform event stream", refreshedAt: new Date().toISOString() });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load platform activity", details: error.message });
  }
});

// GET /api/v1/system/workspace/analytics?days=7|30|90 — daily platform signals.
router.get("/analytics", authenticateStaff, requirePermission("operations.activity.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const days = Number(req.query.days || 30);
    if (![7, 30, 90].includes(days)) return res.status(400).json({ error: "days must be 7, 30, or 90" });
    const role = req.staffUser!.role;
    const permissions = getEffectiveStaffPermissions(role, req.staffUser!.permissions);
    const now = new Date();
    const from = new Date(dayStart(now).getTime() - (days - 1) * DAY_MS);
    const canViewAccounts = permissions.has("accounts.view");
    const canViewContent = permissions.has("content.view") || permissions.has("moderation.content.view");
    const canViewReports = permissions.has("moderation.queue.view");
    const canViewFinancial = permissions.has("payments.view") && permissions.has("analytics.revenue");
    const canViewPoints = permissions.has("rewards.view");
    const [users, posts, stories, comments, reports, interactions, views, activeUsers, revenue, points] = await Promise.all([
      canViewAccounts ? groupedByDay(User, "createdAt", from, { role: "user" }) : Promise.resolve([]),
      canViewContent ? groupedByDay(Post, "createdAt", from) : Promise.resolve([]),
      canViewContent ? groupedByDay(Story, "createdAt", from) : Promise.resolve([]),
      canViewContent ? groupedByDay(Comment, "createdAt", from) : Promise.resolve([]),
      canViewReports ? groupedByDay(Report, "createdAt", from) : Promise.resolve([]),
      groupedByDay(UserInteraction, "createdAt", from),
      canViewContent ? groupedByDay(UserInteraction, "createdAt", from, { event: { $in: ["post_view", "reel_start", "story_open", "post_impression", "reel_impression"] } }) : Promise.resolve([]),
      UserInteraction.aggregate([{ $match: { createdAt: { $gte: from }, user: { $exists: true } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, users: { $addToSet: "$user" } } }, { $project: { _id: 1, count: { $size: "$users" } } }]),
      canViewFinancial ? Transaction.aggregate([{ $match: { createdAt: { $gte: from }, status: "completed", kind: "ad_payment", currency: "RWF" } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: "$amount" } } }]) : Promise.resolve([]),
      canViewPoints ? Transaction.aggregate([{ $match: { createdAt: { $gte: from }, status: "completed", kind: { $in: ["gift", "fee"] } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, amount: { $sum: { $abs: "$amount" } } } }]) : Promise.resolve([]),
    ]);
    const index = (rows: any[]) => new Map(rows.map((row) => [row._id, Number(row.count ?? row.amount ?? 0)]));
    const maps = { users: index(users), posts: index(posts), stories: index(stories), comments: index(comments), reports: index(reports), interactions: index(interactions), views: index(views), activeUsers: index(activeUsers), revenueRwf: index(revenue), pointsActivity: index(points) };
    const series = Array.from({ length: days }, (_, i) => {
      const date = new Date(from.getTime() + i * DAY_MS).toISOString().slice(0, 10);
      return {
        date,
        ...(canViewAccounts ? { newUsers: maps.users.get(date) || 0 } : {}),
        ...(canViewContent ? { posts: maps.posts.get(date) || 0, stories: maps.stories.get(date) || 0, comments: maps.comments.get(date) || 0, contentViews: maps.views.get(date) || 0 } : {}),
        ...(canViewReports ? { reports: maps.reports.get(date) || 0 } : {}),
        interactions: maps.interactions.get(date) || 0,
        activeUsers: maps.activeUsers.get(date) || 0,
        ...(canViewFinancial ? { adRevenueRwf: maps.revenueRwf.get(date) || 0 } : {}),
        ...(canViewPoints ? { pointsActivity: maps.pointsActivity.get(date) || 0 } : {}),
      };
    });
    const sum = (key: keyof typeof maps) => Array.from(maps[key].values()).reduce((total, value) => total + value, 0);
    const active30d = await UserInteraction.distinct("user", { createdAt: { $gte: new Date(now.getTime() - 30 * DAY_MS) }, user: { $exists: true } });
    const totals: Record<string, number> = { interactions: sum("interactions"), activeUsers30d: active30d.length };
    if (canViewAccounts) totals.newUsers = sum("users");
    if (canViewContent) { totals.newPosts = sum("posts"); totals.newStories = sum("stories"); totals.newComments = sum("comments"); totals.contentViews = sum("views"); }
    if (canViewReports) totals.reports = sum("reports");
    const definitions: Record<string, string> = { activeUsers: "Distinct users with at least one recorded content interaction that day; not app sessions.", contentViews: "Recorded post/reel/story viewing interaction events; this is not an estimated reach metric." };
    if (canViewFinancial) {
      totals.adRevenueRwf = sum("revenueRwf");
      definitions.adRevenueRwf = "Completed ad_payment transactions recorded in RWF, not total wallet deposits or gross platform turnover.";
    }
    if (canViewPoints) {
      totals.pointsActivity = sum("pointsActivity");
      definitions.pointsActivity = "Completed gift and fee ledger transactions in points; not cash revenue.";
    }
    return res.json({ range: { days, from: from.toISOString(), to: now.toISOString() }, series, totals, definitions });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load analytics", details: error.message });
  }
});

router.get("/creators", authenticateStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const permissions = new Set(req.staffUser!.permissions || []);
    const canViewCreatorAnalytics = permissions.has("creator.analytics.view");
    const sort = String(req.query.sort || "followers");
    if (!permissions.has("creators.view") && !canViewCreatorAnalytics) return res.status(403).json({ error: "Forbidden: insufficient permissions", requiredPermission: "creators.view" });
    if (sort === "views" && !canViewCreatorAnalytics) return res.status(403).json({ error: "Creator performance metrics require creator.analytics.view", requiredPermission: "creator.analytics.view" });
    const q = cleanQuery(req.query.q, 80);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 25));
    const query: any = { isCreator: true, role: "user" };
    if (q) { const regex = safeRegex(q); query.$or = [{ username: regex }, { name: regex }]; }
    const sortBy = sort === "newest" ? { createdAt: -1 as const } : sort === "posts" ? { postsCount: -1 as const } : { followersCount: -1 as const };
    const [baseCreators, total] = await Promise.all([User.find(query).select("name username avatarUrl avatarHue verified status followersCount followingCount postsCount createdAt").sort(sortBy).skip((page - 1) * limit).limit(limit).lean(), User.countDocuments(query)]);
    const creatorIds = baseCreators.map((creator) => creator._id);
    const since30d = new Date(Date.now() - 30 * DAY_MS);
    const metrics = canViewCreatorAnalytics && creatorIds.length ? await UserInteraction.aggregate([
      { $match: { creatorId: { $in: creatorIds }, createdAt: { $gte: since30d }, user: { $exists: true } } },
      { $group: {
        _id: "$creatorId",
        views30d: { $sum: { $cond: [{ $in: ["$event", ["post_view", "post_impression", "reel_start", "reel_impression", "story_open", "story_impression"]] }, 1, 0] } },
        interactions30d: { $sum: { $cond: [{ $in: ["$event", ["post_like", "post_comment", "post_share", "post_save", "reel_like", "reel_comment", "reel_share", "reel_save", "story_reply", "story_reaction", "story_share", "user_follow"]] }, 1, 0] } },
        audience: { $addToSet: "$user" },
      } },
      { $project: { views30d: 1, interactions30d: 1, uniqueAudience30d: { $size: "$audience" } } },
    ]) : [];
    const metricByCreator = new Map(metrics.map((metric: any) => [String(metric._id), metric]));
    let creators = baseCreators.map((creator) => ({ ...creator, ...(canViewCreatorAnalytics ? (metricByCreator.get(String(creator._id)) || { views30d: 0, interactions30d: 0, uniqueAudience30d: 0 }) : {}) }));
    if (sort === "views") creators = creators.sort((a: any, b: any) => Number(b.views30d) - Number(a.views30d));
    return res.json({ creators, page, total, pages: Math.ceil(total / limit), ...(canViewCreatorAnalytics ? { metricsWindowDays: 30, metricsBasis: "Tracked interactions where creatorId was recorded; results are partial when clients omit creator attribution." } : {}) });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load creators", details: error.message }); }
});

router.get("/users", authenticateStaff, requirePermission("users.intelligence.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = cleanQuery(req.query.q, 80);
    const page = Math.min(Math.max(Number(req.query.page) || 1, 1), 10000);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
    const status = cleanQuery(req.query.status, 20);
    const filter: any = { role: "user" };
    if (["active", "limited", "suspended", "banned", "review"].includes(status)) filter.status = status;
    if (req.query.verified === "true") filter.verified = true;
    if (req.query.verified === "false") filter.verified = false;
    if (req.query.creator === "true") filter.isCreator = true;
    if (q) { const regex = safeRegex(q); filter.$or = [{ username: regex }, { name: regex }, { email: regex }]; }
    const [users, total] = await Promise.all([
      User.find(filter).select(SAFE_USER_FIELDS).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    return res.json({ users, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load user directory", details: error.message }); }
});

router.get("/users/:id", authenticateStaff, requirePermission("users.intelligence.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid user ID" });
    const user = await User.findById(req.params.id).select(SAFE_USER_FIELDS).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    const since = new Date(Date.now() - 90 * DAY_MS);
    const [posts, reports, interactions, actions] = await Promise.all([
      Post.find({ author: user._id }).sort({ createdAt: -1 }).limit(12).select("kind body status likesCount commentsCount viewsCount createdAt").lean(),
      Report.find({ target: user._id }).sort({ createdAt: -1 }).limit(20).select("reason severity status actionNote createdAt actionedAt").lean(),
      UserInteraction.find({ user: user._id, createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(30).select("event targetKind watchPercentage createdAt").lean(),
      AuditLog.find({ targetUser: user._id }).sort({ createdAt: -1 }).limit(20).select("action meta createdAt actor").populate("actor", "name username role").lean(),
    ]);
    return res.json({ user, posts, reports, interactions, administrativeHistory: actions });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load user intelligence", details: error.message }); }
});

router.get("/trending", authenticateStaff, requirePermission("trending.view"), async (_req, res: Response) => {
  try {
    const tags = await Hashtag.find({}).sort({ trend: -1, postsCount: -1 }).limit(30).select("tag postsCount trend category updatedAt").lean();
    return res.json({ tags, refreshedAt: new Date().toISOString() });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load trending topics", details: error.message }); }
});

router.get("/risk", authenticateStaff, requirePermission("security.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const since = new Date(Date.now() - 7 * DAY_MS);
    const permissions = new Set(req.staffUser!.permissions || []);
    const canViewPayments = permissions.has("payments.view") && permissions.has("analytics.revenue");
    const [reportedUsers, severeRecords, failedJobs, failedPayments] = await Promise.all([
      Report.aggregate([{ $match: { createdAt: { $gte: since }, status: { $in: ["pending", "escalated"] } } }, { $group: { _id: "$target", reports: { $sum: "$reportsCount" }, openReports: { $sum: 1 }, severe: { $sum: { $cond: [{ $eq: ["$severity", "high"] }, 1, 0] } } } }, { $match: { $or: [{ reports: { $gte: 3 } }, { severe: { $gte: 2 } }] } }, { $sort: { reports: -1 } }, { $limit: 25 }, { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } }, { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }, { $project: { reports: 1, openReports: 1, severe: 1, username: "$user.username", name: "$user.name", status: "$user.status" } }]),
      ModerationRecord.find({ createdAt: { $gte: since }, severity: { $in: ["high", "critical"] }, status: { $in: ["pending_review", "failed"] } }).sort({ severity: -1, createdAt: -1 }).limit(30).select("contentType contentId severity status criticalEscalation error createdAt").populate("author", "name username").lean(),
      ModerationJob.find({ status: "failed", updatedAt: { $gte: since } }).sort({ updatedAt: -1 }).limit(20).select("kind contentType status attempts lastError updatedAt").lean(),
      canViewPayments ? Transaction.countDocuments({ status: "failed", updatedAt: { $gte: since } }) : Promise.resolve(undefined),
    ]);
    const signals = [
      ...reportedUsers.map((r: any) => ({ id: `user:${r._id}`, category: "repeated_reports", severity: r.severe >= 2 ? "high" : "medium", title: `Repeated reports for @${r.username || "unknown"}`, summary: `${r.openReports} open reports (${r.reports} report submissions) in the last 7 days. This is an investigation signal, not a finding of guilt.`, targetId: String(r._id), createdAt: since })),
      ...severeRecords.map((r: any) => ({ id: `moderation:${r._id}`, category: "content_safety", severity: r.severity, title: `${r.contentType} has a ${r.severity} moderation signal`, summary: r.error || `Moderation status: ${r.status}${r.criticalEscalation ? " · critical escalation" : ""}`, targetId: String(r._id), createdAt: r.createdAt, actor: r.author })),
      ...failedJobs.map((job: any) => ({ id: `job:${job._id}`, category: "moderation_pipeline", severity: "medium", title: `Failed ${job.kind} moderation job`, summary: job.lastError || `Job failed after ${job.attempts} attempts`, targetId: String(job._id), createdAt: job.updatedAt })),
    ];
    return res.json({ signals: signals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), ...(canViewPayments ? { failedPayments } : {}), windowDays: 7, note: "Signals are rule-based review prompts. They are not automated findings and should not trigger penalties without human review." });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load risk signals", details: error.message }); }
});

router.get("/health", authenticateStaff, requirePermission("system.health.view"), async (_req, res: Response) => {
  try {
    const state = connection.readyState;
    const memory = process.memoryUsage();
    const mod = moderationSummary();
    return res.json({
      api: { status: "online", uptimeSeconds: Math.floor(process.uptime()), nodeVersion: process.version, environment: process.env.NODE_ENV || "development" },
      database: { status: state === 1 ? "connected" : state === 2 ? "connecting" : state === 3 ? "disconnecting" : "disconnected", readyState: state, name: connection.name || "unknown" },
      runtime: { memoryRssMb: Math.round(memory.rss / 1024 / 1024), heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024), heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024) },
      moderation: mod,
      checkedAt: new Date().toISOString(),
      limitations: ["This endpoint reports the current API process and MongoDB connection. It does not perform external provider transactions or inspect hosting-provider dashboards.", "Memory and uptime values are for this process instance only."],
    });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load system health", details: error.message }); }
});

router.get("/moderation-content", authenticateStaff, requirePermission("moderation.content.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const type = String(req.query.type || "all");
    const status = String(req.query.status || "pending_review");
    const allowedTypes = ["all", "post", "story", "comment", "live_title", "live_chat", "avatar", "media", "video"];
    const allowedStatuses = ["pending_review", "failed", "rejected", "approved", "processing"];
    if (!allowedTypes.includes(type) || !allowedStatuses.includes(status)) return res.status(400).json({ error: "Invalid moderation filter" });
    const filter: any = { status };
    if (type !== "all") filter.contentType = type;
    const records = await ModerationRecord.find(filter).sort({ criticalEscalation: -1, severity: -1, createdAt: -1 }).limit(100).populate("author", "name username avatarUrl avatarHue").lean();
    const enriched = await Promise.all(records.map(async (record: any) => {
      let content = null;
      if (record.contentType === "post") content = await Post.findById(record.contentId).select("kind body mediaUrl thumbnailUrl status createdAt").lean();
      if (record.contentType === "story") content = await Story.findById(record.contentId).select("mediaUrl mediaType caption expiresAt createdAt").lean();
      if (record.contentType === "comment") content = await Comment.findById(record.contentId).select("body hidden createdAt").lean();
      return { ...record, content };
    }));
    return res.json({ records: enriched, filters: { type, status } });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load content review queue", details: error.message }); }
});

router.get("/investigations", authenticateStaff, requirePermission("moderation.investigations.view"), async (_req, res: Response) => {
  try {
    const since = new Date(Date.now() - 30 * DAY_MS);
    const investigations = await Report.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $in: ["pending", "escalated", "resolved"] } } },
      { $group: { _id: "$target", reportSubmissions: { $sum: "$reportsCount" }, reportCases: { $sum: 1 }, highSeverityCases: { $sum: { $cond: [{ $eq: ["$severity", "high"] }, 1, 0] } }, pendingCases: { $sum: { $cond: [{ $in: ["$status", ["pending", "escalated"]] }, 1, 0] } }, lastReportedAt: { $max: "$createdAt" } } },
      { $sort: { reportSubmissions: -1, lastReportedAt: -1 } }, { $limit: 50 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } }, { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { reportSubmissions: 1, reportCases: 1, highSeverityCases: 1, pendingCases: 1, lastReportedAt: 1, name: "$user.name", username: "$user.username", status: "$user.status", isCreator: "$user.isCreator", strikes: "$user.strikes" } },
    ]);
    return res.json({ investigations, windowDays: 30 });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load user investigations", details: error.message }); }
});

router.get("/enforcement", authenticateStaff, requirePermission("moderation.enforcement.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query: any = { action: /moderation|accounts\.(suspend|ban|reinstate)|content\.(remove|restore)/i };
    const canViewTeam = new Set(req.staffUser!.permissions || []).has("audit.viewAll");
    if (!canViewTeam) query.actor = req.staffUser!.userId;
    const entries = await AuditLog.find(query).sort({ createdAt: -1 }).limit(100).populate("actor", "name username role").populate("targetUser", "name username status").lean();
    return res.json({ entries, scope: canViewTeam ? "team" : "own" });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load enforcement history", details: error.message }); }
});

router.get("/performance", authenticateStaff, requirePermission("moderation.stats.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const since = new Date(Date.now() - 30 * DAY_MS);
    const actor = req.staffUser!.userId;
    const [actions, reviewedReports, reviewedAssessments, recent] = await Promise.all([
      AuditLog.find({ actor, createdAt: { $gte: since } }).select("action createdAt").lean(),
      Report.countDocuments({ actionedBy: actor, actionedAt: { $gte: since } }),
      ModerationRecord.countDocuments({ reviewedBy: actor, reviewedAt: { $gte: since } }),
      AuditLog.find({ actor }).sort({ createdAt: -1 }).limit(25).select("action targetId meta createdAt").lean(),
    ]);
    const byAction: Record<string, number> = {};
    for (const action of actions) byAction[action.action] = (byAction[action.action] || 0) + 1;
    return res.json({ totalActions: actions.length, reviewedReports, reviewedAssessments, byAction, recent, windowDays: 30, qualityNote: "Volume is an activity measure only. Use appeals, reopened cases and peer review to assess decision quality; do not rank staff by closure count alone." });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load personal performance", details: error.message }); }
});

router.get("/approvals", authenticateStaff, requirePermission("approvals.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const permissions = new Set(req.staffUser!.permissions || []);
    const [verification, appeals, reports, moderation, support] = await Promise.all([
      permissions.has("verification.view") ? VerificationRequest.find({ status: "pending" }).sort({ createdAt: 1 }).limit(30).populate("user", "name username avatarUrl isCreator followersCount").lean() : Promise.resolve([]),
      permissions.has("moderation.appeals.view") ? (await import("../../../../models/Appeal")).Appeal.find({ status: "pending" }).sort({ submittedAt: 1 }).limit(30).populate("user", "name username").lean() : Promise.resolve([]),
      permissions.has("moderation.queue.view") ? Report.countDocuments({ status: { $in: ["pending", "escalated"] } }) : Promise.resolve(0),
      permissions.has("moderation.content.view") ? ModerationRecord.countDocuments({ status: "pending_review" }) : Promise.resolve(0),
      permissions.has("support.view") ? SupportTicket.countDocuments({ status: { $in: ["open", "in_progress"] } }) : Promise.resolve(0),
    ]);
    return res.json({ verification, appeals, counts: { verification: verification.length, appeals: appeals.length, reports, moderation, support } });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load approval center", details: error.message }); }
});

router.get("/support", authenticateStaff, requirePermission("support.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = cleanQuery(req.query.status, 30);
    const q = cleanQuery(req.query.q, 80);
    const filter: any = {};
    if (["open", "in_progress", "waiting_user", "resolved", "closed"].includes(status)) filter.status = status;
    if (req.staffUser!.role === "moderator") filter.assignedTo = req.staffUser!.userId;
    if (q) {
      const regex = safeRegex(q);
      const users = await User.find({ $or: [{ username: regex }, { name: regex }] }).select("_id").limit(100).lean();
      filter.$or = [{ subject: regex }, { message: regex }, { user: { $in: users.map((u) => u._id) } }];
    }
    const [tickets, staffCandidates] = await Promise.all([
      SupportTicket.find(filter).sort({ priority: -1, updatedAt: -1 }).limit(100).populate("user", "name username email").populate("assignedTo", "name username role").lean(),
      User.find({ role: { $in: ["admin", "superadmin", "moderator"] }, status: "active" }).select("name username role staffPermissions").sort({ role: 1, name: 1 }).lean(),
    ]);
    const staff = staffCandidates.filter((member) => member.role !== "user" && getEffectiveStaffPermissions(member.role as Exclude<UserRole, "user">, member.staffPermissions).has("support.manage")).map(({ _id, name, username, role }) => ({ _id, name, username, role }));
    return res.json({ tickets, staff });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load support tickets", details: error.message }); }
});

router.patch("/support/:id", authenticateStaff, requirePermission("support.manage"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ticket ID" });
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    const { status, priority, assignedTo, reply, staffNote } = req.body || {};
    if (status !== undefined) {
      if (!["open", "in_progress", "waiting_user", "resolved", "closed"].includes(status)) return res.status(400).json({ error: "Invalid ticket status" });
      ticket.status = status;
      ticket.resolvedAt = status === "resolved" || status === "closed" ? new Date() : undefined;
    }
    if (priority !== undefined) {
      if (!["low", "normal", "high", "urgent"].includes(priority)) return res.status(400).json({ error: "Invalid priority" });
      ticket.priority = priority;
    }
    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === "") ticket.assignedTo = undefined;
      else {
        const assignee = await User.findById(assignedTo).select("role status staffPermissions");
        const assigneePermissions = assignee && assignee.role !== "user" ? getEffectiveStaffPermissions(assignee.role, assignee.staffPermissions) : new Set();
        if (!assignee || assignee.status !== "active" || !assigneePermissions.has("support.manage")) return res.status(400).json({ error: "Assignee must be active staff with support-management permission" });
        ticket.assignedTo = assignee._id;
      }
    }
    if (typeof reply === "string" && reply.trim()) ticket.messages.push({ sender: new Types.ObjectId(req.staffUser!.userId), senderRole: req.staffUser!.role, body: reply.trim().slice(0, 4000), createdAt: new Date() } as any);
    if (typeof staffNote === "string") ticket.staffNote = staffNote.trim().slice(0, 2000);
    await ticket.save();
    await logAudit({ actor: req.staffUser!.userId, actorUsername: req.staffUser!.username, action: "support.ticket.updated", targetUser: String(ticket.user), targetId: String(ticket._id), meta: { status: ticket.status, priority: ticket.priority } });
    if (typeof reply === "string" && reply.trim()) await notify({ recipient: String(ticket.user), kind: "system", text: `The Gihanga Updates support team replied to ticket: ${ticket.subject}` });
    return res.json({ ticket });
  } catch (error: any) { return res.status(500).json({ error: "Failed to update support ticket", details: error.message }); }
});

router.get("/announcements", authenticateStaff, requirePermission("announcements.view"), async (_req, res: Response) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 }).limit(100).populate("createdBy", "name username role").populate("publishedBy", "name username role").lean();
    return res.json({ announcements });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load announcements", details: error.message }); }
});

router.post("/announcements", authenticateStaff, requirePermission("announcements.create"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const title = cleanQuery(req.body?.title, 120);
    const message = cleanQuery(req.body?.message, 1000);
    if (title.length < 3 || message.length < 5) return res.status(400).json({ error: "A title and message are required" });
    const announcement = await Announcement.create({ title, message, createdBy: req.staffUser!.userId, status: "draft" });
    await logAudit({ actor: req.staffUser!.userId, actorUsername: req.staffUser!.username, action: "announcement.draft.created", targetId: String(announcement._id), meta: { title } });
    return res.status(201).json({ announcement });
  } catch (error: any) { return res.status(500).json({ error: "Failed to create announcement", details: error.message }); }
});

router.post("/announcements/:id/publish", authenticateStaff, requirePermission("announcements.publish"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid announcement ID" });
    const announcement = await Announcement.findOneAndUpdate({ _id: req.params.id, status: "draft" }, { $set: { status: "publishing", publishedBy: req.staffUser!.userId, publishedAt: new Date() } }, { new: true });
    if (!announcement) return res.status(409).json({ error: "Announcement is not an available draft" });
    let delivered = 0;
    let recipientCount = 0;
    const batchSize = 400;
    const cursor = User.find({ role: "user", status: "active" }).select("_id").lean().cursor();
    let batch: Array<{ _id: Types.ObjectId }> = [];
    const flushBatch = async () => {
      if (!batch.length) return;
      const operations = batch.map((user) => ({ updateOne: { filter: { recipient: user._id, announcementId: announcement._id }, update: { $setOnInsert: { recipient: user._id, announcementId: announcement._id, kind: "system", actor: req.staffUser!.userId, text: `${announcement.title}: ${announcement.message}`, read: false } }, upsert: true } }));
      const result = await Notification.bulkWrite(operations, { ordered: false });
      delivered += result.upsertedCount;
      batch = [];
    };
    try {
      for await (const recipient of cursor) {
        batch.push(recipient as { _id: Types.ObjectId });
        recipientCount += 1;
        if (batch.length >= batchSize) await flushBatch();
      }
      await flushBatch();
      announcement.status = "published";
      announcement.recipientsCount = recipientCount;
      await announcement.save();
      await logAudit({ actor: req.staffUser!.userId, actorUsername: req.staffUser!.username, action: "announcement.published", targetId: String(announcement._id), meta: { recipients: recipientCount } });
      return res.json({ announcement, recipients: recipientCount, newNotifications: delivered });
    } catch (error) {
      announcement.status = "draft";
      announcement.publishedBy = undefined;
      announcement.publishedAt = undefined;
      await announcement.save();
      throw error;
    }
  } catch (error: any) { return res.status(500).json({ error: "Failed to publish announcement", details: error.message }); }
});

router.get("/verification", authenticateStaff, requirePermission("verification.view"), async (req, res: Response) => {
  try {
    const status = cleanQuery(req.query.status, 20);
    const filter = ["pending", "approved", "rejected"].includes(status) ? { status } : {};
    const requests = await VerificationRequest.find(filter).sort({ status: 1, createdAt: -1 }).limit(100).populate("user", "name username email avatarUrl isCreator verified followersCount").populate("reviewedBy", "name username role").lean();
    return res.json({ requests });
  } catch (error: any) { return res.status(500).json({ error: "Failed to load verification requests", details: error.message }); }
});

router.post("/verification/:id/decision", authenticateStaff, requirePermission("verification.review"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid request ID" });
    const action = String(req.body?.action || "");
    const note = cleanQuery(req.body?.note, 1000);
    if (!["approve", "reject"].includes(action)) return res.status(400).json({ error: "Action must be approve or reject" });
    if (action === "reject" && note.length < 5) return res.status(400).json({ error: "A decision note of at least 5 characters is required when rejecting verification" });
    const request = await VerificationRequest.findOne({ _id: req.params.id, status: "pending" });
    if (!request) return res.status(404).json({ error: "Pending verification request not found" });
    request.status = action === "approve" ? "approved" : "rejected";
    request.decisionNote = note || undefined;
    request.reviewedBy = new Types.ObjectId(req.staffUser!.userId);
    request.reviewedAt = new Date();
    await request.save();
    if (action === "approve") await User.findByIdAndUpdate(request.user, { verified: true });
    await logAudit({ actor: req.staffUser!.userId, actorUsername: req.staffUser!.username, action: `verification.${action}`, targetUser: String(request.user), targetId: String(request._id), meta: { note } });
    await notify({ recipient: String(request.user), kind: "system", text: action === "approve" ? "Your Gihanga Updates verification request was approved." : `Your verification request was not approved${note ? `: ${note}` : "."}` });
    return res.json({ request });
  } catch (error: any) { return res.status(500).json({ error: "Failed to review verification request", details: error.message }); }
});

export default router;
