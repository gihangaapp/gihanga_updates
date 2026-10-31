import { User } from "../models/User";
import { Notification } from "../models/Notification";
import { getIO } from "./socket";
import { getEffectiveStaffPermissions, type Permission } from "../middleware/rbac";

type StaffAudience = "all" | "admins" | "superadmins" | "payments" | "ads" | "support" | "verification";

const AUDIENCE_ROLES: Record<StaffAudience, string[]> = {
  all: ["moderator", "admin", "superadmin"],
  payments: ["admin", "superadmin"],
  ads: ["admin", "superadmin"],
  admins: ["admin", "superadmin"],
  support: ["admin", "superadmin"],
  verification: ["admin", "superadmin"],
  superadmins: ["superadmin"],
};

const AUDIENCE_PERMISSION: Partial<Record<StaffAudience, Permission>> = {
  admins: "operations.view",
  payments: "payments.view",
  ads: "ads.view",
  support: "support.view",
  verification: "verification.view",
};

/**
 * Pushes a real-time alert to the relevant staff roles and persists it so it
 * shows up in the notification bell's history, not just as a toast that's
 * gone the moment you miss it. Staff accounts are just `User` documents with
 * an elevated role, so this reuses the same Notification model as regular
 * user notifications.
 */
export async function notifyStaff(audience: StaffAudience, text: string, meta?: Record<string, unknown>) {
  const roles = AUDIENCE_ROLES[audience];
  const candidates = await User.find({ role: { $in: roles }, status: "active" }).select("_id role staffPermissions").lean();
  const required = AUDIENCE_PERMISSION[audience];
  const staff = required
    ? candidates.filter((member) => member.role !== "user" && getEffectiveStaffPermissions(member.role, member.staffPermissions).has(required))
    : candidates;

  const io = getIO();
  const payload = { text, meta, createdAt: new Date().toISOString() };

  await Promise.all(
    staff.map(async (s) => {
      const doc = await Notification.create({ recipient: s._id, kind: "system", text });
      io?.to(`staff:${s._id}`).emit("staff:notification", { ...payload, _id: doc._id });
    }),
  );
}
