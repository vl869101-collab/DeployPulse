'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Search } from 'lucide-react';
import { fetchLogs } from '@/lib/api-client';
import type { LogEntry } from '@/lib/api-client';
import { cn, formatDateTime } from '@/lib/utils';

type StatusFilter = 'all' | '2xx' | '3xx' | '4xx' | '5xx';

function statusClass(code: number): string {
  if (code >= 500) return 'text-red-400';
  if (code >= 400) return 'text-amber-400';
  if (code >= 300) return 'text-blue-400';
  return 'text-emerald-400';
}

function isError(code: number): boolean {
  return code >= 500;
}

export default function LogsPage() {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [search, setSearch] = React.useState('');

  const load = React.useCallback(() => {
    fetchLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = React.useMemo(() => {
    return logs.filter((log) => {
      if (statusFilter !== 'all') {
        const range = Number(statusFilter[0]) * 100;
        if (log.statusCode < range || log.statusCode >= range + 100) return false;
      }
      if (search && !log.path.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [logs, statusFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground">Real-time request logs from the edge network</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
          <span>·</span>
          <span>Refreshes every 5s</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by path..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-8"
          />
        </div>
        <div className="flex gap-2">
          {(['all', '2xx', '3xx', '4xx', '5xx'] as StatusFilter[]).map((f) => (
            <Button
              key={f}
              variant={statusFilter === f ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(f)}
              className={cn(
                f === '5xx' && statusFilter !== f && 'text-red-400 hover:text-red-300'
              )}
            >
              {f === 'all' ? 'All' : f}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No logs match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((log) => {
                  const error = isError(log.statusCode);
                  return (
                    <TableRow
                      key={log.id}
                      className={cn(
                        error && 'bg-red-500/5 hover:bg-red-500/10 border-l-2 border-l-red-500'
                      )}
                    >
                      <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {formatDateTime(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <span className={cn('font-mono text-sm font-semibold', statusClass(log.statusCode))}>
                          {log.statusCode}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.host}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {log.path}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.level === 'error' && <FileText className="h-4 w-4 text-red-400 shrink-0" />}
                          <span className={cn('text-sm', error ? 'text-red-300' : 'text-muted-foreground')}>
                            {log.message}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
