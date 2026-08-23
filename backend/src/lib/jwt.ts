import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "../models/User";

export interface ConsumerTokenPayload {
  userId: string;
  username: string;
  email: string;
  role: "user";
  isCreator: boolean;
  type: "access" | "refresh";
}

export interface StaffTokenPayload {
  userId: string;
  username: string;
  email: string;
  role: Exclude<UserRole, "user">; // "moderator" | "admin" | "superadmin"
  type: "access" | "refresh";
}

const CONSUMER_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "gihanga_consumer_access_secret_change_in_prod_12345";
const CONSUMER_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "gihanga_consumer_refresh_secret_change_in_prod_12345";

const STAFF_ACCESS_SECRET =
  process.env.JWT_STAFF_ACCESS_SECRET || "gihanga_staff_access_secret_change_in_prod_67890";
const STAFF_REFRESH_SECRET =
  process.env.JWT_STAFF_REFRESH_SECRET || "gihanga_staff_refresh_secret_change_in_prod_67890";

export function signConsumerTokens(user: {
  _id: any;
  username: string;
  email: string;
  isCreator: boolean;
}) {
  const payload = {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    role: "user" as const,
    isCreator: user.isCreator,
  };

  const accessToken = jwt.sign(
    { ...payload, type: "access" },
    CONSUMER_ACCESS_SECRET,
    { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as any) || "15m" }
  );

  const refreshToken = jwt.sign(
    { ...payload, type: "refresh" },
    CONSUMER_REFRESH_SECRET,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || "30d" }
  );

  return { accessToken, refreshToken };
}

export function signStaffTokens(user: {
  _id: any;
  username: string;
  email: string;
  role: Exclude<UserRole, "user">;
}) {
  const payload = {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(
    { ...payload, type: "access" },
    STAFF_ACCESS_SECRET,
    { expiresIn: (process.env.JWT_STAFF_ACCESS_EXPIRES_IN as any) || "8h" }
  );

  const refreshToken = jwt.sign(
    { ...payload, type: "refresh" },
    STAFF_REFRESH_SECRET,
    { expiresIn: (process.env.JWT_STAFF_REFRESH_EXPIRES_IN as any) || "7d" }
  );

  return { accessToken, refreshToken };
}

export function verifyConsumerAccessToken(token: string): ConsumerTokenPayload {
  const decoded = jwt.verify(token, CONSUMER_ACCESS_SECRET) as ConsumerTokenPayload;
  if (decoded.type !== "access" || decoded.role !== "user") {
    throw new Error("Invalid consumer token scope");
  }
  return decoded;
}

export function verifyConsumerRefreshToken(token: string): ConsumerTokenPayload {
  const decoded = jwt.verify(token, CONSUMER_REFRESH_SECRET) as ConsumerTokenPayload;
  if (decoded.type !== "refresh" || decoded.role !== "user") {
    throw new Error("Invalid consumer refresh token scope");
  }
  return decoded;
}

export function verifyStaffAccessToken(token: string): StaffTokenPayload {
  const decoded = jwt.verify(token, STAFF_ACCESS_SECRET) as StaffTokenPayload;
  if (decoded.type !== "access" || (decoded.role as string) === "user") {
    throw new Error("Invalid staff token scope");
  }
  return decoded;
}

export function verifyStaffRefreshToken(token: string): StaffTokenPayload {
  const decoded = jwt.verify(token, STAFF_REFRESH_SECRET) as StaffTokenPayload;
  if (decoded.type !== "refresh" || (decoded.role as string) === "user") {
    throw new Error("Invalid staff refresh token scope");
  }
  return decoded;
}
