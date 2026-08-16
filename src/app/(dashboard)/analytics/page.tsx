'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, BarChart3, CheckCircle2, Clock, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChartTooltip,
  ErrorPanel,
  MetricCard,
  MonitorPerformanceTable,
  RegionGrid,
  StatusDonut,
} from '@/components/analytics';
import {
  generateDailyChecks,
  generateDailyMetrics,
  generateErrorGroups,
  generateHourlyMetrics,
  generateKPIData,
  generateMonitorPerformance,
  generateRegionalData,
  generateSparkline,
  generateStatusDistribution,
} from '@/lib/analytics-data';
import { cn, formatLatency } from '@/lib/utils';
import { mockMonitors } from '@/lib/mock-data';

type DateRange = 'today' | '7d' | '30d' | '90d';

const daysByRange: Record<DateRange, number> = { today: 1, '7d': 7, '30d': 30, '90d': 90 };
const seedByRange: Record<DateRange, number> = { today: 101, '7d': 202, '30d': 303, '90d': 404 };
const compareLabelByRange: Record<DateRange, string> = {
  today: 'vs yesterday',
  '7d': 'vs last week',
  '30d': 'vs last month',
  '90d': 'vs last quarter',
};

const latencyLineColors = { p50: '#10B981', p95: '#F59E0B', p99: '#EF4444' } as const;
const axisTick = { fontSize: 11, fill: '#8B949E' };

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const days = daysByRange[range];
  const seed = seedByRange[range];

  const kpi = useMemo(() => generateKPIData(mockMonitors, seed, days), [seed, days]);
  const latencySeries = useMemo(
    () => (range === 'today' ? generateHourlyMetrics(24, seed) : generateDailyMetrics(days, seed)),
    [range, seed, days]
  );
  const statusDistribution = useMemo(
    () => generateStatusDistribution(kpi.totalChecks, kpi.overallUptime, seed),
    [kpi, seed]
  );
  const checksSeries = useMemo(
    () => (range === 'today' ? generateDailyChecks(12, seed, '2h') : generateDailyChecks(days, seed)),
    [range, seed, days]
  );
  const errors = useMemo(() => generateErrorGroups(mockMonitors, seed), [seed]);
  const regions = useMemo(() => generateRegionalData(Math.max(days, 1), seed), [seed, days]);
  const monitorPerformance = useMemo(() => generateMonitorPerformance(mockMonitors, seed), [seed]);

  const latencyData = useMemo(
    () =>
      latencySeries.map((point) => ({
        label: 'hour' in point ? point.hour : point.date,
        p50: point.p50,
        p95: point.p95,
        p99: point.p99,
      })),
    [latencySeries]
  );

  const checksSparkline = useMemo(() => {
    const perHour = Math.max(1, Math.round(kpi.totalChecks / (days * 24)));
    return generateSparkline(24, perHour, 0.25, seed + 1);
  }, [kpi, seed, days]);
  const uptimeSparkline = useMemo(
    () => generateSparkline(24, kpi.overallUptime, 0.002, seed + 2),
    [kpi, seed]
  );
  const latencySparkline = useMemo(
    () => generateSparkline(24, kpi.avgResponseTime, 0.3, seed + 3),
    [kpi, seed]
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight">
            <BarChart3 className="h-7 w-7 text-primary" />
            Analytics
          </h1>
          <p className="mt-1 text-muted-foreground">Performance insights across all monitors</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(value) => setRange(value as DateRange)}>
            <SelectTrigger className="w-[150px]" aria-label="Date range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Monitors"
          value={kpi.totalMonitors}
          icon={<Activity className="h-4 w-4 text-sky-500" />}
          sparklineData={checksSparkline}
          sparklineColor="#38BDF8"
        />
        <MetricCard
          title="Overall Uptime"
          value={kpi.overallUptime}
          format="percent"
          trend={kpi.trends.uptime}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          sparklineData={uptimeSparkline}
          sparklineColor="#10B981"
          compareLabel={compareLabelByRange[range]}
        />
        <MetricCard
          title="Avg Response Time"
          value={kpi.avgResponseTime}
          format="ms"
          trend={kpi.trends.responseTime}
          goodWhenDown
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          sparklineData={latencySparkline}
          sparklineColor="#F59E0B"
          compareLabel={compareLabelByRange[range]}
        />
        <MetricCard
          title="Total Checks"
          value={kpi.totalChecks}
          trend={kpi.trends.checks}
          icon={<Zap className="h-4 w-4 text-violet-500" />}
          sparklineData={generateSparkline(24, Math.max(1, Math.round(kpi.totalChecks / (days * 24))), 0.25, seed + 4)}
          sparklineColor="#8B5CF6"
          compareLabel={compareLabelByRange[range]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Time Trends</CardTitle>
          <CardDescription>
            {range === 'today' ? 'Hourly' : 'Daily'} latency percentiles over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} minTickGap={24} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={axisTick}
                  width={56}
                  tickFormatter={(value) => `${value}ms`}
                />
                <Tooltip
                  content={<ChartTooltip format={(value) => formatLatency(value)} />}
                  cursor={{ stroke: '#334155' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#8B949E' }} />
                <Line
                  type="monotone"
                  dataKey="p50"
                  name="P50"
                  stroke={latencyLineColors.p50}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="p95"
                  name="P95"
                  stroke={latencyLineColors.p95}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="p99"
                  name="P99"
                  stroke={latencyLineColors.p99}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Check outcomes in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDonut data={statusDistribution} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Checks Over Time</CardTitle>
            <CardDescription>
              Successful vs failed checks — last {range === 'today' ? '24 hours' : `${days} days`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={checksSeries} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={axisTick} minTickGap={20} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} width={48} />
                  <Tooltip
                    content={<ChartTooltip format={(value) => value.toLocaleString('en-US')} />}
                    cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#8B949E' }} />
                  <Bar dataKey="successful" name="Successful" stackId="checks" fill="#10B981" />
                  <Bar dataKey="failed" name="Failed" stackId="checks" fill="#EF4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Monitors by Latency</CardTitle>
          <CardDescription>Worst performers first — click a column header to sort</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <MonitorPerformanceTable data={monitorPerformance} limit={10} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Analysis</CardTitle>
          <CardDescription>Errors grouped by type — expand a row for details</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <ErrorPanel errors={errors} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Performance</CardTitle>
          <CardDescription>Latency and uptime from each checking region</CardDescription>
        </CardHeader>
        <CardContent>
          <RegionGrid regions={regions} />
        </CardContent>
      </Card>
    </div>
  );
}
