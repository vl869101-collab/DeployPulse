import { NextResponse } from 'next/server';
import { mockMonitors, generateMockChecks } from '@/lib/mock-data';

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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const monitor = mockMonitors.find((m) => m.id === id);
  if (!monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }
  const body = await request.json();
  return NextResponse.json({ ...monitor, ...body, updatedAt: new Date() });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const monitor = mockMonitors.find((m) => m.id === id);
  if (!monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
