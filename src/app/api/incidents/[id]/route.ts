import { NextRequest, NextResponse } from 'next/server';
import { mockIncidents } from '@/lib/mock-data';
import { z } from 'zod';
import { validateBody } from '@/lib/validation';

const UpdateIncidentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
  severity: z.enum(['minor', 'major', 'critical']).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = mockIncidents.find((i) => i.id === id);
  if (!incident) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
  }
  return NextResponse.json(incident);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = mockIncidents.find((i) => i.id === id);
  if (!incident) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = validateBody(UpdateIncidentSchema, body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  return NextResponse.json({ ...incident, ...validation.data, updatedAt: new Date() });
}
