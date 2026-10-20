/**
 * Google Cloud Vision credential-file diagnostics.
 *
 * Inspects the file referenced by GOOGLE_APPLICATION_CREDENTIALS WITHOUT ever
 * exposing its contents. The report contains a status enum and a static,
 * human-readable message only.
 *
 * SECURITY INVARIANTS:
 *  - File contents (private_key, private_key_id, client_email, tokens, parse
 *    errors that may quote the source text) are NEVER copied into the report,
 *    logs or errors. Only booleans about field PRESENCE and a path-level
 *    message leave this module.
 *  - The project_id inside the file is compared to GOOGLE_CLOUD_PROJECT_ID in
 *    memory; neither value is printed.
 *  - The configured PATH is shown (it is configuration, not a secret) so a
 *    Render Secret File filename mismatch is easy to spot.
 */

import fs from "fs";

export type VisionCredentialStatus =
  | "not_configured" // GOOGLE_APPLICATION_CREDENTIALS unset
  | "file_missing" // path does not exist (usually a Render Secret File name/path mismatch)
  | "file_unreadable" // exists but cannot be read (permissions, directory, ...)
  | "invalid_json" // not valid JSON
  | "not_service_account" // JSON but not a service-account key
  | "incomplete" // service-account key missing required fields
  | "ok"; // looks like a usable service-account key (NOT proof Google accepts it)

export interface VisionCredentialReport {
  status: VisionCredentialStatus;
  /**
   * Operator diagnostic for SERVER-SIDE LOGS ONLY. Includes the configured file
   * path (configuration, not a secret) so a Render Secret File mismatch is easy
   * to spot. Never contains file contents. Do NOT put this in API responses.
   */
  message: string;
  /**
   * Path-free variant for anything that can reach an API response (the staff
   * health summary). The existing contract is that publicSummary() never
   * exposes the credentials path.
   */
  safeMessage: string;
  /** True when the key file's project_id differs from GOOGLE_CLOUD_PROJECT_ID. */
  projectIdMismatch: boolean;
}

const CACHE_TTL_MS = 60_000;
let cache: { key: string; at: number; report: VisionCredentialReport } | null = null;

function report(
  status: VisionCredentialStatus,
  message: string,
  safeMessage: string,
  projectIdMismatch = false,
): VisionCredentialReport {
  return { status, message, safeMessage, projectIdMismatch };
}

function inspectUncached(path: string | undefined, expectedProjectId: string | undefined): VisionCredentialReport {
  if (!path) {
    const m = "GOOGLE_APPLICATION_CREDENTIALS is not set.";
    return report("not_configured", m, m);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(path, "utf8");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT" || code === "ENOTDIR") {
      return report(
        "file_missing",
        `Credential file not found at GOOGLE_APPLICATION_CREDENTIALS path "${path}". ` +
          "On Render the path must be /etc/secrets/<the exact Filename you gave the Secret File>.",
        "Credential file not found at the configured GOOGLE_APPLICATION_CREDENTIALS path. " +
          "On Render, use the Secret File mount path for the exact Filename you entered (see docs/MODERATION_SETUP.md).",
      );
    }
    return report(
      "file_unreadable",
      `Credential file at "${path}" could not be read (${code ?? "unknown error"}). Check the path points to a file the server user can read.`,
      `Credential file could not be read (${code ?? "unknown error"}). Check the path points to a file the server user can read.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Deliberately do NOT include the parser message: Node quotes a slice of the source text.
    return report(
      "invalid_json",
      `Credential file at "${path}" is not valid JSON (re-upload the original service-account key file).`,
      "Credential file is not valid JSON (re-upload the original service-account key file).",
    );
  }

  if (!parsed || typeof parsed !== "object") {
    return report(
      "not_service_account",
      `Credential file at "${path}" is not a service-account key.`,
      "Credential file is not a service-account key.",
    );
  }
  const obj = parsed as Record<string, unknown>;
  if (obj.type !== "service_account") {
    return report(
      "not_service_account",
      `Credential file at "${path}" is not a service_account key (wrong credential type).`,
      "Credential file is not a service_account key (wrong credential type).",
    );
  }
  const hasField = (k: string) => typeof obj[k] === "string" && (obj[k] as string).length > 0;
  const missing = ["client_email", "private_key", "project_id"].filter((k) => !hasField(k));
  if (missing.length > 0) {
    // Field NAMES only — never values.
    return report(
      "incomplete",
      `Credential file at "${path}" is missing required field(s): ${missing.join(", ")}.`,
      `Credential file is missing required field(s): ${missing.join(", ")}.`,
    );
  }

  const mismatch =
    Boolean(expectedProjectId) && String(obj.project_id).trim() !== String(expectedProjectId).trim();
  const okMessage = mismatch
    ? "Credential file looks valid, but its project_id does not match GOOGLE_CLOUD_PROJECT_ID."
    : "Credential file looks like a valid service-account key.";
  return report("ok", okMessage, okMessage, mismatch);
}

export function inspectVisionCredentials(opts: { force?: boolean } = {}): VisionCredentialReport {
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() || undefined;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim() || undefined;
  const key = `${path ?? ""}|${projectId ?? ""}`;
  const now = Date.now();
  if (!opts.force && cache && cache.key === key && now - cache.at < CACHE_TTL_MS) {
    return cache.report;
  }
  const result = inspectUncached(path, projectId);
  cache = { key, at: now, report: result };
  return result;
}

/** Test-only: clears the memoized report. */
export function __resetVisionCredentialCache() {
  cache = null;
}
