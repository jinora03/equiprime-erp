import type { Branch, Company } from "@/types";

export const companies: Company[] = [
  { id: "equiprime", name: "Equiprime" },
];

export const branches: Branch[] = [
  {
    id: "main",
    companyId: "equiprime",
    name: "Main",
    displayName: "Equiprime — Main",
    region: "Manila HQ",
    attendanceRate: 94,
  },
  {
    id: "cebu",
    companyId: "equiprime",
    name: "Cebu",
    displayName: "Equiprime — Cebu",
    region: "Visayas Branch",
    attendanceRate: 92,
  },
  {
    id: "davao",
    companyId: "equiprime",
    name: "Davao",
    displayName: "Equiprime — Davao",
    region: "Mindanao Branch",
    attendanceRate: 91,
  },
];

export const DEFAULT_COMPANY_ID = companies[0].id;
export const DEFAULT_BRANCH_ID = branches[0].id;
