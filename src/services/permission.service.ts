import { USE_MOCK } from "@/constants/app";
import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { delay } from "@/services/mock/delay";
import { buildMatrix, roles } from "@/services/mock/data";
import type {
  PermissionKey,
  PermissionMatrix,
  PermissionMatrixEntry,
} from "@/types";

export const permissionService = {
  async getMatrix(): Promise<PermissionMatrix> {
    if (USE_MOCK) {
      return delay(buildMatrix());
    }
    const { data } = await apiClient.get<PermissionMatrix>(
      ENDPOINTS.permissions.matrix,
    );
    return data;
  },

  async updateRolePermissions(
    roleId: number,
    permissions: PermissionKey[],
  ): Promise<PermissionMatrixEntry> {
    if (USE_MOCK) {
      const role = roles.find((r) => r.id === roleId);
      if (!role) throw new Error("Role not found");
      role.permissions = permissions;
      return delay({
        role_id: role.id,
        role: role.name,
        permissions: role.permissions,
      });
    }
    const { data } = await apiClient.put<PermissionMatrixEntry>(
      ENDPOINTS.permissions.matrixByRole(roleId),
      { permissions },
    );
    return data;
  },
};
