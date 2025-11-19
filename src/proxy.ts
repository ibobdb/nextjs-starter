import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Permission } from '@/lib/rbac/permission';
import { auth } from '@/lib/auth';
import type { ExtendedUser } from '@/lib/rbac/types';

const AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const PUBLIC_PATHS = [
  ...AUTH_PATHS,
  '/403',
  '/errors/503',
  '/errors/403',
  '/no-access',
  '/',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('better-auth.session_token');
  const hasSession = !!sessionToken?.value;
  const isAuthPath = AUTH_PATHS.includes(pathname);
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  if (hasSession && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard/default', request.url));
  }

  if (!hasSession && !isPublicPath) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  let user: ExtendedUser | null = null;
  if (hasSession) {
    const session = await auth.api.getSession({ headers: request.headers });
    user = session?.user ?? null;
  }
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/default', request.url));
  }

  if (pathname === '/auth') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  const requiredPermission = await Permission.getRequirePermisison(pathname);
  if (!isPublicPath) {
    if (requiredPermission && !user?.permissions.includes(requiredPermission)) {
      return NextResponse.redirect(new URL('/no-access', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|css|js|ico|woff|woff2)).*)',
  ],
};
