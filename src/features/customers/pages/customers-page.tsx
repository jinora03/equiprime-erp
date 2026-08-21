import { Contact } from "lucide-react";

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
import { useEquipment } from "@/features/equipment/hooks";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { useCustomers } from "../hooks";

export function CustomersPage() {
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: equipment = [], isLoading: equipmentLoading } = useEquipment();
  const isLoading = customersLoading || equipmentLoading;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customers"
        description="Customer accounts for the active branch and the equipment registered to them."
      />

      <Card>
        {isLoading ? (
          <TableSkeleton columns={5} />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Contact}
            title="No customers"
            description="No customer records are available for this branch."
            className="m-4"
          />
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Customer</TableHead>
                <TableHead className="min-w-[150px]">Contact</TableHead>
                <TableHead className="min-w-[190px]">Email</TableHead>
                <TableHead className="min-w-[145px]">Phone</TableHead>
                <TableHead className="w-[100px] text-right">
                  Equipment
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const equipmentCount = equipment.filter(
                  (item) => item.customerId === customer.id,
                ).length;
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <p className="font-mono text-xs text-muted-foreground">
                        {customer.code}
                      </p>
                      <p className="font-medium text-foreground">
                        {customer.name}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {customer.contact}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {customer.email}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {customer.phone}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className="min-w-7 justify-center tabular-nums"
                      >
                        {equipmentCount}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
