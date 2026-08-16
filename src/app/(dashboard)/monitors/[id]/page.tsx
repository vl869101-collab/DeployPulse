'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { MonitorDetails } from '@/lib/api-client';
import { getLocalMonitors } from '@/lib/monitor-store';
import { LatencyChart } from '@/components/monitors/LatencyChart';
import { CheckHistory } from '@/components/monitors/CheckHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pencil, Pause } from 'lucide-react';
import Link from 'next/link';

export default function MonitorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [monitor, setMonitor] = React.useState<MonitorDetails | null>(null);

  React.useEffect(() => {
    const monitors = getLocalMonitors();
    const found = monitors.find((m) => m.id === id);
    setMonitor(found ? { ...found, checks: [] } : null);
  }, [id]);

  if (!monitor) {
    return (
      <div className="space-y-4">
        <Link href="/monitors" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to monitors
        </Link>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Monitor not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const checks = monitor.checks ?? [];

  const statusColor: Record<string, string> = {
    up: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    down: 'bg-red-500/15 text-red-400 border-red-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    degraded: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    disabled: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/monitors" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{monitor.name}</h1>
              <Badge variant="outline" className={statusColor[monitor.status]}>
                {monitor.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{monitor.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Play className="mr-2 h-4 w-4" />
            Run Check
          </Button>
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Pause className="mr-2 h-4 w-4" />
            Disable
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <LatencyChart checks={checks} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check History</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckHistory checks={checks} limit={20} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium uppercase">{monitor.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Interval</span>
                <span className="font-medium">{monitor.interval}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Timeout</span>
                <span className="font-medium">{monitor.timeout}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Retries</span>
                <span className="font-medium">{monitor.retries}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-medium">{monitor.uptime}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Check</span>
                <span className="font-medium">
                  {monitor.lastCheck ? new Date(monitor.lastCheck).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Status</span>
                <span className="font-medium">{monitor.lastStatusCode ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Latency</span>
                <span className="font-medium">{monitor.lastLatency ? `${monitor.lastLatency}ms` : '—'}</span>
              </div>
            </CardContent>
          </Card>

          {monitor.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {monitor.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
