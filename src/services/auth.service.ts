import { USE_MOCK } from "@/constants/app";
import { ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { delay } from "@/services/mock/delay";
import {
  DEMO_PASSWORD,
  permissionsForRole,
  users,
} from "@/services/mock/data";
import type {
  LoginCredentials,
  LoginResponse,
  PermissionKey,
  User,
} from "@/types";

const MOCK_TOKEN_PREFIX = "mock-token.";

function mockToken(userId: number) {
  return `${MOCK_TOKEN_PREFIX}${userId}`;
}

function userFromMockToken(token: string | null): User | null {
  if (!token || !token.startsWith(MOCK_TOKEN_PREFIX)) return null;
  const id = Number(token.slice(MOCK_TOKEN_PREFIX.length));
  return users.find((u) => u.id === id) ?? null;
}

export class AuthError extends Error {}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (USE_MOCK) {
      const email = credentials.email.trim().toLowerCase();
      const user = users.find((u) => u.email.toLowerCase() === email);
      if (!user || credentials.password !== DEMO_PASSWORD) {
        return delay(null, 500).then(() => {
          throw new AuthError("Invalid email or password.");
        });
      }
      if (user.status === "suspended" || user.status === "inactive") {
        return delay(null, 500).then(() => {
          throw new AuthError(
            "This account is not active. Contact your administrator.",
          );
        });
      }
      user.last_login = new Date().toISOString();
      return delay({
        access_token: mockToken(user.id),
        token_type: "bearer",
        expires_in: 60 * 60 * 8,
        user,
      });
    }

    const { data } = await apiClient.post<LoginResponse>(
      ENDPOINTS.auth.login,
      credentials,
    );
    return data;
  },

  async getMe(token: string): Promise<User> {
    if (USE_MOCK) {
      const user = userFromMockToken(token);
      if (!user) throw new AuthError("Session expired.");
      return delay(user, 150);
    }
    const { data } = await apiClient.get<User>(ENDPOINTS.auth.me);
    return data;
  },

  async getPermissions(token: string): Promise<PermissionKey[]> {
    if (USE_MOCK) {
      const user = userFromMockToken(token);
      return delay(user ? permissionsForRole(user.role) : [], 150);
    }
    const { data } = await apiClient.get<PermissionKey[]>(
      ENDPOINTS.auth.permissions,
    );
    return data;
  },

  async logout(): Promise<void> {
    if (USE_MOCK) {
      await delay(null, 100);
      return;
    }
    await apiClient.post(ENDPOINTS.auth.logout);
  },
};
