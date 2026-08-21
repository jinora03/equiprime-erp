import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Clock3,
  Plus,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES, jobOrderDetailPath } from "@/constants/routes";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/shared/components/page-header";
import { StatCard } from "@/shared/components/stat-card";
import { UserAvatar } from "@/shared/components/user-avatar";
import type { PermissionKey } from "@/types";
import { formatCurrency, formatDate, formatRelativeTime } from "@/utils/format";
import { EquipmentStatusChart } from "../components/equipment-status-chart";
import { RevenueChart } from "../components/revenue-chart";
import {
  type Activity,
  type DashboardAttentionKey,
  type DashboardPriority,
  type JobOrderStatus,
} from "../data";
import { useDashboardData } from "../hooks";

const JOB_STATUS: Record<
  JobOrderStatus,
  "info" | "warning" | "success" | "secondary"
> = {
  Open: "secondary",
  "In Progress": "info",
  Completed: "success",
  "On Hold": "warning",
};

const PRIORITY: Record<
  DashboardPriority,
  "destructive" | "warning" | "secondary"
> = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

const ATTENTION_META: Record<
  DashboardAttentionKey,
  {
    icon: typeof AlertTriangle;
    route: string;
    permission: PermissionKey;
    severity: string;
    badge: "destructive" | "warning";
    rowClassName: string;
    iconClassName: string;
    countClassName: string;
  }
> = {
  overdue_job_orders: {
    icon: Clock3,
    route: ROUTES.JOB_ORDERS,
    permission: "job-orders:view",
    severity: "Overdue",
    badge: "destructive",
    rowClassName: "border-destructive/20 bg-destructive/5",
    iconClassName: "text-destructive",
    countClassName: "text-destructive",
  },
  overdue_maintenance: {
    icon: Wrench,
    route: ROUTES.MAINTENANCE,
    permission: "maintenance:view",
    severity: "Needs attention",
    badge: "warning",
    rowClassName: "border-warning/25 bg-warning/5",
    iconClassName: "text-warning",
    countClassName: "text-warning",
  },
  waiting_for_parts: {
    icon: Boxes,
    route: ROUTES.JOB_ORDERS,
    permission: "job-orders:view",
    severity: "Waiting",
    badge: "warning",
    rowClassName: "border-border bg-muted/20",
    iconClassName: "text-warning",
    countClassName: "text-foreground",
  },
  low_stock_inventory: {
    icon: AlertTriangle,
    route: ROUTES.INVENTORY,
    permission: "inventory:view",
    severity: "Stock alert",
    badge: "warning",
    rowClassName: "border-border bg-background",
    iconClassName: "text-warning",
    countClassName: "text-foreground",
  },
};

export function DashboardPage() {
  const { can } = usePermissions();
  const { data: dashboard } = useDashboardData();

  const equipmentInUse =
    dashboard?.equipmentStatus.find((item) => item.name === "In Use")?.value ?? 0;

  const primaryStats = [
    {
      label: "Revenue",
      value: dashboard ? formatCurrency(dashboard.currentRevenue) : "—",
      trend: dashboard?.revenueChange,
      className: "border-border",
      route: undefined,
      permission: undefined,
    },
    {
      label: "Open Job Orders",
      value: dashboard ? `${dashboard.openJobOrders} open` : "—",
      detail: dashboard
        ? dashboard.overdueJobOrders > 0
          ? `${dashboard.overdueJobOrders} overdue`
          : "No overdue job orders"
        : undefined,
      detailClassName:
        dashboard && dashboard.overdueJobOrders > 0
          ? "font-medium text-destructive"
          : "text-success",
      className:
        dashboard && dashboard.overdueJobOrders > 0
          ? "border-destructive/15"
          : undefined,
      route: ROUTES.JOB_ORDERS,
      permission: "job-orders:view" as PermissionKey,
    },
    {
      label: "Fleet Utilization",
      value: dashboard ? `${dashboard.equipmentUtilization}%` : "—",
      detail: dashboard
        ? `${equipmentInUse} of ${dashboard.equipmentUnits} units currently active`
        : undefined,
      progress: dashboard?.equipmentUtilization,
      progressClassName: "bg-primary",
      className: "border-primary/15",
      route: ROUTES.EQUIPMENT,
      permission: "equipment:view" as PermissionKey,
    },
    {
      label: "Inventory Alerts",
      value: dashboard ? String(dashboard.lowStockItems) : "—",
      icon: AlertTriangle,
      detail: dashboard
        ? `${dashboard.lowStockItems === 1 ? "Low-stock item" : "Low-stock items"} · ${dashboard.inventoryOnHand.toLocaleString()} units on hand`
        : undefined,
      iconClassName:
        dashboard && dashboard.lowStockItems > 0
          ? "text-warning"
          : "text-success",
      valueClassName:
        dashboard && dashboard.lowStockItems > 0 ? "text-warning" : undefined,
      className:
        dashboard && dashboard.lowStockItems > 0
          ? "border-warning/25 bg-warning/5"
          : "border-success/15",
      route: ROUTES.INVENTORY,
      permission: "inventory:view" as PermissionKey,
    },
  ];

  const headerActions = [
    can("job-orders:create") ? (
      <Button key="new-job" asChild size="sm">
        <Link to={`${ROUTES.JOB_ORDERS}?create=1`}>
          <Plus className="h-4 w-4" /> New job order
        </Link>
      </Button>
    ) : null,
    can("maintenance:create") ? (
      <Button key="maintenance" asChild variant="outline" size="sm">
        <Link to={`${ROUTES.MAINTENANCE}?create=1`}>
          <Wrench className="h-4 w-4" /> Schedule maintenance
        </Link>
      </Button>
    ) : null,
  ].filter(Boolean);

  const canViewJobOrders = can("job-orders:view");
  const canViewEquipment = can("equipment:view");
  const canViewMaintenance = can("maintenance:view");

  const activityRoute = (item: Activity): string | null => {
    if (!item.targetId || !item.targetKind) return null;
    if (item.targetKind === "maintenance") {
      return canViewMaintenance ? ROUTES.MAINTENANCE : null;
    }
    if (!canViewJobOrders) return null;
    const base = jobOrderDetailPath(item.targetId);
    return item.targetKind === "job_order_parts" ? `${base}?tab=parts` : base;
  };

  return (
    <div className="space-y-6">
      <div data-onboarding="dashboard">
        <PageHeader
          title="Dashboard"
          description={
            dashboard
              ? `${dashboard.branchName} · ${dashboard.region}`
              : "Loading branch data…"
          }
          actions={headerActions.length > 0 ? <>{headerActions}</> : undefined}
        />
      </div>

      <section
        aria-label="Primary operational metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {primaryStats.map(({ route, permission, ...stat }) => {
          const interactive = Boolean(route && permission && can(permission));
          const card = <StatCard {...stat} interactive={interactive} />;

          return interactive && route ? (
            <Link
              key={stat.label}
              to={route}
              className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2"
              aria-label={`View ${stat.label}`}
            >
              {card}
            </Link>
          ) : (
            <div key={stat.label} className="h-full">
              {card}
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.65fr)]">
        <Card className="border-warning/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
              <CardTitle>Attention Required</CardTitle>
            </div>
            <CardDescription>Operational exceptions that need follow-up</CardDescription>
          </CardHeader>
          <CardContent className="px-3">
            {(dashboard?.attention ?? []).length > 0 ? (
              <div className="space-y-2 pb-3">
                {(dashboard?.attention ?? []).map((item) => {
                  const meta = ATTENTION_META[item.key];
                  const Icon = meta.icon;
                  const content = (
                    <div className="flex items-center gap-3 px-3.5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={cn("h-3.5 w-3.5 shrink-0", meta.iconClassName)}
                            aria-hidden="true"
                          />
                          <Badge
                            variant={meta.badge}
                            className="px-1.5 py-0 text-[10px] uppercase tracking-[0.08em]"
                          >
                            {meta.severity}
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-foreground">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-xl font-semibold tabular-nums",
                          meta.countClassName,
                        )}
                        aria-label={`${item.count} affected`}
                      >
                        {item.count}
                      </span>
                      {can(meta.permission) ? (
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      ) : null}
                    </div>
                  );

                  return can(meta.permission) ? (
                    <Link
                      key={item.key}
                      to={meta.route}
                      className={cn(
                        "group block rounded-md border transition-[background-color,border-color] hover:border-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                        meta.rowClassName,
                      )}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={item.key}
                      className={cn("rounded-md border", meta.rowClassName)}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">No urgent items</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This branch has no current operational exceptions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Job Orders</CardTitle>
              <CardDescription>Latest service and repair work</CardDescription>
            </div>
            {canViewJobOrders ? (
              <Button asChild variant="ghost" size="sm">
                <Link to={ROUTES.JOB_ORDERS}>
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[minmax(220px,1.35fr)_minmax(140px,0.9fr)_90px_100px] gap-4 border-y bg-muted/30 px-5 py-2 text-xs font-medium text-muted-foreground">
                  <span>Job order</span>
                  <span>Equipment / technician</span>
                  <span>Priority</span>
                  <span>Due date</span>
                </div>
                <div className="divide-y">
                  {(dashboard?.recentJobOrders ?? []).map((job) => {
                    const row = (
                      <div className="grid grid-cols-[minmax(220px,1.35fr)_minmax(140px,0.9fr)_90px_100px] items-center gap-4 px-5 py-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              {job.code}
                            </span>
                            <Badge variant={JOB_STATUS[job.status]}>{job.status}</Badge>
                          </div>
                          <p className="mt-1 truncate text-sm font-medium text-foreground">
                            {job.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {job.customer}
                          </p>
                        </div>
                        <div className="min-w-0 text-xs">
                          <p className="truncate font-medium text-foreground">
                            {job.equipment}
                          </p>
                          <p className="mt-1 truncate text-muted-foreground">
                            {job.technician}
                          </p>
                        </div>
                        <Badge variant={PRIORITY[job.priority]} className="w-fit">
                          {job.priority}
                        </Badge>
                        <span
                          className={cn(
                            "text-xs",
                            job.overdue
                              ? "font-medium text-destructive"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatDate(job.dueDate)}
                        </span>
                      </div>
                    );

                    return canViewJobOrders ? (
                      <Link
                        key={job.id}
                        to={jobOrderDetailPath(job.id)}
                        className="block transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
                      >
                        {row}
                      </Link>
                    ) : (
                      <div key={job.id}>{row}</div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Equipment Status</CardTitle>
              <CardDescription>
                {dashboard
                  ? `Fleet utilization · ${dashboard.equipmentUtilization}%`
                  : "Fleet utilization snapshot"}
              </CardDescription>
            </div>
            {canViewEquipment ? (
              <Button asChild variant="ghost" size="sm">
                <Link to={ROUTES.EQUIPMENT}>
                  View <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            <EquipmentStatusChart data={dashboard?.equipmentStatus ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Upcoming Maintenance</CardTitle>
              <CardDescription>Next outstanding service items</CardDescription>
            </div>
            {canViewMaintenance ? (
              <Button asChild variant="ghost" size="sm">
                <Link to={ROUTES.MAINTENANCE}>
                  View <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="px-2">
            {(dashboard?.upcomingMaintenance ?? []).length > 0 ? (
              <ul className="divide-y">
                {(dashboard?.upcomingMaintenance ?? []).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.equipment}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.type}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={PRIORITY[item.priority]}>{item.priority}</Badge>
                      <span
                        className={cn(
                          "text-xs",
                          item.overdue
                            ? "font-medium text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatDate(item.due)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                No outstanding maintenance is scheduled.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Connected revenue · last 6 months</CardDescription>
              </div>
              {dashboard ? (
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 text-xs font-medium",
                    dashboard.revenueChange >= 0
                      ? "text-success"
                      : "text-destructive",
                  )}
                >
                  <ArrowUpRight
                    className={cn(
                      "h-3.5 w-3.5",
                      dashboard.revenueChange < 0 && "rotate-90",
                    )}
                  />
                  {Math.abs(dashboard.revenueChange)}%
                  <span className="font-normal text-muted-foreground">MoM</span>
                </span>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart data={dashboard?.revenueTrend ?? []} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Workflow and parts activity across the selected branch
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          {(dashboard?.activities ?? []).length > 0 ? (
            <ol className="divide-y">
              {(dashboard?.activities ?? []).map((item) => {
                const route = activityRoute(item);
                const target = route ? (
                  <Link
                    to={route}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {item.target}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{item.target}</span>
                );

                return (
                  <li key={item.id} className="flex gap-3 px-3 py-3.5">
                    <UserAvatar name={item.user} className="h-8 w-8 text-[10px]" />
                    <div className="min-w-0 flex-1 sm:flex sm:items-start sm:justify-between sm:gap-6">
                      <div className="min-w-0">
                        <p className="text-sm leading-5 text-foreground">
                          <span className="font-medium">{item.user}</span>{" "}
                          <span className="text-muted-foreground">{item.verb}</span>{" "}
                          {target}
                          {item.suffix ? (
                            <span className="text-muted-foreground"> {item.suffix}</span>
                          ) : null}
                        </p>
                        {item.detail ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {item.detail}
                          </p>
                        ) : null}
                      </div>
                      <p className="mt-1 shrink-0 text-xs text-muted-foreground sm:mt-0">
                        {formatRelativeTime(item.time)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No recent operational activity for this branch.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
