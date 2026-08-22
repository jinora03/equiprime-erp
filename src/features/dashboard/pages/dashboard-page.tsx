import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Plus, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ScrollableTabsList,
  Tabs,
  TabsContent,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ROUTES, jobOrderDetailPath } from "@/constants/routes";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { ComingSoonPanel } from "@/shared/components/coming-soon-panel";
import { PageHeader } from "@/shared/components/page-header";
import { StatCard } from "@/shared/components/stat-card";
import type { PermissionKey } from "@/types";
import { formatDate } from "@/utils/format";
import { formatDuration } from "@/utils/duration";
import { EquipmentStatusChart } from "../components/equipment-status-chart";
import {
  type DashboardAttentionKey,
  type DashboardPriority,
} from "../data";
import { useDashboardData } from "../hooks";

const PRIORITY: Record<
  DashboardPriority,
  "destructive" | "warning" | "secondary"
> = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

/** Attention buckets keep their operational semantics: red = critical, orange = warning. */
const ATTENTION_TONE: Record<DashboardAttentionKey, "critical" | "warning"> = {
  overdue_job_orders: "critical",
  overdue_maintenance: "warning",
  waiting_for_parts: "warning",
  low_stock_inventory: "warning",
};

export function DashboardPage() {
  const { can } = usePermissions();
  const { data: dashboard } = useDashboardData();

  const metrics = dashboard?.serviceMetrics;

  const primaryStats = [
    {
      label: "Active Job Orders",
      value: metrics ? String(metrics.activeJobOrders) : "—",
      detail: metrics
        ? metrics.overdueJobOrders > 0
          ? `${metrics.overdueJobOrders} overdue`
          : "None overdue"
        : undefined,
      detailClassName:
        metrics && metrics.overdueJobOrders > 0
          ? "font-medium text-destructive"
          : "text-success",
      tone:
        metrics && metrics.overdueJobOrders > 0
          ? ("critical" as const)
          : ("neutral" as const),
      route: ROUTES.JOB_ORDERS,
      permission: "job-orders:view" as PermissionKey,
    },
    {
      label: "Awaiting Parts",
      value: metrics ? String(metrics.awaitingParts) : "—",
      detail: "In the Waiting for Parts stage",
      route: ROUTES.JOB_ORDERS,
      permission: "job-orders:view" as PermissionKey,
    },
    {
      label: "Pending Parts Requests",
      value: metrics ? String(metrics.pendingPartsRequests) : "—",
      detail:
        metrics && metrics.pendingPartsRequests > 0
          ? "Awaiting approval"
          : "All resolved",
      detailClassName:
        metrics && metrics.pendingPartsRequests > 0
          ? "font-medium text-warning"
          : "text-success",
      tone:
        metrics && metrics.pendingPartsRequests > 0
          ? ("attention" as const)
          : ("neutral" as const),
      route: undefined,
      permission: undefined,
    },
    {
      label: "Overdue Work",
      value: metrics
        ? String(metrics.overdueJobOrders + metrics.overdueWorkItems)
        : "—",
      detail: metrics
        ? `${metrics.overdueJobOrders} job orders · ${metrics.overdueWorkItems} work items`
        : undefined,
      detailClassName:
        metrics && metrics.overdueJobOrders + metrics.overdueWorkItems > 0
          ? "font-medium text-destructive"
          : "text-success",
      tone:
        metrics && metrics.overdueJobOrders + metrics.overdueWorkItems > 0
          ? ("critical" as const)
          : ("neutral" as const),
      route: ROUTES.JOB_ORDERS,
      permission: "job-orders:view" as PermissionKey,
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

  const attention = dashboard?.attention ?? [];
  const bottlenecks = (dashboard?.bottlenecks ?? []).slice(0, 6);
  const stages = dashboard?.jobOrdersByStage ?? [];
  const maxStageCount = Math.max(1, ...stages.map((stage) => stage.count));
  const hasPipeline = stages.some((stage) => stage.count > 0);

  return (
    <div className="space-y-4">
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

      <Tabs defaultValue="service" className="space-y-4">
        <ScrollableTabsList>
          <TabsTrigger value="service">Service</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="hr">HR</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </ScrollableTabsList>

        <TabsContent value="service" className="space-y-4">
          <section
            aria-label="Service operational metrics"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {primaryStats.map(({ route, permission, ...stat }) => {
              const interactive = Boolean(
                route && permission && can(permission),
              );
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

          {attention.length > 0 ? (
            <section
              aria-label="Attention summary"
              className="flex flex-wrap gap-2"
            >
              {attention.map((item) => (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs",
                    ATTENTION_TONE[item.key] === "critical"
                      ? "border-destructive/25 bg-destructive/[0.05]"
                      : "border-warning/25 bg-warning/10",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      ATTENTION_TONE[item.key] === "critical"
                        ? "text-destructive"
                        : "text-warning",
                    )}
                  >
                    {item.count}
                  </span>
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="hidden text-muted-foreground md:inline">
                    · {item.detail}
                  </span>
                </div>
              ))}
            </section>
          ) : null}

          <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Card className="min-w-0 border-warning/20 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className="h-4 w-4 text-warning"
                    aria-hidden="true"
                  />
                  <CardTitle>Needs action now</CardTitle>
                </div>
                <CardDescription>
                  Job orders that are blocked or slipping — and why
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3">
                {bottlenecks.length > 0 ? (
                  <div className="space-y-1.5 pb-2">
                    {bottlenecks.map((item) => {
                      const content = (
                        <div className="flex items-center gap-3 px-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <Badge
                              variant={
                                item.severity === "critical"
                                  ? "destructive"
                                  : "warning"
                              }
                              className="px-1.5 py-0 text-[10px] uppercase tracking-[0.08em]"
                            >
                              {item.reason}
                            </Badge>
                            <p className="mt-1.5 truncate text-sm font-semibold text-foreground">
                              <span className="font-mono text-xs text-muted-foreground">
                                {item.code}
                              </span>{" "}
                              {item.title}
                            </p>
                            {item.detail ? (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {item.detail}
                              </p>
                            ) : null}
                          </div>
                          {item.elapsedMs > 0 ? (
                            <span
                              className={cn(
                                "shrink-0 text-sm font-semibold tabular-nums",
                                item.severity === "critical"
                                  ? "text-destructive"
                                  : "text-foreground",
                              )}
                            >
                              {formatDuration(item.elapsedMs)}
                            </span>
                          ) : null}
                          {canViewJobOrders ? (
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          ) : null}
                        </div>
                      );

                      return canViewJobOrders ? (
                        <Link
                          key={item.id}
                          to={jobOrderDetailPath(item.jobOrderId)}
                          className="group block rounded-md border border-border bg-muted/20 transition-[background-color,border-color] hover:border-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div
                          key={item.id}
                          className="rounded-md border border-border bg-muted/20"
                        >
                          {content}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm font-medium text-foreground">
                      Nothing needs action
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      No job orders are blocked or overdue in this branch right now.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Job orders by stage</CardTitle>
                  <CardDescription>Active service pipeline</CardDescription>
                </div>
                {canViewJobOrders ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link to={ROUTES.JOB_ORDERS}>
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent>
                {hasPipeline ? (
                  <ul className="space-y-3">
                    {stages.map((stage) => (
                      <li key={stage.stageId}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">
                            {stage.name}
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            {stage.count}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <span
                            className={cn(
                              "block h-full rounded-full",
                              stage.tone === "warning"
                                ? "bg-warning"
                                : "bg-primary",
                            )}
                            style={{
                              width: `${(stage.count / maxStageCount) * 100}%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-1 py-8 text-center text-xs text-muted-foreground">
                    No active job orders in this branch.
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
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
                        className="flex items-center justify-between gap-3 px-3 py-2"
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
                          <Badge variant={PRIORITY[item.priority]}>
                            {item.priority}
                          </Badge>
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
          </section>
        </TabsContent>

        <TabsContent value="sales">
          <ComingSoonPanel title="Sales dashboard" />
        </TabsContent>
        <TabsContent value="hr">
          <ComingSoonPanel title="HR dashboard" />
        </TabsContent>
        <TabsContent value="inventory">
          <ComingSoonPanel title="Inventory dashboard" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
