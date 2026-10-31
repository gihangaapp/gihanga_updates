import { Router, Response } from "express";
import rateLimit from "express-rate-limit";
import { Types } from "mongoose";
import { SupportTicket } from "../../../models/SupportTicket";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { notifyStaff } from "../../../lib/staffNotify";
import { recordPlatformActivity } from "../../../services/platformActivity";

const router = Router();
const createTicketLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: "Too many support tickets submitted. Please try again later." } });
const replyLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, message: { error: "Too many ticket replies. Please try again later." } });
const CATEGORIES = ["account", "content", "creator", "payment", "technical", "safety", "other"] as const;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Users can open a support case from the app. Staff manage it in the staff console.
router.post("/", authenticateConsumer, createTicketLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subject = clean(req.body?.subject, 120);
    const message = clean(req.body?.message, 4000);
    const category = CATEGORIES.includes(req.body?.category) ? req.body.category : "other";
    if (subject.length < 4 || message.length < 10) {
      return res.status(400).json({ error: "Subject must be at least 4 characters and message at least 10 characters" });
    }
    const ticket = await SupportTicket.create({
      user: req.user!.userId,
      subject,
      message,
      category,
      status: "open",
      priority: "normal",
      messages: [{ sender: req.user!.userId, senderRole: "user", body: message, createdAt: new Date() }],
    });
    await Promise.allSettled([
      notifyStaff("support", `New support request: ${subject}`, { ticketId: String(ticket._id), category }),
      recordPlatformActivity({ type: "support.ticket.created", category: "system", summary: `A user opened a ${category} support ticket`, actor: req.user!.userId, actorRole: "user", targetUser: req.user!.userId, targetId: String(ticket._id), visibility: "admins", requiredAnyPermissions: ["support.view"] }),
    ]);
    return res.status(201).json({ ticket });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create support ticket", details: error.message });
  }
});

router.get("/mine", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user!.userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate("assignedTo", "name username role")
      .populate("messages.sender", "name username role")
      .lean();
    return res.json({ tickets });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load support tickets", details: error.message });
  }
});

router.post("/:id/reply", authenticateConsumer, replyLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ticket ID" });
    const body = clean(req.body?.message, 4000);
    if (body.length < 2) return res.status(400).json({ error: "Reply must contain at least 2 characters" });
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user!.userId });
    if (!ticket) return res.status(404).json({ error: "Support ticket not found" });
    if (ticket.status === "closed") return res.status(409).json({ error: "This ticket is closed" });
    ticket.messages.push({ sender: new Types.ObjectId(req.user!.userId), senderRole: "user", body, createdAt: new Date() } as any);
    if (ticket.status === "waiting_user") ticket.status = "in_progress";
    await ticket.save();
    await Promise.allSettled([
      notifyStaff("support", `User replied to support ticket: ${ticket.subject}`, { ticketId: String(ticket._id) }),
      recordPlatformActivity({ type: "support.ticket.replied", category: "system", summary: "A user replied to a support ticket", actor: req.user!.userId, actorRole: "user", targetId: String(ticket._id), visibility: "admins", requiredAnyPermissions: ["support.view"] }),
    ]);
    return res.json({ ticket });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to reply to support ticket", details: error.message });
  }
});

export default router;
