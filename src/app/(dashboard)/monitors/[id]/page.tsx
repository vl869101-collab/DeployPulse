'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MonitorDetails } from '@/lib/api-client';
import { getLocalMonitors } from '@/lib/monitor-store';
import { generateLatencyData, generateMockChecks } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pencil, Pause, Clock, Activity, Globe, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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

  // Mock data for charts
  const latencyData = generateLatencyData(24);
  const checks = generateMockChecks(id, 50);

  const statusColor: Record<string, string> = {
    up: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    down: 'bg-red-500/15 text-red-400 border-red-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    degraded: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    disabled: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };

  // Calculate stats from mock data
  const avgLatency = latencyData.reduce((sum, d) => sum + d.latency, 0) / latencyData.length;
  const maxLatency = Math.max(...latencyData.map((d) => d.latency));
  const minLatency = Math.min(...latencyData.map((d) => d.latency));
  const upChecks = checks.filter((c) => c.status === 'up').length;
  const uptimePercent = checks.length > 0 ? (upChecks / checks.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{uptimePercent.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">{upChecks} of {checks.length} checks passing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLatency.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">Min: {minLatency.toFixed(0)}ms · Max: {maxLatency.toFixed(0)}ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Check</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitor.lastCheck ? '2m ago' : 'Never'}</div>
            <p className="text-xs text-muted-foreground">{monitor.lastStatusCode ?? '—'} status code</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold uppercase">{monitor.type}</div>
            <p className="text-xs text-muted-foreground">Every {monitor.interval}s</p>
          </CardContent>
        </Card>
      </div>

      {/* Latency Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} unit="ms" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Check History */}
      <Card>
        <CardHeader>
          <CardTitle>Check History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checks.slice(0, 10).map((check) => (
              <div key={check.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${check.status === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-sm">{check.statusCode}</span>
                  <span className="text-sm text-muted-foreground">{check.latency}ms</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {check.checkedAt ? new Date(check.checkedAt).toLocaleString() : '—'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
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
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{new Date(monitor.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{new Date(monitor.updatedAt).toLocaleDateString()}</span>
              </div>
              {monitor.tags.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tags</span>
                  <div className="flex gap-1">
                    {monitor.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
