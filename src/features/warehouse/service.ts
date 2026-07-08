import { delay } from "@/services/mock/delay";
import { warehouseSeed } from "./data";
import type { Warehouse } from "./types";

const data: Warehouse[] = warehouseSeed.map((w) => ({ ...w }));

export const warehouseService = {
  list(): Promise<Warehouse[]> {
    return delay(data.map((w) => ({ ...w })));
  },
};
