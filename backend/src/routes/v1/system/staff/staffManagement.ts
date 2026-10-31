import { Router, Response } from "express";
import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { User, UserRole } from "../../../../models/User";
import { Setting } from "../../../../models/Setting";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, ROLE_PERMISSIONS, AuthenticatedRequest } from "../../../../middleware/rbac";
import { signStaffTokens, verifyStaffAccessToken } from "../../../../lib/jwt";
import { logAudit } from "../../../../utils/auditLogger";
import { notify } from "../../../../lib/notify";

const router = Router();
const STAFF_FIELDS = "name username email role status createdAt";

// Public, non-sensitive flag used by the registration screen to show the
// one-time bootstrap form only before the first Super Admin has been created.
router.get("/setup-status", async (_req, res: Response) => {
  try {
    const [staffCount, completed] = await Promise.all([
      User.countDocuments({ role: { $in: ["moderator", "admin", "superadmin"] } }),
      Setting.exists({ key: "staff_bootstrap_completed" }),
    ]);
    return res.json({ setupAvailable: staffCount === 0 && !completed });
  } catch {
    return res.status(503).json({ error: "Unable to check staff setup status" });
  }
});

// POST /api/v1/system/staff/create
// The unauthenticated path is a one-time bootstrap for the first Super Admin.
// Once a staff account exists (or bootstrap has completed), only a signed-in
// Super Admin with staff.create may create Moderator/Admin accounts.
router.post("/create", async (req: AuthenticatedRequest, res: Response) => {
  let bootstrapLockAcquired = false;
  let bootstrap = false;
  try {
    const { name, username, email, password, role } = req.body as Record<string, unknown>;
    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string"
    ) {
      return res.status(400).json({ error: "Name, username, email, password, and role are required" });
    }

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2 || cleanName.length > 64) {
      return res.status(400).json({ error: "Name must be between 2 and 64 characters" });
    }
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      return res.status(400).json({ error: "Username must be 3–20 characters using letters, numbers, or underscores" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({ error: "Password must be at least 8 characters and at most 72 bytes" });
    }
    if (!["moderator", "admin", "superadmin"].includes(role)) {
      return res.status(400).json({ error: "Role must be Moderator, Admin, or Super Admin" });
    }

    const bootstrapCompleteKey = "staff_bootstrap_completed";
    const bootstrapLockKey = "staff_bootstrap_lock";
    const staffCount = await User.countDocuments({ role: { $in: ["moderator", "admin", "superadmin"] } });
    const bootstrapComplete = await Setting.exists({ key: bootstrapCompleteKey });

    let actor: { userId: string; username: string; role: string } | null = null;
    if (staffCount === 0 && !bootstrapComplete) {
      if (role !== "superadmin") {
        return res.status(403).json({ error: "The first staff account must be the platform Super Admin" });
      }

      // The first-run endpoint is public by necessity, so require a separate
      // high-entropy deployment secret. Without it, any visitor could claim
      // the initial Super Admin account before the owner does.
      const configuredSecret = process.env.STAFF_BOOTSTRAP_SECRET || "";
      const suppliedSecret = typeof req.body.bootstrapSecret === "string" ? req.body.bootstrapSecret : "";
      if (configuredSecret.length < 32) {
        return res.status(503).json({ error: "Initial setup is locked. Configure STAFF_BOOTSTRAP_SECRET (at least 32 characters) on the backend first." });
      }
      const expected = Buffer.from(configuredSecret, "utf8");
      const supplied = Buffer.from(suppliedSecret, "utf8");
      if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
        return res.status(403).json({ error: "The initial setup secret is incorrect" });
      }

      // A unique Setting key is used as a short-lived atomic setup lock, so two
      // simultaneous first-run requests cannot create multiple Super Admins.
      const lockCutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      await Setting.deleteOne({ key: bootstrapLockKey, "value.lockedAt": { $lt: lockCutoff } });
      try {
        await Setting.create({
          key: bootstrapLockKey,
          value: { lockedAt: new Date().toISOString() },
          description: "Temporary lock for first Super Admin bootstrap",
          category: "flags",
          editableBy: "superadmin",
        });
        bootstrapLockAcquired = true;
      } catch (lockError: any) {
        if (lockError?.code === 11000) {
          return res.status(409).json({ error: "Initial Super Admin setup is already in progress or completed" });
        }
        throw lockError;
      }

      const [staffAfterLock, completedAfterLock] = await Promise.all([
        User.countDocuments({ role: { $in: ["moderator", "admin", "superadmin"] } }),
        Setting.exists({ key: bootstrapCompleteKey }),
      ]);
      if (staffAfterLock > 0 || completedAfterLock) {
        return res.status(403).json({ error: "Staff bootstrap is already complete. Sign in with an authorized account." });
      }
      bootstrap = true;
    } else {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "A Super Admin session is required to create staff accounts" });
      }
      let decoded;
      try {
        decoded = verifyStaffAccessToken(authHeader.split(" ")[1] as string);
      } catch {
        return res.status(401).json({ error: "Invalid or expired staff token" });
      }
      const creator = await User.findById(decoded.userId).select("role status username");
      if (!creator || creator.role !== decoded.role || creator.status !== "active") {
        return res.status(401).json({ error: "Staff account is inactive or no longer authorized" });
      }
      const creatorRole = creator.role as Exclude<UserRole, "user">;
      if (!ROLE_PERMISSIONS[creatorRole]?.has("staff.create")) {
        return res.status(403).json({ error: "Only an authorized Super Admin can create staff accounts" });
      }
      if (role === "superadmin") {
        return res.status(400).json({ error: "Additional Super Admin accounts cannot be created here" });
      }
      actor = { userId: String(creator._id), username: creator.username, role: creatorRole };
      req.staffUser = { ...decoded, username: creator.username };
    }

    const existing = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    }).select("username email");
    if (existing) {
      return res.status(409).json({
        error: existing.username === cleanUsername ? "Username is already taken" : "Email is already registered",
      });
    }

    const user = await User.create({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      emailVerified: true,
      onboarded: true,
    });
    const staffRole = user.role as Exclude<typeof user.role, "user">;
    const tokens = bootstrap
      ? signStaffTokens({ _id: user._id, username: user.username, email: user.email, role: staffRole })
      : null;
    if (tokens) {
      user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
      await user.save();
    }

    await logAudit({
      actor: actor?.userId || user._id,
      actorUsername: actor?.username || user.username,
      action: bootstrap ? "staff.bootstrap" : "staff.create",
      targetUser: user._id,
      meta: { role: user.role, createdBy: actor ? `${actor.username} (${actor.role})` : "initial bootstrap" },
      ipAddress: req.ip,
    });

    if (bootstrap) {
      await Setting.create({
        key: bootstrapCompleteKey,
        value: true,
        description: "Marks the one-time initial Super Admin setup as completed",
        category: "flags",
        editableBy: "superadmin",
      });
    } else {
      await notify({ recipient: String(user._id), kind: "system", text: `You've been appointed as a ${role} on Gihanga Updates` });
    }

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isCreator: user.isCreator,
        verified: user.verified,
        emailVerified: user.emailVerified,
        avatarHue: user.avatarHue,
        avatarUrl: user.avatarUrl || null,
        bio: user.bio,
        interests: user.interests,
        onboarded: user.onboarded,
        isLive: user.isLive,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        createdAt: user.createdAt,
        permissions: Array.from(ROLE_PERMISSIONS[staffRole]),
      },
      tokens,
      bootstrap,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Email or username is already in use" });
    }
    return res.status(500).json({ error: "Failed to create staff account", details: error.message });
  } finally {
    if (bootstrapLockAcquired) {
      await Setting.deleteOne({ key: "staff_bootstrap_lock" }).catch(() => undefined);
    }
  }
});

// GET /api/v1/system/staff — every non-"user" account
router.get("/", authenticateStaff, requirePermission("staff.view"), async (_req, res: Response) => {
  try {
    const staff = await User.find({ role: { $ne: "user" } }).select(STAFF_FIELDS).sort({ role: -1, createdAt: -1 });
    return res.json({ staff });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load staff list", details: error.message });
  }
});

// POST /api/v1/system/staff/promote — assign moderator or admin to an existing account by email/username
router.post("/promote", authenticateStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { identifier, role } = req.body as { identifier: string; role: "moderator" | "admin" };
    if (!["moderator", "admin"].includes(role)) {
      return res.status(400).json({ error: "role must be moderator or admin" });
    }

    // Permission depends on the target role, per the matrix — both are superadmin-only
    // today, but kept as separate named permissions so a future relaxation (e.g. letting
    // admins promote moderators) is a one-line change in rbac.ts, not a rewrite here.
    const requiredPermission = role === "admin" ? "staff.promote.admin" : "staff.promote.moderator";
    const permissions = req.staffUser ? ROLE_PERMISSIONS[req.staffUser.role] : null;
    if (!permissions?.has(requiredPermission as any)) {
      return res.status(403).json({ error: "Forbidden: insufficient permissions", requiredPermission });
    }

    const clean = identifier.trim().toLowerCase();
    const target = await User.findOne({ $or: [{ email: clean }, { username: clean }] });
    if (!target) return res.status(404).json({ error: "No account found with that email or username" });
    if (target.role === "superadmin") return res.status(400).json({ error: "Can't change a Super Admin's role here" });

    target.role = role;
    await target.save();

    await logAudit({
      actor: req.staffUser!.userId,
      action: "staff.promote",
      targetUser: target._id,
      meta: { newRole: role },
    });
    await notify({ recipient: String(target._id), kind: "system", text: `You've been made a ${role} on Gihanga Updates` });

    return res.json({ user: { id: target._id, name: target.name, username: target.username, email: target.email, role: target.role } });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to promote account", details: error.message });
  }
});

// POST /api/v1/system/staff/:id/demote — back to a regular "user" role
router.post("/:id/demote", authenticateStaff, requirePermission("staff.demote"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: "User not found" });
    if (target.role === "superadmin") return res.status(400).json({ error: "Can't demote a Super Admin" });
    if (target.role === "user") return res.status(400).json({ error: "This account isn't staff" });

    const previousRole = target.role;
    target.role = "user";
    await target.save();

    await logAudit({
      actor: req.staffUser!.userId,
      action: "staff.demote",
      targetUser: target._id,
      meta: { previousRole },
    });
    await notify({ recipient: String(target._id), kind: "system", text: "Your staff access on Gihanga Updates has been removed" });

    return res.json({ user: { id: target._id, name: target.name, username: target.username, email: target.email, role: target.role } });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to demote account", details: error.message });
  }
});

// GET /api/v1/system/staff/activity — per-staff-member action counts, for accountability
router.get("/activity", authenticateStaff, requirePermission("audit.viewAll"), async (_req, res: Response) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const rows = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$actor", actionCount: { $sum: 1 }, lastActionAt: { $max: "$createdAt" }, actions: { $push: "$action" } } },
      { $sort: { actionCount: -1 } },
      { $limit: 50 },
    ]);

    const staffIds = rows.map((r) => r._id).filter(Boolean);
    const staffDocs = await User.find({ _id: { $in: staffIds } }).select("name username role");
    const staffMap = new Map(staffDocs.map((s) => [String(s._id), s]));

    const activity = rows
      .filter((r) => r._id && staffMap.has(String(r._id)))
      .map((r) => {
        const staff = staffMap.get(String(r._id))!;
        const breakdown: Record<string, number> = {};
        for (const a of r.actions as string[]) breakdown[a] = (breakdown[a] ?? 0) + 1;
        return {
          staffId: String(r._id),
          name: staff.name,
          username: staff.username,
          role: staff.role,
          actionCount: r.actionCount,
          lastActionAt: r.lastActionAt,
          breakdown,
        };
      });

    return res.json({ activity, since: since.toISOString() });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load staff activity", details: error.message });
  }
});

export default router;
