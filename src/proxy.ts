import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const PUBLIC_PATHS = [...AUTH_PATHS, '/errors/503', '/errors/403'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Maintenance mode check
  if (process.env.MAINTENANCE_MODE === 'true' && pathname !== '/errors/503') {
    const url = request.nextUrl.clone();
    url.pathname = '/errors/503';
    const response = NextResponse.rewrite(url);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Retry-After', '3600');
    return response;
  }

  // Disable signup check
  // if (pathname === '/auth/register' && process.env.ENABLE_SIGNUP !== 'true') {
  //   return NextResponse.redirect(new URL('/errors/403', request.url));
  // }

  // Check session using Better Auth cookie
  const sessionToken = request.cookies.get('better-auth.session_token');
  const hasSession = !!sessionToken?.value;
  const isAuthPath = AUTH_PATHS.includes(pathname);
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  // Redirect authenticated users away from auth pages
  if (hasSession && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard/default', request.url));
  }

  // Redirect unauthenticated users to login
  if (!hasSession && !isPublicPath) {
    const url = new URL('/auth/login', request.url);
    // Save the original URL to redirect back after login
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect /dashboard to /dashboard/default
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/default', request.url));
  }

  // Redirect /auth to /auth/login
  if (pathname === '/auth') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[\\w]+$).*)',
  ],
};
