import type { WorkflowTone } from "@/types";

/**
 * Workflow tone names are persisted demo data, but their rendering is mapped to
 * the shared Equiprime brand/semantic palette so stages never introduce an
 * unrelated rainbow of Tailwind colors.
 */
export const TONE: Record<
  WorkflowTone,
  { dot: string; badge: string; text: string }
> = {
  slate: {
    dot: "bg-muted-foreground/70",
    badge: "bg-muted text-muted-foreground",
    text: "text-muted-foreground",
  },
  blue: {
    dot: "bg-info",
    badge: "bg-info/10 text-info",
    text: "text-info",
  },
  amber: {
    dot: "bg-warning",
    badge: "bg-warning/10 text-warning",
    text: "text-warning",
  },
  violet: {
    dot: "bg-primary",
    badge: "bg-primary/10 text-primary",
    text: "text-primary",
  },
  green: {
    dot: "bg-success",
    badge: "bg-success/10 text-success",
    text: "text-success",
  },
  orange: {
    dot: "bg-warning",
    badge: "bg-warning/10 text-warning",
    text: "text-warning",
  },
  red: {
    dot: "bg-destructive",
    badge: "bg-destructive/10 text-destructive",
    text: "text-destructive",
  },
};
