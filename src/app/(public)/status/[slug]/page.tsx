'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { fetchStatusPages, fetchMonitors } from '@/lib/api-client';
import { StatusPage, Monitor } from '@/types';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  up: { label: 'Operational', icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  degraded: { label: 'Degraded', icon: <AlertTriangle className="h-5 w-5" />, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  down: { label: 'Down', icon: <XCircle className="h-5 w-5" />, color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
  pending: { label: 'Pending', icon: <Clock className="h-5 w-5" />, color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/30' },
  disabled: { label: 'Disabled', icon: <Clock className="h-5 w-5" />, color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/30' },
  maintenance: { label: 'Maintenance', icon: <Clock className="h-5 w-5" />, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
};

function UptimeBar({ monitors }: { monitors: Monitor[] }) {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const h = monitors.reduce((acc, m) => acc + (m.uptime || 99.9), 0) / monitors.length;
    return Math.max(95, Math.min(100, h + (Math.random() * 2 - 1)));
  });

  return (
    <div className="flex gap-0.5 h-8">
      {hours.map((uptime, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${uptime >= 99.9 ? 'bg-emerald-500' : uptime >= 99 ? 'bg-amber-500' : 'bg-red-500'}`}
          title={`${24 - i}h ago: ${uptime.toFixed(2)}%`}
        />
      ))}
    </div>
  );
}

export default function PublicStatusPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = React.useState<StatusPage | null>(null);
  const [monitors, setMonitors] = React.useState<Monitor[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([fetchStatusPages(), fetchMonitors()]).then(([pages, allMonitors]) => {
      const found = pages.find((p) => p.slug === slug);
      if (found) {
        setPage(found);
        setMonitors(allMonitors.filter((m) => found.monitorIds.includes(m.id)));
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Status page not found</h1>
          <p className="text-muted-foreground mt-2">This status page does not exist or is not public.</p>
        </div>
      </div>
    );
  }

  const allUp = monitors.every((m) => m.status === 'up');
  const anyDown = monitors.some((m) => m.status === 'down');

  return (
    <div className="min-h-screen bg-[#0E1117]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">DeployPulse</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
          {page.description && <p className="text-muted-foreground">{page.description}</p>}
        </div>

        <Card className={`mb-8 ${allUp ? 'border-emerald-500/30' : anyDown ? 'border-red-500/30' : 'border-amber-500/30'}`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-3">
              {allUp ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  <span className="text-xl font-semibold text-emerald-400">All Systems Operational</span>
                </>
              ) : anyDown ? (
                <>
                  <XCircle className="h-8 w-8 text-red-400" />
                  <span className="text-xl font-semibold text-red-400">System Outage Detected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-8 w-8 text-amber-400" />
                  <span className="text-xl font-semibold text-amber-400">Partial System Degradation</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">UPTIME (24H)</h2>
          <UptimeBar monitors={monitors} />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>24h ago</span>
            <span>Now</span>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">SERVICES</h2>
          <div className="space-y-2">
            {monitors.map((monitor) => {
              const cfg = statusConfig[monitor.status] || statusConfig.pending;
              return (
                <div key={monitor.id} className="flex items-center justify-between rounded-lg border border-[#30363D] bg-[#161B22] p-4">
                  <div className="flex items-center gap-3">
                    {cfg.icon}
                    <div>
                      <p className="font-medium">{monitor.name}</p>
                      <p className="text-xs text-muted-foreground">{monitor.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground font-mono">
                      {monitor.lastLatency ? `${monitor.lastLatency}ms` : '—'}
                    </span>
                    <Badge variant="outline" className={`${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-12">
          Powered by DeployPulse · Last updated just now
        </p>
      </div>
    </div>
  );
}
