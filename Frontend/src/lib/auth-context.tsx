import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { restoreUserQueryCache, startUserQueryCachePersistence } from "./query-persistence";

interface AuthState {
  user: UserProfile | null;
  staffUser: UserProfile | null;
  loading: boolean;
  signInConsumer: (
    tokens: { accessToken: string; refreshToken: string },
    user: UserProfile,
  ) => void;
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
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [staffUser, setStaffUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cacheReadyUserId, setCacheReadyUserId] = useState<string | null>(null);
  const stopCachePersistence = useRef<(() => void) | null>(null);
  const authRun = useRef(0);

  useEffect(() => {
    let active = true;
    const runId = ++authRun.current;

    const readCachedProfile = (key: string): UserProfile | null => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as UserProfile;
        return parsed && typeof parsed.id === "string" ? parsed : null;
      } catch {
        return null;
      }
    };

    const validateConsumerSession = async () => {
      const consumerToken = getConsumerAccessToken();
      if (!consumerToken) return;
      try {
        const data = await api.get<{ user: UserProfile }>("/auth/me");
        if (!active || authRun.current !== runId) return;
        setUser(data.user);
        setCacheReadyUserId(data.user.id);
        localStorage.setItem("gihanga_user_profile", JSON.stringify(data.user));
      } catch {
        // A sleeping/offline backend must not discard a locally cached session.
        // The refresh path clears tokens only when the backend explicitly
        // rejects them; a remaining token means the failure was transient.
        if (!active || authRun.current !== runId) return;
        if (!getConsumerAccessToken()) {
          stopCachePersistence.current?.();
          stopCachePersistence.current = null;
          setCacheReadyUserId(null);
          setUser(null);
          localStorage.removeItem("gihanga_user_profile");
          queryClient.removeQueries({ queryKey: ["posts"] });
          queryClient.removeQueries({ queryKey: ["recommendations"] });
          queryClient.removeQueries({ queryKey: ["stories"] });
        }
      }
    };

    const validateStaffSession = async () => {
      if (!getStaffAccessToken()) return;
      try {
        const data = await api.get<{ user: UserProfile }>("/system/auth/me", true);
        if (!active || authRun.current !== runId) return;
        if (data?.user) {
          setStaffUser(data.user);
          localStorage.setItem("gihanga_staff_profile", JSON.stringify(data.user));
        }
      } catch {
        if (!active || authRun.current !== runId) return;
        if (!getStaffAccessToken()) {
          setStaffUser(null);
          localStorage.removeItem("gihanga_staff_profile");
        }
      }
    };

    async function initAuth() {
      const consumerToken = getConsumerAccessToken();
      const staffToken = getStaffAccessToken();
      const cachedConsumer = consumerToken ? readCachedProfile("gihanga_user_profile") : null;
      const cachedStaff = staffToken ? readCachedProfile("gihanga_staff_profile") : null;

      // Warm IndexedDB before mounting user-gated content. If this browser has
      // already used the account, the feed/story data can render immediately;
      // auth validation then happens quietly without holding the whole app.
      if (cachedConsumer && consumerToken) {
        try {
          await restoreUserQueryCache(
            queryClient,
            cachedConsumer.id,
            () =>
              active &&
              authRun.current === runId &&
              getConsumerAccessToken() === consumerToken,
          );
        } catch {
          // A broken browser cache is optional; continue with the live API.
        }
      }
      if (!active || authRun.current !== runId) return;

      if (cachedConsumer && consumerToken) {
        setUser(cachedConsumer);
        setCacheReadyUserId(cachedConsumer.id);
      }
      if (cachedStaff && staffToken) setStaffUser(cachedStaff);

      const hasCachedSession = Boolean(
        (consumerToken && cachedConsumer) || (staffToken && cachedStaff),
      );
      if (hasCachedSession) setLoading(false);

      // Don't make cached users wait for a cold or temporarily unreachable API.
      // Successful responses refresh the profile; explicit token rejection
      // clears it. Network errors simply leave the last-known profile in place.
      await Promise.all([validateConsumerSession(), validateStaffSession()]);

      if (active && authRun.current === runId) setLoading(false);
    }

    void initAuth();
    return () => {
      active = false;
    };
  }, [queryClient]);

  useEffect(() => {
    stopCachePersistence.current?.();
    stopCachePersistence.current = null;
    if (user?.id && cacheReadyUserId === user.id) {
      stopCachePersistence.current = startUserQueryCachePersistence(queryClient, user.id);
    }
    return () => {
      stopCachePersistence.current?.();
      stopCachePersistence.current = null;
    };
  }, [cacheReadyUserId, queryClient, user?.id]);

  const signInConsumer = (
    tokens: { accessToken: string; refreshToken: string },
    profile: UserProfile,
  ) => {
    const runId = ++authRun.current;
    setConsumerTokens(tokens.accessToken, tokens.refreshToken);
    localStorage.setItem("gihanga_user_profile", JSON.stringify(profile));
    if (user?.id !== profile.id) {
      stopCachePersistence.current?.();
      stopCachePersistence.current = null;
      queryClient.clear();
    }
    setCacheReadyUserId(null);
    setUser(profile);
    setLoading(false);
    void restoreUserQueryCache(
      queryClient,
      profile.id,
      () => authRun.current === runId && getConsumerAccessToken() === tokens.accessToken,
    ).finally(() => {
      if (authRun.current === runId && getConsumerAccessToken() === tokens.accessToken) {
        setCacheReadyUserId(profile.id);
      }
    });
  };

  const updateConsumerProfile = (profile: UserProfile) => {
    localStorage.setItem("gihanga_user_profile", JSON.stringify(profile));
    setUser(profile);
  };

  const signInStaff = (
    tokens: { accessToken: string; refreshToken: string },
    profile: UserProfile,
  ) => {
    authRun.current += 1;
    setStaffTokens(tokens.accessToken, tokens.refreshToken);
    localStorage.setItem("gihanga_staff_profile", JSON.stringify(profile));
    setStaffUser(profile);
    setLoading(false);
  };

  const signOutConsumer = () => {
    authRun.current += 1;
    stopCachePersistence.current?.();
    stopCachePersistence.current = null;
    // Keep the user-scoped IndexedDB snapshot across sign-out. It is restored
    // only after that same account authenticates again; the in-memory cache is
    // cleared here so signed-out screens cannot read the previous session.
    queryClient.clear();
    setCacheReadyUserId(null);
    setLoading(false);
    clearConsumerTokens();
    localStorage.removeItem("gihanga_user_profile");
    setUser(null);
    disconnectSocket();
  };

  const signOutStaff = () => {
    authRun.current += 1;
    clearStaffTokens();
    localStorage.removeItem("gihanga_staff_profile");
    setStaffUser(null);
    setLoading(false);
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
