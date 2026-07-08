import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types";

const STATUS_CONFIG: Record<
  UserStatus,
  { label: string; variant: "success" | "secondary" | "warning" | "destructive"; dot: string }
> = {
  active: { label: "Active", variant: "success", dot: "bg-success" },
  inactive: { label: "Inactive", variant: "secondary", dot: "bg-muted-foreground" },
  invited: { label: "Invited", variant: "warning", dot: "bg-warning" },
  suspended: { label: "Suspended", variant: "destructive", dot: "bg-destructive" },
};

export function StatusBadge({ status }: { status: UserStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} className="gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  );
}
