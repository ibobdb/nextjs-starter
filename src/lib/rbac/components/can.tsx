'use client';

/**
 * Can — Permission-based conditional render component (DBStudio Base)
 *
 * Props:
 * - permission: string   — permission yang dibutuhkan (e.g. "user.create")
 * - children: ReactNode  — konten jika allowed
 * - fallback?: ReactNode — render jika tidak allowed (default: null)
 * - loading?: ReactNode  — render saat session loading (default: null)
 *
 * @example
 * <Can permission="user.create" fallback={<p>Tidak punya akses</p>}>
 *   <CreateButton />
 * </Can>
 */

import { usePermission } from '@/lib/rbac/hooks/usePermission';
import type { ReactNode } from 'react';

interface CanProps {
  permission: string;
  children: ReactNode;
  /** Tampilkan saat tidak punya permission. Default: null */
  fallback?: ReactNode;
  /** Tampilkan saat session masih loading. Default: null */
  loading?: ReactNode;
}

export function Can({ permission, children, fallback = null, loading = null }: CanProps) {
  const { allowed, isLoading } = usePermission(permission);

  if (isLoading) return <>{loading}</>;
  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}
