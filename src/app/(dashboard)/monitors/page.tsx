'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { MonitorTable } from '@/components/dashboard/MonitorTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { MonitorDialog } from '@/components/monitors/MonitorDialog';
import { getLocalMonitors, addLocalMonitor, updateLocalMonitor, deleteLocalMonitor } from '@/lib/monitor-store';
import { Monitor } from '@/types';

export default function MonitorsPage() {
  const [monitors, setMonitors] = React.useState<Monitor[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingMonitor, setEditingMonitor] = React.useState<Monitor | null>(null);
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  const loadMonitors = React.useCallback(() => {
    setMonitors(getLocalMonitors());
  }, []);

  React.useEffect(() => { loadMonitors(); }, [loadMonitors]);

  const filteredMonitors = React.useMemo(() => {
    return monitors.filter((m) => {
      if (filters.search && !m.name.toLowerCase().includes(filters.search.toLowerCase()) && !m.url.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.status && filters.status !== 'all' && m.status !== filters.status) return false;
      if (filters.type && filters.type !== 'all' && m.type !== filters.type) return false;
      return true;
    });
  }, [monitors, filters]);

  const handleSave = async (data: Partial<Monitor>) => {
    if (editingMonitor) {
      updateLocalMonitor(editingMonitor.id, data);
    } else {
      addLocalMonitor(data);
    }
    loadMonitors();
  };

  const handleAction = async (action: string, monitor: Monitor) => {
    switch (action) {
      case 'edit':
        setEditingMonitor(monitor);
        setDialogOpen(true);
        break;
      case 'delete':
        if (confirm(`Delete "${monitor.name}"?`)) {
          deleteLocalMonitor(monitor.id);
          loadMonitors();
        }
        break;
      case 'pause':
        updateLocalMonitor(monitor.id, { status: 'disabled' });
        loadMonitors();
        break;
      case 'resume':
        updateLocalMonitor(monitor.id, { status: 'pending' });
        loadMonitors();
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitors</h1>
          <p className="text-muted-foreground">Manage and track all your monitors</p>
        </div>
        <Button onClick={() => { setEditingMonitor(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          New Monitor
        </Button>
      </div>

      <FilterBar onFilterChange={setFilters} />

      <Card>
        <CardContent className="p-0">
          <MonitorTable monitors={filteredMonitors} onMonitorAction={handleAction} />
        </CardContent>
      </Card>

      <MonitorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        monitor={editingMonitor}
      />
    </div>
  );
}
