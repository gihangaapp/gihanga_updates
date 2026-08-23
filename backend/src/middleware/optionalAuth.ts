import { Response } from "express";
import { AuthenticatedRequest } from "./rbac";
import { verifyConsumerAccessToken } from "../lib/jwt";

/** Populates req.user if a valid Bearer token is present, but never blocks the request. */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: () => void) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.user = verifyConsumerAccessToken(header.split(" ")[1]);
    } catch {
      // ignore — treat as anonymous
    }
  }
  next();
}
