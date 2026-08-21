import { useMemo, useState } from "react";
import { Boxes } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { useInventory } from "../hooks";
import { availableStock, isLowStock } from "../types";

const ALL = "all";

export function InventoryPage() {
  const { data: items = [], isLoading } = useInventory();
  const [warehouse, setWarehouse] = useState(ALL);

  const warehouses = useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.warehouseName))).sort(),
    [items],
  );

  const filtered =
    warehouse === ALL
      ? items
      : items.filter((i) => i.warehouseName === warehouse);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Warehouse stock levels. Only released parts requests consume on-hand stock."
        actions={
          <Select value={warehouse} onValueChange={setWarehouse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All warehouses</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Card>
        {isLoading ? (
          <TableSkeleton columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No inventory items"
            description="No stock records for this warehouse."
            className="m-4"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">On Hand</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const available = availableStock(item);
                const low = isLowStock(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-mono text-xs text-muted-foreground">
                        {item.sku}
                      </p>
                      <p className="font-medium text-foreground">{item.name}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.warehouseName}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {item.onHand} {item.unit}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {item.reserved}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={low ? "warning" : "success"}>
                        {available} {item.unit}
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
