import { NextRequest, NextResponse } from 'next/server';
import { mockStatusPages } from '@/lib/mock-data';

const pages = [...mockStatusPages];

export async function GET() {
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const page = {
    id: `sp_${Date.now()}`,
    projectId: body.projectId || 'proj_1',
    slug: body.slug || body.title?.toLowerCase().replace(/\s+/g, '-') || `status-${Date.now()}`,
    title: body.title || 'New Status Page',
    description: body.description || null,
    customDomain: body.customDomain || null,
    public: body.public ?? true,
    monitorIds: body.monitorIds || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  pages.push(page);
  return NextResponse.json(page, { status: 201 });
}
