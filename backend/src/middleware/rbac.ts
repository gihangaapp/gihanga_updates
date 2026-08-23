import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/User";
import { verifyConsumerAccessToken, verifyStaffAccessToken, ConsumerTokenPayload, StaffTokenPayload } from "../lib/jwt";

export type Permission =
  | "moderation.queue.view"
  | "moderation.queue.action"
  | "moderation.queue.escalate"
  | "moderation.rules.view"
  | "moderation.rules.edit"
  | "live.forceEnd"
  | "live.alerts.manage"
  | "audit.viewOwn"
  | "audit.viewAll"
  | "accounts.view"
  | "accounts.verify"
  | "accounts.suspend"
  | "accounts.ban"
  | "accounts.makeCreator"
  | "accounts.grantPoints"
  | "staff.promote.moderator"
  | "staff.promote.admin"
  | "staff.demote"
  | "staff.view"
  | "payments.view"
  | "payments.approve"
  | "wallet.freeze"
  | "wallet.unfreeze"
  | "ads.view"
  | "ads.approve"
  | "ads.manage"
  | "analytics.view"
  | "analytics.revenue"
  | "rewards.view"
  | "rewards.edit"
  | "settings.view"
  | "settings.featureFlags"
  | "settings.categories"
  | "settings.momo.view"
  | "settings.momo.edit"
  | "danger.walletFreeze"
  | "danger.liveEnd"
  | "danger.featureDisable";

const MODERATOR_PERMISSIONS: Set<Permission> = new Set([
  "moderation.queue.view",
  "moderation.queue.action",
  "moderation.queue.escalate",
  "moderation.rules.view",
  "live.forceEnd",
  "audit.viewOwn",
  "accounts.view",
  "ads.view",
]);

const ADMIN_PERMISSIONS: Set<Permission> = new Set([
  ...MODERATOR_PERMISSIONS,
  "moderation.rules.edit",
  "live.alerts.manage",
  "audit.viewAll",
  "accounts.verify",
  "accounts.suspend",
  "accounts.ban",
  "accounts.makeCreator",
  "accounts.grantPoints",
  "payments.view",
  "payments.approve",
  "wallet.freeze",
  "wallet.unfreeze",
  "ads.approve",
  "ads.manage",
  "analytics.view",
  "analytics.revenue",
  "rewards.view",
]);

const SUPERADMIN_PERMISSIONS: Set<Permission> = new Set([
  ...ADMIN_PERMISSIONS,
  "staff.promote.moderator",
  "staff.promote.admin",
  "staff.demote",
  "staff.view",
  "rewards.edit",
  "settings.view",
  "settings.featureFlags",
  "settings.categories",
  "settings.momo.view",
  "settings.momo.edit",
  "danger.walletFreeze",
  "danger.liveEnd",
  "danger.featureDisable",
]);

export const ROLE_PERMISSIONS: Record<Exclude<UserRole, "user">, Set<Permission>> = {
  moderator: MODERATOR_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  superadmin: SUPERADMIN_PERMISSIONS,
};

export interface AuthenticatedRequest extends Request {
  user?: ConsumerTokenPayload;
  staffUser?: StaffTokenPayload;
}

export function authenticateConsumer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1] as string;
  try {
    const decoded = verifyConsumerAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

export function authenticateStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Staff authentication required" });
  }

  const token = authHeader.split(" ")[1] as string;
  try {
    const decoded = verifyStaffAccessToken(token);
    req.staffUser = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired staff token" });
  }
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.staffUser) {
      return res.status(401).json({ error: "Staff authentication required" });
    }

    const permissions = ROLE_PERMISSIONS[req.staffUser.role];
    if (!permissions || !permissions.has(permission)) {
      return res.status(403).json({
        error: "Forbidden: insufficient permissions",
        requiredPermission: permission,
        role: req.staffUser.role,
      });
    }

    next();
  };
}
