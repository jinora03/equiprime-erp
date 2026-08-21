import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCog,
  UserRound,
  Users as UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { userDetailPath } from "@/constants/routes";
import { useDebounce } from "@/hooks/use-debounce";
import { usePermissions } from "@/hooks/use-permissions";
import { PageHeader } from "@/shared/components/page-header";
import { PermissionGuard } from "@/components/permission-guard";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { DataPagination } from "@/shared/components/data-pagination";
import { EmptyState } from "@/shared/components/empty-state";
import { StatusBadge } from "@/shared/components/status-badge";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { UserAvatar } from "@/shared/components/user-avatar";
import { formatRelativeTime } from "@/utils/format";
import type { User, UserFilters } from "@/types";
import { useDepartments } from "@/features/departments/hooks";
import { useRoles } from "@/features/roles/hooks";
import { useDeleteUser, useUsers } from "../hooks";
import { UserFormDialog } from "../components/user-form-dialog";

const PAGE_SIZE = 8;
const ALL = "all";

export function UsersPage() {
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [department, setDepartment] = useState<string>(ALL);
  const [role, setRole] = useState<string>(ALL);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo<UserFilters>(
    () => ({
      search: debouncedSearch || undefined,
      status: status === ALL ? undefined : (status as UserFilters["status"]),
      department: department === ALL ? undefined : department,
      role: role === ALL ? undefined : role,
      page,
      page_size: PAGE_SIZE,
    }),
    [debouncedSearch, status, department, role, page],
  );

  const { data, isLoading, isError } = useUsers(filters);
  const { data: departments = [] } = useDepartments();
  const { data: roles = [] } = useRoles();
  const deleteUser = useDeleteUser();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const resetToFirstPage = () => setPage(1);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (user: User) => {
    setEditing(user);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteUser.mutateAsync(deleting.id);
      toast.success("User removed", {
        description: `${deleting.full_name} was deleted.`,
      });
    } catch {
      toast.error("Couldn't delete user.");
    } finally {
      setDeleting(null);
    }
  };

  const items = data?.items ?? [];
  const canEdit = can("users:update");
  const canDelete = can("users:delete");
  const hasRowActions = canEdit || canDelete;

  return (
    <div className="space-y-4">
      <PageHeader
        title="User Management"
        description="Manage team members, their departments, roles, and access."
        actions={
          <PermissionGuard permission="users:create">
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add user
            </Button>
          </PermissionGuard>
        }
      />

      <Card>
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search users"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetToFirstPage();
              }}
              placeholder="Search by name, email, or title…"
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 lg:flex">
            <FilterSelect
              value={status}
              onChange={(v) => {
                setStatus(v);
                resetToFirstPage();
              }}
              placeholder="Status"
              options={[
                { label: "All statuses", value: ALL },
                { label: "Active", value: "active" },
                { label: "Invited", value: "invited" },
                { label: "Inactive", value: "inactive" },
                { label: "Suspended", value: "suspended" },
              ]}
            />
            <FilterSelect
              value={department}
              onChange={(v) => {
                setDepartment(v);
                resetToFirstPage();
              }}
              placeholder="Department"
              options={[
                { label: "All departments", value: ALL },
                ...departments.map((d) => ({ label: d.name, value: d.name })),
              ]}
            />
            <FilterSelect
              value={role}
              onChange={(v) => {
                setRole(v);
                resetToFirstPage();
              }}
              placeholder="Role"
              options={[
                { label: "All roles", value: ALL },
                ...roles.map((r) => ({ label: r.name, value: r.name })),
              ]}
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <TableSkeleton columns={hasRowActions ? 6 : 5} />
        ) : isError ? (
          <EmptyState
            icon={UsersIcon}
            title="Couldn't load users"
            description="There was a problem fetching the user list. Please retry."
            className="m-4"
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="No users found"
            description="Try adjusting your search or filters, or add a new team member."
            className="m-4"
            action={
              <PermissionGuard permission="users:create">
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Add user
                </Button>
              </PermissionGuard>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                {hasRowActions ? (
                  <TableHead className="w-[60px] text-right">Actions</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link
                      to={userDetailPath(user.id)}
                      className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`View ${user.full_name}'s profile`}
                    >
                      <UserAvatar name={user.full_name} src={user.avatar} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground hover:underline">
                          {user.full_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.department}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">{user.role}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(user.last_login)}
                  </TableCell>
                  {hasRowActions ? (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${user.full_name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(userDetailPath(user.id))}
                          >
                            <UserCog className="h-4 w-4" /> View profile
                          </DropdownMenuItem>
                          {canEdit ? (
                            <DropdownMenuItem onClick={() => openEdit(user)}>
                              <Pencil className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          ) : null}
                          {canDelete ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive [&_svg]:text-destructive"
                                onClick={() => setDeleting(user)}
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

        {/* Pagination */}
        {!isLoading && items.length > 0 ? (
          <div className="border-t p-4">
            <DataPagination
              page={page}
              pageSize={PAGE_SIZE}
              total={data?.total ?? 0}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </Card>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        departments={departments}
        roles={roles}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete user?"
        description={
          deleting
            ? `${deleting.full_name} will be permanently removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete user"
        destructive
        loading={deleteUser.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { label: string; value: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="lg:w-[160px]"
        aria-label={`${placeholder} filter`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
