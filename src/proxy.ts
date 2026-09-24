import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoggedIn =
    request.cookies.has('acuspeak_logged_in') || request.cookies.has('session_token');

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/lessons') ||
    pathname.startsWith('/live') ||
    pathname.startsWith('/practice') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings');

  // Redirect unauthenticated visitors attempting direct URL access to /login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page to /dashboard
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Support both Next.js 16 proxy and legacy middleware export names for full backwards compatibility
export const middleware = proxy;

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/lessons/:path*',
    '/live/:path*',
    '/practice/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
  ],
};
