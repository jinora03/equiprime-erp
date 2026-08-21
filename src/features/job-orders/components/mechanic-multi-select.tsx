import { ChevronDown, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { User } from "@/types";

interface MechanicMultiSelectProps {
  mechanics: User[];
  value: number[];
  onChange: (ids: number[]) => void;
}

export function MechanicMultiSelect({
  mechanics,
  value,
  onChange,
}: MechanicMultiSelectProps) {
  const selected = mechanics.filter((mechanic) => value.includes(mechanic.id));

  const toggle = (id: number) => {
    onChange(
      value.includes(id)
        ? value.filter((selectedId) => selectedId !== id)
        : [...value, id],
    );
  };

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
            aria-label="Select assigned mechanics"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {selected.length === 0
                  ? "Select mechanics"
                  : `${selected.length} mechanic${selected.length === 1 ? "" : "s"} selected`}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-2">
          {mechanics.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              No active mechanics are available for this branch.
            </p>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {mechanics.map((mechanic) => (
                <div
                  key={mechanic.id}
                  className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-muted/60"
                >
                  <Checkbox
                    id={`mechanic-${mechanic.id}`}
                    checked={value.includes(mechanic.id)}
                    onCheckedChange={() => toggle(mechanic.id)}
                    aria-label={`Assign ${mechanic.full_name}`}
                  />
                  <label
                    htmlFor={`mechanic-${mechanic.id}`}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="block truncate text-sm font-medium text-foreground">
                      {mechanic.full_name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {mechanic.job_title ?? mechanic.department}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((mechanic) => (
            <Badge key={mechanic.id} variant="secondary" className="max-w-full">
              <span className="truncate">{mechanic.full_name}</span>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
