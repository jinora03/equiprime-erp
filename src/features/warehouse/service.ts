import { delay } from "@/services/mock/delay";
import { matchesOrganizationScope } from "@/services/mock/scope";
import type { OrganizationScope } from "@/types";
import { warehouseSeed } from "./data";
import type { Warehouse } from "./types";

const data: Warehouse[] = warehouseSeed.map((w) => ({ ...w }));

export const warehouseService = {
  list(scope?: OrganizationScope): Promise<Warehouse[]> {
    return delay(
      data
        .filter((warehouse) => matchesOrganizationScope(warehouse, scope))
        .map((warehouse) => ({ ...warehouse })),
    );
  },
};
