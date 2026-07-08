import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { equipmentService } from "./service";

export function useEquipment() {
  return useQuery({
    queryKey: queryKeys.equipment.all,
    queryFn: () => equipmentService.list(),
  });
}
