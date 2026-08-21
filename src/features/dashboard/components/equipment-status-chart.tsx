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

      <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
        {data.map((item) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <li key={item.name} className="min-w-0 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name}</span>
              </div>
              <p className="mt-1 pl-4 font-medium tabular-nums text-foreground">
                {item.value}{" "}
                <span className="font-normal text-muted-foreground">· {percentage}%</span>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
