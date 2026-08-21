import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { mockStatusPages } from '@/lib/mock-data';
import { validateBody, StatusPageSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

const pages = [...mockStatusPages];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const rl = rateLimit(`status-pages:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = validateBody(StatusPageSchema, body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const page = {
    id: `sp_${Date.now()}`,
    projectId: 'proj_1',
    ...validation.data,
    description: validation.data.description ?? null,
    customDomain: validation.data.customDomain ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  pages.push(page);
  return NextResponse.json(page, { status: 201 });
}
