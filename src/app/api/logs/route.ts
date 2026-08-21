import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { mockLogEntries } from '@/lib/mock-data';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(mockLogEntries);
}
