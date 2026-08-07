'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export function StatusBadge({ status, size = 'md', showDot = true }: StatusBadgeProps) {
  const variantMap: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'info'> = {
    up: 'success',
    down: 'destructive',
    pending: 'warning',
    maintenance: 'info',
    investigating: 'warning',
    identified: 'info',
    monitoring: 'info',
    resolved: 'success',
    minor: 'warning',
    major: 'destructive',
    critical: 'destructive',
  };

  const labelMap: Record<string, string> = {
    up: 'Operational',
    down: 'Down',
    pending: 'Pending',
    maintenance: 'Maintenance',
    investigating: 'Investigating',
    identified: 'Identified',
    monitoring: 'Monitoring',
    resolved: 'Resolved',
    minor: 'Minor',
    major: 'Major',
    critical: 'Critical',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const variant = variantMap[status] || 'default';
  const label = labelMap[status] || status;

  return (
    <Badge variant={variant} className={cn(sizeClasses[size])}>
      {showDot && (
        <span
          className={cn(
            'mr-1.5 h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-green-500',
            variant === 'destructive' && 'bg-red-500',
            variant === 'warning' && 'bg-yellow-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'default' && 'bg-gray-500'
          )}
        />
      )}
      {label}
    </Badge>
  );
}