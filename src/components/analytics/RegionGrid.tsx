'use client';

import { Globe2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatLatency } from '@/lib/utils';
import type { RegionalData } from '@/lib/analytics-data';

interface RegionGridProps {
  regions: RegionalData[];
}

const statusConfig: Record<RegionalData['status'], { label: string; badge: string; line: string }> = {
  healthy: {
    label: 'Healthy',
    badge: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
    line: 'border-t-emerald-500',
  },
  degraded: {
    label: 'Degraded',
    badge: 'border-amber-500/30 bg-amber-500/15 text-amber-400',
    line: 'border-t-amber-500',
  },
  down: {
    label: 'Down',
    badge: 'border-red-500/30 bg-red-500/15 text-red-400',
    line: 'border-t-red-500',
  },
};

export function RegionGrid({ regions }: RegionGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {regions.map((region) => {
        const config = statusConfig[region.status];
        return (
          <div key={region.region} className={cn('rounded-xl border border-t-2 bg-card p-4', config.line)}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Globe2 className="h-4 w-4 text-muted-foreground" />
                {region.region}
              </span>
              <Badge variant="outline" className={cn('shrink-0', config.badge)}>
                {config.label}
              </Badge>
            </div>

            <p className="mt-3 text-2xl font-bold tracking-tight">{formatLatency(region.avgLatency)}</p>
            <p className="text-xs text-muted-foreground">avg latency</p>

            <div className="mt-3 space-y-1.5 border-t pt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-medium tabular-nums">{region.uptime.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Checks</span>
                <span className="font-medium tabular-nums">{region.checks.toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
