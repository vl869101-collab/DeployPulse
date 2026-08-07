'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { incidents, monitors } from '@/lib/mock-data';
import { IncidentTimeline } from '@/components/incidents/IncidentTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const severityColor: Record<string, string> = {
  minor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  major: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

const statusColor = {
  investigating: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  identified: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  monitoring: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const incident = incidents.find((i) => i.id === id);
  const monitor = incident?.monitorId ? monitors.find((m) => m.id === incident.monitorId) : null;

  if (!incident) {
    return (
      <div className="space-y-4">
        <Link href="/incidents" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to incidents
        </Link>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Incident not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/incidents" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{incident.title}</h1>
            <Badge variant="outline" className={severityColor[incident.severity]}>
              {incident.severity}
            </Badge>
            <Badge variant="outline" className={statusColor[incident.status]}>
              {incident.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Started {new Date(incident.startedAt).toLocaleString()}
            {incident.resolvedAt && ` · Resolved ${new Date(incident.resolvedAt).toLocaleString()}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <IncidentTimeline incident={incident} />
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
                <span className="text-muted-foreground">Severity</span>
                <Badge variant="outline" className={severityColor[incident.severity]}>
                  {incident.severity}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={statusColor[incident.status]}>
                  {incident.status}
                </Badge>
              </div>
              {monitor && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monitor</span>
                  <Link href={`/monitors/${monitor.id}`} className="text-primary hover:underline font-medium">
                    {monitor.name}
                  </Link>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {incident.resolvedAt
                    ? `${Math.round((new Date(incident.resolvedAt).getTime() - new Date(incident.startedAt).getTime()) / 60000)}m`
                    : 'Ongoing'}
                </span>
              </div>
            </CardContent>
          </Card>

          {incident.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{incident.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
