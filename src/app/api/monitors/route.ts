import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { toMonitor } from '@/lib/monitor-mappers';
import { validateBody, MonitorSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const monitors = await prisma.monitor.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(monitors.map(toMonitor));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  const monitor = await prisma.monitor.create({
    data: {
      ...validation.data,
      userId: session.user.id,
      status: 'pending',
    },
  });
  return NextResponse.json(toMonitor(monitor), { status: 201 });
}
