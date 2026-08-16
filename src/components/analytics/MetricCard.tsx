'use client';

import { ReactNode, useId } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatLatency } from '@/lib/utils';

type MetricFormat = 'number' | 'percent' | 'ms';

interface MetricCardProps {
  title: string;
  value: number;
  format?: MetricFormat;
  trend?: number;
  goodWhenDown?: boolean;
  icon?: ReactNode;
  sparklineData?: number[];
  sparklineColor?: string;
  compareLabel?: string;
}

function formatMetricValue(value: number, format: MetricFormat): string {
  switch (format) {
    case 'percent':
      return `${value.toFixed(2)}%`;
    case 'ms':
      return formatLatency(value);
    default:
      return value.toLocaleString('en-US');
  }
}

export function MetricCard({
  title,
  value,
  format = 'number',
  trend,
  goodWhenDown = false,
  icon,
  sparklineData,
  sparklineColor = '#38BDF8',
  compareLabel,
}: MetricCardProps) {
  const gradientId = `metric-spark-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const hasTrend = trend !== undefined && Math.abs(trend) >= 0.01;
  const isGood = goodWhenDown ? (trend ?? 0) < 0 : (trend ?? 0) > 0;
  const TrendIcon = !hasTrend ? Minus : (trend ?? 0) > 0 ? TrendingUp : TrendingDown;
  const trendColor = !hasTrend ? 'text-muted-foreground' : isGood ? 'text-emerald-500' : 'text-red-500';

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{formatMetricValue(value, format)}</p>
          </div>
          {icon && <div className="rounded-lg bg-muted p-2 shrink-0">{icon}</div>}
        </div>

        {sparklineData && sparklineData.length > 1 && (
          <div className="mt-3 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sparklineData.map((point) => ({ value: point }))}
                margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={sparklineColor}
                  strokeWidth={1.5}
                  fill={`url(#${gradientId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={cn('flex items-center gap-1 font-medium', trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {hasTrend ? `${(trend ?? 0) > 0 ? '+' : ''}${(trend ?? 0).toFixed(1)}%` : '—'}
          </span>
          {compareLabel && <span className="truncate text-muted-foreground">{compareLabel}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
