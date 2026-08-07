'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatDateTime } from '@/lib/utils';
import { Check } from '@/types';

interface LatencyChartProps {
  checks: Check[];
  className?: string;
  height?: number;
  period?: 'hour' | 'day' | 'week' | 'month';
}

export function LatencyChart({
  checks,
  className,
  height = 300,
  period = 'day',
}: LatencyChartProps) {
  if (checks.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardContent className="py-8 text-center h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Checks will appear here once the monitor runs
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedChecks = [...checks].sort((a, b) => a.checkedAt.getTime() - b.checkedAt.getTime());

  const chartData = sortedChecks.map((check) => ({
    time: formatDateTime(check.checkedAt),
    latency: check.latency || 0,
    status: check.status,
    statusCode: check.statusCode,
  }));

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Latency ({period})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}ms`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value) => [`${value}ms`, 'Latency']}
              />
              <Line
                type="natural"
                dataKey="latency"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Min: {Math.min(...chartData.map(d => d.latency))}ms</span>
          <span>Avg: {Math.round(chartData.reduce((a, b) => a + b.latency, 0) / chartData.length)}ms</span>
          <span>Max: {Math.max(...chartData.map(d => d.latency))}ms</span>
        </div>
      </CardContent>
    </Card>
  );
}