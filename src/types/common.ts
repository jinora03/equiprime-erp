/** Shared/utility types used across the app. */

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface QueryState {
  search?: string;
  page?: number;
  page_size?: number;
}

export type Theme = "light" | "dark" | "system";

export type ResolvedTheme = "light" | "dark";

/** Generic id-name option used for selects/filters. */
export interface Option {
  label: string;
  value: string;
}

/** Shared priority scale used by Service records. */
export type Priority = "High" | "Medium" | "Low";
