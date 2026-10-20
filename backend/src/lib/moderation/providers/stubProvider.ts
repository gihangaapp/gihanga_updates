/**
 * Stub moderation provider — TEST/DEV ONLY.
 *
 * Enabled with CONTENT_MODERATION_PROVIDER_STUB=true AND NODE_ENV != production
 * (config.ts hard-refuses it in production, so a stray env var can never
 * weaken real moderation). Gives deterministic, scripted outcomes so the full
 * pipeline — quarantine, decisions, staff queue, appeals — can be exercised
 * end-to-end WITHOUT real credentials or network calls, and without
 * uploading any sensitive material anywhere.
 *
 * Scripting: CONTENT_MODERATION_STUB_MODE selects the behavior:
 *   approve | reject-sexual | reject-violence | review | error | critical
 */

import { CategoryAssessment, PolicyCategory } from "../types";
import { getModerationConfig } from "../config";
import {
  ModerateImageParams,
  ModerateTextParams,
  ModerationProvider,
  ProviderCallError,
  ProviderInputUnsupportedError,
} from "./types";

export type StubMode =
  | "approve"
  | "reject-sexual"
  | "reject-violence"
  | "review"
  | "error"
  | "critical";

function stubMode(): StubMode {
  const raw = (process.env.CONTENT_MODERATION_STUB_MODE || "approve") as StubMode;
  const valid: StubMode[] = ["approve", "reject-sexual", "reject-violence", "review", "error", "critical"];
  return valid.includes(raw) ? raw : "approve";
}

function scripted(mode: StubMode): CategoryAssessment[] {
  switch (mode) {
    case "reject-sexual":
      return [{ category: "sexual_content", score: 0.97, providerLabel: "stub.sexual" }];
    case "reject-violence":
      return [{ category: "graphic_violence", score: 0.93, providerLabel: "stub.violence" }];
    case "review":
      return [{ category: "suggestive_content", score: 0.72, providerLabel: "stub.racy" }];
    case "critical":
      return [{ category: "sexual_content_minors", score: 0.99, providerLabel: "stub.critical" }];
    default:
      return [];
  }
}

export const stubModerationProvider: ModerationProvider = {
  id: "stub",
  displayName: "Stub moderation provider (test/dev only)",
  capabilities: ["text", "image"],

  isConfigured() {
    return getModerationConfig().stubProviderEnabled;
  },

  async moderateText(_params: ModerateTextParams): Promise<CategoryAssessment[]> {
    if (!this.isConfigured()) {
      throw new ProviderCallError("Stub provider is disabled", { retryable: false });
    }
    const mode = stubMode();
    if (mode === "error") throw new ProviderCallError("Stub provider simulated failure");
    return scripted(mode);
  },

  async moderateImage(_params: ModerateImageParams): Promise<CategoryAssessment[]> {
    if (!this.isConfigured()) {
      throw new ProviderCallError("Stub provider is disabled", { retryable: false });
    }
    const mode = stubMode();
    if (mode === "error") throw new ProviderCallError("Stub provider simulated failure");
    return scripted(mode);
  },
};

/** Explicitly unused import guard (kept for future text-specific stubs). */
export function assertNeverText(mode: never): never {
  throw new ProviderInputUnsupportedError("unreachable");
}
