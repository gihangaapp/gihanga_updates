import { User } from "../models/User";
import { Notification } from "../models/Notification";
import { getIO } from "./socket";

type StaffAudience = "all" | "payments" | "ads";

const AUDIENCE_ROLES: Record<StaffAudience, string[]> = {
  all: ["moderator", "admin", "superadmin"],
  payments: ["admin", "superadmin"],
  ads: ["admin", "superadmin"],
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
  const staff = await User.find({ role: { $in: roles } }).select("_id");

  const io = getIO();
  const payload = { text, meta, createdAt: new Date().toISOString() };

  await Promise.all(
    staff.map(async (s) => {
      const doc = await Notification.create({ recipient: s._id, kind: "system", text });
      io?.to(`staff:${s._id}`).emit("staff:notification", { ...payload, _id: doc._id });
    }),
  );
}
