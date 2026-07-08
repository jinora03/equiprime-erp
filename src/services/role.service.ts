import { USE_MOCK } from "@/constants/app";
import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { delay, nextId } from "@/services/mock/delay";
import { roles, users } from "@/services/mock/data";
import { slugify } from "@/utils/string";
import type { Role, RoleInput } from "@/types";

function withCounts(role: Role): Role {
  return {
    ...role,
    user_count: users.filter((u) => u.role === role.name).length,
  };
}

export const roleService = {
  async list(search?: string): Promise<Role[]> {
    if (USE_MOCK) {
      let list = roles.map(withCounts);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((r) => r.name.toLowerCase().includes(q));
      }
      return delay(list);
    }
    const { data } = await apiClient.get<Role[]>(ENDPOINTS.roles.base, {
      params: { search },
    });
    return data;
  },

  async create(input: RoleInput): Promise<Role> {
    if (USE_MOCK) {
      const role: Role = {
        id: nextId(),
        name: input.name,
        slug: slugify(input.name),
        description: input.description ?? null,
        is_system: false,
        permissions: input.permissions,
        user_count: 0,
      };
      roles.push(role);
      return delay(role);
    }
    const { data } = await apiClient.post<Role>(ENDPOINTS.roles.base, input);
    return data;
  },

  async update(id: number, input: Partial<RoleInput>): Promise<Role> {
    if (USE_MOCK) {
      const role = roles.find((r) => r.id === id);
      if (!role) throw new Error("Role not found");
      Object.assign(role, input);
      if (input.name) role.slug = slugify(input.name);
      return delay(withCounts(role));
    }
    const { data } = await apiClient.patch<Role>(
      ENDPOINTS.roles.byId(id),
      input,
    );
    return data;
  },

  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      const role = roles.find((r) => r.id === id);
      if (role?.is_system) throw new Error("System roles cannot be deleted.");
      const idx = roles.findIndex((r) => r.id === id);
      if (idx >= 0) roles.splice(idx, 1);
      await delay(null);
      return;
    }
    await apiClient.delete(ENDPOINTS.roles.byId(id));
  },
};
