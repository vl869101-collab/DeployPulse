import { Monitor } from '@/types';

type StoredMonitor = {
  id: string;
  name: string;
  url: string;
  type: string;
  interval: number;
  timeout: number;
  retries?: number;
  status: string;
  lastCheck?: Date | null;
  lastStatusCode?: number | null;
  lastLatency?: number | null;
  uptime?: number;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toMonitor(monitor: StoredMonitor): Monitor {
  return {
    id: monitor.id,
    projectId: 'proj_1',
    name: monitor.name,
    url: monitor.url,
    type: monitor.type as Monitor['type'],
    interval: monitor.interval,
    timeout: monitor.timeout,
    retries: monitor.retries ?? 3,
    status: monitor.status as Monitor['status'],
    lastCheck: monitor.lastCheck ?? null,
    lastStatusCode: monitor.lastStatusCode ?? null,
    lastLatency: monitor.lastLatency ?? null,
    uptime: monitor.uptime ?? 100,
    tags: monitor.tags,
    createdAt: monitor.createdAt,
    updatedAt: monitor.updatedAt,
  };
}
