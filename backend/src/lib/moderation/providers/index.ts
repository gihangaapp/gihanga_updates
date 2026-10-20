/**
 * Provider registry — the single list of moderation providers the central
 * service consults. Adding a provider means implementing the
 * ModerationProvider interface and registering it here; no upload route
 * ever changes.
 */

import { ModerationProvider } from "./types";
import { openaiModerationProvider } from "./openaiProvider";
import { googleVisionProvider } from "./googleVisionProvider";
import { stubModerationProvider } from "./stubProvider";

export const MODERATION_PROVIDERS: ModerationProvider[] = [
  openaiModerationProvider,
  googleVisionProvider,
  stubModerationProvider,
];

export function configuredProviders(): ModerationProvider[] {
  return MODERATION_PROVIDERS.filter((p) => {
    try {
      return p.isConfigured();
    } catch {
      return false;
    }
  });
}

export function textCapableProviders(): ModerationProvider[] {
  return configuredProviders().filter((p) => p.capabilities.includes("text"));
}

export function imageCapableProviders(): ModerationProvider[] {
  return configuredProviders().filter((p) => p.capabilities.includes("image"));
}

export function anyImageProviderAcceptsBytes(): boolean {
  return imageCapableProviders().length > 0;
}
