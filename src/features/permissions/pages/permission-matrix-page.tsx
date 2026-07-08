import { useEffect, useMemo, useState } from "react";
import { Check, KeyRound, Minus, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ACTION_LABELS, WILDCARD, viewKey } from "@/constants/modules";
import { usePermissions } from "@/hooks/use-permissions";
import { PageHeader } from "@/shared/components/page-header";
import { cn } from "@/lib/utils";
import type { PermissionModule } from "@/types";
import { usePermissionMatrix, useUpdateRolePermissions } from "../hooks";

const ACTION_COLUMNS = ["view", "create", "update", "delete", "manage"] as const;

export function PermissionMatrixPage() {
  const { can } = usePermissions();
  const canManage = can("permissions:manage");
  const { data, isLoading } = usePermissionMatrix();
  const updatePerms = useUpdateRolePermissions();

  const roles = data?.roles ?? [];
  const modules = data?.modules ?? [];

  const editableRoles = roles.filter(
    (r) => !r.permissions.includes(WILDCARD),
  );

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Set<string>>(new Set());

  // Default the editor to the first editable role once data arrives.
  useEffect(() => {
    if (selectedRoleId === null && editableRoles.length > 0) {
      setSelectedRoleId(editableRoles[0].role_id);
    }
  }, [editableRoles, selectedRoleId]);

  const selectedRole = roles.find((r) => r.role_id === selectedRoleId) ?? null;

  useEffect(() => {
    if (selectedRole) setDraft(new Set(selectedRole.permissions));
  }, [selectedRole]);

  const dirty = useMemo(() => {
    if (!selectedRole) return false;
    const current = new Set(selectedRole.permissions);
    if (current.size !== draft.size) return true;
    for (const key of draft) if (!current.has(key)) return true;
    return false;
  }, [draft, selectedRole]);

  const groupedModules = useMemo(() => groupByGroup(modules), [modules]);

  const toggle = (key: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleRow = (mod: PermissionModule) => {
    const keys = mod.actions.map((a) => a.key);
    const allOn = keys.every((k) => draft.has(k));
    setDraft((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    try {
      await updatePerms.mutateAsync({
        roleId: selectedRole.role_id,
        permissions: Array.from(draft),
      });
      toast.success("Permissions updated", {
        description: `Saved access for ${selectedRole.role}.`,
      });
    } catch {
      toast.error("Couldn't save permissions.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Permission Matrix" description="Loading…" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permission Matrix"
        description="Visualize role access across every module and fine-tune permissions."
      />

      {/* Overview grid: roles × modules (view access) */}
      <Card>
        <CardHeader>
          <CardTitle>Access Overview</CardTitle>
          <CardDescription>
            Module visibility per role. A check means the role can access that
            module.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-card px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Module
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.role_id}
                      className="px-2 py-2 text-center text-[11px] font-medium text-muted-foreground"
                    >
                      <span className="inline-block max-w-[64px] truncate align-middle">
                        {role.role}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => (
                  <tr key={mod.module} className="border-t">
                    <td className="sticky left-0 z-10 truncate border-t bg-card px-4 py-2 font-medium text-foreground">
                      {mod.label}
                    </td>
                    {roles.map((role) => {
                      const allowed =
                        role.permissions.includes(WILDCARD) ||
                        role.permissions.includes(viewKey(mod.module));
                      return (
                        <td
                          key={role.role_id}
                          className="border-t px-2 py-2 text-center"
                        >
                          {allowed ? (
                            <Check className="mx-auto h-4 w-4 text-success" />
                          ) : (
                            <Minus className="mx-auto h-3.5 w-3.5 text-muted-foreground/30" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Editable per-role grid */}
      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Edit Role Permissions</CardTitle>
            <CardDescription>
              {canManage
                ? "Toggle actions per module for the selected role."
                : "Read-only — you need the Manage permission to edit."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedRoleId ? String(selectedRoleId) : undefined}
              onValueChange={(v) => setSelectedRoleId(Number(v))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.role_id} value={String(role.role_id)}>
                    {role.role}
                    {role.permissions.includes(WILDCARD) ? " (full)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedRole?.permissions.includes(WILDCARD) ? (
            <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/30 p-6">
              <ShieldCheck className="h-6 w-6 text-brand" />
              <div>
                <p className="font-medium text-foreground">
                  {selectedRole.role} has full access
                </p>
                <p className="text-sm text-muted-foreground">
                  This is a system super-role and isn't restricted by the matrix.
                </p>
              </div>
            </div>
          ) : selectedRole ? (
            <div className="space-y-6">
              {/* Column header */}
              <div className="grid grid-cols-[1fr_repeat(5,72px)] items-center gap-2 border-b pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Module</span>
                {ACTION_COLUMNS.map((action) => (
                  <span key={action} className="text-center">
                    {ACTION_LABELS[action]}
                  </span>
                ))}
              </div>

              {groupedModules.map(([group, mods]) => (
                <div key={group} className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                    {group}
                  </p>
                  {mods.map((mod) => {
                    const available = new Map(
                      mod.actions.map((a) => [a.action, a.key]),
                    );
                    const rowKeys = mod.actions.map((a) => a.key);
                    const allOn = rowKeys.every((k) => draft.has(k));
                    return (
                      <div
                        key={mod.module}
                        className="grid grid-cols-[1fr_repeat(5,72px)] items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50"
                      >
                        <button
                          type="button"
                          disabled={!canManage}
                          onClick={() => toggleRow(mod)}
                          className={cn(
                            "flex items-center gap-2 text-left text-sm font-medium text-foreground",
                            canManage && "hover:text-primary",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              allOn ? "bg-success" : "bg-muted-foreground/30",
                            )}
                          />
                          {mod.label}
                        </button>
                        {ACTION_COLUMNS.map((action) => {
                          const key = available.get(action);
                          return (
                            <div
                              key={action}
                              className="flex items-center justify-center"
                            >
                              {key ? (
                                <Checkbox
                                  checked={draft.has(key)}
                                  disabled={!canManage}
                                  onCheckedChange={() => toggle(key)}
                                  aria-label={`${mod.label} ${action}`}
                                />
                              ) : (
                                <span className="text-muted-foreground/20">—</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}

              {canManage ? (
                <div className="flex items-center justify-end gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    disabled={!dirty || updatePerms.isPending}
                    onClick={() => setDraft(new Set(selectedRole.permissions))}
                  >
                    <RotateCcw className="h-4 w-4" /> Reset
                  </Button>
                  <Button
                    disabled={!dirty || updatePerms.isPending}
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4" />
                    {updatePerms.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <KeyRound className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Select a role to view its permissions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRole && !selectedRole.permissions.includes(WILDCARD) ? (
        <p className="text-center text-xs text-muted-foreground">
          {draft.size} permission{draft.size === 1 ? "" : "s"} selected for{" "}
          <Badge variant="secondary">{selectedRole.role}</Badge>
        </p>
      ) : null}
    </div>
  );
}

function groupByGroup(
  modules: PermissionModule[],
): Array<[string, PermissionModule[]]> {
  const map = new Map<string, PermissionModule[]>();
  for (const mod of modules) {
    const list = map.get(mod.group) ?? [];
    list.push(mod);
    map.set(mod.group, list);
  }
  return Array.from(map.entries());
}
