import { Alert, Check, Incident, Monitor, StatusPage } from '@/types';
import {
  generateMockChecks,
  mockAlerts,
  mockIncidents,
  mockMonitors,
  mockStatusPages,
} from '@/lib/mock-data';

export type MonitorDetails = Monitor & { checks?: Check[] };

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
  const monitors = await request<Monitor[]>('/api/monitors', mockMonitors);
  return monitors.map(normalizeMonitor);
}

export async function fetchMonitor(id: string): Promise<MonitorDetails | null> {
  const fallback = mockMonitors.find((monitor) => monitor.id === id);
  const monitor = await request<MonitorDetails | null>(
    `/api/monitors/${id}`,
    fallback ? { ...fallback, checks: generateMockChecks(id, 30) } : null
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

export async function createMonitor(data: Partial<Monitor>): Promise<Monitor> {
  const res = await fetch('/api/monitors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return normalizeMonitor(await res.json());
}

export async function updateMonitor(id: string, data: Partial<Monitor>): Promise<Monitor> {
  const res = await fetch(`/api/monitors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return normalizeMonitor(await res.json());
}

export async function deleteMonitor(id: string): Promise<void> {
  await fetch(`/api/monitors/${id}`, { method: 'DELETE' });
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
