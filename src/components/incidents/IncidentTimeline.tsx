'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/status-badge';
import { AlertTriangle, XCircle, CheckCircle, Clock, User, MessageSquare, ExternalLink, ChevronRight, ChevronLeft, Loader2, RefreshCw } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { Incident } from '@/types';

interface IncidentTimelineProps {
  incident: Incident;
  updates?: Array<{
    id: string;
    incidentId: string;
    message: string;
    author: string;
    createdAt: Date;
  }>;
  onAcknowledge?: () => void;
  onResolve?: () => void;
  onAddUpdate?: (message: string) => void;
  className?: string;
}

export function IncidentTimeline({
  incident,
  updates = [],
  onAcknowledge,
  onResolve,
  onAddUpdate,
  className,
}: IncidentTimelineProps) {
  const [showAddUpdate, setShowAddUpdate] = React.useState(false);
  const [updateMessage, setUpdateMessage] = React.useState('');

  const severityColors: Record<string, string> = {
    minor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    major: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  };

  const statusIcons = {
    investigating: AlertTriangle,
    identified: XCircle,
    monitoring: Clock,
    resolved: CheckCircle,
  };

  const StatusIcon = statusIcons[incident.status] || AlertTriangle;

  const handleAddUpdate = () => {
    if (updateMessage.trim() && onAddUpdate) {
      onAddUpdate(updateMessage.trim());
      setUpdateMessage('');
      setShowAddUpdate(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card className={cn('border-l-4', severityColors[incident.severity])}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusIcon className="h-5 w-5" />
                <h3 className="text-xl font-semibold">{incident.title}</h3>
                <StatusBadge status={incident.status} />
              </div>
              {incident.description && (
                <p className="mt-2 text-sm text-muted-foreground">{incident.description}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Started: {formatRelativeTime(incident.startedAt)} ({formatDateTime(incident.startedAt)})
                </span>
                {incident.acknowledgedAt && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Acknowledged: {formatRelativeTime(incident.acknowledgedAt)}
                  </span>
                )}
                {incident.resolvedAt && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Resolved: {formatRelativeTime(incident.resolvedAt)}
                  </span>
                )}
                {incident.monitorId && (
                  <Badge variant="outline" className="text-xs">
                    Monitor: {incident.monitorId}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge variant="secondary" className={cn(severityColors[incident.severity], 'text-sm')}>
                {incident.severity}
              </Badge>
              <div className="flex items-center gap-2">
                {incident.status !== 'resolved' && onAcknowledge && (
                  <Button variant="outline" size="sm" onClick={onAcknowledge}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Acknowledge
                  </Button>
                )}
                {incident.status !== 'resolved' && onResolve && (
                  <Button variant="default" size="sm" onClick={onResolve}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Resolve
                  </Button>
                )}
                {incident.status === 'resolved' && (
                  <Badge variant="success">Resolved</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 space-y-6">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
              {[
                { label: 'Incident Created', time: incident.startedAt, icon: AlertTriangle, color: 'text-blue-500', description: 'Incident was automatically created' },
                ...(incident.acknowledgedAt ? [{ label: 'Acknowledged', time: incident.acknowledgedAt, icon: CheckCircle, color: 'text-green-500', description: 'Incident was acknowledged by team' }] : []),
                ...(incident.resolvedAt ? [{ label: 'Resolved', time: incident.resolvedAt, icon: CheckCircle, color: 'text-green-500', description: 'Incident was marked as resolved' }] : []),
                ...updates.map((update) => ({
                  label: 'Update Added',
                  time: update.createdAt,
                  icon: MessageSquare,
                  color: 'text-purple-500',
                  description: update.message,
                  author: update.author,
                })),
              ].sort((a, b) => a.time.getTime() - b.time.getTime()).map((item, index) => (
                <div key={`${item.label}-${index}`} className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-background border-2 flex items-center justify-center z-10" style={{ borderColor: item.color.replace('text-', '').replace('-500', '-500') }}>
                    <item.icon className={cn('h-5 w-5', item.color)} />
                  </div>
                  <div className="flex-1 pt-1 pb-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-sm text-muted-foreground">{formatRelativeTime(item.time)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    {('author' in item && item.author) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        By {String(('author' in item ? item.author : ''))} • {formatDateTime(item.time)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {incident.status !== 'resolved' && (
              <div className="pt-4 border-t">
                {showAddUpdate ? (
                  <div className="space-y-3">
                    <textarea
                      value={updateMessage}
                      onChange={(e) => setUpdateMessage(e.target.value)}
                      placeholder="Add an update to the timeline..."
                      className="w-full min-h-[80px] p-3 border rounded-md bg-background"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowAddUpdate(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleAddUpdate} disabled={!updateMessage.trim()}>
                        Add Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setShowAddUpdate(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Update
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}