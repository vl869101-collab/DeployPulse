import { NextRequest, NextResponse } from 'next/server';
import { mockMonitors, generateMockChecks } from '@/lib/mock-data';
import { validateBody, MonitorSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const monitor = mockMonitors.find((m) => m.id === id);
  if (!monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }
  const checks = generateMockChecks(id, 50);
  return NextResponse.json({ ...monitor, checks });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rl = rateLimit(`monitor-put:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { id } = await params;
  const monitor = mockMonitors.find((m) => m.id === id);
  if (!monitor) return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = validateBody(MonitorSchema.partial(), body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  return NextResponse.json({ ...monitor, ...validation.data, updatedAt: new Date() });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = _request.headers.get('x-forwarded-for') || _request.headers.get('x-real-ip') || 'unknown';
  const rl = rateLimit(`monitor-delete:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { id } = await params;
  const monitor = mockMonitors.find((m) => m.id === id);
  if (!monitor) return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
