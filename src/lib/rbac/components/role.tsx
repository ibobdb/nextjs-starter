'use client';

/**
 * Role — Role-based conditional render component (DBStudio Base)
 *
 * Props:
 * - role: string | string[]   — role(s) yang diizinkan
 * - children: ReactNode       — konten jika allowed
 * - fallback?: ReactNode      — render jika tidak allowed (default: null)
 * - loading?: ReactNode       — render saat session loading (default: null)
 *
 * @example
 * <Role role="super_admin" fallback={<NoAccess />}>
 *   <AdminPanel />
 * </Role>
 */

import { useRole } from '../hooks/useRole';
import type { ReactNode } from 'react';

interface RoleProps {
  role: string | string[];
  children: ReactNode;
  /** Tampilkan saat tidak punya role. Default: null */
  fallback?: ReactNode;
  /** Tampilkan saat session masih loading. Default: null */
  loading?: ReactNode;
}

export function Role({ role, children, fallback = null, loading = null }: RoleProps) {
  const { allowed, isLoading } = useRole(role);

  if (isLoading) return <>{loading}</>;
  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}
