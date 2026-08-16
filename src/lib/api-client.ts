import {
  Alert,
  Check,
  Deployment,
  DeploymentEnvironment,
  DeploymentStatus,
  Incident,
  LogEntry,
  LogLevel,
  Monitor,
  StatusPage,
} from '@/types';
import {
  mockAlerts,
  mockDeployments,
  mockIncidents,
  mockLogEntries,
  mockStatusPages,
} from '@/lib/mock-data';

export type MonitorDetails = Monitor & { checks?: Check[] };
export type { Deployment, DeploymentEnvironment, DeploymentStatus, LogEntry, LogLevel };

function toDate(value: Date | string | null): Date | null {
  return value instanceof Date ? value : value ? new Date(value) : null;
}

function normalizeCheck(check: Check): Check {
  return { ...check, checkedAt: toDate(check.checkedAt)! };
}

function normalizeMonitor(monitor: MonitorDetails): MonitorDetails {
  return {
    ...monitor,
    lastCheck: toDate(monitor.lastCheck),
    createdAt: toDate(monitor.createdAt)!,
    updatedAt: toDate(monitor.updatedAt)!,
    checks: monitor.checks?.map(normalizeCheck),
  };
}

function normalizeIncident(incident: Incident): Incident {
  return {
    ...incident,
    startedAt: toDate(incident.startedAt)!,
    acknowledgedAt: toDate(incident.acknowledgedAt),
    resolvedAt: toDate(incident.resolvedAt),
    createdAt: toDate(incident.createdAt)!,
    updatedAt: toDate(incident.updatedAt)!,
    updates: incident.updates?.map((update) => ({
      ...update,
      createdAt: toDate(update.createdAt)!,
    })),
  };
}

function normalizeAlert(alert: Alert): Alert {
  return { ...alert, createdAt: toDate(alert.createdAt)! };
}

async function request<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchMonitors(): Promise<Monitor[]> {
  const monitors = await request<Monitor[]>('/api/monitors', []);
  return monitors.map(normalizeMonitor);
}

export async function fetchMonitor(id: string): Promise<MonitorDetails | null> {
  const monitor = await request<MonitorDetails | null>(
    `/api/monitors/${id}`,
    null
  );
  return monitor ? normalizeMonitor(monitor) : null;
}

export async function fetchIncidents(): Promise<Incident[]> {
  const incidents = await request<Incident[]>('/api/incidents', mockIncidents);
  return incidents.map(normalizeIncident);
}

export async function fetchAlerts(): Promise<Alert[]> {
  const alerts = await request<Alert[]>('/api/alerts', mockAlerts);
  return alerts.map(normalizeAlert);
}

export async function fetchStatusPages(): Promise<StatusPage[]> {
  return request<StatusPage[]>('/api/status-pages', mockStatusPages);
}

export async function fetchStatusPage(id: string): Promise<StatusPage | null> {
  return request<StatusPage | null>(`/api/status-pages/${id}`, mockStatusPages.find((p) => p.id === id) ?? null);
}

export async function createStatusPage(data: Partial<StatusPage>): Promise<StatusPage> {
  const res = await fetch('/api/status-pages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateStatusPage(id: string, data: Partial<StatusPage>): Promise<StatusPage> {
  const res = await fetch(`/api/status-pages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteStatusPage(id: string): Promise<void> {
  await fetch(`/api/status-pages/${id}`, { method: 'DELETE' });
}

export function normalizeDeployment(deployment: Deployment): Deployment {
  return {
    ...deployment,
    createdAt: toDate(deployment.createdAt)!,
    readyAt: toDate(deployment.readyAt),
  };
}

function normalizeLogEntry(entry: LogEntry): LogEntry {
  return { ...entry, timestamp: toDate(entry.timestamp)! };
}

export async function fetchDeployments(): Promise<Deployment[]> {
  const deployments = await request<Deployment[]>('/api/deployments', mockDeployments);
  return deployments.map(normalizeDeployment);
}

export async function fetchLogs(): Promise<LogEntry[]> {
  const entries = await request<LogEntry[]>('/api/logs', mockLogEntries);
  return entries.map(normalizeLogEntry);
}
