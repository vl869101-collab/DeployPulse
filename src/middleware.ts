import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected API routes that require authentication
const protectedApiRoutes = [
  '/api/monitors',
  '/api/incidents',
  '/api/alerts',
  '/api/status-pages',
];

// Public routes (no auth needed)
const publicRoutes = [
  '/login',
  '/signup',
  '/',
  '/status',
  '/api/auth',
];

function isProtectedRoute(pathname: string): boolean {
  // Check if it's an auth route (always public)
  if (publicRoutes.some(route => pathname.startsWith(route))) return false;

  // Check if it matches a protected API route
  return protectedApiRoutes.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API routes for now
  if (isProtectedRoute(pathname)) {
    // Check for session cookie (authjs session token)
    const sessionToken = request.cookies.get('__Host-authjs.session-token') ||
                         request.cookies.get('authjs.session-token') ||
                         request.cookies.get('__Secure-authjs.session-token');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  // Sanitize callbackUrl to prevent open redirect
  if (pathname === '/login') {
    const url = request.nextUrl;
    const callbackUrl = url.searchParams.get('callbackUrl');
    if (callbackUrl) {
      // Only allow relative paths starting with /
      try {
        const parsed = new URL(callbackUrl, request.url);
        // If it parses as absolute and points elsewhere, reject
        if (parsed.origin !== request.nextUrl.origin) {
          url.searchParams.delete('callbackUrl');
          return NextResponse.redirect(url);
        }
      } catch {
        // Not a valid URL, let it pass (it's likely a relative path)
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/login',
  ],
};
