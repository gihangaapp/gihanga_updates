import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  api,
  getConsumerAccessToken,
  getStaffAccessToken,
  setConsumerTokens,
  setStaffTokens,
  clearConsumerTokens,
  clearStaffTokens,
  UserProfile,
} from "./api-client";
import { disconnectSocket, disconnectStaffSocket } from "./socket-client";

interface AuthState {
  user: UserProfile | null;
  staffUser: UserProfile | null;
  loading: boolean;
  signInConsumer: (tokens: { accessToken: string; refreshToken: string }, user: UserProfile) => void;
  signInStaff: (tokens: { accessToken: string; refreshToken: string }, user: UserProfile) => void;
  updateConsumerProfile: (user: UserProfile) => void;
  signOutConsumer: () => void;
  signOutStaff: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  staffUser: null,
  loading: true,
  signInConsumer: () => {},
  signInStaff: () => {},
  updateConsumerProfile: () => {},
  signOutConsumer: () => {},
  signOutStaff: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [staffUser, setStaffUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const consumerToken = getConsumerAccessToken();
      if (consumerToken) {
        try {
          const data = await api.get<{ user: UserProfile }>("/auth/me");
          setUser(data.user);
          localStorage.setItem("gihanga_user_profile", JSON.stringify(data.user));
        } catch {
          clearConsumerTokens();
          localStorage.removeItem("gihanga_user_profile");
        }
      }

      const staffToken = getStaffAccessToken();
      if (staffToken) {
        try {
          const savedStaff = localStorage.getItem("gihanga_staff_profile");
          if (savedStaff) {
            setStaffUser(JSON.parse(savedStaff));
          }
        } catch {
          clearStaffTokens();
        }
      }

      setLoading(false);
    }

    initAuth();
  }, []);

  const signInConsumer = (tokens: { accessToken: string; refreshToken: string }, profile: UserProfile) => {
    setConsumerTokens(tokens.accessToken, tokens.refreshToken);
    localStorage.setItem("gihanga_user_profile", JSON.stringify(profile));
    setUser(profile);
  };

  const updateConsumerProfile = (profile: UserProfile) => {
    localStorage.setItem("gihanga_user_profile", JSON.stringify(profile));
    setUser(profile);
  };

  const signInStaff = (tokens: { accessToken: string; refreshToken: string }, profile: UserProfile) => {
    setStaffTokens(tokens.accessToken, tokens.refreshToken);
    localStorage.setItem("gihanga_staff_profile", JSON.stringify(profile));
    setStaffUser(profile);
  };

  const signOutConsumer = () => {
    clearConsumerTokens();
    localStorage.removeItem("gihanga_user_profile");
    setUser(null);
    disconnectSocket();
  };

  const signOutStaff = () => {
    clearStaffTokens();
    localStorage.removeItem("gihanga_staff_profile");
    setStaffUser(null);
    disconnectStaffSocket();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        staffUser,
        loading,
        signInConsumer,
        signInStaff,
        updateConsumerProfile,
        signOutConsumer,
        signOutStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Utility Validation Helpers (re-exported for form fields)
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());

export function passwordScore(v: string) {
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return Math.min(s, 4);
}

export const strengthLabels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"] as const;

export const interestTopics: { category: string; topics: string[] }[] = [
  { category: "Creative", topics: ["Photography", "Design", "Film", "Illustration", "Writing"] },
  { category: "Culture", topics: ["Music", "Dance", "Fashion", "Art", "Comedy"] },
  { category: "Life", topics: ["Food", "Travel", "Fitness", "Wellness", "Family"] },
  { category: "Ideas", topics: ["Tech", "Business", "Creator economy", "Science", "News"] },
  { category: "Play", topics: ["Football", "Basketball", "Gaming", "Motorsport", "Outdoors"] },
];
