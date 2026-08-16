'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { createSortableColumn, DataTable } from '@/components/ui/table';
import { cn, formatLatency, formatUptime } from '@/lib/utils';
import type { MonitorPerformance } from '@/lib/analytics-data';

interface MonitorPerformanceTableProps {
  data: MonitorPerformance[];
  limit?: number;
}

function latencyTone(value: number): string {
  if (value < 150) return 'text-emerald-400';
  if (value < 400) return 'text-amber-400';
  return 'text-red-400';
}

function uptimeTone(value: number): string {
  if (value >= 99.9) return 'text-emerald-400';
  if (value >= 98) return 'text-amber-400';
  return 'text-red-400';
}

function TrendCell({ value }: { value: number }) {
  const hasTrend = Math.abs(value) >= 0.05;
  const TrendIcon = !hasTrend ? Minus : value > 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        'flex items-center gap-1 font-medium tabular-nums',
        !hasTrend ? 'text-muted-foreground' : value > 0 ? 'text-red-500' : 'text-emerald-500'
      )}
    >
      <TrendIcon className="h-3.5 w-3.5" />
      {hasTrend ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` : '—'}
    </span>
  );
}

export function MonitorPerformanceTable({ data, limit = 10 }: MonitorPerformanceTableProps) {
  const rows = [...data].sort((a, b) => b.avgLatency - a.avgLatency).slice(0, limit);

  const columns: ColumnDef<MonitorPerformance>[] = [
    createSortableColumn<MonitorPerformance>('name', 'Monitor', ({ getValue }) => (
      <span className="font-medium">{String(getValue())}</span>
    )),
    createSortableColumn<MonitorPerformance>('avgLatency', 'Avg Latency', ({ getValue }) => (
      <span className={cn('font-medium tabular-nums', latencyTone(Number(getValue())))}>
        {formatLatency(Number(getValue()))}
      </span>
    )),
    createSortableColumn<MonitorPerformance>('p95', 'P95', ({ getValue }) => (
      <span className={cn('font-medium tabular-nums', latencyTone(Number(getValue())))}>
        {formatLatency(Number(getValue()))}
      </span>
    )),
    createSortableColumn<MonitorPerformance>('uptime', 'Uptime', ({ getValue }) => (
      <span className={cn('font-medium tabular-nums', uptimeTone(Number(getValue())))}>
        {formatUptime(Number(getValue()))}
      </span>
    )),
    createSortableColumn<MonitorPerformance>('trend', 'Trend', ({ getValue }) => (
      <TrendCell value={Number(getValue())} />
    )),
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      initialSorting={[{ id: 'avgLatency', desc: true }]}
    />
  );
}
