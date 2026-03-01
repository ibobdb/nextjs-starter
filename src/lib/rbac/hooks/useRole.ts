'use client';

/**
 * useRole — Role-based access hook (DBStudio Base)
 *
 * Menggunakan useSession() sebagai data source tunggal.
 * Returns { allowed, isLoading } sehingga consumer bisa handle
 * loading state dengan baik (tidak ada flash of missing content).
 */

import { useSession } from '@/hooks/use-session';

export function useRole(requiredRoles: string | string[]): {
  allowed: boolean;
  isLoading: boolean;
} {
  const { user, isLoading } = useSession();

  if (isLoading) return { allowed: false, isLoading: true };

  const required = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  const allowed = required.some((role) => user?.roles?.includes(role) ?? false);

  return { allowed, isLoading: false };
}
