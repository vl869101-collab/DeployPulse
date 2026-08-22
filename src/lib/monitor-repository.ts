import { prisma } from '@/lib/prisma';
import { toMonitor } from '@/lib/monitor-mappers';
import type { Monitor } from '@/types';

export type MonitorWrite = {
  name: string;
  url: string;
  type?: string;
  interval?: number;
  timeout?: number;
  retries?: number;
  tags?: string[];
  status?: string;
};

type MemoryRow = {
  id: string;
  userId: string;
  name: string;
  url: string;
  type: string;
  interval: number;
  timeout: number;
  retries: number;
  status: string;
  lastCheck: Date | null;
  lastStatusCode: number | null;
  lastLatency: number | null;
  uptime: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

const memory = new Map<string, MemoryRow>();

function dbEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function toApp(row: MemoryRow): Monitor {
  return toMonitor(row);
}

function newId(): string {
  return `mon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function getMonitors(userId: string): Promise<Monitor[]> {
  if (dbEnabled()) {
    try {
      const rows = await prisma.monitor.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(toMonitor);
    } catch {
      // DB paused / unreachable
    }
  }
  return [...memory.values()]
    .filter((m) => m.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(toApp);
}

export async function getMonitor(userId: string, id: string): Promise<Monitor | null> {
  if (dbEnabled()) {
    try {
      const row = await prisma.monitor.findFirst({ where: { id, userId } });
      return row ? toMonitor(row) : null;
    } catch {
      // fall through
    }
  }
  const row = memory.get(id);
  if (!row || row.userId !== userId) return null;
  return toApp(row);
}

export async function createMonitor(userId: string, data: MonitorWrite): Promise<Monitor> {
  const payload = {
    name: data.name,
    url: data.url,
    type: data.type ?? 'http',
    interval: data.interval ?? 60,
    timeout: data.timeout ?? 30,
    retries: data.retries ?? 3,
    tags: data.tags ?? [],
    status: data.status ?? 'pending',
    userId,
  };

  if (dbEnabled()) {
    try {
      const row = await prisma.monitor.create({ data: payload });
      return toMonitor(row);
    } catch {
      // fall through
    }
  }

  const now = new Date();
  const row: MemoryRow = {
    id: newId(),
    ...payload,
    lastCheck: null,
    lastStatusCode: null,
    lastLatency: null,
    uptime: 100,
    createdAt: now,
    updatedAt: now,
  };
  memory.set(row.id, row);
  return toApp(row);
}

export async function updateMonitor(
  userId: string,
  id: string,
  data: Partial<MonitorWrite>
): Promise<Monitor | null> {
  if (dbEnabled()) {
    try {
      const existing = await prisma.monitor.findFirst({ where: { id, userId } });
      if (!existing) return null;
      const row = await prisma.monitor.update({ where: { id }, data });
      return toMonitor(row);
    } catch {
      // fall through
    }
  }

  const row = memory.get(id);
  if (!row || row.userId !== userId) return null;
  const next: MemoryRow = { ...row, ...data, updatedAt: new Date() };
  memory.set(id, next);
  return toApp(next);
}

export async function deleteMonitor(userId: string, id: string): Promise<boolean> {
  if (dbEnabled()) {
    try {
      const existing = await prisma.monitor.findFirst({ where: { id, userId } });
      if (!existing) return false;
      await prisma.monitor.delete({ where: { id } });
      return true;
    } catch {
      // fall through
    }
  }

  const row = memory.get(id);
  if (!row || row.userId !== userId) return false;
  memory.delete(id);
  return true;
}
