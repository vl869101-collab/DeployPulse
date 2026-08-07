import { NextResponse } from 'next/server';
import { mockIncidents } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(mockIncidents);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newIncident = {
    id: `inc_${Date.now()}`,
    projectId: body.projectId || 'proj_1',
    monitorId: body.monitorId || null,
    title: body.title,
    description: body.description || null,
    status: 'investigating' as const,
    severity: body.severity || 'major',
    startedAt: new Date(),
    acknowledgedAt: null,
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    updates: [],
    affectedMonitors: body.affectedMonitors || [],
  };
  return NextResponse.json(newIncident, { status: 201 });
}
