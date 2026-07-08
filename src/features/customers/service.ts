import { delay } from "@/services/mock/delay";
import { customerSeed } from "./data";
import type { Customer } from "./types";

/**
 * Mock customer service. Mirrors a future `GET /customers` REST endpoint — swap
 * the `delay()` bodies for `apiClient` calls with no change to consumers.
 */
const data: Customer[] = customerSeed.map((c) => ({ ...c }));

export const customerService = {
  list(): Promise<Customer[]> {
    return delay(data.map((c) => ({ ...c })));
  },
  get(id: number): Promise<Customer | null> {
    return delay(data.find((c) => c.id === id) ?? null);
  },
};
