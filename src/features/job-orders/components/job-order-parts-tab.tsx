import { useState } from "react";
import { PackageCheck, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { canUpdateJobOrder } from "@/services/service-work-access";
import { EmptyState } from "@/shared/components/empty-state";
import { TONE } from "@/shared/components/workflow-tones";
import { formatRelativeTime } from "@/utils/format";
import { useInventory } from "@/features/inventory/hooks";
import { availableStock } from "@/features/inventory/types";
import { useCreatePartsRequest, usePartsRequests } from "@/features/parts/hooks";
import { getPartsRequestStatus } from "@/features/parts/statuses";
import type { PartsRequestItem } from "@/features/parts/types";

interface DraftPart extends PartsRequestItem {}

export function JobOrderPartsTab({
  jobOrderId,
  assigneeIds,
}: {
  jobOrderId: number;
  assigneeIds: number[];
}) {
  const { user, permissions } = useAuth();
  // Record-level access: raising a request requires update access to THIS job
  // order (mechanics are limited to their assigned records). Mirrors the
  // service-side enforcement in partsRequestService.create.
  const canRequest = user
    ? canUpdateJobOrder(
        { userId: user.id, role: user.role, permissions },
        { assigneeIds },
      )
    : false;

  const { data: inventory = [] } = useInventory();
  const { data: requests = [] } = usePartsRequests(jobOrderId);
  const createRequest = useCreatePartsRequest();

  const [draft, setDraft] = useState<DraftPart[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [qty, setQty] = useState("1");

  const addDraftPart = () => {
    const item = inventory.find((i) => String(i.id) === selectedItem);
    const quantity = Number(qty) || 1;
    if (!item) return;
    setDraft((prev) => {
      const existing = prev.find((p) => p.inventoryItemId === item.id);
      if (existing) {
        return prev.map((p) =>
          p.inventoryItemId === item.id
            ? { ...p, quantity: p.quantity + quantity }
            : p,
        );
      }
      return [
        ...prev,
        {
          inventoryItemId: item.id,
          sku: item.sku,
          name: item.name,
          unit: item.unit,
          quantity,
        },
      ];
    });
    setSelectedItem("");
    setQty("1");
  };

  const requestParts = async () => {
    if (draft.length === 0) return;
    try {
      if (!user) throw new Error("Sign in before requesting parts.");
      await createRequest.mutateAsync({
        jobOrderId,
        jobOrderAssigneeIds: assigneeIds,
        items: draft,
        requestedBy: {
          id: user.id,
          name: user.full_name,
          role: user.role,
          permissions,
        },
      });
      toast.success("Parts request created", {
        description: "Stock reserved; awaiting approval.",
      });
      setDraft([]);
    } catch {
      toast.error("Couldn't create parts request.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Build a new request */}
      {canRequest ? (
        <Card>
          <CardHeader>
            <CardTitle>Required parts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Part
                </label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a part" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((i) => (
                      <SelectItem key={i.id} value={String(i.id)}>
                        {i.name} · {availableStock(i)} {i.unit} available
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full space-y-1.5 sm:w-24">
                <label className="text-xs font-medium text-muted-foreground">
                  Qty
                </label>
                <Input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={addDraftPart}
                disabled={!selectedItem}
              >
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>

            {draft.length > 0 ? (
              <div className="space-y-2">
                {draft.map((p) => (
                  <div
                    key={p.inventoryItemId}
                    className="flex items-center justify-between gap-3 rounded-lg border p-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {p.name}{" "}
                        <span className="text-muted-foreground">
                          ×{p.quantity}
                        </span>
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {p.sku}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Not Requested</Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          setDraft((prev) =>
                            prev.filter(
                              (d) => d.inventoryItemId !== p.inventoryItemId,
                            ),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    onClick={requestParts}
                    disabled={createRequest.isPending}
                  >
                    <PackageCheck className="h-4 w-4" />
                    {createRequest.isPending ? "Requesting…" : "Request parts"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add the parts this job order needs, then raise a request.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Request history */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Parts Requests
        </h3>
        {requests.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="No parts requests yet"
            description="Requested parts appear here with their approval status."
          />
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const def = getPartsRequestStatus(request.status);
              const tone = TONE[def.tone];
              return (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {request.code}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                            tone.badge,
                          )}
                        >
                          <span
                            className={cn("h-1.5 w-1.5 rounded-full", tone.dot)}
                          />
                          {def.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {request.requestedBy} ·{" "}
                        {formatRelativeTime(request.updatedAt)}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1">
                      {request.items.map((item) => (
                        <li
                          key={item.inventoryItemId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-foreground">{item.name}</span>
                          <span className="text-muted-foreground">
                            ×{item.quantity} {item.unit}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {request.decision ? (
                      <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {request.status === "rejected" ? "Rejected" : "Approved"} by {request.decision.actorName}
                        </span>
                        {request.decision.note ? ` · ${request.decision.note}` : ""}
                      </div>
                    ) : request.status === "pending" ? (
                      <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                        Awaiting approval in My Approvals.
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
