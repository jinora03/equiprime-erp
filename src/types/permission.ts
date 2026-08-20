/** A permission key is always `<module>:<action>`, e.g. "users:view". */
export type PermissionKey = string;

export type PermissionActionId =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "manage"
  | "act";

export interface PermissionAction {
  key: PermissionKey;
  action: PermissionActionId | string;
  label: string;
}

export interface PermissionModule {
  module: string;
  label: string;
  group: string;
  actions: PermissionAction[];
}

export interface PermissionMatrixEntry {
  role_id: number;
  role: string;
  permissions: PermissionKey[];
}

export interface PermissionMatrix {
  modules: PermissionModule[];
  roles: PermissionMatrixEntry[];
}
