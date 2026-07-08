import { delay } from "@/services/mock/delay";
import { equipmentSeed } from "./data";
import type { Equipment } from "./types";

const data: Equipment[] = equipmentSeed.map((e) => ({ ...e }));

export const equipmentService = {
  list(): Promise<Equipment[]> {
    return delay(data.map((e) => ({ ...e })));
  },
  listByCustomer(customerId: number): Promise<Equipment[]> {
    return delay(data.filter((e) => e.customerId === customerId));
  },
  get(id: number): Promise<Equipment | null> {
    return delay(data.find((e) => e.id === id) ?? null);
  },
};
