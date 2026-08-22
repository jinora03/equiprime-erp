export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Equiprime ERP";
export const APP_TAGLINE = "Heavy Equipment ERP";
export const APP_VERSION = "1.0.0";
export const COMPANY_NAME = "Equiprime Optimum Solutions Inc.";

/** When true, the app serves data from the in-browser mock layer (no backend). */
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true") !== "false";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const TOKEN_STORAGE_KEY = "equiprime.auth.token";
export const THEME_STORAGE_KEY = "equiprime.theme";

/** Shared mock password for every curated demo account. */
export const DEMO_PASSWORD = "Password123!";

/**
 * Curated role-specific accounts for prototype testing. Emails are stable
 * identifiers into the mock user seed; authentication still goes through the
 * normal login flow so RBAC/session behavior is exercised exactly as a manual
 * sign-in would be.
 */
export const DEMO_ACCOUNTS = [
  {
    key: "super-admin",
    label: "Super Admin",
    email: "admin@equiprime.ph",
    description: "Full system access and administration.",
  },
  {
    key: "mechanic",
    label: "Mechanic",
    email: "jun.bautista@equiprime.ph",
    description: "Service execution and assigned work items.",
  },
  {
    key: "warehouse-manager",
    label: "Warehouse Manager",
    email: "andres.lim@equiprime.ph",
    description: "Warehouse and inventory management.",
  },
  {
    key: "hr",
    label: "HR",
    email: "liza.reyes@equiprime.ph",
    description: "HR and attendance responsibilities.",
  },
] as const;

/** Backwards-compatible default demo credentials (Super Admin). */
export const DEMO_CREDENTIALS = {
  email: DEMO_ACCOUNTS[0].email,
  password: DEMO_PASSWORD,
};
