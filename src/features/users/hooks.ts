import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { userService } from "@/services/user.service";
import type { UserCreateInput, UserFilters, UserUpdateInput } from "@/types";

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.get(id),
    enabled,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UserCreateInput) => userService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UserUpdateInput }) =>
      userService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}
