import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import { departmentService } from "@/services/department.service";
import type { DepartmentInput } from "@/types";

export function useDepartments(search?: string) {
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  return useQuery({
    queryKey: queryKeys.departments.list(search, scopeKey),
    queryFn: () => departmentService.list(search, scope),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DepartmentInput) => departmentService.create(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.departments.all }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<DepartmentInput> }) =>
      departmentService.update(id, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.departments.all }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentService.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.departments.all }),
  });
}
