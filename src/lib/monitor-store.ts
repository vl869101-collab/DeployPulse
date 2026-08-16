import { Monitor } from '@/types';

const STORAGE_KEY = 'deploypulse_monitors';

function generateId(): string {
  return `mon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getLocalMonitors(): Monitor[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Monitor[];
  } catch {
    return [];
  }
}

export function saveLocalMonitors(monitors: Monitor[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(monitors));
}

export function addLocalMonitor(data: Partial<Monitor>): Monitor {
  const monitors = getLocalMonitors();
  const now = new Date().toISOString();
  const monitor: Monitor = {
    id: generateId(),
    projectId: data.projectId || 'proj_1',
    name: data.name || 'Untitled',
    url: data.url || '',
    type: data.type || 'https',
    interval: data.interval || 60,
    timeout: data.timeout || 30,
    retries: data.retries || 3,
    status: data.status || 'pending',
    lastCheck: null,
    lastStatusCode: null,
    lastLatency: null,
    uptime: data.uptime ?? 100,
    tags: data.tags || [],
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
  monitors.unshift(monitor);
  saveLocalMonitors(monitors);
  return monitor;
}

export function updateLocalMonitor(id: string, data: Partial<Monitor>): Monitor | null {
  const monitors = getLocalMonitors();
  const idx = monitors.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  monitors[idx] = { ...monitors[idx], ...data, updatedAt: new Date() };
  saveLocalMonitors(monitors);
  return monitors[idx];
}

export function deleteLocalMonitor(id: string): boolean {
  const monitors = getLocalMonitors();
  const idx = monitors.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  monitors.splice(idx, 1);
  saveLocalMonitors(monitors);
  return true;
}
