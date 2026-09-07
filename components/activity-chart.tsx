"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
export function ActivityChart({
  data,
}: {
  data: { day: string; clicks: number }[];
}) {
  return (
    <div
      className="chart"
      role="img"
      aria-label={`Daily click activity: ${data.reduce((sum, day) => sum + day.clicks, 0)} clicks across ${data.length} days. Dates in UTC.`}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart
          data={data}
          margin={{ top: 12, right: 12, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="clickFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5265df" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#5265df" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#edf0f5"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="day"
            tickFormatter={(v: string) =>
              new Date(v).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })
            }
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#8a91a3" }}
            minTickGap={35}
            dy={10}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#8a91a3" }}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e7eaf1",
              borderRadius: 12,
              fontSize: 13,
            }}
            labelFormatter={(v) => String(v)}
          />
          <Area
            isAnimationActive={false}
            type="monotone"
            dataKey="clicks"
            name="Clicks"
            stroke="#5265df"
            strokeWidth={2.5}
            fill="url(#clickFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
