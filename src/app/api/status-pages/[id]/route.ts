import { NextRequest, NextResponse } from 'next/server';
import { mockStatusPages } from '@/lib/mock-data';
import { validateBody, StatusPageSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

const pages = [...mockStatusPages];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = pages.find((p) => p.id === id);
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = pages.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = validateBody(StatusPageSchema.partial(), body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  pages[idx] = { ...pages[idx], ...validation.data, updatedAt: new Date() };
  return NextResponse.json(pages[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = pages.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  pages.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
