import { cn } from "@/lib/utils";
import type { EquipmentStatusPoint } from "../data";

export function EquipmentStatusChart({
  data,
}: {
  data: EquipmentStatusPoint[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div
          className="flex h-3.5 w-full overflow-hidden rounded-sm bg-muted"
          role="img"
          aria-label={
            total > 0
              ? `Equipment status distribution across ${total} units`
              : "No equipment units in this branch"
          }
        >
          {data.map((item) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <span
                key={item.name}
                className="h-full transition-[width]"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                }}
                title={`${item.name}: ${item.value} (${Math.round(percentage)}%)`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>0</span>
          <span className="tabular-nums">{total} units</span>
        </div>
      </div>

      <ul className="grid grid-cols-2 overflow-hidden rounded-md border bg-background">
        {data.map((item, index) => {
          const percentage =
            total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <li
              key={item.name}
              className={cn(
                "flex min-h-[78px] min-w-0 flex-col justify-between p-3",
                index % 2 === 0 && "border-r",
                index < 2 && "border-b",
              )}
            >
              <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name}</span>
              </div>
              <p className="mt-2 flex items-baseline gap-1.5 tabular-nums">
                <span className="text-base font-semibold text-foreground">
                  {item.value}
                </span>
                <span className="text-xs text-muted-foreground">{percentage}%</span>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
