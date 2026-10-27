import { Response } from "express";
import { AuthenticatedRequest } from "./rbac";
import { verifyConsumerAccessToken } from "../lib/jwt";

/**
 * Populates req.user if a valid consumer token is present, but never blocks
 * the request.
 *
 * Tokens are accepted from two places:
 *  1. the usual `Authorization: Bearer <token>` header, and
 *  2. a `?token=<token>` query parameter.
 *
 * (2) exists because the CHECKED media delivery route
 * (/api/v1/media/file/:id) is consumed by plain <img>/<video> tags, which
 * cannot attach Authorization headers — without it an author's own still-
 * pending story media rendered as an empty box even for them.
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: () => void) {
  const header = req.headers.authorization;
  const queryToken =
    typeof req.query?.token === "string" ? (req.query.token as string) : undefined;
  const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : queryToken;

  if (token) {
    try {
      req.user = verifyConsumerAccessToken(token);
    } catch {
      // ignore — treat as anonymous
    }
  }
  next();
}
