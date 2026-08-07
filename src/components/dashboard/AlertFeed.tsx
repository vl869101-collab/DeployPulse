'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Info, Loader2, Bell, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { Alert } from '@/types';

interface AlertFeedProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
  limit?: number;
  showProject?: boolean;
}

const alertIcons = {
  down: AlertTriangle,
  degraded: Info,
  recovery: CheckCircle,
  ssl_expiring: AlertTriangle,
  domain_expiring: AlertTriangle,
};

const alertColors = {
  down: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
  degraded: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  recovery: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
  ssl_expiring: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  domain_expiring: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800',
};

export function AlertFeed({
  alerts,
  onAcknowledge,
  onDismiss,
  className,
  limit,
  showProject = false,
}: AlertFeedProps) {
  const displayAlerts = limit ? alerts.slice(0, limit) : alerts;

  if (displayAlerts.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardContent className="py-8 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No alerts</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            All systems are operating normally
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Alert Feed</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y p-4 space-y-3">
            {displayAlerts.map((alert) => {
              const Icon = alertIcons[alert.type] || Bell;
              const colorClass = alertColors[alert.type] || alertColors.down;

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                    colorClass,
                    alert.acknowledged && 'opacity-60'
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(alert.createdAt)}
                      </span>
                    </div>
                    {showProject && alert.projectId && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Project: {alert.projectId}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      {!alert.acknowledged && onAcknowledge && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAcknowledge(alert.id)}
                          className="text-xs h-7 px-2"
                        >
                          Acknowledge
                        </Button>
                      )}
                      {onDismiss && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDismiss(alert.id)}
                          className="text-xs h-7 px-2"
                        >
                          Dismiss
                        </Button>
                      )}
                      {alert.acknowledged && (
                        <Badge variant="secondary" className="text-xs">
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        {alerts.length > (limit || alerts.length) && (
          <div className="border-t px-4 py-3">
            <Button variant="ghost" className="w-full text-sm">
              View all {alerts.length} alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}