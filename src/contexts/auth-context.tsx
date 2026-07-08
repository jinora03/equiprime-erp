import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { LoginCredentials, PermissionKey, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  permissions: PermissionKey[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    permissions,
    status,
    token,
    setStatus,
    setSession,
    updateUser,
    clear,
  } = useAuthStore();

  const bootstrapped = useRef(false);

  // Rehydrate the session from a persisted token on first mount.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const existingToken = token;
    if (!existingToken) {
      setStatus("unauthenticated");
      return;
    }

    setStatus("loading");
    Promise.all([
      authService.getMe(existingToken),
      authService.getPermissions(existingToken),
    ])
      .then(([me, perms]) => setSession(existingToken, me, perms))
      .catch(() => clear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setStatus("loading");
      try {
        const res = await authService.login(credentials);
        const perms = await authService.getPermissions(res.access_token);
        setSession(res.access_token, res.user, perms);
        return res.user;
      } catch (error) {
        setStatus("unauthenticated");
        throw error;
      }
    },
    [setSession, setStatus],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clear();
    }
  }, [clear]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      permissions,
      isAuthenticated: status === "authenticated",
      isLoading: status === "idle" || status === "loading",
      login,
      logout,
      updateUser,
    }),
    [user, permissions, status, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
