'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Clock, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const uptimeData = [
  { day: 'Mon', uptime: 99.98 },
  { day: 'Tue', uptime: 99.95 },
  { day: 'Wed', uptime: 100 },
  { day: 'Thu', uptime: 99.99 },
  { day: 'Fri', uptime: 99.97 },
  { day: 'Sat', uptime: 100 },
  { day: 'Sun', uptime: 99.96 },
];

const latencyData = [
  { hour: '00:00', p50: 120, p95: 210, p99: 380 },
  { hour: '04:00', p50: 95, p95: 180, p99: 320 },
  { hour: '08:00', p50: 145, p95: 280, p99: 520 },
  { hour: '12:00', p50: 160, p95: 310, p99: 580 },
  { hour: '16:00', p50: 155, p95: 295, p99: 540 },
  { hour: '20:00', p50: 130, p95: 240, p99: 420 },
];

const incidentData = [
  { month: 'Oct', count: 2 },
  { month: 'Nov', count: 5 },
  { month: 'Dec', count: 1 },
  { month: 'Jan', count: 3 },
  { month: 'Feb', count: 0 },
  { month: 'Mar', count: 1 },
];

const monitorStatusData = [
  { name: 'Up', value: 18, color: '#10B981' },
  { name: 'Down', value: 2, color: '#EF4444' },
  { name: 'Degraded', value: 3, color: '#F59E0B' },
  { name: 'Pending', value: 1, color: '#6B7280' },
];

const topMonitors = [
  { name: 'Production API', avg: 142, uptime: 99.99, checks: 4320 },
  { name: 'Marketing Site', avg: 238, uptime: 99.95, checks: 4320 },
  { name: 'Auth Service', avg: 89, uptime: 100, checks: 4320 },
  { name: 'CDN Edge', avg: 45, uptime: 99.98, checks: 4320 },
  { name: 'Worker Queue', avg: 312, uptime: 99.87, checks: 4320 },
];

const tooltipStyle = {
  backgroundColor: '#161B22',
  border: '1px solid #30363D',
  borderRadius: '8px',
  color: '#E6EDF3',
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Performance insights across all monitors</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Avg Uptime', value: '99.98%', icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, trend: '+0.01%', up: true },
          { label: 'Avg Latency', value: '142ms', icon: <Clock className="h-5 w-5 text-blue-500" />, trend: '-12ms', up: true },
          { label: 'Total Checks', value: '21,600', icon: <Activity className="h-5 w-5 text-primary" />, trend: '+3,200', up: true },
          { label: 'Incidents', value: '12', icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, trend: '-3', up: true },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                {stat.up ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={stat.up ? 'text-emerald-500' : 'text-red-500'}>{stat.trend}</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="uptime" className="space-y-6">
        <TabsList>
          <TabsTrigger value="uptime">Uptime</TabsTrigger>
          <TabsTrigger value="latency">Latency</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="monitors">Monitors</TabsTrigger>
        </TabsList>

        <TabsContent value="uptime">
          <Card>
            <CardHeader>
              <CardTitle>Uptime Trend (7 days)</CardTitle>
              <CardDescription>Daily uptime percentage across all monitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={uptimeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8B949E' }} />
                    <YAxis domain={[99.9, 100.01]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8B949E' }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Uptime']} />
                    <Area type="monotone" dataKey="uptime" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="latency">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Distribution</CardTitle>
              <CardDescription>Latency percentiles over 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8B949E' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8B949E' }} tickFormatter={(v) => `${v}ms`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}ms`]} />
                    <Legend />
                    <Line type="monotone" dataKey="p50" stroke="#10B981" strokeWidth={2} dot={false} name="P50" />
                    <Line type="monotone" dataKey="p95" stroke="#F59E0B" strokeWidth={2} dot={false} name="P95" />
                    <Line type="monotone" dataKey="p99" stroke="#EF4444" strokeWidth={2} dot={false} name="P99" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <CardTitle>Incidents per Month</CardTitle>
              <CardDescription>Number of incidents in the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incidentData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8B949E' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8B949E' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitors">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Current status of all monitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={monitorStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {monitorStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Monitors</CardTitle>
                <CardDescription>By average response time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topMonitors.map((m) => (
                    <div key={m.name} className="flex items-center justify-between rounded-lg border border-[#30363D] bg-[#161B22] p-3">
                      <div>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.checks.toLocaleString()} checks</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{m.avg}ms</p>
                        <Badge variant="outline" className="text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/30">{m.uptime}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
