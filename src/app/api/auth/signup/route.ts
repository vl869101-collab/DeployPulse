import { NextResponse } from 'next/server';
import { validateBody, SignupSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rl = rateLimit(`signup:${ip}`, 5, 60_000);
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

  const existing = await prisma.user.findUnique({
    where: { email: validation.data.email },
  });

  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(validation.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: validation.data.name,
      email: validation.data.email,
      password: hashed,
    },
  });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
  }, { status: 201 });
}
