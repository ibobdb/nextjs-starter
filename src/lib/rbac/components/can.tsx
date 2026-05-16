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
  /** Single permission string */
  permission?: string;
  /** Multiple permissions — user needs at least one (OR logic) */
  permissions?: string[];
  children: ReactNode;
  /** Tampilkan saat tidak punya permission. Default: null */
  fallback?: ReactNode;
  /** Tampilkan saat session masih loading. Default: null */
  loading?: ReactNode;
}

function CanSingle({
  permission,
  children,
  fallback,
  loading,
}: {
  permission: string;
  children: ReactNode;
  fallback: ReactNode;
  loading: ReactNode;
}) {
  const { allowed, isLoading } = usePermission(permission);
  if (isLoading) return <>{loading}</>;
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

export function Can({ permission, permissions, children, fallback = null, loading = null }: CanProps) {
  // Normalise: merge permission + permissions into a single list
  const all = [...(permissions ?? []), ...(permission ? [permission] : [])];

  if (all.length === 0) {
    console.warn('<Can> requires at least one of: permission or permissions prop');
    return <>{fallback}</>;
  }

  if (all.length === 1) {
    return (
      <CanSingle permission={all[0]} fallback={fallback} loading={loading}>
        {children}
      </CanSingle>
    );
  }

  // OR logic: render children if ANY permission is allowed
  // We render CanSingle for the first permission; if denied, try the next
  return (
    <CanOrChain permissions={all} fallback={fallback} loading={loading}>
      {children}
    </CanOrChain>
  );
}

function CanOrChain({
  permissions,
  children,
  fallback,
  loading,
}: {
  permissions: string[];
  children: ReactNode;
  fallback: ReactNode;
  loading: ReactNode;
}) {
  // Each hook call must be at the top level — we call all hooks unconditionally
  const results = permissions.map((p) => usePermission(p)); // eslint-disable-line react-hooks/rules-of-hooks

  if (results.some((r) => r.isLoading)) return <>{loading}</>;
  if (results.some((r) => r.allowed)) return <>{children}</>;
  return <>{fallback}</>;
}
