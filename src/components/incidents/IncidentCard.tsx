'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Incident, IncidentSeverity, IncidentStatus } from '@/types';
import { IncidentSeverityBadge, IncidentStatusBadge } from '@/components/ui/status-badge';
import { formatRelativeTime, formatDateTime } from '@/lib/utils';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Target,
  Search,
  Eye,
  Clock,
  User,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

const severityIcons: Record<IncidentSeverity, React.ReactNode> = {
  critical: <AlertTriangle className="h-4 w-4 text-red-400" />,
  major: <AlertCircle className="h-4 w-4 text-orange-400" />,
  minor: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  info: <Info className="h-4 w-4 text-blue-400" />,
};

const statusIcons: Record<IncidentStatus, React.ReactNode> = {
  investigating: <Search className="h-4 w-4 text-blue-400" />,
  identified: <Target className="h-4 w-4 text-purple-400" />,
  monitoring: <Eye className="h-4 w-4 text-amber-400" />,
  resolved: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
};

interface IncidentCardProps {
  incident: Incident;
  onClick?: () => void;
  className?: string;
}

export function IncidentCard({ incident, onClick, className }: IncidentCardProps) {
  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md cursor-pointer',
        onClick && 'hover:bg-accent/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{incident.title}</h3>
              <IncidentSeverityBadge severity={incident.severity} showIcon />
              <IncidentStatusBadge status={incident.status} showIcon />
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{incident.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(incident.createdAt)}
              </span>
              {incident.monitor && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {incident.monitor.name}
                </span>
              )}
              {incident.project && (
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5"
                  style={{ backgroundColor: incident.project.color + '20', color: incident.project.color }}
                >
                  {incident.project.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">{formatDateTime(incident.createdAt)}</span>
            {onClick && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
                View Details
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface IncidentTimelineProps {
  incident: Incident;
  className?: string;
}

export function IncidentTimeline({ incident, className }: IncidentTimelineProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-4 border-l border-border/50">
          {(incident.updates ?? []).map((update, index) => (
            <div key={update.id} className="relative pb-6 last:pb-0">
              <div className="absolute left-[-22px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-background z-10">
                {statusIcons[update.status]}
              </div>
              <div className="ml-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{update.message}</span>
                  <IncidentStatusBadge status={update.status} showIcon />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {update.author.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(update.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface IncidentDetailProps {
  incident: Incident;
  onAction?: (action: string) => void;
  className?: string;
}

export function IncidentDetail({ incident, onAction, className }: IncidentDetailProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl font-bold">{incident.title}</h1>
            <IncidentSeverityBadge severity={incident.severity} showIcon />
            <IncidentStatusBadge status={incident.status} showIcon />
          </div>
          <p className="text-muted-foreground">{incident.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {incident.status !== 'resolved' && (
            <Button variant="outline" onClick={() => onAction?.('acknowledge')}>
              Acknowledge
            </Button>
          )}
          {incident.status === 'investigating' && (
            <Button variant="outline" onClick={() => onAction?.('identify')}>
              Mark Identified
            </Button>
          )}
          {incident.status === 'identified' && (
            <Button variant="outline" onClick={() => onAction?.('monitor')}>
              Start Monitoring
            </Button>
          )}
          {incident.status !== 'resolved' && (
            <Button onClick={() => onAction?.('resolve')}>Resolve</Button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatItem label="Severity" value={incident.severity} icon={severityIcons[incident.severity]} />
        <StatItem label="Status" value={incident.status} icon={statusIcons[incident.status]} />
        <StatItem label="Created" value={formatDateTime(incident.createdAt)} icon={<Clock className="h-5 w-5" />} />
        <StatItem
          label="Resolved"
          value={incident.resolvedAt ? formatDateTime(incident.resolvedAt) : '—'}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* Affected Monitors */}
      {(incident.affectedMonitors ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Affected Monitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(incident.affectedMonitors ?? []).map((monitorId) => (
                <Badge key={monitorId} variant="outline">
                  {monitorId}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <IncidentTimeline incident={incident} />
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-lg font-medium mt-1">{value}</p>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}