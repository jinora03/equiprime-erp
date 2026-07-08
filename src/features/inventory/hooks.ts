import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { inventoryService } from "./service";

export function useInventory() {
  return useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: () => inventoryService.list(),
  });
}
