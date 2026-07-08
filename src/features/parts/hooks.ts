import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { partsRequestService } from "./service";
import type { PartsRequestInput, PartsRequestStatus } from "./types";

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
    qc.invalidateQueries({ queryKey: queryKeys.partsRequests.root });
    qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
  };
}

export function useCreatePartsRequest() {
  const invalidate = useInvalidateParts();
  return useMutation({
    mutationFn: (input: PartsRequestInput) => partsRequestService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdatePartsRequestStatus() {
  const invalidate = useInvalidateParts();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: PartsRequestStatus }) =>
      partsRequestService.setStatus(id, status),
    onSuccess: invalidate,
  });
}
