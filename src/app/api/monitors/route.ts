import { NextResponse } from 'next/server';
import { monitors } from '@/lib/store';
import { validateBody, MonitorSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
  return NextResponse.json(monitors);
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rl = rateLimit(`monitors:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = validateBody(MonitorSchema, body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const newMonitor = {
    id: `mon_${Date.now()}`,
    projectId: 'proj_1',
    ...validation.data,
    status: 'pending' as const,
    lastCheck: null,
    lastStatusCode: null,
    lastLatency: null,
    uptime: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  monitors.push(newMonitor);
  return NextResponse.json(newMonitor, { status: 201 });
}
