export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Equiprime ERP";
export const APP_TAGLINE = "Heavy Equipment ERP";
export const APP_VERSION = "1.0.0";
export const COMPANY_NAME = "Equiprime Optimum Solutions Inc.";

/** When true, the app serves data from the in-browser mock layer (no backend). */
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true") !== "false";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const TOKEN_STORAGE_KEY = "equiprime.auth.token";
export const THEME_STORAGE_KEY = "equiprime.theme";

/** Demo credentials surfaced on the login screen. */
export const DEMO_CREDENTIALS = {
  email: "admin@equiprime.ph",
  password: "Password123!",
};
