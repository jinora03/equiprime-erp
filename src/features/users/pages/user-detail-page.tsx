import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarClock,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { WILDCARD } from "@/constants/modules";
import { PermissionGuard } from "@/components/permission-guard";
import { EmptyState } from "@/shared/components/empty-state";
import { StatusBadge } from "@/shared/components/status-badge";
import { UserAvatar } from "@/shared/components/user-avatar";
import { formatDateTime, formatRelativeTime } from "@/utils/format";
import { titleCase } from "@/utils/string";
import { useDepartments } from "@/features/departments/hooks";
import { useRoles } from "@/features/roles/hooks";
import { useUser } from "../hooks";
import { UserFormDialog } from "../components/user-form-dialog";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useUser(userId, !Number.isNaN(userId));
  const { data: departments = [] } = useDepartments();
  const { data: roles = [] } = useRoles();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="User not found"
        description="This user may have been removed."
        action={
          <Button asChild variant="outline">
            <Link to={ROUTES.USERS}>
              <ArrowLeft className="h-4 w-4" /> Back to users
            </Link>
          </Button>
        }
      />
    );
  }

  const role = roles.find((r) => r.name === user.role);
  const isWildcard = role?.permissions.includes(WILDCARD);
  const grantedModules = isWildcard
    ? ["Everything"]
    : Array.from(
        new Set((role?.permissions ?? []).map((p) => titleCase(p.split(":")[0]))),
      );

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => navigate(ROUTES.USERS)}
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Button>

      {/* Profile header */}
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={user.full_name}
              src={user.avatar}
              className="h-16 w-16 text-lg"
            />
            <div className="space-y-1.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {user.full_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {user.job_title || "—"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={user.status} />
                <Badge variant="outline">{user.role}</Badge>
                <Badge variant="secondary">{user.department}</Badge>
              </div>
            </div>
          </div>
          <PermissionGuard permission="users:update">
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </PermissionGuard>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <DetailRow icon={Mail} label="Email" value={user.email} />
            <DetailRow icon={Phone} label="Phone" value={user.phone || "—"} />
            <DetailRow
              icon={Building2}
              label="Department"
              value={user.department}
            />
            <DetailRow icon={Briefcase} label="Role" value={user.role} />
            <DetailRow
              icon={CalendarClock}
              label="Last login"
              value={formatRelativeTime(user.last_login)}
            />
            <DetailRow
              icon={CalendarClock}
              label="Member since"
              value={formatDateTime(user.created_at)}
            />
          </CardContent>
        </Card>

        {/* Access summary */}
        <Card>
          <CardHeader>
            <CardTitle>Access & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Assigned role
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {user.role}
              </p>
              {role?.description ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {role.description}
                </p>
              ) : null}
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Module access
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {grantedModules.map((m) => (
                  <Badge key={m} variant="default">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <UserFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        departments={departments}
        roles={roles}
      />
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
