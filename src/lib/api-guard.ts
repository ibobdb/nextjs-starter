/**
 * lib/api-guard.ts — Server-side API Route Guard (DBStudio Base)
 *
 * Reusable helper to protect API routes with session and permission checks.
 * Use in all routes that require protection, especially POST/PUT/DELETE.
 *
 * @example Session check only (user must be logged in)
 * export async function GET() {
 *   const guard = await apiGuard();
 *   if (guard.error) return guard.error;
 *   // ... continue logic
 * }
 *
 * @example With permission check
 * export async function POST() {
 *   const guard = await apiGuard('user.write');
 *   if (guard.error) return guard.error;
 *   const { session } = guard; // session is available
 *   // ... continue logic
 * }
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth, getServerSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

type GuardUser = {
  id: string;
  email: string;
  name: string;
  permissions: string[];
  roles: string[];
};

type GuardSuccess = {
  error: null;
  session: { user: GuardUser };
};

type GuardFailure = {
  error: NextResponse;
  session: null;
};

type GuardResult = GuardSuccess | GuardFailure;

/**
 * Guard API route with session check + optional permission check.
 *
 * @param requiredPermission - If provided, user must have this permission.
 *   Can be a single string or an array (any match = allowed).
 * @returns GuardResult — check `.error` first before accessing `.session`
 */
export async function apiGuard(
  requiredPermission?: string | string[]
): Promise<GuardResult> {
  // 1. Session check
  const session = await getServerSession(await headers());

  if (!session) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Login required' },
        { status: 401 }
      ),
      session: null,
    };
  }

  const user = session.user as unknown as GuardUser;

  // 2. Rate Limiting Check
  // Global limit for authenticated users: 200 requests per 60 seconds (generous standard for dashboards)
  const rl = rateLimit(`user_${user.id}`, { limit: 200, windowMs: 60000 });
  
  if (!rl.isAllowed && rl.response) {
    return {
      error: rl.response,
      session: null,
    };
  }

  // 3. Permission check (if requested)
  if (requiredPermission) {
    const userRoles: string[] = user.roles ?? [];
    const isSuperAdmin = userRoles.includes('super_admin');

    if (!isSuperAdmin) {
      const userPerms: string[] = user.permissions ?? [];
      const required = Array.isArray(requiredPermission)
        ? requiredPermission
        : [requiredPermission];

      const hasPermission = required.some((p) => userPerms.includes(p));

      if (!hasPermission) {
        return {
          error: NextResponse.json(
            {
              success: false,
              error: 'Forbidden',
              message: `Missing required permission: ${required.join(' or ')}`,
            },
            { status: 403 }
          ),
          session: null,
        };
      }
    }
  }

  return {
    error: null,
    session: { user },
  };
}
