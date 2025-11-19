'use client';

import { usePermission } from '@/lib/rbac/hooks/usePermission';

export function Can({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const allowed = usePermission(permission);

  if (!allowed) return null;

  return <>{children}</>;
}
