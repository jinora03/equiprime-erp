export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_system: boolean;
  permissions: string[];
  user_count: number;
}

export interface RoleInput {
  name: string;
  description?: string;
  permissions: string[];
}
