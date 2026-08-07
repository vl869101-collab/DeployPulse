'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('py-12 text-center', className)}>
      <CardContent className="flex flex-col items-center gap-4">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div>
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}