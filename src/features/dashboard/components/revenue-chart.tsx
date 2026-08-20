import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { CHART_COLORS, type RevenueTrendPoint } from "../data";

export function RevenueChart({ data }: { data: RevenueTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }}
        />
        <Tooltip
          formatter={(value: number) => [`₱${value}M`, "Revenue"]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid hsl(214 32% 91%)",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS.success}
          strokeWidth={2.5}
          fill="url(#gRev)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
