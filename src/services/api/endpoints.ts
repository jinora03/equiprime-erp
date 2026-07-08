/** API endpoint paths (relative to the axios baseURL). */
export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    permissions: "/auth/permissions",
  },
  users: {
    base: "/users",
    byId: (id: number) => `/users/${id}`,
  },
  departments: {
    base: "/departments",
    byId: (id: number) => `/departments/${id}`,
  },
  roles: {
    base: "/roles",
    byId: (id: number) => `/roles/${id}`,
  },
  permissions: {
    catalog: "/permissions/catalog",
    matrix: "/permissions/matrix",
    matrixByRole: (roleId: number) => `/permissions/matrix/${roleId}`,
  },
} as const;
