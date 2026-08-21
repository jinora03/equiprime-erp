import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Percentage change vs. previous period. */
  trend?: number | undefined;
  trendLabel?: string;
  detail?: string | undefined;
  iconClassName?: string;
  valueClassName?: string;
  detailClassName?: string;
  className?: string;
  interactive?: boolean;
  /** Optional 0–100 operational progress indicator. */
  progress?: number | undefined;
  progressClassName?: string;
  /** Visual state for operational exceptions; neutral is the default. */
  tone?: "neutral" | "attention" | "critical";
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel = "vs last month",
  detail,
  iconClassName,
  valueClassName,
  detailClassName,
  className,
  interactive = false,
  progress,
  progressClassName,
  tone = "neutral",
}: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0;
  const progressValue =
    typeof progress === "number" ? Math.min(100, Math.max(0, progress)) : null;

  return (
    <Card
      className={cn(
        "group h-full overflow-hidden p-3.5 shadow-sm",
        tone === "attention" && "border-warning/25 bg-warning/[0.045]",
        tone === "critical" && "border-destructive/25 bg-destructive/[0.04]",
        interactive &&
          "transition-[background-color,border-color,box-shadow] hover:border-primary/30 hover:bg-muted/20 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <Icon
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground",
              iconClassName,
            )}
            aria-hidden="true"
          />
        ) : null}
      </div>

      <p
        className={cn(
          "mt-1 truncate text-xl font-semibold tracking-tight text-foreground",
          valueClassName,
        )}
      >
        {value}
      </p>

      {typeof trend === "number" ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
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

      {progressValue !== null ? (
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressValue}
          aria-label={`${label}: ${progressValue}%`}
        >
          <span
            className={cn("block h-full rounded-full bg-primary", progressClassName)}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      ) : null}

      {detail ? (
        <p
          className={cn(
            "mt-1.5 text-xs leading-4 text-muted-foreground",
            detailClassName,
          )}
        >
          {detail}
        </p>
      ) : null}
    </Card>
  );
}
