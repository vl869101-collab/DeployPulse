'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning'
    | 'info'
    | 'pending'
    | 'status-success'
    | 'status-warning'
    | 'status-error'
    | 'status-info'
    | 'status-pending';
}

const badgeVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'text-foreground border-border',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pending: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20',
  'status-success': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'status-warning': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'status-error': 'bg-destructive/10 text-destructive border-destructive/20',
  'status-info': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'status-pending': 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20',
};

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };