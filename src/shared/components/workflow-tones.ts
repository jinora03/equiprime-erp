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
    dot: "bg-blue-700 dark:bg-blue-400",
    badge: "bg-blue-700/[0.08] text-blue-800 dark:bg-blue-400/10 dark:text-blue-300",
    text: "text-blue-800 dark:text-blue-300",
  },
  amber: {
    dot: "bg-amber-700 dark:bg-amber-400",
    badge: "bg-amber-700/[0.09] text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
    text: "text-amber-800 dark:text-amber-300",
  },
  violet: {
    dot: "bg-violet-700 dark:bg-violet-400",
    badge: "bg-violet-700/[0.08] text-violet-800 dark:bg-violet-400/10 dark:text-violet-300",
    text: "text-violet-800 dark:text-violet-300",
  },
  green: {
    dot: "bg-emerald-700 dark:bg-emerald-400",
    badge: "bg-emerald-700/[0.08] text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300",
    text: "text-emerald-800 dark:text-emerald-300",
  },
  orange: {
    dot: "bg-orange-700 dark:bg-orange-400",
    badge: "bg-orange-700/[0.08] text-orange-800 dark:bg-orange-400/10 dark:text-orange-300",
    text: "text-orange-800 dark:text-orange-300",
  },
  red: {
    dot: "bg-red-700 dark:bg-red-400",
    badge: "bg-red-700/[0.08] text-red-800 dark:bg-red-400/10 dark:text-red-300",
    text: "text-red-800 dark:text-red-300",
  },
};
