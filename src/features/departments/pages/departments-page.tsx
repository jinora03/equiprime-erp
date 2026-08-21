import { useState } from "react";
import {
  Building2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/use-permissions";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import type { Department } from "@/types";
import { DepartmentFormDialog } from "../components/department-form-dialog";
import { useDeleteDepartment, useDepartments } from "../hooks";

export function DepartmentsPage() {
  const { can } = usePermissions();
  const { data: departments = [], isLoading } = useDepartments();
  const deleteDept = useDeleteDepartment();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);

  const canEdit = can("departments:update");
  const canDelete = can("departments:delete");

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (dept: Department) => {
    setEditing(dept);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDept.mutateAsync(deleting.id);
      toast.success("Department removed");
    } catch {
      toast.error("Couldn't delete department.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Departments"
        description="Operational units that organize your team and workflows."
        actions={
          <PermissionGuard permission="departments:create">
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New department
            </Button>
          </PermissionGuard>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments yet"
          description="Create your first department to start organizing your team."
          action={
            <PermissionGuard permission="departments:create">
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> New department
              </Button>
            </PermissionGuard>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {departments.map((dept) => (
            <Card
              key={dept.id}
              className="group transition-colors hover:border-primary/25"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-semibold tracking-wide text-primary">
                      {dept.code}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">{dept.name}</h3>
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                        {dept.code}
                      </p>
                    </div>
                  </div>
                  {canEdit || canDelete ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${dept.name}`}
                          className="shrink-0 sm:opacity-70 sm:transition-opacity sm:group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEdit ? (
                          <DropdownMenuItem onClick={() => openEdit(dept)}>
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        ) : null}
                        {canDelete ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive [&_svg]:text-destructive"
                              onClick={() => setDeleting(dept)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>

                <p className="mt-4 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground">
                  {dept.description}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Members
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {dept.member_count}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Department head
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                      {dept.head || "Not assigned"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DepartmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        department={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete department?"
        description={
          deleting
            ? `${deleting.name} will be removed. Members keep their accounts but lose this assignment.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        loading={deleteDept.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
