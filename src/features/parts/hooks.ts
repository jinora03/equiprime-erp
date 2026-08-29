import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { partsRequestService } from "./service";
import type { CreatePartsRequestRequest } from "./types";

export function usePartsRequests(jobOrderId: number) {
  return useQuery({
    queryKey: queryKeys.partsRequests.byJobOrder(jobOrderId),
    queryFn: () => partsRequestService.listByJobOrder(jobOrderId),
    enabled: !Number.isNaN(jobOrderId),
  });
}

function useInvalidateParts() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.partsRequests.root });
    void qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
    void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    void qc.invalidateQueries({ queryKey: queryKeys.approvals.all });
    void qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };
}

export function useCreatePartsRequest() {
  const invalidate = useInvalidateParts();
  return useMutation({
    mutationFn: (input: CreatePartsRequestRequest) => partsRequestService.create(input),
    onSuccess: invalidate,
  });
}
