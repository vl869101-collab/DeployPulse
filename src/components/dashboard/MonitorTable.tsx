'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import Link from 'next/link';
import {
  Search,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  ExternalLink,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  Edit,
  Globe,
  Clock,
  Zap,
  Server,
  Database,
} from 'lucide-react';
import { Monitor, MonitorStatus, MonitorType } from '@/types';
import { MonitorStatusBadge } from '@/components/ui/status-badge';
import { formatRelativeTime, truncate } from '@/lib/utils';

interface MonitorTableProps {
  monitors: Monitor[];
  onMonitorAction?: (action: string, monitor: Monitor) => void;
  className?: string;
}

const typeIcons: Record<MonitorType, React.ReactNode> = {
  http: <Globe className="h-4 w-4" />,
  https: <Globe className="h-4 w-4" />,
  tcp: <Server className="h-4 w-4" />,
  ping: <Database className="h-4 w-4" />,
  keyword: <Zap className="h-4 w-4" />,
  dns: <Globe className="h-4 w-4" />,
  ssl: <Server className="h-4 w-4" />,
  cron: <Clock className="h-4 w-4" />,
  webhook: <Zap className="h-4 w-4" />,
  health: <Server className="h-4 w-4" />,
  'background-job': <Database className="h-4 w-4" />,
};

const typeLabels: Record<MonitorType, string> = {
  http: 'HTTP',
  https: 'HTTPS',
  tcp: 'TCP',
  ping: 'Ping',
  keyword: 'Keyword',
  dns: 'DNS',
  ssl: 'SSL',
  cron: 'Cron',
  webhook: 'Webhook',
  health: 'Health',
  'background-job': 'Background Job',
};

export function MonitorTable({ monitors, onMonitorAction, className }: MonitorTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MonitorStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MonitorType | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Monitor; direction: 'asc' | 'desc' }>({
    key: 'lastCheck',
    direction: 'desc',
  });
  const [selectedMonitors, setSelectedMonitors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredMonitors = useMemo(() => {
    return monitors.filter((monitor) => {
      const matchesSearch =
        monitor.name.toLowerCase().includes(search.toLowerCase()) ||
        monitor.url.toLowerCase().includes(search.toLowerCase()) ||
        monitor.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || statusFilter === monitor.status;
      const matchesType = typeFilter === 'all' || typeFilter === monitor.type;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [monitors, search, statusFilter, typeFilter]);

  const sortedMonitors = useMemo(() => {
    return [...filteredMonitors].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [filteredMonitors, sortConfig]);

  const paginatedMonitors = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedMonitors.slice(start, start + pageSize);
  }, [sortedMonitors, page]);

  const totalPages = Math.ceil(sortedMonitors.length / pageSize);

  const handleSort = (key: keyof Monitor) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMonitors(paginatedMonitors.map((m) => m.id));
    } else {
      setSelectedMonitors([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedMonitors((prev) =>
      checked ? [...prev, id] : prev.filter((m) => m !== id)
    );
  };

  const SortIcon = ({ sortKey }: { sortKey: keyof Monitor }) => {
    if (sortConfig.key !== sortKey) return <span className="h-4 w-4 opacity-0" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search monitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as MonitorStatus | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(['up', 'down', 'pending', 'degraded', 'disabled'] as MonitorStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  <MonitorStatusBadge status={status} showIcon />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v: string) => setTypeFilter(v as MonitorType | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(['http', 'https', 'tcp', 'ping', 'keyword', 'dns', 'ssl'] as MonitorType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  <span className="flex items-center gap-2">
                    {typeIcons[type]}
                    <span>{typeLabels[type]}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={paginatedMonitors.length > 0 && selectedMonitors.length === paginatedMonitors.length}
                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  Name <SortIcon sortKey="name" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                <div className="flex items-center gap-1">
                  Type <SortIcon sortKey="type" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('uptime')}>
                <div className="flex items-center gap-1">
                  Uptime <SortIcon sortKey="uptime" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('lastCheck')}>
                <div className="flex items-center gap-1">
                  Last Check <SortIcon sortKey="lastCheck" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('interval')}>
                <div className="flex items-center gap-1">
                  Interval <SortIcon sortKey="interval" />
                </div>
              </TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMonitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                  No monitors found
                </TableCell>
              </TableRow>
            ) : (
              paginatedMonitors.map((monitor) => (
                <TableRow key={monitor.id} className="hover:bg-accent/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedMonitors.includes(monitor.id)}
                      onCheckedChange={(checked) => handleSelectOne(monitor.id, checked === true)}
                      aria-label={`Select ${monitor.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">
                        {typeLabels[monitor.type]}
                      </span>
                      <div>
                        <Link href={`/monitors/${monitor.id}`} className="hover:underline hover:text-primary transition-colors">
                          <p className="truncate max-w-xs">{monitor.name}</p>
                        </Link>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{truncate(monitor.url, 50)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      {typeIcons[monitor.type]}
                      {typeLabels[monitor.type]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <MonitorStatusBadge status={monitor.status} />
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {monitor.uptime.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {monitor.lastCheck ? formatRelativeTime(monitor.lastCheck) : 'Never'}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {monitor.interval < 60 ? `${monitor.interval}s` : `${monitor.interval / 60}m`}
                  </TableCell>
                  <TableCell>
                    {monitor.project && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: monitor.project.color + '20', color: monitor.project.color }}
                      >
                        {monitor.project.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Open URL
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onMonitorAction?.('check', monitor)}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Run Check Now
                        </DropdownMenuItem>
                        {monitor.status !== 'disabled' && (
                          <DropdownMenuItem
                            onClick={() => onMonitorAction?.('pause', monitor)}
                            className="flex items-center gap-2"
                          >
                            <Pause className="h-4 w-4" />
                            Pause Monitor
                          </DropdownMenuItem>
                        )}
                        {monitor.status === 'disabled' && (
                          <DropdownMenuItem
                            onClick={() => onMonitorAction?.('resume', monitor)}
                            className="flex items-center gap-2"
                          >
                            <Play className="h-4 w-4" />
                            Resume Monitor
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onMonitorAction?.('edit', monitor)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onMonitorAction?.('delete', monitor)}
                          className="flex items-center gap-2 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedMonitors.length)} of{' '}
              {sortedMonitors.length} monitors
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
