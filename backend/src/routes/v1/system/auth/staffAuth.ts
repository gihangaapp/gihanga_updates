import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, UserRole } from "../../../../models/User";
import { signStaffTokens, verifyStaffRefreshToken } from "../../../../lib/jwt";
import { authenticateStaff, AuthenticatedRequest, ROLE_PERMISSIONS } from "../../../../middleware/rbac";
import { logAudit } from "../../../../utils/auditLogger";

const router = Router();

// POST /api/v1/system/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Reject invalid credentials or non-staff accounts
    if (!user || user.role === "user") {
      return res.status(401).json({ error: "Invalid staff credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid staff credentials" });
    }

    if (user.status === "banned" || user.status === "suspended") {
      return res.status(403).json({ error: `Staff account is ${user.status}` });
    }

    const staffRole = user.role as Exclude<UserRole, "user">;
    const tokens = signStaffTokens({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: staffRole,
    });

    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    // Write to audit log
    await logAudit({
      actor: user._id,
      actorUsername: user.username,
      action: "staff.login",
      ipAddress: req.ip,
    });

    // Get permission list for frontend shell initialization
    const permissions = Array.from(ROLE_PERMISSIONS[staffRole] || []);

    return res.json({
      message: "Staff authentication successful",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarHue: user.avatarHue,
        permissions,
      },
      tokens,
    });
  } catch (error: any) {
    console.error("[Staff Auth Login Error]:", error);
    return res.status(500).json({ error: "Staff login failed", details: error.message });
  }
});

// POST /api/v1/system/auth/refresh
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const decoded = verifyStaffRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || user.role === "user" || !user.refreshTokenHash) {
      return res.status(401).json({ error: "Invalid staff session" });
    }

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const staffRole = user.role as Exclude<UserRole, "user">;
    const tokens = signStaffTokens({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: staffRole,
    });

    const newRefreshHash = await bcrypt.hash(tokens.refreshToken, 10);
    user.refreshTokenHash = newRefreshHash;
    await user.save();

    return res.json({ tokens });
  } catch (error: any) {
    return res.status(401).json({ error: "Staff token refresh failed" });
  }
});

// GET /api/v1/system/auth/me
router.get("/me", authenticateStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.staffUser) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    const user = await User.findById(req.staffUser.userId);
    if (!user || user.role === "user") {
      return res.status(404).json({ error: "Staff user not found" });
    }

    const staffRole = user.role as Exclude<UserRole, "user">;
    const permissions = Array.from(ROLE_PERMISSIONS[staffRole] || []);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarHue: user.avatarHue,
        permissions,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch staff profile" });
  }
});

export default router;
