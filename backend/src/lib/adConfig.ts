/**
 * adConfig.ts
 *
 * Centralized advertising configuration reader.
 * All values come from the Setting model (Superadmin-configurable).
 * Falls back to safe defaults if a setting has never been saved.
 *
 * KEY SETTINGS:
 *   ads_rwf_per_minute      — RWF cost per advertising minute  (default: 2000)
 *   ads_gp_per_minute       — Gihanga Points per advertising minute (default: 2000)
 *   ads_points_enabled      — whether Gihanga Points payment is available
 *   ads_min_minutes         — minimum advertising minutes per campaign
 *   ads_max_minutes         — maximum advertising minutes per campaign
 *   ads_max_video_seconds   — maximum video ad clip length in seconds
 *   ads_min_campaign_days   — minimum campaign calendar duration (days)
 *   ads_max_campaign_days   — maximum campaign calendar duration (days)
 *   ads_frequency_cap_hour  — max times same ad shown per user per hour
 */

import { Setting } from "../models/Setting";
import { Types } from "mongoose";

export interface AdConfig {
  enabled: boolean;
  pointsEnabled: boolean;

  /** RWF charged per advertising minute (Superadmin-configurable) */
  rwfPerMinute: number;

  /** Gihanga Points charged per advertising minute (Superadmin-configurable) */
  gpPerMinute: number;

  minMinutes: number;
  maxMinutes: number;
  maxVideoDurationSeconds: number;
  minCampaignDays: number;
  maxCampaignDays: number;
  frequencyCapPerHour: number;
}

// Safe defaults — used when a setting has never been configured
const DEFAULTS: AdConfig = {
  enabled: true,
  pointsEnabled: true,
  rwfPerMinute: 2000,
  gpPerMinute: 2000,
  minMinutes: 1,
  maxMinutes: 180,
  maxVideoDurationSeconds: 120,
  minCampaignDays: 1,
  maxCampaignDays: 30,
  frequencyCapPerHour: 2,
};

const SETTING_KEYS = [
  "ads_enabled",
  "ads_points_enabled",
  "ads_rwf_per_minute",
  "ads_gp_per_minute",
  "ads_min_minutes",
  "ads_max_minutes",
  "ads_max_video_seconds",
  "ads_min_campaign_days",
  "ads_max_campaign_days",
  "ads_frequency_cap_hour",
] as const;

function num(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function bool(v: unknown, fallback: boolean): boolean {
  if (v === undefined || v === null) return fallback;
  return Boolean(v);
}

/** Fetches the live advertising configuration from the database. */
export async function getAdConfig(): Promise<AdConfig> {
  const settings = await Setting.find({ key: { $in: SETTING_KEYS as unknown as string[] } });
  const map = new Map(settings.map((s) => [s.key, s.value]));

  return {
    enabled: bool(map.get("ads_enabled"), DEFAULTS.enabled),
    pointsEnabled: bool(map.get("ads_points_enabled"), DEFAULTS.pointsEnabled),
    rwfPerMinute: num(map.get("ads_rwf_per_minute"), DEFAULTS.rwfPerMinute),
    gpPerMinute: num(map.get("ads_gp_per_minute"), DEFAULTS.gpPerMinute),
    minMinutes: num(map.get("ads_min_minutes"), DEFAULTS.minMinutes),
    maxMinutes: num(map.get("ads_max_minutes"), DEFAULTS.maxMinutes),
    maxVideoDurationSeconds: num(map.get("ads_max_video_seconds"), DEFAULTS.maxVideoDurationSeconds),
    minCampaignDays: num(map.get("ads_min_campaign_days"), DEFAULTS.minCampaignDays),
    maxCampaignDays: num(map.get("ads_max_campaign_days"), DEFAULTS.maxCampaignDays),
    frequencyCapPerHour: num(map.get("ads_frequency_cap_hour"), DEFAULTS.frequencyCapPerHour),
  };
}

/** Updates one or more advertising settings. Requires the actor's userId for audit. */
export async function updateAdConfig(
  updates: Partial<{
    enabled: boolean;
    pointsEnabled: boolean;
    rwfPerMinute: number;
    gpPerMinute: number;
    minMinutes: number;
    maxMinutes: number;
    maxVideoDurationSeconds: number;
    minCampaignDays: number;
    maxCampaignDays: number;
    frequencyCapPerHour: number;
  }>,
  updatedBy: string,
): Promise<AdConfig> {
  const keyMap: Record<string, string> = {
    enabled: "ads_enabled",
    pointsEnabled: "ads_points_enabled",
    rwfPerMinute: "ads_rwf_per_minute",
    gpPerMinute: "ads_gp_per_minute",
    minMinutes: "ads_min_minutes",
    maxMinutes: "ads_max_minutes",
    maxVideoDurationSeconds: "ads_max_video_seconds",
    minCampaignDays: "ads_min_campaign_days",
    maxCampaignDays: "ads_max_campaign_days",
    frequencyCapPerHour: "ads_frequency_cap_hour",
  };

  const ops = Object.entries(updates)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ({
      updateOne: {
        filter: { key: keyMap[k] },
        update: { $set: { key: keyMap[k], value: v, category: "ads" as const, updatedBy: Types.ObjectId.isValid(updatedBy) ? new Types.ObjectId(updatedBy) : undefined } },
        upsert: true,
      },
    }));

  if (ops.length > 0) {
    await Setting.bulkWrite(ops);
  }

  return getAdConfig();
}

export { DEFAULTS as AD_CONFIG_DEFAULTS };
