'use client';

import * as React from 'react';
import { fetchIncidents } from '@/lib/api-client';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { Button } from '@/components/ui/button';
import { Incident } from '@/types';

export default function IncidentsPage() {
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [filter, setFilter] = React.useState<string>('all');

  React.useEffect(() => {
    let active = true;

    fetchIncidents().then((nextIncidents) => {
      if (active) setIncidents(nextIncidents);
    });

    return () => {
      active = false;
    };
  }, []);

  const filtered = filter === 'all'
    ? incidents
    : incidents.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">Track and manage ongoing incidents</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {['all', 'investigating', 'identified', 'monitoring', 'resolved'].map((s) => (
          <Button
            key={s}
            variant={filter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No incidents found
          </div>
        ) : (
          filtered.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))
        )}
      </div>
    </div>
  );
}
