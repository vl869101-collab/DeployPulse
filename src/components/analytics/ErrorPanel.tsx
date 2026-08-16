'use client';

import { useState } from 'react';
import { AlertCircle, AlertOctagon, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { ErrorGroup } from '@/lib/analytics-data';

interface ErrorPanelProps {
  errors: ErrorGroup[];
}

function getErrorSeverity(count: number): { icon: typeof AlertTriangle; className: string } {
  if (count >= 50) return { icon: AlertOctagon, className: 'text-red-500' };
  if (count >= 15) return { icon: AlertTriangle, className: 'text-amber-500' };
  return { icon: AlertCircle, className: 'text-sky-500' };
}

export function ErrorPanel({ errors }: ErrorPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        <p className="text-sm font-medium">No errors detected</p>
        <p className="text-xs text-muted-foreground">All monitors are healthy in this period</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {errors.map((group) => {
        const isOpen = expanded === group.message;
        const severity = getErrorSeverity(group.count);
        const SeverityIcon = severity.icon;

        return (
          <div key={group.message}>
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : group.message)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/40"
            >
              <SeverityIcon className={cn('h-4 w-4 shrink-0', severity.className)} />
              <span className="min-w-0 flex-1 truncate font-mono text-sm">{group.message}</span>
              <Badge variant="outline" className="shrink-0 tabular-nums">
                {group.count.toLocaleString('en-US')}
              </Badge>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </button>

            {isOpen && (
              <div className="space-y-3 bg-muted/20 px-4 pb-4 pt-3 sm:px-6">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Affected monitors
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.monitors.map((monitor) => (
                      <Badge key={monitor} variant="secondary">
                        {monitor}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last seen {formatRelativeTime(group.lastSeen)}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
