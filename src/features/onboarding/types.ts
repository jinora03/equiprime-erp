import type { LucideIcon } from "lucide-react";

import type { PermissionKey } from "@/types";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  target: string;
  mobileTarget?: string;
  route?: string;
  permission?: PermissionKey;
  desktopOnly?: boolean;
}

export type OnboardingPreference = "completed" | "skipped";
