import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Banknote,
  Boxes,
  Building2,
  CalendarCheck,
  ClipboardList,
  Forklift,
  KeyRound,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { PageHeader } from "@/shared/components/page-header";
import { StatCard } from "@/shared/components/stat-card";
import { UserAvatar } from "@/shared/components/user-avatar";
import { formatCurrency, formatDate, formatRelativeTime } from "@/utils/format";
import { type DashboardPriority, type JobOrderStatus } from "../data";
import { useDashboardData } from "../hooks";
import { WorkOverviewChart } from "../components/work-overview-chart";
import { EquipmentStatusChart } from "../components/equipment-status-chart";
import { RevenueChart } from "../components/revenue-chart";

const JOB_STATUS: Record<
  JobOrderStatus,
  "info" | "warning" | "success" | "secondary"
> = {
  Open: "info",
  "In Progress": "warning",
  Completed: "success",
  "On Hold": "secondary",
};

const PRIORITY: Record<
  DashboardPriority,
  "destructive" | "warning" | "secondary"
> = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

const LEGEND = [
  { label: "Job Orders", color: "hsl(var(--chart-primary))" },
  { label: "Work Items", color: "hsl(var(--chart-brand))" },
  { label: "Completed", color: "hsl(var(--chart-success))" },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { data: dashboard } = useDashboardData();

  const statCards = [
    { label: "Revenue (latest month)", value: dashboard ? formatCurrency(dashboard.currentRevenue) : "—", icon: Banknote, trend: dashboard?.revenueChange, iconClassName: "bg-success/10 text-success" },
    { label: "Open Job Orders", value: dashboard ? String(dashboard.openJobOrders) : "—", icon: ClipboardList, iconClassName: "bg-primary/10 text-primary" },
    { label: "Equipment Units", value: dashboard ? String(dashboard.equipmentUnits) : "—", icon: Forklift, iconClassName: "bg-info/10 text-info" },
    { label: "Employees", value: dashboard ? String(dashboard.employees) : "—", icon: Users, iconClassName: "bg-primary/10 text-primary" },
    { label: "Attendance", value: dashboard ? `${dashboard.attendanceRate}%` : "—", icon: CalendarCheck, iconClassName: "bg-brand/10 text-brand-700 dark:text-brand" },
    { label: "Inventory Stock", value: dashboard ? dashboard.inventoryOnHand.toLocaleString() : "—", icon: Boxes, iconClassName: "bg-warning/10 text-warning" },
  ];

  const quickActions = [
    { label: "Add User", icon: UserPlus, to: ROUTES.USERS, permission: "users:create" },
    { label: "New Department", icon: Building2, to: ROUTES.DEPARTMENTS, permission: "departments:create" },
    { label: "Manage Roles", icon: ShieldCheck, to: ROUTES.ROLES, permission: "roles:view" },
    { label: "Permissions", icon: KeyRound, to: ROUTES.PERMISSIONS, permission: "permissions:view" },
    { label: "New Job Order", icon: ClipboardList, to: ROUTES.JOB_ORDERS, permission: "job-orders:create" },
    { label: "View Reports", icon: ArrowUpRight, to: ROUTES.REPORTS, permission: "reports:view" },
  ].filter((action) => can(action.permission));

  return (
    <div className="space-y-6">
      <div data-onboarding="dashboard">
        <PageHeader
          title="Dashboard"
          description={`Welcome back, ${user?.first_name ?? "there"}! ${dashboard ? `${dashboard.branchName} · ${dashboard.region}` : "Loading branch data…"}`}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Work Overview</CardTitle>
              <CardDescription>Job orders and service activity</CardDescription>
            </div>
            <div className="hidden items-center gap-4 sm:flex">
              {LEGEND.map((l) => (
                <span key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <WorkOverviewChart data={dashboard?.workOverview ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment Status</CardTitle>
            <CardDescription>Fleet utilization snapshot</CardDescription>
          </CardHeader>
          <CardContent>
            <EquipmentStatusChart data={dashboard?.equipmentStatus ?? []} />
          </CardContent>
        </Card>
      </div>

      {/* Lists row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent job orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Job Orders</CardTitle>
              <CardDescription>Latest service and repair jobs</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.JOB_ORDERS}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-2">
            <div className="divide-y">
              {(dashboard?.recentJobOrders ?? []).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
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
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(job.date)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump straight into common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {quickActions.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="group flex flex-col items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-soft"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <action.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No quick actions available for your role.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Across the selected branch</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {(dashboard?.activities ?? []).map((item) => (
                <li key={item.id} className="flex gap-3">
                  <UserAvatar name={item.user} className="h-8 w-8 text-[10px]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-foreground">
                      <span className="font-medium">{item.user}</span>{" "}
                      <span className="text-muted-foreground">{item.action}</span>{" "}
                      <span className="font-medium">{item.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.time)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Upcoming maintenance */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Maintenance</CardTitle>
            <CardDescription>Preventive service schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(dashboard?.upcomingMaintenance ?? []).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
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
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.due)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Financial overview */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Revenue · last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {dashboard ? formatCurrency(dashboard.currentRevenue) : "—"}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs">
                  <span className="inline-flex items-center font-medium text-success">
                    <ArrowUpRight className="h-3.5 w-3.5" /> {dashboard?.revenueChange ?? 0}%
                  </span>
                  <span className="text-muted-foreground">vs last month</span>
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <RevenueChart data={dashboard?.revenueTrend ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
