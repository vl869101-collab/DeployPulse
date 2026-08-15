'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Check,
  X,
  Loader2,
  Rocket,
  ChevronDown,
  ChevronUp,
  GitBranch,
  GitCommit,
} from 'lucide-react';
import {
  fetchDeployments,
  type Deployment,
  type DeploymentEnvironment,
  type DeploymentStatus,
} from '@/lib/api-client';
import { cn, formatRelativeTime } from '@/lib/utils';

const environmentBadge: Record<DeploymentEnvironment, { label: string; className: string }> = {
  production: {
    label: 'Production',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  preview: {
    label: 'Preview',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  development: {
    label: 'Development',
    className: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20',
  },
};

const statusConfig: Record<DeploymentStatus, { label: string; className: string; icon: React.ReactNode }> = {
  ready: {
    label: 'Ready',
    className: 'text-emerald-400',
    icon: <Check className="h-4 w-4" />,
  },
  building: {
    label: 'Building',
    className: 'text-blue-400',
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },
  queued: {
    label: 'Queued',
    className: 'text-muted-foreground',
    icon: <Loader2 className="h-4 w-4" />,
  },
  canceled: {
    label: 'Canceled',
    className: 'text-muted-foreground',
    icon: <X className="h-4 w-4" />,
  },
  errored: {
    label: 'Errored',
    className: 'text-red-400',
    icon: <X className="h-4 w-4" />,
  },
};

type EnvironmentFilter = 'all' | DeploymentEnvironment;

export default function DeploymentsPage() {
  const [deployments, setDeployments] = React.useState<Deployment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<EnvironmentFilter>('all');
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    fetchDeployments().then((data) => {
      setDeployments(data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = React.useMemo(
    () => (filter === 'all' ? deployments : deployments.filter((d) => d.environment === filter)),
    [deployments, filter]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
          <p className="text-muted-foreground">Track builds and releases across all environments</p>
        </div>
        <Button disabled>
          <Rocket className="mr-2 h-4 w-4" />
          Deploy
        </Button>
      </div>

      <div className="flex gap-2">
        {(['all', 'production', 'preview'] as EnvironmentFilter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deploy</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Commit</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No deployments found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((deployment) => {
                  const isExpanded = expanded === deployment.id;
                  const isErrored = deployment.status === 'errored';
                  return (
                    <React.Fragment key={deployment.id}>
                      <TableRow
                        className={cn(
                          'cursor-pointer',
                          isErrored && 'bg-red-500/5 hover:bg-red-500/10'
                        )}
                        onClick={() => setExpanded(isExpanded ? null : deployment.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className={cn('font-medium', isErrored && 'text-red-400')}>
                                {deployment.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[260px]">
                                {deployment.commitMessage}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={environmentBadge[deployment.environment].className}>
                            {environmentBadge[deployment.environment].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={cn('flex items-center gap-1.5 text-sm font-medium', statusConfig[deployment.status].className)}>
                            {statusConfig[deployment.status].icon}
                            {statusConfig[deployment.status].label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                            {deployment.commitHash}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <GitBranch className="h-4 w-4" />
                            {deployment.branch}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatRelativeTime(deployment.createdAt)}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={6} className="py-4">
                            <div className="space-y-3 pl-6">
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <GitCommit className="h-4 w-4" />
                                  {deployment.commitMessage}
                                </span>
                                <span className="text-muted-foreground">by {deployment.author}</span>
                                <span className="text-muted-foreground">
                                  {deployment.duration ? `${deployment.duration}s build` : 'In progress'}
                                </span>
                              </div>
                              {isErrored && deployment.error && (
                                <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3">
                                  <p className="text-sm font-medium text-red-400">Build Error</p>
                                  <p className="mt-1 text-sm text-red-300">{deployment.error}</p>
                                  {deployment.buildLogs.length > 0 && (
                                    <pre className="mt-2 overflow-x-auto rounded bg-[#0E1117] p-3 font-mono text-xs text-red-300/90">
                                      {deployment.buildLogs.join('\n')}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
