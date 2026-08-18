'use client';

import { ReactNode } from 'react';
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
  AreaChart,
  Area,
} from 'recharts';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartCard({ title, description, children, className, action }: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="pb-0">{children}</CardContent>
    </Card>
  );
}

interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
}

export function Sparkline({ data, color = 'hsl(var(--primary))', className }: SparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={40} className={cn('max-w-[200px]', className)}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill="url(#sparkline-gradient)"
          opacity={0.8}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface LatencyChartProps {
  data: { time: string; latency: number; timestamp: number }[];
  className?: string;
}

export function LatencyChart({ data, className }: LatencyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300} className={className}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="time"
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.getHours() === 0 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
          }}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(value) => `${value}ms`}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelFormatter={(value) => new Date(Number(value)).toLocaleString()}
           
          formatter={(value: any) => (value !== undefined ? `${Number(value).toFixed(0)}ms` : 'N/A')}
        />
        <Line
          type="monotone"
          dataKey="latency"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface UptimeChartProps {
  data: { date: string; uptime: number }[];
  className?: string;
}

export function UptimeChart({ data, className }: UptimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200} className={className}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="uptime-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(value) => value.toFixed(1) + '%'}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          domain={[99, 100.1]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelFormatter={(value) => new Date(Number(value)).toLocaleDateString()}
           
          formatter={(value: any) => (value !== undefined ? `${Number(value).toFixed(2)}%` : 'N/A')}
        />
        <Area
          type="monotone"
          dataKey="uptime"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          fill="url(#uptime-gradient)"
          opacity={0.8}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}