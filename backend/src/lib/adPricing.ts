/**
 * adPricing.ts
 *
 * Server-side advertising pricing engine.
 *
 * IMPORTANT: This is the ONLY authoritative source of pricing.
 * The frontend MUST NOT calculate the final price.
 * At payment time the backend always recalculates from the live AdConfig.
 *
 * Pricing model:
 *   Real Money  : advertisingMinutes × rwfPerMinute  (RWF)
 *   Gihanga Points: advertisingMinutes × gpPerMinute  (GP)
 *
 * Both rates are configurable by Superadmin in real-time.
 * Once paid, the rates are frozen on the Advertisement document.
 */

import type { AdConfig } from "./adConfig";

export interface AdPriceInput {
  advertisingMinutes: number;
  campaignDurationDays: number;
}

export interface AdPriceResult {
  advertisingMinutes: number;
  campaignDurationDays: number;

  /** Total cost in RWF */
  rwfTotal: number;
  /** Per-minute rate in RWF (frozen at payment time) */
  rwfPerMinute: number;

  /** Total cost in Gihanga Points */
  gpTotal: number;
  /** Per-minute rate in GP (frozen at payment time) */
  gpPerMinute: number;

  /** Human-readable breakdown lines */
  breakdown: {
    line: string;
    value: string;
  }[];

  /** Whether points payment is available at all */
  pointsEnabled: boolean;
}

/**
 * Calculates the authoritative advertising cost for a given configuration.
 * Always call this server-side, never trust frontend prices.
 */
export function calculateAdPrice(input: AdPriceInput, config: AdConfig): AdPriceResult {
  const { advertisingMinutes, campaignDurationDays } = input;
  const rwfTotal = Math.round(advertisingMinutes * config.rwfPerMinute);
  const gpTotal = Math.round(advertisingMinutes * config.gpPerMinute);

  const breakdown = [
    { line: "Advertising minutes", value: `${advertisingMinutes} min` },
    { line: "Campaign duration", value: `${campaignDurationDays} day${campaignDurationDays !== 1 ? "s" : ""}` },
    { line: "Rate (Real Money)", value: `${config.rwfPerMinute.toLocaleString()} RWF / min` },
    { line: "Rate (Gihanga Points)", value: `${config.gpPerMinute.toLocaleString()} GP / min` },
    { line: "Total (Real Money)", value: `${rwfTotal.toLocaleString()} RWF` },
    { line: "Total (Gihanga Points)", value: `${gpTotal.toLocaleString()} GP` },
  ];

  return {
    advertisingMinutes,
    campaignDurationDays,
    rwfTotal,
    rwfPerMinute: config.rwfPerMinute,
    gpTotal,
    gpPerMinute: config.gpPerMinute,
    breakdown,
    pointsEnabled: config.pointsEnabled,
  };
}

/**
 * Validates that the requested advertising minutes are within Superadmin limits.
 */
export function validateAdMinutes(
  minutes: number,
  config: AdConfig,
): { valid: boolean; error?: string } {
  if (!Number.isFinite(minutes) || minutes < 1) {
    return { valid: false, error: "Advertising minutes must be a positive number" };
  }
  if (minutes < config.minMinutes) {
    return { valid: false, error: `Minimum advertising time is ${config.minMinutes} minute(s)` };
  }
  if (minutes > config.maxMinutes) {
    return { valid: false, error: `Maximum advertising time is ${config.maxMinutes} minute(s)` };
  }
  return { valid: true };
}

/**
 * Validates campaign duration days.
 */
export function validateCampaignDays(
  days: number,
  config: AdConfig,
): { valid: boolean; error?: string } {
  if (!Number.isFinite(days) || days < 1) {
    return { valid: false, error: "Campaign duration must be at least 1 day" };
  }
  if (days < config.minCampaignDays) {
    return { valid: false, error: `Minimum campaign duration is ${config.minCampaignDays} day(s)` };
  }
  if (days > config.maxCampaignDays) {
    return { valid: false, error: `Maximum campaign duration is ${config.maxCampaignDays} day(s)` };
  }
  return { valid: true };
}
