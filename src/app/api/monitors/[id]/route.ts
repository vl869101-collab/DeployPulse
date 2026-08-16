import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { toMonitor } from '@/lib/monitor-mappers';
import { generateMockChecks } from '@/lib/mock-data';
import { validateBody, MonitorSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const monitor = await prisma.monitor.findFirst({ where: { id, userId: session.user.id } });
  if (!monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }
  const checks = generateMockChecks(id, 50);
  return NextResponse.json({ ...toMonitor(monitor), checks });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rl = rateLimit(`monitor-put:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { id } = await params;
  const existing = await prisma.monitor.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });

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

  const monitor = await prisma.monitor.update({ where: { id }, data: validation.data });
  return NextResponse.json(toMonitor(monitor));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = _request.headers.get('x-forwarded-for') || _request.headers.get('x-real-ip') || 'unknown';
  const rl = rateLimit(`monitor-delete:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { id } = await params;
  const existing = await prisma.monitor.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });

  await prisma.monitor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
