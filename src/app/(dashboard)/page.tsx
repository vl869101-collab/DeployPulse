'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BarChart3, AlertTriangle, Bell, Settings, Plus, Search, ExternalLink, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { MonitorTable } from '@/components/dashboard/MonitorTable';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { AlertFeed } from '@/components/dashboard/AlertFeed';
import { fetchAlerts, fetchMonitors } from '@/lib/api-client';
import { Alert, Monitor } from '@/types';

export default function DashboardPage() {
  const [monitors, setMonitors] = React.useState<Monitor[]>([]);
  const [alerts, setAlerts] = React.useState<Alert[]>([]);

  React.useEffect(() => {
    let active = true;

    Promise.all([fetchMonitors(), fetchAlerts()]).then(([nextMonitors, nextAlerts]) => {
      if (!active) return;
      setMonitors(nextMonitors);
      setAlerts(nextAlerts);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your deployment health</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="default">
            <Plus className="mr-2 h-4 w-4" />
            New Monitor
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Monitors"
          value="24"
          trend={{ value: 2, label: 'this month' }}
          icon={<Activity className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Overall Uptime"
          value="99.97%"
          trend={{ value: 0.02, label: 'from last month' }}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title="Active Incidents"
          value="3"
          trend={{ value: -1, label: '1 critical, 2 warning' }}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        />
        <StatCard
          title="Avg Response Time"
          value="142ms"
          trend={{ value: -12, label: 'from last week' }}
          icon={<Clock className="h-5 w-5 text-blue-500" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Monitors Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Monitors</CardTitle>
                <p className="text-sm text-muted-foreground">All your deployment monitors</p>
              </div>
              <Link href="/monitors" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <MonitorTable monitors={monitors} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Alerts</CardTitle>
                <p className="text-sm text-muted-foreground">Latest notifications and incidents</p>
              </div>
              <Link href="/alerts" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <AlertFeed alerts={alerts} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Charts */}
        <div className="space-y-6">
          <ChartCard
            title="Uptime Trend (30 days)"
            description="Overall system availability"
          >
            <div className="h-40" />
          </ChartCard>

          <ChartCard
            title="Response Time Distribution"
            description="Latency percentiles across monitors"
          >
            <div className="h-40" />
          </ChartCard>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3" onClick={() => {}}>
                <Plus className="h-4 w-4" />
                Add New Monitor
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={() => {}}>
                <Bell className="h-4 w-4" />
                Configure Alerts
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={() => {}}>
                <ExternalLink className="h-4 w-4" />
                Setup Status Page
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={() => {}}>
                <Settings className="h-4 w-4" />
                Team Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
