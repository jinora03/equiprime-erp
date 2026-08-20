import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBranches } from "@/hooks/use-organizations";
import { cn } from "@/lib/utils";
import {
  useOrganizationScope,
  useOrganizationStore,
} from "@/store/organization.store";

export function CompanySwitcher() {
  const scope = useOrganizationScope();
  const setOrganizationScope = useOrganizationStore(
    (state) => state.setOrganizationScope,
  );
  const { data: branches = [] } = useBranches(scope.companyId);
  const active = branches.find((branch) => branch.id === scope.branchId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="hidden h-9 max-w-[200px] justify-between gap-2 lg:flex"
        >
          <span className="truncate text-sm">
            {active?.displayName ?? "Select branch"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch company / branch</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() =>
              setOrganizationScope({
                companyId: branch.companyId,
                branchId: branch.id,
              })
            }
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="text-sm">{branch.displayName}</span>
              <span className="text-xs text-muted-foreground">
                {branch.region}
              </span>
            </div>
            <Check
              className={cn(
                "h-4 w-4 text-primary",
                active?.id === branch.id ? "opacity-100" : "opacity-0",
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
