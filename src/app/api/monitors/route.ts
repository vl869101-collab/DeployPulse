import { NextResponse } from 'next/server';
import { mockMonitors } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(mockMonitors);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newMonitor = {
    id: `mon_${Date.now()}`,
    projectId: body.projectId || 'proj_1',
    name: body.name,
    url: body.url,
    type: body.type || 'https',
    interval: body.interval || 60,
    timeout: body.timeout || 10,
    retries: body.retries || 3,
    status: 'pending' as const,
    lastCheck: null,
    lastStatusCode: null,
    lastLatency: null,
    uptime: 100,
    tags: body.tags || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return NextResponse.json(newMonitor, { status: 201 });
}
