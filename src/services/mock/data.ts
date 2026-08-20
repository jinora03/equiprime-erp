import {
  WILDCARD,
  buildCatalog,
  permissionKeysFor,
  viewKeys,
  ALL_MODULE_IDS,
} from "@/constants/modules";
import type {
  Department,
  PermissionMatrix,
  Role,
  User,
} from "@/types";

/**
 * In-browser seed data. Mirrors the FastAPI backend
 * (`app/repositories/mock_data.py`) so the app runs fully standalone in mock
 * mode and behaves identically when pointed at the real API.
 */

const NOW = new Date("2026-07-01T09:00:00Z").getTime();
const DAY = 86_400_000;

const iso = (daysAgo: number | null): string | null =>
  daysAgo === null ? null : new Date(NOW - daysAgo * DAY).toISOString();

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;

// --------------------------------------------------------------------------- //
// Departments
// --------------------------------------------------------------------------- //
const DEPARTMENT_SEED: Array<[string, string, string, string, string]> = [
  ["Accounting", "ACC", "Financial records, AP/AR, and reporting.", "Maria Santos", "#1E40AF"],
  ["HR", "HR", "Recruitment, employee relations, and benefits.", "Liza Reyes", "#7C3AED"],
  ["Inventory", "INV", "Stock control and parts management.", "Ramon Cruz", "#0891B2"],
  ["Warehouse", "WH", "Storage, receiving, and dispatch.", "Andres Lim", "#0D9488"],
  ["Purchasing", "PUR", "Procurement and supplier management.", "Grace Tan", "#CA8A04"],
  ["Sales", "SAL", "Equipment sales and client accounts.", "Paolo Mendoza", "#EA580C"],
  ["Service", "SRV", "Field service and repairs.", "Carlos Aquino", "#DC2626"],
  ["Technician", "TECH", "On-site equipment technicians.", "Jun Bautista", "#475569"],
  ["Management", "MGT", "Executive and operations leadership.", "Victor Dela Cruz", "#1E3A8A"],
  ["IT", "IT", "Systems, infrastructure, and support.", "Erika Villanueva", "#4F46E5"],
];

export const departments: Department[] = DEPARTMENT_SEED.map(
  ([name, code, description, head, color], i) => ({
    id: i + 1,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    code,
    description,
    head,
    color,
    member_count: 0, // computed by the service
  }),
);

// --------------------------------------------------------------------------- //
// Role → permission mapping (kept in sync with the backend)
// --------------------------------------------------------------------------- //
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  "Super Admin": [WILDCARD],
  Developer: [WILDCARD],
  Admin: [
    ...permissionKeysFor(
      "users",
      "departments",
      "roles",
      "permissions",
      "workflows",
      "settings",
    ),
    ...viewKeys(...ALL_MODULE_IDS),
    "settings:manage",
    "permissions:manage",
  ],
  Manager: [
    ...viewKeys("dashboard", "crm", "customers", "equipment", "sales", "reports"),
    ...permissionKeysFor("job-orders", "work-items", "projects", "maintenance"),
    "equipment:update",
  ],
  Supervisor: [
    ...viewKeys("dashboard", "equipment"),
    "job-orders:view", "job-orders:update",
    "work-items:view", "work-items:update",
    "projects:view",
    "maintenance:view", "maintenance:update",
  ],
  "HR Officer": [
    ...viewKeys("dashboard", "payroll"),
    ...permissionKeysFor("hr", "attendance"),
  ],
  Accountant: [...viewKeys("dashboard", "reports"), ...permissionKeysFor("accounting")],
  "Sales Executive": [
    ...viewKeys("dashboard"),
    "crm:view", "crm:create", "crm:update",
    "customers:view", "customers:create", "customers:update",
    "sales:view", "sales:create", "sales:update",
  ],
  Technician: [
    ...viewKeys("dashboard", "equipment"),
    "job-orders:view", "job-orders:update",
    "work-items:view", "work-items:update",
    "maintenance:view", "maintenance:update",
  ],
  "Warehouse Staff": [
    ...viewKeys("dashboard"),
    "inventory:view", "inventory:update", "warehouse:view", "warehouse:update",
  ],
  Viewer: [...viewKeys("dashboard", "reports")],
};

const ROLE_SEED: Array<[string, string, boolean]> = [
  ["Super Admin", "Full, unrestricted access to every module and setting.", true],
  ["Developer", "Engineering access mirroring Super Admin for testing and maintenance.", true],
  ["Admin", "Administers users, roles, departments, and system settings.", true],
  ["Manager", "Oversees operations, service jobs, and reporting.", false],
  ["Supervisor", "Supervises field service and job execution.", false],
  ["HR Officer", "Manages people, attendance, and payroll.", false],
  ["Accountant", "Handles accounting and financial reports.", false],
  ["Sales Executive", "Manages CRM, customers, and sales pipeline.", false],
  ["Technician", "Executes job orders and logs work items.", false],
  ["Warehouse Staff", "Manages inventory and warehouse stock.", false],
  ["Viewer", "Read-only access to dashboards and reports.", false],
];

export const roles: Role[] = ROLE_SEED.map(([name, description, is_system], i) => ({
  id: i + 1,
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  description,
  is_system,
  permissions: ROLE_PERMISSIONS[name] ?? [],
  user_count: 0, // computed by the service
}));

export function permissionsForRole(roleName: string): string[] {
  return roles.find((role) => role.name === roleName)?.permissions ?? [];
}

// --------------------------------------------------------------------------- //
// Users
// --------------------------------------------------------------------------- //
type UserSeed = [
  string, string, string, string, string, User["status"], string, number | null, string,
];

const USER_SEED: UserSeed[] = [
  ["Christian", "Cua", "admin@equiprime.ph", "Management", "Super Admin", "active", "System Administrator", 0, "main"],
  ["Victor", "Dela Cruz", "victor.delacruz@equiprime.ph", "Management", "Admin", "active", "Operations Director", 0, "main"],
  ["Maria", "Santos", "maria.santos@equiprime.ph", "Accounting", "Accountant", "active", "Chief Accountant", 1, "main"],
  ["Liza", "Reyes", "liza.reyes@equiprime.ph", "HR", "HR Officer", "active", "HR Manager", 0, "main"],
  ["Ramon", "Cruz", "ramon.cruz@equiprime.ph", "Inventory", "Warehouse Staff", "active", "Inventory Lead", 2, "main"],
  ["Andres", "Lim", "andres.lim@equiprime.ph", "Warehouse", "Warehouse Staff", "active", "Warehouse Supervisor", 3, "main"],
  ["Grace", "Tan", "grace.tan@equiprime.ph", "Purchasing", "Manager", "active", "Purchasing Manager", 1, "main"],
  ["Paolo", "Mendoza", "paolo.mendoza@equiprime.ph", "Sales", "Sales Executive", "active", "Senior Sales Executive", 0, "main"],
  ["Carlos", "Aquino", "carlos.aquino@equiprime.ph", "Service", "Supervisor", "active", "Service Supervisor", 4, "main"],
  ["Jun", "Bautista", "jun.bautista@equiprime.ph", "Technician", "Technician", "active", "Heavy Equipment Technician", 1, "main"],
  ["Erika", "Villanueva", "erika.villanueva@equiprime.ph", "IT", "Developer", "active", "Software Engineer", 0, "main"],
  ["Bianca", "Gomez", "bianca.gomez@equiprime.ph", "Sales", "Sales Executive", "active", "Sales Associate", 2, "main"],
  ["Daniel", "Flores", "daniel.flores@equiprime.ph", "Technician", "Technician", "inactive", "Field Technician", 21, "cebu"],
  ["Patricia", "Ramos", "patricia.ramos@equiprime.ph", "HR", "Viewer", "invited", "HR Assistant", null, "cebu"],
  ["Noel", "Castillo", "noel.castillo@equiprime.ph", "Accounting", "Accountant", "active", "Accounts Payable", 5, "cebu"],
  ["Sofia", "Navarro", "sofia.navarro@equiprime.ph", "Purchasing", "Viewer", "active", "Procurement Analyst", 3, "cebu"],
  ["Marco", "Domingo", "marco.domingo@equiprime.ph", "Warehouse", "Warehouse Staff", "suspended", "Stock Clerk", 40, "davao"],
  ["Angelica", "Torres", "angelica.torres@equiprime.ph", "Management", "Manager", "active", "Regional Manager", 0, "davao"],
  ["Rafael", "Mercado", "rafael.mercado@equiprime.ph", "Technician", "Technician", "active", "Senior Technician", 2, "cebu"],
  ["Camille", "Ocampo", "camille.ocampo@equiprime.ph", "IT", "Admin", "active", "IT Administrator", 1, "davao"],
  ["Dennis", "Yap", "dennis.yap@equiprime.ph", "Technician", "Technician", "active", "Field Technician", 2, "cebu"],
  ["Mina", "Lopez", "mina.lopez@equiprime.ph", "Service", "Supervisor", "active", "Service Supervisor", 1, "davao"],
  ["Joel", "Manalo", "joel.manalo@equiprime.ph", "Technician", "Technician", "active", "Heavy Equipment Technician", 3, "davao"],
  ["Lea", "Garcia", "lea.garcia@equiprime.ph", "Management", "Manager", "active", "Branch Manager", 1, "cebu"],
  ["Miguel", "Torres", "miguel.torres@equiprime.ph", "Technician", "Technician", "active", "Field Technician", 1, "main"],
  ["Niko", "Abad", "niko.abad@equiprime.ph", "Technician", "Technician", "active", "Field Technician", 2, "davao"],
];

export const users: User[] = USER_SEED.map(
  ([first, last, email, department, role, status, job_title, days, branch_id], i) => ({
    id: i + 1,
    first_name: first,
    last_name: last,
    full_name: `${first} ${last}`,
    email,
    company_id: "equiprime",
    branch_id,
    department,
    role,
    status,
    job_title,
    avatar: avatar(`${first} ${last}`),
    phone: `+63 917 ${String(100 + i).padStart(3, "0")} ${String(1000 + i * 7).padStart(4, "0")}`,
    last_login: iso(days),
    created_at: iso(120 - i * 3),
  }),
);

/** Shared demo password for every seeded account. */
export const DEMO_PASSWORD = "Password123!";

// --------------------------------------------------------------------------- //
// Permission matrix
// --------------------------------------------------------------------------- //
export function buildMatrix(): PermissionMatrix {
  return {
    modules: buildCatalog(),
    roles: roles.map((r) => ({
      role_id: r.id,
      role: r.name,
      permissions: r.permissions,
    })),
  };
}
