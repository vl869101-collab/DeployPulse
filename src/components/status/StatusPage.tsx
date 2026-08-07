'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Monitor, CheckCircle, XCircle, AlertTriangle, Clock, Globe, ExternalLink, Zap, Shield } from 'lucide-react';
import { formatDateTime, formatRelativeTime, formatDuration } from '@/lib/utils';
import { Monitor as MonitorType, Incident } from '@/types';

interface StatusPageProps {
  title: string;
  description?: string;
  monitors: MonitorType[];
  incidents: Incident[];
  customDomain?: string;
  className?: string;
}

export function StatusPage({
  title,
  description,
  monitors,
  incidents,
  customDomain,
  className,
}: StatusPageProps) {
  const overallStatus = monitors.some(m => m.status === 'down') ? 'down' :
    monitors.some(m => m.status === 'degraded' || m.status === 'pending') ? 'degraded' : 'up';

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{title}</h1>
                  {customDomain && (
                    <p className="text-sm text-muted-foreground">
                      <ExternalLink className="inline h-3 w-3 mr-1" />
                      {customDomain}
                    </p>
                  )}
                </div>
              </div>
              {description && (
                <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={overallStatus} size="lg" />
              <div className="hidden sm:block text-right">
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="font-medium capitalize">{overallStatus === 'up' ? 'All Systems Operational' : overallStatus === 'degraded' ? 'Degraded Performance' : 'Major Outage'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeIncidents.length > 0 && (
          <section className="mb-8" aria-label="Active Incidents">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Active Incidents
            </h2>
            <div className="space-y-3">
              {activeIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 rounded-lg border bg-destructive/5 border-destructive/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={incident.status} size="sm" />
                        <Badge variant="secondary" className={incident.severity === 'critical' ? 'bg-destructive text-destructive-foreground' : incident.severity === 'major' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <h3 className="mt-1 font-medium">{incident.title}</h3>
                      {incident.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{incident.description}</p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Started {formatRelativeTime(incident.startedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatRelativeTime(incident.startedAt)}</p>
                      <p className="text-xs text-muted-foreground">Ongoing</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section aria-label="Monitors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Monitors
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {monitors.filter(m => m.status === 'up').length}
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                {monitors.filter(m => m.status === 'down').length}
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                {monitors.filter(m => m.status === 'pending' || m.status === 'maintenance').length}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {monitors.map((monitor) => (
              <Card key={monitor.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{monitor.name}</span>
                        <StatusBadge status={monitor.status} size="sm" />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground truncate">{monitor.url}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {monitor.type.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {monitor.interval}s interval
                        </span>
                        {monitor.lastLatency && (
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {formatDuration(monitor.lastLatency)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-lg">{monitor.uptime.toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground">Uptime</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last checked {formatRelativeTime(monitor.lastCheck || monitor.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Powered by DeployPulse • Last updated {formatRelativeTime(new Date())}
          </p>
        </div>
      </footer>
    </div>
  );
}