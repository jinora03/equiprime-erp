import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { roleService } from "@/services/role.service";
import type { RoleInput } from "@/types";

export function useRoles(search?: string) {
  return useQuery({
    queryKey: queryKeys.roles.list(search),
    queryFn: () => roleService.list(search),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RoleInput) => roleService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.roles.all }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<RoleInput> }) =>
      roleService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.roles.all }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.roles.all }),
  });
}
