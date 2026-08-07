'use client';

import { cn } from '@/lib/utils';

interface UptimeBarProps {
  label: string;
  uptime: number;
  color?: string;
  className?: string;
}

export function UptimeBar({ label, uptime, color = '#10B981', className }: UptimeBarProps) {
  const clampedUptime = Math.min(Math.max(uptime, 0), 100);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-lg font-bold" style={{ color }}>
          {clampedUptime.toFixed(2)}%
        </span>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${clampedUptime}%`,
            backgroundColor: color,
          }}
        />
        {/* 99.9% marker */}
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-red-500/50"
          style={{ left: '99.9%' }}
          title="99.9% SLA"
        />
        {/* 99.99% marker */}
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-amber-500/50"
          style={{ left: '99.99%' }}
          title="99.99% SLA"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>99.9%</span>
        <span>99.99%</span>
        <span>100%</span>
      </div>
    </div>
  );
}