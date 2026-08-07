import { NextResponse } from 'next/server';
import { validateBody, SignupSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rl = rateLimit(`signup:${ip}`, 5, 60_000); // 5 attempts per minute
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = validateBody(SignupSchema, body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  return NextResponse.json({
    user: {
      id: `user_${Date.now()}`,
      name: validation.data.name,
      email: validation.data.email,
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    token: 'mock_jwt_token_' + Date.now(),
  }, { status: 201 });
}
