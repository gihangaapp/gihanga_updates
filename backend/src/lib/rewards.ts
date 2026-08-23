import { Setting } from "../models/Setting";
import { User } from "../models/User";
import { applyLedgerEntry } from "./wallet";
import { notify } from "./notify";

export type RewardAction = "upload" | "like" | "follow" | "view_per_100" | "share" | "daily_login" | "referral";

export const DEFAULT_REWARD_RATES: Record<RewardAction, number> = {
  upload: 20,
  like: 1,
  follow: 5,
  view_per_100: 1,
  share: 3,
  daily_login: 5,
  referral: 100,
};

export const REWARD_RATES_KEY = "reward_rates";
export const POINTS_TO_CASH_RATE_KEY = "points_to_cash_rate";
// Default: 100 Kingdom Points = 1 unit of local currency (RWF). Admin-editable.
export const DEFAULT_POINTS_TO_CASH_RATE = 100;

export async function getRewardRates(): Promise<Record<RewardAction, number>> {
  const setting = await Setting.findOne({ key: REWARD_RATES_KEY });
  if (!setting) return { ...DEFAULT_REWARD_RATES };
  return { ...DEFAULT_REWARD_RATES, ...(setting.value as Partial<Record<RewardAction, number>>) };
}

export async function setRewardRates(rates: Partial<Record<RewardAction, number>>, updatedBy: string) {
  const current = await getRewardRates();
  const merged = { ...current, ...rates };
  await Setting.findOneAndUpdate(
    { key: REWARD_RATES_KEY },
    { key: REWARD_RATES_KEY, value: merged, category: "rewards", updatedBy },
    { upsert: true },
  );
  return merged;
}

export async function getPointsToCashRate(): Promise<number> {
  const setting = await Setting.findOne({ key: POINTS_TO_CASH_RATE_KEY });
  return typeof setting?.value === "number" ? setting.value : DEFAULT_POINTS_TO_CASH_RATE;
}

export async function setPointsToCashRate(rate: number, updatedBy: string) {
  await Setting.findOneAndUpdate(
    { key: POINTS_TO_CASH_RATE_KEY },
    { key: POINTS_TO_CASH_RATE_KEY, value: rate, category: "rewards", updatedBy },
    { upsert: true },
  );
  return rate;
}

/** Credits a user's Kingdom Points for a rewardable action. Silently no-ops if the rate is 0. */
export async function awardPoints(userId: string, action: RewardAction, label: string, multiplier = 1) {
  const rates = await getRewardRates();
  const amount = Math.round(rates[action] * multiplier);
  if (!amount) return null;

  const { wallet } = await applyLedgerEntry({
    userId,
    kind: "bonus",
    amount,
    label,
    toBalance: "kingdomPoints",
  });
  return wallet;
}

/** Called once per calendar day the first time a user authenticates. */
export async function maybeAwardDailyLogin(userId: string) {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date().toDateString();
  const lastReward = user.lastLoginRewardAt ? new Date(user.lastLoginRewardAt).toDateString() : null;
  if (lastReward === today) return;

  user.lastLoginRewardAt = new Date();
  await user.save();
  await awardPoints(userId, "daily_login", "Daily login bonus");
}

/** Called when a referred user verifies their email — pays the referrer, not the referred user. */
export async function maybeAwardReferral(newUserId: string) {
  const user = await User.findById(newUserId);
  if (!user?.referredBy) return;

  await awardPoints(String(user.referredBy), "referral", `Referral bonus — @${user.username} joined`);
  await notify({
    recipient: String(user.referredBy),
    kind: "reward",
    text: `Your referral @${user.username} joined Gihanga Updates — you earned bonus points!`,
  });
}
