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

  const allowed = user?.permissions?.includes(permission) ?? false;

  return { allowed, isLoading: false };
}
