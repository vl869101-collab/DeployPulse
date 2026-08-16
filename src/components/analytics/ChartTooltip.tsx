'use client';

import type { TooltipContentProps } from 'recharts';

interface ChartTooltipProps extends Partial<TooltipContentProps<number, string>> {
  format?: (value: number, name: string) => string;
  hideLabel?: boolean;
}

export function ChartTooltip({ active, payload, label, format, hideLabel }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="min-w-[150px] rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-xs shadow-xl">
      {!hideLabel && label !== undefined && label !== '' && (
        <p className="mb-1.5 font-medium text-slate-200">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={`${entry.dataKey ?? entry.name}`} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color ?? '#94A3B8' }}
              />
              {String(entry.name ?? entry.dataKey)}
            </span>
            <span className="font-medium tabular-nums text-slate-100">
              {format ? format(Number(entry.value), String(entry.name ?? '')) : String(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
