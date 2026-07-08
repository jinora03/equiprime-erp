import type { PermissionKey } from "./permission";
import type { User } from "./user";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface AuthSession {
  token: string;
  user: User;
  permissions: PermissionKey[];
}
