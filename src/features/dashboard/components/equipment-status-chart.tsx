import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { EquipmentStatusPoint } from "../data";

export function EquipmentStatusChart({
  data,
}: {
  data: EquipmentStatusPoint[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[160px] w-[160px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                background: "hsl(var(--popover))",
                color: "hsl(var(--popover-foreground))",
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">Units</span>
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-1">
        {data.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <span className="font-medium text-foreground">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
