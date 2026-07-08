export type UserStatus = "active" | "inactive" | "invited" | "suspended";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  department: string;
  role: string;
  status: UserStatus;
  avatar?: string | null;
  phone?: string | null;
  job_title?: string | null;
  last_login?: string | null;
  created_at?: string | null;
}

export interface UserCreateInput {
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  role: string;
  status: UserStatus;
  phone?: string;
  job_title?: string;
}

export type UserUpdateInput = Partial<UserCreateInput>;

export interface UserFilters {
  search?: string;
  status?: UserStatus | "all";
  department?: string;
  role?: string;
  page?: number;
  page_size?: number;
}
