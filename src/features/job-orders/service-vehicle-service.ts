import { delay } from "@/services/mock/delay";
import { matchesOrganizationScope } from "@/services/mock/scope";
import type { OrganizationScope } from "@/types";
import { serviceVehicleSeed } from "./service-vehicle-data";
import type { ServiceVehicle } from "./types";

const data: ServiceVehicle[] = serviceVehicleSeed.map((vehicle) => ({ ...vehicle }));

export const serviceVehicleService = {
  list(scope?: OrganizationScope): Promise<ServiceVehicle[]> {
    return delay(
      data
        .filter(
          (vehicle) =>
            vehicle.status === "active" && matchesOrganizationScope(vehicle, scope),
        )
        .map((vehicle) => ({ ...vehicle })),
    );
  },

  get(id: number, scope?: OrganizationScope): Promise<ServiceVehicle | null> {
    return delay(
      data.find(
        (vehicle) =>
          vehicle.id === id &&
          vehicle.status === "active" &&
          matchesOrganizationScope(vehicle, scope),
      ) ?? null,
    );
  },
};
