import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import { userService } from "@/services/user.service";
import type { UserCreateInput, UserFilters, UserUpdateInput } from "@/types";

export function useUsers(filters: UserFilters) {
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  return useQuery({
    queryKey: queryKeys.users.list(filters, scopeKey),
    queryFn: () => userService.list(filters, scope),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: number, enabled = true) {
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  return useQuery({
    queryKey: queryKeys.users.detail(id, scopeKey),
    queryFn: () => userService.get(id, scope),
    enabled,
  });
}


export function useTechnicians() {
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  return useQuery({
    queryKey: queryKeys.users.technicians(scopeKey),
    queryFn: () => userService.listTechnicians(scope),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UserCreateInput) => userService.create(input),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.users.all }),
        qc.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UserUpdateInput }) =>
      userService.update(id, input),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.users.all }),
        qc.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.users.all }),
        qc.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]),
  });
}
