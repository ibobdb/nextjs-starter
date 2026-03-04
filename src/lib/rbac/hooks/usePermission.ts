'use client';

/**
 * usePermission — Permission-based access hook (DBStudio Base)
 *
 * Menggunakan useSession() sebagai data source tunggal.
 * Returns { allowed, isLoading } untuk konsistensi dengan useRole.
 */

import { useSession } from '@/hooks/use-session';

export function usePermission(permission: string): {
  allowed: boolean;
  isLoading: boolean;
} {
  const { user, isLoading } = useSession();

  if (isLoading) return { allowed: false, isLoading: true };
  
  // Super Admin bypass
  if (user?.roles?.includes('super_admin')) {
    return { allowed: true, isLoading: false };
  }

  const allowed = user?.permissions?.includes(permission) ?? false;

  return { allowed, isLoading: false };
}
