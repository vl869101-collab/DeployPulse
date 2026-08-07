import { NextResponse } from 'next/server';
import { mockUser } from '@/lib/mock-data';
import { validateBody, LoginSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rl = rateLimit(`login:${ip}`, 10, 60_000); // 10 attempts per minute
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = validateBody(LoginSchema, body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Mock auth: accept any valid email/password combo
  return NextResponse.json({
    user: { ...mockUser, email: validation.data.email },
    token: 'mock_jwt_token_' + Date.now(),
  });
}
