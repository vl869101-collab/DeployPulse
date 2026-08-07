import { NextRequest, NextResponse } from 'next/server';
import { mockIncidents } from '@/lib/mock-data';
import { z } from 'zod';
import { validateBody } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

const CreateIncidentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  monitorId: z.string().nullable().optional(),
  severity: z.enum(['minor', 'major', 'critical']).optional().default('major'),
  affectedMonitors: z.array(z.string()).max(20).optional().default([]),
});

export async function GET() {
  return NextResponse.json(mockIncidents);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rl = rateLimit(`incidents:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = validateBody(CreateIncidentSchema, body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const newIncident = {
    id: `inc_${Date.now()}`,
    projectId: 'proj_1',
    ...validation.data,
    status: 'investigating' as const,
    startedAt: new Date(),
    acknowledgedAt: null,
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    updates: [],
  };
  return NextResponse.json(newIncident, { status: 201 });
}
