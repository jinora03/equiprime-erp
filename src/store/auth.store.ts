import { create } from "zustand";

import { TOKEN_STORAGE_KEY } from "@/constants/app";
import type { PermissionKey, User } from "@/types";

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

interface AuthState {
  token: string | null;
  user: User | null;
  permissions: PermissionKey[];
  status: AuthStatus;

  setStatus: (status: AuthStatus) => void;
  setSession: (
    token: string,
    user: User,
    permissions: PermissionKey[],
  ) => void;
  updateUser: (patch: Partial<User>) => void;
  clear: () => void;
}

/**
 * Auth store. The token is mirrored to localStorage so the axios interceptor
 * and a page refresh can recover the session. User + permissions live in memory
 * and are rehydrated on bootstrap (see AuthProvider).
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  user: null,
  permissions: [],
  status: "idle",

  setStatus: (status) => set({ status }),

  setSession: (token, user, permissions) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    set({ token, user, permissions, status: "authenticated" });
  },

  updateUser: (patch) =>
    set((state) =>
      state.user ? { user: { ...state.user, ...patch } } : state,
    ),

  clear: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    set({
      token: null,
      user: null,
      permissions: [],
      status: "unauthenticated",
    });
  },
}));
