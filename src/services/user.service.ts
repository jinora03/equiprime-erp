import { USE_MOCK } from "@/constants/app";
import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { delay, nextId } from "@/services/mock/delay";
import { resolveOrganizationScope } from "@/services/mock/scope";
import { getActiveOrganizationScope } from "@/store/organization.store";
import { users } from "@/services/mock/data";
import { slugify } from "@/utils/string";
import type {
  OrganizationScope,
  Paginated,
  User,
  UserCreateInput,
  UserFilters,
  UserUpdateInput,
} from "@/types";

function applyFilters(list: User[], filters: UserFilters): User[] {
  let result = [...list];
  const { search, status, department, role } = filters;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.job_title ?? "").toLowerCase().includes(q),
    );
  }
  if (status && status !== "all") {
    result = result.filter((u) => u.status === status);
  }
  if (department) {
    result = result.filter((u) => slugify(u.department) === slugify(department));
  }
  if (role) {
    result = result.filter((u) => slugify(u.role) === slugify(role));
  }
  return result;
}

export const userService = {
  async list(
    filters: UserFilters = {},
    scope?: OrganizationScope,
  ): Promise<Paginated<User>> {
    const page = filters.page ?? 1;
    const pageSize = filters.page_size ?? 10;

    if (USE_MOCK) {
      const activeScope = resolveOrganizationScope(scope);
      const scopedUsers = users.filter(
        (user) =>
          user.company_id === activeScope.companyId &&
          user.branch_id === activeScope.branchId,
      );
      const filtered = applyFilters(scopedUsers, filters);
      const start = (page - 1) * pageSize;
      return delay({
        items: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        page_size: pageSize,
      });
    }

    const { data } = await apiClient.get<Paginated<User>>(
      ENDPOINTS.users.base,
      {
        params: {
          search: filters.search,
          status: filters.status === "all" ? undefined : filters.status,
          department: filters.department,
          role: filters.role,
          page,
          page_size: pageSize,
          company_id: scope?.companyId,
          branch_id: scope?.branchId,
        },
      },
    );
    return data;
  },

  async listMechanics(scope?: OrganizationScope): Promise<User[]> {
    const page = await userService.list(
      { status: "active", department: "Mechanic", page: 1, page_size: 100 },
      scope,
    );
    return page.items;
  },

  async get(id: number, scope?: OrganizationScope): Promise<User> {
    if (USE_MOCK) {
      const activeScope = resolveOrganizationScope(scope);
      const user = users.find(
        (u) =>
          u.id === id &&
          u.company_id === activeScope.companyId &&
          u.branch_id === activeScope.branchId,
      );
      if (!user) throw new Error("User not found");
      return delay(user, 150);
    }
    const { data } = await apiClient.get<User>(ENDPOINTS.users.byId(id));
    return data;
  },

  async create(input: UserCreateInput): Promise<User> {
    if (USE_MOCK) {
      const scope = getActiveOrganizationScope();
      const user: User = {
        id: nextId(),
        ...input,
        company_id: scope.companyId,
        branch_id: scope.branchId,
        full_name: `${input.first_name} ${input.last_name}`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          `${input.first_name} ${input.last_name}`,
        )}`,
        phone: input.phone ?? null,
        job_title: input.job_title ?? null,
        last_login: null,
        created_at: new Date().toISOString(),
      };
      users.unshift(user);
      return delay(user);
    }
    const { data } = await apiClient.post<User>(ENDPOINTS.users.base, input);
    return data;
  },

  async update(id: number, input: UserUpdateInput): Promise<User> {
    if (USE_MOCK) {
      const scope = getActiveOrganizationScope();
      const user = users.find(
        (u) =>
          u.id === id &&
          u.company_id === scope.companyId &&
          u.branch_id === scope.branchId,
      );
      if (!user) throw new Error("User not found");
      Object.assign(user, input);
      user.full_name = `${user.first_name} ${user.last_name}`;
      return delay(user);
    }
    const { data } = await apiClient.patch<User>(
      ENDPOINTS.users.byId(id),
      input,
    );
    return data;
  },

  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      const scope = getActiveOrganizationScope();
      const idx = users.findIndex(
        (u) =>
          u.id === id &&
          u.company_id === scope.companyId &&
          u.branch_id === scope.branchId,
      );
      if (idx >= 0) users.splice(idx, 1);
      await delay(null);
      return;
    }
    await apiClient.delete(ENDPOINTS.users.byId(id));
  },
};
