import { NextResponse } from 'next/server';
import { mockUser } from '@/lib/mock-data';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  // Mock auth: accept any valid email/password combo
  if (password.length < 6) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  return NextResponse.json({
    user: { ...mockUser, email },
    token: 'mock_jwt_token_' + Date.now(),
  });
}
