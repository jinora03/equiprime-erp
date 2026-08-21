import { Forklift } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/features/customers/hooks";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { useEquipment } from "../hooks";
import type { EquipmentStatus } from "../types";

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  in_use: "In use",
  under_service: "Under service",
  idle: "Idle",
  decommissioned: "Decommissioned",
};

const STATUS_VARIANT: Record<
  EquipmentStatus,
  "success" | "warning" | "secondary" | "destructive"
> = {
  in_use: "success",
  under_service: "warning",
  idle: "secondary",
  decommissioned: "destructive",
};

export function EquipmentPage() {
  const { data: equipment = [], isLoading: equipmentLoading } = useEquipment();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const isLoading = equipmentLoading || customersLoading;
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Equipment"
        description="Customer-owned equipment registered to the active branch."
      />

      <Card>
        {isLoading ? (
          <TableSkeleton columns={5} />
        ) : equipment.length === 0 ? (
          <EmptyState
            icon={Forklift}
            title="No equipment"
            description="No equipment records are available for this branch."
            className="m-4"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-mono text-xs text-muted-foreground">
                      {item.code}
                    </p>
                    <p className="font-medium text-foreground">{item.name}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.type}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.model}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customerById.get(item.customerId)?.name ?? "Unknown customer"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[item.status]}>
                      {STATUS_LABEL[item.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
