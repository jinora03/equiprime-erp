import { USE_MOCK } from "@/constants/app";
import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { delay, nextId } from "@/services/mock/delay";
import { departments, users } from "@/services/mock/data";
import { slugify } from "@/utils/string";
import type { Department, DepartmentInput } from "@/types";

function withCounts(dept: Department): Department {
  return {
    ...dept,
    member_count: users.filter((u) => u.department === dept.name).length,
  };
}

export const departmentService = {
  async list(search?: string): Promise<Department[]> {
    if (USE_MOCK) {
      let list = departments.map(withCounts);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.code.toLowerCase().includes(q),
        );
      }
      return delay(list);
    }
    const { data } = await apiClient.get<Department[]>(
      ENDPOINTS.departments.base,
      { params: { search } },
    );
    return data;
  },

  async create(input: DepartmentInput): Promise<Department> {
    if (USE_MOCK) {
      const dept: Department = {
        id: nextId(),
        name: input.name,
        slug: slugify(input.name),
        code: input.code,
        description: input.description ?? null,
        head: input.head ?? null,
        color: input.color ?? "#1E40AF",
        member_count: 0,
      };
      departments.push(dept);
      return delay(dept);
    }
    const { data } = await apiClient.post<Department>(
      ENDPOINTS.departments.base,
      input,
    );
    return data;
  },

  async update(id: number, input: Partial<DepartmentInput>): Promise<Department> {
    if (USE_MOCK) {
      const dept = departments.find((d) => d.id === id);
      if (!dept) throw new Error("Department not found");
      Object.assign(dept, input);
      if (input.name) dept.slug = slugify(input.name);
      return delay(withCounts(dept));
    }
    const { data } = await apiClient.patch<Department>(
      ENDPOINTS.departments.byId(id),
      input,
    );
    return data;
  },

  async remove(id: number): Promise<void> {
    if (USE_MOCK) {
      const idx = departments.findIndex((d) => d.id === id);
      if (idx >= 0) departments.splice(idx, 1);
      await delay(null);
      return;
    }
    await apiClient.delete(ENDPOINTS.departments.byId(id));
  },
};
