import { Router, Response } from "express";
import rateLimit from "express-rate-limit";
import { VerificationRequest } from "../../../models/VerificationRequest";
import { User } from "../../../models/User";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { notifyStaff } from "../../../lib/staffNotify";
import { recordPlatformActivity } from "../../../services/platformActivity";

const router = Router();
const verificationRequestLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 3, message: { error: "Too many verification requests. Please try again tomorrow." } });
const CATEGORIES = ["creator", "public_figure", "organization", "business", "other"] as const;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safePublicLinks(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).map((item) => clean(item, 500)).filter((item) => {
    try { const url = new URL(item); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
  });
}

router.post("/request", authenticateConsumer, verificationRequestLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select("verified role isCreator status");
    if (!user || user.role !== "user" || user.status !== "active") return res.status(403).json({ error: "An active user account is required" });
    if (user.verified) return res.status(409).json({ error: "This account is already verified" });
    const statement = clean(req.body?.statement, 2000);
    const category = CATEGORIES.includes(req.body?.category) ? req.body.category : "creator";
    if (statement.length < 30) return res.status(400).json({ error: "Please provide at least 30 characters explaining why this account should be verified" });
    const existing = await VerificationRequest.findOne({ user: user._id, status: "pending" }).select("_id");
    if (existing) return res.status(409).json({ error: "You already have a verification request awaiting review" });
    const request = await VerificationRequest.create({
      user: user._id,
      category,
      statement,
      publicLinks: safePublicLinks(req.body?.publicLinks),
      status: "pending",
    });
    await Promise.allSettled([
      notifyStaff("verification", "A new account verification request is awaiting review", { requestId: String(request._id), category }),
      recordPlatformActivity({ type: "verification.request.created", category: "system", summary: "A user submitted an account verification request", actor: String(user._id), actorRole: "user", targetUser: String(user._id), targetId: String(request._id), visibility: "admins", requiredAnyPermissions: ["verification.view"] }),
    ]);
    return res.status(201).json({ request });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to submit verification request", details: error.message });
  }
});

router.get("/mine", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = await VerificationRequest.find({ user: req.user!.userId }).sort({ createdAt: -1 }).limit(20).lean();
    return res.json({ requests });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load verification requests", details: error.message });
  }
});

export default router;
