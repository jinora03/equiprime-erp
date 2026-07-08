import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { customerService } from "./service";

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: () => customerService.list(),
  });
}
