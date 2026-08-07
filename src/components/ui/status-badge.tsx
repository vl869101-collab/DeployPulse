'use client';

import { Badge } from '@/components/ui/badge';
import { MonitorStatus, IncidentSeverity, IncidentStatus } from '@/types';
import { getStatusColor, getSeverityColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: MonitorStatus | IncidentSeverity | IncidentStatus;
  variant?: 'monitor' | 'incident-severity' | 'incident-status';
  className?: string;
  showIcon?: boolean;
}

const statusIcons: Record<string, string> = {
  healthy: 'check-circle-2',
  warning: 'alert-triangle',
  error: 'x-circle',
  disabled: 'pause-circle',
  pending: 'loader-2',
  critical: 'triangle-alert',
  major: 'alert-circle',
  minor: 'info',
  info: 'info',
  investigating: 'search',
  identified: 'target',
  monitoring: 'eye',
  resolved: 'check-circle-2',
};

const statusLabels: Record<string, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  error: 'Error',
  disabled: 'Disabled',
  pending: 'Pending',
  critical: 'Critical',
  major: 'Major',
  minor: 'Minor',
  info: 'Info',
  investigating: 'Investigating',
  identified: 'Identified',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
};

export function StatusBadge({
  status,
  variant = 'monitor',
  className,
  showIcon = true
}: StatusBadgeProps) {
  let colorClass: string;
  let label = statusLabels[status] || status;

  if (variant === 'monitor') {
    colorClass = getStatusColor(status as MonitorStatus);
  } else if (variant === 'incident-severity') {
    colorClass = getSeverityColor(status as IncidentSeverity);
  } else {
    colorClass = getStatusColor(status as MonitorStatus);
  }

  return (
    <Badge variant="outline" className={colorClass + ' ' + className}>
      {showIcon && (
        <span className="flex items-center gap-1">
          <i className={`ph ph-${statusIcons[status] || 'help-circle'} text-xs`} aria-hidden="true" />
          {label}
        </span>
      )}
      {!showIcon && <span>{label}</span>}
    </Badge>
  );
}

export function MonitorStatusBadge({ status, className, showIcon = true }: {
  status: MonitorStatus;
  className?: string;
  showIcon?: boolean;
}) {
  return <StatusBadge status={status} variant="monitor" className={className} showIcon={showIcon} />;
}

export function IncidentSeverityBadge({ severity, className, showIcon = true }: {
  severity: IncidentSeverity;
  className?: string;
  showIcon?: boolean;
}) {
  return <StatusBadge status={severity} variant="incident-severity" className={className} showIcon={showIcon} />;
}

export function IncidentStatusBadge({ status, className, showIcon = true }: {
  status: IncidentStatus;
  className?: string;
  showIcon?: boolean;
}) {
  return <StatusBadge status={status} variant="incident-status" className={className} showIcon={showIcon} />;
}