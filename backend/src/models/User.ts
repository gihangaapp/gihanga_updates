import { Schema, model, Document, Types } from "mongoose";

export type UserRole = "user" | "moderator" | "admin" | "superadmin";
export type AccountStatus = "active" | "limited" | "suspended" | "banned" | "review";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarHue: number;
  avatarUrl?: string;
  bio: string;
  role: UserRole;
  isCreator: boolean;
  verified: boolean;
  status: AccountStatus;
  strikes: number;
  emailVerified: boolean;
  emailVerifyToken?: string;
  emailVerifyExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isLive: boolean;
  onboarded: boolean;
  interests: string[];
  mtnMomoNumber?: string;
  referredBy?: Types.ObjectId;
  referralCode?: string;
  lastLoginRewardAt?: Date;
  refreshTokenHash?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 64 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9_]{3,20}$/,
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatarHue: { type: Number, default: 205 },
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 160, default: "" },

    role: {
      type: String,
      enum: ["user", "moderator", "admin", "superadmin"],
      default: "user",
    },
    isCreator: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["active", "limited", "suspended", "banned", "review"],
      default: "active",
    },
    strikes: { type: Number, default: 0 },

    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    emailVerifyExpiry: { type: Date },

    passwordResetToken: { type: String },
    passwordResetExpiry: { type: Date },

    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },

    isLive: { type: Boolean, default: false },
    onboarded: { type: Boolean, default: false },
    interests: [{ type: String }],

    mtnMomoNumber: { type: String },
    referredBy: { type: Schema.Types.ObjectId, ref: "User" },
    referralCode: { type: String, unique: true, sparse: true },
    lastLoginRewardAt: { type: Date },

    refreshTokenHash: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

export const User = model<IUser>("User", UserSchema);
