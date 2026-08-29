import { useState } from "react";
import { Link } from "react-router-dom";
import {
  KeyRound,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { WILDCARD } from "@/constants/modules";
import { usePermissions } from "@/hooks/use-permissions";
import { getErrorMessage } from "@/services/api/errors";
import { PageHeader } from "@/shared/components/page-header";
import { PermissionGuard } from "@/components/permission-guard";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import type { Role } from "@/types";
import { useDeleteRole, useRoles } from "../hooks";
import { RoleFormDialog } from "../components/role-form-dialog";

export function RolesPage() {
  const { can } = usePermissions();
  const { data: roles = [], isLoading } = useRoles();
  const deleteRole = useDeleteRole();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const canEdit = can("roles:update");
  const canDelete = can("roles:delete");
  const hasActions = canEdit || canDelete;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (role: Role) => {
    setEditing(role);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteRole.mutateAsync(deleting.id);
      toast.success("Role removed");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Couldn't delete role."),
      );
    } finally {
      setDeleting(null);
    }
  };

  const permissionLabel = (role: Role) =>
    role.permissions.includes(WILDCARD)
      ? "Full access"
      : `${role.permissions.length} permissions`;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Roles"
        description="Define roles and the permissions bundled into each."
        actions={
          <div className="flex gap-2">
            <PermissionGuard permission="permissions:view">
              <Button asChild variant="outline">
                <Link to={ROUTES.PERMISSIONS}>
                  <KeyRound className="h-4 w-4" /> Permission Matrix
                </Link>
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="roles:create">
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> New role
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      <Card>
        {isLoading ? (
          <TableSkeleton columns={hasActions ? 5 : 4} />
        ) : (
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Type</TableHead>
                {hasActions ? (
                  <TableHead className="w-[60px] text-right">Actions</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {role.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {role.user_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        role.permissions.includes(WILDCARD)
                          ? "brand"
                          : "secondary"
                      }
                      className="whitespace-nowrap px-2 py-0.5 text-[11px]"
                    >
                      {permissionLabel(role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {role.is_system ? (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" /> System
                      </Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  {hasActions ? (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit ? (
                            <DropdownMenuItem onClick={() => openEdit(role)}>
                              <Pencil className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem asChild>
                            <Link to={ROUTES.PERMISSIONS}>
                              <KeyRound className="h-4 w-4" /> Permissions
                            </Link>
                          </DropdownMenuItem>
                          {canDelete && !role.is_system ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive [&_svg]:text-destructive"
                                onClick={() => setDeleting(role)}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        role={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete role?"
        description={
          deleting
            ? `${deleting.name} will be removed. Users with this role keep their account but lose its permissions.`
            : undefined
        }
        confirmLabel="Delete role"
        destructive
        loading={deleteRole.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
