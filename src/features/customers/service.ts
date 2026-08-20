import { delay } from "@/services/mock/delay";
import { matchesOrganizationScope } from "@/services/mock/scope";
import type { OrganizationScope } from "@/types";
import { customerSeed } from "./data";
import type { Customer } from "./types";

/** Mock customer service; scope mirrors the future tenant/branch API boundary. */
const data: Customer[] = customerSeed.map((c) => ({ ...c }));

export const customerService = {
  list(scope?: OrganizationScope): Promise<Customer[]> {
    return delay(
      data
        .filter((customer) => matchesOrganizationScope(customer, scope))
        .map((customer) => ({ ...customer })),
    );
  },
  get(id: number, scope?: OrganizationScope): Promise<Customer | null> {
    return delay(
      data.find(
        (customer) =>
          customer.id === id && matchesOrganizationScope(customer, scope),
      ) ?? null,
    );
  },
};
