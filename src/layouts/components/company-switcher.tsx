import { useState } from "react";
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
import { cn } from "@/lib/utils";

const COMPANIES = [
  { id: "main", name: "Equiprime — Main", region: "Manila HQ" },
  { id: "cebu", name: "Equiprime — Cebu", region: "Visayas Branch" },
  { id: "davao", name: "Equiprime — Davao", region: "Mindanao Branch" },
];

export function CompanySwitcher() {
  const [active, setActive] = useState(COMPANIES[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="hidden h-9 max-w-[200px] justify-between gap-2 lg:flex"
        >
          <span className="truncate text-sm">{active.name}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {COMPANIES.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => setActive(company)}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="text-sm">{company.name}</span>
              <span className="text-xs text-muted-foreground">
                {company.region}
              </span>
            </div>
            <Check
              className={cn(
                "h-4 w-4 text-primary",
                active.id === company.id ? "opacity-100" : "opacity-0",
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
