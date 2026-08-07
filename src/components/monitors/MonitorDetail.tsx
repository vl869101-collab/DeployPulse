'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { MonitorStatusBadge } from '@/components/ui/status-badge';
import {
  Globe,
  Clock,
  Zap,
  Server,
  Database,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PauseCircle,
  Loader2,
  RefreshCw,
  Folder,
  Calendar,
} from 'lucide-react';
import { Monitor, MonitorType, MonitorStatus, Check } from '@/types';
import { formatDateTime, formatLatency, truncate, getStatusColor } from '@/lib/utils';
import { LatencyChart } from '@/components/dashboard/ChartCard';
import { generateLatencyData } from '@/lib/mock-data';

const typeIcons: Record<MonitorType, React.ReactNode> = {
  http: <Globe className="h-4 w-4" />,
  https: <Globe className="h-4 w-4" />,
  tcp: <Server className="h-4 w-4" />,
  ping: <Database className="h-4 w-4" />,
  keyword: <Zap className="h-4 w-4" />,
  dns: <Globe className="h-4 w-4" />,
  ssl: <Server className="h-4 w-4" />,
  cron: <Clock className="h-4 w-4" />,
  webhook: <Zap className="h-4 w-4" />,
  health: <Server className="h-4 w-4" />,
  'background-job': <Database className="h-4 w-4" />,
};

const typeLabels: Record<MonitorType, string> = {
  http: 'HTTP',
  https: 'HTTPS',
  tcp: 'TCP',
  ping: 'Ping',
  keyword: 'Keyword',
  dns: 'DNS',
  ssl: 'SSL',
  cron: 'Cron',
  webhook: 'Webhook',
  health: 'Health',
  'background-job': 'Background Job',
};

const statusIcons: Record<MonitorStatus, React.ReactNode> = {
  up: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  down: <XCircle className="h-4 w-4 text-red-400" />,
  pending: <Loader2 className="h-4 w-4 animate-spin text-blue-400" />,
  degraded: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  disabled: <PauseCircle className="h-4 w-4 text-slate-400" />,
  maintenance: <PauseCircle className="h-4 w-4 text-slate-400" />,
};

interface MonitorDetailProps {
  monitor: Monitor;
  checkHistory: Check[];
  onAction?: (action: string) => void;
}

export function MonitorDetail({ monitor, checkHistory, onAction }: MonitorDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const latencyData = generateLatencyData(24);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            {typeIcons[monitor.type]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{monitor.name}</h1>
              <Badge variant="outline" className={getStatusColor(monitor.status)}>
                {statusIcons[monitor.status]}
                <span className="capitalize ml-1">{monitor.status}</span>
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">{truncate(monitor.url, 80)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onAction?.('check')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open URL
          </Button>
          <Button variant="outline" onClick={() => onAction?.('pause')}>
            Pause
          </Button>
          <Button onClick={() => onAction?.('edit')}>Edit</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatMetric
          label="Uptime (24h)"
          value={`${(monitor.uptime24h ?? monitor.uptime).toFixed(2)}%`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        />
        <StatMetric
          label="Uptime (7d)"
          value={`${(monitor.uptime7d ?? monitor.uptime).toFixed(2)}%`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        />
        <StatMetric
          label="Uptime (30d)"
          value={`${(monitor.uptime30d ?? monitor.uptime).toFixed(2)}%`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        />
        <StatMetric
          label="Avg Latency"
          value={formatLatency(
            checkHistory.reduce((a, b) => a + (b.latency ?? 0), 0) / (checkHistory.length || 1)
          )}
          icon={<Clock className="h-5 w-5 text-blue-400" />}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Check History</TabsTrigger>
          <TabsTrigger value="latency">Latency</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {checkHistory.slice(0, 10).map((check) => (
                    <div key={check.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className={cn('flex h-2 w-2 rounded-full', check.status === 'up' ? 'bg-emerald-400' : 'bg-red-400')} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-mono">{formatLatency(check.latency ?? 0)}</span>
                        {check.statusCode && <span>{check.statusCode}</span>}
                        <span>{formatDateTime(check.checkedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monitor Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Type" value={typeLabels[monitor.type]} icon={typeIcons[monitor.type]} />
                <InfoRow label="Interval" value={`${monitor.interval < 60 ? monitor.interval + 's' : monitor.interval / 60 + 'm'}`} icon={<Clock className="h-4 w-4" />} />
                <InfoRow label="Timeout" value={`${monitor.timeout}s`} icon={<Clock className="h-4 w-4" />} />
                <InfoRow label="Retries" value={monitor.retries.toString()} icon={<RefreshCw className="h-4 w-4" />} />
                <InfoRow label="Regions" value={(monitor.regions ?? []).join(', ')} icon={<Globe className="h-4 w-4" />} />
                <InfoRow label="Project" value={monitor.project?.name ?? '—'} icon={<Folder className="h-4 w-4" />} />
                <InfoRow label="Created" value={formatDateTime(monitor.createdAt)} icon={<Calendar className="h-4 w-4" />} />
                <InfoRow label="Last Updated" value={formatDateTime(monitor.updatedAt)} icon={<Clock className="h-4 w-4" />} />
              </CardContent>
            </Card>
          </div>

          {monitor.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
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
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <CheckHistoryTable checks={checkHistory} />
        </TabsContent>

        <TabsContent value="latency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latency (24 hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <LatencyChart data={latencyData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">HTTP Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ConfigRow label="URL" value={monitor.url} />
              {monitor.headers && Object.keys(monitor.headers).length > 0 && (
                <ConfigRow label="Headers" value={JSON.stringify(monitor.headers, null, 2)} code />
              )}
              {monitor.expectedStatusCodes && monitor.expectedStatusCodes.length > 0 && (
                <ConfigRow label="Expected Status Codes" value={monitor.expectedStatusCodes.join(', ')} />
              )}
              <ConfigRow label="Timeout" value={`${monitor.timeout}ms`} />
              <ConfigRow label="Retries" value={monitor.retries.toString()} />
              <ConfigRow label="Regions" value={(monitor.regions ?? []).join(', ')} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatMetric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground w-24">{label}</span>
      <span className="flex-1 text-foreground font-mono text-sm truncate">{value}</span>
    </div>
  );
}

function ConfigRow({ label, value, code }: { label: string; value: string; code?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground w-48">{label}</span>
      <span className={cn('font-mono text-sm text-foreground break-all', code && 'bg-muted px-2 py-1 rounded')}>
        {value}
      </span>
    </div>
  );
}

function CheckHistoryTable({ checks }: { checks: Check[] }) {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Status Code</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checks.map((check) => (
              <TableRow key={check.id}>
                <TableCell className="font-mono text-sm">{formatDateTime(check.checkedAt)}</TableCell>
                <TableCell>
                  <MonitorStatusBadge status={check.status} showIcon />
                </TableCell>
                <TableCell className="font-mono">{formatLatency(check.latency ?? 0)}</TableCell>
                <TableCell>{check.statusCode?.toString() || '-'}</TableCell>
                <TableCell className="text-red-400 text-sm max-w-xs truncate">{check.error || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
