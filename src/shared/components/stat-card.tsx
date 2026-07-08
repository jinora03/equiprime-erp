import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Percentage change vs. previous period. */
  trend?: number;
  trendLabel?: string;
  /** Tailwind classes for the icon tile (bg + text). */
  iconClassName?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel = "vs last month",
  iconClassName,
  className,
}: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <Card className={cn("p-5 transition-shadow hover:shadow-elevated", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {label}
          </p>
          <p className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
            iconClassName,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof trend === "number" ? (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              isPositive ? "text-success" : "text-destructive",
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend)}%
          </span>
          <span className="text-muted-foreground">{trendLabel}</span>
        </div>
      ) : null}
    </Card>
  );
}
