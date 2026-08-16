import { Monitor } from '@/types';
import { mockMonitors } from '@/lib/mock-data';

export interface HourlyMetric {
  hour: string;
  p50: number;
  p95: number;
  p99: number;
}

export interface DailyMetric {
  date: string;
  p50: number;
  p95: number;
  p99: number;
}

export interface DailyCheck {
  date: string;
  successful: number;
  failed: number;
}

export interface ErrorGroup {
  message: string;
  count: number;
  lastSeen: string;
  monitors: string[];
}

export interface RegionalData {
  region: string;
  avgLatency: number;
  uptime: number;
  checks: number;
  status: 'healthy' | 'degraded' | 'down';
}

export interface MonitorPerformance {
  id: string;
  name: string;
  avgLatency: number;
  p95: number;
  uptime: number;
  trend: number;
}

export interface StatusDistribution {
  up: number;
  down: number;
  degraded: number;
}

export interface KPIData {
  totalMonitors: number;
  overallUptime: number;
  avgResponseTime: number;
  totalChecks: number;
  trends: { uptime: number; responseTime: number; checks: number };
}

// Deterministic PRNG (mulberry32): stable values across server render and
// client hydration, so charts never mismatch.
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function formatHourLabel(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:00`;
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function anchorStart(anchor: Date, unitsBack: number, unitMs: number): Date {
  const start = new Date(anchor);
  start.setMinutes(0, 0, 0);
  return new Date(start.getTime() - unitsBack * unitMs);
}

export function generateHourlyMetrics(hours: number, seed = 42, anchor = new Date()): HourlyMetric[] {
  const rng = createRng(seed);
  const start = anchorStart(anchor, hours - 1, 3_600_000);
  const metrics: HourlyMetric[] = [];

  for (let i = 0; i < hours; i++) {
    const point = new Date(start.getTime() + i * 3_600_000);
    const hour = point.getHours();
    // Diurnal pattern: busier during business hours, quieter overnight.
    const load = hour >= 9 && hour <= 18 ? 1.25 : hour >= 19 || hour <= 5 ? 0.8 : 1;
    metrics.push({
      hour: formatHourLabel(point),
      p50: roundTo(clamp(randomBetween(rng, 50, 200) * load, 50, 200), 1),
      p95: roundTo(clamp(randomBetween(rng, 200, 800) * load, 200, 800), 1),
      p99: roundTo(clamp(randomBetween(rng, 500, 2000) * load, 500, 2000), 1),
    });
  }

  return metrics;
}

export function generateDailyMetrics(days: number, seed = 43, anchor = new Date()): DailyMetric[] {
  const rng = createRng(seed);
  const start = anchorStart(anchor, days - 1, 86_400_000);
  // A couple of seeded spike days to make the trend interesting.
  const spikeDays = new Set<number>([Math.floor(rng() * days), Math.floor(rng() * days)]);
  const metrics: DailyMetric[] = [];

  for (let i = 0; i < days; i++) {
    const point = new Date(start.getTime() + i * 86_400_000);
    const spike = spikeDays.has(i) ? randomBetween(rng, 1.6, 2.1) : 1;
    metrics.push({
      date: formatDayLabel(point),
      p50: roundTo(clamp(randomBetween(rng, 50, 200) * spike, 50, 200), 1),
      p95: roundTo(clamp(randomBetween(rng, 200, 800) * spike, 200, 800), 1),
      p99: roundTo(clamp(randomBetween(rng, 500, 2000) * spike, 500, 2000), 1),
    });
  }

  return metrics;
}

export function generateDailyChecks(
  days: number,
  seed = 7,
  bucket: 'day' | '2h' = 'day',
  anchor = new Date()
): DailyCheck[] {
  const rng = createRng(seed);
  const monitorsPerDay = mockMonitors.length * 1_440;
  const spikeIndex = Math.floor(rng() * days);
  const checks: DailyCheck[] = [];

  for (let i = 0; i < days; i++) {
    const total = Math.round(monitorsPerDay * randomBetween(rng, 0.95, 1.05) * (bucket === '2h' ? 2 / 24 : 1));
    const failureRate = i === spikeIndex ? randomBetween(rng, 0.012, 0.025) : randomBetween(rng, 0.0005, 0.004);
    const failed = Math.max(1, Math.round(total * failureRate));
    const label =
      bucket === '2h'
        ? formatHourLabel(new Date(anchorStart(anchor, days - 1 - i, 7_200_000).getTime() + 3_600_000))
        : formatDayLabel(anchorStart(anchor, days - 1 - i, 86_400_000));
    checks.push({ date: label, successful: total - failed, failed });
  }

  return checks;
}

const ERROR_TEMPLATES: { message: string; monitors: string[] }[] = [
  { message: 'Request timeout after 10000ms', monitors: ['API Health Check', 'Payment Gateway'] },
  { message: 'Connection refused (ECONNREFUSED)', monitors: ['Database Connection'] },
  { message: 'SSL certificate error: certificate has expired', monitors: ['SSL Certificate', 'API Health Check'] },
  { message: 'HTTP 502 Bad Gateway from upstream', monitors: ['API Health Check', 'Admin Dashboard', 'Payment Gateway'] },
  { message: 'HTTP 503 Service Unavailable', monitors: ['Homepage', 'Admin Dashboard'] },
  { message: 'DNS lookup failed (ENOTFOUND): api.example.com', monitors: ['API Health Check'] },
];

export function generateErrorGroups(monitors: Monitor[] = mockMonitors, seed = 9): ErrorGroup[] {
  const rng = createRng(seed);
  const monitorNames = new Set(monitors.map((m) => m.name));

  return ERROR_TEMPLATES.filter((template) => template.monitors.some((name) => monitorNames.has(name)))
    .map((template) => {
      const affected = template.monitors.filter((name) => monitorNames.has(name));
      const count = Math.round(randomBetween(rng, 3, 140));
      const minutesAgo = Math.round(randomBetween(rng, 5, 2_880));
      return {
        message: template.message,
        count,
        lastSeen: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
        monitors: affected,
      };
    })
    .sort((a, b) => b.count - a.count);
}

const REGION_BASELINES = [
  { region: 'US-East', latency: [70, 140] as const, uptime: [99.2, 99.99] as const, share: [0.3, 0.36] as const },
  { region: 'US-West', latency: [90, 170] as const, uptime: [99.0, 99.9] as const, share: [0.22, 0.28] as const },
  { region: 'EU-West', latency: [120, 240] as const, uptime: [98.6, 99.5] as const, share: [0.2, 0.26] as const },
  { region: 'AP-South', latency: [190, 380] as const, uptime: [97.8, 99.0] as const, share: [0.14, 0.2] as const },
];

export function generateRegionalData(days = 7, seed = 11): RegionalData[] {
  const rng = createRng(seed);
  const totalChecks = mockMonitors.length * 1_440 * days;

  return REGION_BASELINES.map((baseline) => {
    const avgLatency = roundTo(randomBetween(rng, baseline.latency[0], baseline.latency[1]), 1);
    const uptime = roundTo(randomBetween(rng, baseline.uptime[0], baseline.uptime[1]), 2);
    const status: RegionalData['status'] = uptime >= 99 ? 'healthy' : uptime >= 97.5 ? 'degraded' : 'down';
    return {
      region: baseline.region,
      avgLatency,
      uptime,
      checks: Math.round(totalChecks * randomBetween(rng, baseline.share[0], baseline.share[1])),
      status,
    };
  });
}

const LATENCY_BY_TYPE: Partial<Record<Monitor['type'], [number, number]>> = {
  tcp: [10, 60],
  ping: [10, 50],
  dns: [30, 110],
  ssl: [40, 130],
  http: [80, 280],
  https: [80, 280],
  keyword: [100, 320],
  health: [70, 240],
};

export function generateMonitorPerformance(monitors: Monitor[], seed = 5): MonitorPerformance[] {
  return monitors.map((monitor) => {
    const rng = createRng(hashString(monitor.id) + seed);
    const range = LATENCY_BY_TYPE[monitor.type] ?? [60, 300];
    const avgLatency = roundTo(randomBetween(rng, range[0], range[1]), 1);
    return {
      id: monitor.id,
      name: monitor.name,
      avgLatency,
      p95: roundTo(avgLatency * randomBetween(rng, 2.2, 3.4), 1),
      uptime: roundTo(clamp(monitor.uptime + randomBetween(rng, -0.15, 0.05), 95, 99.99), 2),
      trend: roundTo(randomBetween(rng, -5, 5), 1),
    };
  });
}

export function generateKPIData(monitors: Monitor[], seed = 3, days = 1): KPIData {
  const rng = createRng(seed);
  const performance = generateMonitorPerformance(monitors, seed);
  const avgResponseTime =
    performance.length > 0
      ? roundTo(performance.reduce((sum, p) => sum + p.avgLatency, 0) / performance.length, 1)
      : 0;
  const overallUptime =
    monitors.length > 0
      ? roundTo(clamp(monitors.reduce((sum, m) => sum + m.uptime, 0) / monitors.length, 95, 99.99), 2)
      : 0;
  const totalChecks = monitors.reduce((sum, m) => sum + Math.round(86_400 / m.interval), 0) * days;

  return {
    totalMonitors: monitors.length,
    overallUptime,
    avgResponseTime,
    totalChecks,
    trends: {
      uptime: roundTo(randomBetween(rng, -0.04, 0.04), 2),
      responseTime: roundTo(randomBetween(rng, -5, 5), 1),
      checks: roundTo(randomBetween(rng, -5, 5), 1),
    },
  };
}

export function generateStatusDistribution(
  totalChecks: number,
  overallUptime: number,
  seed = 13
): StatusDistribution {
  const rng = createRng(seed);
  const failedTotal = Math.max(1, Math.round(totalChecks * (1 - overallUptime / 100)));
  const degraded = Math.max(0, Math.round(failedTotal * randomBetween(rng, 0.55, 0.75)));
  const down = Math.max(failedTotal - degraded, 0);

  return {
    up: Math.max(totalChecks - failedTotal, 0),
    down,
    degraded,
  };
}

export function generateSparkline(
  points: number,
  base: number,
  variance: number,
  seed = 21
): number[] {
  const rng = createRng(seed);
  const decimals = base >= 100 ? 0 : base >= 10 ? 1 : 2;
  const values: number[] = [];
  let current = base;

  for (let i = 0; i < points; i++) {
    current = clamp(current + base * randomBetween(rng, -variance, variance), base * (1 - variance * 2), base * (1 + variance * 2));
    values.push(roundTo(current, decimals));
  }

  return values;
}
