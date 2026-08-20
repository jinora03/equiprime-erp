import { delay } from "@/services/mock/delay";
import { matchesOrganizationScope } from "@/services/mock/scope";
import type { OrganizationScope } from "@/types";
import { equipmentSeed } from "./data";
import type { Equipment } from "./types";

const data: Equipment[] = equipmentSeed.map((e) => ({ ...e }));

export const equipmentService = {
  list(scope?: OrganizationScope): Promise<Equipment[]> {
    return delay(
      data
        .filter((equipment) => matchesOrganizationScope(equipment, scope))
        .map((equipment) => ({ ...equipment })),
    );
  },
  listByCustomer(
    customerId: number,
    scope?: OrganizationScope,
  ): Promise<Equipment[]> {
    return delay(
      data
        .filter(
          (equipment) =>
            equipment.customerId === customerId &&
            matchesOrganizationScope(equipment, scope),
        )
        .map((equipment) => ({ ...equipment })),
    );
  },
  get(id: number, scope?: OrganizationScope): Promise<Equipment | null> {
    return delay(
      data.find(
        (equipment) =>
          equipment.id === id && matchesOrganizationScope(equipment, scope),
      ) ?? null,
    );
  },
};
