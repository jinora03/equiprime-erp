import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/types";

const VARIANT: Record<Priority, "destructive" | "warning" | "secondary"> = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={VARIANT[priority]}>{priority}</Badge>;
}
