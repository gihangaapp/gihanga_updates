import { Router, Response } from "express";
import { User } from "../../../../models/User";
import { Post } from "../../../../models/Post";
import { Transaction } from "../../../../models/Transaction";
import { UserInteraction } from "../../../../models/UserInteraction";
import { UserSettings } from "../../../../models/UserSettings";
import { authenticateStaff, requirePermission, getEffectiveStaffPermissions, type AuthenticatedRequest } from "../../../../middleware/rbac";

const router = Router();
const DAY_MS = 24 * 60 * 60 * 1000;
const ALLOWED_RANGES = new Set([7, 30, 90]);

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function sumPoints(transactions: { amount: number }[]) {
  return transactions.reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount) || 0), 0);
}

async function retentionForCohort(days: number, returnDay: number, now: Date) {
  // Measure an equally sized, mature signup cohort so every user has had the
  // full return-day window. This is based on observed interaction events.
  const cohortTo = new Date(now.getTime() - (returnDay + 1) * DAY_MS);
  const cohortFrom = new Date(cohortTo.getTime() - days * DAY_MS);
  const [result] = await User.aggregate([
    { $match: { role: "user", createdAt: { $gte: cohortFrom, $lt: cohortTo } } },
    { $lookup: {
      from: UserInteraction.collection.name,
      let: { userId: "$_id", registeredAt: "$createdAt" },
      pipeline: [
        { $match: { $expr: { $and: [
          { $eq: ["$user", "$$userId"] },
          { $gte: ["$createdAt", { $add: ["$$registeredAt", returnDay * DAY_MS] }] },
          { $lt: ["$createdAt", { $add: ["$$registeredAt", (returnDay + 1) * DAY_MS] }] },
        ] } } },
        { $limit: 1 },
      ],
      as: "returned",
    } },
    { $group: {
      _id: null,
      cohortUsers: { $sum: 1 },
      returnedUsers: { $sum: { $cond: [{ $gt: [{ $size: "$returned" }, 0] }, 1, 0] } },
    } },
  ]);
  const cohortUsers = Number(result?.cohortUsers || 0);
  const returnedUsers = Number(result?.returnedUsers || 0);
  return {
    day: returnDay,
    cohortUsers,
    returnedUsers,
    rate: cohortUsers ? Math.round((returnedUsers / cohortUsers) * 1000) / 10 : null,
    cohortFrom: cohortFrom.toISOString(),
    cohortTo: cohortTo.toISOString(),
  };
}

// GET /api/v1/system/growth?days=7|30|90 — platform analytics for Admin/Super Admin.
router.get("/", authenticateStaff, requirePermission("analytics.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestedDays = Number(req.query.days ?? 30);
    if (!Number.isInteger(requestedDays) || !ALLOWED_RANGES.has(requestedDays)) {
      return res.status(400).json({ error: "days must be one of 7, 30, or 90" });
    }

    const permissions = getEffectiveStaffPermissions(req.staffUser!.role, req.staffUser!.permissions);
    const canViewPoints = permissions.has("rewards.view");
    const canViewAccounts = permissions.has("accounts.view");
    const canViewContent = permissions.has("content.view") || permissions.has("moderation.content.view");
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const rangeStart = new Date(todayStart.getTime() - (requestedDays - 1) * DAY_MS);
    const previousStart = new Date(rangeStart.getTime() - requestedDays * DAY_MS);
    const previousEnd = rangeStart;
    const userFilter = { role: "user" };
    const postFilter = {};
    const pointKinds = { kind: { $in: ["gift", "fee"] }, status: "completed" };

    const [
      newUsers,
      newPosts,
      pointsTransactions,
      previousUsers,
      previousPosts,
      previousPointTransactions,
      totalUsers,
      totalCreators,
      dailyEngagement,
      sessionSummary,
      deviceBreakdown,
      day1Retention,
      day7Retention,
    ] = await Promise.all([
      canViewAccounts ? User.find({ ...userFilter, createdAt: { $gte: rangeStart, $lte: now } }).select("createdAt").lean() : Promise.resolve([]),
      canViewContent ? Post.find({ ...postFilter, createdAt: { $gte: rangeStart, $lte: now } }).select("createdAt").lean() : Promise.resolve([]),
      canViewPoints ? Transaction.find({ ...pointKinds, createdAt: { $gte: rangeStart, $lte: now } }).select("createdAt amount").lean() : Promise.resolve([]),
      canViewAccounts ? User.find({ ...userFilter, createdAt: { $gte: previousStart, $lt: previousEnd } }).select("_id").lean() : Promise.resolve([]),
      canViewContent ? Post.find({ createdAt: { $gte: previousStart, $lt: previousEnd } }).select("_id").lean() : Promise.resolve([]),
      canViewPoints ? Transaction.find({ ...pointKinds, createdAt: { $gte: previousStart, $lt: previousEnd } }).select("amount").lean() : Promise.resolve([]),
      canViewAccounts ? User.countDocuments(userFilter) : Promise.resolve(0),
      canViewAccounts ? User.countDocuments({ ...userFilter, isCreator: true }) : Promise.resolve(0),
      UserInteraction.aggregate([
        { $match: { createdAt: { $gte: rangeStart, $lte: now }, user: { $exists: true } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            users: { $addToSet: "$user" },
            views: {
              $sum: {
                $cond: [
                  { $in: ["$event", ["post_view", "post_impression", "reel_start", "reel_impression", "story_open", "story_impression"]] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $project: { _id: 1, activeUsers: { $size: "$users" }, contentViews: "$views" } },
      ]),
      UserInteraction.aggregate([
        { $match: { createdAt: { $gte: rangeStart, $lte: now }, user: { $exists: true }, sessionId: { $type: "string", $ne: "" } } },
        { $group: { _id: { user: "$user", sessionId: "$sessionId" }, firstEvent: { $min: "$createdAt" }, lastEvent: { $max: "$createdAt" }, events: { $sum: 1 } } },
        { $group: { _id: null, sessions: { $sum: 1 }, multiEventSessions: { $sum: { $cond: [{ $gt: ["$events", 1] }, 1, 0] } }, averageObservedSpanMs: { $avg: { $subtract: ["$lastEvent", "$firstEvent"] } } } },
      ]),
      canViewAccounts ? UserSettings.aggregate([
        { $unwind: "$activeSessions" },
        { $group: { _id: "$activeSessions.device", sessions: { $sum: 1 } } },
        { $sort: { sessions: -1 } },
        { $limit: 8 },
      ]) : Promise.resolve([]),
      canViewAccounts ? retentionForCohort(requestedDays, 1, now) : Promise.resolve(null),
      canViewAccounts ? retentionForCohort(requestedDays, 7, now) : Promise.resolve(null),
    ]);

    const byDay = new Map<string, { newUsers: number; newPosts: number; pointsActivity: number }>();
    for (let index = requestedDays - 1; index >= 0; index -= 1) {
      const date = new Date(now.getTime() - index * DAY_MS);
      byDay.set(dayKey(date), { newUsers: 0, newPosts: 0, pointsActivity: 0 });
    }
    for (const user of newUsers) {
      const bucket = byDay.get(dayKey(new Date(user.createdAt)));
      if (bucket) bucket.newUsers += 1;
    }
    for (const post of newPosts) {
      const bucket = byDay.get(dayKey(new Date(post.createdAt)));
      if (bucket) bucket.newPosts += 1;
    }
    if (canViewPoints) {
      for (const transaction of pointsTransactions) {
        const bucket = byDay.get(dayKey(new Date(transaction.createdAt)));
        if (bucket) bucket.pointsActivity += Math.abs(Number(transaction.amount) || 0);
      }
    }
    const engagementByDay = new Map(dailyEngagement.map((row: any) => [row._id, row]));

    const pointsActivity = sumPoints(pointsTransactions);
    const previousPointsActivity = sumPoints(previousPointTransactions);
    const totals: Record<string, number> = { rangeDays: requestedDays };
    if (canViewAccounts) {
      totals.newUsers = newUsers.length;
      totals.previousNewUsers = previousUsers.length;
      totals.totalUsers = totalUsers;
      totals.totalCreators = totalCreators;
      totals.newUsers30d = newUsers.length;
    }
    if (canViewContent) {
      totals.newPosts = newPosts.length;
      totals.previousNewPosts = previousPosts.length;
      totals.newPosts30d = newPosts.length;
    }
    if (canViewPoints) {
      totals.pointsActivity = pointsActivity;
      totals.previousPointsActivity = previousPointsActivity;
      // Legacy field is points volume, never cash revenue.
      totals.revenue30d = pointsActivity;
    }

    return res.json({
      range: { days: requestedDays, from: rangeStart.toISOString(), to: now.toISOString(), previousFrom: previousStart.toISOString(), previousTo: previousEnd.toISOString() },
      series: Array.from(byDay.entries()).map(([date, metrics]) => {
        const engagement = engagementByDay.get(date) as any;
        return { date, ...(canViewAccounts ? { newUsers: metrics.newUsers } : {}), ...(canViewContent ? { newPosts: metrics.newPosts, contentViews: Number(engagement?.contentViews || 0) } : {}), ...(canViewPoints ? { pointsActivity: metrics.pointsActivity } : {}), activeUsers: Number(engagement?.activeUsers || 0) };
      }),
      totals,
      ...(canViewAccounts ? { retention: { day1: day1Retention, day7: day7Retention } } : {}),
      sessionInsights: {
        trackedSessions: Number(sessionSummary[0]?.sessions || 0),
        multiEventSessions: Number(sessionSummary[0]?.multiEventSessions || 0),
        averageObservedInteractionSpanMinutes: Math.round(Number(sessionSummary[0]?.averageObservedSpanMs || 0) / 60000 * 10) / 10,
        note: "Observed spans use first and last recorded interactions within a session ID; they can understate or overstate a full app visit and are not a complete session-duration measure.",
      },
      ...(canViewAccounts ? { deviceBreakdown: deviceBreakdown.map((row: any) => ({ device: row._id || "Unspecified device", sessions: Number(row.sessions || 0) })) } : {}),
      dataNotes: [
        "Retention is based on a user having at least one persisted interaction during the specified 24-hour return window; the signup cohort is shifted back so the window is fully observable.",
        "Device distribution comes from saved account active-session records and may not represent every visit because session capture occurs in account settings.",
        "Geographic distribution is not shown because the current session location field is not a reliable source for analytics.",
        ...(canViewAccounts ? [] : ["Registration, retention, creator-count and device breakdown metrics are hidden because this staff account does not have accounts.view."]),
        ...(canViewContent ? [] : ["Publishing and content-view metrics are hidden because this staff account does not have content-view permission."]),
        ...(canViewPoints ? [] : ["Points economy metrics are hidden because this staff account does not have the rewards.view permission."]),
      ],
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load growth data", details: error.message });
  }
});

export default router;
