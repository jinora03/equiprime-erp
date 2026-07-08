import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_COLORS, workOverview } from "../data";

export function WorkOverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart
        data={workOverview}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <defs>
          <linearGradient id="gJob" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.25} />
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gSvc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.brand} stopOpacity={0.22} />
            <stop offset="95%" stopColor={CHART_COLORS.brand} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.2} />
            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 65% / 0.18)" vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }}
          width={40}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid hsl(214 32% 91%)",
            boxShadow: "0 8px 24px -6px rgb(16 24 40 / 0.12)",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="jobOrders"
          name="Job Orders"
          stroke={CHART_COLORS.primary}
          strokeWidth={2.5}
          fill="url(#gJob)"
        />
        <Area
          type="monotone"
          dataKey="serviceRequests"
          name="Service Requests"
          stroke={CHART_COLORS.brand}
          strokeWidth={2.5}
          fill="url(#gSvc)"
        />
        <Area
          type="monotone"
          dataKey="completed"
          name="Completed"
          stroke={CHART_COLORS.success}
          strokeWidth={2.5}
          fill="url(#gDone)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
