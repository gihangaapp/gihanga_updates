import crypto from "crypto";
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, IUser } from "../../../models/User";
import { Wallet } from "../../../models/Wallet";
import { signConsumerTokens, verifyConsumerRefreshToken } from "../../../lib/jwt";
import { sendEmail } from "../../../lib/mailer";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { maybeAwardDailyLogin, maybeAwardReferral } from "../../../lib/rewards";

const router = Router();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function generateVerificationCode(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

function generateToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString("hex");
}

/** Single source of truth for the public shape of a user returned to the frontend. */
function serializeUser(user: IUser) {
  return {
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
  };
}

async function sendVerificationEmail(user: IUser, code: string) {
  const frontendUrl = process.env.FRONTEND_ORIGIN || "http://localhost:8080";
  await sendEmail({
    to: user.email,
    subject: "Verify your Gihanga Updates account",
    text: `Welcome to Gihanga Updates! Your verification code is ${code}. Enter it in the app to finish setting up your account. This code expires in 15 minutes.`,
    html: `<p>Welcome to <strong>Gihanga Updates</strong>!</p><p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p><p>If you didn\'t create an account, ignore this message.</p>`,
  });
}

async function sendPasswordResetEmail(user: IUser, token: string) {
  const frontendUrl = process.env.FRONTEND_ORIGIN || "http://localhost:8080";
  const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your Gihanga Updates password",
    text: `A password reset was requested for your Gihanga Updates account. Visit ${resetUrl} to choose a new password. If you didn\'t request this, ignore this message.`,
    html: `<p>You requested a password reset for <strong>${user.email}</strong>.</p><p><a href="${resetUrl}">Click here to reset your password</a>.</p><p>If you didn\'t request this, ignore this email.</p>`,
  });
}

// POST /api/v1/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, username, password, avatarHue, bio, isCreator, referralCode } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "Name, email, username, and password are required" });
    }

    const cleanUsername = normalizeUsername(username);
    const cleanEmail = normalizeEmail(email);

    const existingUser = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });

    if (existingUser) {
      if (existingUser.username === cleanUsername) {
        return res.status(409).json({ error: "Username is already taken" });
      }
      return res.status(409).json({ error: "Email is already registered" });
    }

    const referrer = referralCode
      ? await User.findOne({ referralCode: String(referralCode).trim().toLowerCase() })
      : null;

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();
    const emailVerifyToken = await bcrypt.hash(verificationCode, 10);
    const emailVerifyExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      avatarHue: avatarHue || 205,
      bio: bio ? bio.trim() : "",
      role: "user",
      isCreator: Boolean(isCreator),
      emailVerified: false,
      verified: false,
      emailVerifyToken,
      emailVerifyExpiry,
      interests: [],
      onboarded: false,
      referralCode: cleanUsername,
      referredBy: referrer?._id,
    });

    await Wallet.create({
      user: user._id,
      available: 0,
      pending: 0,
      lifetime: 0,
      kingdomPoints: 100,
    });

    await sendVerificationEmail(user, verificationCode).catch((err) => {
      console.error("[Mailer] Verification email failed:", err);
    });

    const tokens = signConsumerTokens(user);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    return res.status(201).json({
      message: "Account created successfully",
      user: serializeUser(user),
      tokens,
    });
  } catch (error: any) {
    // Handles the (rare) race where two registrations for the same username/email
    // land at the same time and both pass the pre-check above — the DB's unique
    // index is the real guarantee of uniqueness, this just keeps the error friendly.
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      const label = field === "username" ? "Username" : field === "email" ? "Email" : "That value";
      return res.status(409).json({ error: `${label} is already taken` });
    }
    console.error("[Consumer Auth Register Error]:", error);
    return res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

// POST /api/v1/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        error: "Staff accounts must log in via the internal system portal at /system",
        isStaffAccount: true,
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.status === "banned" || user.status === "suspended") {
      return res.status(403).json({ error: `Account is ${user.status}. Please contact support.` });
    }

    // Unverified accounts still get a token pair (same as register) so the client can
    // reach /verify and call the authenticated verify/resend endpoints — otherwise a user
    // who registered, lost their session, and comes back via login would be stuck with no
    // way to prove who they are in order to finish verifying.
    const tokens = signConsumerTokens(user);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    if (user.emailVerified) {
      await maybeAwardDailyLogin(String(user._id)).catch((err) =>
        console.error("[Rewards] Daily login bonus failed:", err),
      );
    }

    return res.json({
      message: user.emailVerified ? "Sign in successful" : "Signed in — please verify your email",
      needsVerification: !user.emailVerified,
      user: serializeUser(user),
      tokens,
    });
  } catch (error: any) {
    console.error("[Consumer Auth Login Error]:", error);
    return res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// GET /api/v1/auth/me
router.get("/me", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    return res.json({ user: serializeUser(user) });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PATCH /api/v1/auth/me
router.patch("/me", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, bio, avatarHue, interests, username, onboarded } = req.body;
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    if (username && normalizeUsername(username) !== user.username) {
      const normalized = normalizeUsername(username);
      if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
        return res.status(400).json({ error: "Username must be 3-20 characters: letters, numbers or underscores" });
      }
      const existingUser = await User.findOne({ username: normalized });
      if (existingUser) {
        return res.status(409).json({ error: "Username is already taken" });
      }
      user.username = normalized;
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatarHue !== undefined) user.avatarHue = Number(avatarHue) || user.avatarHue;
    if (Array.isArray(interests)) user.interests = interests.map((topic) => String(topic).trim()).filter(Boolean);
    if (onboarded !== undefined) user.onboarded = Boolean(onboarded);

    await user.save();

    return res.json({ user: serializeUser(user) });
  } catch (error: any) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(409).json({ error: `${field === "username" ? "Username" : "That value"} is already taken` });
    }
    return res.status(500).json({ error: "Update failed", details: error.message });
  }
});

// POST /api/v1/auth/verify-email
router.post("/verify-email", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Verification code is required" });
    }

    const user = await User.findById(req.user?.userId);
    if (!user || !user.emailVerifyToken || !user.emailVerifyExpiry) {
      return res.status(400).json({ error: "No verification request found" });
    }

    if (user.emailVerifyExpiry < new Date()) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    const valid = await bcrypt.compare(String(code).trim(), user.emailVerifyToken);
    if (!valid) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    user.emailVerified = true;
    user.verified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpiry = undefined;
    await user.save();

    await maybeAwardReferral(String(user._id)).catch((err) => console.error("[Rewards] Referral payout failed:", err));

    return res.json({ message: "Email verified successfully", user: serializeUser(user) });
  } catch (error: any) {
    return res.status(500).json({ error: "Verification failed", details: error.message });
  }
});

// POST /api/v1/auth/resend-verification
router.post("/resend-verification", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Account is already verified" });
    }

    const verificationCode = generateVerificationCode();
    user.emailVerifyToken = await bcrypt.hash(verificationCode, 10);
    user.emailVerifyExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user, verificationCode).catch((err) => {
      console.error("[Mailer] Resend verification email failed:", err);
    });

    return res.json({ message: "Verification code resent" });
  } catch (error: any) {
    return res.status(500).json({ error: "Could not resend verification code", details: error.message });
  }
});

// POST /api/v1/auth/forgot-password
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const cleanEmail = normalizeEmail(email);
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      const resetToken = generateToken(24);
      user.passwordResetToken = await bcrypt.hash(resetToken, 10);
      user.passwordResetExpiry = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      await sendPasswordResetEmail(user, resetToken).catch((err) => {
        console.error("[Mailer] Password reset email failed:", err);
      });
    }

    return res.json({ message: "If an account exists with that email, a password reset link has been sent." });
  } catch (error: any) {
    return res.status(500).json({ error: "Password reset request failed", details: error.message });
  }
});

// POST /api/v1/auth/reset-password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
      return res.status(400).json({ error: "Token, email, and password are required" });
    }

    const cleanEmail = normalizeEmail(email);
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !user.passwordResetToken || !user.passwordResetExpiry) {
      return res.status(400).json({ error: "Invalid or expired password reset request" });
    }

    if (user.passwordResetExpiry < new Date()) {
      return res.status(400).json({ error: "Password reset link has expired" });
    }

    const valid = await bcrypt.compare(String(token), user.passwordResetToken);
    if (!valid) {
      return res.status(400).json({ error: "Invalid password reset token" });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.emailVerified = true;
    user.verified = true;
    await user.save();

    return res.json({ message: "Password has been reset successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: "Reset failed", details: error.message });
  }
});

// POST /api/v1/auth/refresh
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const decoded = verifyConsumerRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const tokens = signConsumerTokens(user);
    const newRefreshHash = await bcrypt.hash(tokens.refreshToken, 10);
    user.refreshTokenHash = newRefreshHash;
    await user.save();

    return res.json({ tokens });
  } catch (error: any) {
    return res.status(401).json({ error: "Token refresh failed" });
  }
});

// POST /api/v1/auth/logout
router.post("/logout", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user.userId, { $unset: { refreshTokenHash: 1 } });
    }
    return res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: "Logout failed" });
  }
});

// GET /api/v1/auth/check-username?username=aline
router.get("/check-username", async (req: Request, res: Response) => {
  const q = req.query.username;
  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Username parameter is required" });
  }

  const clean = q.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
    return res.json({ username: clean, status: "invalid" });
  }

  const existing = await User.findOne({ username: clean });
  return res.json({
    username: clean,
    status: existing ? "taken" : "free",
  });
});

export default router;
