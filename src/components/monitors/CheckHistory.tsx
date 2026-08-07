'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { formatDateTime, formatDuration } from '@/lib/utils';
import { Check } from '@/types';

interface CheckHistoryProps {
  checks: Check[];
  className?: string;
  limit?: number;
}

export function CheckHistory({ checks, className, limit }: CheckHistoryProps) {
  const displayChecks = limit ? checks.slice(0, limit) : checks;

  if (displayChecks.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardContent className="py-8 text-center">
          <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <h3 className="mt-2 text-lg font-medium">No checks yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Checks will appear here once the monitor runs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Checks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response Time</TableHead>
              <TableHead>Status Code</TableHead>
              <TableHead className="text-right">Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayChecks.map((check) => (
              <TableRow key={check.id}>
                <TableCell className="font-mono text-sm">
                  {formatDateTime(check.checkedAt)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={check.status} />
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {check.latency ? formatDuration(check.latency) : '—'}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {check.statusCode || '—'}
                </TableCell>
                <TableCell className="text-right">
                  {check.error ? (
                    <span className="text-sm text-red-600 dark:text-red-400 max-w-xs truncate block">
                      {check.error}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {checks.length > (limit || checks.length) && (
          <div className="mt-4 text-center">
            <button className="text-sm text-primary hover:underline">
              View all {checks.length} checks
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}