import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  return NextResponse.json({
    user: {
      id: `user_${Date.now()}`,
      name,
      email,
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    token: 'mock_jwt_token_' + Date.now(),
  }, { status: 201 });
}
