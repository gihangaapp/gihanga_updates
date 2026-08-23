import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import consumerAuthRoutes from "./routes/v1/auth/consumerAuth";
import staffAuthRoutes from "./routes/v1/system/auth/staffAuth";
import uploadRoutes from "./routes/v1/uploads/upload";
import postsRoutes from "./routes/v1/posts/posts";
import followRoutes from "./routes/v1/social/follow";
import likesRoutes from "./routes/v1/social/likes";
import bookmarksRoutes from "./routes/v1/social/bookmarks";
import commentsRoutes from "./routes/v1/social/comments";
import storiesRoutes from "./routes/v1/social/stories";
import notificationsRoutes from "./routes/v1/notifications/notifications";
import searchRoutes from "./routes/v1/search/search";
import usersRoutes from "./routes/v1/users/users";
import liveRoutes from "./routes/v1/live/live";
import staffLiveRoutes from "./routes/v1/system/live/staffLive";
import walletRoutes from "./routes/v1/wallet/wallet";
import blocksRoutes from "./routes/v1/social/blocks";
import adsRoutes from "./routes/v1/ads/ads";
import staffPaymentsRoutes from "./routes/v1/system/payments/staffPayments";
import staffRewardsRoutes from "./routes/v1/system/rewards/staffRewards";
import staffAdsRoutes from "./routes/v1/system/ads/staffAds";
import staffWalletRoutes from "./routes/v1/system/wallet/staffWallet";
import staffModerationRoutes from "./routes/v1/system/moderation/staffModeration";
import staffUsersRoutes from "./routes/v1/system/users/staffUsers";
import staffManagementRoutes from "./routes/v1/system/staff/staffManagement";
import staffAuditRoutes from "./routes/v1/system/audit/staffAudit";
import staffSettingsRoutes from "./routes/v1/system/settings/staffSettings";
import staffOverviewRoutes from "./routes/v1/system/overview/staffOverview";
import staffGrowthRoutes from "./routes/v1/system/growth/staffGrowth";
import staffNotificationsRoutes from "./routes/v1/system/notifications/staffNotifications";
import studioRoutes from "./routes/v1/studio/studio";

export function createApp(): Express {
  const app = express();

  // Security & Headers
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  // CORS
  app.use(
    cors({
      // Reflects whatever origin the request came from. This intentionally
      // isn't locked down to a fixed allowlist — the frontend can be opened
      // from localhost OR a LAN IP (e.g. from a phone on the same network,
      // per the dynamic API URL resolution in the frontend's api-client.ts),
      // and the exact IP varies by network. Tighten this before deploying
      // somewhere public — check the origin against your real domain(s).
      origin: (_origin, callback) => callback(null, true),
      credentials: true,
    })
  );

  // Logging
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  // Body Parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Rate Limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: "Too many requests, please try again later." },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { error: "Too many authentication attempts, please try again later." },
  });

  app.use("/api/v1/", generalLimiter);
  app.use("/api/v1/auth/login", authLimiter);
  app.use("/api/v1/auth/register", authLimiter);
  app.use("/api/v1/system/auth/login", authLimiter);

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "Gihanga Updates API", timestamp: new Date().toISOString() });
  });

  // Uploaded media (photos, videos, reels, avatars, stories)
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  // API v1 Routes
  app.use("/api/v1/auth", consumerAuthRoutes);
  app.use("/api/v1/system/auth", staffAuthRoutes);
  app.use("/api/v1/uploads", uploadRoutes);
  app.use("/api/v1/posts", postsRoutes);
  app.use("/api/v1/follow", followRoutes);
  app.use("/api/v1/likes", likesRoutes);
  app.use("/api/v1/bookmarks", bookmarksRoutes);
  app.use("/api/v1/comments", commentsRoutes);
  app.use("/api/v1/stories", storiesRoutes);
  app.use("/api/v1/notifications", notificationsRoutes);
  app.use("/api/v1/search", searchRoutes);
  app.use("/api/v1/users", usersRoutes);
  app.use("/api/v1/live", liveRoutes);
  app.use("/api/v1/system/live", staffLiveRoutes);
  app.use("/api/v1/wallet", walletRoutes);
  app.use("/api/v1/blocks", blocksRoutes);
  app.use("/api/v1/ads", adsRoutes);
  app.use("/api/v1/system/payments", staffPaymentsRoutes);
  app.use("/api/v1/system/rewards", staffRewardsRoutes);
  app.use("/api/v1/system/ads", staffAdsRoutes);
  app.use("/api/v1/system/wallet", staffWalletRoutes);
  app.use("/api/v1/system/moderation", staffModerationRoutes);
  app.use("/api/v1/system/users", staffUsersRoutes);
  app.use("/api/v1/system/staff", staffManagementRoutes);
  app.use("/api/v1/system/audit", staffAuditRoutes);
  app.use("/api/v1/system/settings", staffSettingsRoutes);
  app.use("/api/v1/system/overview", staffOverviewRoutes);
  app.use("/api/v1/system/growth", staffGrowthRoutes);
  app.use("/api/v1/system/notifications", staffNotificationsRoutes);
  app.use("/api/v1/studio", studioRoutes);

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Endpoint not found" });
  });

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[Express Error Handler]:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  });

  return app;
}
