/**
 * lib/api-guard.ts — Server-side API Route Guard (DBStudio Base)
 *
 * Helper reusable untuk melindungi API routes dengan session dan permission check.
 * Gunakan di semua route yang perlu proteksi, terutama POST/PUT/DELETE.
 *
 * @example Session check saja (user harus login)
 * export async function GET() {
 *   const guard = await apiGuard();
 *   if (guard.error) return guard.error;
 *   // ... lanjut logic
 * }
 *
 * @example Dengan permission check
 * export async function POST() {
 *   const guard = await apiGuard('user.write');
 *   if (guard.error) return guard.error;
 *   const { session } = guard; // session tersedia
 *   // ... lanjut logic
 * }
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
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
 * Guard API route dengan session check + optional permission check.
 *
 * @param requiredPermission - Jika diisi, user harus memiliki permission ini.
 *   Bisa string tunggal atau array (any match = allowed).
 * @returns GuardResult — cek `.error` terlebih dahulu sebelum mengakses `.session`
 */
export async function apiGuard(
  requiredPermission?: string | string[]
): Promise<GuardResult> {
  // 1. Session check
  const session = await auth.api.getSession({ headers: await headers() });

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

  // 3. Permission check (jika diminta)
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
