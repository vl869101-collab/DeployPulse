import { NextResponse } from 'next/server';
import { mockLogEntries } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(mockLogEntries);
}
