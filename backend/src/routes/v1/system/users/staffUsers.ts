import { Router, Response } from "express";
import { User } from "../../../../models/User";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { notify } from "../../../../lib/notify";
import { applyLedgerEntry } from "../../../../lib/wallet";

const router = Router();
const STAFF_USER_FIELDS =
  "name username email role isCreator status emailVerified followersCount followingCount postsCount createdAt";

// GET /api/v1/system/users — search/list accounts
router.get("/", authenticateStaff, requirePermission("accounts.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = (req.query.q as string) || "";
    const status = req.query.status as string | undefined;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);

    const query: any = {};
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ username: regex }, { name: regex }, { email: regex }];
    }
    if (status) query.status = status;

    const [users, total] = await Promise.all([
      User.find(query).select(STAFF_USER_FIELDS).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(query),
    ]);

    return res.json({ users, page, total, hasMore: page * limit < total });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load accounts", details: error.message });
  }
});

async function logAndNotify(staffId: string, action: string, targetUserId: string, meta: Record<string, any>, message?: string) {
  await AuditLog.create({ actor: staffId, action, targetUser: targetUserId, meta });
  if (message) await notify({ recipient: targetUserId, kind: "system", text: message });
}

// POST /api/v1/system/users/:id/verify
router.post("/:id/verify", authenticateStaff, requirePermission("accounts.verify"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(String(req.params.id), { verified: true }, { new: true }).select(STAFF_USER_FIELDS);
    if (!user) return res.status(404).json({ error: "User not found" });
    await logAndNotify(req.staffUser!.userId, "accounts.verify", String(req.params.id), {}, "Your account is now verified \u2713");
    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to verify account", details: error.message });
  }
});

// POST /api/v1/system/users/:id/suspend
router.post("/:id/suspend", authenticateStaff, requirePermission("accounts.suspend"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(String(req.params.id), { status: "suspended" }, { new: true }).select(STAFF_USER_FIELDS);
    if (!user) return res.status(404).json({ error: "User not found" });
    await logAndNotify(req.staffUser!.userId, "accounts.suspend", String(req.params.id), { reason }, `Your account was suspended: ${reason || "policy violation"}`);
    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to suspend account", details: error.message });
  }
});

// POST /api/v1/system/users/:id/reinstate — clears suspended/limited back to active
router.post("/:id/reinstate", authenticateStaff, requirePermission("accounts.suspend"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(String(req.params.id), { status: "active" }, { new: true }).select(STAFF_USER_FIELDS);
    if (!user) return res.status(404).json({ error: "User not found" });
    await logAndNotify(req.staffUser!.userId, "accounts.reinstate", String(req.params.id), {}, "Your account has been reinstated");
    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to reinstate account", details: error.message });
  }
});

// POST /api/v1/system/users/:id/ban
router.post("/:id/ban", authenticateStaff, requirePermission("accounts.ban"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(String(req.params.id), { status: "banned" }, { new: true }).select(STAFF_USER_FIELDS);
    if (!user) return res.status(404).json({ error: "User not found" });
    await logAndNotify(req.staffUser!.userId, "accounts.ban", String(req.params.id), { reason }, `Your account was banned: ${reason || "policy violation"}`);
    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to ban account", details: error.message });
  }
});

// POST /api/v1/system/users/:id/make-creator
router.post("/:id/make-creator", authenticateStaff, requirePermission("accounts.makeCreator"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(String(req.params.id), { isCreator: true }, { new: true }).select(STAFF_USER_FIELDS);
    if (!user) return res.status(404).json({ error: "User not found" });
    await logAndNotify(req.staffUser!.userId, "accounts.makeCreator", String(req.params.id), {}, "Your account has been upgraded to a Creator account!");
    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update account", details: error.message });
  }
});

// POST /api/v1/system/users/:id/grant-points — admin bonus points
router.post("/:id/grant-points", authenticateStaff, requirePermission("accounts.grantPoints"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { points, reason } = req.body;
    const amount = Number(points);
    if (!amount || amount <= 0) return res.status(400).json({ error: "Enter a positive number of points" });

    const { wallet } = await applyLedgerEntry({
      userId: String(req.params.id),
      kind: "bonus",
      amount,
      label: `Admin bonus — ${reason || "goodwill grant"}`,
      toBalance: "kingdomPoints",
    });

    await logAndNotify(
      req.staffUser!.userId,
      "accounts.grantPoints",
      String(req.params.id),
      { points: amount, reason },
      `You received a ${amount}-point bonus from the Gihanga team${reason ? `: ${reason}` : ""}`,
    );

    return res.json({ wallet });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to grant points", details: error.message });
  }
});

export default router;
