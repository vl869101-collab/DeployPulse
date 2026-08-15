import { NextResponse } from 'next/server';
import { mockDeployments } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(mockDeployments);
}
