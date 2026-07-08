import type { WorkflowTone } from "@/types";

/** Tailwind class sets per workflow stage tone (used by badges + timeline). */
export const TONE: Record<
  WorkflowTone,
  { dot: string; badge: string; text: string }
> = {
  slate: {
    dot: "bg-slate-400",
    badge: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    text: "text-slate-600 dark:text-slate-300",
  },
  blue: {
    dot: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    text: "text-blue-600 dark:text-blue-300",
  },
  amber: {
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    text: "text-amber-600 dark:text-amber-300",
  },
  violet: {
    dot: "bg-violet-500",
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    text: "text-violet-600 dark:text-violet-300",
  },
  green: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    text: "text-emerald-600 dark:text-emerald-300",
  },
  orange: {
    dot: "bg-orange-500",
    badge: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
    text: "text-orange-600 dark:text-orange-300",
  },
  red: {
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-600 dark:text-red-300",
    text: "text-red-600 dark:text-red-300",
  },
};
