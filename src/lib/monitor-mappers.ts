import { Monitor } from '@/types';

type StoredMonitor = {
  id: string;
  name: string;
  url: string;
  type: string;
  interval: number;
  timeout: number;
  status: string;
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
    retries: 3,
    status: monitor.status as Monitor['status'],
    lastCheck: null,
    lastStatusCode: null,
    lastLatency: null,
    uptime: 100,
    tags: monitor.tags,
    createdAt: monitor.createdAt,
    updatedAt: monitor.updatedAt,
  };
}
