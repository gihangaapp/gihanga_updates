/**
 * Backward compatibility wrapper re-exporting real AuthContext helpers.
 */
export {
  useAuth as useMockAuth,
  isEmail,
  passwordScore,
  strengthLabels,
  interestTopics,
} from "./auth-context";

export function checkUsername(value: string): "invalid" | "taken" | "free" {
  const v = value.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(v)) return "invalid";
  const taken = ["admin", "superadmin", "moderator", "system", "gihanga"];
  if (taken.includes(v)) return "taken";
  return "free";
}

export function patchSession(patch: Record<string, any>) {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem("gihanga_user_profile");
    if (saved) {
      const current = JSON.parse(saved);
      const updated = { ...current, ...patch };
      localStorage.setItem("gihanga_user_profile", JSON.stringify(updated));
    }
  } catch {}
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("gihanga_user_profile");
}
