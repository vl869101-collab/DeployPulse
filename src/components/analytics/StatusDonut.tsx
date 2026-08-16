'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartTooltip } from '@/components/analytics/ChartTooltip';
import type { StatusDistribution } from '@/lib/analytics-data';

interface StatusDonutProps {
  data: StatusDistribution;
}

const STATUS_COLORS = {
  up: '#10B981',
  down: '#EF4444',
  degraded: '#F59E0B',
} as const;

export function StatusDonut({ data }: StatusDonutProps) {
  const total = data.up + data.down + data.degraded;
  const uptime = total > 0 ? (data.up / total) * 100 : 0;

  const segments = [
    { name: 'Up', value: data.up, color: STATUS_COLORS.up },
    { name: 'Down', value: data.down, color: STATUS_COLORS.down },
    { name: 'Degraded', value: data.degraded, color: STATUS_COLORS.degraded },
  ];
  const chartData = segments.filter((segment) => segment.value > 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <div className="relative h-[220px] w-full max-w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((segment) => (
                <Cell key={segment.name} fill={segment.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip format={(v) => v.toLocaleString('en-US')} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight">{uptime.toFixed(2)}%</span>
          <span className="text-xs text-muted-foreground">uptime</span>
        </div>
      </div>

      <div className="w-full space-y-2 sm:w-48">
        {segments.map((segment) => {
          const share = total > 0 ? (segment.value / total) * 100 : 0;
          return (
            <div
              key={segment.name}
              className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                {segment.name}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {segment.value.toLocaleString('en-US')} · {share.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
