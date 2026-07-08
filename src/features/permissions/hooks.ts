import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { permissionService } from "@/services/permission.service";
import type { PermissionKey } from "@/types";

export function usePermissionMatrix() {
  return useQuery({
    queryKey: queryKeys.permissions.matrix,
    queryFn: () => permissionService.getMatrix(),
  });
}

export function useUpdateRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissions,
    }: {
      roleId: number;
      permissions: PermissionKey[];
    }) => permissionService.updateRolePermissions(roleId, permissions),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.permissions.matrix });
      qc.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
  });
}
